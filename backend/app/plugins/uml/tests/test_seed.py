"""Tests for UML Diagrams plugin seed data."""

import pytest
from sqlalchemy import select

from app.models.card_type import CardType
from app.models.relation_type import RelationType
from app.plugins.uml.seed import seed_uml_types


async def test_seed_creates_6_uml_card_types(db):
    """Test that seeding creates 6 UML card types."""
    result = await seed_uml_types(db)
    assert result["card_types"] == 6

    # Verify card types were created
    stmt = select(CardType).where(CardType.notation == "UML")
    result = await db.execute(stmt)
    card_types = result.scalars().all()
    assert len(card_types) == 6

    keys = {ct.key for ct in card_types}
    expected_keys = {
        "uml_class",
        "uml_interface",
        "uml_abstract",
        "uml_component",
        "uml_package",
        "uml_actor",
    }
    assert keys == expected_keys


async def test_seed_creates_6_relation_types_with_arrows(db):
    """Test that seeding creates 6 UML relation types with arrows."""
    result = await seed_uml_types(db)
    assert result["relation_types"] == 6

    # Verify relation types were created
    stmt = select(RelationType).where(RelationType.key.like("uml_%"))
    result = await db.execute(stmt)
    relation_types = result.scalars().all()
    assert len(relation_types) == 6

    for rt in relation_types:
        assert rt.plantuml_arrow is not None
        assert len(rt.plantuml_arrow) > 0


async def test_seed_card_types_have_notation_UML(db):
    """Test that seeded UML card types have notation='UML'."""
    await seed_uml_types(db)

    stmt = select(CardType).where(CardType.notation == "UML")
    result = await db.execute(stmt)
    card_types = result.scalars().all()
    assert len(card_types) == 6

    for ct in card_types:
        assert ct.notation == "UML"


async def test_seed_is_idempotent(db):
    """Test that running seed twice doesn't create duplicates."""
    # Run seed first time
    result1 = await seed_uml_types(db)
    assert result1["card_types"] == 6
    assert result1["relation_types"] == 6

    # Run seed second time
    result2 = await seed_uml_types(db)
    assert result2["card_types"] == 0  # No new cards created
    assert result2["relation_types"] == 0  # No new relations created


async def test_existing_card_types_unaffected(db):
    """Test that existing card types are not modified by seeding."""
    # Create a non-UML card type first
    existing_ct = CardType(
        key="existing_type",
        name={"en": "Existing Type"},
        notation="EXISTING",
    )
    db.add(existing_ct)
    await db.commit()

    # Seed UML types
    await seed_uml_types(db)

    # Verify existing card type is unchanged
    stmt = select(CardType).where(CardType.key == "existing_type")
    result = await db.execute(stmt)
    existing_ct_after = result.scalar_one()
    assert existing_ct_after.notation == "EXISTING"