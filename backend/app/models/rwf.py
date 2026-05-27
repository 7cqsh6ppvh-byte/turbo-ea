from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class RwfBranch(UUIDMixin, Base):
    __tablename__ = "rwf_branches"

    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="open")
    base_snapshot_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class EaSnapshot(UUIDMixin, Base):
    __tablename__ = "ea_snapshots"

    name: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    snapshot_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    cards_payload: Mapped[list[Any]] = mapped_column(JSONB, nullable=False, default=list)
    relations_payload: Mapped[list[Any]] = mapped_column(JSONB, nullable=False, default=list)
    diagrams_payload: Mapped[list[Any]] = mapped_column(JSONB, nullable=False, default=list)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class RwfBranchCardOverride(UUIDMixin, Base):
    __tablename__ = "rwf_branch_card_overrides"

    branch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("rwf_branches.id", ondelete="CASCADE"), nullable=False
    )
    card_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cards.id", ondelete="CASCADE"), nullable=True
    )
    # 'modified' | 'created' | 'deleted'
    operation: Mapped[str] = mapped_column(Text, nullable=False)
    base_snapshot: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    draft: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class RwfBranchRelationOverride(UUIDMixin, Base):
    __tablename__ = "rwf_branch_relation_overrides"

    branch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("rwf_branches.id", ondelete="CASCADE"), nullable=False
    )
    relation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("relations.id", ondelete="CASCADE"), nullable=True
    )
    # 'created' | 'deleted'
    operation: Mapped[str] = mapped_column(Text, nullable=False)
    draft: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class RwfBranchDiagramOverride(UUIDMixin, Base):
    __tablename__ = "rwf_branch_diagram_overrides"

    branch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("rwf_branches.id", ondelete="CASCADE"), nullable=False
    )
    diagram_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("diagrams.id", ondelete="CASCADE"), nullable=True
    )
    # 'modified' | 'created' | 'deleted'
    operation: Mapped[str] = mapped_column(Text, nullable=False)
    base_snapshot: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    draft: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
