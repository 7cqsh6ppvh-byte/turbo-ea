"""FastAPI router for UML Diagrams plugin."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.plugins.uml.schemas import (
    DiagramCardAdd,
    DiagramCardResponse,
    DiagramCreate,
    DiagramListResponse,
    DiagramResponse,
    DiagramUpdate,
)

router = APIRouter(prefix="/api/uml-diagrams", tags=["UML Diagrams"])


@router.post("", response_model=DiagramResponse, status_code=status.HTTP_201_CREATED)
async def create_diagram(
    diagram_in: DiagramCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new UML diagram."""
    from app.plugins.uml.models import UmlDiagram

    diagram = UmlDiagram(
        name=diagram_in.name,
        description=diagram_in.description,
        diagram_type=diagram_in.diagram_type,
        skin_params=diagram_in.skin_params,
        workspace_id=getattr(user, "workspace_id", None),
        created_by_id=user.id,
    )
    db.add(diagram)
    await db.commit()
    await db.refresh(diagram)
    return DiagramResponse(
        id=diagram.id,
        name=diagram.name,
        description=diagram.description,
        diagram_type=diagram.diagram_type,
        skin_params=diagram.skin_params,
        workspace_id=diagram.workspace_id,
        created_by_id=diagram.created_by_id,
        created_at=diagram.created_at,
        updated_at=diagram.updated_at,
    )


@router.get("", response_model=DiagramListResponse)
async def list_diagrams(
    workspace_id: uuid.UUID | None = Query(None),
    diagram_type: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List diagrams with optional filtering."""
    from app.plugins.uml.models import UmlDiagram

    q = select(UmlDiagram)
    
    # If explicit workspace_id provided, filter by it.
    # Otherwise, if user has workspace_id, filter by user's workspace.
    if workspace_id:
        q = q.where(UmlDiagram.workspace_id == workspace_id)
    elif hasattr(user, "workspace_id") and user.workspace_id:
        q = q.where(UmlDiagram.workspace_id == user.workspace_id)

    if diagram_type:
        q = q.where(UmlDiagram.diagram_type == diagram_type)

    q = q.order_by(UmlDiagram.updated_at.desc())

    result = await db.execute(q)
    diagrams = result.scalars().all()

    items = [
        DiagramResponse(
            id=d.id,
            name=d.name,
            description=d.description,
            diagram_type=d.diagram_type,
            skin_params=d.skin_params,
            workspace_id=d.workspace_id,
            created_by_id=d.created_by_id,
            created_at=d.created_at,
            updated_at=d.updated_at,
        )
        for d in diagrams
    ]

    return DiagramListResponse(items=items, total=len(items))


@router.get("/{diagram_id}", response_model=DiagramResponse)
async def get_diagram(
    diagram_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a diagram by ID."""
    from app.plugins.uml.models import UmlDiagram

    result = await db.execute(select(UmlDiagram).where(UmlDiagram.id == diagram_id))
    diagram = result.scalar_one_or_none()

    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    return DiagramResponse(
        id=diagram.id,
        name=diagram.name,
        description=diagram.description,
        diagram_type=diagram.diagram_type,
        skin_params=diagram.skin_params,
        workspace_id=diagram.workspace_id,
        created_by_id=diagram.created_by_id,
        created_at=diagram.created_at,
        updated_at=diagram.updated_at,
    )


@router.patch("/{diagram_id}", response_model=DiagramResponse)
async def update_diagram(
    diagram_id: uuid.UUID,
    diagram_in: DiagramUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update a diagram."""
    from app.plugins.uml.models import UmlDiagram

    result = await db.execute(select(UmlDiagram).where(UmlDiagram.id == diagram_id))
    diagram = result.scalar_one_or_none()

    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    if diagram_in.name is not None:
        diagram.name = diagram_in.name
    if diagram_in.description is not None:
        diagram.description = diagram_in.description
    if diagram_in.diagram_type is not None:
        diagram.diagram_type = diagram_in.diagram_type
    if diagram_in.skin_params is not None:
        diagram.skin_params = diagram_in.skin_params

    await db.commit()
    await db.refresh(diagram)

    return DiagramResponse(
        id=diagram.id,
        name=diagram.name,
        description=diagram.description,
        diagram_type=diagram.diagram_type,
        skin_params=diagram.skin_params,
        workspace_id=diagram.workspace_id,
        created_by_id=diagram.created_by_id,
        created_at=diagram.created_at,
        updated_at=diagram.updated_at,
    )


@router.delete("/{diagram_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagram(
    diagram_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a diagram."""
    from app.plugins.uml.models import UmlDiagram

    result = await db.execute(select(UmlDiagram).where(UmlDiagram.id == diagram_id))
    diagram = result.scalar_one_or_none()

    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    await db.delete(diagram)
    await db.commit()


@router.post("/{diagram_id}/duplicate", response_model=DiagramResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_diagram(
    diagram_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Duplicate a diagram."""
    from app.plugins.uml.models import UmlDiagram

    result = await db.execute(select(UmlDiagram).where(UmlDiagram.id == diagram_id))
    diagram = result.scalar_one_or_none()

    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    new_diagram = UmlDiagram(
        name=f"{diagram.name} (Copy)",
        description=diagram.description,
        diagram_type=diagram.diagram_type,
        skin_params=diagram.skin_params,
        workspace_id=diagram.workspace_id,
        created_by_id=user.id,
    )
    db.add(new_diagram)
    await db.commit()
    await db.refresh(new_diagram)

    return DiagramResponse(
        id=new_diagram.id,
        name=new_diagram.name,
        description=new_diagram.description,
        diagram_type=new_diagram.diagram_type,
        skin_params=new_diagram.skin_params,
        workspace_id=new_diagram.workspace_id,
        created_by_id=new_diagram.created_by_id,
        created_at=new_diagram.created_at,
        updated_at=new_diagram.updated_at,
    )


# --- Diagram Card Management ---


@router.post("/{diagram_id}/cards", response_model=DiagramCardResponse, status_code=status.HTTP_201_CREATED)
async def add_card_to_diagram(
    diagram_id: uuid.UUID,
    card_in: DiagramCardAdd,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Add a card to a diagram."""
    from app.plugins.uml.models import UmlDiagram, UmlDiagramCard

    # Verify diagram exists
    result = await db.execute(select(UmlDiagram).where(UmlDiagram.id == diagram_id))
    diagram = result.scalar_one_or_none()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    # Check if card already in diagram
    result = await db.execute(
        select(UmlDiagramCard).where(
            UmlDiagramCard.diagram_id == diagram_id,
            UmlDiagramCard.card_id == card_in.card_id,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Card already in diagram")

    diagram_card = UmlDiagramCard(
        diagram_id=diagram_id,
        card_id=card_in.card_id,
        x=card_in.x,
        y=card_in.y,
    )
    db.add(diagram_card)
    await db.commit()
    await db.refresh(diagram_card)

    return DiagramCardResponse(
        diagram_id=diagram_card.diagram_id,
        card_id=diagram_card.card_id,
        x=diagram_card.x,
        y=diagram_card.y,
    )


@router.delete("/{diagram_id}/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_card_from_diagram(
    diagram_id: uuid.UUID,
    card_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Remove a card from a diagram."""
    from app.plugins.uml.models import UmlDiagramCard

    result = await db.execute(
        select(UmlDiagramCard).where(
            UmlDiagramCard.diagram_id == diagram_id,
            UmlDiagramCard.card_id == card_id,
        )
    )
    diagram_card = result.scalar_one_or_none()

    if not diagram_card:
        raise HTTPException(status_code=404, detail="Card not in diagram")

    await db.delete(diagram_card)
    await db.commit()


@router.patch("/{diagram_id}/cards/{card_id}", response_model=DiagramCardResponse)
async def update_card_position(
    diagram_id: uuid.UUID,
    card_id: uuid.UUID,
    x: float | None = None,
    y: float | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update card position on diagram canvas."""
    from app.plugins.uml.models import UmlDiagramCard

    result = await db.execute(
        select(UmlDiagramCard).where(
            UmlDiagramCard.diagram_id == diagram_id,
            UmlDiagramCard.card_id == card_id,
        )
    )
    diagram_card = result.scalar_one_or_none()

    if not diagram_card:
        raise HTTPException(status_code=404, detail="Card not in diagram")

    if x is not None:
        diagram_card.x = x
    if y is not None:
        diagram_card.y = y

    await db.commit()
    await db.refresh(diagram_card)

    return DiagramCardResponse(
        diagram_id=diagram_card.diagram_id,
        card_id=diagram_card.card_id,
        x=diagram_card.x,
        y=diagram_card.y,
    )
