"""ArchiMate plugin API endpoints.

Provides AMEFF (ArchiMate Model Exchange File Format) export and import,
plus plugin management endpoints.

Reference: https://www.opengroup.org/open-group-archimate-model-exchange-file-format
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.card_type import CardType
from app.models.relation_type import RelationType
from app.models.user import User
from app.plugins.archimate.allowed_relations import ARCHIMATE_RELATIONS
from app.plugins.archimate.ameff import (
    export_model_to_ameff,
    import_model_from_ameff,
    serialize_ameff_to_xml,
)
from app.plugins.archimate.relationship_checker import is_valid_archimate_relation
from app.services.permission_service import PermissionService

router = APIRouter(prefix="/archimate", tags=["archimate"])


class AmeffExportRequest(BaseModel):
    name: str = "ArchiMate Model"
    card_ids: list[str] | None = None


class AmeffImportResponse(BaseModel):
    model_name: str
    elements_created: int
    elements_skipped: int
    relationships_created: int


@router.post("/export")
async def export_archimate_model(
    body: AmeffExportRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Export ArchiMate elements and relations as AMEFF XML.

    Returns the AMEFF XML file as a download. Optionally restrict to specific
    card IDs via the card_ids list; omit to export all arch_* cards.
    """
    await PermissionService.require_permission(db, user, "archimate.view")

    model_data = await export_model_to_ameff(db, name=body.name, card_ids=body.card_ids)
    xml_content = serialize_ameff_to_xml(model_data)

    safe_name = body.name.replace(" ", "_").replace("/", "_")[:64]
    filename = f"{safe_name}.xml"

    return Response(
        content=xml_content,
        media_type="application/xml",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/import", response_model=AmeffImportResponse)
async def import_archimate_model(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Import an AMEFF XML file, creating arch_* cards and relations.

    Idempotent: elements already present (matched by their AMEFF identifier
    stored in card.attributes.ameff_identifier) are skipped.

    Requires archimate.manage permission.
    """
    await PermissionService.require_permission(db, user, "archimate.manage")

    if not file.filename or not file.filename.lower().endswith(".xml"):
        raise HTTPException(status_code=400, detail="Only .xml files are accepted")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit")

    try:
        xml_str = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded XML")

    try:
        result = await import_model_from_ameff(db, xml_content=xml_str, user_id=str(user.id))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid AMEFF file: {exc}") from exc

    await db.commit()
    return result


class CreateRelationTypeRequest(BaseModel):
    source_type_key: str
    target_type_key: str
    relation_name: str


class CreateRelationTypeResponse(BaseModel):
    key: str
    label: str
    source_type_key: str
    target_type_key: str
    reverse_label: str
    cardinality: str


REVERSE_LABELS = {
    "Access": "Accessed by",
    "Aggregation": "Aggregated by",
    "Assignment": "Assigned to",
    "Association": "Associated with",
    "Composition": "Composed by",
    "Flow": "Flows to",
    "Influence": "Influenced by",
    "Realization": "Realized by",
    "Serving": "Served by",
    "Specialization": "Generalized by",
    "Triggering": "Triggered by",
}


@router.post("/relation-types", response_model=CreateRelationTypeResponse)
async def create_archimate_relation_type(
    body: CreateRelationTypeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new ArchiMate relation type in the metamodel.

    Validates that:
    - User has archimate.manage permission
    - Both source and target card types exist
    - The relation is valid per ArchiMate 3.2 specification

    The relation type key is generated as arch_rel_{Source}_{Target}_{Relation}.
    """
    await PermissionService.require_permission(db, user, "archimate.manage")

    # Validate that both card types exist
    source_type = await db.scalar(select(CardType).where(CardType.key == body.source_type_key))
    target_type = await db.scalar(select(CardType).where(CardType.key == body.target_type_key))
    if not source_type:
        raise HTTPException(
            status_code=404, detail=f"Source card type '{body.source_type_key}' not found"
        )
    if not target_type:
        raise HTTPException(
            status_code=404, detail=f"Target card type '{body.target_type_key}' not found"
        )

    # Validate relation name
    relation_name = body.relation_name
    if relation_name not in ARCHIMATE_RELATIONS:
        raise HTTPException(
            status_code=400,
            detail=f"'{relation_name}' is not a valid ArchiMate relationship type",
        )

    # Validate that this relation is valid per ArchiMate spec
    relation_key = f"arch_rel_{relation_name}"
    if not is_valid_archimate_relation(body.source_type_key, body.target_type_key, relation_key):
        raise HTTPException(
            status_code=400,
            detail=(
                f"{relation_name} relationship is not valid "
                f"between {body.source_type_key} and {body.target_type_key}"
            ),
        )

    # Check if relation type already exists
    existing = await db.scalar(
        select(RelationType).where(
            RelationType.source_type_key == body.source_type_key,
            RelationType.target_type_key == body.target_type_key,
            RelationType.key == relation_key,
        )
    )
    if existing:
        raise HTTPException(
            status_code=409, detail=f"Relation type '{relation_key}' already exists"
        )

    # Create the relation type
    new_relation = RelationType(
        key=relation_key,
        label=relation_name,
        source_type_key=body.source_type_key,
        target_type_key=body.target_type_key,
        reverse_label=REVERSE_LABELS.get(relation_name, f"{relation_name} (reverse)"),
        attributes_schema=[],
        cardinality="one-to-many",
        plugin_id="archimate",
        built_in=False,
    )
    db.add(new_relation)
    await db.commit()
    await db.refresh(new_relation)

    return CreateRelationTypeResponse(
        key=new_relation.key,
        label=new_relation.label,
        source_type_key=new_relation.source_type_key,
        target_type_key=new_relation.target_type_key,
        reverse_label=new_relation.reverse_label,
        cardinality=new_relation.cardinality,
    )
