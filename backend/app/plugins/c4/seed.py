"""C4 Model metamodel seed.

Inserts 8 element card types and 6 relation types, all with:
- key prefix: c4_
- category prefix: C4:
- plugin_id = "c4"
- built_in = False
- translations for all 8 supported locales

The C4 Model (https://c4model.com) describes software architecture at four
levels of abstraction: Context, Container, Component, and Code. This plugin
covers levels 1–3; level 4 (Code) is text/reference only and has no canvas.

Idempotent: running twice inserts nothing new.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card_type import CardType
from app.models.relation_type import RelationType

PLUGIN_ID = "c4"

# ---------------------------------------------------------------------------
# Element types (8 total)
# ---------------------------------------------------------------------------

_ELEMENT_TYPES: list[dict] = [
    # ── Level 1: Context ────────────────────────────────────────────────────
    {
        "key": "c4_Person",
        "label": "Person",
        "category": "C4:Context",
        "icon": "person",
        "color": "#08427b",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Person",
                "fr": "Personne",
                "es": "Persona",
                "it": "Persona",
                "pt": "Pessoa",
                "zh": "用户",
                "ru": "Пользователь",
            }
        },
    },
    {
        "key": "c4_SoftwareSystem",
        "label": "Software System",
        "category": "C4:Context",
        "icon": "web",
        "color": "#1168bd",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Softwaresystem",
                "fr": "Système logiciel",
                "es": "Sistema de software",
                "it": "Sistema software",
                "pt": "Sistema de software",
                "zh": "软件系统",
                "ru": "Программная система",
            }
        },
    },
    {
        "key": "c4_ExternalSystem",
        "label": "External System",
        "category": "C4:Context",
        "icon": "open_in_new",
        "color": "#999999",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Externes System",
                "fr": "Système externe",
                "es": "Sistema externo",
                "it": "Sistema esterno",
                "pt": "Sistema externo",
                "zh": "外部系统",
                "ru": "Внешняя система",
            }
        },
    },
    # ── Level 2: Container ──────────────────────────────────────────────────
    {
        "key": "c4_Container",
        "label": "Container",
        "category": "C4:Container",
        "icon": "deployed_code",
        "color": "#438dd5",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Container",
                "fr": "Conteneur",
                "es": "Contenedor",
                "it": "Contenitore",
                "pt": "Contêiner",
                "zh": "容器",
                "ru": "Контейнер",
            }
        },
    },
    # ── Level 3: Component ──────────────────────────────────────────────────
    {
        "key": "c4_Component",
        "label": "Component",
        "category": "C4:Component",
        "icon": "widgets",
        "color": "#85bbf0",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Komponente",
                "fr": "Composant",
                "es": "Componente",
                "it": "Componente",
                "pt": "Componente",
                "zh": "组件",
                "ru": "Компонент",
            }
        },
    },
    # ── Boundary grouping nodes ─────────────────────────────────────────────
    {
        "key": "c4_EnterpriseBoundary",
        "label": "Enterprise Boundary",
        "category": "C4:Boundary",
        "icon": "domain",
        "color": "#cccccc",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Unternehmensgrenze",
                "fr": "Limite d'entreprise",
                "es": "Límite empresarial",
                "it": "Confine aziendale",
                "pt": "Fronteira empresarial",
                "zh": "企业边界",
                "ru": "Граница предприятия",
            }
        },
    },
    {
        "key": "c4_SystemBoundary",
        "label": "System Boundary",
        "category": "C4:Boundary",
        "icon": "crop_square",
        "color": "#cccccc",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Systemgrenze",
                "fr": "Limite du système",
                "es": "Límite del sistema",
                "it": "Confine del sistema",
                "pt": "Fronteira do sistema",
                "zh": "系统边界",
                "ru": "Граница системы",
            }
        },
    },
    {
        "key": "c4_ContainerBoundary",
        "label": "Container Boundary",
        "category": "C4:Boundary",
        "icon": "select_all",
        "color": "#cccccc",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Containergrenze",
                "fr": "Limite du conteneur",
                "es": "Límite del contenedor",
                "it": "Confine del contenitore",
                "pt": "Fronteira do contêiner",
                "zh": "容器边界",
                "ru": "Граница контейнера",
            }
        },
    },
]

# ---------------------------------------------------------------------------
# Relation types (6 total)
# ---------------------------------------------------------------------------

_RELATION_TYPES: list[dict] = [
    {
        "key": "c4_rel_uses",
        "label": "Uses",
        "reverse_label": "Used by",
        "translations": {
            "label": {
                "de": "Verwendet",
                "fr": "Utilise",
                "es": "Usa",
                "it": "Usa",
                "pt": "Usa",
                "zh": "使用",
                "ru": "Использует",
            },
            "reverse_label": {
                "de": "Wird verwendet von",
                "fr": "Utilisé par",
                "es": "Utilizado por",
                "it": "Usato da",
                "pt": "Usado por",
                "zh": "被使用",
                "ru": "Используется",
            },
        },
    },
    {
        "key": "c4_rel_callsSync",
        "label": "Calls (sync)",
        "reverse_label": "Called by",
        "translations": {
            "label": {
                "de": "Ruft auf (sync)",
                "fr": "Appelle (sync)",
                "es": "Llama (sync)",
                "it": "Chiama (sync)",
                "pt": "Chama (sync)",
                "zh": "调用（同步）",
                "ru": "Вызывает (синх.)",
            },
            "reverse_label": {
                "de": "Aufgerufen von",
                "fr": "Appelé par",
                "es": "Llamado por",
                "it": "Chiamato da",
                "pt": "Chamado por",
                "zh": "被调用",
                "ru": "Вызывается",
            },
        },
    },
    {
        "key": "c4_rel_callsAsync",
        "label": "Calls (async)",
        "reverse_label": "Called by (async)",
        "translations": {
            "label": {
                "de": "Ruft auf (async)",
                "fr": "Appelle (async)",
                "es": "Llama (async)",
                "it": "Chiama (async)",
                "pt": "Chama (async)",
                "zh": "调用（异步）",
                "ru": "Вызывает (асинх.)",
            },
            "reverse_label": {
                "de": "Aufgerufen von (async)",
                "fr": "Appelé par (async)",
                "es": "Llamado por (async)",
                "it": "Chiamato da (async)",
                "pt": "Chamado por (async)",
                "zh": "被异步调用",
                "ru": "Вызывается (асинх.)",
            },
        },
    },
    {
        "key": "c4_rel_readsFrom",
        "label": "Reads from",
        "reverse_label": "Read by",
        "translations": {
            "label": {
                "de": "Liest von",
                "fr": "Lit depuis",
                "es": "Lee desde",
                "it": "Legge da",
                "pt": "Lê de",
                "zh": "读取自",
                "ru": "Читает из",
            },
            "reverse_label": {
                "de": "Gelesen von",
                "fr": "Lu par",
                "es": "Leído por",
                "it": "Letto da",
                "pt": "Lido por",
                "zh": "被读取",
                "ru": "Читается",
            },
        },
    },
    {
        "key": "c4_rel_writesTo",
        "label": "Writes to",
        "reverse_label": "Written by",
        "translations": {
            "label": {
                "de": "Schreibt nach",
                "fr": "Écrit vers",
                "es": "Escribe en",
                "it": "Scrive su",
                "pt": "Escreve em",
                "zh": "写入到",
                "ru": "Записывает в",
            },
            "reverse_label": {
                "de": "Geschrieben von",
                "fr": "Écrit par",
                "es": "Escrito por",
                "it": "Scritto da",
                "pt": "Escrito por",
                "zh": "被写入",
                "ru": "Записывается",
            },
        },
    },
    {
        "key": "c4_rel_deployedIn",
        "label": "Deployed in",
        "reverse_label": "Deploys",
        "translations": {
            "label": {
                "de": "Eingesetzt in",
                "fr": "Déployé dans",
                "es": "Desplegado en",
                "it": "Distribuito in",
                "pt": "Implantado em",
                "zh": "部署在",
                "ru": "Развёрнут в",
            },
            "reverse_label": {
                "de": "Enthält",
                "fr": "Héberge",
                "es": "Aloja",
                "it": "Ospita",
                "pt": "Hospeda",
                "zh": "托管",
                "ru": "Содержит",
            },
        },
    },
]


# ---------------------------------------------------------------------------
# Seed function
# ---------------------------------------------------------------------------


async def seed_c4_metamodel(db: AsyncSession) -> dict:
    """Idempotently seed C4 element and relation types.

    Returns a dict with counts of newly inserted rows.
    """
    existing_ct_keys = {
        row[0]
        for row in (
            await db.execute(select(CardType.key).where(CardType.plugin_id == PLUGIN_ID))
        ).all()
    }
    existing_rt_keys = {
        row[0]
        for row in (
            await db.execute(select(RelationType.key).where(RelationType.plugin_id == PLUGIN_ID))
        ).all()
    }

    ct_created = 0
    for t in _ELEMENT_TYPES:
        if t["key"] in existing_ct_keys:
            continue
        ct = CardType(
            key=t["key"],
            label=t["label"],
            category=t.get("category", "C4"),
            icon=t.get("icon", "widgets"),
            color=t.get("color", "#438dd5"),
            has_hierarchy=t.get("has_hierarchy", False),
            built_in=False,
            is_hidden=False,
            plugin_id=PLUGIN_ID,
            translations=t.get("translations", {}),
            fields_schema=[],
            section_config={},
            stakeholder_roles=[],
        )
        db.add(ct)
        ct_created += 1

    rt_created = 0
    for r in _RELATION_TYPES:
        if r["key"] in existing_rt_keys:
            continue
        rt = RelationType(
            key=r["key"],
            label=r["label"],
            reverse_label=r.get("reverse_label", ""),
            cardinality="n:m",
            plugin_id=PLUGIN_ID,
            is_hidden=False,
            translations=r.get("translations", {}),
            attributes_schema=[],
        )
        db.add(rt)
        rt_created += 1

    await db.flush()
    return {"card_types_created": ct_created, "relation_types_created": rt_created}
