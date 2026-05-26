"""Tests for the ArchiMate metamodel seed service."""

from __future__ import annotations

from sqlalchemy import func, select

from app.models.card_type import CardType
from app.models.relation_type import RelationType
from app.plugins.archimate.seed import seed_archimate_metamodel


class TestArchiMateSeedCardTypes:
    async def test_seeds_all_61_element_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(CardType.plugin_id == "archimate")
        )
        assert result.scalar() == 61

    async def test_all_types_are_not_built_in(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(select(CardType).where(CardType.plugin_id == "archimate"))
        for ct in result.scalars().all():
            assert ct.built_in is False

    async def test_business_layer_has_13_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == "archimate",
                CardType.category == "Business",
            )
        )
        assert result.scalar() == 13

    async def test_application_layer_has_9_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == "archimate",
                CardType.category == "Application",
            )
        )
        assert result.scalar() == 9

    async def test_technology_layer_has_13_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == "archimate",
                CardType.category == "Technology",
            )
        )
        assert result.scalar() == 13

    async def test_motivation_layer_has_10_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == "archimate",
                CardType.category == "Motivation",
            )
        )
        assert result.scalar() == 10

    async def test_strategy_layer_has_4_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == "archimate",
                CardType.category == "Strategy",
            )
        )
        assert result.scalar() == 4

    async def test_implementation_layer_has_5_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == "archimate",
                CardType.category == "Implementation",
            )
        )
        assert result.scalar() == 5

    async def test_physical_layer_has_4_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == "archimate",
                CardType.category == "Physical",
            )
        )
        assert result.scalar() == 4

    async def test_composite_layer_has_3_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == "archimate",
                CardType.category == "Composite",
            )
        )
        assert result.scalar() == 3

    async def test_all_types_have_translations(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(CardType.key, CardType.translations).where(CardType.plugin_id == "archimate")
        )
        locales = ["de", "fr", "es", "it", "pt", "zh", "ru"]
        for key, translations in result.all():
            label_t = (translations or {}).get("label", {})
            for locale in locales:
                assert locale in label_t, f"{key} missing translation for {locale}"

    async def test_existing_core_types_unchanged(self, db):
        from app.services.seed import seed_metamodel

        await seed_metamodel(db)
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(CardType.plugin_id.is_(None))
        )
        core_count = result.scalar()
        assert core_count >= 11, "Core card types (minus ArchiMate conflicts) should still exist"


class TestArchiMateSeedRelationTypes:
    async def test_seeds_11_relation_types(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(func.count(RelationType.key)).where(RelationType.plugin_id == "archimate")
        )
        assert result.scalar() == 11

    async def test_key_relations_exist(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(RelationType.key).where(RelationType.plugin_id == "archimate")
        )
        keys = {row[0] for row in result.all()}
        assert "Composition" in keys
        assert "Assignment" in keys
        assert "Serving" in keys

    async def test_all_relations_have_translations(self, db):
        await seed_archimate_metamodel(db)
        result = await db.execute(
            select(RelationType.key, RelationType.translations).where(
                RelationType.plugin_id == "archimate"
            )
        )
        locales = ["de", "fr", "es", "it", "pt", "zh", "ru"]
        for key, translations in result.all():
            label_t = (translations or {}).get("label", {})
            for locale in locales:
                assert locale in label_t, f"Relation {key} missing translation for {locale}"

    async def test_seed_is_idempotent(self, db):
        await seed_archimate_metamodel(db)
        await seed_archimate_metamodel(db)
        card_result = await db.execute(
            select(func.count(CardType.key)).where(CardType.plugin_id == "archimate")
        )
        assert card_result.scalar() == 61
        rel_result = await db.execute(
            select(func.count(RelationType.key)).where(RelationType.plugin_id == "archimate")
        )
        assert rel_result.scalar() == 11

    async def test_removes_core_types_on_key_conflict(self, db):
        """Core types with plugin_id IS NULL that share a key with ArchiMate are removed."""
        # Create a core card type with a conflicting key (BusinessActor is in ArchiMate set)
        core_type = CardType(
            key="BusinessActor",
            label="Custom Business Actor",
            category="Custom",
            icon="person",
            color="#123456",
            plugin_id=None,
            built_in=True,
            is_hidden=False,
            has_hierarchy=False,
            sort_order=0,
            fields_schema=[],
            subtypes=[],
            translations={},
        )
        db.add(core_type)
        await db.flush()

        # Seed ArchiMate metamodel
        await seed_archimate_metamodel(db)

        # Verify core type was removed
        result = await db.execute(
            select(CardType).where(CardType.key == "BusinessActor", CardType.plugin_id.is_(None))
        )
        assert result.scalar_one_or_none() is None, "Core type should be removed on conflict"

        # Verify ArchiMate version was inserted
        result = await db.execute(
            select(CardType).where(
                CardType.key == "BusinessActor", CardType.plugin_id == "archimate"
            )
        )
        arch_type = result.scalar_one_or_none()
        assert arch_type is not None, "ArchiMate type should be inserted"
        assert arch_type.label == "Business Actor"

    async def test_removes_core_relation_types_on_key_conflict(self, db):
        """Core relation types with plugin_id IS NULL that share key with ArchiMate are removed."""
        # Create a core relation type with a conflicting key (Composition is in ArchiMate set)
        core_rel = RelationType(
            key="Composition",
            label="Custom Composition",
            reverse_label="Custom Composed by",
            source_type_key="BusinessActor",
            target_type_key="BusinessActor",
            plugin_id=None,
            built_in=True,
            is_hidden=False,
            cardinality="n:m",
            translations={},
        )
        db.add(core_rel)
        await db.flush()

        # Seed ArchiMate metamodel
        await seed_archimate_metamodel(db)

        # Verify core relation type was removed
        result = await db.execute(
            select(RelationType).where(
                RelationType.key == "Composition", RelationType.plugin_id.is_(None)
            )
        )
        assert result.scalar_one_or_none() is None, (
            "Core relation type should be removed on conflict"
        )

        # Verify ArchiMate version was inserted
        result = await db.execute(
            select(RelationType).where(
                RelationType.key == "Composition", RelationType.plugin_id == "archimate"
            )
        )
        arch_rel = result.scalar_one_or_none()
        assert arch_rel is not None, "ArchiMate relation type should be inserted"
        assert arch_rel.label == "Composition"
