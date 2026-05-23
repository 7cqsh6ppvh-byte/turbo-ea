"""Unit tests for mutation-batch helpers that need no database."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from app.services.mutation_batch_service import (
    CONFIRM_TOKEN_TTL,
    issue_confirm_token,
    verify_confirm_token,
)


def _fake_batch(token: str | None, age: timedelta = timedelta(seconds=0)):
    return SimpleNamespace(
        confirm_token=token,
        created_at=datetime.now(timezone.utc) - age,
    )


def test_issue_confirm_token_is_random_and_long_enough():
    a = issue_confirm_token()
    b = issue_confirm_token()
    assert a != b
    assert len(a) >= 16


def test_verify_rejects_missing_token():
    batch = _fake_batch(token="x" * 24)
    assert verify_confirm_token(batch, "") is False


def test_verify_rejects_when_batch_has_no_token():
    batch = _fake_batch(token=None)
    assert verify_confirm_token(batch, "anything") is False


def test_verify_rejects_mismatched_token():
    batch = _fake_batch(token="real-token")
    assert verify_confirm_token(batch, "wrong-token") is False


def test_verify_accepts_matching_fresh_token():
    token = issue_confirm_token()
    batch = _fake_batch(token=token)
    assert verify_confirm_token(batch, token) is True


def test_verify_rejects_expired_token():
    token = issue_confirm_token()
    # 1 second past the TTL → reject
    batch = _fake_batch(token=token, age=CONFIRM_TOKEN_TTL + timedelta(seconds=1))
    assert verify_confirm_token(batch, token) is False
