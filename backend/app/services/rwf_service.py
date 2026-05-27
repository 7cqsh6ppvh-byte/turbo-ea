"""Release Workflow service — branch overlay and conflict-detection logic.

This module contains pure business logic that does NOT touch main tables.
All writes go through the rwf_branch_*_overrides shadow tables.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card import Card
from app.models.diagram import Diagram
from app.models.relation import Relation
from app.models.rwf import (
    RwfBranch,
    RwfBranchCardOverride,
    RwfBranchDiagramOverride,
    RwfBranchRelationOverride,
)

# ---------------------------------------------------------------------------
# Serialisation helpers (shared with rwf.py endpoints)
# ---------------------------------------------------------------------------


def card_to_dict(c: Card) -> dict:
    """Serialise a Card ORM row to a plain dict suitable for JSONB storage."""
    return {
        "id": str(c.id),
        "type": c.type,
        "subtype": c.subtype,
        "name": c.name,
        "description": c.description,
        "parent_id": str(c.parent_id) if c.parent_id else None,
        "lifecycle": c.lifecycle or {},
        "attributes": c.attributes or {},
        "status": c.status,
        "approval_status": c.approval_status,
        "external_id": getattr(c, "external_id", None),
        "alias": getattr(c, "alias", None),
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


def relation_to_dict(r: Relation) -> dict:
    return {
        "id": str(r.id),
        "type": r.type,
        "source_id": str(r.source_id),
        "target_id": str(r.target_id),
        "attributes": r.attributes or {},
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }


def diagram_to_dict(d: Diagram) -> dict:
    return {
        "id": str(d.id),
        "name": d.name,
        "type": d.type,
        "data": d.data or {},
        "updated_at": d.updated_at.isoformat() if d.updated_at else None,
    }


# ---------------------------------------------------------------------------
# Card overlay — read
# ---------------------------------------------------------------------------


async def get_branch_card_list(
    db: AsyncSession,
    branch: RwfBranch,
    *,
    page: int = 1,
    page_size: int = 100,
) -> dict:
    """Return a paginated branch-scoped card list applying copy-on-write overrides.

    Algorithm:
    1. Load all overrides for this branch.
    2. Build a dict: card_id → override  (None for new cards).
    3. Fetch main cards (excluding deleted ones).
    4. Apply overlay: modified → use draft; deleted → skip.
    5. Append new branch-created cards (override.card_id is NULL).
    """
    # Load all overrides for this branch
    ov_result = await db.execute(
        select(RwfBranchCardOverride).where(RwfBranchCardOverride.branch_id == branch.id)
    )
    overrides: list[RwfBranchCardOverride] = ov_result.scalars().all()

    # Map existing card_id → override (only for real cards, not new ones)
    override_map: dict[uuid.UUID, RwfBranchCardOverride] = {}
    new_card_overrides: list[RwfBranchCardOverride] = []
    deleted_ids: set[uuid.UUID] = set()

    for ov in overrides:
        if ov.card_id is None:
            new_card_overrides.append(ov)
        elif ov.operation == "deleted":
            deleted_ids.add(ov.card_id)
            override_map[ov.card_id] = ov
        else:
            override_map[ov.card_id] = ov

    # Fetch main cards (active, excluding archived)
    main_result = await db.execute(
        select(Card).where(Card.status != "ARCHIVED").order_by(Card.name)
    )
    main_cards: list[Card] = main_result.scalars().all()

    items: list[dict] = []
    for card in main_cards:
        if card.id in deleted_ids:
            continue  # hidden in this branch
        ov = override_map.get(card.id)
        if ov and ov.operation == "modified":
            d = dict(ov.draft)
            d["_branch_operation"] = "modified"
            d["_override_id"] = str(ov.id)
            items.append(d)
        else:
            d = card_to_dict(card)
            items.append(d)

    # Append branch-created cards
    for ov in new_card_overrides:
        d = dict(ov.draft)
        d["_branch_operation"] = "created"
        d["_override_id"] = str(ov.id)
        items.append(d)

    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    return {"items": items[start:end], "total": total, "page": page, "page_size": page_size}


async def get_branch_card(
    db: AsyncSession,
    branch: RwfBranch,
    card_id: uuid.UUID,
) -> dict | None:
    """Return branch-scoped card detail or None if card is deleted in this branch."""
    # Check for override first
    ov_result = await db.execute(
        select(RwfBranchCardOverride).where(
            RwfBranchCardOverride.branch_id == branch.id,
            RwfBranchCardOverride.card_id == card_id,
        )
    )
    ov = ov_result.scalar_one_or_none()

    if ov:
        if ov.operation == "deleted":
            return None  # 404 in branch context
        d = dict(ov.draft)
        d["_branch_operation"] = ov.operation
        d["_override_id"] = str(ov.id)
        return d

    # No override — return main card
    card_result = await db.execute(select(Card).where(Card.id == card_id))
    card = card_result.scalar_one_or_none()
    if card is None:
        return None
    return card_to_dict(card)


# ---------------------------------------------------------------------------
# Card overlay — write
# ---------------------------------------------------------------------------


async def create_card_in_branch(
    db: AsyncSession,
    branch: RwfBranch,
    payload: dict,
) -> dict:
    """Create a card exclusively in the branch (no insert into main `cards` table)."""
    ov = RwfBranchCardOverride(
        id=uuid.uuid4(),
        branch_id=branch.id,
        card_id=None,  # new — no main row
        operation="created",
        base_snapshot=None,
        draft=payload,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(ov)
    await db.flush()
    d = dict(payload)
    d["_branch_operation"] = "created"
    d["_override_id"] = str(ov.id)
    return d


async def edit_card_in_branch(
    db: AsyncSession,
    branch: RwfBranch,
    card_id: uuid.UUID,
    patch: dict,
) -> dict | None:
    """Apply a patch to a card within the branch (copy-on-write).

    - If no override exists: loads main card, takes base_snapshot, applies patch →
      creates 'modified' override.
    - If 'modified' override exists: updates draft, preserves original base_snapshot.
    - Returns None if card doesn't exist (in either main or branch).
    """
    # Check for existing override
    ov_result = await db.execute(
        select(RwfBranchCardOverride).where(
            RwfBranchCardOverride.branch_id == branch.id,
            RwfBranchCardOverride.card_id == card_id,
        )
    )
    ov = ov_result.scalar_one_or_none()

    if ov and ov.operation == "deleted":
        return None  # Can't edit a deleted card

    if ov and ov.operation == "modified":
        # Update draft, preserve base_snapshot
        new_draft = {**ov.draft, **patch}
        ov.draft = new_draft
        ov.updated_at = datetime.now(timezone.utc)
        await db.flush()
        d = dict(new_draft)
        d["_branch_operation"] = "modified"
        d["_override_id"] = str(ov.id)
        return d

    # No override — load main card and create 'modified' override
    card_result = await db.execute(select(Card).where(Card.id == card_id))
    card = card_result.scalar_one_or_none()
    if card is None:
        return None

    base = card_to_dict(card)
    new_draft = {**base, **patch}

    new_ov = RwfBranchCardOverride(
        id=uuid.uuid4(),
        branch_id=branch.id,
        card_id=card_id,
        operation="modified",
        base_snapshot=base,
        draft=new_draft,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(new_ov)
    await db.flush()

    d = dict(new_draft)
    d["_branch_operation"] = "modified"
    d["_override_id"] = str(new_ov.id)
    return d


async def delete_card_in_branch(
    db: AsyncSession,
    branch: RwfBranch,
    card_id: uuid.UUID,
) -> bool:
    """Mark a main card as deleted in this branch.

    Returns True if successful, False if card not found.
    """
    # Check if already has an override
    ov_result = await db.execute(
        select(RwfBranchCardOverride).where(
            RwfBranchCardOverride.branch_id == branch.id,
            RwfBranchCardOverride.card_id == card_id,
        )
    )
    ov = ov_result.scalar_one_or_none()

    if ov and ov.operation == "deleted":
        return True  # Already deleted

    # Load main card
    card_result = await db.execute(select(Card).where(Card.id == card_id))
    card = card_result.scalar_one_or_none()
    if card is None:
        return False

    base = card_to_dict(card)

    if ov and ov.operation == "modified":
        # Upgrade existing override to deleted
        ov.operation = "deleted"
        ov.draft = base
        ov.updated_at = datetime.now(timezone.utc)
    else:
        new_ov = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=branch.id,
            card_id=card_id,
            operation="deleted",
            base_snapshot=base,
            draft=base,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(new_ov)

    await db.flush()
    return True


async def delete_branch_created_card(
    db: AsyncSession,
    branch: RwfBranch,
    override_id: uuid.UUID,
) -> bool:
    """Delete a branch-created card (no main row) by removing its override row."""
    ov_result = await db.execute(
        select(RwfBranchCardOverride).where(
            RwfBranchCardOverride.id == override_id,
            RwfBranchCardOverride.branch_id == branch.id,
            RwfBranchCardOverride.card_id.is_(None),
            RwfBranchCardOverride.operation == "created",
        )
    )
    ov = ov_result.scalar_one_or_none()
    if ov is None:
        return False
    await db.delete(ov)
    await db.flush()
    return True


# ---------------------------------------------------------------------------
# Relation overlay — read
# ---------------------------------------------------------------------------


async def get_branch_relations(
    db: AsyncSession,
    branch: RwfBranch,
    *,
    page: int = 1,
    page_size: int = 100,
) -> dict:
    """Return branch-scoped relation list applying overrides."""
    ov_result = await db.execute(
        select(RwfBranchRelationOverride).where(RwfBranchRelationOverride.branch_id == branch.id)
    )
    overrides: list[RwfBranchRelationOverride] = ov_result.scalars().all()

    deleted_ids: set[uuid.UUID] = set()
    new_relation_overrides: list[RwfBranchRelationOverride] = []

    for ov in overrides:
        if ov.relation_id is None:
            new_relation_overrides.append(ov)
        elif ov.operation == "deleted":
            deleted_ids.add(ov.relation_id)

    # Fetch main relations
    main_result = await db.execute(select(Relation).order_by(Relation.created_at))
    main_rels: list[Relation] = main_result.scalars().all()

    items: list[dict] = []
    for r in main_rels:
        if r.id in deleted_ids:
            continue
        items.append(relation_to_dict(r))

    # Append branch-created relations
    for ov in new_relation_overrides:
        d = dict(ov.draft)
        d["_branch_operation"] = "created"
        d["_override_id"] = str(ov.id)
        items.append(d)

    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    return {"items": items[start:end], "total": total, "page": page, "page_size": page_size}


# ---------------------------------------------------------------------------
# Relation overlay — write
# ---------------------------------------------------------------------------


async def create_relation_in_branch(
    db: AsyncSession,
    branch: RwfBranch,
    payload: dict,
) -> dict:
    """Create a relation exclusively in the branch (no insert into main `relations` table)."""
    ov = RwfBranchRelationOverride(
        id=uuid.uuid4(),
        branch_id=branch.id,
        relation_id=None,
        operation="created",
        draft=payload,
        created_at=datetime.now(timezone.utc),
    )
    db.add(ov)
    await db.flush()
    d = dict(payload)
    d["_branch_operation"] = "created"
    d["_override_id"] = str(ov.id)
    return d


async def delete_relation_in_branch(
    db: AsyncSession,
    branch: RwfBranch,
    relation_id: uuid.UUID,
) -> bool:
    """Mark a main relation as deleted in this branch. Returns True on success."""
    # Check for existing override
    ov_result = await db.execute(
        select(RwfBranchRelationOverride).where(
            RwfBranchRelationOverride.branch_id == branch.id,
            RwfBranchRelationOverride.relation_id == relation_id,
        )
    )
    ov = ov_result.scalar_one_or_none()
    if ov and ov.operation == "deleted":
        return True

    rel_result = await db.execute(select(Relation).where(Relation.id == relation_id))
    rel = rel_result.scalar_one_or_none()
    if rel is None:
        return False

    if ov:
        ov.operation = "deleted"
    else:
        new_ov = RwfBranchRelationOverride(
            id=uuid.uuid4(),
            branch_id=branch.id,
            relation_id=relation_id,
            operation="deleted",
            draft=relation_to_dict(rel),
            created_at=datetime.now(timezone.utc),
        )
        db.add(new_ov)

    await db.flush()
    return True


# ---------------------------------------------------------------------------
# Diagram overlay — read / write
# ---------------------------------------------------------------------------


async def get_branch_diagram(
    db: AsyncSession,
    branch: RwfBranch,
    diagram_id: uuid.UUID,
) -> dict | None:
    """Return branch-scoped diagram or None if not found."""
    ov_result = await db.execute(
        select(RwfBranchDiagramOverride).where(
            RwfBranchDiagramOverride.branch_id == branch.id,
            RwfBranchDiagramOverride.diagram_id == diagram_id,
        )
    )
    ov = ov_result.scalar_one_or_none()

    if ov:
        if ov.operation == "deleted":
            return None
        d = dict(ov.draft)
        d["_branch_operation"] = ov.operation
        d["_override_id"] = str(ov.id)
        return d

    diag_result = await db.execute(select(Diagram).where(Diagram.id == diagram_id))
    diag = diag_result.scalar_one_or_none()
    if diag is None:
        return None
    return diagram_to_dict(diag)


async def edit_diagram_in_branch(
    db: AsyncSession,
    branch: RwfBranch,
    diagram_id: uuid.UUID,
    patch: dict,
) -> dict | None:
    """Apply a patch to a diagram within the branch (copy-on-write)."""
    ov_result = await db.execute(
        select(RwfBranchDiagramOverride).where(
            RwfBranchDiagramOverride.branch_id == branch.id,
            RwfBranchDiagramOverride.diagram_id == diagram_id,
        )
    )
    ov = ov_result.scalar_one_or_none()

    if ov and ov.operation == "deleted":
        return None

    if ov and ov.operation in ("modified", "created"):
        new_draft = {**ov.draft, **patch}
        ov.draft = new_draft
        ov.updated_at = datetime.now(timezone.utc)
        await db.flush()
        d = dict(new_draft)
        d["_branch_operation"] = ov.operation
        d["_override_id"] = str(ov.id)
        return d

    # No override — load main diagram
    diag_result = await db.execute(select(Diagram).where(Diagram.id == diagram_id))
    diag = diag_result.scalar_one_or_none()
    if diag is None:
        return None

    base = diagram_to_dict(diag)
    new_draft = {**base, **patch}

    new_ov = RwfBranchDiagramOverride(
        id=uuid.uuid4(),
        branch_id=branch.id,
        diagram_id=diagram_id,
        operation="modified",
        base_snapshot=base,
        draft=new_draft,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(new_ov)
    await db.flush()

    d = dict(new_draft)
    d["_branch_operation"] = "modified"
    d["_override_id"] = str(new_ov.id)
    return d


# ---------------------------------------------------------------------------
# 3-way conflict detection (Phase 5 — stub here for Phase 3 tests)
# ---------------------------------------------------------------------------


def compute_field_diff(base: dict, main: dict, branch: dict) -> dict[str, str]:
    """Return per-field status: 'unchanged' | 'branch_only' | 'main_only' | 'conflict'.

    Uses deepdiff for accurate 3-way comparison. Only called when
    card.updated_at > branch.base_snapshot_at (fast guard in caller).
    """
    from deepdiff import DeepDiff  # noqa: PLC0415

    main_changes = DeepDiff(base, main, ignore_order=True, verbose_level=2)
    branch_changes = DeepDiff(base, branch, ignore_order=True, verbose_level=2)

    main_paths: set[str] = set()
    branch_paths: set[str] = set()

    for change_type in (
        "values_changed",
        "type_changes",
        "dictionary_item_added",
        "dictionary_item_removed",
        "iterable_item_added",
        "iterable_item_removed",
    ):
        main_paths.update(main_changes.get(change_type, {}).keys())
        branch_paths.update(branch_changes.get(change_type, {}).keys())

    all_paths = main_paths | branch_paths
    result: dict[str, str] = {}
    for path in all_paths:
        in_main = path in main_paths
        in_branch = path in branch_paths
        if in_main and in_branch:
            result[path] = "conflict"
        elif in_main:
            result[path] = "main_only"
        else:
            result[path] = "branch_only"

    return result
