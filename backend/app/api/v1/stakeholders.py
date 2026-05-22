from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.database import get_db
from app.models.card import Card
from app.models.card_type import CardType
from app.models.stakeholder import Stakeholder
from app.models.stakeholder_role_definition import StakeholderRoleDefinition
from app.models.user import User
from app.schemas.common import StakeholderCreate
from app.services.event_bus import event_bus
from app.services.permission_service import PermissionService

router = APIRouter(tags=["stakeholders"])

_DEFAULT_ROLES = [
    {"key": "responsible", "label": "Responsible"},
    {"key": "observer", "label": "Observer"},
]


async def _roles_for_type(db: AsyncSession, type_key: str) -> list[dict]:
    """Return active stakeholder roles from stakeholder_role_definitions table."""
    result = await db.execute(
        select(StakeholderRoleDefinition)
        .where(
            StakeholderRoleDefinition.card_type_key == type_key,
            StakeholderRoleDefinition.is_archived == False,  # noqa: E712
        )
        .order_by(StakeholderRoleDefinition.sort_order)
    )
    srds = result.scalars().all()
    if srds:
        return [
            {
                "key": s.key,
                "label": s.label,
                "color": s.color,
                "translations": s.translations or {},
            }
            for s in srds
        ]
    # Fallback to JSONB for backward compat during migration
    result = await db.execute(select(CardType.stakeholder_roles).where(CardType.key == type_key))
    roles = result.scalar_one_or_none()
    if roles:
        return roles
    return [
        {"key": "responsible", "label": "Responsible"},
        {"key": "observer", "label": "Observer"},
    ]


def _role_labels(roles: list[dict]) -> dict[str, str]:
    return {r["key"]: r["label"] for r in roles}


@router.get("/stakeholder-roles")
async def list_roles(
    type_key: str | None = Query(None, description="Filter roles by card type"),
    db: AsyncSession = Depends(get_db),
):
    """Return role definitions from stakeholder_role_definitions table."""
    if type_key:
        roles = await _roles_for_type(db, type_key)
        return [
            {
                "key": r["key"],
                "label": r["label"],
                "translations": r.get("translations", {}),
            }
            for r in roles
        ]

    # Return all unique active roles across all types
    result = await db.execute(
        select(
            StakeholderRoleDefinition.key,
            StakeholderRoleDefinition.label,
            StakeholderRoleDefinition.translations,
        )
        .where(StakeholderRoleDefinition.is_archived == False)  # noqa: E712
        .distinct(StakeholderRoleDefinition.key)
        .order_by(StakeholderRoleDefinition.key)
    )
    return [
        {
            "key": row[0],
            "label": row[1],
            "translations": row[2] or {},
        }
        for row in result.all()
    ]


@router.get("/cards/{card_id}/stakeholders")
async def list_stakeholders(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await PermissionService.require_permission(db, user, "stakeholders.view")
    card_result = await db.execute(select(Card.type).where(Card.id == uuid.UUID(card_id)))
    card_type_key = card_result.scalar_one_or_none()
    roles = await _roles_for_type(db, card_type_key) if card_type_key else _DEFAULT_ROLES
    labels = _role_labels(roles)

    result = await db.execute(
        select(Stakeholder)
        .options(selectinload(Stakeholder.user))
        .where(Stakeholder.card_id == uuid.UUID(card_id))
    )
    stakeholder_list = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "user_id": str(s.user_id),
            "user_display_name": s.user.display_name if s.user else None,
            "user_email": s.user.email if s.user else None,
            "role": s.role,
            "role_label": labels.get(s.role, s.role),
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in stakeholder_list
    ]


@router.post("/cards/{card_id}/stakeholders", status_code=201)
async def create_stakeholder(
    card_id: str,
    body: StakeholderCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    card_uuid = uuid.UUID(card_id)
    if not await PermissionService.check_permission(
        db, user, "stakeholders.manage", card_uuid, "card.manage_stakeholders"
    ):
        raise HTTPException(403, "Not enough permissions")
    card_result = await db.execute(select(Card.type).where(Card.id == card_uuid))
    card_type_key = card_result.scalar_one_or_none()
    if not card_type_key:
        raise HTTPException(404, "Card not found")

    roles = await _roles_for_type(db, card_type_key)
    valid_keys = {r["key"] for r in roles}
    if body.role not in valid_keys:
        raise HTTPException(
            400,
            f"Invalid role '{body.role}'. Valid for {card_type_key}: {sorted(valid_keys)}",
        )

    # Prevent duplicate role for same user on same card
    existing = await db.execute(
        select(Stakeholder).where(
            Stakeholder.card_id == uuid.UUID(card_id),
            Stakeholder.user_id == uuid.UUID(body.user_id),
            Stakeholder.role == body.role,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "User already has this role on this card")

    stakeholder = Stakeholder(
        card_id=uuid.UUID(card_id),
        user_id=uuid.UUID(body.user_id),
        role=body.role,
    )
    db.add(stakeholder)
    await db.flush()
    result = await db.execute(
        select(Stakeholder)
        .options(selectinload(Stakeholder.user))
        .where(Stakeholder.id == stakeholder.id)
    )
    stakeholder = result.scalar_one()

    labels = _role_labels(roles)
    role_label = labels.get(stakeholder.role, stakeholder.role)
    user_name = stakeholder.user.display_name if stakeholder.user else None
    await event_bus.publish(
        "stakeholder.added",
        {
            "stakeholder_id": str(stakeholder.id),
            "user_id": str(stakeholder.user_id),
            "user_display_name": user_name,
            "role": stakeholder.role,
            "role_label": role_label,
            "summary": (
                f"{user_name or stakeholder.user.email if stakeholder.user else 'User'}"
                f" · {role_label}"
            ),
        },
        db=db,
        card_id=uuid.UUID(card_id),
        user_id=user.id,
    )
    await db.commit()

    return {
        "id": str(stakeholder.id),
        "user_id": str(stakeholder.user_id),
        "user_display_name": user_name,
        "role": stakeholder.role,
        "role_label": role_label,
    }


@router.patch("/stakeholders/{stakeholder_id}")
async def update_stakeholder(
    stakeholder_id: str,
    body: StakeholderCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Stakeholder).where(Stakeholder.id == uuid.UUID(stakeholder_id))
    )
    stakeholder = result.scalar_one_or_none()
    if not stakeholder:
        raise HTTPException(404, "Stakeholder not found")
    if not await PermissionService.check_permission(
        db, user, "stakeholders.manage", stakeholder.card_id, "card.manage_stakeholders"
    ):
        raise HTTPException(403, "Not enough permissions")

    card_result = await db.execute(select(Card.type).where(Card.id == stakeholder.card_id))
    card_type_key = card_result.scalar_one_or_none()
    roles = await _roles_for_type(db, card_type_key) if card_type_key else _DEFAULT_ROLES
    valid_keys = {r["key"] for r in roles}
    if body.role not in valid_keys:
        raise HTTPException(400, f"Invalid role '{body.role}'. Valid: {sorted(valid_keys)}")

    labels = _role_labels(roles)
    old_role = stakeholder.role
    if old_role != body.role:
        # Pre-load user for the summary line.
        await db.refresh(stakeholder, attribute_names=["user"])
        user_name = stakeholder.user.display_name if stakeholder.user else None
        await event_bus.publish(
            "stakeholder.role_changed",
            {
                "stakeholder_id": str(stakeholder.id),
                "user_id": str(stakeholder.user_id),
                "user_display_name": user_name,
                "old_role": old_role,
                "old_role_label": labels.get(old_role, old_role),
                "new_role": body.role,
                "new_role_label": labels.get(body.role, body.role),
                "summary": (
                    f"{user_name or 'User'} · "
                    f"{labels.get(old_role, old_role)} → {labels.get(body.role, body.role)}"
                ),
            },
            db=db,
            card_id=stakeholder.card_id,
            user_id=user.id,
        )
        stakeholder.role = body.role

    await db.commit()

    return {
        "id": str(stakeholder.id),
        "user_id": str(stakeholder.user_id),
        "role": stakeholder.role,
        "role_label": labels.get(stakeholder.role, stakeholder.role),
    }


@router.get("/cards/{card_id}/me/observe")
async def get_my_observe_status(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return whether the current user is observing this card and whether the
    Observer role is available for the card type. Used by the one-click
    "Observe this card" toggle on the card detail page.
    """
    card_uuid = uuid.UUID(card_id)
    if not await PermissionService.check_permission(
        db, user, "inventory.view", card_uuid, "card.view"
    ):
        raise HTTPException(403, "Not enough permissions")
    card_result = await db.execute(select(Card.type).where(Card.id == card_uuid))
    card_type_key = card_result.scalar_one_or_none()
    if not card_type_key:
        raise HTTPException(404, "Card not found")

    roles = await _roles_for_type(db, card_type_key)
    observer_role_available = any(r["key"] == "observer" for r in roles)

    existing = await db.execute(
        select(Stakeholder.id).where(
            Stakeholder.card_id == card_uuid,
            Stakeholder.user_id == user.id,
            Stakeholder.role == "observer",
        )
    )
    is_observer = existing.scalar_one_or_none() is not None
    return {
        "is_observer": is_observer,
        "observer_role_available": observer_role_available,
    }


@router.post("/cards/{card_id}/me/observe", status_code=201)
async def add_me_as_observer(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """One-click self-assignment as Observer.

    Carve-out from the regular create-stakeholder flow: any user with view
    access on the card can add themselves as Observer, even without the
    `stakeholders.manage` permission. The route hardcodes `role="observer"`
    and `user_id=self`, so it cannot be used to promote anyone else or to
    assign any other role.

    Idempotent: a second call returns the existing row.
    """
    card_uuid = uuid.UUID(card_id)
    if not await PermissionService.check_permission(
        db, user, "inventory.view", card_uuid, "card.view"
    ):
        raise HTTPException(403, "Not enough permissions")
    card_result = await db.execute(select(Card.type).where(Card.id == card_uuid))
    card_type_key = card_result.scalar_one_or_none()
    if not card_type_key:
        raise HTTPException(404, "Card not found")

    roles = await _roles_for_type(db, card_type_key)
    if not any(r["key"] == "observer" for r in roles):
        raise HTTPException(
            409,
            detail={
                "code": "observer_role_unavailable",
                "message": "The Observer role is not defined for this card type.",
            },
        )

    existing_result = await db.execute(
        select(Stakeholder)
        .options(selectinload(Stakeholder.user))
        .where(
            Stakeholder.card_id == card_uuid,
            Stakeholder.user_id == user.id,
            Stakeholder.role == "observer",
        )
    )
    existing = existing_result.scalar_one_or_none()
    labels = _role_labels(roles)
    role_label = labels.get("observer", "Observer")
    if existing:
        return {
            "id": str(existing.id),
            "user_id": str(existing.user_id),
            "user_display_name": existing.user.display_name if existing.user else None,
            "role": existing.role,
            "role_label": role_label,
        }

    stakeholder = Stakeholder(card_id=card_uuid, user_id=user.id, role="observer")
    db.add(stakeholder)
    await db.flush()
    result = await db.execute(
        select(Stakeholder)
        .options(selectinload(Stakeholder.user))
        .where(Stakeholder.id == stakeholder.id)
    )
    stakeholder = result.scalar_one()
    user_name = stakeholder.user.display_name if stakeholder.user else None
    await event_bus.publish(
        "stakeholder.added",
        {
            "stakeholder_id": str(stakeholder.id),
            "user_id": str(stakeholder.user_id),
            "user_display_name": user_name,
            "role": stakeholder.role,
            "role_label": role_label,
            "summary": (
                f"{user_name or stakeholder.user.email if stakeholder.user else 'User'}"
                f" · {role_label}"
            ),
        },
        db=db,
        card_id=card_uuid,
        user_id=user.id,
    )
    await db.commit()
    return {
        "id": str(stakeholder.id),
        "user_id": str(stakeholder.user_id),
        "user_display_name": user_name,
        "role": stakeholder.role,
        "role_label": role_label,
    }


@router.delete("/cards/{card_id}/me/observe", status_code=204)
async def remove_me_as_observer(
    card_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """One-click removal of self-assigned Observer role.

    Idempotent: returns 204 even when no row existed. Does not require the
    Observer role to still be active on the card type — stale subscriptions
    must always be removable.
    """
    card_uuid = uuid.UUID(card_id)
    if not await PermissionService.check_permission(
        db, user, "inventory.view", card_uuid, "card.view"
    ):
        raise HTTPException(403, "Not enough permissions")
    card_result = await db.execute(select(Card.type).where(Card.id == card_uuid))
    card_type_key = card_result.scalar_one_or_none()
    if not card_type_key:
        raise HTTPException(404, "Card not found")

    result = await db.execute(
        select(Stakeholder)
        .options(selectinload(Stakeholder.user))
        .where(
            Stakeholder.card_id == card_uuid,
            Stakeholder.user_id == user.id,
            Stakeholder.role == "observer",
        )
    )
    stakeholder = result.scalar_one_or_none()
    if not stakeholder:
        return

    roles = await _roles_for_type(db, card_type_key)
    labels = _role_labels(roles)
    role_label = labels.get(stakeholder.role, stakeholder.role)
    user_name = stakeholder.user.display_name if stakeholder.user else None
    await event_bus.publish(
        "stakeholder.removed",
        {
            "stakeholder_id": str(stakeholder.id),
            "user_id": str(stakeholder.user_id),
            "user_display_name": user_name,
            "role": stakeholder.role,
            "role_label": role_label,
            "summary": f"{user_name or 'User'} · {role_label}",
        },
        db=db,
        card_id=card_uuid,
        user_id=user.id,
    )
    await db.delete(stakeholder)
    await db.commit()


@router.delete("/stakeholders/{stakeholder_id}", status_code=204)
async def delete_stakeholder(
    stakeholder_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Stakeholder).where(Stakeholder.id == uuid.UUID(stakeholder_id))
    )
    stakeholder = result.scalar_one_or_none()
    if not stakeholder:
        raise HTTPException(404, "Stakeholder not found")
    if not await PermissionService.check_permission(
        db, user, "stakeholders.manage", stakeholder.card_id, "card.manage_stakeholders"
    ):
        raise HTTPException(403, "Not enough permissions")

    # Capture context for the history event before the row is gone.
    await db.refresh(stakeholder, attribute_names=["user"])
    card_result = await db.execute(select(Card.type).where(Card.id == stakeholder.card_id))
    card_type_key = card_result.scalar_one_or_none()
    roles = await _roles_for_type(db, card_type_key) if card_type_key else _DEFAULT_ROLES
    labels = _role_labels(roles)
    user_name = stakeholder.user.display_name if stakeholder.user else None
    await event_bus.publish(
        "stakeholder.removed",
        {
            "stakeholder_id": str(stakeholder.id),
            "user_id": str(stakeholder.user_id),
            "user_display_name": user_name,
            "role": stakeholder.role,
            "role_label": labels.get(stakeholder.role, stakeholder.role),
            "summary": (
                f"{user_name or 'User'} · {labels.get(stakeholder.role, stakeholder.role)}"
            ),
        },
        db=db,
        card_id=stakeholder.card_id,
        user_id=user.id,
    )
    await db.delete(stakeholder)
    await db.commit()
