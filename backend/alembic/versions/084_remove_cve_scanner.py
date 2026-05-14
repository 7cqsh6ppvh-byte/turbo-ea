"""Remove the TurboLens CVE scanner feature.

Drops the ``turbolens_cve_findings`` table, purges TurboLens analysis runs that
recorded CVE scans, and removes risks that were promoted from CVE findings
(along with their card joins and the system Todos that were linked to those
risks). The Compliance scanner is unaffected.

Revision ID: 084
Revises: 083
Create Date: 2026-05-14
"""

from typing import Union

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

from alembic import op

revision: str = "084"
down_revision: Union[str, None] = "083"
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            "DELETE FROM risk_cards WHERE risk_id IN ("
            "SELECT id FROM risks WHERE source_type = 'security_cve')"
        )
    )
    op.execute(
        sa.text(
            "DELETE FROM todos WHERE is_system = true AND link IN ("
            "SELECT '/ea-delivery/risks/' || id::text FROM risks "
            "WHERE source_type = 'security_cve')"
        )
    )

    op.drop_index("ix_turbolens_cve_findings_risk_id", table_name="turbolens_cve_findings")
    op.drop_index("ix_turbolens_cve_findings_priority", table_name="turbolens_cve_findings")
    op.drop_index("ix_turbolens_cve_findings_severity", table_name="turbolens_cve_findings")
    op.drop_index("ix_turbolens_cve_findings_cve_id", table_name="turbolens_cve_findings")
    op.drop_index("ix_turbolens_cve_findings_status", table_name="turbolens_cve_findings")
    op.drop_index("ix_turbolens_cve_findings_run_id", table_name="turbolens_cve_findings")
    op.drop_index(
        "ix_turbolens_cve_findings_card_id_severity",
        table_name="turbolens_cve_findings",
    )
    op.drop_table("turbolens_cve_findings")

    op.execute(sa.text("DELETE FROM risks WHERE source_type = 'security_cve'"))
    op.execute(sa.text("DELETE FROM turbolens_analysis_runs WHERE analysis_type = 'security_cve'"))


def downgrade() -> None:
    # Recreates the table + indexes so the rollback test (and any manual
    # downgrade) can run. Row data — CVE findings, the risks promoted from
    # them, their card joins and Todos, and the matching analysis-run history —
    # is destroyed on upgrade and cannot be reconstructed; only the schema is
    # restored.
    op.create_table(
        "turbolens_cve_findings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "run_id",
            UUID(as_uuid=True),
            sa.ForeignKey("turbolens_analysis_runs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "card_id",
            UUID(as_uuid=True),
            sa.ForeignKey("cards.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("card_type", sa.String(64), nullable=False),
        sa.Column("cve_id", sa.String(32), nullable=False),
        sa.Column("vendor", sa.String(255), nullable=False, server_default=""),
        sa.Column("product", sa.String(255), nullable=False, server_default=""),
        sa.Column("version", sa.String(128), nullable=True),
        sa.Column("cvss_score", sa.Float(), nullable=True),
        sa.Column("cvss_vector", sa.String(128), nullable=True),
        sa.Column("severity", sa.String(16), nullable=False, server_default="unknown"),
        sa.Column("attack_vector", sa.String(16), nullable=True),
        sa.Column("exploitability_score", sa.Float(), nullable=True),
        sa.Column("impact_score", sa.Float(), nullable=True),
        sa.Column("patch_available", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("published_date", sa.Date(), nullable=True),
        sa.Column("last_modified_date", sa.Date(), nullable=True),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("nvd_references", JSONB, nullable=True),
        sa.Column("priority", sa.String(16), nullable=False, server_default="medium"),
        sa.Column("probability", sa.String(16), nullable=False, server_default="medium"),
        sa.Column("business_impact", sa.Text(), nullable=True),
        sa.Column("remediation", sa.Text(), nullable=True),
        sa.Column("status", sa.String(16), nullable=False, server_default="open"),
        sa.Column(
            "risk_id",
            UUID(as_uuid=True),
            sa.ForeignKey("risks.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_turbolens_cve_findings_card_id_severity",
        "turbolens_cve_findings",
        ["card_id", "severity"],
    )
    op.create_index("ix_turbolens_cve_findings_run_id", "turbolens_cve_findings", ["run_id"])
    op.create_index("ix_turbolens_cve_findings_status", "turbolens_cve_findings", ["status"])
    op.create_index("ix_turbolens_cve_findings_cve_id", "turbolens_cve_findings", ["cve_id"])
    op.create_index("ix_turbolens_cve_findings_severity", "turbolens_cve_findings", ["severity"])
    op.create_index("ix_turbolens_cve_findings_priority", "turbolens_cve_findings", ["priority"])
    op.create_index("ix_turbolens_cve_findings_risk_id", "turbolens_cve_findings", ["risk_id"])
