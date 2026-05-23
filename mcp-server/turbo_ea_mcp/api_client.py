"""HTTP client wrapper for the Turbo EA REST API."""

from __future__ import annotations

import httpx

from turbo_ea_mcp.config import TURBO_EA_URL


class TurboEAClient:
    """Thin wrapper around httpx for authenticated Turbo EA API calls."""

    def __init__(self, token: str, batch_id: str | None = None) -> None:
        self._token = token
        self._batch_id = batch_id
        self._base = TURBO_EA_URL.rstrip("/") + "/api/v1"

    def _headers(self) -> dict[str, str]:
        # `X-Turbo-EA-Origin` lets the backend tag emitted events with
        # ``origin: "mcp"`` so admins can filter MCP-driven writes out of
        # the audit log separately from web-UI actions.
        #
        # `X-Turbo-EA-Batch` (when present) carries the mutation-batch id
        # opened by the MCP tool wrapper. The backend's
        # ``capture_request_origin`` middleware mirrors it into the
        # ``request_batch_id`` contextvar so ``event_bus.publish`` stamps
        # every emitted event with the same id — that's how the change-
        # history endpoint can return a whole batch's audit trail in a
        # single query and how rollback knows which events to reverse.
        h = {
            "Authorization": f"Bearer {self._token}",
            "X-Turbo-EA-Origin": "mcp",
        }
        if self._batch_id:
            h["X-Turbo-EA-Batch"] = self._batch_id
        return h

    async def get(self, path: str, params: dict | None = None) -> dict | list:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{self._base}{path}",
                headers=self._headers(),
                params=params,
            )
            resp.raise_for_status()
            if resp.status_code == 204:
                return {}
            return resp.json()

    async def post(self, path: str, json: dict | None = None) -> dict | list:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self._base}{path}",
                headers=self._headers(),
                json=json,
            )
            resp.raise_for_status()
            if resp.status_code == 204:
                return {}
            return resp.json()

    async def put(self, path: str, json: dict | None = None) -> dict | list:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.put(
                f"{self._base}{path}",
                headers=self._headers(),
                json=json,
            )
            resp.raise_for_status()
            if resp.status_code == 204:
                return {}
            return resp.json()

    async def refresh_token(self) -> str | None:
        """Call POST /auth/refresh to get a new JWT. Returns the new token
        or None if the current token is expired/invalid."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self._base}/auth/refresh",
                headers=self._headers(),
            )
            if resp.status_code == 200:
                data = resp.json()
                new_token = data.get("access_token")
                if new_token:
                    self._token = new_token
                    return new_token
        return None


async def login(email: str, password: str) -> str:
    """Authenticate with email/password. Returns the JWT access token."""
    url = f"{TURBO_EA_URL}/api/v1/auth/login"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json={"email": email, "password": password})
            resp.raise_for_status()
            data = resp.json()
            token = data.get("access_token")
            if not token:
                raise ValueError("No access_token in login response")
            return token
    except httpx.ConnectError as exc:
        raise ConnectionError(
            f"Cannot connect to {TURBO_EA_URL} — is the server running and reachable "
            f"from this machine? (Detail: {exc})"
        ) from exc
    except httpx.TimeoutException as exc:
        raise ConnectionError(
            f"Connection to {TURBO_EA_URL} timed out after 10s. "
            f"Check the URL and network connectivity."
        ) from exc
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 401:
            raise ValueError("Login failed: invalid email or password.") from exc
        raise ValueError(
            f"Login failed: HTTP {exc.response.status_code} from {url}"
        ) from exc


async def get_sso_config() -> dict:
    """Fetch SSO configuration (public, no auth needed)."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{TURBO_EA_URL}/api/v1/auth/sso/config")
        resp.raise_for_status()
        return resp.json()


async def get_mcp_status() -> dict:
    """Fetch MCP status (public, no auth needed)."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{TURBO_EA_URL}/api/v1/settings/mcp/status")
        resp.raise_for_status()
        return resp.json()


async def exchange_sso_code(code: str, redirect_uri: str) -> dict:
    """Exchange an SSO authorization code for a Turbo EA JWT via the
    existing SSO callback endpoint."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"{TURBO_EA_URL}/api/v1/auth/sso/callback",
            json={"code": code, "redirect_uri": redirect_uri},
        )
        resp.raise_for_status()
        return resp.json()
