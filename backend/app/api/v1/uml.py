"""UML plugin API endpoints.

Provides XMI (XML Metadata Interchange) export and import,
plus plugin management endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.permission_service import PermissionService

router = APIRouter(prefix="/uml", tags=["uml"])


class XmiExportRequest(BaseModel):
    name: str = "UML Model"
    card_ids: list[str] | None = None


class UmlDiagramTypeItem(BaseModel):
    type: str
    label: str
    icon: str
    category: str


@router.get("/diagram-types", response_model=list[UmlDiagramTypeItem])
async def list_uml_diagram_types(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return all supported UML diagram types with labels and icons."""
    await PermissionService.require_permission(db, user, "uml.view")
    return [
        {
            "type": "uml-class",
            "label": "Class Diagram",
            "icon": "view_in_ar",
            "category": "Structural",
        },
        {
            "type": "uml-object",
            "label": "Object Diagram",
            "icon": "data_object",
            "category": "Structural",
        },
        {
            "type": "uml-component",
            "label": "Component Diagram",
            "icon": "widgets",
            "category": "Structural",
        },
        {
            "type": "uml-deployment",
            "label": "Deployment Diagram",
            "icon": "dns",
            "category": "Structural",
        },
        {
            "type": "uml-package",
            "label": "Package Diagram",
            "icon": "folder_open",
            "category": "Structural",
        },
        {
            "type": "uml-composite",
            "label": "Composite Structure Diagram",
            "icon": "grid_view",
            "category": "Structural",
        },
        {
            "type": "uml-profile",
            "label": "Profile Diagram",
            "icon": "tune",
            "category": "Structural",
        },
        {
            "type": "uml-usecase",
            "label": "Use Case Diagram",
            "icon": "person",
            "category": "Behavioral",
        },
        {
            "type": "uml-activity",
            "label": "Activity Diagram",
            "icon": "account_tree",
            "category": "Behavioral",
        },
        {
            "type": "uml-statemachine",
            "label": "State Machine Diagram",
            "icon": "crop_square",
            "category": "Behavioral",
        },
        {
            "type": "uml-sequence",
            "label": "Sequence Diagram",
            "icon": "swap_vert",
            "category": "Interaction",
        },
        {
            "type": "uml-communication",
            "label": "Communication Diagram",
            "icon": "share",
            "category": "Interaction",
        },
        {
            "type": "uml-timing",
            "label": "Timing Diagram",
            "icon": "timeline",
            "category": "Interaction",
        },
        {
            "type": "uml-interaction-overview",
            "label": "Interaction Overview Diagram",
            "icon": "account_tree",
            "category": "Interaction",
        },
    ]


@router.post("/export")
async def export_uml_model(
    body: XmiExportRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Export UML elements as XMI 2.1 XML.

    Returns the XMI file as a download. Optionally restrict to specific
    card IDs via the card_ids list; omit to export all uml_* cards.
    """
    await PermissionService.require_permission(db, user, "uml.view")

    # Basic XMI stub — Phase 4 will implement full XMI
    safe_name = body.name.replace(" ", "_").replace("/", "_")[:64]
    xmi_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<xmi:XMI xmi:version="2.1"
  xmlns:xmi="http://www.omg.org/XMI"
  xmlns:uml="http://www.eclipse.org/uml2/5.0.0/UML">
  <uml:Model xmi:id="_model" name="{body.name}"/>
</xmi:XMI>"""

    return Response(
        content=xmi_content,
        media_type="application/xml",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}.xmi"'},
    )


@router.post("/import")
async def import_uml_model(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Import an XMI file, creating uml_* cards and relations.

    Requires uml.manage permission.
    Phase 4 will implement full XMI parsing.
    """
    await PermissionService.require_permission(db, user, "uml.manage")

    if not file.filename or not file.filename.lower().endswith((".xmi", ".xml")):
        raise HTTPException(status_code=400, detail="Only .xmi or .xml files are accepted")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit")

    # Phase 4: implement full XMI import
    return {
        "elements_created": 0,
        "elements_skipped": 0,
        "relations_created": 0,
        "message": "XMI import will be fully implemented in Phase 4",
    }
