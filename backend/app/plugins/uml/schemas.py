"""Pydantic schemas for UML Diagrams plugin."""

from __future__ import annotations

import uuid
from enum import Enum

from pydantic import BaseModel, Field


class DiagramType(str):
    """Valid diagram types."""
    CLASS = "class"
    COMPONENT = "component"
    DEPLOYMENT = "deployment"
    USE_CASE = "use_case"
    SEQUENCE = "sequence"
    ACTIVITY = "activity"
    STATE = "state"


class ExportFormat(str, Enum):
    """Supported export formats."""
    PLANTUML = "plantuml"
    SVG = "svg"
    PNG = "png"


# Diagram Create/Update schemas
class DiagramCreate(BaseModel):
    """Schema for creating a diagram."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    diagram_type: str = Field(default="class")
    skin_params: dict | None = None


class DiagramUpdate(BaseModel):
    """Schema for updating a diagram."""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    diagram_type: str | None = None
    skin_params: dict | None = None


class DiagramResponse(BaseModel):
    """Schema for diagram response."""
    id: uuid.UUID
    name: str
    description: str | None = None
    diagram_type: str
    skin_params: dict | None = None
    workspace_id: uuid.UUID
    created_by_id: uuid.UUID
    created_at: str
    updated_at: str


class DiagramListResponse(BaseModel):
    """Schema for list of diagrams."""
    items: list[DiagramResponse]
    total: int
    page: int = 1
    page_size: int = 50


# Diagram Card schemas
class DiagramCardAdd(BaseModel):
    """Schema for adding a card to a diagram."""
    card_id: uuid.UUID
    x: float = 0.0
    y: float = 0.0


class DiagramCardUpdate(BaseModel):
    """Schema for updating card position on diagram."""
    x: float | None = None
    y: float | None = None


class DiagramCardResponse(BaseModel):
    """Schema for diagram card response."""
    diagram_id: uuid.UUID
    card_id: uuid.UUID
    x: float
    y: float
    card_name: str | None = None
    card_type: str | None = None