"""Critical isolation tests: verify standard /cards, /relations, /diagrams endpoints
are completely unaffected when branch overrides exist for those objects.

The core guarantee: main tables are never modified during branch writes,
and existing endpoints always read from main — never branch data.
"""

from __future__ import annotations

import uuid

import pytest

from app.core.permissions import EA_ARCHITECT_PERMISSIONS, MEMBER_PERMISSIONS
from app.models.rwf import RwfBranch, RwfBranchCardOverride, RwfBranchRelationOverride
from tests.conftest import auth_headers, create_card, create_role, create_user


@pytest.fixture
async def isolation_env(db):
    """Seed roles and users."""
    await create_role(db, key="admin", label="Admin", permissions={"*": True})
    await create_role(
        db, key="ea_architect", label="EA Architect", permissions=EA_ARCHITECT_PERMISSIONS
    )
    await create_role(db, key="member", label="Member", permissions=MEMBER_PERMISSIONS)
    admin = await create_user(db, email="admin@iso.test", role="admin")
    member = await create_user(db, email="member@iso.test", role="member")
    return {"admin": admin, "member": member}


@pytest.fixture
async def branch_with_overrides(db, isolation_env):
    """Open branch with 'modified' and 'created' card overrides."""
    from datetime import datetime, timezone

    member = isolation_env["member"]
    branch = RwfBranch(
        id=uuid.uuid4(),
        name="isolation-test-branch",
        status="open",
        base_snapshot_at=datetime.now(timezone.utc),
        created_by=member.id,
    )
    db.add(branch)
    await db.flush()

    # Existing card with modified override
    existing_card = await create_card(
        db, name="Main Value", card_type="Application", user_id=member.id
    )
    override = RwfBranchCardOverride(
        id=uuid.uuid4(),
        branch_id=branch.id,
        card_id=existing_card.id,
        operation="modified",
        base_snapshot={"name": "Main Value"},
        draft={"name": "Branch Override Value", "type": "Application", "id": str(existing_card.id)},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(override)

    # New branch-only card (card_id=None)
    new_card_override = RwfBranchCardOverride(
        id=uuid.uuid4(),
        branch_id=branch.id,
        card_id=None,
        operation="created",
        base_snapshot=None,
        draft={"name": "Branch-Only Card", "type": "Application", "id": None},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(new_card_override)
    await db.flush()

    return {
        "branch": branch,
        "existing_card": existing_card,
        "override": override,
        "new_card_override": new_card_override,
    }


# ---------------------------------------------------------------------------
# Main /cards endpoint isolation
# ---------------------------------------------------------------------------


class TestCardEndpointIsolation:
    async def test_main_cards_list_ignores_branch_overrides(
        self, client, db, isolation_env, branch_with_overrides
    ):
        """GET /cards returns main-table data; branch 'modified' value NOT shown."""
        member = isolation_env["member"]
        resp = await client.get("/api/v1/cards", headers=auth_headers(member))
        assert resp.status_code == 200
        items = resp.json()["items"]

        # The existing card must have its MAIN name, not the branch draft
        existing_card = branch_with_overrides["existing_card"]
        card_data = next((c for c in items if c["id"] == str(existing_card.id)), None)
        assert card_data is not None
        assert card_data["name"] == "Main Value", (
            f"Expected 'Main Value' but got '{card_data['name']}' — "
            "branch override leaked into main endpoint"
        )

        # Branch-only card must NOT appear in main list
        names = [c["name"] for c in items]
        assert "Branch-Only Card" not in names, (
            "Branch-created card leaked into main /cards endpoint"
        )

    async def test_main_card_detail_ignores_branch_overrides(
        self, client, db, isolation_env, branch_with_overrides
    ):
        """GET /cards/{id} returns main-table value, not branch draft."""
        member = isolation_env["member"]
        existing_card = branch_with_overrides["existing_card"]
        resp = await client.get(f"/api/v1/cards/{existing_card.id}", headers=auth_headers(member))
        assert resp.status_code == 200
        assert resp.json()["name"] == "Main Value", (
            "Branch override leaked into main /cards/{id} endpoint"
        )

    async def test_main_card_search_ignores_branch_data(
        self, client, db, isolation_env, branch_with_overrides
    ):
        """Search on main /cards does not surface branch-draft values."""
        member = isolation_env["member"]
        # Search for the branch-draft name — should find nothing in main
        resp = await client.get(
            "/api/v1/cards?search=Branch+Override+Value",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        items = resp.json()["items"]
        names = [c["name"] for c in items]
        assert "Branch Override Value" not in names, (
            "Branch draft name surfaced in main /cards search"
        )

    async def test_main_card_not_modified_after_branch_write(
        self, client, db, isolation_env, branch_with_overrides
    ):
        """Writing to a branch card endpoint must not alter the main card row."""
        from sqlalchemy import select

        from app.models.card import Card

        branch = branch_with_overrides["branch"]
        existing_card = branch_with_overrides["existing_card"]
        member = isolation_env["member"]

        # Write to branch endpoint
        resp = await client.patch(
            f"/api/v1/rwf/branches/{branch.id}/cards/{existing_card.id}",
            json={"name": "New Branch Edit"},
            headers=auth_headers(member),
        )
        assert resp.status_code == 200

        # Reload main card — must be unchanged
        main_card = (await db.execute(select(Card).where(Card.id == existing_card.id))).scalar_one()
        assert main_card.name == "Main Value", (
            f"Main table was modified to '{main_card.name}' after branch write"
        )


# ---------------------------------------------------------------------------
# Main /relations endpoint isolation
# ---------------------------------------------------------------------------


class TestRelationEndpointIsolation:
    async def test_main_relations_list_ignores_deleted_override(
        self, client, db, isolation_env, branch_with_overrides
    ):
        """A 'deleted' relation override in a branch must NOT affect GET /relations."""
        from datetime import datetime, timezone

        from app.models.relation import Relation

        branch = branch_with_overrides["branch"]
        src = await create_card(db, name="RelSrc", card_type="Application")
        tgt = await create_card(db, name="RelTgt", card_type="ITComponent")
        rel = Relation(
            id=uuid.uuid4(),
            type="uses",
            source_id=src.id,
            target_id=tgt.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(rel)

        # Create 'deleted' override in branch
        override = RwfBranchRelationOverride(
            id=uuid.uuid4(),
            branch_id=branch.id,
            relation_id=rel.id,
            operation="deleted",
            draft={"type": "uses", "source_id": str(src.id), "target_id": str(tgt.id)},
            created_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        member = isolation_env["member"]
        # Main /relations must still show the relation
        resp = await client.get("/api/v1/relations", headers=auth_headers(member))
        assert resp.status_code == 200
        ids = [r["id"] for r in resp.json()["items"]]
        assert str(rel.id) in ids, (
            "Relation deleted in branch should still be visible on main /relations"
        )


# ---------------------------------------------------------------------------
# Reports are never branch-aware
# ---------------------------------------------------------------------------


class TestReportsIsolation:
    async def test_dashboard_not_affected_by_branch(
        self, client, db, isolation_env, branch_with_overrides
    ):
        """GET /reports/dashboard always reads from main tables."""
        admin = isolation_env["admin"]
        resp = await client.get("/api/v1/reports/dashboard", headers=auth_headers(admin))
        # Just assert it succeeds — the key check is that no branch-specific error occurs
        assert resp.status_code == 200
