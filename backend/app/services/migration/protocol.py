"""Adapter contract for source-pluggable migration.

A ``MigrationSource`` represents one source platform (LeanIX today;
Ardoq / Mega HOPEX / BiZZdesign / Avolution Abacus on the future
roadmap). The staging service and HTTP routes are written against
this protocol — there is no LeanIX-specific code path above the
adapter layer.

Each adapter is a singleton registered in
:mod:`app.services.migration.registry` at module-import time. Adding
a new source platform means writing a new adapter class, mapping
tables, and parser, then importing the new module from
``app.services.migration.sources.__init__``.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Protocol, runtime_checkable

from app.services.migration.snapshot import MigrationSnapshot, SourceEntity


@runtime_checkable
class MigrationSource(Protocol):
    """Per-source-platform adapter consumed by the staging pipeline."""

    # ---- Identity ----
    key: str  # registry key, e.g. "leanix"
    label: str  # human-readable, e.g. "SAP LeanIX"
    accepted_extensions: tuple[str, ...]  # e.g. (".xlsx",)

    # ---- Parsing ----
    def validate_payload(self, head: bytes) -> bool:
        """Quick magic-byte / signature check on the uploaded file.

        Called by the upload route before the file is persisted. Implementations
        should look at the first 4-16 bytes and return whether this adapter can
        handle the payload — never raise.
        """
        ...

    def parse(self, path: str | Path) -> MigrationSnapshot:
        """Read the snapshot from disk and return a typed payload.

        Heavy work (XLSX parsing, XML parsing, …) happens here. Runs
        inside the parse-and-stage background task so it may block.
        """
        ...

    # ---- Mapping tables ----
    # Native-type → Turbo EA card-type key. ``None`` for unknown is
    # acceptable; unknown types surface as ``metamodel_type`` staged
    # rows so the admin can map them in preview.
    type_mapping: dict[str, str]

    # Native-relation-name → Turbo EA relation-type key. Same shape as
    # ``type_mapping`` — unknown relation types become
    # ``metamodel_relation_type`` staged rows.
    relation_mapping: dict[str, str]

    # Native relation types whose direction is the reverse of the Turbo
    # EA equivalent (LeanIX "X has successor Y" vs TEA "source succeeds
    # target"). Staging swaps the endpoints for any relation type in
    # this set.
    flip_direction: frozenset[str]

    # Native field-data-type string → Turbo EA ``fields_schema`` type.
    field_type_mapping: dict[str, str]

    # ---- Extension hooks ----
    def post_build_card_payload(
        self,
        entity: SourceEntity,
        target_type: str,
        payload: dict[str, Any],
    ) -> None:
        """Mutate a card-create payload with source-specific quirks.

        Called by the staging service after the generic
        ``build_card_payload`` has filled the standard columns. Use
        this to apply special-case mappings the type/relation tables
        can't express — e.g. LeanIX's ``UserGroup → Organization``
        edge needs ``subtype="team"`` plus a ``source_origin`` tag so
        the admin can re-classify it later. Most adapters can pass.
        """
        ...

    def map_subscription_role(
        self,
        role_name: str | None,
        role_type: str | None,
    ) -> str:
        """Translate a source-side stakeholder role to a Turbo EA role key.

        Falls back to ``"responsible"`` is the standard convention
        when the source role is unrecognised; OBSERVER-typed
        subscriptions usually fall back to ``"observer"``.
        """
        ...
