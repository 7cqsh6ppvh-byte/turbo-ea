"""Tests for the UML 2.5 metamodel seed."""

from __future__ import annotations

from sqlalchemy import func, select

from app.models.card_type import CardType
from app.models.relation_type import RelationType
from app.plugins.uml.seed import PLUGIN_ID, seed_uml_metamodel


class TestUmlSeedCardTypes:
    async def test_seeds_all_element_types(self, db):
        result = await seed_uml_metamodel(db)
        assert result["card_types_created"] >= 50  # we have 59

    async def test_total_count(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(CardType.plugin_id == PLUGIN_ID)
        )
        assert result.scalar() == 59

    async def test_all_types_have_uml_prefix(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(select(CardType.key).where(CardType.plugin_id == PLUGIN_ID))
        keys = [row[0] for row in result.all()]
        assert all(k.startswith("uml_") for k in keys)

    async def test_all_types_have_uml_category_prefix(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(select(CardType.category).where(CardType.plugin_id == PLUGIN_ID))
        categories = [row[0] for row in result.all()]
        assert all(c.startswith("UML:") for c in categories)

    async def test_all_types_are_not_built_in(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(select(CardType).where(CardType.plugin_id == PLUGIN_ID))
        for ct in result.scalars().all():
            assert ct.built_in is False

    async def test_all_types_have_plugin_id(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(select(CardType).where(CardType.plugin_id == PLUGIN_ID))
        cts = result.scalars().all()
        assert all(ct.plugin_id == "uml" for ct in cts)

    async def test_class_category_has_7_types(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == PLUGIN_ID,
                CardType.category == "UML:Class",
            )
        )
        assert result.scalar() == 7

    async def test_component_category_has_9_types(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == PLUGIN_ID,
                CardType.category == "UML:Component",
            )
        )
        assert result.scalar() == 9

    async def test_package_category_has_5_types(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == PLUGIN_ID,
                CardType.category == "UML:Package",
            )
        )
        assert result.scalar() == 5

    async def test_usecase_category_has_3_types(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == PLUGIN_ID,
                CardType.category == "UML:UseCase",
            )
        )
        assert result.scalar() == 3

    async def test_activity_category_has_14_types(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == PLUGIN_ID,
                CardType.category == "UML:Activity",
            )
        )
        assert result.scalar() == 14

    async def test_statemachine_category_has_13_types(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == PLUGIN_ID,
                CardType.category == "UML:StateMachine",
            )
        )
        assert result.scalar() == 13

    async def test_sequence_category_has_4_types(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == PLUGIN_ID,
                CardType.category == "UML:Sequence",
            )
        )
        assert result.scalar() == 4

    async def test_common_category_has_4_types(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(
                CardType.plugin_id == PLUGIN_ID,
                CardType.category == "UML:Common",
            )
        )
        assert result.scalar() == 4

    async def test_all_types_have_translations(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(CardType.key, CardType.translations).where(CardType.plugin_id == PLUGIN_ID)
        )
        locales = ["de", "fr", "es", "it", "pt", "zh", "ru"]
        for key, translations in result.all():
            label_t = (translations or {}).get("label", {})
            for locale in locales:
                assert locale in label_t, f"{key} missing translation for {locale}"

    async def test_seed_is_idempotent(self, db):
        await seed_uml_metamodel(db)
        r2 = await seed_uml_metamodel(db)
        assert r2["card_types_created"] == 0
        assert r2["relation_types_created"] == 0

    async def test_idempotent_count_unchanged(self, db):
        await seed_uml_metamodel(db)
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(CardType.plugin_id == PLUGIN_ID)
        )
        assert result.scalar() == 59

    async def test_existing_core_types_unchanged(self, db):
        from app.services.seed import seed_metamodel

        await seed_metamodel(db)
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(CardType.key)).where(CardType.plugin_id.is_(None))
        )
        core_count = result.scalar()
        assert core_count >= 13, "Core card types should still exist"

    async def test_hierarchy_types_have_has_hierarchy_true(self, db):
        await seed_uml_metamodel(db)
        # uml_Package, uml_Model, uml_Component, uml_Node, uml_Device,
        # uml_ExecutionEnvironment, uml_Activity, uml_ActivityPartition,
        # uml_CompositeState, uml_Subject, uml_CombinedFragment should have has_hierarchy=True
        hierarchy_keys = [
            "uml_Package",
            "uml_Model",
            "uml_Component",
            "uml_Node",
            "uml_Device",
            "uml_ExecutionEnvironment",
            "uml_Activity",
            "uml_ActivityPartition",
            "uml_CompositeState",
            "uml_Subject",
            "uml_CombinedFragment",
        ]
        result = await db.execute(
            select(CardType.key, CardType.has_hierarchy).where(
                CardType.plugin_id == PLUGIN_ID,
                CardType.key.in_(hierarchy_keys),
            )
        )
        for key, has_h in result.all():
            assert has_h is True, f"{key} should have has_hierarchy=True"


class TestUmlSeedRelationTypes:
    async def test_seeds_31_relation_types(self, db):
        result = await seed_uml_metamodel(db)
        assert result["relation_types_created"] >= 25  # we have 31

    async def test_total_relation_count(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(RelationType.key)).where(RelationType.plugin_id == PLUGIN_ID)
        )
        assert result.scalar() == 31

    async def test_all_relation_types_have_plugin_id(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(select(RelationType).where(RelationType.plugin_id == PLUGIN_ID))
        rts = result.scalars().all()
        assert len(rts) >= 25
        assert all(rt.plugin_id == "uml" for rt in rts)

    async def test_all_relations_have_uml_rel_prefix(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(RelationType.key).where(RelationType.plugin_id == PLUGIN_ID)
        )
        keys = [row[0] for row in result.all()]
        assert all(k.startswith("uml_rel_") for k in keys)

    async def test_all_relations_not_built_in(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(select(RelationType).where(RelationType.plugin_id == PLUGIN_ID))
        for rt in result.scalars().all():
            assert rt.built_in is False

    async def test_key_relations_exist(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(RelationType.key).where(RelationType.plugin_id == PLUGIN_ID)
        )
        keys = {row[0] for row in result.all()}
        assert "uml_rel_Association" in keys
        assert "uml_rel_Generalization" in keys
        assert "uml_rel_Realization" in keys
        assert "uml_rel_Dependency" in keys
        assert "uml_rel_Composition" in keys
        assert "uml_rel_Include" in keys
        assert "uml_rel_Extend" in keys
        assert "uml_rel_Transition" in keys
        assert "uml_rel_MessageSync" in keys

    async def test_all_relations_have_translations(self, db):
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(RelationType.key, RelationType.translations).where(
                RelationType.plugin_id == PLUGIN_ID
            )
        )
        locales = ["de", "fr", "es", "it", "pt", "zh", "ru"]
        for key, translations in result.all():
            label_t = (translations or {}).get("label", {})
            for locale in locales:
                assert locale in label_t, f"Relation {key} missing translation for {locale}"

    async def test_relation_seed_is_idempotent(self, db):
        await seed_uml_metamodel(db)
        await seed_uml_metamodel(db)
        result = await db.execute(
            select(func.count(RelationType.key)).where(RelationType.plugin_id == PLUGIN_ID)
        )
        assert result.scalar() == 31
