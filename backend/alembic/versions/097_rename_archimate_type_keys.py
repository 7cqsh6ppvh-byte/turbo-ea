"""Strip arch_ prefix from ArchiMate type keys and ArchiMate: from categories.

Removes the plugin-specific key prefixes that were used as a discriminator when
the ArchiMate metamodel shared the key namespace with core Turbo EA types.
After this migration, plugin_id = 'archimate' is the sole discriminator.

Changes:
  card_types.key:      arch_X          → X     (plugin_id = 'archimate')
  card_types.category: ArchiMate:X     → X     (plugin_id = 'archimate')
  relation_types.key:  arch_rel_X      → X     (plugin_id = 'archimate')
  cards.type:          arch_X          → X     (where type LIKE 'arch_%')
  relations.type:      arch_rel_X      → X     (where type LIKE 'arch_rel_%')
  diagrams.data JSONB: node.type and node.data.elementTypeKey arch_ → stripped

Revision ID: 097
Revises: 096
Create Date: 2026-05-26
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = "097"
down_revision: Union[str, None] = "096"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. card_types.key — strip "arch_" prefix
    op.execute(
        """
        UPDATE card_types
        SET key = SUBSTR(key, 6)
        WHERE plugin_id = 'archimate'
          AND key LIKE 'arch_%'
        """
    )

    # 2. card_types.category — strip "ArchiMate:" prefix
    op.execute(
        """
        UPDATE card_types
        SET category = SUBSTR(category, 11)
        WHERE plugin_id = 'archimate'
          AND category LIKE 'ArchiMate:%'
        """
    )

    # 3. relation_types.key — strip "arch_rel_" prefix
    op.execute(
        """
        UPDATE relation_types
        SET key = SUBSTR(key, 9)
        WHERE plugin_id = 'archimate'
          AND key LIKE 'arch_rel_%'
        """
    )

    # 4. cards.type — strip "arch_" prefix from cards whose type was an arch_ key
    op.execute(
        """
        UPDATE cards
        SET type = SUBSTR(type, 6)
        WHERE type LIKE 'arch_%'
        """
    )

    # 5. relations.type — strip "arch_rel_" prefix
    op.execute(
        """
        UPDATE relations
        SET type = SUBSTR(type, 9)
        WHERE type LIKE 'arch_rel_%'
        """
    )

    # 6. diagrams.data JSONB — rewrite node type and elementTypeKey fields
    #    for all archimate-type diagrams stored as ReactFlow canvas state.
    op.execute(
        """
        DO $$
        DECLARE
            rec RECORD;
            nodes JSONB;
            node JSONB;
            new_nodes JSONB;
            new_node JSONB;
            node_type TEXT;
            elem_key TEXT;
        BEGIN
            FOR rec IN
                SELECT id, data FROM diagrams WHERE type = 'archimate' AND data IS NOT NULL
            LOOP
                nodes := rec.data -> 'nodes';
                IF nodes IS NULL OR jsonb_array_length(nodes) = 0 THEN
                    CONTINUE;
                END IF;

                new_nodes := '[]'::JSONB;
                FOR node IN SELECT * FROM jsonb_array_elements(nodes)
                LOOP
                    new_node := node;

                    -- Strip arch_ from node.type
                    node_type := node ->> 'type';
                    IF node_type LIKE 'arch_%' THEN
                        new_node := jsonb_set(new_node, '{type}',
                            to_jsonb(SUBSTR(node_type, 6)));
                    END IF;

                    -- Strip arch_ from node.data.elementTypeKey
                    elem_key := node -> 'data' ->> 'elementTypeKey';
                    IF elem_key LIKE 'arch_%' THEN
                        new_node := jsonb_set(new_node, '{data,elementTypeKey}',
                            to_jsonb(SUBSTR(elem_key, 6)));
                    END IF;

                    new_nodes := new_nodes || new_node;
                END LOOP;

                UPDATE diagrams
                SET data = jsonb_set(rec.data, '{nodes}', new_nodes)
                WHERE id = rec.id;
            END LOOP;
        END;
        $$;
        """
    )


def downgrade() -> None:
    # Restore arch_ prefix on card_types, relation_types
    op.execute(
        """
        UPDATE card_types
        SET key = 'arch_' || key
        WHERE plugin_id = 'archimate'
          AND key NOT LIKE 'arch_%'
        """
    )
    op.execute(
        """
        UPDATE card_types
        SET category = 'ArchiMate:' || category
        WHERE plugin_id = 'archimate'
          AND category NOT LIKE 'ArchiMate:%'
        """
    )
    op.execute(
        """
        UPDATE relation_types
        SET key = 'arch_rel_' || key
        WHERE plugin_id = 'archimate'
          AND key NOT LIKE 'arch_rel_%'
        """
    )
    op.execute(
        """
        UPDATE cards
        SET type = 'arch_' || type
        WHERE type IN (
            SELECT key FROM card_types WHERE plugin_id = 'archimate'
        )
        """
    )
    op.execute(
        """
        UPDATE relations
        SET type = 'arch_rel_' || type
        WHERE type IN (
            SELECT key FROM relation_types WHERE plugin_id = 'archimate'
        )
        """
    )
