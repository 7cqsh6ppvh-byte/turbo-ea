"""ArchiMate Model Exchange File Format (AMEFF) support.

Implements export and import of ArchiMate models according to the Open Group
AMEFF specification. Reference:
  https://www.opengroup.org/open-group-archimate-model-exchange-file-format

Supports AMEFF 3.x (namespace: http://www.opengroup.org/xsd/archimate/3.0/).

Export: Cards with arch_* types + their relations → AMEFF XML
Import: AMEFF XML → arch_* cards + arch_rel_* relations

Credits: ArchiMate element/relation type definitions derived from bigArchiMate
by borkdominik (https://github.com/borkdominik/bigArchiMate), MIT License.
"""

from __future__ import annotations

import uuid
import xml.etree.ElementTree as ET
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

AMEFF_NS = "http://www.opengroup.org/xsd/archimate/3.0/"
XSI_NS = "http://www.w3.org/2001/XMLSchema-instance"
SCHEMA_LOCATION = (
    "http://www.opengroup.org/xsd/archimate/3.0/ "
    "http://www.opengroup.org/xsd/archimate/3.1/archimate3_Archimate.xsd"
)
AMEFF_VERSION = "3.2"

# Mapping from AMEFF xsi:type → arch_* card type key
_TYPE_TO_KEY: dict[str, str] = {
    "BusinessActor": "arch_BusinessActor",
    "BusinessRole": "arch_BusinessRole",
    "BusinessCollaboration": "arch_BusinessCollaboration",
    "BusinessInterface": "arch_BusinessInterface",
    "BusinessProcess": "arch_BusinessProcess",
    "BusinessFunction": "arch_BusinessFunction",
    "BusinessInteraction": "arch_BusinessInteraction",
    "BusinessEvent": "arch_BusinessEvent",
    "BusinessService": "arch_BusinessService",
    "BusinessObject": "arch_BusinessObject",
    "Contract": "arch_Contract",
    "Representation": "arch_Representation",
    "Product": "arch_Product",
    "ApplicationComponent": "arch_ApplicationComponent",
    "ApplicationCollaboration": "arch_ApplicationCollaboration",
    "ApplicationInterface": "arch_ApplicationInterface",
    "ApplicationProcess": "arch_ApplicationProcess",
    "ApplicationFunction": "arch_ApplicationFunction",
    "ApplicationInteraction": "arch_ApplicationInteraction",
    "ApplicationEvent": "arch_ApplicationEvent",
    "ApplicationService": "arch_ApplicationService",
    "DataObject": "arch_DataObject",
    "Node": "arch_Node",
    "Device": "arch_Device",
    "SystemSoftware": "arch_SystemSoftware",
    "TechnologyCollaboration": "arch_TechnologyCollaboration",
    "TechnologyInterface": "arch_TechnologyInterface",
    "TechnologyProcess": "arch_TechnologyProcess",
    "TechnologyFunction": "arch_TechnologyFunction",
    "TechnologyInteraction": "arch_TechnologyInteraction",
    "TechnologyEvent": "arch_TechnologyEvent",
    "TechnologyService": "arch_TechnologyService",
    "Path": "arch_Path",
    "CommunicationNetwork": "arch_CommunicationNetwork",
    "Artifact": "arch_Artifact",
    "Stakeholder": "arch_Stakeholder",
    "Driver": "arch_Driver",
    "Assessment": "arch_Assessment",
    "Goal": "arch_Goal",
    "Outcome": "arch_Outcome",
    "Principle": "arch_Principle",
    "Requirement": "arch_Requirement",
    "Constraint": "arch_Constraint",
    "Meaning": "arch_Meaning",
    "Value": "arch_Value",
    "Resource": "arch_Resource",
    "Capability": "arch_Capability",
    "ValueStream": "arch_ValueStream",
    "CourseOfAction": "arch_CourseOfAction",
    "WorkPackage": "arch_WorkPackage",
    "ImplementationEvent": "arch_ImplementationEvent",
    "Deliverable": "arch_Deliverable",
    "Gap": "arch_Gap",
    "Plateau": "arch_Plateau",
    "Equipment": "arch_Equipment",
    "Facility": "arch_Facility",
    "DistributionNetwork": "arch_DistributionNetwork",
    "Material": "arch_Material",
    "Grouping": "arch_Grouping",
    "Location": "arch_Location",
    "Junction": "arch_Junction",
}

# Reverse mapping: arch_* key → AMEFF xsi:type
_KEY_TO_TYPE: dict[str, str] = {v: k for k, v in _TYPE_TO_KEY.items()}

# Mapping from AMEFF relation type → arch_rel_* key
_REL_TYPE_TO_KEY: dict[str, str] = {
    "Association": "arch_rel_Association",
    "Composition": "arch_rel_Composition",
    "Aggregation": "arch_rel_Aggregation",
    "Realization": "arch_rel_Realization",
    "Assignment": "arch_rel_Assignment",
    "Serving": "arch_rel_Serving",
    "Access": "arch_rel_Access",
    "Influence": "arch_rel_Influence",
    "Triggering": "arch_rel_Triggering",
    "Flow": "arch_rel_Flow",
    "Specialization": "arch_rel_Specialization",
}

_REL_KEY_TO_TYPE: dict[str, str] = {v: k for k, v in _REL_TYPE_TO_KEY.items()}


def _ns(tag: str) -> str:
    return f"{{{AMEFF_NS}}}{tag}"


def _xsi(tag: str) -> str:
    return f"{{{XSI_NS}}}{tag}"


def _get_name(element: ET.Element, lang: str = "en") -> str | None:
    """Extract the name text for the given language (or first available)."""
    for name_el in element.findall(_ns("name")):
        if name_el.get("{http://www.w3.org/XML/1998/namespace}lang", "en") == lang:
            return name_el.text
    names = element.findall(_ns("name"))
    return names[0].text if names else None


def _get_documentation(element: ET.Element, lang: str = "en") -> str | None:
    for doc_el in element.findall(_ns("documentation")):
        if doc_el.get("{http://www.w3.org/XML/1998/namespace}lang", "en") == lang:
            return doc_el.text
    docs = element.findall(_ns("documentation"))
    return docs[0].text if docs else None


def parse_ameff_xml(xml_content: str) -> dict[str, Any]:
    """Parse AMEFF XML into a Python dict representation."""
    ET.register_namespace("", AMEFF_NS)
    ET.register_namespace("xsi", XSI_NS)

    root = ET.fromstring(xml_content)
    model_id = root.get("identifier", f"id-{uuid.uuid4()}")
    version = root.get("version", AMEFF_VERSION)
    name = _get_name(root) or "Unnamed Model"

    elements: list[dict] = []
    for el in root.findall(f"{_ns('elements')}/{_ns('element')}"):
        raw_type = el.get(_xsi("type"), "")
        identifier = el.get("identifier", "")
        el_name = _get_name(el) or ""
        description = _get_documentation(el)
        elements.append(
            {
                "identifier": identifier,
                "type": raw_type,
                "name": el_name,
                "description": description,
            }
        )

    relationships: list[dict] = []
    for rel in root.findall(f"{_ns('relationships')}/{_ns('relationship')}"):
        raw_type = rel.get(_xsi("type"), "")
        identifier = rel.get("identifier", "")
        source = rel.get("source", "")
        target = rel.get("target", "")
        rel_name = _get_name(rel)
        relationships.append(
            {
                "identifier": identifier,
                "type": raw_type,
                "source": source,
                "target": target,
                "name": rel_name,
            }
        )

    return {
        "identifier": model_id,
        "name": name,
        "version": version,
        "elements": elements,
        "relationships": relationships,
    }


def serialize_ameff_to_xml(model_data: dict[str, Any]) -> str:
    """Serialize a model dict to AMEFF XML string."""
    ET.register_namespace("", AMEFF_NS)
    ET.register_namespace("xsi", XSI_NS)
    ET.register_namespace("xml", "http://www.w3.org/XML/1998/namespace")

    model_id = model_data.get("identifier") or f"id-{uuid.uuid4()}"
    root = ET.Element(
        _ns("model"),
        attrib={
            _xsi("schemaLocation"): SCHEMA_LOCATION,
            "identifier": model_id,
            "version": model_data.get("version", AMEFF_VERSION),
        },
    )

    name_el = ET.SubElement(root, _ns("name"))
    name_el.set("{http://www.w3.org/XML/1998/namespace}lang", "en")
    name_el.text = model_data.get("name", "ArchiMate Model")

    elements_container = ET.SubElement(root, _ns("elements"))
    for e in model_data.get("elements", []):
        el = ET.SubElement(
            elements_container,
            _ns("element"),
            attrib={
                "identifier": e["identifier"],
                _xsi("type"): e["type"],
            },
        )
        name_tag = ET.SubElement(el, _ns("name"))
        name_tag.set("{http://www.w3.org/XML/1998/namespace}lang", "en")
        name_tag.text = e.get("name", "")
        if e.get("description"):
            doc_tag = ET.SubElement(el, _ns("documentation"))
            doc_tag.set("{http://www.w3.org/XML/1998/namespace}lang", "en")
            doc_tag.text = e["description"]

    relationships_container = ET.SubElement(root, _ns("relationships"))
    for r in model_data.get("relationships", []):
        rel = ET.SubElement(
            relationships_container,
            _ns("relationship"),
            attrib={
                "identifier": r["identifier"],
                _xsi("type"): r["type"],
                "source": r["source"],
                "target": r["target"],
            },
        )
        if r.get("name"):
            name_tag = ET.SubElement(rel, _ns("name"))
            name_tag.set("{http://www.w3.org/XML/1998/namespace}lang", "en")
            name_tag.text = r["name"]

    ET.indent(root, space="  ")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode")


async def export_model_to_ameff(
    db: AsyncSession,
    name: str = "ArchiMate Model",
    card_ids: list[str] | None = None,
) -> dict[str, Any]:
    """Export ArchiMate cards and relations from DB to AMEFF model dict.

    If card_ids is given, only those cards (and their interconnecting relations)
    are exported. Otherwise all arch_* cards are exported.
    """
    from app.models.card import Card
    from app.models.relation import Relation

    query = select(Card).where(Card.type.like("arch_%"))
    if card_ids:
        query = query.where(Card.id.in_(card_ids))
    result = await db.execute(query)
    cards = result.scalars().all()

    card_id_set = {str(c.id) for c in cards}

    rel_query = select(Relation).where(
        Relation.source_id.in_(card_id_set),
        Relation.target_id.in_(card_id_set),
        Relation.type.like("arch_rel_%"),
    )
    rel_result = await db.execute(rel_query)
    relations = rel_result.scalars().all()

    elements: list[dict] = []
    for card in cards:
        ameff_type = _KEY_TO_TYPE.get(card.type)
        if not ameff_type:
            continue
        ameff_id = (card.attributes or {}).get("ameff_identifier") or f"id-{card.id}"
        elements.append(
            {
                "identifier": ameff_id,
                "type": ameff_type,
                "name": card.name,
                "description": card.description or "",
            }
        )

    # Build identifier lookup for relations
    card_ameff_id: dict[str, str] = {}
    for card in cards:
        ameff_id = (card.attributes or {}).get("ameff_identifier") or f"id-{card.id}"
        card_ameff_id[str(card.id)] = ameff_id

    rel_list: list[dict] = []
    for rel in relations:
        ameff_type = _REL_KEY_TO_TYPE.get(rel.type)
        if not ameff_type:
            continue
        source_ameff = card_ameff_id.get(str(rel.source_id))
        target_ameff = card_ameff_id.get(str(rel.target_id))
        if not source_ameff or not target_ameff:
            continue
        rel_ameff_id = (rel.attributes or {}).get("ameff_identifier") or f"id-{rel.id}"
        rel_list.append(
            {
                "identifier": rel_ameff_id,
                "type": ameff_type,
                "source": source_ameff,
                "target": target_ameff,
                "name": rel.description or "",
            }
        )

    return {
        "identifier": f"id-{uuid.uuid4()}",
        "name": name,
        "version": AMEFF_VERSION,
        "elements": elements,
        "relationships": rel_list,
    }


async def import_model_from_ameff(
    db: AsyncSession,
    xml_content: str,
    user_id: str | None = None,
) -> dict[str, Any]:
    """Import an AMEFF XML model into the DB as arch_* cards and relations.

    Idempotent: elements already present (matched by ameff_identifier attribute)
    are skipped. Unknown element types are skipped with a warning.
    """
    from app.models.card import Card
    from app.models.card_type import CardType
    from app.models.relation import Relation

    model_data = parse_ameff_xml(xml_content)

    existing_ct_result = await db.execute(
        select(CardType.key).where(CardType.plugin_id == "archimate")
    )
    valid_types = {row[0] for row in existing_ct_result.all()}

    elements_created = 0
    elements_skipped = 0
    relationships_created = 0

    # Map AMEFF identifier → DB card ID for relation import
    ameff_to_card_id: dict[str, str] = {}

    for e in model_data["elements"]:
        ameff_id = e["identifier"]
        card_type_key = _TYPE_TO_KEY.get(e["type"])
        if not card_type_key or card_type_key not in valid_types:
            elements_skipped += 1
            continue

        existing_result = await db.execute(
            select(Card).where(Card.attributes["ameff_identifier"].astext == ameff_id)
        )
        existing = existing_result.scalar_one_or_none()
        if existing:
            ameff_to_card_id[ameff_id] = str(existing.id)
            continue

        card = Card(
            type=card_type_key,
            name=e["name"] or "Unnamed",
            description=e.get("description"),
            attributes={"ameff_identifier": ameff_id},
            created_by=user_id,
        )
        db.add(card)
        await db.flush()
        ameff_to_card_id[ameff_id] = str(card.id)
        elements_created += 1

    for r in model_data["relationships"]:
        rel_type_key = _REL_TYPE_TO_KEY.get(r["type"])
        if not rel_type_key:
            continue

        source_id = ameff_to_card_id.get(r["source"])
        target_id = ameff_to_card_id.get(r["target"])
        if not source_id or not target_id:
            continue

        existing_rel = await db.execute(
            select(Relation).where(
                Relation.attributes["ameff_identifier"].astext == r["identifier"]
            )
        )
        if existing_rel.scalar_one_or_none():
            continue

        rel = Relation(
            type=rel_type_key,
            source_id=source_id,
            target_id=target_id,
            description=r.get("name"),
            attributes={"ameff_identifier": r["identifier"]},
        )
        db.add(rel)
        relationships_created += 1

    await db.flush()

    return {
        "model_name": model_data["name"],
        "elements_created": elements_created,
        "elements_skipped": elements_skipped,
        "relationships_created": relationships_created,
    }
