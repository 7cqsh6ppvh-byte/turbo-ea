"""Platform-migration service package.

Splits the importer into a parser-agnostic core (``snapshot``,
``staging``, ``apply``) and a per-source adapter layer
(``sources/<key>/...``). Adding a new source platform means writing a
new adapter under ``sources/`` that implements
:class:`~app.services.migration.protocol.MigrationSource` — the
existing pipeline picks it up via the
:data:`~app.services.migration.registry.SOURCES` registry without
schema, route, or UI changes.
"""

from __future__ import annotations

# Import the bundled source adapters so module import side-effects
# populate the SOURCES registry. Adding a new built-in source means
# adding one import line under app.services.migration.sources.
from app.services.migration import sources as _sources  # noqa: F401
from app.services.migration.protocol import MigrationSource
from app.services.migration.registry import SOURCES, get_source, register_source
from app.services.migration.snapshot import (
    Comment,
    Document,
    MetamodelField,
    MetamodelRelationType,
    MetamodelType,
    MigrationSnapshot,
    Relation,
    SourceEntity,
    Subscription,
    Tag,
    UserRef,
)

__all__ = [
    "Comment",
    "Document",
    "MetamodelField",
    "MetamodelRelationType",
    "MetamodelType",
    "MigrationSnapshot",
    "MigrationSource",
    "Relation",
    "SOURCES",
    "SourceEntity",
    "Subscription",
    "Tag",
    "UserRef",
    "get_source",
    "register_source",
]
