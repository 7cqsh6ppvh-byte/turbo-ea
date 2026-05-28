"""GCP (Google Cloud Platform) architecture modeling metamodel seed.

Seeds 47 card types and 12 relation types across 8 GCP service categories,
all with plugin_id = "gcp" and 8-locale translations.

Idempotent: running twice inserts nothing new.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card_type import CardType
from app.models.relation_type import RelationType

PLUGIN_ID = "gcp"

_ELEMENT_TYPES: list[dict] = [
    # ── GCP:Grouping ─────────────────────────────────────────────────────────
    {
        "key": "gcp_Organization",
        "label": "GCP Organization",
        "category": "GCP:Grouping",
        "icon": "domain",
        "color": "#4285F4",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "GCP-Organisation",
                "fr": "Organisation GCP",
                "es": "Organización GCP",
                "it": "Organizzazione GCP",
                "pt": "Organização GCP",
                "zh": "GCP组织",
                "ru": "Организация GCP",
            }
        },
    },
    {
        "key": "gcp_Project",
        "label": "GCP Project",
        "category": "GCP:Grouping",
        "icon": "folder",
        "color": "#4285F4",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "GCP-Projekt",
                "fr": "Projet GCP",
                "es": "Proyecto GCP",
                "it": "Progetto GCP",
                "pt": "Projeto GCP",
                "zh": "GCP项目",
                "ru": "Проект GCP",
            }
        },
    },
    {
        "key": "gcp_Region",
        "label": "GCP Region",
        "category": "GCP:Grouping",
        "icon": "public",
        "color": "#4285F4",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "GCP-Region",
                "fr": "Région GCP",
                "es": "Región GCP",
                "it": "Regione GCP",
                "pt": "Região GCP",
                "zh": "GCP区域",
                "ru": "Регион GCP",
            }
        },
    },
    {
        "key": "gcp_Zone",
        "label": "GCP Zone",
        "category": "GCP:Grouping",
        "icon": "location_on",
        "color": "#4285F4",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "GCP-Zone",
                "fr": "Zone GCP",
                "es": "Zona GCP",
                "it": "Zona GCP",
                "pt": "Zona GCP",
                "zh": "GCP区域区",
                "ru": "Зона GCP",
            }
        },
    },
    # ── GCP:Compute ──────────────────────────────────────────────────────────
    {
        "key": "gcp_ComputeEngineInstance",
        "label": "Compute Engine Instance",
        "category": "GCP:Compute",
        "icon": "computer",
        "color": "#DB4437",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Compute Engine-Instanz",
                "fr": "Instance Compute Engine",
                "es": "Instancia de Compute Engine",
                "it": "Istanza Compute Engine",
                "pt": "Instância do Compute Engine",
                "zh": "Compute Engine实例",
                "ru": "Экземпляр Compute Engine",
            }
        },
    },
    {
        "key": "gcp_AppEngineService",
        "label": "App Engine Service",
        "category": "GCP:Compute",
        "icon": "web",
        "color": "#DB4437",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "App Engine-Dienst",
                "fr": "Service App Engine",
                "es": "Servicio de App Engine",
                "it": "Servizio App Engine",
                "pt": "Serviço do App Engine",
                "zh": "App Engine服务",
                "ru": "Служба App Engine",
            }
        },
    },
    {
        "key": "gcp_CloudRun",
        "label": "Cloud Run",
        "category": "GCP:Compute",
        "icon": "directions_run",
        "color": "#DB4437",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Run",
                "fr": "Cloud Run",
                "es": "Cloud Run",
                "it": "Cloud Run",
                "pt": "Cloud Run",
                "zh": "Cloud Run",
                "ru": "Cloud Run",
            }
        },
    },
    {
        "key": "gcp_CloudFunction",
        "label": "Cloud Function",
        "category": "GCP:Compute",
        "icon": "functions",
        "color": "#DB4437",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Function",
                "fr": "Cloud Function",
                "es": "Cloud Function",
                "it": "Cloud Function",
                "pt": "Cloud Function",
                "zh": "Cloud Function",
                "ru": "Cloud Function",
            }
        },
    },
    {
        "key": "gcp_GKECluster",
        "label": "GKE Cluster",
        "category": "GCP:Compute",
        "icon": "view_in_ar",
        "color": "#DB4437",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "GKE-Cluster",
                "fr": "Cluster GKE",
                "es": "Clúster GKE",
                "it": "Cluster GKE",
                "pt": "Cluster GKE",
                "zh": "GKE集群",
                "ru": "Кластер GKE",
            }
        },
    },
    {
        "key": "gcp_CloudBatch",
        "label": "Cloud Batch",
        "category": "GCP:Compute",
        "icon": "batch_prediction",
        "color": "#DB4437",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Batch",
                "fr": "Cloud Batch",
                "es": "Cloud Batch",
                "it": "Cloud Batch",
                "pt": "Cloud Batch",
                "zh": "Cloud Batch",
                "ru": "Cloud Batch",
            }
        },
    },
    # ── GCP:Storage ──────────────────────────────────────────────────────────
    {
        "key": "gcp_CloudStorage",
        "label": "Cloud Storage",
        "category": "GCP:Storage",
        "icon": "storage",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Storage",
                "fr": "Cloud Storage",
                "es": "Cloud Storage",
                "it": "Cloud Storage",
                "pt": "Cloud Storage",
                "zh": "云存储",
                "ru": "Cloud Storage",
            }
        },
    },
    {
        "key": "gcp_PersistentDisk",
        "label": "Persistent Disk",
        "category": "GCP:Storage",
        "icon": "hard_drive",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Persistent Disk",
                "fr": "Disque persistant",
                "es": "Disco persistente",
                "it": "Disco persistente",
                "pt": "Disco persistente",
                "zh": "持久磁盘",
                "ru": "Постоянный диск",
            }
        },
    },
    {
        "key": "gcp_Filestore",
        "label": "Filestore",
        "category": "GCP:Storage",
        "icon": "folder_shared",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Filestore",
                "fr": "Filestore",
                "es": "Filestore",
                "it": "Filestore",
                "pt": "Filestore",
                "zh": "Filestore",
                "ru": "Filestore",
            }
        },
    },
    {
        "key": "gcp_CloudArchive",
        "label": "Cloud Archive",
        "category": "GCP:Storage",
        "icon": "archive",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud-Archiv",
                "fr": "Archive Cloud",
                "es": "Archivo Cloud",
                "it": "Archivio Cloud",
                "pt": "Arquivo Cloud",
                "zh": "云归档",
                "ru": "Облачный архив",
            }
        },
    },
    {
        "key": "gcp_TransferService",
        "label": "Transfer Service",
        "category": "GCP:Storage",
        "icon": "sync_alt",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Transfer-Dienst",
                "fr": "Service de transfert",
                "es": "Servicio de transferencia",
                "it": "Servizio di trasferimento",
                "pt": "Serviço de transferência",
                "zh": "传输服务",
                "ru": "Служба переноса",
            }
        },
    },
    # ── GCP:Database ─────────────────────────────────────────────────────────
    {
        "key": "gcp_CloudSQL",
        "label": "Cloud SQL",
        "category": "GCP:Database",
        "icon": "database",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud SQL",
                "fr": "Cloud SQL",
                "es": "Cloud SQL",
                "it": "Cloud SQL",
                "pt": "Cloud SQL",
                "zh": "Cloud SQL",
                "ru": "Cloud SQL",
            }
        },
    },
    {
        "key": "gcp_CloudSpanner",
        "label": "Cloud Spanner",
        "category": "GCP:Database",
        "icon": "dataset",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Spanner",
                "fr": "Cloud Spanner",
                "es": "Cloud Spanner",
                "it": "Cloud Spanner",
                "pt": "Cloud Spanner",
                "zh": "Cloud Spanner",
                "ru": "Cloud Spanner",
            }
        },
    },
    {
        "key": "gcp_Firestore",
        "label": "Firestore",
        "category": "GCP:Database",
        "icon": "local_fire_department",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Firestore",
                "fr": "Firestore",
                "es": "Firestore",
                "it": "Firestore",
                "pt": "Firestore",
                "zh": "Firestore",
                "ru": "Firestore",
            }
        },
    },
    {
        "key": "gcp_CloudBigtable",
        "label": "Cloud Bigtable",
        "category": "GCP:Database",
        "icon": "table_chart",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Bigtable",
                "fr": "Cloud Bigtable",
                "es": "Cloud Bigtable",
                "it": "Cloud Bigtable",
                "pt": "Cloud Bigtable",
                "zh": "Cloud Bigtable",
                "ru": "Cloud Bigtable",
            }
        },
    },
    {
        "key": "gcp_Datastore",
        "label": "Datastore",
        "category": "GCP:Database",
        "icon": "dns",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Datastore",
                "fr": "Datastore",
                "es": "Datastore",
                "it": "Datastore",
                "pt": "Datastore",
                "zh": "Datastore",
                "ru": "Datastore",
            }
        },
    },
    {
        "key": "gcp_Memorystore",
        "label": "Memorystore",
        "category": "GCP:Database",
        "icon": "memory",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Memorystore",
                "fr": "Memorystore",
                "es": "Memorystore",
                "it": "Memorystore",
                "pt": "Memorystore",
                "zh": "Memorystore",
                "ru": "Memorystore",
            }
        },
    },
    {
        "key": "gcp_AlloyDB",
        "label": "AlloyDB",
        "category": "GCP:Database",
        "icon": "database",
        "color": "#4285F4",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "AlloyDB",
                "fr": "AlloyDB",
                "es": "AlloyDB",
                "it": "AlloyDB",
                "pt": "AlloyDB",
                "zh": "AlloyDB",
                "ru": "AlloyDB",
            }
        },
    },
    # ── GCP:Analytics ────────────────────────────────────────────────────────
    {
        "key": "gcp_BigQuery",
        "label": "BigQuery",
        "category": "GCP:Analytics",
        "icon": "analytics",
        "color": "#F4B400",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "BigQuery",
                "fr": "BigQuery",
                "es": "BigQuery",
                "it": "BigQuery",
                "pt": "BigQuery",
                "zh": "BigQuery",
                "ru": "BigQuery",
            }
        },
    },
    {
        "key": "gcp_DataflowJob",
        "label": "Dataflow Job",
        "category": "GCP:Analytics",
        "icon": "stream",
        "color": "#F4B400",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Dataflow-Job",
                "fr": "Tâche Dataflow",
                "es": "Trabajo de Dataflow",
                "it": "Job Dataflow",
                "pt": "Trabalho do Dataflow",
                "zh": "Dataflow作业",
                "ru": "Задание Dataflow",
            }
        },
    },
    {
        "key": "gcp_DataprocCluster",
        "label": "Dataproc Cluster",
        "category": "GCP:Analytics",
        "icon": "hub",
        "color": "#F4B400",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Dataproc-Cluster",
                "fr": "Cluster Dataproc",
                "es": "Clúster Dataproc",
                "it": "Cluster Dataproc",
                "pt": "Cluster Dataproc",
                "zh": "Dataproc集群",
                "ru": "Кластер Dataproc",
            }
        },
    },
    {
        "key": "gcp_PubSubTopic",
        "label": "Pub/Sub Topic",
        "category": "GCP:Analytics",
        "icon": "campaign",
        "color": "#F4B400",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Pub/Sub-Thema",
                "fr": "Sujet Pub/Sub",
                "es": "Tema de Pub/Sub",
                "it": "Argomento Pub/Sub",
                "pt": "Tópico do Pub/Sub",
                "zh": "Pub/Sub主题",
                "ru": "Тема Pub/Sub",
            }
        },
    },
    {
        "key": "gcp_Composer",
        "label": "Cloud Composer",
        "category": "GCP:Analytics",
        "icon": "music_note",
        "color": "#F4B400",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Composer",
                "fr": "Cloud Composer",
                "es": "Cloud Composer",
                "it": "Cloud Composer",
                "pt": "Cloud Composer",
                "zh": "Cloud Composer",
                "ru": "Cloud Composer",
            }
        },
    },
    {
        "key": "gcp_Looker",
        "label": "Looker",
        "category": "GCP:Analytics",
        "icon": "bar_chart",
        "color": "#F4B400",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Looker",
                "fr": "Looker",
                "es": "Looker",
                "it": "Looker",
                "pt": "Looker",
                "zh": "Looker",
                "ru": "Looker",
            }
        },
    },
    # ── GCP:Networking ───────────────────────────────────────────────────────
    {
        "key": "gcp_VPC",
        "label": "Virtual Private Cloud",
        "category": "GCP:Networking",
        "icon": "lan",
        "color": "#185ABC",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Virtual Private Cloud",
                "fr": "Cloud privé virtuel",
                "es": "Nube privada virtual",
                "it": "Cloud privato virtuale",
                "pt": "Nuvem privada virtual",
                "zh": "虚拟私有云",
                "ru": "Виртуальное частное облако",
            }
        },
    },
    {
        "key": "gcp_CloudLoadBalancing",
        "label": "Cloud Load Balancing",
        "category": "GCP:Networking",
        "icon": "balance",
        "color": "#185ABC",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Load Balancing",
                "fr": "Équilibrage de charge Cloud",
                "es": "Balanceo de carga Cloud",
                "it": "Bilanciamento del carico Cloud",
                "pt": "Balanceamento de carga Cloud",
                "zh": "云负载均衡",
                "ru": "Балансировка нагрузки Cloud",
            }
        },
    },
    {
        "key": "gcp_CloudArmor",
        "label": "Cloud Armor",
        "category": "GCP:Networking",
        "icon": "shield",
        "color": "#185ABC",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Armor",
                "fr": "Cloud Armor",
                "es": "Cloud Armor",
                "it": "Cloud Armor",
                "pt": "Cloud Armor",
                "zh": "Cloud Armor",
                "ru": "Cloud Armor",
            }
        },
    },
    {
        "key": "gcp_CloudCDN",
        "label": "Cloud CDN",
        "category": "GCP:Networking",
        "icon": "cloud_download",
        "color": "#185ABC",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud CDN",
                "fr": "Cloud CDN",
                "es": "Cloud CDN",
                "it": "Cloud CDN",
                "pt": "Cloud CDN",
                "zh": "Cloud CDN",
                "ru": "Cloud CDN",
            }
        },
    },
    {
        "key": "gcp_CloudDNS",
        "label": "Cloud DNS",
        "category": "GCP:Networking",
        "icon": "dns",
        "color": "#185ABC",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud DNS",
                "fr": "Cloud DNS",
                "es": "Cloud DNS",
                "it": "Cloud DNS",
                "pt": "Cloud DNS",
                "zh": "Cloud DNS",
                "ru": "Cloud DNS",
            }
        },
    },
    {
        "key": "gcp_CloudInterconnect",
        "label": "Cloud Interconnect",
        "category": "GCP:Networking",
        "icon": "cable",
        "color": "#185ABC",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Interconnect",
                "fr": "Cloud Interconnect",
                "es": "Cloud Interconnect",
                "it": "Cloud Interconnect",
                "pt": "Cloud Interconnect",
                "zh": "Cloud Interconnect",
                "ru": "Cloud Interconnect",
            }
        },
    },
    # ── GCP:Security ─────────────────────────────────────────────────────────
    {
        "key": "gcp_CloudIdentity",
        "label": "Cloud Identity",
        "category": "GCP:Security",
        "icon": "manage_accounts",
        "color": "#A50E0E",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Identity",
                "fr": "Cloud Identity",
                "es": "Cloud Identity",
                "it": "Cloud Identity",
                "pt": "Cloud Identity",
                "zh": "Cloud Identity",
                "ru": "Cloud Identity",
            }
        },
    },
    {
        "key": "gcp_IAM",
        "label": "Cloud IAM",
        "category": "GCP:Security",
        "icon": "lock",
        "color": "#A50E0E",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud IAM",
                "fr": "Cloud IAM",
                "es": "Cloud IAM",
                "it": "Cloud IAM",
                "pt": "Cloud IAM",
                "zh": "Cloud IAM",
                "ru": "Cloud IAM",
            }
        },
    },
    {
        "key": "gcp_SecretManager",
        "label": "Secret Manager",
        "category": "GCP:Security",
        "icon": "key",
        "color": "#A50E0E",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Secret Manager",
                "fr": "Gestionnaire de secrets",
                "es": "Gestor de secretos",
                "it": "Secret Manager",
                "pt": "Gerenciador de segredos",
                "zh": "密钥管理器",
                "ru": "Диспетчер секретов",
            }
        },
    },
    {
        "key": "gcp_CloudKMS",
        "label": "Cloud KMS",
        "category": "GCP:Security",
        "icon": "enhanced_encryption",
        "color": "#A50E0E",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud KMS",
                "fr": "Cloud KMS",
                "es": "Cloud KMS",
                "it": "Cloud KMS",
                "pt": "Cloud KMS",
                "zh": "Cloud KMS",
                "ru": "Cloud KMS",
            }
        },
    },
    {
        "key": "gcp_VPCServiceControls",
        "label": "VPC Service Controls",
        "category": "GCP:Security",
        "icon": "verified_user",
        "color": "#A50E0E",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "VPC Service Controls",
                "fr": "Contrôles de service VPC",
                "es": "Controles de servicio de VPC",
                "it": "Controlli servizio VPC",
                "pt": "Controles de serviço de VPC",
                "zh": "VPC服务控制",
                "ru": "Элементы управления службой VPC",
            }
        },
    },
    {
        "key": "gcp_SecurityCommandCenter",
        "label": "Security Command Center",
        "category": "GCP:Security",
        "icon": "security",
        "color": "#A50E0E",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Security Command Center",
                "fr": "Security Command Center",
                "es": "Security Command Center",
                "it": "Security Command Center",
                "pt": "Security Command Center",
                "zh": "安全指挥中心",
                "ru": "Командный центр безопасности",
            }
        },
    },
    # ── GCP:Management ───────────────────────────────────────────────────────
    {
        "key": "gcp_CloudMonitoring",
        "label": "Cloud Monitoring",
        "category": "GCP:Management",
        "icon": "monitor_heart",
        "color": "#0F9D58",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Monitoring",
                "fr": "Cloud Monitoring",
                "es": "Cloud Monitoring",
                "it": "Cloud Monitoring",
                "pt": "Cloud Monitoring",
                "zh": "云监控",
                "ru": "Cloud Monitoring",
            }
        },
    },
    {
        "key": "gcp_CloudLogging",
        "label": "Cloud Logging",
        "category": "GCP:Management",
        "icon": "notes",
        "color": "#0F9D58",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Logging",
                "fr": "Cloud Logging",
                "es": "Cloud Logging",
                "it": "Cloud Logging",
                "pt": "Cloud Logging",
                "zh": "云日志",
                "ru": "Cloud Logging",
            }
        },
    },
    {
        "key": "gcp_CloudTrace",
        "label": "Cloud Trace",
        "category": "GCP:Management",
        "icon": "timeline",
        "color": "#0F9D58",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Trace",
                "fr": "Cloud Trace",
                "es": "Cloud Trace",
                "it": "Cloud Trace",
                "pt": "Cloud Trace",
                "zh": "Cloud Trace",
                "ru": "Cloud Trace",
            }
        },
    },
    {
        "key": "gcp_CloudProfiler",
        "label": "Cloud Profiler",
        "category": "GCP:Management",
        "icon": "troubleshoot",
        "color": "#0F9D58",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Profiler",
                "fr": "Cloud Profiler",
                "es": "Cloud Profiler",
                "it": "Cloud Profiler",
                "pt": "Cloud Profiler",
                "zh": "Cloud Profiler",
                "ru": "Cloud Profiler",
            }
        },
    },
    {
        "key": "gcp_DeploymentManager",
        "label": "Deployment Manager",
        "category": "GCP:Management",
        "icon": "deployed_code",
        "color": "#0F9D58",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Deployment Manager",
                "fr": "Gestionnaire de déploiement",
                "es": "Gestor de implementación",
                "it": "Deployment Manager",
                "pt": "Gerenciador de implantação",
                "zh": "部署管理器",
                "ru": "Диспетчер развёртывания",
            }
        },
    },
    {
        "key": "gcp_CloudBuild",
        "label": "Cloud Build",
        "category": "GCP:Management",
        "icon": "build",
        "color": "#0F9D58",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cloud Build",
                "fr": "Cloud Build",
                "es": "Cloud Build",
                "it": "Cloud Build",
                "pt": "Cloud Build",
                "zh": "Cloud Build",
                "ru": "Cloud Build",
            }
        },
    },
    {
        "key": "gcp_ArtifactRegistry",
        "label": "Artifact Registry",
        "category": "GCP:Management",
        "icon": "inventory_2",
        "color": "#0F9D58",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Artifact Registry",
                "fr": "Artifact Registry",
                "es": "Artifact Registry",
                "it": "Artifact Registry",
                "pt": "Artifact Registry",
                "zh": "制品库",
                "ru": "Реестр артефактов",
            }
        },
    },
]

_RELATION_TYPES: list[dict] = [
    {
        "key": "gcp_rel_containedIn",
        "label": "contained in",
        "reverse_label": "contains",
        "translations": {
            "label": {
                "de": "enthalten in",
                "fr": "contenu dans",
                "es": "contenido en",
                "it": "contenuto in",
                "pt": "contido em",
                "zh": "包含在",
                "ru": "содержится в",
            },
            "reverse_label": {
                "de": "enthält",
                "fr": "contient",
                "es": "contiene",
                "it": "contiene",
                "pt": "contém",
                "zh": "包含",
                "ru": "содержит",
            },
        },
    },
    {
        "key": "gcp_rel_networkAttachment",
        "label": "network attached to",
        "reverse_label": "network attachment of",
        "translations": {
            "label": {
                "de": "Netzwerk verbunden mit",
                "fr": "réseau attaché à",
                "es": "red adjunta a",
                "it": "rete collegata a",
                "pt": "rede conectada a",
                "zh": "网络连接到",
                "ru": "сеть подключена к",
            },
            "reverse_label": {
                "de": "Netzwerkverbindung von",
                "fr": "connexion réseau de",
                "es": "conexión de red de",
                "it": "connessione di rete di",
                "pt": "conexão de rede de",
                "zh": "网络连接属于",
                "ru": "сетевое подключение к",
            },
        },
    },
    {
        "key": "gcp_rel_firewallRule",
        "label": "protected by firewall",
        "reverse_label": "firewall rule for",
        "translations": {
            "label": {
                "de": "durch Firewall geschützt",
                "fr": "protégé par le pare-feu",
                "es": "protegido por firewall",
                "it": "protetto dal firewall",
                "pt": "protegido por firewall",
                "zh": "受防火墙保护",
                "ru": "защищён брандмауэром",
            },
            "reverse_label": {
                "de": "Firewall-Regel für",
                "fr": "règle de pare-feu pour",
                "es": "regla de firewall para",
                "it": "regola firewall per",
                "pt": "regra de firewall para",
                "zh": "防火墙规则用于",
                "ru": "правило брандмауэра для",
            },
        },
    },
    {
        "key": "gcp_rel_routing",
        "label": "routes to",
        "reverse_label": "routed from",
        "translations": {
            "label": {
                "de": "leitet weiter zu",
                "fr": "route vers",
                "es": "enruta a",
                "it": "instrada verso",
                "pt": "roteado para",
                "zh": "路由到",
                "ru": "маршрутизирует к",
            },
            "reverse_label": {
                "de": "weitergeleitet von",
                "fr": "routé depuis",
                "es": "enrutado desde",
                "it": "instradato da",
                "pt": "roteado de",
                "zh": "从路由",
                "ru": "маршрутизируется из",
            },
        },
    },
    {
        "key": "gcp_rel_dataReplication",
        "label": "replicates data to",
        "reverse_label": "data replicated from",
        "translations": {
            "label": {
                "de": "repliziert Daten nach",
                "fr": "réplique les données vers",
                "es": "replica datos a",
                "it": "replica dati verso",
                "pt": "replica dados para",
                "zh": "复制数据到",
                "ru": "реплицирует данные в",
            },
            "reverse_label": {
                "de": "Daten repliziert von",
                "fr": "données répliquées depuis",
                "es": "datos replicados desde",
                "it": "dati replicati da",
                "pt": "dados replicados de",
                "zh": "数据复制自",
                "ru": "данные реплицированы из",
            },
        },
    },
    {
        "key": "gcp_rel_logTarget",
        "label": "logs to",
        "reverse_label": "log target of",
        "translations": {
            "label": {
                "de": "protokolliert nach",
                "fr": "journalise vers",
                "es": "registra en",
                "it": "registra in",
                "pt": "registra em",
                "zh": "记录到",
                "ru": "журналирует в",
            },
            "reverse_label": {
                "de": "Protokollziel von",
                "fr": "cible de journalisation de",
                "es": "destino de registro de",
                "it": "destinazione log di",
                "pt": "destino de log de",
                "zh": "日志目标属于",
                "ru": "цель журналирования для",
            },
        },
    },
    {
        "key": "gcp_rel_serviceDependency",
        "label": "depends on",
        "reverse_label": "used by",
        "translations": {
            "label": {
                "de": "hängt ab von",
                "fr": "dépend de",
                "es": "depende de",
                "it": "dipende da",
                "pt": "depende de",
                "zh": "依赖于",
                "ru": "зависит от",
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
        "key": "gcp_rel_encryptedBy",
        "label": "encrypted by",
        "reverse_label": "encrypts",
        "translations": {
            "label": {
                "de": "verschlüsselt durch",
                "fr": "chiffré par",
                "es": "cifrado por",
                "it": "crittografato da",
                "pt": "criptografado por",
                "zh": "加密方式",
                "ru": "зашифровано",
            },
            "reverse_label": {
                "de": "verschlüsselt",
                "fr": "chiffre",
                "es": "cifra",
                "it": "crittografa",
                "pt": "criptografa",
                "zh": "加密",
                "ru": "шифрует",
            },
        },
    },
    {
        "key": "gcp_rel_iamBinding",
        "label": "IAM bound to",
        "reverse_label": "IAM binding of",
        "translations": {
            "label": {
                "de": "IAM gebunden an",
                "fr": "IAM lié à",
                "es": "IAM vinculado a",
                "it": "IAM associato a",
                "pt": "IAM vinculado a",
                "zh": "IAM绑定到",
                "ru": "IAM привязан к",
            },
            "reverse_label": {
                "de": "IAM-Bindung von",
                "fr": "liaison IAM de",
                "es": "vinculación IAM de",
                "it": "associazione IAM di",
                "pt": "vinculação IAM de",
                "zh": "IAM绑定属于",
                "ru": "IAM-привязка для",
            },
        },
    },
    {
        "key": "gcp_rel_triggerOf",
        "label": "triggers",
        "reverse_label": "triggered by",
        "translations": {
            "label": {
                "de": "löst aus",
                "fr": "déclenche",
                "es": "dispara",
                "it": "innesca",
                "pt": "aciona",
                "zh": "触发",
                "ru": "запускает",
            },
            "reverse_label": {
                "de": "ausgelöst durch",
                "fr": "déclenché par",
                "es": "disparado por",
                "it": "innescato da",
                "pt": "acionado por",
                "zh": "由...触发",
                "ru": "запускается",
            },
        },
    },
    {
        "key": "gcp_rel_subscribesTo",
        "label": "subscribes to",
        "reverse_label": "subscribed by",
        "translations": {
            "label": {
                "de": "abonniert",
                "fr": "s'abonne à",
                "es": "suscrito a",
                "it": "iscritto a",
                "pt": "assina",
                "zh": "订阅",
                "ru": "подписывается на",
            },
            "reverse_label": {
                "de": "abonniert von",
                "fr": "abonné par",
                "es": "suscrito por",
                "it": "iscritto da",
                "pt": "assinado por",
                "zh": "被订阅",
                "ru": "подписан",
            },
        },
    },
    {
        "key": "gcp_rel_replicatedTo",
        "label": "replicated to",
        "reverse_label": "replicated from",
        "translations": {
            "label": {
                "de": "repliziert nach",
                "fr": "répliqué vers",
                "es": "replicado a",
                "it": "replicato verso",
                "pt": "replicado para",
                "zh": "复制到",
                "ru": "реплицирован в",
            },
            "reverse_label": {
                "de": "repliziert von",
                "fr": "répliqué depuis",
                "es": "replicado desde",
                "it": "replicato da",
                "pt": "replicado de",
                "zh": "从...复制",
                "ru": "реплицирован из",
            },
        },
    },
]


async def seed_gcp_metamodel(db: AsyncSession) -> dict:
    """Idempotently seed all GCP card types and relation types.

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
                icon=spec.get("icon", "cloud"),
                color=spec.get("color", "#4285F4"),
                category=spec.get("category", "GCP"),
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
