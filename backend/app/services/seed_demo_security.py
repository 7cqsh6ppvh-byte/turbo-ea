"""NexaTech Industries demo — TurboLens Security & Compliance findings.

Hand-curated CVE and compliance gap examples so that a fresh
``SEED_DEMO=true`` boot lands users on a populated **GRC → Compliance** tab
(and the Card Detail Compliance tab) without needing an AI provider configured.

Idempotent: skips if any ``TurboLensCveFinding`` or
``TurboLensComplianceFinding`` row already exists.

Can be triggered:
  1. Automatically via ``SEED_DEMO=true`` (full demo experience)
  2. Incrementally via ``SEED_SECURITY=true`` on an existing instance that
     already has the base NexaTech cards from ``seed_demo``.

The findings have **fictitious** CVE IDs in the ``CVE-2025-9XXXX`` block so
they cannot collide with real-world advisories. Re-running an actual scan
later upserts cleanly by the natural keys (``(card_id, cve_id)`` for CVEs;
``finding_key`` for compliance) — seeded user-state will survive.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card import Card
from app.models.turbolens import (
    TurboLensAnalysisRun,
    TurboLensComplianceFinding,
    TurboLensCveFinding,
)
from app.services.turbolens_security import compute_finding_key

# ===================================================================
# CVE FINDINGS — 8 entries across severity tiers and lifecycle states.
# CVE IDs are deliberately fictitious (CVE-2025-9XXXX block).
# ===================================================================
CVE_FINDINGS: list[dict] = [
    {
        "card_name": "PostgreSQL 16",
        "card_type": "ITComponent",
        "cve_id": "CVE-2025-91001",
        "vendor": "PostgreSQL",
        "product": "PostgreSQL",
        "version": "16.3",
        "cvss_score": 9.8,
        "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        "severity": "critical",
        "attack_vector": "network",
        "patch_available": True,
        "published_date": date(2025, 4, 12),
        "description": (
            "Heap buffer overflow in the legacy COPY parser allows a remote "
            "authenticated attacker to execute arbitrary code with database "
            "process privileges."
        ),
        "priority": "critical",
        "probability": "high",
        "business_impact": (
            "PostgreSQL backs SAP S/4HANA RISE and core analytics. An exploit "
            "would compromise order, customer and financial data."
        ),
        "remediation": "Upgrade to PostgreSQL 16.4 or later; restart the cluster during the next maintenance window.",
        "status": "open",
    },
    {
        "card_name": "Nginx",
        "card_type": "ITComponent",
        "cve_id": "CVE-2025-91002",
        "vendor": "F5",
        "product": "NGINX",
        "version": "1.24.0",
        "cvss_score": 8.1,
        "cvss_vector": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H",
        "severity": "high",
        "attack_vector": "network",
        "patch_available": True,
        "published_date": date(2025, 3, 28),
        "description": (
            "HTTP/2 header processing flaw triggers a use-after-free on "
            "specially-crafted request streams."
        ),
        "priority": "high",
        "probability": "medium",
        "business_impact": ("Nginx fronts every external-facing service in NexaTech's edge tier."),
        "remediation": "Upgrade to nginx 1.26.2 and disable HTTP/2 until the rollout completes.",
        "status": "acknowledged",
    },
    {
        "card_name": "Node.js 20 LTS",
        "card_type": "ITComponent",
        "cve_id": "CVE-2025-91003",
        "vendor": "Node.js",
        "product": "Node.js",
        "version": "20.11.0",
        "cvss_score": 7.5,
        "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
        "severity": "high",
        "attack_vector": "network",
        "patch_available": True,
        "published_date": date(2025, 5, 1),
        "description": (
            "Prototype-pollution gadget in the deprecated `util._extend` helper "
            "exposes sensitive request context to crafted JSON payloads."
        ),
        "priority": "high",
        "probability": "medium",
        "business_impact": (
            "Used across NexaPortal microservices; a successful exploit leaks "
            "session tokens of authenticated users."
        ),
        "remediation": "Upgrade to Node.js 20.13.1 LTS and re-deploy affected microservices.",
        "status": "in_progress",
    },
    {
        "card_name": "Redis 7",
        "card_type": "ITComponent",
        "cve_id": "CVE-2025-91004",
        "vendor": "Redis",
        "product": "Redis",
        "version": "7.2.4",
        "cvss_score": 6.5,
        "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N",
        "severity": "medium",
        "attack_vector": "network",
        "patch_available": True,
        "published_date": date(2025, 2, 15),
        "description": (
            "Out-of-bounds read in the GETRANGE command leaks adjacent memory "
            "contents to an authenticated client."
        ),
        "priority": "medium",
        "probability": "low",
        "business_impact": (
            "Cache-only deployment; sensitive data exposure is limited to "
            "short-lived session blobs."
        ),
        "remediation": "Patched in 7.2.5; rolled out across all cache nodes 2025-03-08.",
        "status": "mitigated",
    },
    {
        "card_name": "Python 3.12",
        "card_type": "ITComponent",
        "cve_id": "CVE-2025-91005",
        "vendor": "Python Software Foundation",
        "product": "CPython",
        "version": "3.12.2",
        "cvss_score": 5.9,
        "cvss_vector": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:H/A:N",
        "severity": "medium",
        "attack_vector": "network",
        "patch_available": True,
        "published_date": date(2025, 4, 22),
        "description": (
            "Improper validation in `urllib.parse` allows host-header smuggling "
            "when behind reverse proxies that don't strip whitespace."
        ),
        "priority": "medium",
        "probability": "medium",
        "business_impact": ("Python backs the data-pipeline tier and the AI inference workers."),
        "remediation": "Pin to Python 3.12.4 in the shared base image and rebuild downstream containers.",
        "status": "open",
    },
    {
        "card_name": "Fortinet FortiGate 600F",
        "card_type": "ITComponent",
        "cve_id": "CVE-2025-91006",
        "vendor": "Fortinet",
        "product": "FortiOS",
        "version": "7.4.3",
        "cvss_score": 9.3,
        "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:L",
        "severity": "critical",
        "attack_vector": "network",
        "patch_available": False,
        "published_date": date(2025, 5, 10),
        "description": (
            "SSL-VPN portal accepts a malformed authentication header that bypasses MFA validation."
        ),
        "priority": "critical",
        "probability": "high",
        "business_impact": (
            "Perimeter firewall protects the OT/factory-floor segment. A "
            "compromise reaches the SCADA estate."
        ),
        "remediation": (
            "Vendor patch pending. Compensating control in place: SSL-VPN "
            "portal disabled, replaced by IPsec until the fix ships."
        ),
        "status": "accepted",
    },
    {
        "card_name": "Cisco Catalyst 9300",
        "card_type": "ITComponent",
        "cve_id": "CVE-2025-91007",
        "vendor": "Cisco",
        "product": "Catalyst 9300 IOS XE",
        "version": "17.12.1",
        "cvss_score": 7.8,
        "cvss_vector": "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
        "severity": "high",
        "attack_vector": "local",
        "patch_available": True,
        "published_date": date(2025, 3, 5),
        "description": (
            "Privilege escalation in the CLI history component allows a "
            "level-1 operator to load a crafted boot image."
        ),
        "priority": "high",
        "probability": "low",
        "business_impact": (
            "Core switching fabric in the manufacturing campus. Compromise "
            "would allow VLAN hopping into the OT segment."
        ),
        "remediation": "Upgrade IOS XE to 17.12.3; reload during the next change window.",
        "status": "open",
    },
    {
        "card_name": "Azure Kubernetes Service",
        "card_type": "ITComponent",
        "cve_id": "CVE-2025-91008",
        "vendor": "Microsoft",
        "product": "Azure Kubernetes Service",
        "version": "1.29.2",
        "cvss_score": 3.7,
        "cvss_vector": "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N",
        "severity": "low",
        "attack_vector": "network",
        "patch_available": True,
        "published_date": date(2025, 4, 1),
        "description": (
            "Information disclosure: cluster metadata endpoint returns "
            "outbound IP under specific load-balancer configurations."
        ),
        "priority": "low",
        "probability": "very_low",
        "business_impact": (
            "Hosts production microservice workloads. Disclosure is limited "
            "to non-sensitive infrastructure metadata."
        ),
        "remediation": "Auto-patched in node-image 202504-x; no action required.",
        "status": "open",
    },
]


# ===================================================================
# COMPLIANCE FINDINGS — 12 entries across all six built-in regulations,
# mix of card-scoped and landscape, every lifecycle state represented.
# ===================================================================
COMPLIANCE_FINDINGS: list[dict] = [
    # ── EU AI Act (2) ──────────────────────────────────────────────
    {
        "card_name": "Quality Inspection System",
        "regulation": "eu_ai_act",
        "regulation_article": "Art. 6",
        "category": "high_risk_classification",
        "severity": "high",
        "status": "non_compliant",
        "decision": "new",
        "ai_detected": True,
        "requirement": (
            "Article 6 requires high-risk AI systems used as safety components "
            "to undergo a conformity assessment before being placed on the "
            "market or put into service."
        ),
        "gap_description": (
            "The vision-based Quality Inspection System acts as a safety "
            "component in the manufacturing line but has no documented "
            "conformity assessment, risk-management file or post-market "
            "monitoring plan on file."
        ),
        "evidence": (
            "Architecture registry shows no `aiAct.conformityAssessment` "
            "attribute on the card and no linked Compliance ADR."
        ),
        "remediation": (
            "Commission a conformity assessment with a Notified Body, attach "
            "the resulting certificate to the card, and create a quarterly "
            "post-market monitoring review."
        ),
    },
    {
        "card_name": None,
        "regulation": "eu_ai_act",
        "regulation_article": "Art. 13",
        "category": "transparency",
        "severity": "medium",
        "status": "partial",
        "decision": "in_review",
        "requirement": (
            "Article 13 obliges providers of high-risk AI systems to ensure "
            "their operation is sufficiently transparent to enable users to "
            "interpret and use the system's output appropriately."
        ),
        "gap_description": (
            "Two AI-bearing customer-facing systems lack documented model "
            "cards and user-facing transparency notices in the UI."
        ),
        "evidence": "Audit of AI-tagged Application cards on 2025-05-02.",
        "remediation": (
            "Publish a model card per AI-bearing application linking purpose, "
            "training data summary and limitations. Update product UX to "
            "expose an inline AI notice."
        ),
    },
    # ── GDPR (3) ───────────────────────────────────────────────────
    {
        "card_name": "Salesforce Sales Cloud",
        "regulation": "gdpr",
        "regulation_article": "Art. 30",
        "category": "records_of_processing",
        "severity": "high",
        "status": "non_compliant",
        "decision": "new",
        "requirement": (
            "Article 30 requires controllers to maintain records of processing "
            "activities under their responsibility, including categories of "
            "data, recipients, transfers and retention."
        ),
        "gap_description": (
            "Salesforce Sales Cloud processes EU prospect and customer data "
            "but the ROPA entry covers only contact data — sales opportunity "
            "history, communications and meeting notes are missing."
        ),
        "evidence": "Internal ROPA audit Q1 2025; finding GDPR-ROPA-014.",
        "remediation": (
            "Extend the ROPA entry to cover opportunity records, calendar "
            "metadata and Einstein-generated content; review with the DPO."
        ),
    },
    {
        "card_name": "SAP S/4HANA",
        "regulation": "gdpr",
        "regulation_article": "Art. 32",
        "category": "security_of_processing",
        "severity": "medium",
        "status": "compliant",
        "decision": "mitigated",
        "requirement": (
            "Article 32 obliges controllers to implement appropriate technical "
            "and organisational measures to ensure a level of security "
            "appropriate to the risk."
        ),
        "gap_description": (
            "Historic gap: HR-PII columns in SAP S/4HANA were not pseudonymised "
            "at rest. Remediated via TDE rollout in 2024."
        ),
        "evidence": (
            "Pen-test report 2025-Q1 confirmed PII tables are encrypted; "
            "audit logs flow into the SIEM."
        ),
        "remediation": "Mitigation in place — TDE active on HANA, audit logs centralised.",
    },
    {
        "card_name": None,
        "regulation": "gdpr",
        "regulation_article": "Art. 35",
        "category": "dpia",
        "severity": "low",
        "status": "not_applicable",
        "decision": "accepted",
        "requirement": (
            "Article 35 requires a DPIA where a type of processing is likely "
            "to result in a high risk to the rights and freedoms of natural "
            "persons."
        ),
        "gap_description": (
            "Marketing analytics pipeline processes only fully-aggregated, "
            "non-identifiable metrics. DPO concluded a full DPIA is not "
            "required; risk formally accepted."
        ),
        "evidence": "DPO memo 2025-04-18 attached to the Compliance ADR.",
        "remediation": "None — accepted with annual review.",
    },
    # ── NIS2 (2) ───────────────────────────────────────────────────
    {
        "card_name": "Fortinet FortiGate 600F",
        "regulation": "nis2",
        "regulation_article": "Art. 21",
        "category": "security_measures",
        "severity": "critical",
        "status": "non_compliant",
        "decision": "new",
        "requirement": (
            "Article 21 requires essential and important entities to implement "
            "appropriate and proportionate technical, operational and "
            "organisational measures to manage risks to network and "
            "information systems."
        ),
        "gap_description": (
            "Perimeter firewall is running an unpatched SSL-VPN vulnerability "
            "(CVE-2025-91006); the documented incident response plan does not "
            "cover MFA bypass scenarios."
        ),
        "evidence": ("Linked to CVE-2025-91006; SOC playbook last reviewed 2024-Q3."),
        "remediation": (
            "Disable SSL-VPN portal until vendor patch lands; refresh IR "
            "playbook with an MFA-bypass scenario and run a tabletop exercise."
        ),
    },
    {
        "card_name": None,
        "regulation": "nis2",
        "regulation_article": "Art. 23",
        "category": "incident_reporting",
        "severity": "low",
        "status": "not_applicable",
        "decision": "not_applicable",
        "requirement": (
            "Article 23 sets out incident reporting obligations for essential "
            "and important entities."
        ),
        "gap_description": (
            "NexaTech's legal team determined the subsidiary in question is "
            "below the size and turnover thresholds and therefore not in "
            "scope for NIS2 incident reporting."
        ),
        "evidence": "Legal memo 2025-03-10; scoping table attached.",
        "remediation": "None — out of scope. Re-evaluate annually.",
    },
    # ── DORA (2) ───────────────────────────────────────────────────
    {
        "card_name": "Azure SQL Database",
        "regulation": "dora",
        "regulation_article": "Art. 6",
        "category": "ict_risk_management",
        "severity": "high",
        "status": "partial",
        "decision": "new",
        "requirement": (
            "Article 6 requires financial entities to have a sound, "
            "comprehensive and well-documented ICT risk management framework."
        ),
        "gap_description": (
            "Azure SQL Database (used by the treasury reporting workload) "
            "lacks a documented Recovery Time Objective and the backup-"
            "restoration runbook is over twelve months old."
        ),
        "evidence": "Disaster recovery audit 2025-Q1; finding DORA-006-21.",
        "remediation": (
            "Document RTO/RPO targets, refresh the runbook and validate via a "
            "quarterly restore drill."
        ),
    },
    {
        "card_name": "Datadog",
        "regulation": "dora",
        "regulation_article": "Art. 28",
        "category": "third_party_risk",
        "severity": "medium",
        "status": "review_needed",
        "decision": "in_review",
        "requirement": (
            "Article 28 imposes specific contractual provisions and oversight "
            "requirements on critical third-party ICT service providers."
        ),
        "gap_description": (
            "Datadog provides observability for treasury-critical workloads "
            "but the contract pre-dates DORA and lacks the mandatory "
            "exit-strategy clause."
        ),
        "evidence": "Vendor contract review 2025-Q1.",
        "remediation": (
            "Procurement to negotiate a DORA-compliant addendum covering exit "
            "strategy, audit rights and incident notification SLAs."
        ),
    },
    # ── SOC 2 (2) ──────────────────────────────────────────────────
    {
        "card_name": "GitHub Enterprise",
        "regulation": "soc2",
        "regulation_article": "CC6.1",
        "category": "access_controls",
        "severity": "medium",
        "status": "partial",
        "decision": "new",
        "requirement": (
            "CC6.1: The entity implements logical access security software, "
            "infrastructure, and architectures over protected information "
            "assets to protect them from security events."
        ),
        "gap_description": (
            "GitHub Enterprise still permits personal access tokens (PATs) "
            "with broad org-level scopes. Recommended baseline is fine-"
            "grained PATs only."
        ),
        "evidence": "Internal audit findings 2025-04, item SOC2-CC6.1-03.",
        "remediation": (
            "Migrate all automation to fine-grained PATs; enable an org "
            "policy to block legacy PAT creation."
        ),
    },
    {
        "card_name": None,
        "regulation": "soc2",
        "regulation_article": "CC7.2",
        "category": "monitoring",
        "severity": "info",
        "status": "compliant",
        "decision": "verified",
        "requirement": (
            "CC7.2: The entity monitors system components and the operation "
            "of those components for anomalies that are indicative of "
            "malicious acts, natural disasters, or errors."
        ),
        "gap_description": (
            "Historical gap closed: SIEM coverage now spans every production "
            "workload, alert routing reviewed quarterly."
        ),
        "evidence": "Type II audit closing memo 2025-Q1; no exceptions.",
        "remediation": "None — fully resolved and verified by the auditor.",
    },
    # ── ISO/IEC 27001 (1) ─────────────────────────────────────────
    {
        "card_name": "PostgreSQL 16",
        "regulation": "iso27001",
        "regulation_article": "A.5.23",
        "category": "information_security_for_cloud_services",
        "severity": "high",
        "status": "non_compliant",
        "decision": "new",
        "requirement": (
            "Annex A.5.23 (ISO/IEC 27001:2022) requires processes for "
            "acquisition, use, management and exit from cloud services to be "
            "established in accordance with the organisation's information "
            "security requirements."
        ),
        "gap_description": (
            "PostgreSQL is deployed as a managed cloud database but the cloud-"
            "service exit-strategy register has no entry for it; encryption "
            "key custody is also undocumented."
        ),
        "evidence": "ISMS internal audit 2025-Q1, finding ISO-A5.23-007.",
        "remediation": (
            "Add an exit-strategy entry to the cloud-services register and "
            "document the customer-managed key rotation schedule."
        ),
    },
]


# ===================================================================
# Helpers
# ===================================================================
async def _has_any_findings(db: AsyncSession) -> bool:
    """True if any CVE or compliance finding already exists in the DB."""
    cve = await db.execute(select(TurboLensCveFinding.id).limit(1))
    if cve.scalar_one_or_none() is not None:
        return True
    comp = await db.execute(select(TurboLensComplianceFinding.id).limit(1))
    return comp.scalar_one_or_none() is not None


# ===================================================================
# Public entry point
# ===================================================================
async def seed_security_demo_data(db: AsyncSession) -> dict:
    """Insert demo CVE + Compliance findings against existing NexaTech cards.

    Skipped if any finding row already exists (idempotent).
    Cards referenced by name that aren't present in the DB are silently
    skipped so the seeder stays compatible with partial-demo installs.
    """
    if await _has_any_findings(db):
        return {"skipped": True, "reason": "TurboLens findings already exist"}

    # Look up Applications + IT Components by exact name.
    card_rows = await db.execute(
        select(Card.id, Card.name).where(Card.type.in_(["Application", "ITComponent"]))
    )
    name_to_id: dict[str, uuid.UUID] = {row.name: row.id for row in card_rows.all()}

    now = datetime.now(timezone.utc)

    # Two synthetic AnalysisRun rows — one per scan engine. ``results.demo``
    # makes them identifiable in the History tab and in tests.
    cve_run = TurboLensAnalysisRun(
        id=uuid.uuid4(),
        analysis_type="security_cve",
        status="completed",
        started_at=now,
        completed_at=now,
        results={"demo": True, "findings_count": len(CVE_FINDINGS)},
    )
    compliance_run = TurboLensAnalysisRun(
        id=uuid.uuid4(),
        analysis_type="security_compliance",
        status="completed",
        started_at=now,
        completed_at=now,
        results={"demo": True, "findings_count": len(COMPLIANCE_FINDINGS)},
    )
    db.add_all([cve_run, compliance_run])
    await db.flush()

    # ---- CVE findings ------------------------------------------------
    cve_count = 0
    for f in CVE_FINDINGS:
        card_id = name_to_id.get(f["card_name"])
        if not card_id:
            # NexaTech base seed didn't include this card on this install —
            # skip rather than fail.
            continue
        db.add(
            TurboLensCveFinding(
                id=uuid.uuid4(),
                run_id=cve_run.id,
                card_id=card_id,
                card_type=f["card_type"],
                cve_id=f["cve_id"],
                vendor=f["vendor"],
                product=f["product"],
                version=f.get("version"),
                cvss_score=f.get("cvss_score"),
                cvss_vector=f.get("cvss_vector"),
                severity=f.get("severity", "unknown"),
                attack_vector=f.get("attack_vector"),
                patch_available=f.get("patch_available", False),
                published_date=f.get("published_date"),
                description=f.get("description", ""),
                priority=f.get("priority", "medium"),
                probability=f.get("probability", "medium"),
                business_impact=f.get("business_impact"),
                remediation=f.get("remediation"),
                status=f.get("status", "open"),
            )
        )
        cve_count += 1
    await db.flush()

    # ---- Compliance findings ----------------------------------------
    compliance_count = 0
    for f in COMPLIANCE_FINDINGS:
        card_name = f.get("card_name")
        card_id = None
        if card_name:
            card_id = name_to_id.get(card_name)
            if not card_id:
                # Card missing from this install — skip this row.
                continue
        scope_type = "card" if card_id else "landscape"
        article = f.get("regulation_article")
        finding_key = compute_finding_key(scope_type, card_id, f["regulation"], article)
        db.add(
            TurboLensComplianceFinding(
                id=uuid.uuid4(),
                run_id=compliance_run.id,
                regulation=f["regulation"],
                regulation_article=article,
                card_id=card_id,
                scope_type=scope_type,
                category=f.get("category", ""),
                requirement=f.get("requirement", ""),
                status=f.get("status", "review_needed"),
                severity=f.get("severity", "info"),
                gap_description=f.get("gap_description", ""),
                evidence=f.get("evidence"),
                remediation=f.get("remediation"),
                ai_detected=f.get("ai_detected", False),
                finding_key=finding_key,
                decision=f.get("decision", "new"),
                last_seen_run_id=compliance_run.id,
                auto_resolved=False,
            )
        )
        compliance_count += 1
    await db.flush()

    await db.commit()
    return {
        "cve_findings": cve_count,
        "compliance_findings": compliance_count,
        "analysis_runs": 2,
    }
