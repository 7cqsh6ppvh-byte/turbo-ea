"""Turbo EA MCP Server — provides AI tool access to EA data.

Run: python -m turbo_ea_mcp.server --host 0.0.0.0 --port 8001
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import textwrap
from urllib.parse import urlparse

from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from starlette.applications import Starlette
from starlette.routing import Route

from turbo_ea_mcp import oauth
from turbo_ea_mcp.api_client import TurboEAClient
from turbo_ea_mcp.config import (
    APP_VERSION,
    MCP_ALLOW_RELATION_DELETE,
    MCP_MAX_CARDS_PER_CALL,
    MCP_MAX_RELATIONS_PER_CALL,
    MCP_PORT,
    MCP_PUBLIC_URL,
    MCP_WRITES_ENABLED,
    TURBO_EA_PUBLIC_URL,
)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s"
)
logger = logging.getLogger("turbo_ea_mcp")

# ── MCP Server ──────────────────────────────────────────────────────────────


def _build_transport_security() -> TransportSecuritySettings:
    """Allow the configured public hostnames through DNS-rebinding protection.

    FastMCP defaults block any Host header it didn't expect, which makes the
    server return 421 when fronted by a reverse proxy on a real domain. Add
    the hostnames derived from MCP_PUBLIC_URL and TURBO_EA_PUBLIC_URL so the
    public deployment passes the check; localhost stays allowed for stdio
    tests and local development.
    """
    hosts: set[str] = {"localhost", "127.0.0.1"}
    origins: set[str] = set()
    for url in (MCP_PUBLIC_URL, TURBO_EA_PUBLIC_URL):
        parsed = urlparse(url)
        if parsed.hostname:
            hosts.add(parsed.hostname)
        if parsed.netloc:
            hosts.add(parsed.netloc)
        if parsed.scheme and parsed.netloc:
            origins.add(f"{parsed.scheme}://{parsed.netloc}")
    return TransportSecuritySettings(
        allowed_hosts=sorted(hosts),
        allowed_origins=sorted(origins),
    )


mcp = FastMCP(
    "Turbo EA",
    instructions=textwrap.dedent("""\
        Turbo EA is an Enterprise Architecture management platform.
        Use the read tools (search_cards, get_card, list_card_types, …) to
        query the IT landscape and the write tools (create_cards_bulk,
        upsert_relations_bulk, create_diagram, import_bpmn, resolve_card_refs)
        to turn artifacts the user has shared with you (spreadsheets, BPMN
        XML, DrawIO XML, documents) into cards, relations and diagrams.

        Write tools default to dry_run=True: they validate and return a
        preview without persisting. Surface the preview to the user, then
        call again with dry_run=False to commit. Always call list_card_types
        and get_relation_types first to make sure the data you propose fits
        the existing metamodel — the backend will reject unknown types and
        invalid source/target combinations.

        All data access respects the authenticated user's permissions.
    """),
    transport_security=_build_transport_security(),
)


# ── Helpers ─────────────────────────────────────────────────────────────────


def _fmt(data: dict | list) -> str:
    """Format API response as readable JSON."""
    return json.dumps(data, indent=2, default=str)


def _compact(params: dict) -> dict:
    """Drop ``None`` and empty-string values so they don't clutter the URL."""
    return {k: v for k, v in params.items() if v not in (None, "")}


# ── Tools ───────────────────────────────────────────────────────────────────


@mcp.tool()
async def search_cards(
    query: str = "",
    type: str = "",
    status: str = "",
    page: int = 1,
    page_size: int = 20,
) -> str:
    """Search and list cards (EA items) with optional filtering.

    Args:
        query: Free-text search across card name and description.
        type: Filter by card type key (e.g. 'Application', 'ITComponent').
        status: Filter by status ('ACTIVE', 'PHASING_IN', 'PHASING_OUT', 'END_OF_LIFE', 'ARCHIVED').
        page: Page number (default 1).
        page_size: Results per page (default 20, max 100).
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    params: dict = {"page": page, "page_size": min(page_size, 100)}
    if query:
        params["search"] = query
    if type:
        params["type"] = type
    if status:
        params["status"] = status
    data = await client.get("/cards", params=params)
    return _fmt(data)


@mcp.tool()
async def get_card(card_id: str) -> str:
    """Get detailed information about a specific card by its UUID.

    Args:
        card_id: The UUID of the card.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(f"/cards/{card_id}")
    return _fmt(data)


@mcp.tool()
async def get_card_relations(card_id: str) -> str:
    """Get all relations connected to a specific card.

    Args:
        card_id: The UUID of the card.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get("/relations", params={"card_id": card_id})
    return _fmt(data)


@mcp.tool()
async def get_card_hierarchy(card_id: str) -> str:
    """Get the hierarchy (ancestors + children) of a card.

    Args:
        card_id: The UUID of the card.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(f"/cards/{card_id}/hierarchy")
    return _fmt(data)


@mcp.tool()
async def list_card_types() -> str:
    """List all card types in the metamodel with their fields and configuration."""
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get("/metamodel/types")
    return _fmt(data)


@mcp.tool()
async def get_relation_types(type_key: str = "") -> str:
    """List relation types. Optionally filter by card type key.

    Args:
        type_key: Filter to relations involving this card type (optional).
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    params = {}
    if type_key:
        params["type_key"] = type_key
    data = await client.get("/metamodel/relation-types", params=params)
    return _fmt(data)


@mcp.tool()
async def get_dashboard() -> str:
    """Get the EA dashboard with KPIs: card counts by type, average data quality,
    approval status distribution, and recent activity."""
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get("/reports/dashboard")
    return _fmt(data)


@mcp.tool()
async def get_landscape(type_key: str, group_by: str) -> str:
    """Get cards of a type grouped by a related type (landscape view).

    Args:
        type_key: The card type to list (e.g. 'Application').
        group_by: The related type to group by (e.g. 'BusinessCapability').
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(
        "/reports/landscape",
        params={"type_key": type_key, "group_by": group_by},
    )
    return _fmt(data)


# ── GRC — Risks ─────────────────────────────────────────────────────────────


@mcp.tool()
async def list_risks(
    status: str = "",
    category: str = "",
    level: str = "",
    owner_id: str = "",
    card_id: str = "",
    source_type: str = "",
    search: str = "",
    overdue: bool = False,
    page: int = 1,
    page_size: int = 50,
) -> str:
    """Paginated, filterable EA Risk Register listing (TOGAF Phase G).

    Args:
        status: Lifecycle state — 'identified', 'analysed', 'mitigation_planned',
            'in_progress', 'mitigated', 'monitoring', 'accepted', 'closed'.
        category: 'security', 'compliance', 'operational', 'technology',
            'financial', 'reputational', 'strategic'.
        level: Residual (or initial when residual is empty) risk level —
            'low', 'medium', 'high', 'critical'.
        owner_id: Filter to risks owned by a specific user UUID.
        card_id: Filter to risks linked to a specific card UUID.
        source_type: How the risk was raised — 'manual',
            'compliance'.
        search: Free-text search across title, description and reference.
        overdue: When true, only return risks past their target resolution
            date that aren't already closed/accepted.
        page: Page number (default 1).
        page_size: Results per page (default 50, max 1000).
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(
        "/risks",
        params=_compact(
            {
                "status": status,
                "category": category,
                "level": level,
                "owner_id": owner_id,
                "card_id": card_id,
                "source_type": source_type,
                "search": search,
                "overdue": "true" if overdue else None,
                "page": page,
                "page_size": min(page_size, 1000),
            }
        ),
    )
    return _fmt(data)


@mcp.tool()
async def get_risk(risk_id: str) -> str:
    """Get full detail of a single risk including linked cards and audit data.

    Args:
        risk_id: The risk's UUID (or its reference number like 'R-000123' —
            the backend resolves both).
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(f"/risks/{risk_id}")
    return _fmt(data)


@mcp.tool()
async def get_risk_metrics() -> str:
    """KPIs for the Risk Register: counts by status / category / level plus
    the 4×4 initial and residual probability × impact matrices."""
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get("/risks/metrics")
    return _fmt(data)


@mcp.tool()
async def get_card_risks(card_id: str) -> str:
    """List every risk currently linked to a specific card (M:N).

    Args:
        card_id: The UUID of the card.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(f"/cards/{card_id}/risks")
    return _fmt(data)


# ── GRC — Compliance findings ──────────────────────────────────────────────


@mcp.tool()
async def list_compliance_findings(
    regulation: str = "",
    status: str = "",
    include_auto_resolved: bool = False,
) -> str:
    """Compliance findings bundled by regulation (EU AI Act, GDPR, NIS2,
    DORA, SOC 2, ISO 27001, …).

    Args:
        regulation: Filter to a single regulation key (e.g. 'gdpr', 'eu_ai_act').
        status: AI verdict — 'compliant', 'partial', 'non_compliant',
            'not_applicable', 'review_needed'.
        include_auto_resolved: Include findings a later re-scan no longer
            reports (hidden by default for noise reduction).
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(
        "/compliance/compliance",
        params=_compact(
            {
                "regulation": regulation,
                "status": status,
                "include_auto_resolved": "true" if include_auto_resolved else None,
            }
        ),
    )
    return _fmt(data)


@mcp.tool()
async def get_compliance_overview() -> str:
    """Compliance scores + per-regulation status matrix for the Compliance
    dashboard, plus metadata about the last completed scan."""
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get("/compliance/overview")
    return _fmt(data)


# ── Governance & Delivery ───────────────────────────────────────────────────


@mcp.tool()
async def list_principles() -> str:
    """List the EA principles published in the metamodel (statement,
    rationale, implications), ordered by sort order."""
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get("/metamodel/principles")
    return _fmt(data)


@mcp.tool()
async def list_adrs(
    initiative_id: str = "",
    card_id: str = "",
    status: str = "",
    search: str = "",
) -> str:
    """List Architecture Decision Records (ADRs).

    Args:
        initiative_id: Filter to ADRs linked to a specific Initiative UUID.
        card_id: Filter to ADRs linked to a specific card UUID.
        status: 'draft', 'in_review', or 'signed'.
        search: Free-text search across title, reference and section content.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(
        "/adr",
        params=_compact(
            {
                "initiative_id": initiative_id,
                "card_id": card_id,
                "status": status,
                "search": search,
            }
        ),
    )
    return _fmt(data)


@mcp.tool()
async def get_adr(adr_id: str) -> str:
    """Get full detail of a single ADR including all section content,
    linked cards, related decisions, and signature trail.

    Args:
        adr_id: The ADR's UUID.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(f"/adr/{adr_id}")
    return _fmt(data)


@mcp.tool()
async def list_soaws(initiative_id: str = "") -> str:
    """List Statements of Architecture Work (SoAW).

    Args:
        initiative_id: Filter to SoAWs linked to a specific Initiative UUID.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(
        "/soaw",
        params=_compact({"initiative_id": initiative_id}),
    )
    return _fmt(data)


# ── Reports ────────────────────────────────────────────────────────────────


@mcp.tool()
async def get_portfolio_report(
    type: str = "Application",
    x_axis: str = "functionalFit",
    y_axis: str = "technicalFit",
    size_field: str = "costTotalAnnual",
    color_field: str = "businessCriticality",
) -> str:
    """Portfolio bubble-chart data for a card type. Defaults plot the
    Application portfolio with functional fit × technical fit, sized by
    annual cost, coloured by business criticality.

    Args:
        type: Card type to report on (default 'Application').
        x_axis: Field key for the x-axis.
        y_axis: Field key for the y-axis.
        size_field: Field key driving bubble size.
        color_field: Field key driving bubble colour.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(
        "/reports/portfolio",
        params={
            "type": type,
            "x_axis": x_axis,
            "y_axis": y_axis,
            "size_field": size_field,
            "color_field": color_field,
        },
    )
    return _fmt(data)


@mcp.tool()
async def get_cost_treemap(
    type: str = "Application",
    cost_field: str = "costTotalAnnual",
    group_by: str = "",
) -> str:
    """Treemap of card cost grouped optionally by a related card type.

    Args:
        type: Card type to aggregate (default 'Application').
        cost_field: Cost field key on that type (default 'costTotalAnnual').
        group_by: Optional related card type key to group spend by
            (e.g. 'BusinessCapability', 'Organization').
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(
        "/reports/cost-treemap",
        params=_compact(
            {
                "type": type,
                "cost_field": cost_field,
                "group_by": group_by,
            }
        ),
    )
    return _fmt(data)


@mcp.tool()
async def get_capability_heatmap(metric: str = "app_count") -> str:
    """Hierarchical business-capability heatmap.

    Args:
        metric: What to colour by — 'app_count', 'cost', 'data_quality'.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(
        "/reports/capability-heatmap",
        params=_compact({"metric": metric}),
    )
    return _fmt(data)


@mcp.tool()
async def get_data_quality_report() -> str:
    """Per-card-type data quality / completeness breakdown — surfaces
    which inventory rows have missing required fields."""
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get("/reports/data-quality")
    return _fmt(data)


# ── Card context ───────────────────────────────────────────────────────────


@mcp.tool()
async def get_card_stakeholders(card_id: str) -> str:
    """List the stakeholders (users + roles) assigned to a card.

    Args:
        card_id: The UUID of the card.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(f"/cards/{card_id}/stakeholders")
    return _fmt(data)


@mcp.tool()
async def get_card_comments(card_id: str) -> str:
    """List the threaded comments on a card, newest first.

    Args:
        card_id: The UUID of the card.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(f"/cards/{card_id}/comments")
    return _fmt(data)


@mcp.tool()
async def get_card_documents(card_id: str) -> str:
    """List the document links attached to a card (URLs with categorisation,
    not file uploads).

    Args:
        card_id: The UUID of the card.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.get(f"/cards/{card_id}/documents")
    return _fmt(data)


# ── Write tools (artifact import) ───────────────────────────────────────────
#
# These tools turn artifacts the calling agent has parsed (Excel rows, BPMN
# XML, DrawIO XML, structured data extracted from documents) into cards,
# relations and diagrams. They default to dry_run=True so the agent can show
# the user a preview before persisting.


# Regex mirror of `_CARD_ID_RE` in backend/app/api/v1/diagrams.py — used to
# preview which existing cards a DrawIO XML payload would link.
_DRAWIO_CARD_ID_RE = re.compile(r'cardId="([0-9a-fA-F-]{36})"')

# Match a `<bpmn:documentation>...</bpmn:documentation>` child of the top
# `<bpmn:process>` element so `import_bpmn` can seed a sensible description
# on the BusinessProcess card when the agent doesn't supply one. Tolerant
# of arbitrary namespace prefixes (`bpmn:`, `bpmn2:`, none) and of
# inter-tag whitespace.
_BPMN_PROCESS_DOC_RE = re.compile(
    r"<(?:\w+:)?process\b[^>]*>\s*<(?:\w+:)?documentation\b[^>]*>(.*?)</(?:\w+:)?documentation>",
    re.DOTALL | re.IGNORECASE,
)


def _extract_bpmn_process_documentation(bpmn_xml: str) -> str | None:
    """Best-effort grab of `<bpmn:process>`'s `<documentation>` body.

    Pure regex so the MCP server stays free of XML parsers. Returns None
    if no documentation child sits at the top of the first process tag —
    the most common case in real-world BPMN.
    """
    match = _BPMN_PROCESS_DOC_RE.search(bpmn_xml)
    if not match:
        return None
    text = match.group(1).strip()
    return text or None


def _writes_disabled_message() -> str | None:
    """Return a user-facing error when MCP writes are disabled, else None.

    The kill switch (`MCP_WRITES_ENABLED=false`) lets an operator put the
    server into read-only mode without a code redeploy.
    """
    if MCP_WRITES_ENABLED:
        return None
    return _fmt(
        {
            "error": "writes_disabled",
            "message": (
                "MCP writes are disabled on this deployment "
                "(MCP_WRITES_ENABLED=false). Read tools remain available."
            ),
        }
    )


@mcp.tool()
async def create_cards_bulk(cards: list[dict], dry_run: bool = True) -> str:
    """Create many cards in one call from artifact-extracted rows.

    The calling agent is expected to read the source artifact (spreadsheet,
    document, image) itself, extract structured rows, and call this tool.
    Use list_card_types first to learn which `type` keys and `attributes`
    fit the metamodel — unknown types are rejected by the backend.

    Args:
        cards: List of row dicts. Each dict mirrors `CardBulkCreateItem`:
            - `row_index` (int, required): a stable index so the response
              can be paired back to the source row.
            - `type` (str, required): card type key (e.g. "Application",
              "BusinessCapability"). Must exist in the metamodel.
            - `name` (str, required): human-readable name.
            - `subtype` (str, optional): subtype key from the type's
              `subtypes` list.
            - `description` (str, optional).
            - `parent_id` (UUID string, optional): existing parent UUID.
            - `parent_name` + `parent_path` (str + list[str], optional):
              reference an existing or same-batch parent by name. The
              backend topologically sorts so a parent row earlier in the
              batch can be referenced by a child row later in the batch.
            - `attributes` (dict, optional): metamodel fields keyed by field
              key. Unknown keys are accepted (stored as JSONB) but won't
              show in the UI — match the type's `fields_schema`.
            - `lifecycle` (dict, optional): `{phase, start_date, end_date}`.
            - `external_id`, `alias`, `approval_status` (str, optional).
            Single-row imports work too — pass a 1-item list.
        dry_run: When True (default), validate every row and return the
            preview without persisting. The agent should show the result
            to the user and only call again with dry_run=False to commit.

    Returns: JSON with `results[]` (per-row status/id/error), `created`,
    `failed`, and `dry_run`.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    if (disabled := _writes_disabled_message()) is not None:
        return disabled
    if len(cards) > MCP_MAX_CARDS_PER_CALL:
        return _fmt(
            {
                "error": "batch_too_large",
                "message": (
                    f"This batch has {len(cards)} cards but the MCP per-call "
                    f"cap is {MCP_MAX_CARDS_PER_CALL}. Split the upload into "
                    "smaller batches so the user can review each dry-run."
                ),
                "cap": MCP_MAX_CARDS_PER_CALL,
                "received": len(cards),
            }
        )
    client = TurboEAClient(token)
    data = await client.post(
        "/cards/bulk-create",
        json={"cards": cards, "dry_run": dry_run},
    )
    return _fmt(data)


@mcp.tool()
async def resolve_card_refs(refs: list[dict]) -> str:
    """Pre-validate name-based card references before a bulk import.

    Useful when the artifact references existing cards by name (parent
    chains in spreadsheets, source/target columns in a relation sheet)
    and the agent wants to surface ambiguous or missing refs to the user
    before committing.

    Args:
        refs: List of reference dicts. Each dict mirrors `CardRefInput`:
            - `row` (int): source row.
            - `column` (str): source column label.
            - `type` (str): the expected card type for the lookup.
            - `ref` (str): the human-typed reference. A simple name
              ("NexaCore ERP") or a `/`-separated path
              ("Sales / Customer Mgmt / CRM").

    Returns: JSON with one result per ref — `resolved` (with `id`),
    `ambiguous` (with up to 3 `candidates`), or `missing`.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    client = TurboEAClient(token)
    data = await client.post("/cards/resolve-refs", json={"refs": refs})
    return _fmt(data)


@mcp.tool()
async def upsert_relations_bulk(
    operations: list[dict],
    dry_run: bool = True,
) -> str:
    """Create or delete many relations between cards in one call.

    Call get_relation_types first to see which relation type keys exist
    and which source/target card types each one connects — the backend
    rejects relations whose source or target types don't match the
    metamodel definition.

    Args:
        operations: List of operation dicts. Each dict mirrors
            `RelationBulkOperation`:
            - `row_index` (int): stable source row index.
            - `action` (str, optional): "upsert" (default) or "delete".
            - `type` (str): relation type key (e.g. "uses",
              "implementedBy"). Must exist in the metamodel.
            - `source` (dict): either `{"id": "<uuid>"}` or
              `{"type": "...", "name": "...", "parent_path": [...]}`.
            - `target` (dict): same shape as `source`.
            - `attributes` (dict, optional).
            - `description` (str, optional).
        dry_run: When True (default), validate every op and return the
            preview without persisting. Call again with dry_run=False to
            commit.

    Returns: JSON with `results[]`, `upserted`, `deleted`, `failed` and
    `dry_run`.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    if (disabled := _writes_disabled_message()) is not None:
        return disabled
    if len(operations) > MCP_MAX_RELATIONS_PER_CALL:
        return _fmt(
            {
                "error": "batch_too_large",
                "message": (
                    f"This batch has {len(operations)} relation operations "
                    f"but the MCP per-call cap is {MCP_MAX_RELATIONS_PER_CALL}. "
                    "Split into smaller batches."
                ),
                "cap": MCP_MAX_RELATIONS_PER_CALL,
                "received": len(operations),
            }
        )
    if not MCP_ALLOW_RELATION_DELETE:
        delete_rows = [
            op.get("row_index") for op in operations if op.get("action") == "delete"
        ]
        if delete_rows:
            return _fmt(
                {
                    "error": "delete_action_disabled",
                    "message": (
                        "Relation deletion via MCP is disabled. Remove "
                        "relations from the web UI for an explicit audit "
                        "trail, or set MCP_ALLOW_RELATION_DELETE=true on the "
                        "deployment if the operator wants to opt in."
                    ),
                    "rejected_rows": delete_rows,
                }
            )
    client = TurboEAClient(token)
    data = await client.post(
        "/relations/bulk",
        json={"operations": operations, "dry_run": dry_run},
    )
    return _fmt(data)


@mcp.tool()
async def create_diagram(
    name: str,
    drawio_xml: str,
    description: str = "",
    linked_card_ids: list[str] | None = None,
    dry_run: bool = True,
) -> str:
    """Create a free-form DrawIO diagram, optionally linked to cards.

    The agent is expected to provide complete DrawIO XML. Card references
    embedded as `cardId="<uuid>"` attributes on `<object>` elements are
    extracted by the backend and surface as visual links from the diagram
    to those cards; `linked_card_ids` separately drives the
    "what diagrams reference this card?" lookup. Pass both when both
    apply (typical: agent already added the cardId attributes inside the
    XML and lists the same UUIDs in linked_card_ids).

    Args:
        name: Diagram name.
        drawio_xml: DrawIO mxGraph XML.
        description: Optional description.
        linked_card_ids: Optional list of card UUIDs to link to this
            diagram (M:N).
        dry_run: When True (default), validate client-side (scan the XML
            for cardId refs, echo the inputs) without calling the backend.
            Call again with dry_run=False to actually create the diagram.

    Returns: JSON with either the dry-run preview (extracted_card_refs
    from the XML, linked_card_ids echoed back) or the created diagram.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    if (disabled := _writes_disabled_message()) is not None:
        return disabled
    linked_card_ids = list(linked_card_ids or [])
    extracted_refs = list(dict.fromkeys(_DRAWIO_CARD_ID_RE.findall(drawio_xml)))
    if dry_run:
        # Client-side preview only — no backend round-trip. The agent
        # surfaces this to the user; on confirmation, we'll commit.
        preview = {
            "dry_run": True,
            "would_create": {
                "name": name,
                "description": description,
                "type": "free_draw",
                "linked_card_ids": linked_card_ids,
                "extracted_card_refs_from_xml": extracted_refs,
            },
            "note": (
                "Card IDs are not verified in dry-run mode; the backend "
                "will reject unknown UUIDs on commit. Re-run with "
                "dry_run=False to create the diagram."
            ),
        }
        return _fmt(preview)
    client = TurboEAClient(token)
    payload: dict = {
        "name": name,
        "description": description or None,
        "type": "free_draw",
        "data": {"xml": drawio_xml},
        "card_ids": linked_card_ids,
    }
    data = await client.post("/diagrams", json=payload)
    return _fmt(data)


@mcp.tool()
async def import_bpmn(
    business_process_name: str,
    bpmn_xml: str,
    parent_card: str | None = None,
    description: str | None = None,
    attributes: dict | None = None,
    svg_thumbnail: str = "",
    dry_run: bool = True,
) -> str:
    """Save a BPMN 2.0 diagram against a BusinessProcess card.

    Finds the matching `BusinessProcess` card by name (resolving by the
    name search endpoint). If no card matches the name, this tool creates
    one in the same call (using `business_process_name` as the card name
    and `parent_card` as the optional parent reference). If multiple
    cards match, the tool refuses to write and lists the candidates —
    the agent should re-call with `parent_card` to disambiguate.

    The backend parses the BPMN XML, extracts tasks/events/gateways/lanes
    and stores them as ProcessElement rows linked to the BusinessProcess
    card. Element-to-card links (Application/DataObject/ITComponent) are
    a separate later step the user does in the BPM editor.

    Args:
        business_process_name: Card name to find or create.
        bpmn_xml: BPMN 2.0 XML.
        parent_card: Optional parent BusinessProcess card name to
            disambiguate against (or to use as parent when creating).
        description: Optional description for the BusinessProcess card.
            If omitted and the tool needs to create the card, it falls
            back to the BPMN's top-level `<bpmn:documentation>` if
            present, otherwise leaves the description blank. Ignored
            when the card already exists — pre-existing cards are never
            mutated by this tool.
        attributes: Optional metamodel attributes for the new card
            (e.g. `{"processType": "Core", "automationLevel": "high"}`).
            Same "ignored on existing card" semantics as `description`.
        svg_thumbnail: Optional SVG snapshot of the diagram.
        dry_run: When True (default), validate every step without
            persisting. When the BusinessProcess card doesn't exist yet,
            the dry-run previews the would-be card creation but skips the
            diagram save step (no card_id to attach against in a
            rolled-back transaction). **Call again with dry_run=False to
            actually create the card and persist the diagram** — without
            that second call, both will roll back.
    """
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated. Please reconnect."
    if (disabled := _writes_disabled_message()) is not None:
        return disabled
    client = TurboEAClient(token)

    # Step 1: find an existing BusinessProcess card by name.
    search = await client.get(
        "/cards",
        params={
            "type": "BusinessProcess",
            "search": business_process_name,
            "page_size": 25,
        },
    )
    candidates = search.get("items", []) if isinstance(search, dict) else []
    exact = [
        c for c in candidates if c.get("name", "").strip() == business_process_name.strip()
    ]
    if len(exact) > 1:
        # Multi-match: refuse to write. The agent must qualify.
        return _fmt(
            {
                "error": "ambiguous_business_process",
                "message": (
                    f"Multiple BusinessProcess cards match '{business_process_name}'. "
                    "Re-call with `parent_card` to disambiguate."
                ),
                "candidates": [
                    {"id": c.get("id"), "name": c.get("name"), "parent_id": c.get("parent_id")}
                    for c in exact
                ],
            }
        )

    create_card_result: dict | None = None
    process_id: str | None = exact[0].get("id") if exact else None
    # Surface a warning if the agent supplied description/attributes for a
    # card that already exists — we never mutate existing cards from this
    # tool, so the inputs would silently get dropped without this hint.
    ignored_inputs: list[str] = []
    if process_id is not None:
        if description is not None:
            ignored_inputs.append("description")
        if attributes:
            ignored_inputs.append("attributes")

    if process_id is None:
        # Step 2: create the BusinessProcess card. Default the description
        # to the BPMN's process-level documentation block so the card
        # doesn't land blank when the agent didn't supply one.
        effective_description = (
            description
            if description is not None
            else _extract_bpmn_process_documentation(bpmn_xml)
        )
        card_row: dict = {
            "row_index": 0,
            "type": "BusinessProcess",
            "name": business_process_name,
        }
        if parent_card:
            card_row["parent_name"] = parent_card
            card_row["parent_path"] = []
        if effective_description:
            card_row["description"] = effective_description
        if attributes:
            card_row["attributes"] = attributes
        bulk_payload = {
            "cards": [card_row],
            "dry_run": dry_run,
        }
        create_card_result = await client.post("/cards/bulk-create", json=bulk_payload)
        results = (
            create_card_result.get("results", [])
            if isinstance(create_card_result, dict)
            else []
        )
        if not results or results[0].get("status") != "created":
            return _fmt(
                {
                    "error": "business_process_create_failed",
                    "create_card_result": create_card_result,
                }
            )
        # In dry-run mode the card was rolled back — we have no real id to
        # use for step 3. Report the preview and ask the agent to commit.
        if dry_run:
            return _fmt(
                {
                    "dry_run": True,
                    "committed": False,
                    "would_create_business_process": True,
                    "business_process_name": business_process_name,
                    "parent_card": parent_card,
                    "create_card_result": create_card_result,
                    "next_action": (
                        "NOTHING HAS BEEN PERSISTED YET. Surface this "
                        "preview to the user; on their confirmation, "
                        "re-call import_bpmn with the same arguments plus "
                        "dry_run=False to actually create the card and "
                        "save the diagram in one call."
                    ),
                }
            )
        process_id = results[0].get("id")

    if not process_id:
        return _fmt({"error": "no_process_id", "create_card_result": create_card_result})

    # Step 3: save the BPMN diagram against the process card.
    diagram_payload = {
        "bpmn_xml": bpmn_xml,
        "svg_thumbnail": svg_thumbnail or None,
        "dry_run": dry_run,
    }
    diagram_result = await client.put(
        f"/bpm/processes/{process_id}/diagram",
        json=diagram_payload,
    )
    # `flow_nodes_extracted` counts tasks/gateways/events that land in the
    # ProcessElement table for EA cross-referencing. It is INTENTIONALLY
    # smaller than the total element count in the BPMN XML — sequence
    # flows (edges), lanes, BPMNDI shapes, and Collaboration / Participant
    # metadata are not extracted into rows, they live inside the saved
    # `bpmn_xml` and round-trip verbatim. Use the `bpmn_xml_bytes` field
    # on `diagram_result` to confirm the full XML was stored.
    response: dict = {
        "dry_run": dry_run,
        "committed": not dry_run,
        "business_process_id": process_id,
        "business_process_created": create_card_result is not None,
        "create_card_result": create_card_result,
        "diagram_result": diagram_result,
        "verify_urls": {
            # GET this to retrieve the saved XML byte-for-byte and confirm
            # the round-trip preserved Collaboration, Participants, lanes,
            # BPMNDI, etc.
            "raw_bpmn": f"/api/v1/bpm/processes/{process_id}/diagram",
            # Open this in the browser to view the BusinessProcess card's
            # Process Flow tab where bpmn-js renders the diagram.
            "card_detail": f"/cards/{process_id}",
        },
        "rendering_note": (
            "If the diagram does not render in the editor, the saved XML "
            "is the source of truth — fetch verify_urls.raw_bpmn and "
            "compare against the input. The backend stores BPMN XML "
            "verbatim and never parses or rewrites the BPMNDI plane."
        ),
    }
    if ignored_inputs:
        response["warning"] = (
            f"BusinessProcess card '{business_process_name}' already exists; "
            f"the following inputs were ignored (this tool never mutates "
            f"pre-existing cards): {', '.join(ignored_inputs)}. To change "
            "the existing card, edit it from the web UI."
        )
    if dry_run:
        response["next_action"] = (
            "NOTHING HAS BEEN PERSISTED YET. Surface this preview to the "
            "user; on their confirmation, re-call import_bpmn with "
            "dry_run=False to actually save the BPMN diagram against "
            f"BusinessProcess id {process_id}."
        )
    return _fmt(response)


# ── Resources ───────────────────────────────────────────────────────────────


@mcp.resource("turbo-ea://types")
async def resource_types() -> str:
    """All card types in the metamodel."""
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated."
    client = TurboEAClient(token)
    data = await client.get("/metamodel/types")
    return _fmt(data)


@mcp.resource("turbo-ea://relation-types")
async def resource_relation_types() -> str:
    """All relation types in the metamodel."""
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated."
    client = TurboEAClient(token)
    data = await client.get("/metamodel/relation-types")
    return _fmt(data)


@mcp.resource("turbo-ea://dashboard")
async def resource_dashboard() -> str:
    """Dashboard KPIs and summary statistics."""
    token = await _get_current_token()
    if not token:
        return "Error: Not authenticated."
    client = TurboEAClient(token)
    data = await client.get("/reports/dashboard")
    return _fmt(data)


# ── Prompts ─────────────────────────────────────────────────────────────────


@mcp.prompt()
def analyze_landscape() -> str:
    """Analyze the IT landscape starting from the dashboard, then exploring
    types and their relationships."""
    return textwrap.dedent("""\
        Analyze the Turbo EA IT landscape. Follow these steps:
        1. Call get_dashboard() to get an overview of the landscape (card counts,
           data quality, approval status).
        2. Call list_card_types() to understand what types of items exist in the
           metamodel (Applications, IT Components, Business Capabilities, etc.).
        3. Call get_relation_types() to understand how these types connect.
        4. Summarize the key findings: how many items of each type, overall data
           quality, and the most important relationships.
    """)


@mcp.prompt()
def find_card(name: str) -> str:
    """Find information about a specific card by name."""
    return textwrap.dedent(f"""\
        Find the card named "{name}" in Turbo EA:
        1. Call search_cards(query="{name}") to find matching cards.
        2. For the best match, call get_card(card_id=...) to get full details.
        3. Call get_card_relations(card_id=...) to see how it connects to other items.
        4. Summarize the card's type, status, key attributes, and relationships.
    """)


@mcp.prompt()
def explore_dependencies(card_name: str) -> str:
    """Explore how a card connects to other items through relations."""
    return textwrap.dedent(f"""\
        Explore the dependencies of "{card_name}":
        1. Call search_cards(query="{card_name}") to find the card.
        2. Call get_card_relations(card_id=...) to get all connections.
        3. For the most important related cards, call get_card(card_id=...)
           to get their details.
        4. Build a dependency map showing what this card depends on and
           what depends on it.
    """)


# ── Token context ──────────────────────────────────────────────────────────

import asyncio
import os

from mcp.server.lowlevel.server import request_ctx as _mcp_request_ctx

# In stdio mode a single user is logged in — store their token here.
_stdio_token: str | None = None


async def _get_current_token() -> str | None:
    """Resolve the authenticated Turbo EA JWT for the current call.

    In stdio mode, returns the long-lived JWT obtained at login.

    In HTTP mode, reads the Bearer header from the MCP request_ctx — which
    the low-level MCP server sets on the session task right before invoking
    a tool handler, with the HTTP Starlette ``Request`` attached. We can't
    rely on a contextvar set in an ASGI middleware because tool handlers
    run in a long-lived session task that doesn't inherit the request
    task's context updates.
    """
    if _stdio_token is not None:
        return _stdio_token
    try:
        ctx = _mcp_request_ctx.get()
    except LookupError:
        return None
    request = getattr(ctx, "request", None)
    if request is None:
        return None
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        return None
    return await oauth.resolve_token(auth[7:])


# ── ASGI application ───────────────────────────────────────────────────────


class RequireBearerForMcp:
    """Return 401 + WWW-Authenticate for unauthenticated /mcp requests.

    Without this, anonymous POSTs are silently accepted, the streamable
    session manager hands out a session id, and the MCP client (Claude
    Desktop's custom connector, the MCP Inspector) never realises it is
    expected to do OAuth — it just keeps making unauthenticated calls.
    Per the MCP spec we respond to unauth'd protocol requests with 401 +
    ``WWW-Authenticate: Bearer resource_metadata="…"`` so the client knows
    where to discover the OAuth metadata and initiate the flow.

    The OAuth and well-known routes themselves remain public — the gate
    only fires for the protocol endpoint at ``/mcp``.
    """

    def __init__(self, app, resource_metadata_url: str):
        self.app = app
        self.resource_metadata_url = resource_metadata_url

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path == "/mcp" or path.startswith("/mcp/"):
                headers = dict(scope.get("headers", []))
                auth = headers.get(b"authorization", b"").decode()
                if not auth.lower().startswith("bearer "):
                    from starlette.responses import JSONResponse

                    response = JSONResponse(
                        {
                            "error": "unauthorized",
                            "error_description": "Bearer token required",
                        },
                        status_code=401,
                        headers={
                            "WWW-Authenticate": (
                                f'Bearer resource_metadata="{self.resource_metadata_url}"'
                            ),
                        },
                    )
                    await response(scope, receive, send)
                    return
        await self.app(scope, receive, send)


def create_app() -> Starlette:
    """Create the full ASGI application with OAuth + MCP routes."""
    # OAuth routes (handled by Starlette, not MCP)
    oauth_routes = [
        Route(
            "/.well-known/oauth-protected-resource",
            oauth.protected_resource_metadata,
            methods=["GET"],
        ),
        Route(
            "/.well-known/oauth-authorization-server",
            oauth.authorization_server_metadata,
            methods=["GET"],
        ),
        # OIDC-style discovery alias — some MCP connectors probe this path
        # instead of (or before) the OAuth 2.1 / RFC 8414 well-known.
        Route(
            "/.well-known/openid-configuration",
            oauth.authorization_server_metadata,
            methods=["GET"],
        ),
        Route("/oauth/authorize", oauth.authorize, methods=["GET"]),
        Route("/oauth/callback", oauth.sso_callback, methods=["GET"]),
        Route("/oauth/token", oauth.token_endpoint, methods=["POST"]),
        Route("/oauth/register", oauth.register_client, methods=["POST"]),
    ]

    async def health(request):
        from starlette.responses import JSONResponse

        return JSONResponse({"status": "ok", "version": APP_VERSION})

    oauth_routes.append(Route("/health", health, methods=["GET"]))

    # streamable_http_app() returns a Starlette app with the MCP protocol route
    # at /mcp by default. Attach OAuth + well-known routes to that same app so
    # the upstream serves both at the right paths without an extra Starlette
    # mount (a mount would push the protocol to /mcp/mcp and trigger a 307
    # redirect for clients hitting /mcp without a trailing slash).
    app = mcp.streamable_http_app()
    app.router.routes.extend(oauth_routes)
    resource_metadata_url = (
        f"{MCP_PUBLIC_URL.rstrip('/')}/.well-known/oauth-protected-resource"
    )
    app.add_middleware(RequireBearerForMcp, resource_metadata_url=resource_metadata_url)

    return app


# ── Stdio mode (for Claude Desktop / local testing) ───────────────────────


async def _refresh_loop(interval: int = 600) -> None:
    """Periodically refresh the JWT so long-running stdio sessions stay alive."""
    global _stdio_token
    while True:
        await asyncio.sleep(interval)
        if _stdio_token is None:
            continue
        try:
            client = TurboEAClient(_stdio_token)
            new_token = await client.refresh_token()
            if new_token:
                _stdio_token = new_token
                logger.info("JWT refreshed successfully")
            else:
                logger.warning("JWT refresh returned no token")
        except Exception:
            logger.exception("JWT refresh failed")


def run_stdio() -> None:
    """Log in with env credentials and run MCP over stdin/stdout."""
    global _stdio_token

    from turbo_ea_mcp.config import TURBO_EA_URL

    email = os.environ.get("TURBO_EA_EMAIL") or os.environ.get("TURBO_EA_USERNAME", "")
    password = os.environ.get("TURBO_EA_PASSWORD", "")
    if not email or not password:
        logger.error("TURBO_EA_EMAIL and TURBO_EA_PASSWORD must be set for stdio mode")
        raise SystemExit(1)

    from turbo_ea_mcp.api_client import login

    logger.info("Logging in to %s as %s …", TURBO_EA_URL, email)
    try:
        _stdio_token = asyncio.run(login(email, password))
    except Exception as exc:
        logger.error("Login failed: %s", exc)
        raise SystemExit(1) from exc

    logger.info("Logged in — starting MCP stdio transport")

    # Patch the MCP server to kick off the refresh loop once the event loop runs
    _original_run = mcp.run

    def _patched_run(**kwargs):
        import threading

        def _start_refresh():
            loop = asyncio.new_event_loop()
            loop.run_until_complete(_refresh_loop())

        t = threading.Thread(target=_start_refresh, daemon=True)
        t.start()
        _original_run(**kwargs)

    _patched_run(transport="stdio")


# ── CLI entry point ─────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(description="Turbo EA MCP Server")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host")
    parser.add_argument("--port", type=int, default=MCP_PORT, help="Bind port")
    parser.add_argument(
        "--stdio",
        action="store_true",
        help="Run in stdio mode (for Claude Desktop). "
        "Requires TURBO_EA_EMAIL and TURBO_EA_PASSWORD env vars.",
    )
    args = parser.parse_args()

    if args.stdio:
        run_stdio()
    else:
        import uvicorn

        logger.info(
            "Starting Turbo EA MCP Server v%s on %s:%d",
            APP_VERSION,
            args.host,
            args.port,
        )
        uvicorn.run(create_app(), host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()
