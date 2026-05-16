"""Integration tests for compliance scan dedup.

A re-scan must NOT create a duplicate row when the LLM rephrases the
``requirement`` body or the ``regulation_article`` prefix between runs.
The natural key is (scope, card, regulation, normalised article) — the
requirement body is treated as scanner content, not identity.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy import func, select

from app.models.compliance_regulation import ComplianceRegulation
from app.models.turbolens import (
    TurboLensAnalysisRun,
    TurboLensComplianceFinding,
)
from app.services import compliance_scanner
from tests.conftest import create_card


async def _make_run(db) -> uuid.UUID:
    run = TurboLensAnalysisRun(
        id=uuid.uuid4(),
        analysis_type="security_compliance",
        status="running",
        started_at=datetime.now(timezone.utc),
        created_by=None,
    )
    db.add(run)
    await db.flush()
    return run.id


async def _seed_regulation(db, key: str = "eu_ai_act") -> ComplianceRegulation:
    reg = ComplianceRegulation(
        id=uuid.uuid4(),
        key=key,
        label="Test Reg",
        description="Test regulation",
        is_enabled=True,
        built_in=False,
        sort_order=0,
        translations={},
    )
    db.add(reg)
    await db.flush()
    return reg


@pytest.fixture
def patch_compliance_pipeline(monkeypatch):
    """Replace AI + regulation loaders so the test controls every emission."""
    state: dict = {"emissions": [], "regulations": []}

    async def fake_load_enabled_regulations(db, *, keys=None):
        return list(state["regulations"])

    async def fake_assess_regulation(db, reg, cards, ai_scope):
        return list(state["emissions"])

    async def fake_detect_ai(db, cards, *, progress_cb=None):
        return {}

    async def _noop_cb(*args, **kwargs):
        return None

    monkeypatch.setattr(
        compliance_scanner, "load_enabled_regulations", fake_load_enabled_regulations
    )
    monkeypatch.setattr(compliance_scanner, "assess_regulation", fake_assess_regulation)
    monkeypatch.setattr(compliance_scanner, "detect_ai_bearing_cards", fake_detect_ai)
    monkeypatch.setattr(compliance_scanner, "_progress_cb", lambda db, run_id: _noop_cb)
    return state


def _emission(card_id, *, regulation="eu_ai_act", article="Art. 6", requirement="reqA"):
    return {
        "regulation": regulation,
        "regulation_article": article,
        "card_id": str(card_id),
        "scope_type": "card",
        "category": "ai_governance",
        "requirement": requirement,
        "status": "non_compliant",
        "severity": "high",
        "gap_description": "no registry",
        "evidence": None,
        "remediation": "create one",
        "ai_detected": True,
    }


async def _count_findings(db) -> int:
    result = await db.execute(select(func.count(TurboLensComplianceFinding.id)))
    return int(result.scalar() or 0)


async def test_rescan_with_rephrased_requirement_does_not_duplicate(db, patch_compliance_pipeline):
    card = await create_card(db)
    reg = await _seed_regulation(db)
    patch_compliance_pipeline["regulations"] = [reg]

    # Run 1 emits one finding with phrasing A.
    patch_compliance_pipeline["emissions"] = [
        _emission(card.id, requirement="Maintain a registry of high-risk systems."),
    ]
    run1 = await _make_run(db)
    await compliance_scanner.run_compliance_scan(db, run1, user_id=None)
    assert await _count_findings(db) == 1

    # Run 2 emits the same finding with completely different phrasing.
    patch_compliance_pipeline["emissions"] = [
        _emission(card.id, requirement="High-risk AI systems must comply with Annex III."),
    ]
    run2 = await _make_run(db)
    await compliance_scanner.run_compliance_scan(db, run2, user_id=None)
    assert await _count_findings(db) == 1, "rephrased requirement must NOT create a duplicate"


async def test_rescan_with_different_article_prefix_does_not_duplicate(
    db, patch_compliance_pipeline
):
    card = await create_card(db)
    reg = await _seed_regulation(db)
    patch_compliance_pipeline["regulations"] = [reg]

    # Run 1: "Art. 6"
    patch_compliance_pipeline["emissions"] = [_emission(card.id, article="Art. 6")]
    run1 = await _make_run(db)
    await compliance_scanner.run_compliance_scan(db, run1, user_id=None)
    assert await _count_findings(db) == 1

    # Run 2: "Article 6" — same article, different phrasing.
    patch_compliance_pipeline["emissions"] = [_emission(card.id, article="Article 6")]
    run2 = await _make_run(db)
    await compliance_scanner.run_compliance_scan(db, run2, user_id=None)
    assert await _count_findings(db) == 1

    # Run 3: " article  6 " — leading whitespace, internal whitespace.
    patch_compliance_pipeline["emissions"] = [_emission(card.id, article=" article  6 ")]
    run3 = await _make_run(db)
    await compliance_scanner.run_compliance_scan(db, run3, user_id=None)
    assert await _count_findings(db) == 1

    # Run 4: "§6" — flush prefix.
    patch_compliance_pipeline["emissions"] = [_emission(card.id, article="§6")]
    run4 = await _make_run(db)
    await compliance_scanner.run_compliance_scan(db, run4, user_id=None)
    assert await _count_findings(db) == 1


async def test_rescan_with_genuinely_different_article_inserts_new_row(
    db, patch_compliance_pipeline
):
    card = await create_card(db)
    reg = await _seed_regulation(db)
    patch_compliance_pipeline["regulations"] = [reg]

    patch_compliance_pipeline["emissions"] = [_emission(card.id, article="Art. 6")]
    await compliance_scanner.run_compliance_scan(db, await _make_run(db), user_id=None)
    assert await _count_findings(db) == 1

    # Different article number → genuinely a new finding.
    patch_compliance_pipeline["emissions"] = [_emission(card.id, article="Art. 7")]
    await compliance_scanner.run_compliance_scan(db, await _make_run(db), user_id=None)
    assert await _count_findings(db) == 2
