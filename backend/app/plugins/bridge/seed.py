"""Cross-plugin bridge relation seeder.

Seeds bridge relation types that connect elements from different plugins.
Bridge relation types use composite plugin_id strings (e.g. "aws+c4") and
are only visible when ALL named plugins are active simultaneously.

Called from the settings endpoint whenever any plugin is toggled, so the
visibility of bridge relations stays in sync with the enabled plugin set.

Idempotent: running twice inserts nothing new.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.relation_type import RelationType

# ── Bridge relation definitions ───────────────────────────────────────────────
#
# plugin_id is a "+" delimited sorted pair of plugin names. The bridge seeder
# inserts each relation type once, then seed_bridge_relations() toggles
# is_hidden based on which plugins are currently active.

_BRIDGE_RELATIONS: list[dict] = [
    # core + c4
    {
        "key": "bridge_rel_coreToC4",
        "label": "represented as C4 system",
        "reverse_label": "EA representation of",
        "plugin_id": "c4+core",
        "translations": {
            "label": {
                "de": "als C4-System dargestellt",
                "fr": "représenté comme système C4",
                "es": "representado como sistema C4",
                "it": "rappresentato come sistema C4",
                "pt": "representado como sistema C4",
                "zh": "表示为C4系统",
                "ru": "представлен как C4-система",
            },
            "reverse_label": {
                "de": "EA-Darstellung von",
                "fr": "représentation EA de",
                "es": "representación EA de",
                "it": "rappresentazione EA di",
                "pt": "representação EA de",
                "zh": "EA表示属于",
                "ru": "EA-представление для",
            },
        },
    },
    {
        "key": "bridge_rel_coreComponentToC4",
        "label": "deployed as C4 container",
        "reverse_label": "deployment of",
        "plugin_id": "c4+core",
        "translations": {
            "label": {
                "de": "als C4-Container eingesetzt",
                "fr": "déployé comme conteneur C4",
                "es": "desplegado como contenedor C4",
                "it": "distribuito come contenitore C4",
                "pt": "implantado como contêiner C4",
                "zh": "部署为C4容器",
                "ru": "развёрнут как C4-контейнер",
            },
            "reverse_label": {
                "de": "Bereitstellung von",
                "fr": "déploiement de",
                "es": "implementación de",
                "it": "distribuzione di",
                "pt": "implantação de",
                "zh": "部署属于",
                "ru": "развёртывание для",
            },
        },
    },
    # core + aws
    {
        "key": "bridge_rel_coreToAws",
        "label": "hosted on AWS EC2",
        "reverse_label": "hosts application",
        "plugin_id": "aws+core",
        "translations": {
            "label": {
                "de": "auf AWS EC2 gehostet",
                "fr": "hébergé sur AWS EC2",
                "es": "alojado en AWS EC2",
                "it": "ospitato su AWS EC2",
                "pt": "hospedado no AWS EC2",
                "zh": "托管在AWS EC2",
                "ru": "размещён на AWS EC2",
            },
            "reverse_label": {
                "de": "hostet Anwendung",
                "fr": "héberge l'application",
                "es": "aloja aplicación",
                "it": "ospita applicazione",
                "pt": "hospeda aplicativo",
                "zh": "托管应用程序",
                "ru": "размещает приложение",
            },
        },
    },
    {
        "key": "bridge_rel_dataToAws",
        "label": "stored in S3",
        "reverse_label": "stores data",
        "plugin_id": "aws+core",
        "translations": {
            "label": {
                "de": "in S3 gespeichert",
                "fr": "stocké dans S3",
                "es": "almacenado en S3",
                "it": "archiviato in S3",
                "pt": "armazenado no S3",
                "zh": "存储在S3",
                "ru": "хранится в S3",
            },
            "reverse_label": {
                "de": "speichert Daten",
                "fr": "stocke des données",
                "es": "almacena datos",
                "it": "archivia dati",
                "pt": "armazena dados",
                "zh": "存储数据",
                "ru": "хранит данные",
            },
        },
    },
    # core + azure
    {
        "key": "bridge_rel_coreToAzure",
        "label": "hosted on Azure App Service",
        "reverse_label": "hosts application",
        "plugin_id": "azure+core",
        "translations": {
            "label": {
                "de": "auf Azure App Service gehostet",
                "fr": "hébergé sur Azure App Service",
                "es": "alojado en Azure App Service",
                "it": "ospitato su Azure App Service",
                "pt": "hospedado no Azure App Service",
                "zh": "托管在Azure应用服务",
                "ru": "размещён на Azure App Service",
            },
            "reverse_label": {
                "de": "hostet Anwendung",
                "fr": "héberge l'application",
                "es": "aloja aplicación",
                "it": "ospita applicazione",
                "pt": "hospeda aplicativo",
                "zh": "托管应用程序",
                "ru": "размещает приложение",
            },
        },
    },
    {
        "key": "bridge_rel_dataToAzure",
        "label": "stored in Blob Storage",
        "reverse_label": "stores data",
        "plugin_id": "azure+core",
        "translations": {
            "label": {
                "de": "in Blob Storage gespeichert",
                "fr": "stocké dans Blob Storage",
                "es": "almacenado en Blob Storage",
                "it": "archiviato in Blob Storage",
                "pt": "armazenado no Blob Storage",
                "zh": "存储在Blob存储",
                "ru": "хранится в Blob Storage",
            },
            "reverse_label": {
                "de": "speichert Daten",
                "fr": "stocke des données",
                "es": "almacena datos",
                "it": "archivia dati",
                "pt": "armazena dados",
                "zh": "存储数据",
                "ru": "хранит данные",
            },
        },
    },
    # core + gcp
    {
        "key": "bridge_rel_coreToGcp",
        "label": "hosted on App Engine",
        "reverse_label": "hosts application",
        "plugin_id": "core+gcp",
        "translations": {
            "label": {
                "de": "auf App Engine gehostet",
                "fr": "hébergé sur App Engine",
                "es": "alojado en App Engine",
                "it": "ospitato su App Engine",
                "pt": "hospedado no App Engine",
                "zh": "托管在App Engine",
                "ru": "размещён на App Engine",
            },
            "reverse_label": {
                "de": "hostet Anwendung",
                "fr": "héberge l'application",
                "es": "aloja aplicación",
                "it": "ospita applicazione",
                "pt": "hospeda aplicativo",
                "zh": "托管应用程序",
                "ru": "размещает приложение",
            },
        },
    },
    {
        "key": "bridge_rel_dataToGcp",
        "label": "stored in Cloud Storage",
        "reverse_label": "stores data",
        "plugin_id": "core+gcp",
        "translations": {
            "label": {
                "de": "in Cloud Storage gespeichert",
                "fr": "stocké dans Cloud Storage",
                "es": "almacenado en Cloud Storage",
                "it": "archiviato in Cloud Storage",
                "pt": "armazenado no Cloud Storage",
                "zh": "存储在Cloud Storage",
                "ru": "хранится в Cloud Storage",
            },
            "reverse_label": {
                "de": "speichert Daten",
                "fr": "stocke des données",
                "es": "almacena datos",
                "it": "archivia dati",
                "pt": "armazena dados",
                "zh": "存储数据",
                "ru": "хранит данные",
            },
        },
    },
    # c4 + aws
    {
        "key": "bridge_rel_c4ContainerOnAws",
        "label": "deployed on EC2",
        "reverse_label": "runs C4 container",
        "plugin_id": "aws+c4",
        "translations": {
            "label": {
                "de": "auf EC2 bereitgestellt",
                "fr": "déployé sur EC2",
                "es": "desplegado en EC2",
                "it": "distribuito su EC2",
                "pt": "implantado no EC2",
                "zh": "部署在EC2",
                "ru": "развёрнут на EC2",
            },
            "reverse_label": {
                "de": "führt C4-Container aus",
                "fr": "exécute le conteneur C4",
                "es": "ejecuta contenedor C4",
                "it": "esegue il contenitore C4",
                "pt": "executa contêiner C4",
                "zh": "运行C4容器",
                "ru": "выполняет C4-контейнер",
            },
        },
    },
    {
        "key": "bridge_rel_c4ContainerOnLambda",
        "label": "implemented as Lambda",
        "reverse_label": "implements C4 container",
        "plugin_id": "aws+c4",
        "translations": {
            "label": {
                "de": "als Lambda implementiert",
                "fr": "implémenté comme Lambda",
                "es": "implementado como Lambda",
                "it": "implementato come Lambda",
                "pt": "implementado como Lambda",
                "zh": "实现为Lambda",
                "ru": "реализован как Lambda",
            },
            "reverse_label": {
                "de": "implementiert C4-Container",
                "fr": "implémente le conteneur C4",
                "es": "implementa contenedor C4",
                "it": "implementa il contenitore C4",
                "pt": "implementa contêiner C4",
                "zh": "实现C4容器",
                "ru": "реализует C4-контейнер",
            },
        },
    },
    # c4 + azure
    {
        "key": "bridge_rel_c4ContainerOnAzure",
        "label": "deployed on Azure VM",
        "reverse_label": "runs C4 container",
        "plugin_id": "azure+c4",
        "translations": {
            "label": {
                "de": "auf Azure VM bereitgestellt",
                "fr": "déployé sur Azure VM",
                "es": "desplegado en Azure VM",
                "it": "distribuito su Azure VM",
                "pt": "implantado no Azure VM",
                "zh": "部署在Azure VM",
                "ru": "развёрнут на Azure VM",
            },
            "reverse_label": {
                "de": "führt C4-Container aus",
                "fr": "exécute le conteneur C4",
                "es": "ejecuta contenedor C4",
                "it": "esegue il contenitore C4",
                "pt": "executa contêiner C4",
                "zh": "运行C4容器",
                "ru": "выполняет C4-контейнер",
            },
        },
    },
    # c4 + gcp
    {
        "key": "bridge_rel_c4ContainerOnGcp",
        "label": "deployed on Compute Engine",
        "reverse_label": "runs C4 container",
        "plugin_id": "c4+gcp",
        "translations": {
            "label": {
                "de": "auf Compute Engine bereitgestellt",
                "fr": "déployé sur Compute Engine",
                "es": "desplegado en Compute Engine",
                "it": "distribuito su Compute Engine",
                "pt": "implantado no Compute Engine",
                "zh": "部署在Compute Engine",
                "ru": "развёрнут на Compute Engine",
            },
            "reverse_label": {
                "de": "führt C4-Container aus",
                "fr": "exécute le conteneur C4",
                "es": "ejecuta contenedor C4",
                "it": "esegue il contenitore C4",
                "pt": "executa contêiner C4",
                "zh": "运行C4容器",
                "ru": "выполняет C4-контейнер",
            },
        },
    },
    # archimate + aws
    {
        "key": "bridge_rel_archToAws",
        "label": "realized by EC2",
        "reverse_label": "realizes ArchiMate service",
        "plugin_id": "archimate+aws",
        "translations": {
            "label": {
                "de": "durch EC2 realisiert",
                "fr": "réalisé par EC2",
                "es": "realizado por EC2",
                "it": "realizzato da EC2",
                "pt": "realizado por EC2",
                "zh": "由EC2实现",
                "ru": "реализован через EC2",
            },
            "reverse_label": {
                "de": "realisiert ArchiMate-Dienst",
                "fr": "réalise le service ArchiMate",
                "es": "realiza servicio ArchiMate",
                "it": "realizza servizio ArchiMate",
                "pt": "realiza serviço ArchiMate",
                "zh": "实现ArchiMate服务",
                "ru": "реализует ArchiMate-сервис",
            },
        },
    },
    # archimate + azure
    {
        "key": "bridge_rel_archToAzure",
        "label": "realized by Azure VM",
        "reverse_label": "realizes ArchiMate service",
        "plugin_id": "archimate+azure",
        "translations": {
            "label": {
                "de": "durch Azure VM realisiert",
                "fr": "réalisé par Azure VM",
                "es": "realizado por Azure VM",
                "it": "realizzato da Azure VM",
                "pt": "realizado por Azure VM",
                "zh": "由Azure VM实现",
                "ru": "реализован через Azure VM",
            },
            "reverse_label": {
                "de": "realisiert ArchiMate-Dienst",
                "fr": "réalise le service ArchiMate",
                "es": "realiza servicio ArchiMate",
                "it": "realizza servizio ArchiMate",
                "pt": "realiza serviço ArchiMate",
                "zh": "实现ArchiMate服务",
                "ru": "реализует ArchiMate-сервис",
            },
        },
    },
    # archimate + gcp
    {
        "key": "bridge_rel_archToGcp",
        "label": "realized by Compute Engine",
        "reverse_label": "realizes ArchiMate service",
        "plugin_id": "archimate+gcp",
        "translations": {
            "label": {
                "de": "durch Compute Engine realisiert",
                "fr": "réalisé par Compute Engine",
                "es": "realizado por Compute Engine",
                "it": "realizzato da Compute Engine",
                "pt": "realizado por Compute Engine",
                "zh": "由Compute Engine实现",
                "ru": "реализован через Compute Engine",
            },
            "reverse_label": {
                "de": "realisiert ArchiMate-Dienst",
                "fr": "réalise le service ArchiMate",
                "es": "realiza servicio ArchiMate",
                "it": "realizza servizio ArchiMate",
                "pt": "realiza serviço ArchiMate",
                "zh": "实现ArchiMate服务",
                "ru": "реализует ArchiMate-сервис",
            },
        },
    },
    # aws + azure (equivalent services)
    {
        "key": "bridge_rel_awsToAzure",
        "label": "equivalent Azure service",
        "reverse_label": "equivalent AWS service",
        "plugin_id": "aws+azure",
        "translations": {
            "label": {
                "de": "äquivalenter Azure-Dienst",
                "fr": "service Azure équivalent",
                "es": "servicio Azure equivalente",
                "it": "servizio Azure equivalente",
                "pt": "serviço Azure equivalente",
                "zh": "等效Azure服务",
                "ru": "эквивалентный сервис Azure",
            },
            "reverse_label": {
                "de": "äquivalenter AWS-Dienst",
                "fr": "service AWS équivalent",
                "es": "servicio AWS equivalente",
                "it": "servizio AWS equivalente",
                "pt": "serviço AWS equivalente",
                "zh": "等效AWS服务",
                "ru": "эквивалентный сервис AWS",
            },
        },
    },
    # aws + gcp (equivalent services)
    {
        "key": "bridge_rel_awsToGcp",
        "label": "equivalent GCP service",
        "reverse_label": "equivalent AWS service",
        "plugin_id": "aws+gcp",
        "translations": {
            "label": {
                "de": "äquivalenter GCP-Dienst",
                "fr": "service GCP équivalent",
                "es": "servicio GCP equivalente",
                "it": "servizio GCP equivalente",
                "pt": "serviço GCP equivalente",
                "zh": "等效GCP服务",
                "ru": "эквивалентный сервис GCP",
            },
            "reverse_label": {
                "de": "äquivalenter AWS-Dienst",
                "fr": "service AWS équivalent",
                "es": "servicio AWS equivalente",
                "it": "servizio AWS equivalente",
                "pt": "serviço AWS equivalente",
                "zh": "等效AWS服务",
                "ru": "эквивалентный сервис AWS",
            },
        },
    },
    # azure + gcp (equivalent services)
    {
        "key": "bridge_rel_azureToGcp",
        "label": "equivalent GCP service",
        "reverse_label": "equivalent Azure service",
        "plugin_id": "azure+gcp",
        "translations": {
            "label": {
                "de": "äquivalenter GCP-Dienst",
                "fr": "service GCP équivalent",
                "es": "servicio GCP equivalente",
                "it": "servizio GCP equivalente",
                "pt": "serviço GCP equivalente",
                "zh": "等效GCP服务",
                "ru": "эквивалентный сервис GCP",
            },
            "reverse_label": {
                "de": "äquivalenter Azure-Dienst",
                "fr": "service Azure équivalent",
                "es": "servicio Azure equivalente",
                "it": "servizio Azure equivalente",
                "pt": "serviço Azure equivalente",
                "zh": "等效Azure服务",
                "ru": "эквивалентный сервис Azure",
            },
        },
    },
]


async def seed_bridge_relations(db: AsyncSession, active_plugins: set[str]) -> dict:
    """Seed all bridge relation types and toggle visibility based on active plugins.

    active_plugins: set of plugin keys that are currently enabled,
    e.g. {"aws", "c4", "archimate"}. "core" is always implicitly active.

    Returns counts: {"inserted": N, "updated": M}
    """
    existing_keys_result = await db.execute(
        select(RelationType.key).where(RelationType.plugin_id.contains("+"))
    )
    existing_keys = set(existing_keys_result.scalars().all())

    inserted = 0
    for spec in _BRIDGE_RELATIONS:
        if spec["key"] not in existing_keys:
            db.add(
                RelationType(
                    key=spec["key"],
                    label=spec["label"],
                    reverse_label=spec.get("reverse_label", ""),
                    plugin_id=spec["plugin_id"],
                    is_hidden=True,
                    translations=spec.get("translations", {}),
                    attributes_schema=[],
                )
            )
            inserted += 1

    await db.flush()

    # Re-query all bridge relations (including newly inserted) to set visibility
    all_bridge_result = await db.execute(
        select(RelationType).where(RelationType.plugin_id.contains("+"))
    )
    updated = 0
    active_with_core = active_plugins | {"core"}
    for rt in all_bridge_result.scalars().all():
        parts = set(rt.plugin_id.split("+"))
        should_be_visible = parts.issubset(active_with_core)
        if rt.is_hidden == should_be_visible:
            rt.is_hidden = not should_be_visible
            updated += 1

    return {"inserted": inserted, "updated": updated}
