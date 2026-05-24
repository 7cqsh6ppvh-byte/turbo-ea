"""SQLAlchemy models for UML Diagrams plugin."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.card import Card
    from app.models.user import User
    from app.models.workspace import Workspace


class UmlDiagram(Base, UUIDMixin, TimestampMixin):
    """A UML diagram containing cards on a canvas."""

    __tablename__ = "uml_diagrams"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    diagram_type: Mapped[str] = mapped_column(String(50), nullable=False, default="class")
    skin_params: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # Foreign keys
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=False
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # Relationships
    workspace: Mapped["Workspace"] = relationship("Workspace")
    created_by: Mapped["User"] = relationship("User")
    cards: Mapped[list["UmlDiagramCard"]] = relationship(
        "UmlDiagramCard", back_populates="diagram", cascade="all, delete-orphan"
    )


class UmlDiagramCard(Base, TimestampMixin):
    """Junction table linking a card to a UML diagram with position info."""

    __tablename__ = "uml_diagram_cards"

    diagram_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("uml_diagrams.id"), primary_key=True
    )
    card_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cards.id"), primary_key=True
    )

    # Position on canvas
    x: Mapped[float] = mapped_column(nullable=False, default=0.0)
    y: Mapped[float] = mapped_column(nullable=False, default=0.0)

    # Relationships
    diagram: Mapped["UmlDiagram"] = relationship("UmlDiagram", back_populates="cards")
    card: Mapped["Card"] = relationship("Card")