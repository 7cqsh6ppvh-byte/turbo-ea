"""Reverse the writes performed under a mutation batch (S7).

A rollback walks the events emitted under a ``batch_id`` in reverse
order and applies the inverse of each one. We never delete history —
the rollback is itself recorded as a *new* batch that references the
original via ``summary.reverses_batch_id`` so the audit log shows the
full causal chain.

Inverse operations supported today:

- ``card.created`` → hard delete the card (and clean up its relations).
- ``card.updated`` → restore the ``old`` value of every changed field
  from ``event.data.changes``.
- ``card.archived`` → restore (sets ``archived_at = NULL``).
- ``relation.upserted`` / ``relation.created`` → delete the relation.

Conflict detection: for every entity the batch touched, we scan
``events.batch_id`` for *any later* batch that modified it. When such a
later batch exists and ``force=False``, the rollback refuses with a
structured list of conflicting batches so the caller can decide
whether to force or rebase manually. ``force=True`` accepts the data
loss and proceeds.

What is *not* yet supported is intentional: ADR / risk / SoAW / comment
/ stakeholder rollback. Those handlers don't yet publish a structured
``before`` snapshot we can replay. The rollback plan surfaces them in
``unsupported_events`` so the caller knows the inverse-op coverage
before committing the rollback.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card import Card
from app.models.event import Event
from app.models.mutation_batch import MutationBatch
from app.models.relation import Relation
from app.services.event_bus import event_bus
from app.services.mutation_batch_service import batch_to_dict, create_batch

# Event types the rollback engine knows how to reverse. Anything else
# lands in the dry-run plan's ``unsupported_events`` list so the caller
# knows exactly what will not be touched.
_SUPPORTED_EVENT_TYPES = {
    "card.created",
    "card.updated",
    "card.archived",
    "card.restored",
    "relation.created",
    "relation.upserted",
}


async def _entities_touched(events: list[Event]) -> dict[str, set[str]]:
    """Group entity ids by kind so we can scan for later batches that
    touched them. We use the event ``data.id`` where present, falling
    back to ``event.card_id`` for card-scoped events."""
    by_kind: dict[str, set[str]] = {"card": set(), "relation": set()}
    for ev in events:
        data = ev.data or {}
        ent_id = data.get("id") or (str(ev.card_id) if ev.card_id else None)
        if not ent_id:
            continue
        if ev.event_type.startswith("card."):
            by_kind["card"].add(ent_id)
        elif ev.event_type.startswith("relation."):
            by_kind["relation"].add(ent_id)
    return by_kind


async def _find_conflicting_batches(
    db: AsyncSession, batch: MutationBatch, events: list[Event]
) -> list[dict[str, Any]]:
    """Return every batch whose events touch one of *our* entities and
    that landed strictly after the batch under rollback."""
    touched = await _entities_touched(events)
    if not any(touched.values()):
        return []
    q = (
        select(Event, MutationBatch)
        .join(MutationBatch, Event.batch_id == MutationBatch.id)
        .where(Event.batch_id != batch.id)
        .where(MutationBatch.created_at > batch.created_at)
    )
    rows = (await db.execute(q)).all()
    conflicts: dict[uuid.UUID, dict[str, Any]] = {}
    for ev, other in rows:
        data = ev.data or {}
        ent_id = data.get("id") or (str(ev.card_id) if ev.card_id else None)
        if not ent_id:
            continue
        kind = "card" if ev.event_type.startswith("card.") else "relation"
        if ent_id in touched.get(kind, set()):
            conflicts.setdefault(
                other.id,
                {
                    "batch_id": str(other.id),
                    "tool_name": other.tool_name,
                    "created_at": other.created_at.isoformat(),
                    "touched_entities": set(),
                },
            )
            conflicts[other.id]["touched_entities"].add(ent_id)
    # Convert sets to sorted lists for JSON serialisation.
    return [{**c, "touched_entities": sorted(c["touched_entities"])} for c in conflicts.values()]


def _plan_inverse(event: Event) -> dict[str, Any]:
    """Return the inverse-op dict for a single event, or a marker dict
    when the event type isn't yet covered."""
    et = event.event_type
    data = event.data or {}
    if et == "card.created":
        return {
            "event_id": str(event.id),
            "op": "delete_card",
            "card_id": data.get("id") or (str(event.card_id) if event.card_id else None),
        }
    if et == "card.archived":
        return {
            "event_id": str(event.id),
            "op": "restore_card",
            "card_id": data.get("id") or (str(event.card_id) if event.card_id else None),
        }
    if et == "card.restored":
        return {
            "event_id": str(event.id),
            "op": "archive_card",
            "card_id": data.get("id") or (str(event.card_id) if event.card_id else None),
        }
    if et == "card.updated":
        changes = data.get("changes") or {}
        return {
            "event_id": str(event.id),
            "op": "restore_card_fields",
            "card_id": data.get("id") or (str(event.card_id) if event.card_id else None),
            "fields": {k: v.get("old") for k, v in changes.items()},
        }
    if et in {"relation.created", "relation.upserted"}:
        return {
            "event_id": str(event.id),
            "op": "delete_relation",
            "relation_id": data.get("id"),
        }
    return {
        "event_id": str(event.id),
        "op": "unsupported",
        "event_type": et,
        "reason": (
            f"{et} cannot be reversed automatically yet — the originating "
            "handler does not publish a structured snapshot the rollback "
            "engine can replay."
        ),
    }


async def _apply_inverse(db: AsyncSession, op: dict[str, Any]) -> dict[str, Any]:
    """Execute a single inverse op. Returns a per-op result dict for the
    rollback batch's summary."""
    kind = op["op"]
    if kind == "delete_card":
        cid = op.get("card_id")
        if cid:
            card = (
                await db.execute(select(Card).where(Card.id == uuid.UUID(cid)))
            ).scalar_one_or_none()
            if card is None:
                return {**op, "status": "skipped", "reason": "already_deleted"}
            await db.delete(card)
            return {**op, "status": "ok"}
        return {**op, "status": "skipped", "reason": "missing_card_id"}
    if kind == "restore_card":
        # Inverse of ``card.archived`` — bring the card back. Archive
        # sets both ``status="ARCHIVED"`` and ``archived_at``; we have
        # to flip both back, otherwise the UI's status column still
        # reads "Archived" even though ``archived_at`` is null.
        cid = op.get("card_id")
        if cid:
            card = (
                await db.execute(select(Card).where(Card.id == uuid.UUID(cid)))
            ).scalar_one_or_none()
            if card is None:
                return {**op, "status": "skipped", "reason": "card_not_found"}
            card.archived_at = None
            card.status = "ACTIVE"
            return {**op, "status": "ok"}
        return {**op, "status": "skipped", "reason": "missing_card_id"}
    if kind == "archive_card":
        # Inverse of ``card.restored`` — re-archive. Restore set
        # ``status="ACTIVE"`` and cleared ``archived_at``; we re-stamp
        # both so the card actually disappears from the active
        # inventory views again.
        cid = op.get("card_id")
        if cid:
            card = (
                await db.execute(select(Card).where(Card.id == uuid.UUID(cid)))
            ).scalar_one_or_none()
            if card is None:
                return {**op, "status": "skipped", "reason": "card_not_found"}
            card.archived_at = datetime.now(timezone.utc)
            card.status = "ARCHIVED"
            return {**op, "status": "ok"}
        return {**op, "status": "skipped", "reason": "missing_card_id"}
    if kind == "restore_card_fields":
        cid = op.get("card_id")
        fields = op.get("fields") or {}
        if not cid:
            return {**op, "status": "skipped", "reason": "missing_card_id"}
        card = (
            await db.execute(select(Card).where(Card.id == uuid.UUID(cid)))
        ).scalar_one_or_none()
        if card is None:
            return {**op, "status": "skipped", "reason": "card_not_found"}
        # The "old" snapshot in the event payload was already serialised
        # for JSON (UUIDs as strings, dicts intact). Re-coerce parent_id
        # back to UUID; everything else is set verbatim.
        for k, v in fields.items():
            if k == "parent_id" and v:
                v = uuid.UUID(v)
            setattr(card, k, v)
        return {**op, "status": "ok"}
    if kind == "delete_relation":
        rid = op.get("relation_id")
        if rid:
            rel = (
                await db.execute(select(Relation).where(Relation.id == uuid.UUID(rid)))
            ).scalar_one_or_none()
            if rel is None:
                return {**op, "status": "skipped", "reason": "already_deleted"}
            await db.delete(rel)
            return {**op, "status": "ok"}
        return {**op, "status": "skipped", "reason": "missing_relation_id"}
    return {**op, "status": "skipped", "reason": "unsupported"}


async def plan_rollback(db: AsyncSession, batch: MutationBatch) -> dict[str, Any]:
    """Build the inverse-op plan for ``batch`` without applying anything."""
    events = list(
        (
            await db.execute(
                select(Event).where(Event.batch_id == batch.id).order_by(Event.created_at.desc())
            )
        )
        .scalars()
        .all()
    )
    plan = [_plan_inverse(ev) for ev in events]
    unsupported = [op for op in plan if op["op"] == "unsupported"]
    supported = [op for op in plan if op["op"] != "unsupported"]
    return {
        "batch": batch_to_dict(batch),
        "operations": supported,
        "unsupported_events": unsupported,
        "event_count": len(events),
    }


async def execute_rollback(
    db: AsyncSession,
    batch: MutationBatch,
    user_id: uuid.UUID,
    *,
    force: bool = False,
) -> dict[str, Any]:
    """Apply the inverse of ``batch``. Records the rollback as a new
    batch so the audit log shows the causal chain."""
    events = list(
        (
            await db.execute(
                select(Event).where(Event.batch_id == batch.id).order_by(Event.created_at.desc())
            )
        )
        .scalars()
        .all()
    )

    conflicts = await _find_conflicting_batches(db, batch, events)
    if conflicts and not force:
        raise HTTPException(
            status_code=409,
            detail={
                "error": "rollback_conflict",
                "message": (
                    "The batch you are trying to roll back was followed by "
                    "other batches that modified the same entities. Pass "
                    "force=true to override and accept the data loss."
                ),
                "conflicting_batches": conflicts,
            },
        )

    # Open the rollback's own batch row first so the events we emit
    # while reverting are themselves stamped with a batch id. The
    # origin follows the caller's request (web / api / mcp) — not
    # always MCP — so the audit log reflects who actually triggered
    # the reversal.
    from app.models.user import User
    from app.services.event_bus import request_origin

    actor = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    rollback_batch = await create_batch(
        db,
        tool_name="rollback_batch",
        actor=actor,
        origin=request_origin.get() or "api",
        dry_run=False,
    )

    results: list[dict[str, Any]] = []
    for ev in events:
        op = _plan_inverse(ev)
        if op["op"] == "unsupported":
            results.append(op)
            continue
        outcome = await _apply_inverse(db, op)
        results.append(outcome)
        await event_bus.publish(
            f"rollback.{op['op']}",
            {**op, "outcome": outcome.get("status")},
            db=db,
            batch_id=rollback_batch.id,
        )

    rollback_batch.committed_at = datetime.now(timezone.utc)
    rollback_batch.summary = {
        "reverses_batch_id": str(batch.id),
        "forced": force,
        "results": results,
    }
    await db.flush()
    return {
        "rollback_batch_id": str(rollback_batch.id),
        "reversed_batch_id": str(batch.id),
        "forced": force,
        "results": results,
    }
