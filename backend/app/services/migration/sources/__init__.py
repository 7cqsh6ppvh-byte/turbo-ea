"""Built-in source adapters.

Each subpackage registers itself with
:mod:`app.services.migration.registry` at import time. Adding a new
adapter is "create a new subpackage and add it to this file's
imports".
"""

from __future__ import annotations

from app.services.migration.sources import leanix  # noqa: F401

__all__ = ["leanix"]
