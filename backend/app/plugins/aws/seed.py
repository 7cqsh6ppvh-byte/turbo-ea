"""AWS architecture modeling metamodel seed.

Seeds 52 card types and 12 relation types across 8 AWS service categories,
all with plugin_id = "aws" and 8-locale translations.

Idempotent: running twice inserts nothing new.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card_type import CardType
from app.models.relation_type import RelationType

PLUGIN_ID = "aws"

_ELEMENT_TYPES: list[dict] = [
    # ── AWS:Grouping ─────────────────────────────────────────────────────────
    {
        "key": "aws_Account",
        "label": "AWS Account",
        "category": "AWS:Grouping",
        "icon": "folder",
        "color": "#232F3E",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "AWS-Konto",
                "fr": "Compte AWS",
                "es": "Cuenta AWS",
                "it": "Account AWS",
                "pt": "Conta AWS",
                "zh": "AWS账户",
                "ru": "Аккаунт AWS",
            }
        },
    },
    {
        "key": "aws_Region",
        "label": "AWS Region",
        "category": "AWS:Grouping",
        "icon": "public",
        "color": "#232F3E",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "AWS-Region",
                "fr": "Région AWS",
                "es": "Región AWS",
                "it": "Regione AWS",
                "pt": "Região AWS",
                "zh": "AWS区域",
                "ru": "Регион AWS",
            }
        },
    },
    {
        "key": "aws_AvailabilityZone",
        "label": "Availability Zone",
        "category": "AWS:Grouping",
        "icon": "layers",
        "color": "#232F3E",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Verfügbarkeitszone",
                "fr": "Zone de disponibilité",
                "es": "Zona de disponibilidad",
                "it": "Zona di disponibilità",
                "pt": "Zona de disponibilidade",
                "zh": "可用区",
                "ru": "Зона доступности",
            }
        },
    },
    {
        "key": "aws_VPC",
        "label": "VPC",
        "category": "AWS:Grouping",
        "icon": "lan",
        "color": "#232F3E",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "VPC",
                "fr": "VPC",
                "es": "VPC",
                "it": "VPC",
                "pt": "VPC",
                "zh": "VPC",
                "ru": "VPC",
            }
        },
    },
    {
        "key": "aws_Subnet",
        "label": "Subnet",
        "category": "AWS:Grouping",
        "icon": "segment",
        "color": "#232F3E",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Subnetz",
                "fr": "Sous-réseau",
                "es": "Subred",
                "it": "Sottorete",
                "pt": "Sub-rede",
                "zh": "子网",
                "ru": "Подсеть",
            }
        },
    },
    # ── AWS:Compute ──────────────────────────────────────────────────────────
    {
        "key": "aws_EC2Instance",
        "label": "EC2 Instance",
        "category": "AWS:Compute",
        "icon": "computer",
        "color": "#FF9900",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "EC2-Instanz",
                "fr": "Instance EC2",
                "es": "Instancia EC2",
                "it": "Istanza EC2",
                "pt": "Instância EC2",
                "zh": "EC2实例",
                "ru": "Экземпляр EC2",
            }
        },
    },
    {
        "key": "aws_LambdaFunction",
        "label": "Lambda Function",
        "category": "AWS:Compute",
        "icon": "functions",
        "color": "#FF9900",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Lambda-Funktion",
                "fr": "Fonction Lambda",
                "es": "Función Lambda",
                "it": "Funzione Lambda",
                "pt": "Função Lambda",
                "zh": "Lambda函数",
                "ru": "Функция Lambda",
            }
        },
    },
    {
        "key": "aws_ECSCluster",
        "label": "ECS Cluster",
        "category": "AWS:Compute",
        "icon": "grid_view",
        "color": "#FF9900",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "ECS-Cluster",
                "fr": "Cluster ECS",
                "es": "Clúster ECS",
                "it": "Cluster ECS",
                "pt": "Cluster ECS",
                "zh": "ECS集群",
                "ru": "Кластер ECS",
            }
        },
    },
    {
        "key": "aws_EKSCluster",
        "label": "EKS Cluster",
        "category": "AWS:Compute",
        "icon": "hub",
        "color": "#FF9900",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "EKS-Cluster",
                "fr": "Cluster EKS",
                "es": "Clúster EKS",
                "it": "Cluster EKS",
                "pt": "Cluster EKS",
                "zh": "EKS集群",
                "ru": "Кластер EKS",
            }
        },
    },
    {
        "key": "aws_ElasticBeanstalk",
        "label": "Elastic Beanstalk",
        "category": "AWS:Compute",
        "icon": "deployed_code",
        "color": "#FF9900",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Elastic Beanstalk",
                "fr": "Elastic Beanstalk",
                "es": "Elastic Beanstalk",
                "it": "Elastic Beanstalk",
                "pt": "Elastic Beanstalk",
                "zh": "Elastic Beanstalk",
                "ru": "Elastic Beanstalk",
            }
        },
    },
    {
        "key": "aws_AutoScalingGroup",
        "label": "Auto Scaling Group",
        "category": "AWS:Compute",
        "icon": "expand",
        "color": "#FF9900",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Auto-Scaling-Gruppe",
                "fr": "Groupe Auto Scaling",
                "es": "Grupo de Auto Scaling",
                "it": "Gruppo Auto Scaling",
                "pt": "Grupo de Auto Scaling",
                "zh": "自动扩展组",
                "ru": "Группа Auto Scaling",
            }
        },
    },
    {
        "key": "aws_Lightsail",
        "label": "Lightsail",
        "category": "AWS:Compute",
        "icon": "bolt",
        "color": "#FF9900",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Lightsail",
                "fr": "Lightsail",
                "es": "Lightsail",
                "it": "Lightsail",
                "pt": "Lightsail",
                "zh": "Lightsail",
                "ru": "Lightsail",
            }
        },
    },
    # ── AWS:Storage ──────────────────────────────────────────────────────────
    {
        "key": "aws_S3Bucket",
        "label": "S3 Bucket",
        "category": "AWS:Storage",
        "icon": "storage",
        "color": "#7AA116",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "S3-Bucket",
                "fr": "Compartiment S3",
                "es": "Depósito S3",
                "it": "Bucket S3",
                "pt": "Bucket S3",
                "zh": "S3存储桶",
                "ru": "Бакет S3",
            }
        },
    },
    {
        "key": "aws_EBSVolume",
        "label": "EBS Volume",
        "category": "AWS:Storage",
        "icon": "hard_drive",
        "color": "#7AA116",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "EBS-Volume",
                "fr": "Volume EBS",
                "es": "Volumen EBS",
                "it": "Volume EBS",
                "pt": "Volume EBS",
                "zh": "EBS卷",
                "ru": "Том EBS",
            }
        },
    },
    {
        "key": "aws_EFSFileSystem",
        "label": "EFS File System",
        "category": "AWS:Storage",
        "icon": "folder_open",
        "color": "#7AA116",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "EFS-Dateisystem",
                "fr": "Système de fichiers EFS",
                "es": "Sistema de archivos EFS",
                "it": "File system EFS",
                "pt": "Sistema de ficheiros EFS",
                "zh": "EFS文件系统",
                "ru": "Файловая система EFS",
            }
        },
    },
    {
        "key": "aws_S3Glacier",
        "label": "S3 Glacier",
        "category": "AWS:Storage",
        "icon": "archive",
        "color": "#7AA116",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "S3 Glacier",
                "fr": "S3 Glacier",
                "es": "S3 Glacier",
                "it": "S3 Glacier",
                "pt": "S3 Glacier",
                "zh": "S3 Glacier",
                "ru": "S3 Glacier",
            }
        },
    },
    {
        "key": "aws_DataSync",
        "label": "DataSync",
        "category": "AWS:Storage",
        "icon": "sync",
        "color": "#7AA116",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "DataSync",
                "fr": "DataSync",
                "es": "DataSync",
                "it": "DataSync",
                "pt": "DataSync",
                "zh": "DataSync",
                "ru": "DataSync",
            }
        },
    },
    # ── AWS:Database ─────────────────────────────────────────────────────────
    {
        "key": "aws_RDSInstance",
        "label": "RDS Instance",
        "category": "AWS:Database",
        "icon": "database",
        "color": "#3F8624",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "RDS-Instanz",
                "fr": "Instance RDS",
                "es": "Instancia RDS",
                "it": "Istanza RDS",
                "pt": "Instância RDS",
                "zh": "RDS实例",
                "ru": "Экземпляр RDS",
            }
        },
    },
    {
        "key": "aws_AuroraCluster",
        "label": "Aurora Cluster",
        "category": "AWS:Database",
        "icon": "database",
        "color": "#3F8624",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Aurora-Cluster",
                "fr": "Cluster Aurora",
                "es": "Clúster Aurora",
                "it": "Cluster Aurora",
                "pt": "Cluster Aurora",
                "zh": "Aurora集群",
                "ru": "Кластер Aurora",
            }
        },
    },
    {
        "key": "aws_DynamoDBTable",
        "label": "DynamoDB Table",
        "category": "AWS:Database",
        "icon": "table_chart",
        "color": "#3F8624",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "DynamoDB-Tabelle",
                "fr": "Table DynamoDB",
                "es": "Tabla DynamoDB",
                "it": "Tabella DynamoDB",
                "pt": "Tabela DynamoDB",
                "zh": "DynamoDB表",
                "ru": "Таблица DynamoDB",
            }
        },
    },
    {
        "key": "aws_RedshiftCluster",
        "label": "Redshift Cluster",
        "category": "AWS:Database",
        "icon": "analytics",
        "color": "#3F8624",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Redshift-Cluster",
                "fr": "Cluster Redshift",
                "es": "Clúster Redshift",
                "it": "Cluster Redshift",
                "pt": "Cluster Redshift",
                "zh": "Redshift集群",
                "ru": "Кластер Redshift",
            }
        },
    },
    {
        "key": "aws_ElastiCacheCluster",
        "label": "ElastiCache Cluster",
        "category": "AWS:Database",
        "icon": "memory",
        "color": "#3F8624",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "ElastiCache-Cluster",
                "fr": "Cluster ElastiCache",
                "es": "Clúster ElastiCache",
                "it": "Cluster ElastiCache",
                "pt": "Cluster ElastiCache",
                "zh": "ElastiCache集群",
                "ru": "Кластер ElastiCache",
            }
        },
    },
    {
        "key": "aws_DocumentDB",
        "label": "DocumentDB",
        "category": "AWS:Database",
        "icon": "description",
        "color": "#3F8624",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "DocumentDB",
                "fr": "DocumentDB",
                "es": "DocumentDB",
                "it": "DocumentDB",
                "pt": "DocumentDB",
                "zh": "DocumentDB",
                "ru": "DocumentDB",
            }
        },
    },
    {
        "key": "aws_NeptuneDB",
        "label": "Neptune DB",
        "category": "AWS:Database",
        "icon": "share",
        "color": "#3F8624",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Neptune DB",
                "fr": "Neptune DB",
                "es": "Neptune DB",
                "it": "Neptune DB",
                "pt": "Neptune DB",
                "zh": "Neptune DB",
                "ru": "Neptune DB",
            }
        },
    },
    # ── AWS:Networking ───────────────────────────────────────────────────────
    {
        "key": "aws_LoadBalancer",
        "label": "Load Balancer",
        "category": "AWS:Networking",
        "icon": "balance",
        "color": "#8C4FFF",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Load Balancer",
                "fr": "Répartiteur de charge",
                "es": "Balanceador de carga",
                "it": "Load Balancer",
                "pt": "Balanceador de carga",
                "zh": "负载均衡器",
                "ru": "Балансировщик нагрузки",
            }
        },
    },
    {
        "key": "aws_Route53",
        "label": "Route 53",
        "category": "AWS:Networking",
        "icon": "dns",
        "color": "#8C4FFF",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Route 53",
                "fr": "Route 53",
                "es": "Route 53",
                "it": "Route 53",
                "pt": "Route 53",
                "zh": "Route 53",
                "ru": "Route 53",
            }
        },
    },
    {
        "key": "aws_CloudFront",
        "label": "CloudFront",
        "category": "AWS:Networking",
        "icon": "speed",
        "color": "#8C4FFF",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "CloudFront",
                "fr": "CloudFront",
                "es": "CloudFront",
                "it": "CloudFront",
                "pt": "CloudFront",
                "zh": "CloudFront",
                "ru": "CloudFront",
            }
        },
    },
    {
        "key": "aws_DirectConnect",
        "label": "Direct Connect",
        "category": "AWS:Networking",
        "icon": "cable",
        "color": "#8C4FFF",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Direct Connect",
                "fr": "Direct Connect",
                "es": "Direct Connect",
                "it": "Direct Connect",
                "pt": "Direct Connect",
                "zh": "Direct Connect",
                "ru": "Direct Connect",
            }
        },
    },
    {
        "key": "aws_VPNGateway",
        "label": "VPN Gateway",
        "category": "AWS:Networking",
        "icon": "vpn_lock",
        "color": "#8C4FFF",
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
        "key": "aws_APIGateway",
        "label": "API Gateway",
        "category": "AWS:Networking",
        "icon": "api",
        "color": "#8C4FFF",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "API-Gateway",
                "fr": "Passerelle API",
                "es": "Puerta de enlace API",
                "it": "API Gateway",
                "pt": "Gateway de API",
                "zh": "API网关",
                "ru": "API-шлюз",
            }
        },
    },
    {
        "key": "aws_NATGateway",
        "label": "NAT Gateway",
        "category": "AWS:Networking",
        "icon": "swap_horiz",
        "color": "#8C4FFF",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "NAT-Gateway",
                "fr": "Passerelle NAT",
                "es": "Puerta de enlace NAT",
                "it": "Gateway NAT",
                "pt": "Gateway NAT",
                "zh": "NAT网关",
                "ru": "NAT-шлюз",
            }
        },
    },
    {
        "key": "aws_TransitGateway",
        "label": "Transit Gateway",
        "category": "AWS:Networking",
        "icon": "device_hub",
        "color": "#8C4FFF",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Transit-Gateway",
                "fr": "Passerelle de transit",
                "es": "Puerta de enlace de tránsito",
                "it": "Transit Gateway",
                "pt": "Gateway de trânsito",
                "zh": "传输网关",
                "ru": "Транзитный шлюз",
            }
        },
    },
    # ── AWS:Analytics ────────────────────────────────────────────────────────
    {
        "key": "aws_KinesisStream",
        "label": "Kinesis Stream",
        "category": "AWS:Analytics",
        "icon": "stream",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Kinesis-Stream",
                "fr": "Flux Kinesis",
                "es": "Stream Kinesis",
                "it": "Stream Kinesis",
                "pt": "Stream Kinesis",
                "zh": "Kinesis流",
                "ru": "Поток Kinesis",
            }
        },
    },
    {
        "key": "aws_Athena",
        "label": "Athena",
        "category": "AWS:Analytics",
        "icon": "query_stats",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Athena",
                "fr": "Athena",
                "es": "Athena",
                "it": "Athena",
                "pt": "Athena",
                "zh": "Athena",
                "ru": "Athena",
            }
        },
    },
    {
        "key": "aws_EMRCluster",
        "label": "EMR Cluster",
        "category": "AWS:Analytics",
        "icon": "bubble_chart",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "EMR-Cluster",
                "fr": "Cluster EMR",
                "es": "Clúster EMR",
                "it": "Cluster EMR",
                "pt": "Cluster EMR",
                "zh": "EMR集群",
                "ru": "Кластер EMR",
            }
        },
    },
    {
        "key": "aws_GlueJob",
        "label": "Glue Job",
        "category": "AWS:Analytics",
        "icon": "transform",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Glue-Job",
                "fr": "Tâche Glue",
                "es": "Trabajo Glue",
                "it": "Job Glue",
                "pt": "Job Glue",
                "zh": "Glue作业",
                "ru": "Задание Glue",
            }
        },
    },
    {
        "key": "aws_QuickSight",
        "label": "QuickSight",
        "category": "AWS:Analytics",
        "icon": "bar_chart",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "QuickSight",
                "fr": "QuickSight",
                "es": "QuickSight",
                "it": "QuickSight",
                "pt": "QuickSight",
                "zh": "QuickSight",
                "ru": "QuickSight",
            }
        },
    },
    # ── AWS:Security ─────────────────────────────────────────────────────────
    {
        "key": "aws_IAMRole",
        "label": "IAM Role",
        "category": "AWS:Security",
        "icon": "manage_accounts",
        "color": "#DD344C",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "IAM-Rolle",
                "fr": "Rôle IAM",
                "es": "Rol IAM",
                "it": "Ruolo IAM",
                "pt": "Papel IAM",
                "zh": "IAM角色",
                "ru": "Роль IAM",
            }
        },
    },
    {
        "key": "aws_SecretsManager",
        "label": "Secrets Manager",
        "category": "AWS:Security",
        "icon": "key",
        "color": "#DD344C",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Secrets Manager",
                "fr": "Gestionnaire de secrets",
                "es": "Administrador de secretos",
                "it": "Secrets Manager",
                "pt": "Gestor de segredos",
                "zh": "Secrets Manager",
                "ru": "Менеджер секретов",
            }
        },
    },
    {
        "key": "aws_KMSKey",
        "label": "KMS Key",
        "category": "AWS:Security",
        "icon": "lock",
        "color": "#DD344C",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "KMS-Schlüssel",
                "fr": "Clé KMS",
                "es": "Clave KMS",
                "it": "Chiave KMS",
                "pt": "Chave KMS",
                "zh": "KMS密钥",
                "ru": "Ключ KMS",
            }
        },
    },
    {
        "key": "aws_CloudTrail",
        "label": "CloudTrail",
        "category": "AWS:Security",
        "icon": "history",
        "color": "#DD344C",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "CloudTrail",
                "fr": "CloudTrail",
                "es": "CloudTrail",
                "it": "CloudTrail",
                "pt": "CloudTrail",
                "zh": "CloudTrail",
                "ru": "CloudTrail",
            }
        },
    },
    {
        "key": "aws_GuardDuty",
        "label": "GuardDuty",
        "category": "AWS:Security",
        "icon": "shield",
        "color": "#DD344C",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "GuardDuty",
                "fr": "GuardDuty",
                "es": "GuardDuty",
                "it": "GuardDuty",
                "pt": "GuardDuty",
                "zh": "GuardDuty",
                "ru": "GuardDuty",
            }
        },
    },
    {
        "key": "aws_SecurityGroup",
        "label": "Security Group",
        "category": "AWS:Security",
        "icon": "security",
        "color": "#DD344C",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Sicherheitsgruppe",
                "fr": "Groupe de sécurité",
                "es": "Grupo de seguridad",
                "it": "Gruppo di sicurezza",
                "pt": "Grupo de segurança",
                "zh": "安全组",
                "ru": "Группа безопасности",
            }
        },
    },
    {
        "key": "aws_WAF",
        "label": "WAF",
        "category": "AWS:Security",
        "icon": "firewall",
        "color": "#DD344C",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "WAF",
                "fr": "WAF",
                "es": "WAF",
                "it": "WAF",
                "pt": "WAF",
                "zh": "WAF",
                "ru": "WAF",
            }
        },
    },
    # ── AWS:Management ───────────────────────────────────────────────────────
    {
        "key": "aws_CloudWatch",
        "label": "CloudWatch",
        "category": "AWS:Management",
        "icon": "monitor_heart",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "CloudWatch",
                "fr": "CloudWatch",
                "es": "CloudWatch",
                "it": "CloudWatch",
                "pt": "CloudWatch",
                "zh": "CloudWatch",
                "ru": "CloudWatch",
            }
        },
    },
    {
        "key": "aws_CloudFormation",
        "label": "CloudFormation",
        "category": "AWS:Management",
        "icon": "account_tree",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "CloudFormation",
                "fr": "CloudFormation",
                "es": "CloudFormation",
                "it": "CloudFormation",
                "pt": "CloudFormation",
                "zh": "CloudFormation",
                "ru": "CloudFormation",
            }
        },
    },
    {
        "key": "aws_SystemsManager",
        "label": "Systems Manager",
        "category": "AWS:Management",
        "icon": "settings",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Systems Manager",
                "fr": "Systems Manager",
                "es": "Systems Manager",
                "it": "Systems Manager",
                "pt": "Systems Manager",
                "zh": "Systems Manager",
                "ru": "Systems Manager",
            }
        },
    },
    {
        "key": "aws_SNSTopic",
        "label": "SNS Topic",
        "category": "AWS:Management",
        "icon": "notifications",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "SNS-Thema",
                "fr": "Sujet SNS",
                "es": "Tema SNS",
                "it": "Topic SNS",
                "pt": "Tópico SNS",
                "zh": "SNS主题",
                "ru": "Тема SNS",
            }
        },
    },
    {
        "key": "aws_SQSQueue",
        "label": "SQS Queue",
        "category": "AWS:Management",
        "icon": "queue",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "SQS-Warteschlange",
                "fr": "File d'attente SQS",
                "es": "Cola SQS",
                "it": "Coda SQS",
                "pt": "Fila SQS",
                "zh": "SQS队列",
                "ru": "Очередь SQS",
            }
        },
    },
    {
        "key": "aws_StepFunctions",
        "label": "Step Functions",
        "category": "AWS:Management",
        "icon": "schema",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Step Functions",
                "fr": "Step Functions",
                "es": "Step Functions",
                "it": "Step Functions",
                "pt": "Step Functions",
                "zh": "Step Functions",
                "ru": "Step Functions",
            }
        },
    },
    {
        "key": "aws_EventBridge",
        "label": "EventBridge",
        "category": "AWS:Management",
        "icon": "event",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "EventBridge",
                "fr": "EventBridge",
                "es": "EventBridge",
                "it": "EventBridge",
                "pt": "EventBridge",
                "zh": "EventBridge",
                "ru": "EventBridge",
            }
        },
    },
    {
        "key": "aws_CodePipeline",
        "label": "CodePipeline",
        "category": "AWS:Management",
        "icon": "build",
        "color": "#E7157B",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "CodePipeline",
                "fr": "CodePipeline",
                "es": "CodePipeline",
                "it": "CodePipeline",
                "pt": "CodePipeline",
                "zh": "CodePipeline",
                "ru": "CodePipeline",
            }
        },
    },
]

_RELATION_TYPES: list[dict] = [
    {
        "key": "aws_rel_containedIn",
        "label": "Contained in",
        "reverse_label": "Contains",
        "translations": {
            "label": {
                "de": "Enthalten in",
                "fr": "Contenu dans",
                "es": "Contenido en",
                "it": "Contenuto in",
                "pt": "Contido em",
                "zh": "包含于",
                "ru": "Содержится в",
            },
            "reverse_label": {
                "de": "Enthält",
                "fr": "Contient",
                "es": "Contiene",
                "it": "Contiene",
                "pt": "Contém",
                "zh": "包含",
                "ru": "Содержит",
            },
        },
    },
    {
        "key": "aws_rel_networkAttachment",
        "label": "Network attachment",
        "reverse_label": "Attached to network",
        "translations": {
            "label": {
                "de": "Netzwerkanbindung",
                "fr": "Attachement réseau",
                "es": "Conexión de red",
                "it": "Collegamento rete",
                "pt": "Ligação de rede",
                "zh": "网络连接",
                "ru": "Сетевое подключение",
            },
            "reverse_label": {
                "de": "Im Netzwerk",
                "fr": "Attaché au réseau",
                "es": "Conectado a la red",
                "it": "Collegato alla rete",
                "pt": "Ligado à rede",
                "zh": "连接到网络",
                "ru": "Подключён к сети",
            },
        },
    },
    {
        "key": "aws_rel_securityRule",
        "label": "Security rule",
        "reverse_label": "Secured by",
        "translations": {
            "label": {
                "de": "Sicherheitsregel",
                "fr": "Règle de sécurité",
                "es": "Regla de seguridad",
                "it": "Regola di sicurezza",
                "pt": "Regra de segurança",
                "zh": "安全规则",
                "ru": "Правило безопасности",
            },
            "reverse_label": {
                "de": "Gesichert durch",
                "fr": "Sécurisé par",
                "es": "Asegurado por",
                "it": "Protetto da",
                "pt": "Protegido por",
                "zh": "受保护于",
                "ru": "Защищён",
            },
        },
    },
    {
        "key": "aws_rel_routing",
        "label": "Routes to",
        "reverse_label": "Routed from",
        "translations": {
            "label": {
                "de": "Leitet weiter zu",
                "fr": "Achemine vers",
                "es": "Enruta hacia",
                "it": "Instrada verso",
                "pt": "Encaminha para",
                "zh": "路由到",
                "ru": "Маршрутизирует к",
            },
            "reverse_label": {
                "de": "Weitergeleitet von",
                "fr": "Acheminé depuis",
                "es": "Enrutado desde",
                "it": "Instradato da",
                "pt": "Encaminhado de",
                "zh": "从路由",
                "ru": "Маршрутизирован от",
            },
        },
    },
    {
        "key": "aws_rel_dataReplication",
        "label": "Replicates data to",
        "reverse_label": "Receives data from",
        "translations": {
            "label": {
                "de": "Repliziert Daten nach",
                "fr": "Réplique les données vers",
                "es": "Replica datos hacia",
                "it": "Replica dati verso",
                "pt": "Replica dados para",
                "zh": "复制数据到",
                "ru": "Реплицирует данные в",
            },
            "reverse_label": {
                "de": "Empfängt Daten von",
                "fr": "Reçoit les données de",
                "es": "Recibe datos de",
                "it": "Riceve dati da",
                "pt": "Recebe dados de",
                "zh": "从接收数据",
                "ru": "Получает данные от",
            },
        },
    },
    {
        "key": "aws_rel_logTarget",
        "label": "Logs to",
        "reverse_label": "Receives logs from",
        "translations": {
            "label": {
                "de": "Protokolliert nach",
                "fr": "Journalise vers",
                "es": "Registra en",
                "it": "Registra in",
                "pt": "Regista em",
                "zh": "日志到",
                "ru": "Ведёт журнал в",
            },
            "reverse_label": {
                "de": "Empfängt Protokolle von",
                "fr": "Reçoit les journaux de",
                "es": "Recibe registros de",
                "it": "Riceve log da",
                "pt": "Recebe registos de",
                "zh": "接收日志自",
                "ru": "Получает журналы от",
            },
        },
    },
    {
        "key": "aws_rel_serviceDependency",
        "label": "Depends on",
        "reverse_label": "Is used by",
        "translations": {
            "label": {
                "de": "Hängt ab von",
                "fr": "Dépend de",
                "es": "Depende de",
                "it": "Dipende da",
                "pt": "Depende de",
                "zh": "依赖于",
                "ru": "Зависит от",
            },
            "reverse_label": {
                "de": "Wird verwendet von",
                "fr": "Est utilisé par",
                "es": "Es utilizado por",
                "it": "È usato da",
                "pt": "É usado por",
                "zh": "被使用于",
                "ru": "Используется",
            },
        },
    },
    {
        "key": "aws_rel_encryptedBy",
        "label": "Encrypted by",
        "reverse_label": "Encrypts",
        "translations": {
            "label": {
                "de": "Verschlüsselt durch",
                "fr": "Chiffré par",
                "es": "Cifrado por",
                "it": "Cifrato da",
                "pt": "Cifrado por",
                "zh": "被加密于",
                "ru": "Зашифрован",
            },
            "reverse_label": {
                "de": "Verschlüsselt",
                "fr": "Chiffre",
                "es": "Cifra",
                "it": "Cifra",
                "pt": "Cifra",
                "zh": "加密",
                "ru": "Шифрует",
            },
        },
    },
    {
        "key": "aws_rel_accessControlledBy",
        "label": "Access controlled by",
        "reverse_label": "Controls access to",
        "translations": {
            "label": {
                "de": "Zugriff kontrolliert durch",
                "fr": "Accès contrôlé par",
                "es": "Acceso controlado por",
                "it": "Accesso controllato da",
                "pt": "Acesso controlado por",
                "zh": "访问受控于",
                "ru": "Доступ контролируется",
            },
            "reverse_label": {
                "de": "Kontrolliert Zugriff auf",
                "fr": "Contrôle l'accès à",
                "es": "Controla el acceso a",
                "it": "Controlla l'accesso a",
                "pt": "Controla o acesso a",
                "zh": "控制访问",
                "ru": "Контролирует доступ",
            },
        },
    },
    {
        "key": "aws_rel_triggerOf",
        "label": "Triggers",
        "reverse_label": "Triggered by",
        "translations": {
            "label": {
                "de": "Löst aus",
                "fr": "Déclenche",
                "es": "Desencadena",
                "it": "Attiva",
                "pt": "Aciona",
                "zh": "触发",
                "ru": "Запускает",
            },
            "reverse_label": {
                "de": "Ausgelöst von",
                "fr": "Déclenché par",
                "es": "Desencadenado por",
                "it": "Attivato da",
                "pt": "Acionado por",
                "zh": "被触发",
                "ru": "Запускается от",
            },
        },
    },
    {
        "key": "aws_rel_backupOf",
        "label": "Backup of",
        "reverse_label": "Backed up by",
        "translations": {
            "label": {
                "de": "Sicherung von",
                "fr": "Sauvegarde de",
                "es": "Copia de seguridad de",
                "it": "Backup di",
                "pt": "Cópia de segurança de",
                "zh": "备份自",
                "ru": "Резервная копия",
            },
            "reverse_label": {
                "de": "Gesichert durch",
                "fr": "Sauvegardé par",
                "es": "Con copia de seguridad por",
                "it": "Sottoposto a backup da",
                "pt": "Com cópia de segurança por",
                "zh": "被备份",
                "ru": "Создана резервная копия",
            },
        },
    },
    {
        "key": "aws_rel_failoverTo",
        "label": "Failover to",
        "reverse_label": "Failover from",
        "translations": {
            "label": {
                "de": "Failover zu",
                "fr": "Basculement vers",
                "es": "Conmutación a",
                "it": "Failover verso",
                "pt": "Failover para",
                "zh": "故障转移到",
                "ru": "Отказоустойчивость к",
            },
            "reverse_label": {
                "de": "Failover von",
                "fr": "Basculement depuis",
                "es": "Conmutación desde",
                "it": "Failover da",
                "pt": "Failover de",
                "zh": "从故障转移",
                "ru": "Отказоустойчивость от",
            },
        },
    },
]


async def seed_aws_metamodel(db: AsyncSession) -> dict:
    """Idempotently seed AWS element and relation types.

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
            category=t.get("category", "AWS"),
            icon=t.get("icon", "cloud"),
            color=t.get("color", "#FF9900"),
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
