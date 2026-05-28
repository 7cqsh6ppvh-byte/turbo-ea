"""Integration tests for UML feature flag endpoints."""

from __future__ import annotations

import pytest

from tests.conftest import auth_headers, create_role, create_user


@pytest.fixture
async def uml_env(db):
    await create_role(db, key="admin", label="Admin", permissions={"*": True})
    await create_role(db, key="member", label="Member", permissions={"inventory.view": True})
    admin = await create_user(db, email="admin@test.com", role="admin")
    member = await create_user(db, email="member@test.com", role="member")
    return {"admin": admin, "member": member}


class TestUmlFeatureFlag:
    async def test_get_uml_enabled_default_false(self, client, db, uml_env):
        resp = await client.get("/api/v1/settings/uml-enabled")
        assert resp.status_code == 200
        assert resp.json()["enabled"] is False

    async def test_get_uml_enabled_is_public(self, client, db, uml_env):
        """No auth token required for the GET endpoint."""
        resp = await client.get("/api/v1/settings/uml-enabled")
        assert resp.status_code == 200
        assert "enabled" in resp.json()

    async def test_enable_uml_requires_admin_settings_permission(self, client, db, uml_env):
        member = uml_env["member"]
        resp = await client.patch(
            "/api/v1/settings/uml-enabled",
            json={"enabled": True},
            headers=auth_headers(member),
        )
        assert resp.status_code == 403

    async def test_admin_can_enable_uml(self, client, db, uml_env):
        admin = uml_env["admin"]
        resp = await client.patch(
            "/api/v1/settings/uml-enabled",
            json={"enabled": True},
            headers=auth_headers(admin),
        )
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

        resp2 = await client.get("/api/v1/settings/uml-enabled")
        assert resp2.json()["enabled"] is True

    async def test_enable_seeds_card_types(self, client, db, uml_env):
        from sqlalchemy import select

        from app.models.card_type import CardType

        admin = uml_env["admin"]
        await client.patch(
            "/api/v1/settings/uml-enabled",
            json={"enabled": True},
            headers=auth_headers(admin),
        )

        result = await db.execute(select(CardType).where(CardType.plugin_id == "uml"))
        cts = result.scalars().all()
        assert len(cts) == 59
        assert all(not ct.is_hidden for ct in cts)

    async def test_admin_can_disable_uml(self, client, db, uml_env):
        admin = uml_env["admin"]
        # Enable first
        await client.patch(
            "/api/v1/settings/uml-enabled",
            json={"enabled": True},
            headers=auth_headers(admin),
        )
        # Then disable
        resp = await client.patch(
            "/api/v1/settings/uml-enabled",
            json={"enabled": False},
            headers=auth_headers(admin),
        )
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

        resp2 = await client.get("/api/v1/settings/uml-enabled")
        assert resp2.json()["enabled"] is False

    async def test_disabling_hides_uml_types(self, client, db, uml_env):
        from sqlalchemy import select

        from app.models.card_type import CardType
        from app.plugins.uml.seed import seed_uml_metamodel

        await seed_uml_metamodel(db)
        await db.commit()

        admin = uml_env["admin"]
        await client.patch(
            "/api/v1/settings/uml-enabled",
            json={"enabled": False},
            headers=auth_headers(admin),
        )

        result = await db.execute(
            select(CardType).where(
                CardType.plugin_id == "uml",
                CardType.is_hidden == False,  # noqa: E712
            )
        )
        visible = result.scalars().all()
        assert len(visible) == 0, "All UML types should be hidden when disabled"

    async def test_bootstrap_includes_uml_enabled(self, client, db, uml_env):
        admin = uml_env["admin"]
        resp = await client.get(
            "/api/v1/settings/bootstrap",
            headers=auth_headers(admin),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "uml_enabled" in data
        assert data["uml_enabled"] is False
