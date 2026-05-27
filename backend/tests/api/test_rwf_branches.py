"""Integration tests for /rwf/branches and /rwf/snapshots endpoints.

Tests follow the TDD pattern: red first, green after implementation.
"""

from __future__ import annotations

import pytest

from app.core.permissions import EA_ARCHITECT_PERMISSIONS, MEMBER_PERMISSIONS, VIEWER_PERMISSIONS
from tests.conftest import auth_headers, create_role, create_user


@pytest.fixture
async def rwf_env(db):
    """Seed roles and users for RWF tests."""
    await create_role(db, key="admin", label="Admin", permissions={"*": True})
    await create_role(
        db,
        key="ea_architect",
        label="EA Architect",
        permissions=EA_ARCHITECT_PERMISSIONS,
    )
    await create_role(
        db,
        key="member",
        label="Member",
        permissions=MEMBER_PERMISSIONS,
    )
    await create_role(
        db,
        key="viewer",
        label="Viewer",
        permissions=VIEWER_PERMISSIONS,
    )
    admin = await create_user(db, email="admin@rwf.test", role="admin")
    architect = await create_user(db, email="architect@rwf.test", role="ea_architect")
    member = await create_user(db, email="member@rwf.test", role="member")
    viewer = await create_user(db, email="viewer@rwf.test", role="viewer")
    return {
        "admin": admin,
        "architect": architect,
        "member": member,
        "viewer": viewer,
    }


# ---------------------------------------------------------------------------
# GET /rwf/branches — list
# ---------------------------------------------------------------------------


class TestListBranches:
    async def test_member_can_list_empty(self, client, db, rwf_env):
        member = rwf_env["member"]
        resp = await client.get("/api/v1/rwf/branches", headers=auth_headers(member))
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []
        assert data["total"] == 0

    async def test_viewer_cannot_list(self, client, db, rwf_env):
        """Viewer has no rwf.view — 403."""
        viewer = rwf_env["viewer"]
        resp = await client.get("/api/v1/rwf/branches", headers=auth_headers(viewer))
        assert resp.status_code == 403

    async def test_unauthenticated_cannot_list(self, client, db, rwf_env):
        resp = await client.get("/api/v1/rwf/branches")
        assert resp.status_code == 401

    async def test_list_filters_by_status(self, client, db, rwf_env):
        member = rwf_env["member"]
        # Create two branches
        await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Feature A"},
            headers=auth_headers(member),
        )
        await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Feature B"},
            headers=auth_headers(member),
        )
        # Filter by open
        resp = await client.get("/api/v1/rwf/branches?status=open", headers=auth_headers(member))
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 2
        assert all(b["status"] == "open" for b in data["items"])

        # Filter by merged — none yet
        resp = await client.get("/api/v1/rwf/branches?status=merged", headers=auth_headers(member))
        assert resp.status_code == 200
        assert resp.json()["total"] == 0


# ---------------------------------------------------------------------------
# POST /rwf/branches — create
# ---------------------------------------------------------------------------


class TestCreateBranch:
    async def test_member_can_create(self, client, db, rwf_env):
        member = rwf_env["member"]
        resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "My Feature Branch", "description": "Testing something new"},
            headers=auth_headers(member),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "My Feature Branch"
        assert data["description"] == "Testing something new"
        assert data["status"] == "open"
        assert "id" in data
        assert "base_snapshot_at" in data
        assert "created_at" in data

    async def test_viewer_cannot_create(self, client, db, rwf_env):
        viewer = rwf_env["viewer"]
        resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Should Fail"},
            headers=auth_headers(viewer),
        )
        assert resp.status_code == 403

    async def test_name_required(self, client, db, rwf_env):
        member = rwf_env["member"]
        resp = await client.post(
            "/api/v1/rwf/branches",
            json={},
            headers=auth_headers(member),
        )
        assert resp.status_code == 422

    async def test_created_by_is_current_user(self, client, db, rwf_env):
        member = rwf_env["member"]
        resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Creator Test"},
            headers=auth_headers(member),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["created_by"] == str(member.id)


# ---------------------------------------------------------------------------
# GET /rwf/branches/{id} — detail
# ---------------------------------------------------------------------------


class TestGetBranch:
    async def test_get_existing_branch(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Detail Branch"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        resp = await client.get(f"/api/v1/rwf/branches/{branch_id}", headers=auth_headers(member))
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == branch_id
        assert data["name"] == "Detail Branch"
        assert data["change_counts"]["cards"] == 0
        assert data["change_counts"]["relations"] == 0
        assert data["change_counts"]["diagrams"] == 0

    async def test_get_nonexistent_branch(self, client, db, rwf_env):
        import uuid

        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{uuid.uuid4()}", headers=auth_headers(member)
        )
        assert resp.status_code == 404

    async def test_viewer_cannot_get(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Viewer Branch"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        viewer = rwf_env["viewer"]
        resp = await client.get(f"/api/v1/rwf/branches/{branch_id}", headers=auth_headers(viewer))
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# POST /rwf/branches/{id}/submit — submit for review
# ---------------------------------------------------------------------------


class TestSubmitBranch:
    async def test_member_can_submit_own_branch(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Submit Branch"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        resp = await client.post(
            f"/api/v1/rwf/branches/{branch_id}/submit",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "in_review"

    async def test_cannot_submit_twice(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Double Submit"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        await client.post(
            f"/api/v1/rwf/branches/{branch_id}/submit",
            headers=auth_headers(member),
        )
        resp = await client.post(
            f"/api/v1/rwf/branches/{branch_id}/submit",
            headers=auth_headers(member),
        )
        assert resp.status_code == 422

    async def test_viewer_cannot_submit(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Viewer Submit"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        viewer = rwf_env["viewer"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{branch_id}/submit",
            headers=auth_headers(viewer),
        )
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# POST /rwf/branches/{id}/approve and /reject
# ---------------------------------------------------------------------------


class TestApproveBranch:
    async def _create_and_submit(self, client, member):
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Approve Branch"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]
        await client.post(
            f"/api/v1/rwf/branches/{branch_id}/submit",
            headers=auth_headers(member),
        )
        return branch_id

    async def test_architect_can_approve(self, client, db, rwf_env):
        member = rwf_env["member"]
        architect = rwf_env["architect"]
        branch_id = await self._create_and_submit(client, member)

        resp = await client.post(
            f"/api/v1/rwf/branches/{branch_id}/approve",
            headers=auth_headers(architect),
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "approved"

    async def test_member_cannot_approve(self, client, db, rwf_env):
        member = rwf_env["member"]
        branch_id = await self._create_and_submit(client, member)

        resp = await client.post(
            f"/api/v1/rwf/branches/{branch_id}/approve",
            headers=auth_headers(member),
        )
        assert resp.status_code == 403

    async def test_architect_can_reject(self, client, db, rwf_env):
        member = rwf_env["member"]
        architect = rwf_env["architect"]
        branch_id = await self._create_and_submit(client, member)

        resp = await client.post(
            f"/api/v1/rwf/branches/{branch_id}/reject",
            json={"comment": "Needs more work"},
            headers=auth_headers(architect),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "rejected"
        assert data["review_comment"] == "Needs more work"

    async def test_cannot_approve_non_review_branch(self, client, db, rwf_env):
        """Cannot approve a branch that is still 'open'."""
        member = rwf_env["member"]
        architect = rwf_env["architect"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Not Submitted"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        resp = await client.post(
            f"/api/v1/rwf/branches/{branch_id}/approve",
            headers=auth_headers(architect),
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# DELETE /rwf/branches/{id} — abandon
# ---------------------------------------------------------------------------


class TestDeleteBranch:
    async def test_owner_can_abandon(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Abandon Branch"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        resp = await client.delete(
            f"/api/v1/rwf/branches/{branch_id}", headers=auth_headers(member)
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "abandoned"

    async def test_viewer_cannot_abandon(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Viewer Abandon"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        viewer = rwf_env["viewer"]
        resp = await client.delete(
            f"/api/v1/rwf/branches/{branch_id}", headers=auth_headers(viewer)
        )
        assert resp.status_code == 403

    async def test_architect_can_abandon_any(self, client, db, rwf_env):
        member = rwf_env["member"]
        architect = rwf_env["architect"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Other Abandon"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        resp = await client.delete(
            f"/api/v1/rwf/branches/{branch_id}", headers=auth_headers(architect)
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "abandoned"


# ---------------------------------------------------------------------------
# GET /rwf/branches/{id}/diff
# ---------------------------------------------------------------------------


class TestBranchDiff:
    async def test_empty_branch_diff(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Diff Branch"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        resp = await client.get(
            f"/api/v1/rwf/branches/{branch_id}/diff", headers=auth_headers(member)
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["cards"] == []
        assert data["relations"] == []
        assert data["diagrams"] == []

    async def test_viewer_cannot_view_diff(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/branches",
            json={"name": "Diff Branch Viewer"},
            headers=auth_headers(member),
        )
        branch_id = create_resp.json()["id"]

        viewer = rwf_env["viewer"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{branch_id}/diff", headers=auth_headers(viewer)
        )
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# GET/POST/DELETE /rwf/snapshots
# ---------------------------------------------------------------------------


class TestSnapshots:
    async def test_member_can_create_snapshot(self, client, db, rwf_env):
        member = rwf_env["member"]
        resp = await client.post(
            "/api/v1/rwf/snapshots",
            json={"name": "Q1-2026-baseline", "description": "Quarter end snapshot"},
            headers=auth_headers(member),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Q1-2026-baseline"
        assert data["description"] == "Quarter end snapshot"
        assert "snapshot_at" in data
        assert "id" in data

    async def test_snapshot_name_must_be_unique(self, client, db, rwf_env):
        member = rwf_env["member"]
        await client.post(
            "/api/v1/rwf/snapshots",
            json={"name": "Duplicate"},
            headers=auth_headers(member),
        )
        resp = await client.post(
            "/api/v1/rwf/snapshots",
            json={"name": "Duplicate"},
            headers=auth_headers(member),
        )
        assert resp.status_code == 409

    async def test_member_can_list_snapshots(self, client, db, rwf_env):
        member = rwf_env["member"]
        await client.post(
            "/api/v1/rwf/snapshots",
            json={"name": "List Snap"},
            headers=auth_headers(member),
        )
        resp = await client.get("/api/v1/rwf/snapshots", headers=auth_headers(member))
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] >= 1

    async def test_viewer_cannot_create_snapshot(self, client, db, rwf_env):
        viewer = rwf_env["viewer"]
        resp = await client.post(
            "/api/v1/rwf/snapshots",
            json={"name": "Viewer Snap"},
            headers=auth_headers(viewer),
        )
        assert resp.status_code == 403

    async def test_architect_can_delete_snapshot(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/snapshots",
            json={"name": "Delete Me"},
            headers=auth_headers(member),
        )
        snap_id = create_resp.json()["id"]

        architect = rwf_env["architect"]
        resp = await client.delete(
            f"/api/v1/rwf/snapshots/{snap_id}", headers=auth_headers(architect)
        )
        assert resp.status_code == 200

    async def test_member_cannot_delete_snapshot(self, client, db, rwf_env):
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/snapshots",
            json={"name": "Cannot Delete"},
            headers=auth_headers(member),
        )
        snap_id = create_resp.json()["id"]

        resp = await client.delete(f"/api/v1/rwf/snapshots/{snap_id}", headers=auth_headers(member))
        assert resp.status_code == 403

    async def test_snapshot_diff_empty(self, client, db, rwf_env):
        """Diff of a snapshot against current main returns structured lists."""
        member = rwf_env["member"]
        create_resp = await client.post(
            "/api/v1/rwf/snapshots",
            json={"name": "Diff Snap"},
            headers=auth_headers(member),
        )
        snap_id = create_resp.json()["id"]

        resp = await client.get(
            f"/api/v1/rwf/snapshots/{snap_id}/diff", headers=auth_headers(member)
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "cards_added" in data
        assert "cards_removed" in data
        assert "cards_modified" in data
        assert "relations_added" in data
        assert "relations_removed" in data
        assert "diagrams_added" in data
        assert "diagrams_removed" in data


# ---------------------------------------------------------------------------
# RWF module disabled — all endpoints must return 503
# ---------------------------------------------------------------------------


class TestRwfModuleDisabled:
    async def test_branches_returns_503_when_disabled(self, client, db, rwf_env):
        """When rwf_enabled is False in settings, all /rwf/* endpoints return 503."""
        admin = rwf_env["admin"]
        # Disable the module
        await client.patch(
            "/api/v1/settings/rwf-enabled",
            json={"enabled": False},
            headers=auth_headers(admin),
        )
        member = rwf_env["member"]
        resp = await client.get("/api/v1/rwf/branches", headers=auth_headers(member))
        assert resp.status_code == 503

        # Re-enable for subsequent tests
        await client.patch(
            "/api/v1/settings/rwf-enabled",
            json={"enabled": True},
            headers=auth_headers(admin),
        )
