"""Azure architecture modeling metamodel seed.

Seeds 50 card types and 12 relation types across 8 Azure service categories,
all with plugin_id = "azure" and 8-locale translations.

Idempotent: running twice inserts nothing new.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card_type import CardType
from app.models.relation_type import RelationType

PLUGIN_ID = "azure"

_ELEMENT_TYPES: list[dict] = [
    # ── Azure:Grouping ───────────────────────────────────────────────────────
    {
        "key": "azure_Subscription",
        "label": "Azure Subscription",
        "category": "Azure:Grouping",
        "icon": "folder",
        "color": "#003087",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Azure-Abonnement",
                "fr": "Abonnement Azure",
                "es": "Suscripción Azure",
                "it": "Abbonamento Azure",
                "pt": "Assinatura Azure",
                "zh": "Azure订阅",
                "ru": "Подписка Azure",
            }
        },
    },
    {
        "key": "azure_ResourceGroup",
        "label": "Resource Group",
        "category": "Azure:Grouping",
        "icon": "folder_open",
        "color": "#003087",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Ressourcengruppe",
                "fr": "Groupe de ressources",
                "es": "Grupo de recursos",
                "it": "Gruppo di risorse",
                "pt": "Grupo de recursos",
                "zh": "资源组",
                "ru": "Группа ресурсов",
            }
        },
    },
    {
        "key": "azure_Region",
        "label": "Azure Region",
        "category": "Azure:Grouping",
        "icon": "public",
        "color": "#003087",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Azure-Region",
                "fr": "Région Azure",
                "es": "Región Azure",
                "it": "Regione Azure",
                "pt": "Região Azure",
                "zh": "Azure区域",
                "ru": "Регион Azure",
            }
        },
    },
    {
        "key": "azure_VNet",
        "label": "Virtual Network",
        "category": "Azure:Grouping",
        "icon": "lan",
        "color": "#003087",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Virtuelles Netzwerk",
                "fr": "Réseau virtuel",
                "es": "Red virtual",
                "it": "Rete virtuale",
                "pt": "Rede virtual",
                "zh": "虚拟网络",
                "ru": "Виртуальная сеть",
            }
        },
    },
    # ── Azure:Compute ────────────────────────────────────────────────────────
    {
        "key": "azure_VirtualMachine",
        "label": "Virtual Machine",
        "category": "Azure:Compute",
        "icon": "computer",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Virtuelle Maschine",
                "fr": "Machine virtuelle",
                "es": "Máquina virtual",
                "it": "Macchina virtuale",
                "pt": "Máquina virtual",
                "zh": "虚拟机",
                "ru": "Виртуальная машина",
            }
        },
    },
    {
        "key": "azure_AppService",
        "label": "App Service",
        "category": "Azure:Compute",
        "icon": "web",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "App-Dienst",
                "fr": "Service d'application",
                "es": "Servicio de aplicación",
                "it": "Servizio app",
                "pt": "Serviço de aplicativo",
                "zh": "应用服务",
                "ru": "Служба приложений",
            }
        },
    },
    {
        "key": "azure_FunctionApp",
        "label": "Function App",
        "category": "Azure:Compute",
        "icon": "functions",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Funktions-App",
                "fr": "Application de fonction",
                "es": "Aplicación de función",
                "it": "App funzione",
                "pt": "Aplicativo de função",
                "zh": "函数应用",
                "ru": "Приложение-функция",
            }
        },
    },
    {
        "key": "azure_ContainerInstance",
        "label": "Container Instance",
        "category": "Azure:Compute",
        "icon": "deployed_code",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Container-Instanz",
                "fr": "Instance de conteneur",
                "es": "Instancia de contenedor",
                "it": "Istanza contenitore",
                "pt": "Instância de contêiner",
                "zh": "容器实例",
                "ru": "Экземпляр контейнера",
            }
        },
    },
    {
        "key": "azure_AKSCluster",
        "label": "AKS Cluster",
        "category": "Azure:Compute",
        "icon": "view_in_ar",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "AKS-Cluster",
                "fr": "Cluster AKS",
                "es": "Clúster AKS",
                "it": "Cluster AKS",
                "pt": "Cluster AKS",
                "zh": "AKS集群",
                "ru": "Кластер AKS",
            }
        },
    },
    {
        "key": "azure_ContainerApp",
        "label": "Container App",
        "category": "Azure:Compute",
        "icon": "widgets",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Container-App",
                "fr": "Application de conteneur",
                "es": "Aplicación de contenedor",
                "it": "App contenitore",
                "pt": "Aplicativo de contêiner",
                "zh": "容器应用",
                "ru": "Приложение-контейнер",
            }
        },
    },
    {
        "key": "azure_BatchAccount",
        "label": "Batch Account",
        "category": "Azure:Compute",
        "icon": "batch_prediction",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Batch-Konto",
                "fr": "Compte Batch",
                "es": "Cuenta Batch",
                "it": "Account Batch",
                "pt": "Conta Batch",
                "zh": "批处理账户",
                "ru": "Учётная запись Batch",
            }
        },
    },
    # ── Azure:Storage ────────────────────────────────────────────────────────
    {
        "key": "azure_BlobStorage",
        "label": "Blob Storage",
        "category": "Azure:Storage",
        "icon": "storage",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Blob-Speicher",
                "fr": "Stockage Blob",
                "es": "Almacenamiento Blob",
                "it": "Archiviazione Blob",
                "pt": "Armazenamento Blob",
                "zh": "Blob存储",
                "ru": "Хранилище BLOB",
            }
        },
    },
    {
        "key": "azure_FileShare",
        "label": "File Share",
        "category": "Azure:Storage",
        "icon": "folder_shared",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Dateifreigabe",
                "fr": "Partage de fichiers",
                "es": "Recurso compartido de archivos",
                "it": "Condivisione file",
                "pt": "Compartilhamento de arquivo",
                "zh": "文件共享",
                "ru": "Файловый ресурс",
            }
        },
    },
    {
        "key": "azure_DiskStorage",
        "label": "Disk Storage",
        "category": "Azure:Storage",
        "icon": "hard_drive",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Datenträgerspeicher",
                "fr": "Stockage sur disque",
                "es": "Almacenamiento en disco",
                "it": "Archiviazione su disco",
                "pt": "Armazenamento em disco",
                "zh": "磁盘存储",
                "ru": "Дисковое хранилище",
            }
        },
    },
    {
        "key": "azure_QueueStorage",
        "label": "Queue Storage",
        "category": "Azure:Storage",
        "icon": "queue",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Warteschlangenspeicher",
                "fr": "Stockage File d'attente",
                "es": "Almacenamiento en cola",
                "it": "Archiviazione code",
                "pt": "Armazenamento em fila",
                "zh": "队列存储",
                "ru": "Хранилище очередей",
            }
        },
    },
    {
        "key": "azure_TableStorage",
        "label": "Table Storage",
        "category": "Azure:Storage",
        "icon": "table_chart",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Tabellenspeicher",
                "fr": "Stockage Table",
                "es": "Almacenamiento en tabla",
                "it": "Archiviazione tabelle",
                "pt": "Armazenamento em tabela",
                "zh": "表存储",
                "ru": "Хранилище таблиц",
            }
        },
    },
    {
        "key": "azure_DataLakeStorage",
        "label": "Data Lake Storage",
        "category": "Azure:Storage",
        "icon": "water",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Data Lake-Speicher",
                "fr": "Stockage Data Lake",
                "es": "Almacenamiento Data Lake",
                "it": "Archiviazione Data Lake",
                "pt": "Armazenamento Data Lake",
                "zh": "数据湖存储",
                "ru": "Хранилище Data Lake",
            }
        },
    },
    # ── Azure:Database ───────────────────────────────────────────────────────
    {
        "key": "azure_SQLDatabase",
        "label": "SQL Database",
        "category": "Azure:Database",
        "icon": "database",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "SQL-Datenbank",
                "fr": "Base de données SQL",
                "es": "Base de datos SQL",
                "it": "Database SQL",
                "pt": "Banco de dados SQL",
                "zh": "SQL数据库",
                "ru": "База данных SQL",
            }
        },
    },
    {
        "key": "azure_MySQLDatabase",
        "label": "MySQL Database",
        "category": "Azure:Database",
        "icon": "database",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "MySQL-Datenbank",
                "fr": "Base de données MySQL",
                "es": "Base de datos MySQL",
                "it": "Database MySQL",
                "pt": "Banco de dados MySQL",
                "zh": "MySQL数据库",
                "ru": "База данных MySQL",
            }
        },
    },
    {
        "key": "azure_PostgreSQLDatabase",
        "label": "PostgreSQL Database",
        "category": "Azure:Database",
        "icon": "database",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "PostgreSQL-Datenbank",
                "fr": "Base de données PostgreSQL",
                "es": "Base de datos PostgreSQL",
                "it": "Database PostgreSQL",
                "pt": "Banco de dados PostgreSQL",
                "zh": "PostgreSQL数据库",
                "ru": "База данных PostgreSQL",
            }
        },
    },
    {
        "key": "azure_CosmosDB",
        "label": "Cosmos DB",
        "category": "Azure:Database",
        "icon": "travel_explore",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Cosmos DB",
                "fr": "Cosmos DB",
                "es": "Cosmos DB",
                "it": "Cosmos DB",
                "pt": "Cosmos DB",
                "zh": "Cosmos DB",
                "ru": "Cosmos DB",
            }
        },
    },
    {
        "key": "azure_RedisCache",
        "label": "Redis Cache",
        "category": "Azure:Database",
        "icon": "memory",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Redis-Cache",
                "fr": "Cache Redis",
                "es": "Caché Redis",
                "it": "Cache Redis",
                "pt": "Cache Redis",
                "zh": "Redis缓存",
                "ru": "Кэш Redis",
            }
        },
    },
    {
        "key": "azure_SynapseAnalytics",
        "label": "Synapse Analytics",
        "category": "Azure:Database",
        "icon": "analytics",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Synapse Analytics",
                "fr": "Synapse Analytics",
                "es": "Synapse Analytics",
                "it": "Synapse Analytics",
                "pt": "Synapse Analytics",
                "zh": "Synapse Analytics",
                "ru": "Synapse Analytics",
            }
        },
    },
    # ── Azure:Networking ─────────────────────────────────────────────────────
    {
        "key": "azure_LoadBalancer",
        "label": "Load Balancer",
        "category": "Azure:Networking",
        "icon": "balance",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Load Balancer",
                "fr": "Équilibreur de charge",
                "es": "Balanceador de carga",
                "it": "Bilanciatore del carico",
                "pt": "Balanceador de carga",
                "zh": "负载均衡器",
                "ru": "Балансировщик нагрузки",
            }
        },
    },
    {
        "key": "azure_ApplicationGateway",
        "label": "Application Gateway",
        "category": "Azure:Networking",
        "icon": "router",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Anwendungsgateway",
                "fr": "Passerelle d'application",
                "es": "Puerta de enlace de aplicación",
                "it": "Gateway applicazione",
                "pt": "Gateway de aplicativo",
                "zh": "应用程序网关",
                "ru": "Шлюз приложений",
            }
        },
    },
    {
        "key": "azure_VPNGateway",
        "label": "VPN Gateway",
        "category": "Azure:Networking",
        "icon": "vpn_key",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "VPN-Gateway",
                "fr": "Passerelle VPN",
                "es": "Puerta de enlace VPN",
                "it": "Gateway VPN",
                "pt": "Gateway VPN",
                "zh": "VPN网关",
                "ru": "VPN-шлюз",
            }
        },
    },
    {
        "key": "azure_ExpressRoute",
        "label": "Express Route",
        "category": "Azure:Networking",
        "icon": "cable",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Express Route",
                "fr": "Express Route",
                "es": "Express Route",
                "it": "Express Route",
                "pt": "Express Route",
                "zh": "快速通道",
                "ru": "Express Route",
            }
        },
    },
    {
        "key": "azure_TrafficManager",
        "label": "Traffic Manager",
        "category": "Azure:Networking",
        "icon": "traffic",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Traffic Manager",
                "fr": "Traffic Manager",
                "es": "Traffic Manager",
                "it": "Traffic Manager",
                "pt": "Traffic Manager",
                "zh": "流量管理器",
                "ru": "Traffic Manager",
            }
        },
    },
    {
        "key": "azure_CDN",
        "label": "Content Delivery Network",
        "category": "Azure:Networking",
        "icon": "cloud_download",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Content Delivery Network",
                "fr": "Réseau de distribution de contenu",
                "es": "Red de distribución de contenido",
                "it": "Rete di distribuzione dei contenuti",
                "pt": "Rede de distribuição de conteúdo",
                "zh": "内容分发网络",
                "ru": "Сеть доставки контента",
            }
        },
    },
    {
        "key": "azure_NSG",
        "label": "Network Security Group",
        "category": "Azure:Networking",
        "icon": "security",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Netzwerksicherheitsgruppe",
                "fr": "Groupe de sécurité réseau",
                "es": "Grupo de seguridad de red",
                "it": "Gruppo di sicurezza di rete",
                "pt": "Grupo de segurança de rede",
                "zh": "网络安全组",
                "ru": "Группа безопасности сети",
            }
        },
    },
    {
        "key": "azure_Firewall",
        "label": "Azure Firewall",
        "category": "Azure:Networking",
        "icon": "fireplace",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Azure Firewall",
                "fr": "Pare-feu Azure",
                "es": "Firewall de Azure",
                "it": "Firewall Azure",
                "pt": "Firewall do Azure",
                "zh": "Azure防火墙",
                "ru": "Брандмауэр Azure",
            }
        },
    },
    # ── Azure:Analytics ──────────────────────────────────────────────────────
    {
        "key": "azure_EventHub",
        "label": "Event Hub",
        "category": "Azure:Analytics",
        "icon": "hub",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Event Hub",
                "fr": "Event Hub",
                "es": "Event Hub",
                "it": "Event Hub",
                "pt": "Event Hub",
                "zh": "事件中心",
                "ru": "Центр событий",
            }
        },
    },
    {
        "key": "azure_StreamAnalytics",
        "label": "Stream Analytics",
        "category": "Azure:Analytics",
        "icon": "stream",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Stream Analytics",
                "fr": "Stream Analytics",
                "es": "Stream Analytics",
                "it": "Stream Analytics",
                "pt": "Stream Analytics",
                "zh": "流分析",
                "ru": "Stream Analytics",
            }
        },
    },
    {
        "key": "azure_Databricks",
        "label": "Databricks",
        "category": "Azure:Analytics",
        "icon": "auto_awesome",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Databricks",
                "fr": "Databricks",
                "es": "Databricks",
                "it": "Databricks",
                "pt": "Databricks",
                "zh": "Databricks",
                "ru": "Databricks",
            }
        },
    },
    {
        "key": "azure_DataFactory",
        "label": "Data Factory",
        "category": "Azure:Analytics",
        "icon": "factory",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Data Factory",
                "fr": "Data Factory",
                "es": "Data Factory",
                "it": "Data Factory",
                "pt": "Data Factory",
                "zh": "数据工厂",
                "ru": "Data Factory",
            }
        },
    },
    {
        "key": "azure_PowerBI",
        "label": "Power BI",
        "category": "Azure:Analytics",
        "icon": "bar_chart",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Power BI",
                "fr": "Power BI",
                "es": "Power BI",
                "it": "Power BI",
                "pt": "Power BI",
                "zh": "Power BI",
                "ru": "Power BI",
            }
        },
    },
    # ── Azure:Security ───────────────────────────────────────────────────────
    {
        "key": "azure_EntraID",
        "label": "Entra ID",
        "category": "Azure:Security",
        "icon": "manage_accounts",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Entra ID",
                "fr": "Entra ID",
                "es": "Entra ID",
                "it": "Entra ID",
                "pt": "Entra ID",
                "zh": "Entra ID",
                "ru": "Entra ID",
            }
        },
    },
    {
        "key": "azure_KeyVault",
        "label": "Key Vault",
        "category": "Azure:Security",
        "icon": "key",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Schlüsseltresor",
                "fr": "Coffre de clés",
                "es": "Almacén de claves",
                "it": "Key Vault",
                "pt": "Cofre de chaves",
                "zh": "密钥保管库",
                "ru": "Хранилище ключей",
            }
        },
    },
    {
        "key": "azure_SecurityCenter",
        "label": "Security Center",
        "category": "Azure:Security",
        "icon": "security",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Security Center",
                "fr": "Centre de sécurité",
                "es": "Centro de seguridad",
                "it": "Centro sicurezza",
                "pt": "Central de segurança",
                "zh": "安全中心",
                "ru": "Центр безопасности",
            }
        },
    },
    {
        "key": "azure_DDoSProtection",
        "label": "DDoS Protection",
        "category": "Azure:Security",
        "icon": "shield",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "DDoS-Schutz",
                "fr": "Protection DDoS",
                "es": "Protección DDoS",
                "it": "Protezione DDoS",
                "pt": "Proteção DDoS",
                "zh": "DDoS防护",
                "ru": "Защита от DDoS",
            }
        },
    },
    {
        "key": "azure_WebApplicationFirewall",
        "label": "Web Application Firewall",
        "category": "Azure:Security",
        "icon": "gpp_good",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Web Application Firewall",
                "fr": "Pare-feu d'application web",
                "es": "Firewall de aplicación web",
                "it": "Firewall applicazione web",
                "pt": "Firewall de aplicativo web",
                "zh": "Web应用防火墙",
                "ru": "Брандмауэр веб-приложений",
            }
        },
    },
    {
        "key": "azure_Policy",
        "label": "Azure Policy",
        "category": "Azure:Security",
        "icon": "policy",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Azure-Richtlinie",
                "fr": "Stratégie Azure",
                "es": "Directiva Azure",
                "it": "Criteri Azure",
                "pt": "Política do Azure",
                "zh": "Azure策略",
                "ru": "Политика Azure",
            }
        },
    },
    {
        "key": "azure_Monitor",
        "label": "Azure Monitor",
        "category": "Azure:Security",
        "icon": "monitor_heart",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Azure Monitor",
                "fr": "Azure Monitor",
                "es": "Azure Monitor",
                "it": "Azure Monitor",
                "pt": "Azure Monitor",
                "zh": "Azure监视器",
                "ru": "Azure Monitor",
            }
        },
    },
    # ── Azure:Management ─────────────────────────────────────────────────────
    {
        "key": "azure_AzureMonitor",
        "label": "Azure Monitor Logs",
        "category": "Azure:Management",
        "icon": "insights",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Azure Monitor-Protokolle",
                "fr": "Journaux Azure Monitor",
                "es": "Registros de Azure Monitor",
                "it": "Log di Azure Monitor",
                "pt": "Logs do Azure Monitor",
                "zh": "Azure Monitor日志",
                "ru": "Журналы Azure Monitor",
            }
        },
    },
    {
        "key": "azure_AppInsights",
        "label": "Application Insights",
        "category": "Azure:Management",
        "icon": "lightbulb",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Application Insights",
                "fr": "Application Insights",
                "es": "Application Insights",
                "it": "Application Insights",
                "pt": "Application Insights",
                "zh": "应用程序见解",
                "ru": "Application Insights",
            }
        },
    },
    {
        "key": "azure_Automation",
        "label": "Azure Automation",
        "category": "Azure:Management",
        "icon": "smart_toy",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Azure Automation",
                "fr": "Azure Automation",
                "es": "Azure Automation",
                "it": "Azure Automation",
                "pt": "Azure Automation",
                "zh": "Azure自动化",
                "ru": "Azure Automation",
            }
        },
    },
    {
        "key": "azure_ResourceManager",
        "label": "Resource Manager",
        "category": "Azure:Management",
        "icon": "manage_search",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Ressourcen-Manager",
                "fr": "Gestionnaire de ressources",
                "es": "Administrador de recursos",
                "it": "Gestione risorse",
                "pt": "Gerenciador de recursos",
                "zh": "资源管理器",
                "ru": "Диспетчер ресурсов",
            }
        },
    },
    {
        "key": "azure_CostManagement",
        "label": "Cost Management",
        "category": "Azure:Management",
        "icon": "payments",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Kostenverwaltung",
                "fr": "Gestion des coûts",
                "es": "Administración de costos",
                "it": "Gestione dei costi",
                "pt": "Gerenciamento de custos",
                "zh": "成本管理",
                "ru": "Управление затратами",
            }
        },
    },
    {
        "key": "azure_LogAnalytics",
        "label": "Log Analytics",
        "category": "Azure:Management",
        "icon": "troubleshoot",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Log Analytics",
                "fr": "Log Analytics",
                "es": "Log Analytics",
                "it": "Log Analytics",
                "pt": "Log Analytics",
                "zh": "日志分析",
                "ru": "Log Analytics",
            }
        },
    },
    {
        "key": "azure_DevOpsProject",
        "label": "DevOps Project",
        "category": "Azure:Management",
        "icon": "code",
        "color": "#0089D6",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "DevOps-Projekt",
                "fr": "Projet DevOps",
                "es": "Proyecto DevOps",
                "it": "Progetto DevOps",
                "pt": "Projeto DevOps",
                "zh": "DevOps项目",
                "ru": "Проект DevOps",
            }
        },
    },
]

_RELATION_TYPES: list[dict] = [
    {
        "key": "azure_rel_containedIn",
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
        "key": "azure_rel_networkAttachment",
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
        "key": "azure_rel_securityRule",
        "label": "protected by",
        "reverse_label": "protects",
        "translations": {
            "label": {
                "de": "geschützt durch",
                "fr": "protégé par",
                "es": "protegido por",
                "it": "protetto da",
                "pt": "protegido por",
                "zh": "受保护于",
                "ru": "защищён",
            },
            "reverse_label": {
                "de": "schützt",
                "fr": "protège",
                "es": "protege",
                "it": "protegge",
                "pt": "protege",
                "zh": "保护",
                "ru": "защищает",
            },
        },
    },
    {
        "key": "azure_rel_routing",
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
        "key": "azure_rel_dataReplication",
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
        "key": "azure_rel_logTarget",
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
        "key": "azure_rel_serviceDependency",
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
        "key": "azure_rel_encryptedBy",
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
        "key": "azure_rel_managedIdentity",
        "label": "authenticated via",
        "reverse_label": "authenticates",
        "translations": {
            "label": {
                "de": "authentifiziert über",
                "fr": "authentifié via",
                "es": "autenticado mediante",
                "it": "autenticato tramite",
                "pt": "autenticado via",
                "zh": "通过身份验证",
                "ru": "аутентифицируется через",
            },
            "reverse_label": {
                "de": "authentifiziert",
                "fr": "authentifie",
                "es": "autentica",
                "it": "autentica",
                "pt": "autentica",
                "zh": "身份验证",
                "ru": "аутентифицирует",
            },
        },
    },
    {
        "key": "azure_rel_triggerOf",
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
        "key": "azure_rel_backupOf",
        "label": "backup of",
        "reverse_label": "backed up by",
        "translations": {
            "label": {
                "de": "Sicherung von",
                "fr": "sauvegarde de",
                "es": "copia de seguridad de",
                "it": "backup di",
                "pt": "backup de",
                "zh": "备份属于",
                "ru": "резервная копия",
            },
            "reverse_label": {
                "de": "gesichert durch",
                "fr": "sauvegardé par",
                "es": "respaldado por",
                "it": "con backup tramite",
                "pt": "com backup feito por",
                "zh": "由...备份",
                "ru": "резервируется",
            },
        },
    },
    {
        "key": "azure_rel_replicatedTo",
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


async def seed_azure_metamodel(db: AsyncSession) -> dict:
    """Idempotently seed all Azure card types and relation types.

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
                color=spec.get("color", "#0089D6"),
                category=spec.get("category", "Azure"),
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
