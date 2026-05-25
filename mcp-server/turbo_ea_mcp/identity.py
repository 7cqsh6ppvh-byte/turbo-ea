"""Identity helpers for MCP tool handlers.

Tool handlers need to know two things about the caller:

1. The Turbo EA JWT to forward to the backend (handled by
   :mod:`turbo_ea_mcp.server._get_current_token`).
2. The SSO user behind the call — the ``sub`` claim of the JWT —
   for actor stamping on the audit log (S1).

The decoder here is intentionally tolerant: tools call
``get_actor_user_id(token)`` and fall back gracefully when the JWT
cannot be parsed. The backend remains the source of truth for
authorisation; the actor id surfaced here is only ever used for the
audit log, never for permission decisions.
"""

from __future__ import annotations

import base64
import json
import logging

logger = logging.getLogger(__name__)


def get_actor_user_id(token: str | None) -> str | None:
    """Return the ``sub`` claim from a Turbo EA JWT.

    Decodes the payload without verifying the signature — the backend
    validates the token on every call. We only need the ``sub`` so we
    can pass it through to ``POST /mutation-batches`` for audit-log
    attribution. Returns ``None`` for malformed tokens.
    """
    if not token:
        return None
    parts = token.split(".")
    if len(parts) != 3:
        return None
    payload = parts[1]
    # JWT base64url payloads omit padding; restore it so b64decode works.
    pad = "=" * (-len(payload) % 4)
    try:
        raw = base64.urlsafe_b64decode(payload + pad)
        claims = json.loads(raw)
    except (ValueError, json.JSONDecodeError):
        logger.debug("Could not decode JWT payload; actor id unavailable")
        return None
    sub = claims.get("sub")
    return str(sub) if sub else None
