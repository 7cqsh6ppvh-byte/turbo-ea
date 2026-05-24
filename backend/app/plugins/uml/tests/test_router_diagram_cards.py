"""Tests for UML Diagrams plugin diagram-card management endpoints."""

from __future__ import annotations

import uuid
import pytest

@pytest.mark.asyncio
async def test_add_card_to_diagram_returns_201(client, auth_headers):
    """Test adding a card to a diagram returns 201."""
    # First create a diagram
    diagram_resp = await client.post(
        "/api/uml-diagrams",
        json={"name": "Test Diagram", "diagram_type": "class"},
        headers=auth_headers
    )
    assert diagram_resp.status_code == 201
    diagram = diagram_resp.json()
    diagram_id = diagram["id"]

    # Add a card to the diagram
    card_id = uuid.uuid4()
    response = await client.post(
        f"/api/uml-diagrams/{diagram_id}/cards",
        json={"card_id": str(card_id), "x": 100.0, "y": 200.0},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["diagram_id"] == diagram_id
    assert data["card_id"] == str(card_id)
    assert data["x"] == 100.0
    assert data["y"] == 200.0


@pytest.mark.asyncio
async def test_add_card_with_position(client, auth_headers):
    """Test adding a card with specific position."""
    # Create a diagram
    diagram_resp = await client.post(
        "/api/uml-diagrams",
        json={"name": "Test Diagram", "diagram_type": "class"},
        headers=auth_headers
    )
    assert diagram_resp.status_code == 201
    diagram = diagram_resp.json()
    diagram_id = diagram["id"]

    # Add card with position
    card_id = uuid.uuid4()
    response = await client.post(
        f"/api/uml-diagrams/{diagram_id}/cards",
        json={"card_id": str(card_id), "x": 150.5, "y": 250.5},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["x"] == 150.5
    assert data["y"] == 250.5


@pytest.mark.asyncio
async def test_add_duplicate_card_returns_409(client, auth_headers):
    """Test adding the same card twice returns 409."""
    # Create a diagram
    diagram_resp = await client.post(
        "/api/uml-diagrams",
        json={"name": "Test Diagram", "diagram_type": "class"},
        headers=auth_headers
    )
    assert diagram_resp.status_code == 201
    diagram_id = diagram_resp.json()["id"]

    # Add a card
    card_id = uuid.uuid4()
    await client.post(
        f"/api/uml-diagrams/{diagram_id}/cards",
        json={"card_id": str(card_id), "x": 0.0, "y": 0.0},
        headers=auth_headers
    )

    # Try to add the same card again
    response = await client.post(
        f"/api/uml-diagrams/{diagram_id}/cards",
        json={"card_id": str(card_id), "x": 100.0, "y": 100.0},
        headers=auth_headers
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_add_card_nonexistent_diagram_returns_404(client, auth_headers):
    """Test adding card to non-existent diagram returns 404."""
    fake_diagram_id = uuid.uuid4()
    card_id = uuid.uuid4()
    response = await client.post(
        f"/api/uml-diagrams/{fake_diagram_id}/cards",
        json={"card_id": str(card_id), "x": 0.0, "y": 0.0},
        headers=auth_headers
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_remove_card_from_diagram_returns_204(client, auth_headers):
    """Test removing a card from a diagram returns 204."""
    # Create a diagram
    diagram_resp = await client.post(
        "/api/uml-diagrams",
        json={"name": "Test Diagram", "diagram_type": "class"},
        headers=auth_headers
    )
    assert diagram_resp.status_code == 201
    diagram_id = diagram_resp.json()["id"]

    # Add a card
    card_id = uuid.uuid4()
    await client.post(
        f"/api/uml-diagrams/{diagram_id}/cards",
        json={"card_id": str(card_id), "x": 100.0, "y": 200.0},
        headers=auth_headers
    )

    # Remove the card
    response = await client.delete(
        f"/api/uml-diagrams/{diagram_id}/cards/{card_id}",
        headers=auth_headers
    )
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_update_card_position(client, auth_headers):
    """Test updating card position on diagram."""
    # Create a diagram
    diagram_resp = await client.post(
        "/api/uml-diagrams",
        json={"name": "Test Diagram", "diagram_type": "class"},
        headers=auth_headers
    )
    assert diagram_resp.status_code == 201
    diagram_id = diagram_resp.json()["id"]

    # Add a card
    card_id = uuid.uuid4()
    await client.post(
        f"/api/uml-diagrams/{diagram_id}/cards",
        json={"card_id": str(card_id), "x": 100.0, "y": 200.0},
        headers=auth_headers
    )

    # Update position
    response = await client.patch(
        f"/api/uml-diagrams/{diagram_id}/cards/{card_id}",
        params={"x": 300.0, "y": 400.0},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["x"] == 300.0
    assert data["y"] == 400.0


@pytest.mark.asyncio
async def test_update_card_position_nonexistent_returns_404(client, auth_headers):
    """Test updating position of non-existent card returns 404."""
    # Create a diagram
    diagram_resp = await client.post(
        "/api/uml-diagrams",
        json={"name": "Test Diagram", "diagram_type": "class"},
        headers=auth_headers
    )
    assert diagram_resp.status_code == 201
    diagram_id = diagram_resp.json()["id"]

    # Try to update position of card not in diagram
    fake_card_id = uuid.uuid4()
    response = await client.patch(
        f"/api/uml-diagrams/{diagram_id}/cards/{fake_card_id}",
        params={"x": 100.0, "y": 200.0},
        headers=auth_headers
    )
    assert response.status_code == 404
