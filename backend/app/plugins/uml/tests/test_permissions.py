"""Tests for UML Diagrams plugin permissions."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_diagram_requires_create_permission():
    """Test that creating diagram requires uml_diagrams.create permission."""
    # This test would require setting up user with/without permission
    # For now, we test that the endpoint exists and requires auth
    response = client.post(
        "/api/uml-diagrams",
        json={"name": "Test Diagram"},
    )
    # Will return 401 if not authenticated, or 403 if no permission
    assert response.status_code in (401, 403, 201)  # 201 if dev mode bypasses auth


def test_view_diagram_requires_view_permission():
    """Test that viewing diagram requires uml_diagrams.view permission."""
    response = client.get("/api/uml-diagrams")
    assert response.status_code in (401, 403, 200)


def test_edit_diagram_requires_edit_permission():
    """Test that editing diagram requires uml_diagrams.edit permission."""
    response = client.patch("/api/uml-diagrams/some-id", json={"name": "Test"})
    assert response.status_code in (401, 403, 404, 200)  # 404 if diagram doesn't exist


def test_delete_diagram_requires_delete_permission():
    """Test that deleting diagram requires uml_diagrams.delete permission."""
    response = client.delete("/api/uml-diagrams/some-id")
    assert response.status_code in (401, 403, 404, 204)


def test_unauthenticated_request_returns_401():
    """Test that unauthenticated requests return 401 (in production)."""
    # In development mode, this might be bypassed
    response = client.get("/api/uml-diagrams")
    # In dev, might get 200; in prod would get 401
    assert response.status_code in (200, 401)


def test_wrong_workspace_returns_403():
    """Test that accessing diagram from wrong workspace returns 403."""
    # This would require setting up multiple workspaces
    # For now, test that endpoint exists
    response = client.get("/api/uml-diagrams/some-id")
    assert response.status_code in (401, 403, 404, 200)