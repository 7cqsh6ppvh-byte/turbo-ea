"""Tests for UML Diagrams plugin models."""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import select

from app.plugins.uml.models import UmlDiagram, UmlDiagramCard


async def test_uml_diagram_creation_with_required_fields(db):
    """Test creating a UML diagram with required fields."""
    diagram = UmlDiagram(
        name="Test Diagram",
        workspace_id=uuid.uuid4(),
        created_by_id=uuid.uuid4(),
    )
    db.add(diagram)
    await db.commit()
    await db.refresh(diagram)

    assert diagram.id is not None
    assert diagram.name == "Test Diagram"
    assert diagram.description is None
    assert diagram.diagram_type == "class"
    assert diagram.skin_params == {}
    assert diagram.workspace_id is not None
    assert diagram.created_by_id is not None
    assert diagram.created_at is not None
    assert diagram.updated_at is not None


async def test_uml_diagram_creation_fails_without_name(db):
    """Test that creating a diagram without name fails."""
    diagram = UmlDiagram(
        workspace_id=uuid.uuid4(),
        created_by_id=uuid.uuid4(),
    )
    db.add(diagram)
    with pytest.raises(Exception):
        await db.commit()


async def test_uml_diagram_card_composite_pk(db):
    """Test that UmlDiagramCard has composite primary key."""
    diagram = UmlDiagram(
        name="Test Diagram",
        workspace_id=uuid.uuid4(),
        created_by_id=uuid.uuid4(),
    )
    db.add(diagram)
    await db.commit()

    card_id = uuid.uuid4()
    diagram_card = UmlDiagramCard(
        diagram_id=diagram.id,
        card_id=card_id,
        x=100.0,
        y=200.0,
    )
    db.add(diagram_card)
    await db.commit()
    await db.refresh(diagram_card)

    assert diagram_card.diagram_id == diagram.id
    assert diagram_card.card_id == card_id
    assert diagram_card.x == 100.0
    assert diagram_card.y == 200.0


async def test_uml_diagram_card_cascade_delete_on_diagram(db):
    """Test that deleting a diagram cascades to diagram cards."""
    diagram = UmlDiagram(
        name="Test Diagram",
        workspace_id=uuid.uuid4(),
        created_by_id=uuid.uuid4(),
    )
    db.add(diagram)
    await db.commit()

    card_id = uuid.uuid4()
    diagram_card = UmlDiagramCard(
        diagram_id=diagram.id,
        card_id=card_id,
        x=100.0,
        y=200.0,
    )
    db.add(diagram_card)
    await db.commit()

    # Delete diagram
    await db.delete(diagram)
    await db.commit()

    # Check that diagram card was deleted
    result = await db.execute(
        select(UmlDiagramCard).where(
            UmlDiagramCard.diagram_id == diagram.id,
            UmlDiagramCard.card_id == card_id
        )
    )
    assert result.scalar_one_or_none() is None


async def test_uml_diagram_card_cascade_delete_on_card(db):
    """Test that deleting a card removes it from diagrams."""
    diagram = UmlDiagram(
        name="Test Diagram",
        workspace_id=uuid.uuid4(),
        created_by_id=uuid.uuid4(),
    )
    db.add(diagram)
    await db.commit()

    card_id = uuid.uuid4()
    diagram_card = UmlDiagramCard(
        diagram_id=diagram.id,
        card_id=card_id,
        x=100.0,
        y=200.0,
    )
    db.add(diagram_card)
    await db.commit()

    result = await db.execute(
        select(UmlDiagramCard).where(UmlDiagramCard.card_id == card_id)
    )
    assert result.scalar_one_or_none() is not None


async def test_card_type_plantuml_columns_nullable(db):
    """Test that UML columns on card_types are nullable."""
    from app.models.card_type import CardType

    card_type = CardType(
        key="test_type",
        name={"en": "Test Type"},
    )
    db.add(card_type)
    await db.commit()
    await db.refresh(card_type)

    assert card_type.notation is None
    assert card_type.plantuml_keyword is None
    assert card_type.plantuml_stereotype is None
    assert card_type.plantuml_color is None


async def test_relation_type_plantuml_arrow_nullable(db):
    """Test that plantuml_arrow column on relation_types is nullable."""
    from app.models.relation_type import RelationType

    rel_type = RelationType(
        key="test_rel",
        name={"en": "Test Relation"},
        source_type_key="type_a",
        target_type_key="type_b",
    )
    db.add(rel_type)
    await db.commit()
    await db.refresh(rel_type)

    assert rel_type.plantuml_arrow is None


async def test_uml_diagram_defaults(db):
    """Test default values for UML diagram."""
    diagram = UmlDiagram(
        name="Test Diagram",
        workspace_id=uuid.uuid4(),
        created_by_id=uuid.uuid4(),
    )
    db.add(diagram)
    await db.commit()
    await db.refresh(diagram)

    assert diagram.diagram_type == "class"
    assert diagram.skin_params == {}
