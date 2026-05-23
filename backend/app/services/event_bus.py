from __future__ import annotations

import asyncio
import json
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event

# Set by `OriginMiddleware` in `app.main` from the `X-Turbo-EA-Origin`
# request header. ``publish()`` reads this and stamps the event payload so
# admins can filter MCP-driven writes out of the audit log separately from
# web-UI actions. Unset (None) means a request without the header — typical
# web-UI or system-initiated event — and we omit the key entirely so the
# audit log stays clean for pre-existing rows.
request_origin: ContextVar[str | None] = ContextVar("request_origin", default=None)

# Set by the mutation-batch service when an MCP tool wrapper opens a batch
# at the start of a request. ``publish()`` stamps the batch id onto every
# event emitted during the request so ``GET /mutation-batches/{id}/events``
# can return the whole batch's audit trail in a single query — that is the
# foundation S6 (change history) and S7 (rollback) ride on.
request_batch_id: ContextVar[uuid.UUID | None] = ContextVar("request_batch_id", default=None)


class EventBus:
    def __init__(self) -> None:
        self._subscribers: list[asyncio.Queue] = []

    async def publish(
        self,
        event_type: str,
        data: dict[str, Any],
        db: AsyncSession | None = None,
        card_id: uuid.UUID | None = None,
        user_id: uuid.UUID | None = None,
        batch_id: uuid.UUID | None = None,
    ) -> None:
        origin = request_origin.get()
        if origin and "origin" not in data:
            # Stamp into the JSONB payload so downstream queries (the
            # /events endpoint, the per-card history timeline, the SSE
            # stream) all see the origin without a schema change.
            data = {**data, "origin": origin}
        effective_batch_id = batch_id if batch_id is not None else request_batch_id.get()
        if db:
            event = Event(
                card_id=card_id,
                user_id=user_id,
                event_type=event_type,
                data=data,
                batch_id=effective_batch_id,
            )
            db.add(event)
            await db.flush()

        message = {
            "event": event_type,
            "data": data,
            "card_id": str(card_id) if card_id else None,
            "batch_id": str(effective_batch_id) if effective_batch_id else None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        dead: list[asyncio.Queue] = []
        for q in self._subscribers:
            try:
                q.put_nowait(message)
            except asyncio.QueueFull:
                dead.append(q)
        for q in dead:
            self._subscribers.remove(q)

    async def subscribe(self) -> AsyncGenerator[str, None]:
        q: asyncio.Queue = asyncio.Queue(maxsize=256)
        self._subscribers.append(q)
        try:
            while True:
                msg = await q.get()
                yield f"data: {json.dumps(msg, default=str)}\n\n"
        finally:
            if q in self._subscribers:
                self._subscribers.remove(q)


event_bus = EventBus()
