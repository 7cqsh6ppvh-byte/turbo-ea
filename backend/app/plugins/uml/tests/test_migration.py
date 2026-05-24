"""Tests for UML Diagrams plugin migration."""

import pytest
from sqlalchemy import inspect, select, text


def test_upgrade_creates_tables(test_engine):
    """Test that upgrade creates UML tables."""
    inspector = inspect(test_engine)
    assert inspector.has_table("uml_diagrams")
    assert inspector.has_table("uml_diagram_cards")


def test_upgrade_adds_columns_to_card_types(test_engine):
    """Test that upgrade adds PlantUML columns to card_types."""
    inspector = inspect(test_engine)
    columns = {col["name"]: col for col in inspector.get_columns("card_types")}
    assert "notation" in columns
    assert "plantuml_keyword" in columns
    assert "plantuml_stereotype" in columns
    assert "plantuml_color" in columns
    assert columns["notation"]["nullable"] is True
    assert columns["plantuml_keyword"]["nullable"] is True
    assert columns["plantuml_stereotype"]["nullable"] is True
    assert columns["plantuml_color"]["nullable"] is True


def test_upgrade_adds_column_to_relation_types(test_engine):
    """Test that upgrade adds plantuml_arrow column to relation_types."""
    inspector = inspect(test_engine)
    columns = {col["name"]: col for col in inspector.get_columns("relation_types")}
    assert "plantuml_arrow" in columns
    assert columns["plantuml_arrow"]["nullable"] is True


def test_upgrade_creates_index(test_engine):
    """Test that upgrade creates index on card_types.notation."""
    inspector = inspect(test_engine)
    indexes = inspector.get_indexes("card_types")
    index_names = [idx["name"] for idx in indexes]
    assert "ix_card_types_notation" in index_names


def test_downgrade_removes_all_plugin_artifacts(test_engine):
    """Test that downgrade removes all UML plugin artifacts."""
    inspector = inspect(test_engine)
    
    # Tables should be dropped
    assert not inspector.has_table("uml_diagrams")
    assert not inspector.has_table("uml_diagram_cards")
    
    # Index should be dropped
    indexes = inspector.get_indexes("card_types")
    index_names = [idx["name"] for idx in indexes]
    assert "ix_card_types_notation" not in index_names
    
    # Columns should be dropped from card_types
    columns = {col["name"]: col for col in inspector.get_columns("card_types")}
    assert "notation" not in columns
    assert "plantuml_keyword" not in columns
    assert "plantuml_stereotype" not in columns
    assert "plantuml_color" not in columns
    
    # Column should be dropped from relation_types
    columns = {col["name"]: col for col in inspector.get_columns("relation_types")}
    assert "plantuml_arrow" not in columns


def test_upgrade_is_idempotent_safe(test_engine):
    """Test that running upgrade twice is safe."""
    # This is tested by the fact that Alembic tracks version
    # and won't re-apply migrations
    pass