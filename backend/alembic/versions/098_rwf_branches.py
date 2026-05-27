"""Add RWF branch tables and ea_snapshots

Revision ID: 098
Revises: 097
Create Date: 2026-05-27
"""

from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "098"
down_revision = "097"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Named branch workspaces
    op.create_table(
        "rwf_branches",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("status", sa.Text, nullable=False, server_default="open"),
        sa.Column("base_snapshot_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column(
            "created_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "reviewed_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("reviewed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("review_comment", sa.Text, nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("rwf_branches_status_idx", "rwf_branches", ["status"])
    op.create_index("rwf_branches_created_by_idx", "rwf_branches", ["created_by"])

    # Named immutable snapshots of main ("git tags")
    op.create_table(
        "ea_snapshots",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.Text, nullable=False, unique=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("snapshot_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("cards_payload", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("relations_payload", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("diagrams_payload", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column(
            "created_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index(
        "ea_snapshots_snapshot_at_idx",
        "ea_snapshots",
        ["snapshot_at"],
        postgresql_ops={"snapshot_at": "DESC"},
    )

    # Per-card overrides in a branch (copy-on-write)
    op.create_table(
        "rwf_branch_card_overrides",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "branch_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("rwf_branches.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "card_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("cards.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("operation", sa.Text, nullable=False),
        sa.Column("base_snapshot", postgresql.JSONB, nullable=True),
        sa.Column("draft", postgresql.JSONB, nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index(
        "rwf_bco_unique",
        "rwf_branch_card_overrides",
        ["branch_id", "card_id"],
        unique=True,
        postgresql_where=sa.text("card_id IS NOT NULL"),
    )
    op.create_index(
        "rwf_bco_branch_card_idx", "rwf_branch_card_overrides", ["branch_id", "card_id"]
    )
    op.create_index("rwf_bco_branch_idx", "rwf_branch_card_overrides", ["branch_id"])

    # Per-relation overrides (add / remove only)
    op.create_table(
        "rwf_branch_relation_overrides",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "branch_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("rwf_branches.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "relation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("relations.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("operation", sa.Text, nullable=False),
        sa.Column("draft", postgresql.JSONB, nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index(
        "rwf_bro_unique",
        "rwf_branch_relation_overrides",
        ["branch_id", "relation_id"],
        unique=True,
        postgresql_where=sa.text("relation_id IS NOT NULL"),
    )
    op.create_index("rwf_bro_branch_idx", "rwf_branch_relation_overrides", ["branch_id"])

    # Per-diagram overrides (includes VisualFirst diagrams)
    op.create_table(
        "rwf_branch_diagram_overrides",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "branch_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("rwf_branches.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "diagram_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("diagrams.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("operation", sa.Text, nullable=False),
        sa.Column("base_snapshot", postgresql.JSONB, nullable=True),
        sa.Column("draft", postgresql.JSONB, nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index(
        "rwf_bdo_unique",
        "rwf_branch_diagram_overrides",
        ["branch_id", "diagram_id"],
        unique=True,
        postgresql_where=sa.text("diagram_id IS NOT NULL"),
    )
    op.create_index("rwf_bdo_branch_idx", "rwf_branch_diagram_overrides", ["branch_id"])

    # Fast guard for conflict detection: only run deepdiff when updated_at > base_snapshot_at
    op.create_index("cards_updated_at_idx", "cards", ["updated_at"])
    op.create_index("relations_updated_at_idx", "relations", ["updated_at"])
    op.create_index("diagrams_updated_at_idx", "diagrams", ["updated_at"])


def downgrade() -> None:
    op.drop_index("diagrams_updated_at_idx", table_name="diagrams")
    op.drop_index("relations_updated_at_idx", table_name="relations")
    op.drop_index("cards_updated_at_idx", table_name="cards")
    op.drop_table("rwf_branch_diagram_overrides")
    op.drop_table("rwf_branch_relation_overrides")
    op.drop_table("rwf_branch_card_overrides")
    op.drop_table("ea_snapshots")
    op.drop_table("rwf_branches")
