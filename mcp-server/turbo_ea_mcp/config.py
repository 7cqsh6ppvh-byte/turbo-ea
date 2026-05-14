"""Configuration from environment variables."""

from __future__ import annotations

import os
from pathlib import Path


def _read_version() -> str:
    """Read the app version from the VERSION file."""
    for candidate in (
        Path(__file__).resolve().parent.parent / "VERSION",
        Path("VERSION"),
    ):
        if candidate.is_file():
            return candidate.read_text().strip()
    return "0.0.0"


# Internal backend URL (Docker: http://backend:8000)
TURBO_EA_URL: str = os.environ.get("TURBO_EA_URL", "http://localhost:8000")

# Public URL of the Turbo EA instance (used for OAuth redirect URIs)
TURBO_EA_PUBLIC_URL: str = os.environ.get(
    "TURBO_EA_PUBLIC_URL", "http://localhost:8920"
)

# Port for the MCP server
MCP_PORT: int = int(os.environ.get("MCP_PORT", "8001"))

# MCP server public base URL (for OAuth metadata)
MCP_PUBLIC_URL: str = os.environ.get("MCP_PUBLIC_URL", f"http://localhost:{MCP_PORT}")

APP_VERSION: str = _read_version()
