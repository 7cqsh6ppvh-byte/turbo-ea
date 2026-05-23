"""Helpers for opening / committing mutation batches around MCP write tools.

Every MCP write tool flows through these helpers so the audit log gets a
batch row, every event the underlying backend handler publishes is
stamped with the same ``batch_id``, and commits above the per-call
confirmation threshold (S3) must echo back the dry-run's
``confirm_token``.

Usage from a tool handler::

    async with mutation_batch(
        token, tool_name="create_cards_bulk",
        row_count=len(cards), dry_run=dry_run,
        confirm_token=confirm_token,
    ) as batch:
        client = batch.client()
        data = await client.post("/cards/bulk-create",
                                 json={"cards": cards, "dry_run": dry_run})
        batch.summary = {"rows": len(cards), "results": data.get("results", [])}
        # On block exit, the batch is committed with the summary.

The context manager guarantees:

- A batch row exists before any write — so events emitted by the
  underlying handler land with the right ``batch_id`` even if the
  request crashes mid-flight.
- On clean exit, the batch is committed (``committed_at`` stamped).
- On exception, the batch is closed with an error summary so the
  half-done state is still queryable via ``get_change_history``.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import Any

from turbo_ea_mcp.api_client import TurboEAClient


@dataclass
class BatchContext:
    """Mutable handle returned by :func:`mutation_batch`. The tool
    handler sets :attr:`summary` before the context manager exits so the
    commit call persists per-row outcomes."""

    token: str
    batch_id: str | None
    open_response: dict[str, Any]
    summary: dict[str, Any] | None = field(default=None)

    @property
    def confirm_token_issued(self) -> str | None:
        """Token surfaced by the open call — only present on dry-runs
        above the confirmation threshold. The agent must echo it back
        when calling the commit path."""
        return self.open_response.get("confirm_token")

    def client(self) -> TurboEAClient:
        """``TurboEAClient`` with the batch id pre-set so every backend
        write inside the context is stamped with the same id."""
        return TurboEAClient(self.token, batch_id=self.batch_id)


@asynccontextmanager
async def mutation_batch(
    token: str,
    *,
    tool_name: str,
    row_count: int,
    dry_run: bool,
    confirm_token: str | None = None,
):
    """Open a mutation batch, yield a :class:`BatchContext`, commit on exit.

    Args:
        token: Turbo EA JWT for backend calls.
        tool_name: The MCP tool that opened the batch (lands in the
            audit log so admins can filter MCP-driven writes by tool).
        row_count: Number of rows the wrapper intends to write. The
            backend uses this to decide whether to issue a
            ``confirm_token``.
        dry_run: Whether this batch is in preview mode. Dry-run batches
            are recorded but never committed (``committed_at`` stays
            null) so the agent has a stable handle to quote back.
        confirm_token: When the wrapper is committing a previously
            dry-run batch above the threshold, the token issued by that
            dry-run must be echoed back here.
    """
    # Use a fresh client for the open/commit calls — the batch id is
    # not yet known so no ``X-Turbo-EA-Batch`` header.
    bootstrap = TurboEAClient(token)
    open_payload = {"tool_name": tool_name, "dry_run": dry_run}
    open_resp = await bootstrap.post(
        f"/mutation-batches?row_count={row_count}", json=open_payload
    )
    batch_id = open_resp.get("id") if isinstance(open_resp, dict) else None
    ctx = BatchContext(token=token, batch_id=batch_id, open_response=open_resp)
    try:
        yield ctx
    except Exception as exc:  # noqa: BLE001 — surface the cause in audit
        # Best-effort close so a failed batch is still queryable. We
        # don't re-raise from the commit call; the original exception
        # is what the caller needs to see.
        try:
            await bootstrap.post(
                f"/mutation-batches/{batch_id}/commit",
                json={"summary": {"status": "errored", "error": str(exc)}},
            )
        except Exception:  # noqa: BLE001
            pass
        raise
    else:
        commit_body: dict[str, Any] = {"summary": ctx.summary or {"status": "ok"}}
        if confirm_token:
            commit_body["confirm_token"] = confirm_token
        await bootstrap.post(f"/mutation-batches/{batch_id}/commit", json=commit_body)
