"""SAP LeanIX source adapter."""

from __future__ import annotations

from app.services.migration.registry import register_source
from app.services.migration.sources.leanix.adapter import LeanixSource

register_source(LeanixSource())

__all__ = ["LeanixSource"]
