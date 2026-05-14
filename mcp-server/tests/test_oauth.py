"""Unit tests for the MCP server OAuth module."""

from __future__ import annotations

import hashlib
import base64
import secrets
import time

import pytest

from turbo_ea_mcp.oauth import (
    OAuthStore,
    PendingAuth,
    AuthCode,
    TokenEntry,
    _verify_pkce,
    _estimate_jwt_expiry,
)


# ── PKCE verification ──────────────────────────────────────────────────────


class TestPKCE:
    def test_valid_pkce(self):
        """Valid PKCE S256 verifier matches challenge."""
        verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
        digest = hashlib.sha256(verifier.encode("ascii")).digest()
        challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
        assert _verify_pkce(verifier, challenge) is True

    def test_invalid_pkce(self):
        """Wrong verifier does not match challenge."""
        verifier = "correct-verifier"
        digest = hashlib.sha256(verifier.encode("ascii")).digest()
        challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
        assert _verify_pkce("wrong-verifier", challenge) is False

    def test_random_pkce_roundtrip(self):
        """Random verifier/challenge roundtrip works."""
        verifier = secrets.token_urlsafe(32)
        digest = hashlib.sha256(verifier.encode("ascii")).digest()
        challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
        assert _verify_pkce(verifier, challenge) is True


# ── JWT expiry estimation ───────────────────────────────────────────────────


class TestJwtExpiry:
    def test_estimate_valid_jwt(self):
        """Extracts exp from a valid JWT payload."""
        import json
        import base64

        header = base64.urlsafe_b64encode(b'{"alg":"HS256"}').rstrip(b"=").decode()
        exp = int(time.time()) + 3600
        payload = (
            base64.urlsafe_b64encode(
                json.dumps({"sub": "user-id", "exp": exp}).encode()
            )
            .rstrip(b"=")
            .decode()
        )
        sig = base64.urlsafe_b64encode(b"fake-signature").rstrip(b"=").decode()
        token = f"{header}.{payload}.{sig}"

        result = _estimate_jwt_expiry(token)
        assert result == float(exp)

    def test_estimate_invalid_token(self):
        """Returns fallback for invalid token."""
        result = _estimate_jwt_expiry("not-a-jwt")
        assert result > time.time()  # Should be in the future (fallback)


# ── OAuthStore ──────────────────────────────────────────────────────────────


class TestOAuthStore:
    def test_store_pending_auth(self):
        """Can store and retrieve pending auth."""
        store = OAuthStore()
        pending = PendingAuth(
            client_id="test-client",
            redirect_uri="http://localhost/callback",
            scope="mcp:read",
            state="original-state",
            code_challenge="challenge123",
            code_challenge_method="S256",
        )
        store.pending["state-key"] = pending
        assert store.pending["state-key"].client_id == "test-client"

    def test_store_auth_code(self):
        """Can store and retrieve auth code."""
        store = OAuthStore()
        code = AuthCode(
            code="test-code",
            client_id="test-client",
            redirect_uri="http://localhost/callback",
            scope="mcp:read",
            code_challenge="challenge123",
            turbo_jwt="fake-jwt",
        )
        store.codes["test-code"] = code
        assert store.codes["test-code"].turbo_jwt == "fake-jwt"

    def test_store_token_entry(self):
        """Can store and retrieve token entry."""
        store = OAuthStore()
        entry = TokenEntry(
            turbo_jwt="fake-jwt",
            turbo_jwt_exp=time.time() + 3600,
            refresh_token="refresh-123",
            scope="mcp:read",
        )
        store.tokens["access-123"] = entry
        store.refresh_tokens["refresh-123"] = "access-123"
        assert store.tokens["access-123"].turbo_jwt == "fake-jwt"
        assert store.refresh_tokens["refresh-123"] == "access-123"

    def test_cleanup_expired_pending(self):
        """Cleanup removes expired pending auths."""
        store = OAuthStore()
        store.pending["old"] = PendingAuth(
            client_id="c",
            redirect_uri="r",
            scope="s",
            state="st",
            code_challenge="ch",
            code_challenge_method="S256",
            created_at=time.time() - 700,  # Older than 600s AUTH_CODE_TTL
        )
        store.pending["fresh"] = PendingAuth(
            client_id="c",
            redirect_uri="r",
            scope="s",
            state="st",
            code_challenge="ch",
            code_challenge_method="S256",
            created_at=time.time(),
        )
        store.cleanup_expired()
        assert "old" not in store.pending
        assert "fresh" in store.pending

    def test_cleanup_expired_codes(self):
        """Cleanup removes expired auth codes."""
        store = OAuthStore()
        store.codes["old-code"] = AuthCode(
            code="old-code",
            client_id="c",
            redirect_uri="r",
            scope="s",
            code_challenge="ch",
            turbo_jwt="jwt",
            created_at=time.time() - 700,
        )
        store.codes["fresh-code"] = AuthCode(
            code="fresh-code",
            client_id="c",
            redirect_uri="r",
            scope="s",
            code_challenge="ch",
            turbo_jwt="jwt",
            created_at=time.time(),
        )
        store.cleanup_expired()
        assert "old-code" not in store.codes
        assert "fresh-code" in store.codes

    def test_code_one_time_use(self):
        """Auth codes can be marked as used."""
        store = OAuthStore()
        code = AuthCode(
            code="once",
            client_id="c",
            redirect_uri="r",
            scope="s",
            code_challenge="ch",
            turbo_jwt="jwt",
        )
        store.codes["once"] = code
        assert code.used is False
        code.used = True
        assert store.codes["once"].used is True
