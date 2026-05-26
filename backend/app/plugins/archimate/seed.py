"""ArchiMate 3.2 metamodel seed.

Inserts 61 element card types and 11 relation types, all with:
- key prefix: arch_
- category prefix: ArchiMate:
- plugin_id = "archimate"
- built_in = False (admin can disable/delete without touching core metamodel)
- translations for all 8 supported locales

Idempotent: running twice inserts nothing new. Existing core metamodel rows
(plugin_id IS NULL) are never modified.

Credits: element/relation definitions derived from bigArchiMate by borkdominik
(https://github.com/borkdominik/bigArchiMate), MIT License.
"""

from __future__ import annotations

from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card import Card
from app.models.card_type import CardType
from app.models.relation import Relation
from app.models.relation_type import RelationType

PLUGIN_ID = "archimate"

# ---------------------------------------------------------------------------
# Element types (61 total across 8 ArchiMate layers)
# ---------------------------------------------------------------------------

_ELEMENT_TYPES: list[dict] = [
    # ── Business Layer (13) ─────────────────────────────────────────────
    {
        "key": "BusinessActor",
        "label": "Business Actor",
        "category": "Business",
        "icon": "person",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftsakteur",
                "fr": "Acteur métier",
                "es": "Actor de negocio",
                "it": "Attore aziendale",
                "pt": "Ator de negócio",
                "zh": "业务参与者",
                "ru": "Бизнес-актор",
            }
        },
    },
    {
        "key": "BusinessRole",
        "label": "Business Role",
        "category": "Business",
        "icon": "badge",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftsrolle",
                "fr": "Rôle métier",
                "es": "Rol de negocio",
                "it": "Ruolo aziendale",
                "pt": "Papel de negócio",
                "zh": "业务角色",
                "ru": "Бизнес-роль",
            }
        },
    },
    {
        "key": "BusinessCollaboration",
        "label": "Business Collaboration",
        "category": "Business",
        "icon": "group",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftszusammenarbeit",
                "fr": "Collaboration métier",
                "es": "Colaboración de negocio",
                "it": "Collaborazione aziendale",
                "pt": "Colaboração de negócio",
                "zh": "业务协作",
                "ru": "Бизнес-сотрудничество",
            }
        },
    },
    {
        "key": "BusinessInterface",
        "label": "Business Interface",
        "category": "Business",
        "icon": "swap_horiz",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftsschnittstelle",
                "fr": "Interface métier",
                "es": "Interfaz de negocio",
                "it": "Interfaccia aziendale",
                "pt": "Interface de negócio",
                "zh": "业务接口",
                "ru": "Бизнес-интерфейс",
            }
        },
    },
    {
        "key": "BusinessProcess",
        "label": "Business Process",
        "category": "Business",
        "icon": "route",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftsprozess",
                "fr": "Processus métier",
                "es": "Proceso de negocio",
                "it": "Processo aziendale",
                "pt": "Processo de negócio",
                "zh": "业务流程",
                "ru": "Бизнес-процесс",
            }
        },
    },
    {
        "key": "BusinessFunction",
        "label": "Business Function",
        "category": "Business",
        "icon": "functions",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftsfunktion",
                "fr": "Fonction métier",
                "es": "Función de negocio",
                "it": "Funzione aziendale",
                "pt": "Função de negócio",
                "zh": "业务功能",
                "ru": "Бизнес-функция",
            }
        },
    },
    {
        "key": "BusinessInteraction",
        "label": "Business Interaction",
        "category": "Business",
        "icon": "handshake",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftsinteraktion",
                "fr": "Interaction métier",
                "es": "Interacción de negocio",
                "it": "Interazione aziendale",
                "pt": "Interação de negócio",
                "zh": "业务交互",
                "ru": "Бизнес-взаимодействие",
            }
        },
    },
    {
        "key": "BusinessEvent",
        "label": "Business Event",
        "category": "Business",
        "icon": "event",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftsereignis",
                "fr": "Événement métier",
                "es": "Evento de negocio",
                "it": "Evento aziendale",
                "pt": "Evento de negócio",
                "zh": "业务事件",
                "ru": "Бизнес-событие",
            }
        },
    },
    {
        "key": "BusinessService",
        "label": "Business Service",
        "category": "Business",
        "icon": "miscellaneous_services",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftsdienst",
                "fr": "Service métier",
                "es": "Servicio de negocio",
                "it": "Servizio aziendale",
                "pt": "Serviço de negócio",
                "zh": "业务服务",
                "ru": "Бизнес-сервис",
            }
        },
    },
    {
        "key": "BusinessObject",
        "label": "Business Object",
        "category": "Business",
        "icon": "description",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Geschäftsobjekt",
                "fr": "Objet métier",
                "es": "Objeto de negocio",
                "it": "Oggetto aziendale",
                "pt": "Objeto de negócio",
                "zh": "业务对象",
                "ru": "Бизнес-объект",
            }
        },
    },
    {
        "key": "Contract",
        "label": "Contract",
        "category": "Business",
        "icon": "gavel",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Vertrag",
                "fr": "Contrat",
                "es": "Contrato",
                "it": "Contratto",
                "pt": "Contrato",
                "zh": "合同",
                "ru": "Контракт",
            }
        },
    },
    {
        "key": "Representation",
        "label": "Representation",
        "category": "Business",
        "icon": "article",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Darstellung",
                "fr": "Représentation",
                "es": "Representación",
                "it": "Rappresentazione",
                "pt": "Representação",
                "zh": "表示",
                "ru": "Представление",
            }
        },
    },
    {
        "key": "Product",
        "label": "Product",
        "category": "Business",
        "icon": "shopping_bag",
        "color": "#f5e27a",
        "translations": {
            "label": {
                "de": "Produkt",
                "fr": "Produit",
                "es": "Producto",
                "it": "Prodotto",
                "pt": "Produto",
                "zh": "产品",
                "ru": "Продукт",
            }
        },
    },
    # ── Application Layer (9) ───────────────────────────────────────────
    {
        "key": "ApplicationComponent",
        "label": "Application Component",
        "category": "Application",
        "icon": "apps",
        "color": "#b3d9ff",
        "translations": {
            "label": {
                "de": "Anwendungskomponente",
                "fr": "Composant applicatif",
                "es": "Componente de aplicación",
                "it": "Componente applicativo",
                "pt": "Componente de aplicação",
                "zh": "应用组件",
                "ru": "Компонент приложения",
            }
        },
    },
    {
        "key": "ApplicationCollaboration",
        "label": "Application Collaboration",
        "category": "Application",
        "icon": "hub",
        "color": "#b3d9ff",
        "translations": {
            "label": {
                "de": "Anwendungszusammenarbeit",
                "fr": "Collaboration applicative",
                "es": "Colaboración de aplicación",
                "it": "Collaborazione applicativa",
                "pt": "Colaboração de aplicação",
                "zh": "应用协作",
                "ru": "Взаимодействие приложений",
            }
        },
    },
    {
        "key": "ApplicationInterface",
        "label": "Application Interface",
        "category": "Application",
        "icon": "api",
        "color": "#b3d9ff",
        "translations": {
            "label": {
                "de": "Anwendungsschnittstelle",
                "fr": "Interface applicative",
                "es": "Interfaz de aplicación",
                "it": "Interfaccia applicativa",
                "pt": "Interface de aplicação",
                "zh": "应用接口",
                "ru": "Интерфейс приложения",
            }
        },
    },
    {
        "key": "ApplicationProcess",
        "label": "Application Process",
        "category": "Application",
        "icon": "account_tree",
        "color": "#b3d9ff",
        "translations": {
            "label": {
                "de": "Anwendungsprozess",
                "fr": "Processus applicatif",
                "es": "Proceso de aplicación",
                "it": "Processo applicativo",
                "pt": "Processo de aplicação",
                "zh": "应用流程",
                "ru": "Процесс приложения",
            }
        },
    },
    {
        "key": "ApplicationFunction",
        "label": "Application Function",
        "category": "Application",
        "icon": "functions",
        "color": "#b3d9ff",
        "translations": {
            "label": {
                "de": "Anwendungsfunktion",
                "fr": "Fonction applicative",
                "es": "Función de aplicación",
                "it": "Funzione applicativa",
                "pt": "Função de aplicação",
                "zh": "应用功能",
                "ru": "Функция приложения",
            }
        },
    },
    {
        "key": "ApplicationInteraction",
        "label": "Application Interaction",
        "category": "Application",
        "icon": "sync_alt",
        "color": "#b3d9ff",
        "translations": {
            "label": {
                "de": "Anwendungsinteraktion",
                "fr": "Interaction applicative",
                "es": "Interacción de aplicación",
                "it": "Interazione applicativa",
                "pt": "Interação de aplicação",
                "zh": "应用交互",
                "ru": "Взаимодействие приложения",
            }
        },
    },
    {
        "key": "ApplicationEvent",
        "label": "Application Event",
        "category": "Application",
        "icon": "notifications",
        "color": "#b3d9ff",
        "translations": {
            "label": {
                "de": "Anwendungsereignis",
                "fr": "Événement applicatif",
                "es": "Evento de aplicación",
                "it": "Evento applicativo",
                "pt": "Evento de aplicação",
                "zh": "应用事件",
                "ru": "Событие приложения",
            }
        },
    },
    {
        "key": "ApplicationService",
        "label": "Application Service",
        "category": "Application",
        "icon": "miscellaneous_services",
        "color": "#b3d9ff",
        "translations": {
            "label": {
                "de": "Anwendungsdienst",
                "fr": "Service applicatif",
                "es": "Servicio de aplicación",
                "it": "Servizio applicativo",
                "pt": "Serviço de aplicação",
                "zh": "应用服务",
                "ru": "Сервис приложения",
            }
        },
    },
    {
        "key": "DataObject",
        "label": "Data Object",
        "category": "Application",
        "icon": "database",
        "color": "#b3d9ff",
        "translations": {
            "label": {
                "de": "Datenobjekt",
                "fr": "Objet de données",
                "es": "Objeto de datos",
                "it": "Oggetto dati",
                "pt": "Objeto de dados",
                "zh": "数据对象",
                "ru": "Объект данных",
            }
        },
    },
    # ── Technology Layer (13) ───────────────────────────────────────────
    {
        "key": "Node",
        "label": "Node",
        "category": "Technology",
        "icon": "dns",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Knoten",
                "fr": "Nœud",
                "es": "Nodo",
                "it": "Nodo",
                "pt": "Nó",
                "zh": "节点",
                "ru": "Узел",
            }
        },
    },
    {
        "key": "Device",
        "label": "Device",
        "category": "Technology",
        "icon": "devices",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Gerät",
                "fr": "Dispositif",
                "es": "Dispositivo",
                "it": "Dispositivo",
                "pt": "Dispositivo",
                "zh": "设备",
                "ru": "Устройство",
            }
        },
    },
    {
        "key": "SystemSoftware",
        "label": "System Software",
        "category": "Technology",
        "icon": "terminal",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Systemsoftware",
                "fr": "Logiciel système",
                "es": "Software de sistema",
                "it": "Software di sistema",
                "pt": "Software de sistema",
                "zh": "系统软件",
                "ru": "Системное программное обеспечение",
            }
        },
    },
    {
        "key": "TechnologyCollaboration",
        "label": "Technology Collaboration",
        "category": "Technology",
        "icon": "group_work",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Technologiezusammenarbeit",
                "fr": "Collaboration technologique",
                "es": "Colaboración tecnológica",
                "it": "Collaborazione tecnologica",
                "pt": "Colaboração tecnológica",
                "zh": "技术协作",
                "ru": "Технологическое сотрудничество",
            }
        },
    },
    {
        "key": "TechnologyInterface",
        "label": "Technology Interface",
        "category": "Technology",
        "icon": "settings_input_component",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Technologieschnittstelle",
                "fr": "Interface technologique",
                "es": "Interfaz tecnológica",
                "it": "Interfaccia tecnologica",
                "pt": "Interface tecnológica",
                "zh": "技术接口",
                "ru": "Технологический интерфейс",
            }
        },
    },
    {
        "key": "TechnologyProcess",
        "label": "Technology Process",
        "category": "Technology",
        "icon": "settings",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Technologieprozess",
                "fr": "Processus technologique",
                "es": "Proceso tecnológico",
                "it": "Processo tecnologico",
                "pt": "Processo tecnológico",
                "zh": "技术流程",
                "ru": "Технологический процесс",
            }
        },
    },
    {
        "key": "TechnologyFunction",
        "label": "Technology Function",
        "category": "Technology",
        "icon": "build",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Technologiefunktion",
                "fr": "Fonction technologique",
                "es": "Función tecnológica",
                "it": "Funzione tecnologica",
                "pt": "Função tecnológica",
                "zh": "技术功能",
                "ru": "Технологическая функция",
            }
        },
    },
    {
        "key": "TechnologyInteraction",
        "label": "Technology Interaction",
        "category": "Technology",
        "icon": "compare_arrows",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Technologieinteraktion",
                "fr": "Interaction technologique",
                "es": "Interacción tecnológica",
                "it": "Interazione tecnologica",
                "pt": "Interação tecnológica",
                "zh": "技术交互",
                "ru": "Технологическое взаимодействие",
            }
        },
    },
    {
        "key": "TechnologyEvent",
        "label": "Technology Event",
        "category": "Technology",
        "icon": "event_note",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Technologieereignis",
                "fr": "Événement technologique",
                "es": "Evento tecnológico",
                "it": "Evento tecnologico",
                "pt": "Evento tecnológico",
                "zh": "技术事件",
                "ru": "Технологическое событие",
            }
        },
    },
    {
        "key": "TechnologyService",
        "label": "Technology Service",
        "category": "Technology",
        "icon": "cloud",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Technologiedienst",
                "fr": "Service technologique",
                "es": "Servicio tecnológico",
                "it": "Servizio tecnologico",
                "pt": "Serviço tecnológico",
                "zh": "技术服务",
                "ru": "Технологический сервис",
            }
        },
    },
    {
        "key": "Path",
        "label": "Path",
        "category": "Technology",
        "icon": "cable",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Pfad",
                "fr": "Chemin",
                "es": "Ruta",
                "it": "Percorso",
                "pt": "Caminho",
                "zh": "路径",
                "ru": "Путь",
            }
        },
    },
    {
        "key": "CommunicationNetwork",
        "label": "Communication Network",
        "category": "Technology",
        "icon": "lan",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Kommunikationsnetzwerk",
                "fr": "Réseau de communication",
                "es": "Red de comunicación",
                "it": "Rete di comunicazione",
                "pt": "Rede de comunicação",
                "zh": "通信网络",
                "ru": "Сеть связи",
            }
        },
    },
    {
        "key": "Artifact",
        "label": "Artifact",
        "category": "Technology",
        "icon": "inventory_2",
        "color": "#aae6aa",
        "translations": {
            "label": {
                "de": "Artefakt",
                "fr": "Artefact",
                "es": "Artefacto",
                "it": "Artefatto",
                "pt": "Artefato",
                "zh": "工件",
                "ru": "Артефакт",
            }
        },
    },
    # ── Motivation Layer (10) ───────────────────────────────────────────
    {
        "key": "Stakeholder",
        "label": "Stakeholder",
        "category": "Motivation",
        "icon": "groups",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Interessenvertreter",
                "fr": "Partie prenante",
                "es": "Parte interesada",
                "it": "Stakeholder",
                "pt": "Parte interessada",
                "zh": "利益相关者",
                "ru": "Заинтересованная сторона",
            }
        },
    },
    {
        "key": "Driver",
        "label": "Driver",
        "category": "Motivation",
        "icon": "driving_force",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Treiber",
                "fr": "Moteur",
                "es": "Impulsor",
                "it": "Driver",
                "pt": "Motivador",
                "zh": "驱动因素",
                "ru": "Движущая сила",
            }
        },
    },
    {
        "key": "Assessment",
        "label": "Assessment",
        "category": "Motivation",
        "icon": "assessment",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Bewertung",
                "fr": "Évaluation",
                "es": "Evaluación",
                "it": "Valutazione",
                "pt": "Avaliação",
                "zh": "评估",
                "ru": "Оценка",
            }
        },
    },
    {
        "key": "Goal",
        "label": "Goal",
        "category": "Motivation",
        "icon": "flag",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Ziel",
                "fr": "Objectif",
                "es": "Meta",
                "it": "Obiettivo",
                "pt": "Meta",
                "zh": "目标",
                "ru": "Цель",
            }
        },
    },
    {
        "key": "Outcome",
        "label": "Outcome",
        "category": "Motivation",
        "icon": "emoji_events",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Ergebnis",
                "fr": "Résultat",
                "es": "Resultado",
                "it": "Risultato",
                "pt": "Resultado",
                "zh": "成果",
                "ru": "Результат",
            }
        },
    },
    {
        "key": "Principle",
        "label": "Principle",
        "category": "Motivation",
        "icon": "balance",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Prinzip",
                "fr": "Principe",
                "es": "Principio",
                "it": "Principio",
                "pt": "Princípio",
                "zh": "原则",
                "ru": "Принцип",
            }
        },
    },
    {
        "key": "Requirement",
        "label": "Requirement",
        "category": "Motivation",
        "icon": "checklist",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Anforderung",
                "fr": "Exigence",
                "es": "Requisito",
                "it": "Requisito",
                "pt": "Requisito",
                "zh": "需求",
                "ru": "Требование",
            }
        },
    },
    {
        "key": "Constraint",
        "label": "Constraint",
        "category": "Motivation",
        "icon": "block",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Einschränkung",
                "fr": "Contrainte",
                "es": "Restricción",
                "it": "Vincolo",
                "pt": "Restrição",
                "zh": "约束",
                "ru": "Ограничение",
            }
        },
    },
    {
        "key": "Meaning",
        "label": "Meaning",
        "category": "Motivation",
        "icon": "lightbulb",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Bedeutung",
                "fr": "Signification",
                "es": "Significado",
                "it": "Significato",
                "pt": "Significado",
                "zh": "含义",
                "ru": "Смысл",
            }
        },
    },
    {
        "key": "Value",
        "label": "Value",
        "category": "Motivation",
        "icon": "star",
        "color": "#ffcca8",
        "translations": {
            "label": {
                "de": "Wert",
                "fr": "Valeur",
                "es": "Valor",
                "it": "Valore",
                "pt": "Valor",
                "zh": "价值",
                "ru": "Ценность",
            }
        },
    },
    # ── Strategy Layer (4) ──────────────────────────────────────────────
    {
        "key": "Resource",
        "label": "Resource",
        "category": "Strategy",
        "icon": "inventory",
        "color": "#d9b3ff",
        "translations": {
            "label": {
                "de": "Ressource",
                "fr": "Ressource",
                "es": "Recurso",
                "it": "Risorsa",
                "pt": "Recurso",
                "zh": "资源",
                "ru": "Ресурс",
            }
        },
    },
    {
        "key": "Capability",
        "label": "Capability",
        "category": "Strategy",
        "icon": "psychology",
        "color": "#d9b3ff",
        "translations": {
            "label": {
                "de": "Fähigkeit",
                "fr": "Capacité",
                "es": "Capacidad",
                "it": "Capacità",
                "pt": "Capacidade",
                "zh": "能力",
                "ru": "Возможность",
            }
        },
    },
    {
        "key": "ValueStream",
        "label": "Value Stream",
        "category": "Strategy",
        "icon": "waterfall_chart",
        "color": "#d9b3ff",
        "translations": {
            "label": {
                "de": "Wertstrom",
                "fr": "Flux de valeur",
                "es": "Flujo de valor",
                "it": "Flusso di valore",
                "pt": "Fluxo de valor",
                "zh": "价值流",
                "ru": "Поток создания ценности",
            }
        },
    },
    {
        "key": "CourseOfAction",
        "label": "Course of Action",
        "category": "Strategy",
        "icon": "map",
        "color": "#d9b3ff",
        "translations": {
            "label": {
                "de": "Handlungsplan",
                "fr": "Plan d'action",
                "es": "Línea de acción",
                "it": "Piano d'azione",
                "pt": "Linha de ação",
                "zh": "行动方案",
                "ru": "План действий",
            }
        },
    },
    # ── Implementation & Migration Layer (5) ───────────────────────────
    {
        "key": "WorkPackage",
        "label": "Work Package",
        "category": "Implementation",
        "icon": "work",
        "color": "#e0e0e0",
        "translations": {
            "label": {
                "de": "Arbeitspaket",
                "fr": "Paquet de travail",
                "es": "Paquete de trabajo",
                "it": "Pacchetto di lavoro",
                "pt": "Pacote de trabalho",
                "zh": "工作包",
                "ru": "Рабочий пакет",
            }
        },
    },
    {
        "key": "ImplementationEvent",
        "label": "Implementation Event",
        "category": "Implementation",
        "icon": "event_available",
        "color": "#e0e0e0",
        "translations": {
            "label": {
                "de": "Implementierungsereignis",
                "fr": "Événement d'implémentation",
                "es": "Evento de implementación",
                "it": "Evento di implementazione",
                "pt": "Evento de implementação",
                "zh": "实施事件",
                "ru": "Событие реализации",
            }
        },
    },
    {
        "key": "Deliverable",
        "label": "Deliverable",
        "category": "Implementation",
        "icon": "task_alt",
        "color": "#e0e0e0",
        "translations": {
            "label": {
                "de": "Lieferobjekt",
                "fr": "Livrable",
                "es": "Entregable",
                "it": "Deliverable",
                "pt": "Entregável",
                "zh": "可交付成果",
                "ru": "Результат",
            }
        },
    },
    {
        "key": "Gap",
        "label": "Gap",
        "category": "Implementation",
        "icon": "difference",
        "color": "#e0e0e0",
        "translations": {
            "label": {
                "de": "Lücke",
                "fr": "Écart",
                "es": "Brecha",
                "it": "Gap",
                "pt": "Lacuna",
                "zh": "差距",
                "ru": "Разрыв",
            }
        },
    },
    {
        "key": "Plateau",
        "label": "Plateau",
        "category": "Implementation",
        "icon": "landscape",
        "color": "#e0e0e0",
        "translations": {
            "label": {
                "de": "Plateau",
                "fr": "Plateau",
                "es": "Meseta",
                "it": "Plateau",
                "pt": "Patamar",
                "zh": "阶段",
                "ru": "Плато",
            }
        },
    },
    # ── Physical Layer (4) ──────────────────────────────────────────────
    {
        "key": "Equipment",
        "label": "Equipment",
        "category": "Physical",
        "icon": "precision_manufacturing",
        "color": "#c8e6c9",
        "translations": {
            "label": {
                "de": "Ausrüstung",
                "fr": "Équipement",
                "es": "Equipo",
                "it": "Attrezzatura",
                "pt": "Equipamento",
                "zh": "设备",
                "ru": "Оборудование",
            }
        },
    },
    {
        "key": "Facility",
        "label": "Facility",
        "category": "Physical",
        "icon": "warehouse",
        "color": "#c8e6c9",
        "translations": {
            "label": {
                "de": "Einrichtung",
                "fr": "Installation",
                "es": "Instalación",
                "it": "Struttura",
                "pt": "Instalação",
                "zh": "设施",
                "ru": "Объект",
            }
        },
    },
    {
        "key": "DistributionNetwork",
        "label": "Distribution Network",
        "category": "Physical",
        "icon": "share",
        "color": "#c8e6c9",
        "translations": {
            "label": {
                "de": "Verteilungsnetzwerk",
                "fr": "Réseau de distribution",
                "es": "Red de distribución",
                "it": "Rete di distribuzione",
                "pt": "Rede de distribuição",
                "zh": "分发网络",
                "ru": "Распределительная сеть",
            }
        },
    },
    {
        "key": "Material",
        "label": "Material",
        "category": "Physical",
        "icon": "category",
        "color": "#c8e6c9",
        "translations": {
            "label": {
                "de": "Material",
                "fr": "Matériau",
                "es": "Material",
                "it": "Materiale",
                "pt": "Material",
                "zh": "材料",
                "ru": "Материал",
            }
        },
    },
    # ── Composite Layer (3) ─────────────────────────────────────────────
    {
        "key": "Grouping",
        "label": "Grouping",
        "category": "Composite",
        "icon": "folder_open",
        "color": "#ffffff",
        "translations": {
            "label": {
                "de": "Gruppierung",
                "fr": "Regroupement",
                "es": "Agrupación",
                "it": "Raggruppamento",
                "pt": "Agrupamento",
                "zh": "分组",
                "ru": "Группировка",
            }
        },
    },
    {
        "key": "Location",
        "label": "Location",
        "category": "Composite",
        "icon": "place",
        "color": "#ffffff",
        "translations": {
            "label": {
                "de": "Standort",
                "fr": "Emplacement",
                "es": "Ubicación",
                "it": "Posizione",
                "pt": "Localização",
                "zh": "位置",
                "ru": "Местоположение",
            }
        },
    },
    {
        "key": "Junction",
        "label": "Junction",
        "category": "Composite",
        "icon": "merge_type",
        "color": "#ffffff",
        "translations": {
            "label": {
                "de": "Verknüpfung",
                "fr": "Jonction",
                "es": "Unión",
                "it": "Giunzione",
                "pt": "Junção",
                "zh": "连接",
                "ru": "Соединение",
            }
        },
    },
]

# ---------------------------------------------------------------------------
# Relation types (11 total)
# ---------------------------------------------------------------------------

_RELATION_TYPES: list[dict] = [
    {
        "key": "Association",
        "label": "Association",
        "reverse_label": "Associated with",
        "source_type_key": "BusinessActor",
        "target_type_key": "BusinessActor",
        "translations": {
            "label": {
                "de": "Assoziation",
                "fr": "Association",
                "es": "Asociación",
                "it": "Associazione",
                "pt": "Associação",
                "zh": "关联",
                "ru": "Ассоциация",
            }
        },
    },
    {
        "key": "Composition",
        "label": "Composition",
        "reverse_label": "Composed by",
        "source_type_key": "BusinessActor",
        "target_type_key": "BusinessActor",
        "translations": {
            "label": {
                "de": "Komposition",
                "fr": "Composition",
                "es": "Composición",
                "it": "Composizione",
                "pt": "Composição",
                "zh": "组合",
                "ru": "Композиция",
            }
        },
    },
    {
        "key": "Aggregation",
        "label": "Aggregation",
        "reverse_label": "Aggregated by",
        "source_type_key": "BusinessActor",
        "target_type_key": "BusinessActor",
        "translations": {
            "label": {
                "de": "Aggregation",
                "fr": "Agrégation",
                "es": "Agregación",
                "it": "Aggregazione",
                "pt": "Agregação",
                "zh": "聚合",
                "ru": "Агрегация",
            }
        },
    },
    {
        "key": "Realization",
        "label": "Realization",
        "reverse_label": "Realized by",
        "source_type_key": "ApplicationComponent",
        "target_type_key": "ApplicationService",
        "translations": {
            "label": {
                "de": "Realisierung",
                "fr": "Réalisation",
                "es": "Realización",
                "it": "Realizzazione",
                "pt": "Realização",
                "zh": "实现",
                "ru": "Реализация",
            }
        },
    },
    {
        "key": "Assignment",
        "label": "Assignment",
        "reverse_label": "Assigned to",
        "source_type_key": "BusinessRole",
        "target_type_key": "BusinessProcess",
        "translations": {
            "label": {
                "de": "Zuweisung",
                "fr": "Affectation",
                "es": "Asignación",
                "it": "Assegnazione",
                "pt": "Atribuição",
                "zh": "分配",
                "ru": "Назначение",
            }
        },
    },
    {
        "key": "Serving",
        "label": "Serving",
        "reverse_label": "Served by",
        "source_type_key": "ApplicationComponent",
        "target_type_key": "BusinessProcess",
        "translations": {
            "label": {
                "de": "Bedienung",
                "fr": "Service rendu",
                "es": "Servicio",
                "it": "Servizio",
                "pt": "Serviço prestado",
                "zh": "服务",
                "ru": "Обслуживание",
            }
        },
    },
    {
        "key": "Access",
        "label": "Access",
        "reverse_label": "Accessed by",
        "source_type_key": "ApplicationComponent",
        "target_type_key": "DataObject",
        "translations": {
            "label": {
                "de": "Zugriff",
                "fr": "Accès",
                "es": "Acceso",
                "it": "Accesso",
                "pt": "Acesso",
                "zh": "访问",
                "ru": "Доступ",
            }
        },
    },
    {
        "key": "Influence",
        "label": "Influence",
        "reverse_label": "Influenced by",
        "source_type_key": "Stakeholder",
        "target_type_key": "Goal",
        "translations": {
            "label": {
                "de": "Einfluss",
                "fr": "Influence",
                "es": "Influencia",
                "it": "Influenza",
                "pt": "Influência",
                "zh": "影响",
                "ru": "Влияние",
            }
        },
    },
    {
        "key": "Triggering",
        "label": "Triggering",
        "reverse_label": "Triggered by",
        "source_type_key": "BusinessEvent",
        "target_type_key": "BusinessProcess",
        "translations": {
            "label": {
                "de": "Auslösung",
                "fr": "Déclenchement",
                "es": "Activación",
                "it": "Attivazione",
                "pt": "Acionamento",
                "zh": "触发",
                "ru": "Инициирование",
            }
        },
    },
    {
        "key": "Flow",
        "label": "Flow",
        "reverse_label": "Flows to",
        "source_type_key": "BusinessProcess",
        "target_type_key": "BusinessProcess",
        "translations": {
            "label": {
                "de": "Fluss",
                "fr": "Flux",
                "es": "Flujo",
                "it": "Flusso",
                "pt": "Fluxo",
                "zh": "流转",
                "ru": "Поток",
            }
        },
    },
    {
        "key": "Specialization",
        "label": "Specialization",
        "reverse_label": "Generalized by",
        "source_type_key": "BusinessActor",
        "target_type_key": "BusinessActor",
        "translations": {
            "label": {
                "de": "Spezialisierung",
                "fr": "Spécialisation",
                "es": "Especialización",
                "it": "Specializzazione",
                "pt": "Especialização",
                "zh": "特化",
                "ru": "Специализация",
            }
        },
    },
]


async def seed_archimate_metamodel(db: AsyncSession) -> dict:
    """Seed all ArchiMate 3.2 card types and relation types.

    Before inserting, any non-ArchiMate card types whose key collides with an
    ArchiMate key are removed together with every card and relation that
    references them.  This ensures the seed can always insert cleanly.
    Idempotent: if ArchiMate rows already exist they are left untouched.
    """
    arch_ct_keys = {t["key"] for t in _ELEMENT_TYPES}
    arch_rt_keys = {r["key"] for r in _RELATION_TYPES}

    # ── 1. Remove conflicting non-ArchiMate card types ─────────────────────
    conflict_ct_result = await db.execute(
        select(CardType).where(
            CardType.key.in_(arch_ct_keys),
            or_(CardType.plugin_id.is_(None), CardType.plugin_id != PLUGIN_ID),
        )
    )
    for ct in conflict_ct_result.scalars().all():
        card_ids_result = await db.execute(select(Card.id).where(Card.type == ct.key))
        card_ids = [row[0] for row in card_ids_result.all()]
        if card_ids:
            await db.execute(
                delete(Relation).where(
                    or_(
                        Relation.source_id.in_(card_ids),
                        Relation.target_id.in_(card_ids),
                    )
                )
            )
            await db.execute(delete(Card).where(Card.id.in_(card_ids)))
        await db.delete(ct)

    # ── 2. Remove conflicting non-ArchiMate relation types ─────────────────
    conflict_rt_result = await db.execute(
        select(RelationType).where(
            RelationType.key.in_(arch_rt_keys),
            or_(RelationType.plugin_id.is_(None), RelationType.plugin_id != PLUGIN_ID),
        )
    )
    for rt in conflict_rt_result.scalars().all():
        await db.delete(rt)

    await db.flush()

    # ── 3. Insert ArchiMate card types (skip already-seeded ones) ───────────
    existing_ct_result = await db.execute(
        select(CardType.key).where(CardType.plugin_id == PLUGIN_ID)
    )
    existing_ct_keys = {row[0] for row in existing_ct_result.all()}

    for t in _ELEMENT_TYPES:
        if t["key"] in existing_ct_keys:
            continue
        db.add(
            CardType(
                key=t["key"],
                label=t["label"],
                category=t["category"],
                icon=t.get("icon", "category"),
                color=t.get("color", "#1976d2"),
                plugin_id=PLUGIN_ID,
                built_in=False,
                is_hidden=False,
                has_hierarchy=False,
                sort_order=0,
                fields_schema=[],
                subtypes=[],
                translations={"label": t["translations"]["label"]},
            )
        )

    # ── 4. Insert ArchiMate relation types (skip already-seeded ones) ───────
    existing_rt_result = await db.execute(
        select(RelationType.key).where(RelationType.plugin_id == PLUGIN_ID)
    )
    existing_rt_keys = {row[0] for row in existing_rt_result.all()}

    for r in _RELATION_TYPES:
        if r["key"] in existing_rt_keys:
            continue
        db.add(
            RelationType(
                key=r["key"],
                label=r["label"],
                reverse_label=r.get("reverse_label"),
                source_type_key=r["source_type_key"],
                target_type_key=r["target_type_key"],
                plugin_id=PLUGIN_ID,
                built_in=False,
                is_hidden=False,
                cardinality="n:m",
                translations={"label": r["translations"]["label"]},
            )
        )

    await db.flush()
    return {"card_types": len(_ELEMENT_TYPES), "relation_types": len(_RELATION_TYPES)}
