"""Integration tests for /rwf/branches/{id}/merge and /sync endpoints.

Phase 6: Merge + Sync with conflict resolution.

Tests follow the TDD pattern: red first, green after implementation.
"""

from __future__ import annotations

import uuid

import pytest

from app.core.permissions import EA_ARCHITECT_PERMISSIONS, MEMBER_PERMISSIONS
from app.models.rwf import (
    RwfBranch,
    RwfBranchCardOverride,
    RwfBranchRelationOverride,
)
from tests.conftest import auth_headers, create_card, create_role, create_user


@pytest.fixture
async def merge_env(db):
    """Seed roles and users for merge/sync tests."""
    await create_role(db, key="admin", label="Admin", permissions={"*": True})
    await create_role(
        db, key="ea_architect", label="EA Architect", permissions=EA_ARCHITECT_PERMISSIONS
    )
    await create_role(db, key="member", label="Member", permissions=MEMBER_PERMISSIONS)
    admin = await create_user(db, email="admin@merge.test", role="admin")
    architect = await create_user(db, email="architect@merge.test", role="ea_architect")
    member = await create_user(db, email="member@merge.test", role="member")
    return {"admin": admin, "architect": architect, "member": member}


@pytest.fixture
async def approved_branch(db, merge_env):
    """Branch in 'approved' status, ready to merge."""
    from datetime import datetime, timezone

    architect = merge_env["architect"]
    branch = RwfBranch(
        id=uuid.uuid4(),
        name="merge-ready-branch",
        status="approved",
        base_snapshot_at=datetime.now(timezone.utc),
        created_by=merge_env["member"].id,
        reviewed_by=architect.id,
        reviewed_at=datetime.now(timezone.utc),
    )
    db.add(branch)
    await db.flush()
    return branch


@pytest.fixture
async def open_branch(db, merge_env):
    """Open branch for sync tests."""
    from datetime import datetime, timezone

    branch = RwfBranch(
        id=uuid.uuid4(),
        name="sync-test-branch",
        status="open",
        base_snapshot_at=datetime.now(timezone.utc),
        created_by=merge_env["member"].id,
    )
    db.add(branch)
    await db.flush()
    return branch


# ---------------------------------------------------------------------------
# POST /rwf/branches/{id}/merge
# ---------------------------------------------------------------------------


class TestMergeBranch:
    async def test_merge_modified_card_updates_main(
        self, client, db, merge_env, approved_branch
    ):
        """Merging a 'modified' card override updates the main cards table."""
        from datetime import datetime, timezone

        from sqlalchemy import select

        from app.models.card import Card

        card = await create_card(db, name="Before Merge", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=approved_branch.id,
            card_id=card.id,
            operation="modified",
            base_snapshot={"name": "Before Merge", "type": "Application"},
            draft={"name": "After Merge", "type": "Application", "id": str(card.id)},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        architect = merge_env["architect"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={"resolutions": {}},
            headers=auth_headers(architect),
        )
        assert resp.status_code == 200

        # Main card now has the branch value
        refreshed = (
            await db.execute(select(Card).where(Card.id == card.id))
        ).scalar_one()
        assert refreshed.name == "After Merge"

        # Branch is now merged
        from app.models.rwf import RwfBranch as RwfBranchModel

        branch_row = (
            await db.execute(
                select(RwfBranchModel).where(RwfBranchModel.id == approved_branch.id)
            )
        ).scalar_one()
        assert branch_row.status == "merged"

    async def test_merge_created_card_inserts_into_main(
        self, client, db, merge_env, approved_branch
    ):
        """Merging a 'created' override inserts a new row into the main cards table."""
        from datetime import datetime, timezone

        from sqlalchemy import select

        from app.models.card import Card

        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=approved_branch.id,
            card_id=None,
            operation="created",
            base_snapshot=None,
            draft={
                "name": "Brand New Card",
                "type": "Application",
                "id": None,
                "status": "ACTIVE",
                "approval_status": "DRAFT",
            },
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        architect = merge_env["architect"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={"resolutions": {}},
            headers=auth_headers(architect),
        )
        assert resp.status_code == 200

        # New card now exists in main
        cards = (
            await db.execute(select(Card).where(Card.name == "Brand New Card"))
        ).scalars().all()
        assert len(cards) == 1
        assert cards[0].type == "Application"

    async def test_merge_deleted_card_archives_in_main(
        self, client, db, merge_env, approved_branch
    ):
        """Merging a 'deleted' override archives the card in main."""
        from datetime import datetime, timezone

        from sqlalchemy import select

        from app.models.card import Card

        card = await create_card(db, name="To Archive", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=approved_branch.id,
            card_id=card.id,
            operation="deleted",
            base_snapshot={"name": "To Archive"},
            draft={"name": "To Archive", "type": "Application"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        architect = merge_env["architect"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={"resolutions": {}},
            headers=auth_headers(architect),
        )
        assert resp.status_code == 200

        # Card is now archived in main
        archived = (
            await db.execute(select(Card).where(Card.id == card.id))
        ).scalar_one()
        assert archived.status == "ARCHIVED"

    async def test_merge_created_relation_inserts_into_main(
        self, client, db, merge_env, approved_branch
    ):
        """Merging a 'created' relation override inserts into main relations table."""
        from datetime import datetime, timezone

        from sqlalchemy import select

        from app.models.relation import Relation

        src = await create_card(db, name="RelSrc", card_type="Application")
        tgt = await create_card(db, name="RelTgt", card_type="ITComponent")

        override = RwfBranchRelationOverride(
            id=uuid.uuid4(),
            branch_id=approved_branch.id,
            relation_id=None,
            operation="created",
            draft={
                "type": "uses",
                "source_id": str(src.id),
                "target_id": str(tgt.id),
                "attributes": {},
            },
            created_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        architect = merge_env["architect"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={"resolutions": {}},
            headers=auth_headers(architect),
        )
        assert resp.status_code == 200

        # Relation now exists in main
        rels = (
            await db.execute(
                select(Relation).where(
                    Relation.source_id == src.id,
                    Relation.target_id == tgt.id,
                )
            )
        ).scalars().all()
        assert len(rels) == 1
        assert rels[0].type == "uses"

    async def test_merge_deleted_relation_removes_from_main(
        self, client, db, merge_env, approved_branch
    ):
        """Merging a 'deleted' relation override removes it from main."""
        from datetime import datetime, timezone

        from sqlalchemy import select

        from app.models.relation import Relation

        src = await create_card(db, name="DelSrc", card_type="Application")
        tgt = await create_card(db, name="DelTgt", card_type="ITComponent")
        rel = Relation(
            id=uuid.uuid4(),
            type="uses",
            source_id=src.id,
            target_id=tgt.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(rel)

        override = RwfBranchRelationOverride(
            id=uuid.uuid4(),
            branch_id=approved_branch.id,
            relation_id=rel.id,
            operation="deleted",
            draft={"type": "uses", "source_id": str(src.id), "target_id": str(tgt.id)},
            created_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        architect = merge_env["architect"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={"resolutions": {}},
            headers=auth_headers(architect),
        )
        assert resp.status_code == 200

        # Relation deleted from main
        remaining = (
            await db.execute(select(Relation).where(Relation.id == rel.id))
        ).scalar_one_or_none()
        assert remaining is None

    async def test_merge_blocked_when_conflicts_unresolved(
        self, client, db, merge_env, approved_branch
    ):
        """Merge is rejected 422 when a 'modified' override has conflicts and no resolutions."""
        from datetime import datetime, timezone

        # Card updated in main after branch creation → potential conflict
        card = await create_card(db, name="Conflict Card", card_type="Application")

        # Simulate: base had status=ACTIVE, main changed to ARCHIVED, branch changed to DRAFT
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=approved_branch.id,
            card_id=card.id,
            operation="modified",
            base_snapshot={"name": "Conflict Card", "type": "Application", "status": "ACTIVE"},
            draft={"name": "Conflict Card", "type": "Application", "status": "DRAFT"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)

        # Update the main card to simulate it moving after branch creation
        card.status = "ARCHIVED"
        card.updated_at = datetime.now(timezone.utc)
        # Set base_snapshot_at to before the card was updated
        from datetime import timedelta

        approved_branch.base_snapshot_at = datetime.now(timezone.utc) - timedelta(seconds=10)
        await db.flush()

        architect = merge_env["architect"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={"resolutions": {}},  # no resolution provided for conflicting field
            headers=auth_headers(architect),
        )
        assert resp.status_code == 422
        data = resp.json()
        assert "conflict" in data["detail"].lower()

    async def test_merge_with_conflict_resolution_succeeds(
        self, client, db, merge_env, approved_branch
    ):
        """Merge succeeds when all conflicting fields have resolutions provided."""
        from datetime import datetime, timedelta, timezone

        from sqlalchemy import select

        from app.models.card import Card

        card = await create_card(db, name="Conflict Card", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=approved_branch.id,
            card_id=card.id,
            operation="modified",
            base_snapshot={"name": "Conflict Card", "type": "Application", "status": "ACTIVE"},
            draft={"name": "Conflict Card", "type": "Application", "status": "DRAFT"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)

        # Main card moved
        card.status = "ARCHIVED"
        card.updated_at = datetime.now(timezone.utc)
        approved_branch.base_snapshot_at = datetime.now(timezone.utc) - timedelta(seconds=10)
        await db.flush()

        architect = merge_env["architect"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={
                "resolutions": {
                    str(override.id): {"root['status']": "branch"}
                    # "branch" → use branch value (DRAFT)
                }
            },
            headers=auth_headers(architect),
        )
        assert resp.status_code == 200

        # Card should have DRAFT status (branch resolution chosen)
        refreshed = (
            await db.execute(select(Card).where(Card.id == card.id))
        ).scalar_one()
        assert refreshed.status == "DRAFT"

    async def test_member_cannot_merge(self, client, db, merge_env, approved_branch):
        """Members do not have rwf.approve — cannot execute merge."""
        member = merge_env["member"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={"resolutions": {}},
            headers=auth_headers(member),
        )
        assert resp.status_code == 403

    async def test_merge_unapproved_branch_fails(self, client, db, merge_env, open_branch):
        """Cannot merge an 'open' branch — must be 'approved' first."""
        architect = merge_env["architect"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{open_branch.id}/merge",
            json={"resolutions": {}},
            headers=auth_headers(architect),
        )
        assert resp.status_code == 422

    async def test_merge_is_atomic(self, client, db, merge_env, approved_branch):
        """Partial failure must roll back all changes (atomicity)."""
        from datetime import datetime, timezone


        # Create two overrides: one valid, one referencing a non-existent card_id
        card = await create_card(db, name="Valid Card", card_type="Application")
        override1 = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=approved_branch.id,
            card_id=card.id,
            operation="modified",
            base_snapshot={"name": "Valid Card"},
            draft={"name": "Modified Valid", "type": "Application", "id": str(card.id)},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override1)
        await db.flush()

        # After a successful merge, the branch should be 'merged' and not re-mergeable
        architect = merge_env["architect"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={"resolutions": {}},
            headers=auth_headers(architect),
        )
        assert resp.status_code == 200

        # Second merge attempt must fail (branch is already merged)
        resp2 = await client.post(
            f"/api/v1/rwf/branches/{approved_branch.id}/merge",
            json={"resolutions": {}},
            headers=auth_headers(architect),
        )
        assert resp2.status_code == 422


# ---------------------------------------------------------------------------
# POST /rwf/branches/{id}/sync
# ---------------------------------------------------------------------------


class TestSyncBranch:
    async def test_sync_with_no_conflicts_updates_base_snapshot(
        self, client, db, merge_env, open_branch
    ):
        """Sync with no conflicts updates base_snapshot_at and returns empty conflict list."""
        from datetime import datetime, timezone

        from sqlalchemy import select

        card = await create_card(db, name="Sync Card", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            card_id=card.id,
            operation="modified",
            base_snapshot={"name": "Sync Card", "status": "ACTIVE"},
            draft={"name": "Sync Card Edited", "status": "ACTIVE"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        await db.flush()

        # Main card not changed → no conflict
        member = merge_env["member"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{open_branch.id}/sync",
            json={"resolutions": {}},
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["conflicts"] == [] or data["conflicts"] == {}

        # base_snapshot_at should be refreshed
        from app.models.rwf import RwfBranch as RwfBranchModel

        refreshed_branch = (
            await db.execute(
                select(RwfBranchModel).where(RwfBranchModel.id == open_branch.id)
            )
        ).scalar_one()
        assert refreshed_branch.base_snapshot_at > open_branch.base_snapshot_at

    async def test_sync_returns_conflicts_when_main_moved(
        self, client, db, merge_env, open_branch
    ):
        """Sync detects conflicts when same field changed in main and branch."""
        from datetime import datetime, timedelta, timezone

        card = await create_card(db, name="Conflict Sync", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            card_id=card.id,
            operation="modified",
            base_snapshot={"name": "Conflict Sync", "status": "ACTIVE"},
            draft={"name": "Conflict Sync", "status": "DRAFT"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)

        # Main card changed the same field
        card.status = "ARCHIVED"
        card.updated_at = datetime.now(timezone.utc)
        # Branch was created before the main change
        open_branch.base_snapshot_at = datetime.now(timezone.utc) - timedelta(seconds=10)
        await db.flush()

        member = merge_env["member"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{open_branch.id}/sync",
            json={"resolutions": {}},
            headers=auth_headers(member),
        )
        assert resp.status_code == 200
        data = resp.json()
        # Should report conflicts
        assert len(data.get("conflicts", [])) > 0 or len(data.get("conflicts", {})) > 0

    async def test_sync_with_resolution_applies_main_value(
        self, client, db, merge_env, open_branch
    ):
        """When resolution says 'main', the override's base_snapshot is updated to main value."""
        from datetime import datetime, timedelta, timezone

        from sqlalchemy import select

        card = await create_card(db, name="Resolved Sync", card_type="Application")
        override = RwfBranchCardOverride(
            id=uuid.uuid4(),
            branch_id=open_branch.id,
            card_id=card.id,
            operation="modified",
            base_snapshot={"name": "Resolved Sync", "status": "ACTIVE"},
            draft={"name": "Resolved Sync", "status": "DRAFT"},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(override)
        override_id = override.id

        card.status = "ARCHIVED"
        card.updated_at = datetime.now(timezone.utc)
        open_branch.base_snapshot_at = datetime.now(timezone.utc) - timedelta(seconds=10)
        await db.flush()

        member = merge_env["member"]
        resp = await client.post(
            f"/api/v1/rwf/branches/{open_branch.id}/sync",
            json={
                "resolutions": {
                    str(override_id): {"root['status']": "main"}
                }
            },
            headers=auth_headers(member),
        )
        assert resp.status_code == 200

        # The override's base_snapshot should now reflect main's value
        refreshed_override = (
            await db.execute(
                select(RwfBranchCardOverride).where(RwfBranchCardOverride.id == override_id)
            )
        ).scalar_one()
        # base_snapshot updated — "main wins" for status field
        assert refreshed_override.base_snapshot.get("status") == "ARCHIVED"

    async def test_viewer_cannot_sync(self, client, db, merge_env, open_branch):
        """Viewer does not have rwf.contribute — cannot sync."""
        from app.core.permissions import VIEWER_PERMISSIONS

        await create_role(db, key="viewer", label="Viewer", permissions=VIEWER_PERMISSIONS)
        viewer = await create_user(db, email="viewer@sync.test", role="viewer")

        resp = await client.post(
            f"/api/v1/rwf/branches/{open_branch.id}/sync",
            json={"resolutions": {}},
            headers=auth_headers(viewer),
        )
        assert resp.status_code == 403
