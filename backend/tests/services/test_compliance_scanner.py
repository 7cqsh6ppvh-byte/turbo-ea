"""Unit tests for TurboLens Compliance scan pure helpers.

Covers landscape summary, compliance score weighting, and output dict shaping.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace

import pytest

from app.services import compliance_scanner
from app.services.compliance_scanner import (
    ScanCard,
    _landscape_summary,
    _normalise_article,
    compliance_score,
    compliance_to_dict,
    compute_finding_key,
    detect_ai_bearing_cards,
)

# ---------------------------------------------------------------------------
# Landscape summary
# ---------------------------------------------------------------------------


def _scan_card(**overrides):
    base = {
        "id": str(uuid.uuid4()),
        "name": "Card",
        "type": "Application",
        "subtype": None,
        "description": "",
        "vendor": "",
        "product": "",
        "version": None,
        "business_criticality": None,
        "lifecycle_phase": None,
        "attributes": {},
    }
    base.update(overrides)
    return ScanCard(**base)


def test_landscape_summary_counts_types_subtypes_vendors_and_criticals():
    cards = [
        _scan_card(type="Application", subtype="AI Agent", vendor="Vendor-A"),
        _scan_card(type="Application", subtype="Business Application", vendor="Vendor-A"),
        _scan_card(
            type="ITComponent",
            subtype="SaaS",
            vendor="Vendor-B",
            business_criticality="missionCritical",
            name="Core ERP",
        ),
    ]
    summary = _landscape_summary(cards)
    assert summary["counts_by_type"] == {"Application": 2, "ITComponent": 1}
    assert summary["counts_by_subtype"]["AI Agent"] == 1
    assert summary["top_vendors"][0] == ("Vendor-A", 2)
    assert "Core ERP" in summary["high_criticality_cards"]
    assert summary["total"] == 3


# ---------------------------------------------------------------------------
# Compliance score weighting
# ---------------------------------------------------------------------------


def test_compliance_score_is_perfect_for_empty_landscape():
    assert compliance_score([]) == 100


def test_compliance_score_weights_statuses():
    rows = [
        SimpleNamespace(status="compliant"),
        SimpleNamespace(status="compliant"),
        SimpleNamespace(status="partial"),
        SimpleNamespace(status="non_compliant"),
        SimpleNamespace(status="review_needed"),
    ]
    # (1 + 1 + 0.5 + 0 + 0.3) / 5 = 0.56 → 56
    assert compliance_score(rows) == 56


# ---------------------------------------------------------------------------
# Finding key helpers
# ---------------------------------------------------------------------------


def test_service_exposes_compliance_scan_entry_point():
    from app.services import compliance_scanner as svc

    assert hasattr(svc, "run_compliance_scan")
    # The legacy combined entry point and the CVE scan must be gone.
    assert not hasattr(svc, "run_security_scan")
    assert not hasattr(svc, "run_cve_scan")


def test_compute_finding_key_is_stable_across_calls():
    card_id = uuid.uuid4()
    a = compute_finding_key("card", card_id, "eu_ai_act", "Art. 6", "Maintain a registry")
    b = compute_finding_key("card", card_id, "eu_ai_act", "Art. 6", "Maintain a registry")
    assert a == b


def test_compute_finding_key_changes_with_any_identity_field():
    card_id = uuid.uuid4()
    base = compute_finding_key("card", card_id, "eu_ai_act", "Art. 6")
    assert base != compute_finding_key("landscape", card_id, "eu_ai_act", "Art. 6")
    assert base != compute_finding_key("card", uuid.uuid4(), "eu_ai_act", "Art. 6")
    assert base != compute_finding_key("card", card_id, "gdpr", "Art. 6")
    assert base != compute_finding_key("card", card_id, "eu_ai_act", "Art. 7")


def test_compute_finding_key_ignores_requirement_text():
    # The LLM rephrases the requirement body on every run. Two findings on
    # the same article with different requirement text must hash to the
    # same key so the re-scan upserts onto the existing row.
    card_id = uuid.uuid4()
    a = compute_finding_key("card", card_id, "gdpr", "Art. 5", "first phrasing")
    b = compute_finding_key("card", card_id, "gdpr", "Art. 5", "completely different phrasing")
    c = compute_finding_key("card", card_id, "gdpr", "Art. 5")  # no requirement at all
    assert a == b == c


def test_compute_finding_key_collapses_article_phrasings():
    # The LLM emits "Art. 6", "Article 6", "art 6", "§ 6", " Article  6 " etc.
    # All forms must hash to the same key.
    card_id = uuid.uuid4()
    keys = {
        compute_finding_key("card", card_id, "eu_ai_act", form)
        for form in [
            "Art. 6",
            "Article 6",
            "article 6",
            "art 6",
            "§ 6",
            "§6",
            " Article  6 ",
            "Art 6.",
            "ARTICLE 6",
        ]
    }
    assert len(keys) == 1


def test_normalise_article_strips_prefixes_and_lowercases():
    assert _normalise_article("Article 6") == "6"
    assert _normalise_article("Art. 6") == "6"
    assert _normalise_article("art 6") == "6"
    assert _normalise_article("§ 6") == "6"
    assert _normalise_article("§6") == "6"  # no space; falls through whitespace collapse
    assert _normalise_article("Section 7.2") == "7.2"
    assert _normalise_article("Annex III") == "iii"
    assert _normalise_article("  Article 6  ") == "6"
    assert _normalise_article("Article 6.") == "6"
    assert _normalise_article(None) == ""
    assert _normalise_article("") == ""
    # Composite identifier with sub-paragraph stays intact.
    assert _normalise_article("Article 6(2)(a)") == "6(2)(a)"


# ---------------------------------------------------------------------------
# AI scope detection — user-confirmed hasAiFeatures must stick across re-scans
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_detect_ai_includes_user_confirmed_cards_when_subtype_is_not_ai(monkeypatch):
    """Cards with attributes.hasAiFeatures=True must enter scope even if
    their subtype is not in AI_SUBTYPES and AI is not configured (so the
    LLM pass is skipped). Mirrors the verdict-endpoint guarantee that
    user confirmations are sticky across re-scans."""

    async def _fake_get_ai_config(db):
        return {}

    monkeypatch.setattr(compliance_scanner, "get_ai_config", _fake_get_ai_config)
    monkeypatch.setattr(compliance_scanner, "is_ai_configured", lambda cfg: False)

    confirmed = _scan_card(
        type="Application",
        subtype="Business Application",  # NOT an AI subtype
        attributes={"hasAiFeatures": True},
    )
    plain = _scan_card(type="Application", subtype="Business Application")
    explicit_ai = _scan_card(type="Application", subtype="AI Agent")

    scope = await detect_ai_bearing_cards(db=None, cards=[confirmed, plain, explicit_ai])

    assert confirmed.id in scope
    assert plain.id not in scope
    assert explicit_ai.id in scope
    # Confirmed-via-attribute cards are tagged as embedded (not subtype_match).
    assert scope[confirmed.id]["subtype_match"] is False
    assert scope[explicit_ai.id]["subtype_match"] is True


@pytest.mark.asyncio
async def test_detect_ai_excludes_user_flagged_not_ai_cards(monkeypatch):
    """Cards with attributes.hasAiFeatures=False must NOT be in scope, even
    if their subtype matches AI_SUBTYPES. The user's explicit "no" overrides
    both the subtype detection and the LLM pass — otherwise the verdict UI
    has no effect and we'd just re-flag the card on every scan."""

    async def _fake_get_ai_config(db):
        return {}

    monkeypatch.setattr(compliance_scanner, "get_ai_config", _fake_get_ai_config)
    monkeypatch.setattr(compliance_scanner, "is_ai_configured", lambda cfg: False)

    rejected_subtype_ai = _scan_card(
        type="Application",
        subtype="AI Agent",  # would normally be in scope by subtype
        attributes={"hasAiFeatures": False},
    )
    confirmed_non_subtype = _scan_card(
        type="Application",
        subtype="Business Application",
        attributes={"hasAiFeatures": True},
    )
    plain_subtype_ai = _scan_card(type="Application", subtype="AI Agent")

    scope = await detect_ai_bearing_cards(
        db=None,
        cards=[rejected_subtype_ai, confirmed_non_subtype, plain_subtype_ai],
    )

    # User's "no" wins, even over subtype.
    assert rejected_subtype_ai.id not in scope
    # User's "yes" wins, even without subtype.
    assert confirmed_non_subtype.id in scope
    # No verdict + AI subtype → in scope as before.
    assert plain_subtype_ai.id in scope


def test_compliance_to_dict_handles_landscape_scope():
    row = SimpleNamespace(
        id=uuid.uuid4(),
        run_id=uuid.uuid4(),
        regulation="eu_ai_act",
        regulation_article="Art. 6",
        card_id=None,
        scope_type="landscape",
        category="ai_governance",
        requirement="Maintain a registry of high-risk AI systems.",
        status="non_compliant",
        severity="high",
        gap_description="No registry exists.",
        evidence=None,
        remediation="Create a registry.",
        ai_detected=False,
        risk_id=None,
        decision="open",
        reviewed_by=None,
        reviewed_at=None,
        review_note=None,
        auto_resolved=False,
        last_seen_run_id=None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    d = compliance_to_dict(row, None)
    assert d["card_id"] is None
    assert d["scope_type"] == "landscape"
    assert d["regulation"] == "eu_ai_act"
    assert d["requirement"].startswith("Maintain")
    assert d["decision"] == "open"
    assert d["auto_resolved"] is False
