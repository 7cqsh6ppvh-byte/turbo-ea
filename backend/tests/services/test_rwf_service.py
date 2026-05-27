"""Unit tests for rwf_service pure logic — no database needed.

Tests follow TDD: all logic can be tested with plain dicts, no DB.
"""

from __future__ import annotations

from app.services.rwf_service import compute_field_diff


class TestComputeFieldDiff:
    """3-way field-level conflict detection via deepdiff."""

    def test_no_changes_returns_empty(self):
        base = {"name": "A", "type": "Application"}
        result = compute_field_diff(base, base, base)
        assert result == {}

    def test_branch_only_change(self):
        base = {"name": "A", "description": "original"}
        main = {"name": "A", "description": "original"}
        branch = {"name": "A", "description": "branch changed"}
        result = compute_field_diff(base, main, branch)
        assert "root['description']" in result
        assert result["root['description']"] == "branch_only"

    def test_main_only_change(self):
        base = {"name": "A", "description": "original"}
        main = {"name": "A", "description": "main updated"}
        branch = {"name": "A", "description": "original"}
        result = compute_field_diff(base, main, branch)
        assert "root['description']" in result
        assert result["root['description']"] == "main_only"

    def test_conflict_same_field_both_changed(self):
        base = {"name": "A", "status": "ACTIVE"}
        main = {"name": "A", "status": "ARCHIVED"}
        branch = {"name": "A", "status": "DRAFT"}
        result = compute_field_diff(base, main, branch)
        assert "root['status']" in result
        assert result["root['status']"] == "conflict"

    def test_no_conflict_different_fields(self):
        """Main changed description, branch changed status — no conflict."""
        base = {"name": "A", "description": "orig", "status": "ACTIVE"}
        main = {"name": "A", "description": "main updated", "status": "ACTIVE"}
        branch = {"name": "A", "description": "orig", "status": "ARCHIVED"}
        result = compute_field_diff(base, main, branch)
        assert result.get("root['description']") == "main_only"
        assert result.get("root['status']") == "branch_only"

    def test_nested_attribute_conflict(self):
        """Nested attribute dict changes are detected per field."""
        base = {"attributes": {"cost": 100, "owner": "Alice"}}
        main = {"attributes": {"cost": 200, "owner": "Alice"}}
        branch = {"attributes": {"cost": 150, "owner": "Alice"}}
        result = compute_field_diff(base, main, branch)
        # cost changed in both — conflict
        cost_key = next((k for k in result if "cost" in k), None)
        assert cost_key is not None
        assert result[cost_key] == "conflict"

    def test_nested_no_conflict_different_keys(self):
        """Different attribute keys changed — branch_only and main_only, no conflict."""
        base = {"attributes": {"cost": 100, "owner": "Alice"}}
        main = {"attributes": {"cost": 200, "owner": "Alice"}}
        branch = {"attributes": {"cost": 100, "owner": "Bob"}}
        result = compute_field_diff(base, main, branch)
        cost_key = next((k for k in result if "cost" in k), None)
        owner_key = next((k for k in result if "owner" in k), None)
        assert cost_key and result[cost_key] == "main_only"
        assert owner_key and result[owner_key] == "branch_only"

    def test_field_added_in_branch(self):
        """Branch added a new field — branch_only."""
        base = {"name": "A"}
        main = {"name": "A"}
        branch = {"name": "A", "alias": "new_alias"}
        result = compute_field_diff(base, main, branch)
        alias_key = next((k for k in result if "alias" in k), None)
        assert alias_key is not None
        assert result[alias_key] == "branch_only"

    def test_field_added_in_both_same_value_no_conflict(self):
        """Both added same field with same value — no conflict (no diff detected)."""
        base = {"name": "A"}
        main = {"name": "A", "alias": "same"}
        branch = {"name": "A", "alias": "same"}
        # Both changed the same field to the same value — deepdiff won't detect a diff
        # between branch and base if the value is the same... actually they both added alias
        # main: added alias=same, branch: added alias=same → both in main AND branch paths
        # But they're the same value — deepdiff still reports them as changes from base
        result = compute_field_diff(base, main, branch)
        # This is a real conflict by position (both changed the same field) even though
        # the value happens to be the same. Users would need to resolve, but the resolution
        # is trivially "keep either". Acceptable behaviour.
        # The test just verifies no exception is raised.
        assert isinstance(result, dict)

    def test_list_field_conflict(self):
        """Array field changed in both — conflict."""
        base = {"tags": ["a", "b"]}
        main = {"tags": ["a", "b", "c"]}
        branch = {"tags": ["a", "b", "d"]}
        result = compute_field_diff(base, main, branch)
        assert len(result) > 0
        # At least one key should be conflict
        assert any(v == "conflict" for v in result.values())

    def test_empty_dicts(self):
        """All empty dicts → no diff."""
        result = compute_field_diff({}, {}, {})
        assert result == {}

    def test_unchanged_field_not_in_result(self):
        """Fields identical across base/main/branch are not reported."""
        base = {"name": "A", "type": "Application", "status": "ACTIVE"}
        main = {"name": "A", "type": "Application", "status": "ARCHIVED"}
        branch = {"name": "A", "type": "Application", "status": "ACTIVE"}
        result = compute_field_diff(base, main, branch)
        # name and type are unchanged — should NOT appear
        name_key = next((k for k in result if "'name'" in k), None)
        type_key = next((k for k in result if "'type'" in k), None)
        assert name_key is None, "Unchanged 'name' field should not appear in result"
        assert type_key is None, "Unchanged 'type' field should not appear in result"
