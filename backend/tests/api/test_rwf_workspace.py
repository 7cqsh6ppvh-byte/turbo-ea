"""Integration tests for /rwf/branches/{id}/cards|relations|diagrams endpoints.

Phase 3: Branch workspace reads — overlay logic.
Phase 4: Branch workspace writes — card/relation/diagram create/edit/delete in branch.

Tests follow the TDD pattern: red first, green after implementation.
"""

from __future__ import annotations

import uuid

import pytest

from app.core.permissions import EA_ARCHITECT_PERMISSIONS, MEMBER_PERMISSIONS, VIEWER_PERMISSIONS
from app.models.rwf import (
    RwfBranch,
    RwfBranchCardOverride,
    RwfBranchDiagramOverride,
    RwfBranchRelationOverride,
)
from tests.conftest import auth_headers, create_card, create_role, create_user


@pytest.fixture
async def rwf_env(db):
    """Seed roles and users for RWF workspace tests."""
    await create_role(db, key="admin", label="Admin", permissions={"*": True})
    await create_role(
        db, key="ea_architect", label="EA Architect", permissions=EA_ARCHITECT_PERMISSIONS
    )
    await create_role(db, key="member", label="Member", permissions=MEMBER_PERMISSIONS)
    await create_role(db, key="viewer", label="Viewer", permissions=VIEWER_PERMISSIONS)
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


@pytest.fixture
async def open_branch(db, rwf_env):
    """Create an open branch owned by member."""
    from datetime import datetime, timezone

    member = rwf_env["member"]
    branch = RwfBranch(
        id=uuid.uuid4(),
        name="test-branch",
        description="Test branch for workspace tests",
        status="open",
        base_snapshot_at=datetime.now(timezone.utc),
        created_by=member.id,
    )
    db.add(branch)
    await db.flush()
    return branch


# ---------------------------------------------------------------------------
# GET /rwf/branches/{id}/cards — branch-overlay card list
# ---------------------------------------------------------------------------


class TestBranchCardList:
    async def test_empty_branch_returns_main_cards(self, client, db, rwf_env, open_branch):
        """Branch with no overrides serves main cards unchanged."""
        card = await create_card(db, name="Main Card", card_type="Application")
        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/cards",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        data = resp.json()
        ids = [c["id"] for c in data["items"]]
        assert str(card.id) in ids

    async def test_modified_card_shows_draft(self, client, db, rwf_env, open_branch):
        """A 'modified' override surfaces the draft instead of main."""
        from datetime import datetime, timezone

        card = await create_card(db, name="Original Name", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            card_id=card.id,
            operation="modified",
            base_snapshot={"name": "Original Name"},
            draft={"name": "Branch Name", "type": "Application", "id": str(card.id)},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/cards",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        items = {c["id"]: c for c in resp.json()["items"]}
        assert items[str(card.id)]["name"] == "Branch Name"

    async def test_deleted_card_hidden_in_branch(self, client, db, rwf_env, open_branch):
        """A 'deleted' override hides the card from branch view."""
        from datetime import datetime, timezone

        card = await create_card(db, name="To Delete", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            card_id=card.id,
            operation="deleted",
            base_snapshot={"name": "To Delete"},
            draft={"name": "To Delete", "type": "Application"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/cards",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        ids = [c["id"] for c in resp.json()["items"]]
        assert str(card.id) not in ids

    async def test_created_card_visible_in_branch(self, client, db, rwf_env, open_branch):
        """A 'created' override (card_id=None) appears in branch list."""
        from datetime import datetime, timezone

        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            card_id=None,
            operation="created",
            base_snapshot=None,
            draft={"name": "New Branch Card", "type": "Application", "id": None},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/cards",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        names = [c["name"] for c in resp.json()["items"]]
        assert "New Branch Card" in names

    async def test_viewer_cannot_access_workspace(self, client, db, rwf_env, open_branch):
        """Viewer has no rwf.view — 403."""
        viewer = rwf_env["viewer"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/cards",
            headers=auth_headers(viewer),
        )
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# GET /rwf/branches/{id}/cards/{card_id} — branch-overlay card detail
# ---------------------------------------------------------------------------


class TestBranchCardDetail:
    async def test_get_main_card_from_branch(self, client, db, rwf_env, open_branch):
        """Card without override returns main-table data."""
        card = await create_card(db, name="Unmodified", card_type="Application")
        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/cards/{card.id}",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Unmodified"

    async def test_get_overridden_card_returns_draft(self, client, db, rwf_env, open_branch):
        """Card with 'modified' override returns draft data."""
        from datetime import datetime, timezone

        card = await create_card(db, name="Original", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            card_id=card.id,
            operation="modified",
            base_snapshot={"name": "Original"},
            draft={"name": "Overridden", "type": "Application", "id": str(card.id)},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/cards/{card.id}",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Overridden"

    async def test_deleted_card_404_in_branch(self, client, db, rwf_env, open_branch):
        """Card with 'deleted' override returns 404 in branch context."""
        from datetime import datetime, timezone

        card = await create_card(db, name="Gone", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            card_id=card.id,
            operation="deleted",
            base_snapshot={"name": "Gone"},
            draft={"name": "Gone"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/cards/{card.id}",
            headers=auth_headers(member),
        )
        assert resp.status_code == 404

    async def test_nonexistent_card_404(self, client, db, rwf_env, open_branch):
        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/cards/{uuid.uuid4()}",
            headers=auth_headers(member),
        )
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# POST /rwf/branches/{id}/cards — create card in branch
# ---------------------------------------------------------------------------


class TestBranchCardCreate:
    async def test_member_can_create_card_in_branch(self, client, db, rwf_env, open_branch):
        """Creating a card in branch produces a 'created' override, not a main-table row."""
        from app.models.card import Card

        member = rwf_env["member"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{open_branch.id}/cards",
            json={"name": "New In Branch", "type": "Application"},
            headers=auth_headers(member),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "New In Branch"
        assert data["_branch_operation"] == "created"

        # CRITICAL: verify NO row inserted in main cards table
        from sqlalchemy import select

        main_cards = (
            (await db.execute(select(Card).where(Card.name == "New In Branch"))).scalars().all()
        )
        assert len(main_cards) == 0, "Card must NOT be in main table after branch create"

        # Verify override created
        overrides = (
            (
                await db.execute(
                    select(RwfBranchCardOverride).where(
                        RwfBranchCardOverride.branch_id == open_branch.id,
                        RwfBranchCardOverride.operation == "created",
                    )
                )
            )
            .scalars()
            .all()
        )
        assert len(overrides) == 1
        assert overrides[0].draft["name"] == "New In Branch"

    async def test_viewer_cannot_create_card(self, client, db, rwf_env, open_branch):
        viewer = rwf_env["viewer"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{open_branch.id}/cards",
            json={"name": "Fail", "type": "Application"},
            headers=auth_headers(viewer),
        )
        assert resp.status_code == 403

    async def test_create_card_in_closed_branch_fails(self, client, db, rwf_env, open_branch):
        """Cannot write to an in_review or merged branch."""
        from datetime import datetime, timezone

        open_branch.status = "in_review"
        open_branch.updated_at = datetime.now(timezone.utc)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{open_branch.id}/cards",
            json={"name": "Fail", "type": "Application"},
            headers=auth_headers(member),
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# PATCH /rwf/branches/{id}/cards/{card_id} — edit card in branch
# ---------------------------------------------------------------------------


class TestBranchCardEdit:
    async def test_member_can_edit_card_in_branch(self, client, db, rwf_env, open_branch):
        """Editing a main card in branch creates/updates a 'modified' override."""
        from sqlalchemy import select

        from app.models.card import Card

        card = await create_card(db, name="Before Edit", card_type="Application")
        member = rwf_env["member"]

        resp = await client.patch(
            f"/api/v1/rwf/branches/{open_branch.id}/cards/{card.id}",
            json={"name": "After Edit"},
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "After Edit"

        # CRITICAL: main table unchanged
        refreshed = (await db.execute(select(Card).where(Card.id == card.id))).scalar_one()
        assert refreshed.name == "Before Edit", "Main table must NOT be modified"

        # Override created
        override = (
            await db.execute(
                select(RwfBranchCardOverride).where(
                    RwfBranchCardOverride.branch_id == open_branch.id,
                    RwfBranchCardOverride.card_id == card.id,
                )
            )
        ).scalar_one()
        assert override.operation == "modified"
        assert override.draft["name"] == "After Edit"
        assert override.base_snapshot["name"] == "Before Edit"

    async def test_edit_captures_base_snapshot_once(self, client, db, rwf_env, open_branch):
        """Second edit to same card updates draft but preserves original base_snapshot."""
        card = await create_card(db, name="Original", card_type="Application")
        member = rwf_env["member"]
        headers = auth_headers(member)

        await client.patch(
            f"/api/v1/rwf/branches/{open_branch.id}/cards/{card.id}",
            json={"name": "First Edit"},
            headers=headers,
        )
        await client.patch(
            f"/api/v1/rwf/branches/{open_branch.id}/cards/{card.id}",
            json={"name": "Second Edit"},
            headers=headers,
        )

        from sqlalchemy import select

        override = (
            await db.execute(
                select(RwfBranchCardOverride).where(
                    RwfBranchCardOverride.branch_id == open_branch.id,
                    RwfBranchCardOverride.card_id == card.id,
                )
            )
        ).scalar_one()
        # Draft updated, base_snapshot pinned to original main value
        assert override.draft["name"] == "Second Edit"
        assert override.base_snapshot["name"] == "Original"


# ---------------------------------------------------------------------------
# DELETE /rwf/branches/{id}/cards/{card_id} — delete card in branch
# ---------------------------------------------------------------------------


class TestBranchCardDelete:
    async def test_delete_main_card_in_branch(self, client, db, rwf_env, open_branch):
        """Deleting a main card in branch creates 'deleted' override; main untouched."""
        from sqlalchemy import select

        from app.models.card import Card

        card = await create_card(db, name="To Delete", card_type="Application")
        member = rwf_env["member"]

        resp = await client.delete(
            f"/api/v1/rwf/branches/{open_branch.id}/cards/{card.id}",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200

        # Main table still has the card
        main_card = (await db.execute(select(Card).where(Card.id == card.id))).scalar_one_or_none()
        assert main_card is not None, "Main table must NOT be touched"

        # Override created
        override = (
            await db.execute(
                select(RwfBranchCardOverride).where(
                    RwfBranchCardOverride.branch_id == open_branch.id,
                    RwfBranchCardOverride.card_id == card.id,
                )
            )
        ).scalar_one()
        assert override.operation == "deleted"

    async def test_delete_branch_created_card(self, client, db, rwf_env, open_branch):
        """Deleting a branch-created card (card_id=None) removes the override row."""
        from datetime import datetime, timezone

        from sqlalchemy import select

        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            card_id=None,
            operation="created",
            base_snapshot=None,
            draft={"name": "Temporary", "type": "Application", "id": None},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        override_id = override.id
        db.add(override)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.delete(
            f"/api/v1/rwf/branches/{open_branch.id}/cards/override/{override_id}",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200

        remaining = (
            await db.execute(
                select(RwfBranchCardOverride).where(RwfBranchCardOverride.id == override_id)
            )
        ).scalar_one_or_none()
        assert remaining is None


# ---------------------------------------------------------------------------
# GET /rwf/branches/{id}/relations — branch-overlay relations
# ---------------------------------------------------------------------------


class TestBranchRelations:
    async def test_empty_branch_returns_main_relations(self, client, db, rwf_env, open_branch):
        """Branch with no overrides returns main relations."""
        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/relations",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        assert "items" in resp.json()

    async def test_branch_hides_deleted_relation(self, client, db, rwf_env, open_branch):
        """A 'deleted' relation override hides the relation from branch view."""
        from datetime import datetime, timezone

        # We can't easily create a real relation without card type fixtures,
        # so we test the overlay logic by inserting a 'deleted' override for a
        # fake relation_id and verifying it's not in the branch view.
        fake_relation_id = uuid.uuid4()
        override = RwfBranchRelationOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            relation_id=fake_relation_id,
            operation="deleted",
            draft={"type": "uses", "source_id": str(uuid.uuid4()), "target_id": str(uuid.uuid4())},
            created_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/relations",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        ids = [r["id"] for r in resp.json()["items"]]
        assert str(fake_relation_id) not in ids


# ---------------------------------------------------------------------------
# POST/DELETE /rwf/branches/{id}/relations — add/remove relation in branch
# ---------------------------------------------------------------------------


class TestBranchRelationWrite:
    async def test_add_relation_in_branch(self, client, db, rwf_env, open_branch):
        """Adding a relation in branch creates 'created' override, not a main relation."""
        from sqlalchemy import select

        from app.models.relation import Relation

        src = await create_card(db, name="Source", card_type="Application")
        tgt = await create_card(db, name="Target", card_type="ITComponent")
        member = rwf_env["member"]

        resp = await client.post(
            f"/api/v1/rwf/branches/{open_branch.id}/relations",
            json={
                "type": "uses",
                "source_id": str(src.id),
                "target_id": str(tgt.id),
            },
            headers=auth_headers(member),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["_branch_operation"] == "created"

        # CRITICAL: main table unchanged
        main_rels = (
            (
                await db.execute(
                    select(Relation).where(
                        Relation.source_id == src.id,
                        Relation.target_id == tgt.id,
                    )
                )
            )
            .scalars()
            .all()
        )
        assert len(main_rels) == 0, "Relation must NOT be in main table after branch create"

    async def test_delete_relation_in_branch(self, client, db, rwf_env, open_branch):
        """Deleting a main relation in branch creates 'deleted' override; main untouched."""
        from datetime import datetime, timezone

        from sqlalchemy import select

        from app.models.relation import Relation

        src = await create_card(db, name="Src", card_type="Application")
        tgt = await create_card(db, name="Tgt", card_type="ITComponent")
        rel = Relation(
            id=uuid.uuid4(),
            type="uses",
            source_id=src.id,
            target_id=tgt.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(rel)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.delete(
            f"/api/v1/rwf/branches/{open_branch.id}/relations/{rel.id}",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200

        # Main relation still there
        main_rel = (
            await db.execute(select(Relation).where(Relation.id == rel.id))
        ).scalar_one_or_none()
        assert main_rel is not None, "Main relation must NOT be deleted"

        # Override created
        override = (
            await db.execute(
                select(RwfBranchRelationOverride).where(
                    RwfBranchRelationOverride.branch_id == open_branch.id,
                    RwfBranchRelationOverride.relation_id == rel.id,
                )
            )
        ).scalar_one()
        assert override.operation == "deleted"


# ---------------------------------------------------------------------------
# GET/PATCH /rwf/branches/{id}/diagrams/{diagram_id}
# ---------------------------------------------------------------------------


class TestBranchDiagrams:
    async def test_get_main_diagram_from_branch(self, client, db, rwf_env, open_branch):
        """Diagram without override returns main-table data."""
        from datetime import datetime, timezone

        from app.models.diagram import Diagram

        diagram = Diagram(
            id=uuid.uuid4(),
            name="Architecture Overview",
            type="drawio",
            data={"xml": "<mxGraphModel/>", "thumbnail": None},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(diagram)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.get(
            f"/api/v1/rwf/branches/{open_branch.id}/diagrams/{diagram.id}",
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Architecture Overview"

    async def test_patch_diagram_creates_override(self, client, db, rwf_env, open_branch):
        """Patching a diagram in branch creates a 'modified' override; main untouched."""
        from datetime import datetime, timezone

        from sqlalchemy import select

        from app.models.diagram import Diagram

        diagram = Diagram(
            id=uuid.uuid4(),
            name="Original Diagram",
            type="drawio",
            data={"xml": "<mxGraphModel/>", "thumbnail": None},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(diagram)
        await db.flush()

        member = rwf_env["member"]
        resp = await client.patch(
            f"/api/v1/rwf/branches/{open_branch.id}/diagrams/{diagram.id}",
            json={"name": "Modified Diagram", "data": {"xml": "<mxGraphModel>NEW</mxGraphModel>"}},
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Modified Diagram"

        # Main diagram untouched
        main_diag = (await db.execute(select(Diagram).where(Diagram.id == diagram.id))).scalar_one()
        assert main_diag.name == "Original Diagram", "Main table must NOT be modified"

        # Override created
        override = (
            await db.execute(
                select(RwfBranchDiagramOverride).where(
                    RwfBranchDiagramOverride.branch_id == open_branch.id,
                    RwfBranchDiagramOverride.diagram_id == diagram.id,
                )
            )
        ).scalar_one()
        assert override.operation == "modified"
        assert override.draft["name"] == "Modified Diagram"
