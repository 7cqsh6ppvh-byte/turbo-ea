"""Integration tests for C4 Model feature flag endpoints."""

from __future__ import annotations

import pytest

from tests.conftest import auth_headers, create_role, create_user


@pytest.fixture
async def c4_env(db):
    await create_role(db, key="admin", label="Admin", permissions={"*": True})
    await create_role(db, key="member", label="Member", permissions={"inventory.view": True})
    admin = await create_user(db, email="admin@test.com", role="admin")
    member = await create_user(db, email="member@test.com", role="member")
    return {"admin": admin, "member": member}


class TestC4FeatureFlag:
    async def test_get_c4_enabled_default_false(self, client, db, c4_env):
        admin = c4_env["admin"]
        resp = await client.get(
            "/api/v1/settings/c4-enabled",
            headers=auth_headers(admin),
        )
        assert resp.status_code == 200
        assert resp.json()["enabled"] is False

    async def test_enable_c4_requires_admin(self, client, db, c4_env):
        member = c4_env["member"]
        resp = await client.patch(
            "/api/v1/settings/c4-enabled",
            json={"enabled": True},
            headers=auth_headers(member),
        )
        assert resp.status_code == 403

    async def test_admin_can_enable_c4(self, client, db, c4_env):
        admin = c4_env["admin"]
        resp = await client.patch(
            "/api/v1/settings/c4-enabled",
            json={"enabled": True},
            headers=auth_headers(admin),
        )
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

        resp2 = await client.get(
            "/api/v1/settings/c4-enabled",
            headers=auth_headers(admin),
        )
        assert resp2.json()["enabled"] is True

    async def test_bootstrap_includes_c4_enabled(self, client, db, c4_env):
        admin = c4_env["admin"]
        resp = await client.get(
            "/api/v1/settings/bootstrap",
            headers=auth_headers(admin),
        )
        assert resp.status_code == 200
        assert "c4_enabled" in resp.json()

    async def test_enable_c4_seeds_card_types(self, client, db, c4_env):
        admin = c4_env["admin"]
        await client.patch(
            "/api/v1/settings/c4-enabled",
            json={"enabled": True},
            headers=auth_headers(admin),
        )
        resp = await client.get(
            "/api/v1/metamodel/types",
            headers=auth_headers(admin),
        )
        type_keys = [t["key"] for t in resp.json()]
        assert "c4_Person" in type_keys
        assert "c4_SoftwareSystem" in type_keys
        assert "c4_Container" in type_keys
        assert "c4_Component" in type_keys

    async def test_disable_c4_hides_card_types(self, client, db, c4_env):
        admin = c4_env["admin"]
        # Enable then disable
        await client.patch(
            "/api/v1/settings/c4-enabled",
            json={"enabled": True},
            headers=auth_headers(admin),
        )
        await client.patch(
            "/api/v1/settings/c4-enabled",
            json={"enabled": False},
            headers=auth_headers(admin),
        )
        resp = await client.get(
            "/api/v1/metamodel/types",
            headers=auth_headers(admin),
        )
        type_keys = [t["key"] for t in resp.json()]
        assert "c4_Person" not in type_keys

    async def test_c4_status_endpoint(self, client, db, c4_env):
        admin = c4_env["admin"]
        resp = await client.get(
            "/api/v1/settings/c4-status",
            headers=auth_headers(admin),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "enabled" in data
        assert "card_types_count" in data
        assert "relation_types_count" in data
        assert "cards_count" in data
        assert "diagrams_count" in data

    async def test_rollback_c4_destroys_types(self, client, db, c4_env):
        admin = c4_env["admin"]
        # Enable first to seed types
        await client.patch(
            "/api/v1/settings/c4-enabled",
            json={"enabled": True},
            headers=auth_headers(admin),
        )
        # Rollback
        resp = await client.delete(
            "/api/v1/settings/c4-enabled",
            headers=auth_headers(admin),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "deleted_card_types" in data

        # Types should be gone
        resp2 = await client.get(
            "/api/v1/metamodel/types?include_hidden=true",
            headers=auth_headers(admin),
        )
        type_keys = [t["key"] for t in resp2.json()]
        assert "c4_Person" not in type_keys
