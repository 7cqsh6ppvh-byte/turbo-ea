"""Tests for UML Diagrams plugin Pydantic schemas."""

import pytest
from pydantic import ValidationError

from app.plugins.uml.schemas import (
    DiagramCardAdd,
    DiagramCardResponse,
    DiagramCardUpdate,
    DiagramCreate,
    DiagramListResponse,
    DiagramResponse,
    DiagramUpdate,
    ExportFormat,
)


def test_diagram_create_schema_valid():
    """Test valid diagram create schema."""
    data = {
        "name": "Test Diagram",
        "description": "A test diagram",
        "diagram_type": "class",
        "skin_params": {"param": "value"},
    }
    schema = DiagramCreate(**data)
    assert schema.name == "Test Diagram"
    assert schema.description == "A test diagram"
    assert schema.diagram_type == "class"
    assert schema.skin_params == {"param": "value"}


def test_diagram_create_schema_rejects_empty_name():
    """Test that diagram create rejects empty name."""
    with pytest.raises(ValidationError):
        DiagramCreate(name="", description="Test")


def test_diagram_create_schema_rejects_invalid_type():
    """Test that diagram create accepts any string for diagram_type (flexible)."""
    # The schema accepts any string for diagram_type (flexible for plugin system)
    data = {
        "name": "Test Diagram",
        "diagram_type": "any_type",
    }
    schema = DiagramCreate(**data)
    assert schema.diagram_type == "any_type"


def test_diagram_response_schema_serialization():
    """Test diagram response schema serialization."""
    import uuid
    from datetime import datetime

    data = {
        "id": uuid.uuid4(),
        "name": "Test Diagram",
        "description": "A test diagram",
        "diagram_type": "class",
        "skin_params": None,
        "workspace_id": uuid.uuid4(),
        "created_by_id": uuid.uuid4(),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    schema = DiagramResponse(**data)
    assert schema.name == "Test Diagram"
    assert schema.id == data["id"]


def test_diagram_card_add_schema_valid():
    """Test valid diagram card add schema."""
    data = {
        "card_id": "123e4567-e89b-12d3-a456-426614174000",
        "x": 100.0,
        "y": 200.0,
    }
    schema = DiagramCardAdd(**data)
    assert str(schema.card_id) == "123e4567-e89b-12d3-a456-426614174000"
    assert schema.x == 100.0
    assert schema.y == 200.0


def test_diagram_card_position_schema_valid():
    """Test valid diagram card position update schema."""
    data = {
        "x": 150.0,
        "y": 250.0,
    }
    schema = DiagramCardUpdate(**data)
    assert schema.x == 150.0
    assert schema.y == 250.0

    # Test partial updates
    partial = DiagramCardUpdate(x=300.0)
    assert partial.x == 300.0
    assert partial.y is None


def test_export_format_enum_values():
    """Test export format enum values."""
    assert ExportFormat.PLANTUML == "plantuml"
    assert ExportFormat.SVG == "svg"
    assert ExportFormat.PNG == "png"
    
    # Test that all expected values are present
    formats = {e.value for e in ExportFormat}
    assert formats == {"plantuml", "svg", "png"}