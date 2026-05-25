"""ArchiMate plugin API endpoints.

Provides AMEFF (ArchiMate Model Exchange File Format) export and import,
plus plugin management endpoints.

Reference: https://www.opengroup.org/open-group-archimate-model-exchange-file-format
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.plugins.archimate.ameff import (
    export_model_to_ameff,
    import_model_from_ameff,
    serialize_ameff_to_xml,
)
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
