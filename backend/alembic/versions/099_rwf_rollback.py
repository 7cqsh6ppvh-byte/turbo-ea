"""Add pre_merge_snapshot to rwf_branches for merge rollback support.

Stores a complete snapshot of all records in main tables that were touched by
a merge *before* the merge was applied.  This snapshot is what the rollback
endpoint uses to restore the landscape to its pre-merge state.

Revision ID: 099
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "099"
down_revision = "098"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # pre_merge_snapshot: captured just before the merge writes to main tables.
    # NULL for branches that were merged before this migration (no rollback
    # available for them — the UI hides the button when NULL).
    op.add_column(
        "rwf_branches",
        sa.Column(
            "pre_merge_snapshot",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            comment=(
                "Full pre-merge state of all affected records. "
                "Populated by execute_merge() just before writing to main tables. "
                "Used by execute_rollback() to restore the landscape."
            ),
        ),
    )

    # rolled_back_by / rolled_back_at: audit who rolled back and when.
    op.add_column(
        "rwf_branches",
        sa.Column(
            "rolled_back_by",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.add_column(
        "rwf_branches",
        sa.Column(
            "rolled_back_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("rwf_branches", "rolled_back_at")
    op.drop_column("rwf_branches", "rolled_back_by")
    op.drop_column("rwf_branches", "pre_merge_snapshot")
