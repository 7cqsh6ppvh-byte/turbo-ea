"""Release Workflow service — branch overlay and conflict-detection logic.

During normal branch operations (reads and writes inside the workspace) this
module does NOT touch main tables — all changes are isolated to the
rwf_branch_*_overrides shadow tables.

On MERGE the service applies overrides to main tables and then runs the same
post-write side-effects as the standard card/relation/diagram endpoints:
  • data_quality recomputation
  • calculated field evaluation (calculation_engine)
  • card.created / card.updated events (event_bus)

This ensures that AI suggestion data, TurboLens analyses, calculated fields,
and all other backend features that "seep through" card data remain consistent
after a branch is merged — the merged cards look identical to cards that were
edited directly through the standard API.
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


# ---------------------------------------------------------------------------
# Merge (Phase 6)
# ---------------------------------------------------------------------------


async def execute_merge(
    db: AsyncSession,
    branch: "RwfBranch",
    resolutions: dict[str, dict[str, str]],
    merged_by_id: "uuid.UUID",
) -> dict:
    """Execute merge of branch into main tables in a single transaction.

    Args:
        branch: The RwfBranch ORM object (must be 'approved').
        resolutions: { override_id_str: { deepdiff_path: "main" | "branch" | <value> } }
        merged_by_id: User ID of the reviewer executing the merge.

    Returns:
        Summary dict with counts of applied changes.

    Raises:
        ValueError: If any 'modified' override has unresolved conflicts.
    """
    from datetime import datetime, timezone

    card_overrides = (
        (
            await db.execute(
                select(RwfBranchCardOverride).where(RwfBranchCardOverride.branch_id == branch.id)
            )
        )
        .scalars()
        .all()
    )

    rel_overrides = (
        (
            await db.execute(
                select(RwfBranchRelationOverride).where(
                    RwfBranchRelationOverride.branch_id == branch.id
                )
            )
        )
        .scalars()
        .all()
    )

    diag_overrides = (
        (
            await db.execute(
                select(RwfBranchDiagramOverride).where(
                    RwfBranchDiagramOverride.branch_id == branch.id
                )
            )
        )
        .scalars()
        .all()
    )

    # --- Phase 1: conflict check ---
    conflicts_pending: list[str] = []
    for ov in card_overrides:
        if ov.operation != "modified" or not ov.base_snapshot or not ov.card_id:
            continue
        card_result = await db.execute(select(Card).where(Card.id == ov.card_id))
        main_card = card_result.scalar_one_or_none()
        if not main_card:
            continue
        if main_card.updated_at and main_card.updated_at > branch.base_snapshot_at:
            main_dict = card_to_dict(main_card)
            field_conflicts = compute_field_diff(ov.base_snapshot, main_dict, ov.draft)
            conflict_fields = {k for k, v in field_conflicts.items() if v == "conflict"}
            ov_resolutions = resolutions.get(str(ov.id), {})
            unresolved = conflict_fields - set(ov_resolutions.keys())
            if unresolved:
                conflicts_pending.append(str(ov.id))

    if conflicts_pending:
        raise ValueError(
            f"Unresolved conflicts in overrides: {conflicts_pending}. "
            "Provide resolutions for all conflicting fields."
        )

    now = datetime.now(timezone.utc)
    stats = {
        "cards_modified": 0,
        "cards_created": 0,
        "cards_deleted": 0,
        "relations_created": 0,
        "relations_deleted": 0,
        "diagrams_modified": 0,
        "diagrams_created": 0,
    }

    # --- Phase 2: capture pre-merge snapshot BEFORE writing anything ---
    # Each entry records enough information for execute_rollback() to undo the
    # operation precisely:
    #   modified → pre_merge_state (restore to this)
    #   deleted  → pre_merge_state (un-archive / re-insert)
    #   created  → new_id (delete this row during rollback)
    snapshot_cards: list[dict] = []
    snapshot_relations: list[dict] = []
    snapshot_diagrams: list[dict] = []

    # Pre-assign UUIDs for newly created items so the snapshot knows their IDs
    # even before the INSERT happens (needed for rollback to DELETE them).
    new_card_ids: dict[str, uuid.UUID] = {}  # override.id → new card UUID
    new_rel_ids: dict[str, uuid.UUID] = {}  # override.id → new relation UUID
    new_diag_ids: dict[str, uuid.UUID] = {}  # override.id → new diagram UUID

    for ov in card_overrides:
        if ov.operation == "modified" and ov.card_id:
            card_result = await db.execute(select(Card).where(Card.id == ov.card_id))
            main_card = card_result.scalar_one_or_none()
            if main_card:
                snapshot_cards.append(
                    {
                        "override_id": str(ov.id),
                        "operation": "modified",
                        "pre_merge_state": card_to_dict(main_card),
                    }
                )
        elif ov.operation == "created":
            new_id = uuid.uuid4()
            new_card_ids[str(ov.id)] = new_id
            snapshot_cards.append(
                {
                    "override_id": str(ov.id),
                    "operation": "created",
                    "new_id": str(new_id),
                }
            )
        elif ov.operation == "deleted" and ov.card_id:
            card_result = await db.execute(select(Card).where(Card.id == ov.card_id))
            main_card = card_result.scalar_one_or_none()
            if main_card:
                snapshot_cards.append(
                    {
                        "override_id": str(ov.id),
                        "operation": "deleted",
                        "pre_merge_state": card_to_dict(main_card),
                    }
                )

    for ov in rel_overrides:
        if ov.operation == "created":
            new_id = uuid.uuid4()
            new_rel_ids[str(ov.id)] = new_id
            snapshot_relations.append(
                {
                    "override_id": str(ov.id),
                    "operation": "created",
                    "new_id": str(new_id),
                }
            )
        elif ov.operation == "deleted" and ov.relation_id:
            rel_result = await db.execute(select(Relation).where(Relation.id == ov.relation_id))
            main_rel = rel_result.scalar_one_or_none()
            if main_rel:
                snapshot_relations.append(
                    {
                        "override_id": str(ov.id),
                        "operation": "deleted",
                        "pre_merge_state": relation_to_dict(main_rel),
                    }
                )

    for ov in diag_overrides:
        if ov.operation == "modified" and ov.diagram_id:
            diag_result = await db.execute(select(Diagram).where(Diagram.id == ov.diagram_id))
            main_diag = diag_result.scalar_one_or_none()
            if main_diag:
                snapshot_diagrams.append(
                    {
                        "override_id": str(ov.id),
                        "operation": "modified",
                        "pre_merge_state": diagram_to_dict(main_diag),
                    }
                )
        elif ov.operation == "created":
            new_id = uuid.uuid4()
            new_diag_ids[str(ov.id)] = new_id
            snapshot_diagrams.append(
                {
                    "override_id": str(ov.id),
                    "operation": "created",
                    "new_id": str(new_id),
                }
            )
        elif ov.operation == "deleted" and ov.diagram_id:
            diag_result = await db.execute(select(Diagram).where(Diagram.id == ov.diagram_id))
            main_diag = diag_result.scalar_one_or_none()
            if main_diag:
                snapshot_diagrams.append(
                    {
                        "override_id": str(ov.id),
                        "operation": "deleted",
                        "pre_merge_state": diagram_to_dict(main_diag),
                    }
                )

    branch.pre_merge_snapshot = {
        "cards": snapshot_cards,
        "relations": snapshot_relations,
        "diagrams": snapshot_diagrams,
        "merged_at": now.isoformat(),
    }

    # --- Phase 3: apply card overrides ---
    for ov in card_overrides:
        if ov.operation == "modified" and ov.card_id:
            card_result = await db.execute(select(Card).where(Card.id == ov.card_id))
            main_card = card_result.scalar_one_or_none()
            if not main_card:
                continue
            # Build final values: start from draft, apply any "main" resolutions
            draft = dict(ov.draft)
            ov_resolutions = resolutions.get(str(ov.id), {})
            if (
                ov.base_snapshot
                and main_card.updated_at
                and main_card.updated_at > branch.base_snapshot_at
            ):
                main_dict = card_to_dict(main_card)
                field_conflicts = compute_field_diff(ov.base_snapshot, main_dict, draft)
                for field_path, resolution in ov_resolutions.items():
                    if resolution == "main" and field_path in field_conflicts:
                        # Apply main value by reverting to main_dict value
                        _apply_resolution(draft, field_path, main_dict, resolution)
                    elif resolution == "branch":
                        pass  # keep draft value
                    elif resolution not in ("main", "branch"):
                        _apply_custom_resolution(draft, field_path, resolution)

            # Apply draft fields to main card
            _apply_draft_to_card(main_card, draft, now)
            stats["cards_modified"] += 1

        elif ov.operation == "created":
            # Use pre-assigned UUID so the snapshot can reference it for rollback
            pre_assigned_id = new_card_ids.get(str(ov.id), uuid.uuid4())
            new_card = _draft_to_new_card(ov.draft, now, card_id=pre_assigned_id)
            db.add(new_card)
            stats["cards_created"] += 1

        elif ov.operation == "deleted" and ov.card_id:
            card_result = await db.execute(select(Card).where(Card.id == ov.card_id))
            main_card = card_result.scalar_one_or_none()
            if main_card:
                main_card.status = "ARCHIVED"
                main_card.updated_at = now
            stats["cards_deleted"] += 1

    # --- Phase 4: apply relation overrides ---
    for ov in rel_overrides:
        if ov.operation == "created":
            pre_assigned_id = new_rel_ids.get(str(ov.id), uuid.uuid4())
            new_rel = Relation(
                id=pre_assigned_id,
                type=ov.draft["type"],
                source_id=uuid.UUID(ov.draft["source_id"]),
                target_id=uuid.UUID(ov.draft["target_id"]),
                attributes=ov.draft.get("attributes") or {},
                created_at=now,
                updated_at=now,
            )
            db.add(new_rel)
            stats["relations_created"] += 1

        elif ov.operation == "deleted" and ov.relation_id:
            rel_result = await db.execute(select(Relation).where(Relation.id == ov.relation_id))
            main_rel = rel_result.scalar_one_or_none()
            if main_rel:
                await db.delete(main_rel)
            stats["relations_deleted"] += 1

    # --- Phase 5: apply diagram overrides ---
    for ov in diag_overrides:
        if ov.operation == "modified" and ov.diagram_id:
            diag_result = await db.execute(select(Diagram).where(Diagram.id == ov.diagram_id))
            main_diag = diag_result.scalar_one_or_none()
            if main_diag:
                draft = dict(ov.draft)
                if "name" in draft:
                    main_diag.name = draft["name"]
                if "data" in draft:
                    main_diag.data = draft["data"]
                main_diag.updated_at = now
            stats["diagrams_modified"] += 1

        elif ov.operation == "created":
            pre_assigned_id = new_diag_ids.get(str(ov.id), uuid.uuid4())
            new_diag = Diagram(
                id=pre_assigned_id,
                name=ov.draft.get("name", "Untitled"),
                type=ov.draft.get("type", "drawio"),
                data=ov.draft.get("data") or {},
                created_at=now,
                updated_at=now,
            )
            db.add(new_diag)
            stats["diagrams_created"] += 1

        elif ov.operation == "deleted" and ov.diagram_id:
            diag_result = await db.execute(select(Diagram).where(Diagram.id == ov.diagram_id))
            main_diag = diag_result.scalar_one_or_none()
            if main_diag:
                await db.delete(main_diag)
            stats["diagrams_deleted"] = stats.get("diagrams_deleted", 0) + 1

    # --- Phase 6: finalise branch ---
    branch.status = "merged"
    branch.reviewed_by = merged_by_id
    branch.reviewed_at = now
    branch.updated_at = now

    # Flush so all new/updated Card rows get their PKs and are visible to
    # the calculation engine and data-quality scorer within this transaction.
    await db.flush()

    # --- Phase 6: post-merge side-effects ---
    # Run the same post-write pipeline as the standard card endpoints so that
    # AI suggestion data, TurboLens analyses, calculated fields, and other
    # backend features that read card data see consistent state after merge.
    await _run_post_merge_side_effects(
        db=db,
        card_overrides=card_overrides,
        merged_by_id=merged_by_id,
        now=now,
    )

    return stats


async def _run_post_merge_side_effects(
    db: "AsyncSession",
    card_overrides: list["RwfBranchCardOverride"],
    merged_by_id: "uuid.UUID",
    now: "datetime",
) -> None:
    """Run data-quality, calculated-field, and event-bus side-effects for every
    card that was created or modified by the merge.

    Mirrors the pipeline in ``cards.py`` PATCH / bulk-create so that merged
    cards are indistinguishable from cards written through the standard API.
    Failures are logged but do not abort the (already-committed) merge.
    """
    import logging

    from app.services.calculation_engine import run_calculations_for_card
    from app.services.event_bus import event_bus

    logger = logging.getLogger(__name__)

    for ov in card_overrides:
        if ov.operation not in ("modified", "created"):
            continue

        card_id = ov.card_id
        if ov.operation == "created":
            # Newly created card — find it by matching the draft name/type
            # (the card was added to the session in Phase 2; we locate it
            #  via a DB query after flush so we have its real UUID).
            try:
                draft = dict(ov.draft)
                from sqlalchemy import and_

                result = await db.execute(
                    select(Card).where(
                        and_(
                            Card.name == draft.get("name"),
                            Card.type == draft.get("type"),
                            Card.created_at >= now,
                        )
                    )
                )
                new_card = result.scalars().first()
                if new_card:
                    card_id = new_card.id
            except Exception as exc:  # noqa: BLE001
                logger.warning(
                    "RWF merge: could not locate newly created card for side-effects: %s", exc
                )
                continue

        if not card_id:
            continue

        try:
            card_result = await db.execute(select(Card).where(Card.id == card_id))
            card = card_result.scalar_one_or_none()
            if not card:
                continue

            # 1. Recompute data quality
            from app.api.v1.cards import _calc_data_quality

            card.data_quality = await _calc_data_quality(db, card)

            # 2. Run calculated fields (skip PPM-managed cost fields)
            try:
                from app.api.v1.cards import _get_ppm_exclusions

                ppm_excl = await _get_ppm_exclusions(db, card)
            except Exception:  # noqa: BLE001
                ppm_excl: set[str] = set()
            await run_calculations_for_card(db, card, exclude_fields=ppm_excl)

            # 3. Emit event so SSE subscribers, AI, and audit trail are updated
            event_type = "card.created" if ov.operation == "created" else "card.updated"
            await event_bus.publish(
                event_type,
                {"id": str(card.id), "source": "rwf_merge", "branch_id": str(ov.branch_id)},
                db=db,
                card_id=card.id,
                user_id=merged_by_id,
            )

        except Exception as exc:  # noqa: BLE001
            # Side-effects are best-effort — the merge itself is already
            # committed.  Log and continue so one bad card doesn't block the rest.
            logger.warning(
                "RWF merge post-merge side-effect failed for card %s: %s",
                card_id,
                exc,
            )


# ---------------------------------------------------------------------------
# Rollback (undo a merged branch)
# ---------------------------------------------------------------------------


async def execute_rollback(
    db: AsyncSession,
    branch: "RwfBranch",
    rolled_back_by_id: "uuid.UUID",
) -> dict:
    """Undo a previously merged branch by restoring all main-table records to
    their pre-merge state.

    Requirements:
        - branch.status must be 'merged'
        - branch.pre_merge_snapshot must be populated (branches merged before
          migration 099 will have NULL — reject those with a clear error)

    Algorithm (mirrors execute_merge in reverse):
        modified cards/diagrams   → restore from pre_merge_state
        created  cards/relations/diagrams → DELETE the row
        deleted  cards            → restore status + clear archived_at
        deleted  relations        → re-INSERT from pre_merge_state
        deleted  diagrams         → re-INSERT from pre_merge_state

    After restoring main tables, runs the same post-write side-effects
    (data quality, calculated fields, events) so every downstream feature
    stays consistent.

    Sets branch.status = 'rolled_back' on success.
    """
    from datetime import datetime, timezone

    if branch.status != "merged":
        raise ValueError(
            f"Branch must be in 'merged' status to roll back (current: {branch.status})"
        )
    if not branch.pre_merge_snapshot:
        raise ValueError(
            "This branch was merged before rollback support was added (no pre-merge snapshot). "
            "Manual restoration is required."
        )

    now = datetime.now(timezone.utc)
    snapshot = branch.pre_merge_snapshot
    stats: dict[str, int] = {
        "cards_restored": 0,
        "cards_deleted": 0,
        "cards_unarchived": 0,
        "relations_deleted": 0,
        "relations_restored": 0,
        "diagrams_restored": 0,
        "diagrams_deleted": 0,
        "diagrams_unarchived": 0,
    }

    rolled_back_card_ids: list[uuid.UUID] = []  # for post-rollback side-effects

    # --- Restore cards ---
    for entry in snapshot.get("cards", []):
        op = entry["operation"]

        if op == "modified":
            state = entry["pre_merge_state"]
            card_id = uuid.UUID(state["id"])
            res = await db.execute(select(Card).where(Card.id == card_id))
            card = res.scalar_one_or_none()
            if card:
                _apply_draft_to_card(card, state, now)
                stats["cards_restored"] += 1
                rolled_back_card_ids.append(card_id)

        elif op == "created":
            # Card was INSERTed by the merge — delete it now
            new_id = uuid.UUID(entry["new_id"])
            res = await db.execute(select(Card).where(Card.id == new_id))
            card = res.scalar_one_or_none()
            if card:
                await db.delete(card)
                stats["cards_deleted"] += 1

        elif op == "deleted":
            # Card was ARCHIVEd by the merge — restore it
            state = entry["pre_merge_state"]
            card_id = uuid.UUID(state["id"])
            res = await db.execute(select(Card).where(Card.id == card_id))
            card = res.scalar_one_or_none()
            if card:
                card.status = state.get("status", "ACTIVE")
                card.updated_at = now
                stats["cards_unarchived"] += 1
                rolled_back_card_ids.append(card_id)

    # --- Restore relations ---
    for entry in snapshot.get("relations", []):
        op = entry["operation"]

        if op == "created":
            new_id = uuid.UUID(entry["new_id"])
            res = await db.execute(select(Relation).where(Relation.id == new_id))
            rel = res.scalar_one_or_none()
            if rel:
                await db.delete(rel)
                stats["relations_deleted"] += 1

        elif op == "deleted":
            state = entry["pre_merge_state"]
            rel_id = uuid.UUID(state["id"])
            # Only re-insert if it no longer exists (idempotent)
            res = await db.execute(select(Relation).where(Relation.id == rel_id))
            existing = res.scalar_one_or_none()
            if not existing:
                restored_rel = Relation(
                    id=rel_id,
                    type=state["type"],
                    source_id=uuid.UUID(state["source_id"]),
                    target_id=uuid.UUID(state["target_id"]),
                    attributes=state.get("attributes") or {},
                    created_at=now,
                    updated_at=now,
                )
                db.add(restored_rel)
                stats["relations_restored"] += 1

    # --- Restore diagrams ---
    for entry in snapshot.get("diagrams", []):
        op = entry["operation"]

        if op == "modified":
            state = entry["pre_merge_state"]
            diag_id = uuid.UUID(state["id"])
            res = await db.execute(select(Diagram).where(Diagram.id == diag_id))
            diag = res.scalar_one_or_none()
            if diag:
                diag.name = state.get("name", diag.name)
                diag.data = state.get("data", diag.data)
                diag.updated_at = now
                stats["diagrams_restored"] += 1

        elif op == "created":
            new_id = uuid.UUID(entry["new_id"])
            res = await db.execute(select(Diagram).where(Diagram.id == new_id))
            diag = res.scalar_one_or_none()
            if diag:
                await db.delete(diag)
                stats["diagrams_deleted"] += 1

        elif op == "deleted":
            state = entry["pre_merge_state"]
            diag_id = uuid.UUID(state["id"])
            res = await db.execute(select(Diagram).where(Diagram.id == diag_id))
            existing = res.scalar_one_or_none()
            if not existing:
                restored_diag = Diagram(
                    id=diag_id,
                    name=state.get("name", "Untitled"),
                    type=state.get("type", "drawio"),
                    data=state.get("data") or {},
                    created_at=now,
                    updated_at=now,
                )
                db.add(restored_diag)
                stats["diagrams_unarchived"] += 1

    # --- Mark branch as rolled back ---
    branch.status = "rolled_back"
    branch.rolled_back_by = rolled_back_by_id
    branch.rolled_back_at = now
    branch.updated_at = now

    await db.flush()

    # --- Post-rollback side-effects (best-effort) ---
    await _run_post_rollback_side_effects(db, rolled_back_card_ids, rolled_back_by_id, now)

    return stats


async def _run_post_rollback_side_effects(
    db: "AsyncSession",
    card_ids: list["uuid.UUID"],
    actor_id: "uuid.UUID",
    now: "datetime",
) -> None:
    """Run data-quality, calculated-field, and event-bus side-effects for each
    card that was restored or un-archived by a rollback.

    Mirrors the pattern in _run_post_merge_side_effects — best-effort only.
    """
    import logging

    from app.services.calculation_engine import run_calculations_for_card
    from app.services.event_bus import event_bus

    logger = logging.getLogger(__name__)

    for card_id in card_ids:
        try:
            res = await db.execute(select(Card).where(Card.id == card_id))
            card = res.scalar_one_or_none()
            if not card:
                continue

            from app.api.v1.cards import _calc_data_quality

            card.data_quality = await _calc_data_quality(db, card)

            try:
                from app.api.v1.cards import _get_ppm_exclusions

                ppm_excl = await _get_ppm_exclusions(db, card)
            except Exception:  # noqa: BLE001
                ppm_excl: set[str] = set()
            await run_calculations_for_card(db, card, exclude_fields=ppm_excl)

            await event_bus.publish(
                "card.updated",
                {"id": str(card.id), "source": "rwf_rollback"},
                db=db,
                card_id=card.id,
                user_id=actor_id,
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("RWF rollback post-side-effect failed for card %s: %s", card_id, exc)


def _apply_draft_to_card(card: "Card", draft: dict, now: "datetime") -> None:
    """Apply draft fields to an existing Card row."""

    if "name" in draft:
        card.name = draft["name"]
    if "description" in draft:
        card.description = draft["description"]
    if "subtype" in draft:
        card.subtype = draft["subtype"]
    if "status" in draft:
        card.status = draft["status"]
    if "approval_status" in draft:
        card.approval_status = draft["approval_status"]
    if "attributes" in draft:
        card.attributes = draft["attributes"]
    if "lifecycle" in draft:
        card.lifecycle = draft["lifecycle"]
    if "alias" in draft:
        card.alias = draft["alias"]
    card.updated_at = now


def _draft_to_new_card(draft: dict, now: "datetime", *, card_id: uuid.UUID | None = None) -> "Card":
    """Create a new Card ORM object from a branch draft dict."""
    return Card(
        id=card_id or uuid.uuid4(),
        type=draft.get("type", "Application"),
        subtype=draft.get("subtype"),
        name=draft.get("name", "Untitled"),
        description=draft.get("description"),
        attributes=draft.get("attributes") or {},
        lifecycle=draft.get("lifecycle") or {},
        status=draft.get("status", "ACTIVE"),
        approval_status=draft.get("approval_status", "DRAFT"),
        created_at=now,
        updated_at=now,
    )


def _apply_resolution(draft: dict, field_path: str, main_dict: dict, resolution: str) -> None:
    """Apply a deepdiff field path resolution to the draft dict."""
    # field_path looks like "root['name']" or "root['attributes']['cost']"
    # We extract the key sequence and apply it
    keys = _parse_deepdiff_path(field_path)
    if not keys:
        return
    # Navigate to parent
    target = draft
    source = main_dict
    for k in keys[:-1]:
        if k not in target or not isinstance(target[k], dict):
            return
        target = target[k]
        source = source.get(k, {}) if isinstance(source, dict) else {}
    last_key = keys[-1]
    # Apply main value
    if isinstance(source, dict) and last_key in source:
        target[last_key] = source[last_key]
    elif last_key in target:
        del target[last_key]


def _apply_custom_resolution(draft: dict, field_path: str, value: str) -> None:
    """Apply a custom (non-main/non-branch) resolution value to draft."""
    keys = _parse_deepdiff_path(field_path)
    if not keys:
        return
    target = draft
    for k in keys[:-1]:
        if k not in target or not isinstance(target[k], dict):
            return
        target = target[k]
    target[keys[-1]] = value


def _parse_deepdiff_path(path: str) -> list[str]:
    """Parse a deepdiff path like "root['name']" → ["name"]."""
    import re  # noqa: PLC0415

    parts = re.findall(r"\['([^']+)'\]|\[(\d+)\]", path)
    result = []
    for str_key, int_key in parts:
        if str_key:
            result.append(str_key)
        elif int_key:
            result.append(int(int_key))  # type: ignore[arg-type]
    return result


# ---------------------------------------------------------------------------
# Sync (Phase 6)
# ---------------------------------------------------------------------------


async def execute_sync(
    db: AsyncSession,
    branch: "RwfBranch",
    resolutions: dict[str, dict[str, str]],
) -> dict:
    """Pull main changes into branch overrides (non-destructive update).

    For each 'modified' card override:
    - If no conflict: update base_snapshot to current main state.
    - If conflict: report it (or apply resolution if provided).

    Returns: { "conflicts": [...], "resolved": N, "no_conflict": N }
    """
    from datetime import datetime, timezone

    card_overrides = (
        (
            await db.execute(
                select(RwfBranchCardOverride).where(
                    RwfBranchCardOverride.branch_id == branch.id,
                    RwfBranchCardOverride.operation == "modified",
                )
            )
        )
        .scalars()
        .all()
    )

    now = datetime.now(timezone.utc)
    conflicts = []
    resolved = 0
    no_conflict = 0

    for ov in card_overrides:
        if not ov.base_snapshot or not ov.card_id:
            continue
        card_result = await db.execute(select(Card).where(Card.id == ov.card_id))
        main_card = card_result.scalar_one_or_none()
        if not main_card:
            continue

        main_dict = card_to_dict(main_card)

        if main_card.updated_at and main_card.updated_at > branch.base_snapshot_at:
            field_conflicts = compute_field_diff(ov.base_snapshot, main_dict, ov.draft)
            conflict_fields = {k for k, v in field_conflicts.items() if v == "conflict"}

            if not conflict_fields:
                # Safe to absorb main changes — update base_snapshot
                ov.base_snapshot = main_dict
                ov.updated_at = now
                no_conflict += 1
            else:
                ov_resolutions = resolutions.get(str(ov.id), {})
                unresolved = conflict_fields - set(ov_resolutions.keys())
                if unresolved:
                    conflicts.append(
                        {
                            "override_id": str(ov.id),
                            "card_id": str(ov.card_id),
                            "conflict_fields": list(conflict_fields),
                            "field_diff": field_conflicts,
                        }
                    )
                else:
                    # Apply resolutions then update base_snapshot
                    draft = dict(ov.draft)
                    for field_path, resolution in ov_resolutions.items():
                        if resolution == "main":
                            _apply_resolution(draft, field_path, main_dict, resolution)
                        elif resolution not in ("main", "branch"):
                            _apply_custom_resolution(draft, field_path, resolution)
                    ov.draft = draft
                    ov.base_snapshot = main_dict
                    ov.updated_at = now
                    resolved += 1
        else:
            # Main hasn't moved — still update base_snapshot to latest
            ov.base_snapshot = main_dict
            ov.updated_at = now
            no_conflict += 1

    # Advance branch anchor if no outstanding conflicts
    if not conflicts:
        branch.base_snapshot_at = now
        branch.updated_at = now

    await db.flush()
    return {"conflicts": conflicts, "resolved": resolved, "no_conflict": no_conflict}
