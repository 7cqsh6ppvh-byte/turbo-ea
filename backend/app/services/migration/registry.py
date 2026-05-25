"""Process-wide registry of platform migration source adapters.

Each :class:`~app.services.migration.protocol.MigrationSource`
implementation calls :func:`register_source` at module-import time;
the upload route reads from :data:`SOURCES` to populate the picker and
dispatch parsing to the right adapter.

Tests that register fake sources should snapshot/restore the dict via
a fixture so registration changes don't leak across the suite — see
``tests/services/test_migration_protocol.py``.
"""

from __future__ import annotations

from app.services.migration.protocol import MigrationSource

SOURCES: dict[str, MigrationSource] = {}


def register_source(source: MigrationSource) -> None:
    """Register a source adapter under its ``key``.

    Idempotent: re-registering the same key replaces the existing
    entry (handy in tests that monkey-patch adapter behaviour).
    """
    SOURCES[source.key] = source


def get_source(key: str) -> MigrationSource:
    """Resolve a source adapter by key, or raise ``KeyError``.

    The HTTP layer catches the ``KeyError`` and returns 400; never
    catch it inside the staging or apply pipeline (an unknown source
    at that point is a bug, not a user error).
    """
    if key not in SOURCES:
        raise KeyError(f"Unknown migration source {key!r}. Known sources: {sorted(SOURCES)}")
    return SOURCES[key]
