"""Seed data for UML Diagrams plugin.

Creates UML-specific card types and relation types.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card_type import CardType
from app.models.relation_type import RelationType


UML_CARD_TYPES = [
    {
        "key": "uml_class",
        "name": {"en": "UML Class", "de": "UML-Klasse"},
        "notation": "UML",
        "plantuml_keyword": "class",
        "plantuml_color": "#lightblue",
    },
    {
        "key": "uml_interface",
        "name": {"en": "UML Interface", "de": "UML-Schnittstelle"},
        "notation": "UML",
        "plantuml_keyword": "interface",
        "plantuml_stereotype": "«interface»",
        "plantuml_color": "#lightyellow",
    },
    {
        "key": "uml_abstract",
        "name": {"en": "UML Abstract Class", "de": "UML-Abstrakte Klasse"},
        "notation": "UML",
        "plantuml_keyword": "class",
        "plantuml_stereotype": "«abstract»",
        "plantuml_color": "#lightblue",
    },
    {
        "key": "uml_component",
        "name": {"en": "UML Component", "de": "UML-Komponente"},
        "notation": "UML",
        "plantuml_keyword": "component",
        "plantuml_color": "#lightgreen",
    },
    {
        "key": "uml_package",
        "name": {"en": "UML Package", "de": "UML-Paket"},
        "notation": "UML",
        "plantuml_keyword": "package",
        "plantuml_color": "#lightgrey",
    },
    {
        "key": "uml_actor",
        "name": {"en": "UML Actor", "de": "UML-Akteur"},
        "notation": "UML",
        "plantuml_keyword": "actor",
        "plantuml_color": "#palegreen",
    },
]

UML_RELATION_TYPES = [
    {"key": "uml_inherits", "name": {"en": "Inherits", "de": "Vererbt"}, "plantuml_arrow": "<|--"},
    {"key": "uml_implements", "name": {"en": "Implements", "de": "Implementiert"}, "plantuml_arrow": "<|.."},
    {"key": "uml_associates", "name": {"en": "Associates", "de": "Assoziiert"}, "plantuml_arrow": "-->"},
    {"key": "uml_depends", "name": {"en": "Depends", "de": "Hängt ab"}, "plantuml_arrow": "..>"},
    {"key": "uml_uses", "name": {"en": "Uses", "de": "Verwendet"}, "plantuml_arrow": "..>"},
    {"key": "uml_composes", "name": {"en": "Composes", "de": "Komponiert"}, "plantuml_arrow": "o--"},
]


async def seed_uml_types(session: AsyncSession) -> dict[str, int]:
    """Seed UML card types and relation types.

    Returns count of created items.
    """
    card_count = 0
    rel_count = 0

    # Seed card types
    for ct_data in UML_CARD_TYPES:
        result = await session.execute(select(CardType).where(CardType.key == ct_data["key"]))
        if result.scalar_one_or_none() is None:
            ct = CardType(
                key=ct_data["key"],
                name=ct_data["name"],
                notation=ct_data["notation"],
                plantuml_keyword=ct_data.get("plantuml_keyword"),
                plantuml_stereotype=ct_data.get("plantuml_stereotype"),
                plantuml_color=ct_data.get("plantuml_color"),
            )
            session.add(ct)
            card_count += 1

    # Seed relation types
    for rt_data in UML_RELATION_TYPES:
        result = await session.execute(select(RelationType).where(RelationType.key == rt_data["key"]))
        if result.scalar_one_or_none() is None:
            rt = RelationType(
                key=rt_data["key"],
                name=rt_data["name"],
                plantuml_arrow=rt_data.get("plantuml_arrow"),
            )
            session.add(rt)
            rel_count += 1

    if card_count > 0 or rel_count > 0:
        await session.commit()

    return {"card_types": card_count, "relation_types": rel_count}