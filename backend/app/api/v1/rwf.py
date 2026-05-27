"""Release Workflow (RWF) API — branch-based change governance.

All routes live under /rwf/*. Standard card/relation/diagram endpoints are
NOT modified. Branch data is only visible inside this namespace.
"""

from __future__ import annotations

import logging
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
from app.models.role import Role
from app.models.rwf import (
    EaSnapshot,
    RwfBranch,
    RwfBranchCardOverride,
    RwfBranchDiagramOverride,
    RwfBranchRelationOverride,
)
from app.models.user import User
from app.services import notification_service
from app.services.permission_service import PermissionService

logger = logging.getLogger(__name__)

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
        # Rollback audit — present only after the branch has been rolled back
        "rolled_back_by": str(b.rolled_back_by) if b.rolled_back_by else None,
        "rolled_back_at": b.rolled_back_at.isoformat() if b.rolled_back_at else None,
        # Whether a rollback is technically possible (snapshot available)
        "can_rollback": b.status == "merged" and b.pre_merge_snapshot is not None,
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


def _require_open_branch(branch: RwfBranch) -> None:
    """Raise 422 if the branch is not in 'open' status (writes require open)."""
    if branch.status != "open":
        raise HTTPException(
            status_code=422,
            detail=(f"Branch is '{branch.status}'. Only 'open' branches accept workspace edits."),
        )


async def _users_with_permission(db: AsyncSession, permission: str) -> list[User]:
    """Return all active users whose app-level role grants *permission*.

    Handles both the wildcard admin role (``{"*": true}``) and explicit
    per-permission grants (``{"rwf.approve": true}``).  Role data is read
    fresh — no 5-minute cache — to avoid stale results after recent changes.
    """
    roles_result = await db.execute(select(Role).where(Role.is_archived.is_(False)))
    qualifying_role_keys: set[str] = set()
    for role in roles_result.scalars().all():
        perms: dict = role.permissions or {}
        if perms.get("*") or perms.get(permission):
            qualifying_role_keys.add(role.key)

    if not qualifying_role_keys:
        return []

    users_result = await db.execute(
        select(User).where(
            User.role.in_(qualifying_role_keys),
            User.is_active.is_(True),
        )
    )
    return list(users_result.scalars().all())


async def _notify_approvers(
    db: AsyncSession,
    branch: RwfBranch,
    actor: User,
) -> None:
    """Notify all users with rwf.approve when a branch enters review."""
    approvers = await _users_with_permission(db, "rwf.approve")
    link = f"/rwf/branches/{branch.id}"
    for approver in approvers:
        try:
            await notification_service.create_notification(
                db,
                user_id=approver.id,
                notif_type="rwf_review_requested",
                title=f"Branch «{branch.name}» submitted for review",
                message=(
                    f"{actor.display_name} submitted this branch and it is ready for your review."
                ),
                link=link,
                data={"branch_id": str(branch.id), "branch_name": branch.name},
                actor_id=actor.id,
            )
        except Exception:  # noqa: BLE001
            logger.exception("RWF submit notification failed for user %s", approver.id)


async def _notify_branch_author(
    db: AsyncSession,
    branch: RwfBranch,
    actor: User,
    *,
    notif_type: str,
    title: str,
    message: str,
) -> None:
    """Notify the branch creator (approved / rejected / merged / rolled back)."""
    if not branch.created_by:
        return
    link = f"/rwf/branches/{branch.id}"
    try:
        await notification_service.create_notification(
            db,
            user_id=branch.created_by,
            notif_type=notif_type,
            title=title,
            message=message,
            link=link,
            data={"branch_id": str(branch.id), "branch_name": branch.name},
            actor_id=actor.id,
        )
    except Exception:  # noqa: BLE001
        logger.exception("RWF %s notification failed for branch %s", notif_type, branch.id)


async def _notify_branch_contributors(
    db: AsyncSession,
    branch: RwfBranch,
    actor: User,
    *,
    notif_type: str,
    title: str,
    message: str,
) -> None:
    """Notify the branch author + every user who wrote overrides (merge/rollback)."""
    # Collect all distinct user IDs who contributed overrides
    contributor_ids: set[uuid.UUID] = set()
    if branch.created_by:
        contributor_ids.add(branch.created_by)

    # Card override authors — we don't store contributor per override, so we
    # find the distinct created_by values from the branch metadata (created_by
    # is the branch owner; override writes don't carry a separate user FK in
    # the current schema). For now, notify the branch author only plus the
    # reviewer if different.
    if branch.reviewed_by:
        # Don't notify the reviewer about their own action
        pass

    link = f"/rwf/branches/{branch.id}"
    for uid in contributor_ids:
        try:
            await notification_service.create_notification(
                db,
                user_id=uid,
                notif_type=notif_type,
                title=title,
                message=message,
                link=link,
                data={"branch_id": str(branch.id), "branch_name": branch.name},
                actor_id=actor.id,
            )
        except Exception:  # noqa: BLE001
            logger.exception("RWF %s notification failed for user %s", notif_type, uid)


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
    await db.flush()
    # Notify all users with rwf.approve that a branch is awaiting review
    await _notify_approvers(db, branch, actor=user)
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
    await db.flush()
    # Notify the branch author that their branch was approved
    await _notify_branch_author(
        db,
        branch,
        actor=user,
        notif_type="rwf_branch_approved",
        title=f"Branch «{branch.name}» approved",
        message=(
            f"{user.display_name} approved your branch. It is now ready to be merged into main."
        ),
    )
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
    await db.flush()
    # Notify the branch author about the rejection (with optional comment)
    reject_msg = f"{user.display_name} rejected your branch."
    if body.comment:
        reject_msg += f" Reason: {body.comment[:300]}"
    await _notify_branch_author(
        db,
        branch,
        actor=user,
        notif_type="rwf_branch_rejected",
        title=f"Branch «{branch.name}» rejected",
        message=reject_msg,
    )
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

    from app.services.rwf_service import (
        card_to_dict,
        compute_field_diff,
        diagram_to_dict,
    )

    cards = []
    for o in card_overrides_result.scalars().all():
        conflicts: dict = {}
        if o.operation == "modified" and o.base_snapshot and o.card_id:
            # Fast guard: only run deepdiff if main has moved since branch was created
            card_result = await db.execute(select(Card).where(Card.id == o.card_id))
            main_card = card_result.scalar_one_or_none()
            if main_card and (
                main_card.updated_at is None or main_card.updated_at > branch.base_snapshot_at
            ):
                main_dict = card_to_dict(main_card)
                conflicts = compute_field_diff(o.base_snapshot, main_dict, o.draft)

        cards.append(
            {
                "override_id": str(o.id),
                "card_id": str(o.card_id) if o.card_id else None,
                "operation": o.operation,
                "draft": o.draft,
                "base_snapshot": o.base_snapshot,
                "has_conflicts": any(v == "conflict" for v in conflicts.values()),
                "conflicts": conflicts,
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
        diag_conflicts: dict = {}
        if o.operation == "modified" and o.base_snapshot and o.diagram_id:
            diag_result = await db.execute(select(Diagram).where(Diagram.id == o.diagram_id))
            main_diag = diag_result.scalar_one_or_none()
            if main_diag and (
                main_diag.updated_at is None or main_diag.updated_at > branch.base_snapshot_at
            ):
                main_dict = diagram_to_dict(main_diag)
                diag_conflicts = compute_field_diff(o.base_snapshot, main_dict, o.draft)

        diagrams.append(
            {
                "override_id": str(o.id),
                "diagram_id": str(o.diagram_id) if o.diagram_id else None,
                "operation": o.operation,
                "draft": o.draft,
                "base_snapshot": o.base_snapshot,
                "has_conflicts": any(v == "conflict" for v in diag_conflicts.values()),
                "conflicts": diag_conflicts,
            }
        )

    return {"cards": cards, "relations": relations, "diagrams": diagrams}


# ---------------------------------------------------------------------------
# Branches — merge and sync
# ---------------------------------------------------------------------------


class MergePayload(BaseModel):
    resolutions: dict = {}  # { override_id: { deepdiff_path: "main" | "branch" | value } }


@router.post("/branches/{branch_id}/merge")
async def merge_branch(
    branch_id: uuid.UUID,
    body: MergePayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Execute merge of all overrides into main tables in a single atomic transaction.

    Only callable on 'approved' branches. Requires rwf.approve.
    """
    from app.services.rwf_service import execute_merge

    await PermissionService.require_permission(db, user, "rwf.approve")
    branch = await _get_branch_or_404(db, branch_id)

    if branch.status != "approved":
        raise HTTPException(
            status_code=422,
            detail=(f"Branch is '{branch.status}'. Only 'approved' branches can be merged."),
        )

    try:
        stats = await execute_merge(db, branch, body.resolutions, user.id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # Notify the branch author (and any contributors) that the merge succeeded
    await _notify_branch_contributors(
        db,
        branch,
        actor=user,
        notif_type="rwf_branch_merged",
        title=f"Branch «{branch.name}» merged into main",
        message=(
            f"{user.display_name} merged your branch. All changes are now live in the EA landscape."
        ),
    )
    await db.commit()
    c, r, d = await _change_counts(db, branch.id)
    return {**_branch_out(branch, card_count=c, rel_count=r, diag_count=d), "merge_stats": stats}


@router.post("/branches/{branch_id}/rollback")
async def rollback_branch(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Roll back a merged branch, restoring all main-table records to their
    pre-merge state.

    - Only callable on branches with status='merged'.
    - Requires rwf.approve.
    - Branches merged before migration 099 (no pre_merge_snapshot) cannot be
      rolled back automatically — returns 422 with a clear explanation.
    - Idempotent protection: attempting to roll back a 'rolled_back' branch
      returns 422 so accidental double-rollback is blocked.
    """
    from app.services.rwf_service import execute_rollback

    await PermissionService.require_permission(db, user, "rwf.approve")
    branch = await _get_branch_or_404(db, branch_id)

    if branch.status == "rolled_back":
        raise HTTPException(
            status_code=422,
            detail="This branch has already been rolled back.",
        )
    if branch.status != "merged":
        raise HTTPException(
            status_code=422,
            detail=(f"Branch is '{branch.status}'. Only 'merged' branches can be rolled back."),
        )

    try:
        stats = await execute_rollback(db, branch, user.id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # Notify the branch author that the merge was rolled back
    await _notify_branch_contributors(
        db,
        branch,
        actor=user,
        notif_type="rwf_branch_rolled_back",
        title=f"Branch «{branch.name}» merge was rolled back",
        message=(
            f"{user.display_name} rolled back the merge of your branch. "
            "The EA landscape has been restored to its pre-merge state."
        ),
    )
    await db.commit()
    c, r, d = await _change_counts(db, branch.id)
    return {
        **_branch_out(branch, card_count=c, rel_count=r, diag_count=d),
        "rollback_stats": stats,
    }


class SyncPayload(BaseModel):
    resolutions: dict = {}


@router.post("/branches/{branch_id}/sync")
async def sync_branch(
    branch_id: uuid.UUID,
    body: SyncPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Pull main changes into branch (non-destructive). Returns conflict list if any."""
    from app.services.rwf_service import execute_sync

    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)
    _require_open_branch(branch)

    result = await execute_sync(db, branch, body.resolutions)
    await db.commit()
    return result


# ---------------------------------------------------------------------------
# Workspace — branch-scoped card reads and writes
# ---------------------------------------------------------------------------


@router.get("/branches/{branch_id}/cards")
async def branch_card_list(
    branch_id: uuid.UUID,
    page: int = 1,
    page_size: int = 100,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Return the branch-overlay card list (main + overrides applied)."""
    from app.services.rwf_service import get_branch_card_list

    await PermissionService.require_permission(db, user, "rwf.view")
    branch = await _get_branch_or_404(db, branch_id)
    return await get_branch_card_list(db, branch, page=page, page_size=page_size)


@router.get("/branches/{branch_id}/cards/{card_id}")
async def branch_card_detail(
    branch_id: uuid.UUID,
    card_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Return branch-scoped card detail (draft if override exists, else main)."""
    from app.services.rwf_service import get_branch_card

    await PermissionService.require_permission(db, user, "rwf.view")
    branch = await _get_branch_or_404(db, branch_id)
    card = await get_branch_card(db, branch, card_id)
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found in this branch")
    return card


class CardCreatePayload(BaseModel):
    name: str
    type: str
    subtype: str | None = None
    description: str | None = None
    attributes: dict | None = None
    lifecycle: dict | None = None


class CardPatchPayload(BaseModel):
    name: str | None = None
    description: str | None = None
    subtype: str | None = None
    attributes: dict | None = None
    lifecycle: dict | None = None


@router.post("/branches/{branch_id}/cards", status_code=201)
async def branch_card_create(
    branch_id: uuid.UUID,
    body: CardCreatePayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Create a card exclusively in the branch (main `cards` table untouched)."""
    from app.services.rwf_service import create_card_in_branch

    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)
    _require_open_branch(branch)

    payload = {
        "id": None,
        "name": body.name,
        "type": body.type,
        "subtype": body.subtype,
        "description": body.description,
        "attributes": body.attributes or {},
        "lifecycle": body.lifecycle or {},
        "status": "ACTIVE",
        "approval_status": "DRAFT",
    }
    result = await create_card_in_branch(db, branch, payload)
    await db.commit()
    return result


@router.patch("/branches/{branch_id}/cards/{card_id}")
async def branch_card_edit(
    branch_id: uuid.UUID,
    card_id: uuid.UUID,
    body: CardPatchPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Edit a card within the branch (copy-on-write; main table untouched)."""
    from app.services.rwf_service import edit_card_in_branch

    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)
    _require_open_branch(branch)

    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    result = await edit_card_in_branch(db, branch, card_id, patch)
    if result is None:
        raise HTTPException(status_code=404, detail="Card not found in this branch")
    await db.commit()
    return result


@router.delete("/branches/{branch_id}/cards/{card_id}")
async def branch_card_delete(
    branch_id: uuid.UUID,
    card_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Mark a main card as deleted in the branch (main table untouched)."""
    from app.services.rwf_service import delete_card_in_branch

    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)
    _require_open_branch(branch)

    ok = await delete_card_in_branch(db, branch, card_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Card not found")
    await db.commit()
    return {"ok": True}


@router.delete("/branches/{branch_id}/cards/override/{override_id}")
async def branch_card_override_delete(
    branch_id: uuid.UUID,
    override_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Remove a branch-created card override (no main row to touch)."""
    from app.services.rwf_service import delete_branch_created_card

    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)
    _require_open_branch(branch)

    ok = await delete_branch_created_card(db, branch, override_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Override not found")
    await db.commit()
    return {"ok": True}


# ---------------------------------------------------------------------------
# Workspace — branch-scoped relation reads and writes
# ---------------------------------------------------------------------------


@router.get("/branches/{branch_id}/relations")
async def branch_relation_list(
    branch_id: uuid.UUID,
    page: int = 1,
    page_size: int = 100,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Return branch-scoped relations (main + overrides applied)."""
    from app.services.rwf_service import get_branch_relations

    await PermissionService.require_permission(db, user, "rwf.view")
    branch = await _get_branch_or_404(db, branch_id)
    return await get_branch_relations(db, branch, page=page, page_size=page_size)


class RelationCreatePayload(BaseModel):
    type: str
    source_id: str
    target_id: str
    attributes: dict | None = None


@router.post("/branches/{branch_id}/relations", status_code=201)
async def branch_relation_create(
    branch_id: uuid.UUID,
    body: RelationCreatePayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Add a relation exclusively in the branch (main `relations` table untouched)."""
    from app.services.rwf_service import create_relation_in_branch

    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)
    _require_open_branch(branch)

    payload = {
        "id": None,
        "type": body.type,
        "source_id": body.source_id,
        "target_id": body.target_id,
        "attributes": body.attributes or {},
    }
    result = await create_relation_in_branch(db, branch, payload)
    await db.commit()
    return result


@router.delete("/branches/{branch_id}/relations/{relation_id}")
async def branch_relation_delete(
    branch_id: uuid.UUID,
    relation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Mark a main relation as deleted in the branch (main table untouched)."""
    from app.services.rwf_service import delete_relation_in_branch

    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)
    _require_open_branch(branch)

    ok = await delete_relation_in_branch(db, branch, relation_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Relation not found")
    await db.commit()
    return {"ok": True}


# ---------------------------------------------------------------------------
# Workspace — branch-scoped diagram reads and writes
# ---------------------------------------------------------------------------


@router.get("/branches/{branch_id}/diagrams/{diagram_id}")
async def branch_diagram_detail(
    branch_id: uuid.UUID,
    diagram_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Return branch-scoped diagram (draft if override exists, else main)."""
    from app.services.rwf_service import get_branch_diagram

    await PermissionService.require_permission(db, user, "rwf.view")
    branch = await _get_branch_or_404(db, branch_id)
    result = await get_branch_diagram(db, branch, diagram_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Diagram not found in this branch")
    return result


class DiagramPatchPayload(BaseModel):
    name: str | None = None
    data: dict | None = None


@router.patch("/branches/{branch_id}/diagrams/{diagram_id}")
async def branch_diagram_edit(
    branch_id: uuid.UUID,
    diagram_id: uuid.UUID,
    body: DiagramPatchPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    _: None = RwfEnabled,
):
    """Edit a diagram within the branch (copy-on-write; main table untouched)."""
    from app.services.rwf_service import edit_diagram_in_branch

    await PermissionService.require_permission(db, user, "rwf.contribute")
    branch = await _get_branch_or_404(db, branch_id)
    _require_open_branch(branch)

    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    result = await edit_diagram_in_branch(db, branch, diagram_id, patch)
    if result is None:
        raise HTTPException(status_code=404, detail="Diagram not found in this branch")
    await db.commit()
    return result


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
