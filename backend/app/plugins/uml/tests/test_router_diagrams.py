"""Tests for UML Diagrams plugin diagram management endpoints."""

from __future__ import annotations

import uuid
import pytest

@pytest.mark.asyncio
async def test_create_diagram_returns_201(client, auth_headers):
    """Test creating a diagram returns 201."""
    response = await client.post(
        "/api/uml-diagrams",
        json={"name": "Test Diagram", "diagram_type": "class"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Diagram"
    assert data["diagram_type"] == "class"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_diagrams_returns_empty_list(client, auth_headers):
    """Test listing diagrams returns empty list initially."""
    response = await client.get("/api/uml-diagrams", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_list_diagrams_returns_created_diagrams(client, auth_headers):
    """Test listing diagrams returns created items."""
    await client.post(
        "/api/uml-diagrams", 
        json={"name": "D1", "diagram_type": "class"},
        headers=auth_headers
    )
    await client.post(
        "/api/uml-diagrams", 
        json={"name": "D2", "diagram_type": "sequence"},
        headers=auth_headers
    )

    response = await client.get("/api/uml-diagrams", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    names = [d["name"] for d in data["items"]]
    assert "D1" in names
    assert "D2" in names


@pytest.mark.asyncio
async def test_get_diagram_returns_200(client, auth_headers):
    """Test getting a diagram by ID."""
    create_resp = await client.post(
        "/api/uml-diagrams", 
        json={"name": "Test", "diagram_type": "class"},
        headers=auth_headers
    )
    diagram_id = create_resp.json()["id"]

    response = await client.get(f"/api/uml-diagrams/{diagram_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Test"


@pytest.mark.asyncio
async def test_update_diagram(client, auth_headers):
    """Test updating a diagram."""
    create_resp = await client.post(
        "/api/uml-diagrams", 
        json={"name": "Old Name", "diagram_type": "class"},
        headers=auth_headers
    )
    diagram_id = create_resp.json()["id"]

    response = await client.patch(
        f"/api/uml-diagrams/{diagram_id}",
        json={"name": "New Name"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"


@pytest.mark.asyncio
async def test_delete_diagram_returns_204(client, auth_headers):
    """Test deleting a diagram."""
    create_resp = await client.post(
        "/api/uml-diagrams", 
        json={"name": "To Delete", "diagram_type": "class"},
        headers=auth_headers
    )
    diagram_id = create_resp.json()["id"]

    response = await client.delete(f"/api/uml-diagrams/{diagram_id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify 404 on get
    get_resp = await client.get(f"/api/uml-diagrams/{diagram_id}", headers=auth_headers)
    assert get_resp.status_code == 404
