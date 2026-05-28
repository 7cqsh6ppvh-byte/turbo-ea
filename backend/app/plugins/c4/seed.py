"""C4 Model metamodel seed.

Seeds 8 card types and 6 relation types following the C4 Model
(Context / Container / Component / Code levels), all with plugin_id = "c4"
and 8-locale translations.

Idempotent: running twice inserts nothing new.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card_type import CardType
from app.models.relation_type import RelationType

PLUGIN_ID = "c4"

_ELEMENT_TYPES: list[dict] = [
    {
        "key": "c4_Person",
        "label": "Person",
        "category": "C4:Actor",
        "icon": "person",
        "color": "#1168bd",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Person",
                "fr": "Personne",
                "es": "Persona",
                "it": "Persona",
                "pt": "Pessoa",
                "zh": "人员",
                "ru": "Персона",
            }
        },
    },
    {
        "key": "c4_SoftwareSystem",
        "label": "Software System",
        "category": "C4:System",
        "icon": "dns",
        "color": "#1168bd",
        "has_hierarchy": False,
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
        "key": "c4_Container",
        "label": "Container",
        "category": "C4:Container",
        "icon": "deployed_code",
        "color": "#1168bd",
        "has_hierarchy": False,
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
    {
        "key": "c4_Component",
        "label": "Component",
        "category": "C4:Component",
        "icon": "widgets",
        "color": "#1168bd",
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
    {
        "key": "c4_ExternalSystem",
        "label": "External System",
        "category": "C4:System",
        "icon": "cloud_off",
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
    {
        "key": "c4_EnterpriseBoundary",
        "label": "Enterprise Boundary",
        "category": "C4:Boundary",
        "icon": "domain",
        "color": "#444444",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Unternehmensgrenze",
                "fr": "Frontière d'entreprise",
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
        "icon": "select_all",
        "color": "#444444",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Systemgrenze",
                "fr": "Frontière système",
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
        "icon": "crop_square",
        "color": "#444444",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Containergrenze",
                "fr": "Frontière de conteneur",
                "es": "Límite de contenedor",
                "it": "Confine del contenitore",
                "pt": "Fronteira do contêiner",
                "zh": "容器边界",
                "ru": "Граница контейнера",
            }
        },
    },
]

_RELATION_TYPES: list[dict] = [
    {
        "key": "c4_rel_uses",
        "label": "uses",
        "reverse_label": "used by",
        "translations": {
            "label": {
                "de": "verwendet",
                "fr": "utilise",
                "es": "usa",
                "it": "usa",
                "pt": "usa",
                "zh": "使用",
                "ru": "использует",
            },
            "reverse_label": {
                "de": "verwendet von",
                "fr": "utilisé par",
                "es": "usado por",
                "it": "utilizzato da",
                "pt": "usado por",
                "zh": "被使用",
                "ru": "используется",
            },
        },
    },
    {
        "key": "c4_rel_callsSync",
        "label": "calls (sync)",
        "reverse_label": "called by (sync)",
        "translations": {
            "label": {
                "de": "ruft auf (sync)",
                "fr": "appelle (sync)",
                "es": "llama (sync)",
                "it": "chiama (sync)",
                "pt": "chama (sync)",
                "zh": "同步调用",
                "ru": "вызывает (sync)",
            },
            "reverse_label": {
                "de": "aufgerufen von (sync)",
                "fr": "appelé par (sync)",
                "es": "llamado por (sync)",
                "it": "chiamato da (sync)",
                "pt": "chamado por (sync)",
                "zh": "被同步调用",
                "ru": "вызывается (sync)",
            },
        },
    },
    {
        "key": "c4_rel_callsAsync",
        "label": "calls (async)",
        "reverse_label": "called by (async)",
        "translations": {
            "label": {
                "de": "ruft auf (async)",
                "fr": "appelle (async)",
                "es": "llama (async)",
                "it": "chiama (async)",
                "pt": "chama (async)",
                "zh": "异步调用",
                "ru": "вызывает (async)",
            },
            "reverse_label": {
                "de": "aufgerufen von (async)",
                "fr": "appelé par (async)",
                "es": "llamado por (async)",
                "it": "chiamato da (async)",
                "pt": "chamado por (async)",
                "zh": "被异步调用",
                "ru": "вызывается (async)",
            },
        },
    },
    {
        "key": "c4_rel_readsFrom",
        "label": "reads from",
        "reverse_label": "read by",
        "translations": {
            "label": {
                "de": "liest von",
                "fr": "lit depuis",
                "es": "lee de",
                "it": "legge da",
                "pt": "lê de",
                "zh": "读取自",
                "ru": "читает из",
            },
            "reverse_label": {
                "de": "gelesen von",
                "fr": "lu par",
                "es": "leído por",
                "it": "letto da",
                "pt": "lido por",
                "zh": "被读取",
                "ru": "читается",
            },
        },
    },
    {
        "key": "c4_rel_writesTo",
        "label": "writes to",
        "reverse_label": "written by",
        "translations": {
            "label": {
                "de": "schreibt nach",
                "fr": "écrit vers",
                "es": "escribe en",
                "it": "scrive in",
                "pt": "escreve em",
                "zh": "写入到",
                "ru": "записывает в",
            },
            "reverse_label": {
                "de": "geschrieben von",
                "fr": "écrit par",
                "es": "escrito por",
                "it": "scritto da",
                "pt": "escrito por",
                "zh": "被写入",
                "ru": "записывается",
            },
        },
    },
    {
        "key": "c4_rel_deployedIn",
        "label": "deployed in",
        "reverse_label": "hosts",
        "translations": {
            "label": {
                "de": "bereitgestellt in",
                "fr": "déployé dans",
                "es": "desplegado en",
                "it": "distribuito in",
                "pt": "implantado em",
                "zh": "部署在",
                "ru": "развёрнут в",
            },
            "reverse_label": {
                "de": "hostet",
                "fr": "héberge",
                "es": "aloja",
                "it": "ospita",
                "pt": "hospeda",
                "zh": "托管",
                "ru": "размещает",
            },
        },
    },
]


async def seed_c4_metamodel(db: AsyncSession) -> dict:
    """Idempotently seed all C4 card types and relation types.

    Returns counts: {"card_types": N, "relation_types": M, "skipped": K}
    """
    existing_keys_result = await db.execute(
        select(CardType.key).where(CardType.plugin_id == PLUGIN_ID)
    )
    existing_keys = set(existing_keys_result.scalars().all())

    inserted_types = 0
    for spec in _ELEMENT_TYPES:
        if spec["key"] in existing_keys:
            continue
        db.add(
            CardType(
                key=spec["key"],
                label=spec["label"],
                icon=spec.get("icon", "account_tree"),
                color=spec.get("color", "#1168bd"),
                category=spec.get("category", "C4"),
                has_hierarchy=spec.get("has_hierarchy", False),
                built_in=False,
                is_hidden=True,
                plugin_id=PLUGIN_ID,
                translations=spec.get("translations", {}),
                fields_schema=[],
                section_config={},
                subtypes=[],
                stakeholder_roles=[],
            )
        )
        inserted_types += 1

    existing_rel_keys_result = await db.execute(
        select(RelationType.key).where(RelationType.plugin_id == PLUGIN_ID)
    )
    existing_rel_keys = set(existing_rel_keys_result.scalars().all())

    inserted_rels = 0
    for spec in _RELATION_TYPES:
        if spec["key"] in existing_rel_keys:
            continue
        db.add(
            RelationType(
                key=spec["key"],
                label=spec["label"],
                reverse_label=spec.get("reverse_label", ""),
                plugin_id=PLUGIN_ID,
                is_hidden=True,
                translations=spec.get("translations", {}),
                attributes_schema=[],
            )
        )
        inserted_rels += 1

    await db.flush()
    skipped = (len(_ELEMENT_TYPES) - inserted_types) + (len(_RELATION_TYPES) - inserted_rels)
    return {
        "card_types": inserted_types,
        "relation_types": inserted_rels,
        "skipped": skipped,
    }
