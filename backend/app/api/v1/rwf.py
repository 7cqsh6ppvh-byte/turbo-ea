"""Release Workflow (RWF) API — branch-based change governance.

All routes live under /rwf/*. Standard card/relation/diagram endpoints are
NOT modified. Branch data is only visible inside this namespace.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.app_settings import AppSettings
from app.models.card import Card
from app.models.diagram import Diagram
from app.models.relation import Relation
from app.models.rwf import (
    EaSnapshot,
    RwfBranch,
    RwfBranchCardOverride,
    RwfBranchDiagramOverride,
    RwfBranchRelationOverride,
)
from app.models.user import User
from app.services.permission_service import PermissionService

router = APIRouter(prefix="/rwf", tags=["rwf"])


# ---------------------------------------------------------------------------
# Module-enabled guard
# ---------------------------------------------------------------------------


async def _require_rwf_enabled(db: AsyncSession = Depends(get_db)) -> None:
    """Raise 503 if the Release Workflow module is disabled in settings."""
    result = await db.execute(select(AppSettings).where(AppSettings.id == "default"))
    row = result.scalar_one_or_none()
    general = (row.general_settings if row else None) or {}
    if not general.get("rwfEnabled", False):
        raise HTTPException(
            status_code=503,
            detail="Release Workflow module is not enabled. Enable it in Admin → Settings.",
        )


RwfEnabled = Depends(_require_rwf_enabled)


# ---------------------------------------------------------------------------
# Pydantic schemas (inline — full schemas go in schemas/rwf.py for Phase 5+)
# ---------------------------------------------------------------------------


class BranchCreate(BaseModel):
    name: str
    description: str | None = None


class RejectPayload(BaseModel):
    comment: str | None = None


class SnapshotCreate(BaseModel):
    name: str
    description: str | None = None


def _branch_out(
    b: RwfBranch, *, card_count: int = 0, rel_count: int = 0, diag_count: int = 0
) -> dict:
    return {
        "id": str(b.id),
        "name": b.name,
        "description": b.description,
        "status": b.status,
        "base_snapshot_at": b.base_snapshot_at.isoformat(),
        "created_by": str(b.created_by) if b.created_by else None,
        "reviewed_by": str(b.reviewed_by) if b.reviewed_by else None,
        "reviewed_at": b.reviewed_at.isoformat() if b.reviewed_at else None,
        "review_comment": b.review_comment,
        "created_at": b.created_at.isoformat(),
        "updated_at": b.updated_at.isoformat(),
        "change_counts": {
            "cards": card_count,
            "relations": rel_count,
            "diagrams": diag_count,
        },
    }


def _snapshot_out(s: EaSnapshot) -> dict:
    return {
        "id": str(s.id),
        "name": s.name,
        "description": s.description,
        "snapshot_at": s.snapshot_at.isoformat(),
        "created_by": str(s.created_by) if s.created_by else None,
        "created_at": s.created_at.isoformat(),
    }


async def _get_branch_or_404(db: AsyncSession, branch_id: uuid.UUID) -> RwfBranch:
    result = await db.execute(select(RwfBranch).where(RwfBranch.id == branch_id))
    branch = result.scalar_one_or_none()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


async def _change_counts(db: AsyncSession, branch_id: uuid.UUID) -> tuple[int, int, int]:
    card_cnt = (
        await db.execute(select(func.count()).where(RwfBranchCardOverride.branch_id == branch_id))
    ).scalar_one()
    rel_cnt = (
        await db.execute(
            select(func.count()).where(RwfBranchRelationOverride.branch_id == branch_id)
        )
    ).scalar_one()
    diag_cnt = (
        await db.execute(
            select(func.count()).where(RwfBranchDiagramOverride.branch_id == branch_id)
        )
    ).scalar_one()
    return card_cnt, rel_cnt, diag_cnt


# ---------------------------------------------------------------------------
# Branches — CRUD
# ---------------------------------------------------------------------------


@router.get("/branches")
async def list_branches(
    status: str | None = None,
    page: int = 1,
    page_size: int = 50,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.view")

    q = select(RwfBranch)
    if status:
        q = q.where(RwfBranch.status == status)
    q = q.order_by(RwfBranch.created_at.desc())

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    branches = result.scalars().all()

    items = []
    for b in branches:
        c, r, d = await _change_counts(db, b.id)
        items.append(_branch_out(b, card_count=c, rel_count=r, diag_count=d))

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/branches", status_code=201)
async def create_branch(
    body: BranchCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.contribute")

    branch = RwfBranch(
        id=uuid.uuid4(),
        name=body.name,
        description=body.description,
        status="open",
        base_snapshot_at=datetime.now(timezone.utc),
        created_by=user.id,
    )
    db.add(branch)
    await db.commit()
    await db.refresh(branch)
    return _branch_out(branch)


@router.get("/branches/{branch_id}")
async def get_branch(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.view")
    branch = await _get_branch_or_404(db, branch_id)
    c, r, d = await _change_counts(db, branch.id)
    return _branch_out(branch, card_count=c, rel_count=r, diag_count=d)


@router.delete("/branches/{branch_id}")
async def abandon_branch(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)

    # Members can only abandon their own branches; architects can abandon any
    is_owner = branch.created_by == user.id
    has_approve = await PermissionService.check_permission(db, user, "rwf.approve")
    if not is_owner and not has_approve:
        raise HTTPException(status_code=403, detail="You can only abandon your own branches")

    branch.status = "abandoned"
    await db.commit()
    await db.refresh(branch)
    c, r, d = await _change_counts(db, branch.id)
    return _branch_out(branch, card_count=c, rel_count=r, diag_count=d)


# ---------------------------------------------------------------------------
# Branches — lifecycle transitions
# ---------------------------------------------------------------------------


@router.post("/branches/{branch_id}/submit")
async def submit_branch(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)

    if branch.status != "open":
        raise HTTPException(
            status_code=422,
            detail=(
                f"Cannot submit a branch with status '{branch.status}'. "
                "Only 'open' branches can be submitted."
            ),
        )

    branch.status = "in_review"
    await db.commit()
    await db.refresh(branch)
    return _branch_out(branch)


@router.post("/branches/{branch_id}/approve")
async def approve_branch(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.approve")
    branch = await _get_branch_or_404(db, branch_id)

    if branch.status != "in_review":
        raise HTTPException(
            status_code=422,
            detail=(
                f"Cannot approve a branch with status '{branch.status}'. "
                "Only 'in_review' branches can be approved."
            ),
        )

    branch.status = "approved"
    branch.reviewed_by = user.id
    branch.reviewed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(branch)
    return _branch_out(branch)


@router.post("/branches/{branch_id}/reject")
async def reject_branch(
    branch_id: uuid.UUID,
    body: RejectPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.approve")
    branch = await _get_branch_or_404(db, branch_id)

    if branch.status != "in_review":
        raise HTTPException(
            status_code=422,
            detail=(
                f"Cannot reject a branch with status '{branch.status}'. "
                "Only 'in_review' branches can be rejected."
            ),
        )

    branch.status = "rejected"
    branch.reviewed_by = user.id
    branch.reviewed_at = datetime.now(timezone.utc)
    branch.review_comment = body.comment
    await db.commit()
    await db.refresh(branch)
    return _branch_out(branch)


# ---------------------------------------------------------------------------
# Branches — diff
# ---------------------------------------------------------------------------


@router.get("/branches/{branch_id}/diff")
async def get_branch_diff(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.view")
    branch = await _get_branch_or_404(db, branch_id)

    card_overrides_result = await db.execute(
        select(RwfBranchCardOverride).where(RwfBranchCardOverride.branch_id == branch.id)
    )
    rel_overrides_result = await db.execute(
        select(RwfBranchRelationOverride).where(RwfBranchRelationOverride.branch_id == branch.id)
    )
    diag_overrides_result = await db.execute(
        select(RwfBranchDiagramOverride).where(RwfBranchDiagramOverride.branch_id == branch.id)
    )

    cards = []
    for o in card_overrides_result.scalars().all():
        cards.append(
            {
                "override_id": str(o.id),
                "card_id": str(o.card_id) if o.card_id else None,
                "operation": o.operation,
                "draft": o.draft,
                "base_snapshot": o.base_snapshot,
                "conflicts": {},  # populated in Phase 5
            }
        )

    relations = []
    for o in rel_overrides_result.scalars().all():
        relations.append(
            {
                "override_id": str(o.id),
                "relation_id": str(o.relation_id) if o.relation_id else None,
                "operation": o.operation,
                "draft": o.draft,
            }
        )

    diagrams = []
    for o in diag_overrides_result.scalars().all():
        diagrams.append(
            {
                "override_id": str(o.id),
                "diagram_id": str(o.diagram_id) if o.diagram_id else None,
                "operation": o.operation,
                "draft": o.draft,
                "base_snapshot": o.base_snapshot,
                "conflicts": {},  # populated in Phase 5
            }
        )

    return {"cards": cards, "relations": relations, "diagrams": diagrams}


# ---------------------------------------------------------------------------
# Snapshots
# ---------------------------------------------------------------------------


@router.get("/snapshots")
async def list_snapshots(
    page: int = 1,
    page_size: int = 50,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.view")

    q = select(EaSnapshot).order_by(EaSnapshot.snapshot_at.desc())
    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    snapshots = result.scalars().all()

    return {
        "items": [_snapshot_out(s) for s in snapshots],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/snapshots", status_code=201)
async def create_snapshot(
    body: SnapshotCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.contribute")

    # Check name uniqueness
    existing = await db.execute(select(EaSnapshot).where(EaSnapshot.name == body.name))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409, detail=f"A snapshot named '{body.name}' already exists."
        )

    now = datetime.now(timezone.utc)

    # Serialise full current state into the three payload columns
    cards_result = await db.execute(select(Card))
    cards_payload = [_card_to_dict(c) for c in cards_result.scalars().all()]

    rels_result = await db.execute(select(Relation))
    relations_payload = [_relation_to_dict(r) for r in rels_result.scalars().all()]

    diags_result = await db.execute(select(Diagram))
    diagrams_payload = [_diagram_to_dict(d) for d in diags_result.scalars().all()]

    snapshot = EaSnapshot(
        id=uuid.uuid4(),
        name=body.name,
        description=body.description,
        snapshot_at=now,
        cards_payload=cards_payload,
        relations_payload=relations_payload,
        diagrams_payload=diagrams_payload,
        created_by=user.id,
    )
    db.add(snapshot)
    await db.commit()
    await db.refresh(snapshot)
    return _snapshot_out(snapshot)


@router.delete("/snapshots/{snapshot_id}")
async def delete_snapshot(
    snapshot_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    await PermissionService.require_permission(db, user, "rwf.approve")

    result = await db.execute(select(EaSnapshot).where(EaSnapshot.id == snapshot_id))
    snapshot = result.scalar_one_or_none()
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Snapshot not found")

    await db.delete(snapshot)
    await db.commit()
    return {"ok": True}


@router.get("/snapshots/{snapshot_id}/diff")
async def get_snapshot_diff(
    snapshot_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Compare stored snapshot payload against current live state using deepdiff."""
    await PermissionService.require_permission(db, user, "rwf.view")

    result = await db.execute(select(EaSnapshot).where(EaSnapshot.id == snapshot_id))
    snapshot = result.scalar_one_or_none()
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Snapshot not found")

    from deepdiff import DeepDiff  # noqa: PLC0415

    # Build keyed dicts for efficient comparison
    snap_cards = {c["id"]: c for c in (snapshot.cards_payload or [])}
    snap_rels = {r["id"]: r for r in (snapshot.relations_payload or [])}
    snap_diags = {d["id"]: d for d in (snapshot.diagrams_payload or [])}

    # Current live state
    cur_cards_result = await db.execute(select(Card))
    cur_cards = {str(c.id): _card_to_dict(c) for c in cur_cards_result.scalars().all()}

    cur_rels_result = await db.execute(select(Relation))
    cur_rels = {str(r.id): _relation_to_dict(r) for r in cur_rels_result.scalars().all()}

    cur_diags_result = await db.execute(select(Diagram))
    cur_diags = {str(d.id): _diagram_to_dict(d) for d in cur_diags_result.scalars().all()}

    snap_card_ids = set(snap_cards.keys())
    cur_card_ids = set(cur_cards.keys())

    cards_added = [cur_cards[cid] for cid in cur_card_ids - snap_card_ids]
    cards_removed = [snap_cards[cid] for cid in snap_card_ids - cur_card_ids]
    cards_modified = []
    for cid in snap_card_ids & cur_card_ids:
        diff = DeepDiff(snap_cards[cid], cur_cards[cid], ignore_order=True)
        if diff:
            cards_modified.append({"id": cid, "diff": diff.to_dict()})

    snap_rel_ids = set(snap_rels.keys())
    cur_rel_ids = set(cur_rels.keys())
    relations_added = [cur_rels[rid] for rid in cur_rel_ids - snap_rel_ids]
    relations_removed = [snap_rels[rid] for rid in snap_rel_ids - cur_rel_ids]

    snap_diag_ids = set(snap_diags.keys())
    cur_diag_ids = set(cur_diags.keys())
    diagrams_added = [cur_diags[did] for did in cur_diag_ids - snap_diag_ids]
    diagrams_removed = [snap_diags[did] for did in snap_diag_ids - cur_diag_ids]
    diagrams_modified = []
    for did in snap_diag_ids & cur_diag_ids:
        diff = DeepDiff(snap_diags[did], cur_diags[did], ignore_order=True)
        if diff:
            diagrams_modified.append({"id": did, "diff": diff.to_dict()})

    return {
        "snapshot_id": str(snapshot_id),
        "snapshot_name": snapshot.name,
        "snapshot_at": snapshot.snapshot_at.isoformat(),
        "cards_added": cards_added,
        "cards_removed": cards_removed,
        "cards_modified": cards_modified,
        "relations_added": relations_added,
        "relations_removed": relations_removed,
        "diagrams_added": diagrams_added,
        "diagrams_removed": diagrams_removed,
    }


# ---------------------------------------------------------------------------
# Serialisation helpers
# ---------------------------------------------------------------------------


def _card_to_dict(c: Card) -> dict:
    return {
        "id": str(c.id),
        "type": c.type,
        "subtype": c.subtype,
        "name": c.name,
        "description": c.description,
        "parent_id": str(c.parent_id) if c.parent_id else None,
        "lifecycle": c.lifecycle,
        "attributes": c.attributes,
        "status": c.status,
        "approval_status": c.approval_status,
        "external_id": c.external_id,
        "alias": c.alias,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


def _relation_to_dict(r: Relation) -> dict:
    return {
        "id": str(r.id),
        "type": r.type,
        "source_id": str(r.source_id),
        "target_id": str(r.target_id),
        "attributes": r.attributes,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }


def _diagram_to_dict(d: Diagram) -> dict:
    return {
        "id": str(d.id),
        "name": d.name,
        "type": d.type,
        "data": d.data,
        "updated_at": d.updated_at.isoformat() if d.updated_at else None,
    }
