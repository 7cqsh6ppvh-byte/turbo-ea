"""UML 2.5 metamodel seed.

Inserts 59 element card types and 31 relation types, all with:
- key prefix: uml_
- category prefix: UML:
- plugin_id = "uml"
- built_in = False (admin can disable/delete without touching core metamodel)
- translations for all 8 supported locales

Idempotent: running twice inserts nothing new. Existing core metamodel rows
(plugin_id IS NULL) are never modified.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card_type import CardType
from app.models.relation_type import RelationType

PLUGIN_ID = "uml"

# ---------------------------------------------------------------------------
# Element types (60 total across 7 UML categories)
# ---------------------------------------------------------------------------

_ELEMENT_TYPES: list[dict] = [
    # ── UML:Class — Structural (7) ─────────────────────────────────────────
    {
        "key": "uml_Class",
        "label": "Class",
        "category": "UML:Class",
        "icon": "view_in_ar",
        "color": "#dbeafe",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Klasse",
                "fr": "Classe",
                "es": "Clase",
                "it": "Classe",
                "pt": "Classe",
                "zh": "类",
                "ru": "Класс",
            }
        },
    },
    {
        "key": "uml_AbstractClass",
        "label": "Abstract Class",
        "category": "UML:Class",
        "icon": "view_in_ar",
        "color": "#dbeafe",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Abstrakte Klasse",
                "fr": "Classe abstraite",
                "es": "Clase abstracta",
                "it": "Classe astratta",
                "pt": "Classe abstrata",
                "zh": "抽象类",
                "ru": "Абстрактный класс",
            }
        },
    },
    {
        "key": "uml_Interface",
        "label": "Interface",
        "category": "UML:Class",
        "icon": "api",
        "color": "#ede9fe",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Schnittstelle",
                "fr": "Interface",
                "es": "Interfaz",
                "it": "Interfaccia",
                "pt": "Interface",
                "zh": "接口",
                "ru": "Интерфейс",
            }
        },
    },
    {
        "key": "uml_DataType",
        "label": "Data Type",
        "category": "UML:Class",
        "icon": "data_object",
        "color": "#dbeafe",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Datentyp",
                "fr": "Type de données",
                "es": "Tipo de datos",
                "it": "Tipo di dati",
                "pt": "Tipo de dados",
                "zh": "数据类型",
                "ru": "Тип данных",
            }
        },
    },
    {
        "key": "uml_Enumeration",
        "label": "Enumeration",
        "category": "UML:Class",
        "icon": "list",
        "color": "#dbeafe",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Aufzählung",
                "fr": "Énumération",
                "es": "Enumeración",
                "it": "Enumerazione",
                "pt": "Enumeração",
                "zh": "枚举",
                "ru": "Перечисление",
            }
        },
    },
    {
        "key": "uml_PrimitiveType",
        "label": "Primitive Type",
        "category": "UML:Class",
        "icon": "code",
        "color": "#dbeafe",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Primitiver Typ",
                "fr": "Type primitif",
                "es": "Tipo primitivo",
                "it": "Tipo primitivo",
                "pt": "Tipo primitivo",
                "zh": "基本类型",
                "ru": "Примитивный тип",
            }
        },
    },
    {
        "key": "uml_Signal",
        "label": "Signal",
        "category": "UML:Class",
        "icon": "notifications_active",
        "color": "#dbeafe",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Signal",
                "fr": "Signal",
                "es": "Señal",
                "it": "Segnale",
                "pt": "Sinal",
                "zh": "信号",
                "ru": "Сигнал",
            }
        },
    },
    # ── UML:Component — Component/Deployment (9) ───────────────────────────
    {
        "key": "uml_Component",
        "label": "Component",
        "category": "UML:Component",
        "icon": "widgets",
        "color": "#dcfce7",
        "has_hierarchy": True,
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
        "key": "uml_Port",
        "label": "Port",
        "category": "UML:Component",
        "icon": "settings_input_component",
        "color": "#dcfce7",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Port",
                "fr": "Port",
                "es": "Puerto",
                "it": "Porta",
                "pt": "Porta",
                "zh": "端口",
                "ru": "Порт",
            }
        },
    },
    {
        "key": "uml_ProvidedInterface",
        "label": "Provided Interface",
        "category": "UML:Component",
        "icon": "radio_button_checked",
        "color": "#dcfce7",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Bereitgestellte Schnittstelle",
                "fr": "Interface fournie",
                "es": "Interfaz proporcionada",
                "it": "Interfaccia fornita",
                "pt": "Interface fornecida",
                "zh": "提供接口",
                "ru": "Предоставляемый интерфейс",
            }
        },
    },
    {
        "key": "uml_RequiredInterface",
        "label": "Required Interface",
        "category": "UML:Component",
        "icon": "radio_button_unchecked",
        "color": "#dcfce7",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Benötigte Schnittstelle",
                "fr": "Interface requise",
                "es": "Interfaz requerida",
                "it": "Interfaccia richiesta",
                "pt": "Interface requerida",
                "zh": "需求接口",
                "ru": "Требуемый интерфейс",
            }
        },
    },
    {
        "key": "uml_Artifact",
        "label": "Artifact",
        "category": "UML:Component",
        "icon": "description",
        "color": "#dcfce7",
        "has_hierarchy": False,
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
    {
        "key": "uml_Node",
        "label": "Node",
        "category": "UML:Component",
        "icon": "dns",
        "color": "#dcfce7",
        "has_hierarchy": True,
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
        "key": "uml_Device",
        "label": "Device",
        "category": "UML:Component",
        "icon": "devices",
        "color": "#dcfce7",
        "has_hierarchy": True,
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
        "key": "uml_ExecutionEnvironment",
        "label": "Execution Environment",
        "category": "UML:Component",
        "icon": "terminal",
        "color": "#dcfce7",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Ausführungsumgebung",
                "fr": "Environnement d'exécution",
                "es": "Entorno de ejecución",
                "it": "Ambiente di esecuzione",
                "pt": "Ambiente de execução",
                "zh": "执行环境",
                "ru": "Среда выполнения",
            }
        },
    },
    {
        "key": "uml_DeploymentSpec",
        "label": "Deployment Specification",
        "category": "UML:Component",
        "icon": "settings",
        "color": "#dcfce7",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Deployment-Spezifikation",
                "fr": "Spécification de déploiement",
                "es": "Especificación de despliegue",
                "it": "Specifica di distribuzione",
                "pt": "Especificação de implantação",
                "zh": "部署规范",
                "ru": "Спецификация развёртывания",
            }
        },
    },
    # ── UML:Package — Packages (5) ─────────────────────────────────────────
    {
        "key": "uml_Package",
        "label": "Package",
        "category": "UML:Package",
        "icon": "folder_open",
        "color": "#fef9c3",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Paket",
                "fr": "Paquetage",
                "es": "Paquete",
                "it": "Pacchetto",
                "pt": "Pacote",
                "zh": "包",
                "ru": "Пакет",
            }
        },
    },
    {
        "key": "uml_Model",
        "label": "Model",
        "category": "UML:Package",
        "icon": "schema",
        "color": "#fef9c3",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Modell",
                "fr": "Modèle",
                "es": "Modelo",
                "it": "Modello",
                "pt": "Modelo",
                "zh": "模型",
                "ru": "Модель",
            }
        },
    },
    {
        "key": "uml_Profile",
        "label": "Profile",
        "category": "UML:Package",
        "icon": "tune",
        "color": "#fef9c3",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Profil",
                "fr": "Profil",
                "es": "Perfil",
                "it": "Profilo",
                "pt": "Perfil",
                "zh": "配置文件",
                "ru": "Профиль",
            }
        },
    },
    {
        "key": "uml_Stereotype",
        "label": "Stereotype",
        "category": "UML:Package",
        "icon": "label",
        "color": "#fef9c3",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Stereotyp",
                "fr": "Stéréotype",
                "es": "Estereotipo",
                "it": "Stereotipo",
                "pt": "Estereótipo",
                "zh": "构造型",
                "ru": "Стереотип",
            }
        },
    },
    {
        "key": "uml_Namespace",
        "label": "Namespace",
        "category": "UML:Package",
        "icon": "space_dashboard",
        "color": "#fef9c3",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Namensraum",
                "fr": "Espace de noms",
                "es": "Espacio de nombres",
                "it": "Spazio dei nomi",
                "pt": "Espaço de nomes",
                "zh": "命名空间",
                "ru": "Пространство имён",
            }
        },
    },
    # ── UML:UseCase — Use Case (3) ─────────────────────────────────────────
    {
        "key": "uml_Actor",
        "label": "Actor",
        "category": "UML:UseCase",
        "icon": "person",
        "color": "#fce7f3",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Akteur",
                "fr": "Acteur",
                "es": "Actor",
                "it": "Attore",
                "pt": "Ator",
                "zh": "参与者",
                "ru": "Актор",
            }
        },
    },
    {
        "key": "uml_UseCase",
        "label": "Use Case",
        "category": "UML:UseCase",
        "icon": "circle",
        "color": "#fce7f3",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Anwendungsfall",
                "fr": "Cas d'utilisation",
                "es": "Caso de uso",
                "it": "Caso d'uso",
                "pt": "Caso de uso",
                "zh": "用例",
                "ru": "Вариант использования",
            }
        },
    },
    {
        "key": "uml_Subject",
        "label": "Subject",
        "category": "UML:UseCase",
        "icon": "crop_free",
        "color": "#fce7f3",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Subjekt",
                "fr": "Sujet",
                "es": "Sujeto",
                "it": "Soggetto",
                "pt": "Sujeito",
                "zh": "主题",
                "ru": "Субъект",
            }
        },
    },
    # ── UML:Activity — Activity Diagrams (14) ──────────────────────────────
    {
        "key": "uml_Activity",
        "label": "Activity",
        "category": "UML:Activity",
        "icon": "account_tree",
        "color": "#fff7ed",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Aktivität",
                "fr": "Activité",
                "es": "Actividad",
                "it": "Attività",
                "pt": "Atividade",
                "zh": "活动",
                "ru": "Деятельность",
            }
        },
    },
    {
        "key": "uml_Action",
        "label": "Action",
        "category": "UML:Activity",
        "icon": "play_arrow",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Aktion",
                "fr": "Action",
                "es": "Acción",
                "it": "Azione",
                "pt": "Ação",
                "zh": "动作",
                "ru": "Действие",
            }
        },
    },
    {
        "key": "uml_CallBehaviorAction",
        "label": "Call Behavior Action",
        "category": "UML:Activity",
        "icon": "call_to_action",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Verhaltensaufruf-Aktion",
                "fr": "Action d'appel de comportement",
                "es": "Acción de llamada de comportamiento",
                "it": "Azione di chiamata comportamento",
                "pt": "Ação de chamada de comportamento",
                "zh": "调用行为动作",
                "ru": "Действие вызова поведения",
            }
        },
    },
    {
        "key": "uml_SendSignalAction",
        "label": "Send Signal Action",
        "category": "UML:Activity",
        "icon": "send",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Signal-Sende-Aktion",
                "fr": "Action d'envoi de signal",
                "es": "Acción de envío de señal",
                "it": "Azione di invio segnale",
                "pt": "Ação de envio de sinal",
                "zh": "发送信号动作",
                "ru": "Действие отправки сигнала",
            }
        },
    },
    {
        "key": "uml_AcceptEventAction",
        "label": "Accept Event Action",
        "category": "UML:Activity",
        "icon": "inbox",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Ereignisannahme-Aktion",
                "fr": "Action d'acceptation d'événement",
                "es": "Acción de aceptación de evento",
                "it": "Azione di accettazione evento",
                "pt": "Ação de aceitação de evento",
                "zh": "接受事件动作",
                "ru": "Действие принятия события",
            }
        },
    },
    {
        "key": "uml_InitialNode",
        "label": "Initial Node",
        "category": "UML:Activity",
        "icon": "fiber_manual_record",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Startknoten",
                "fr": "Nœud initial",
                "es": "Nodo inicial",
                "it": "Nodo iniziale",
                "pt": "Nó inicial",
                "zh": "初始节点",
                "ru": "Начальный узел",
            }
        },
    },
    {
        "key": "uml_ActivityFinalNode",
        "label": "Activity Final Node",
        "category": "UML:Activity",
        "icon": "stop_circle",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Aktivitäts-Endknoten",
                "fr": "Nœud final d'activité",
                "es": "Nodo final de actividad",
                "it": "Nodo finale attività",
                "pt": "Nó final de atividade",
                "zh": "活动终止节点",
                "ru": "Конечный узел деятельности",
            }
        },
    },
    {
        "key": "uml_FlowFinalNode",
        "label": "Flow Final Node",
        "category": "UML:Activity",
        "icon": "cancel",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Fluss-Endknoten",
                "fr": "Nœud final de flux",
                "es": "Nodo final de flujo",
                "it": "Nodo finale del flusso",
                "pt": "Nó final de fluxo",
                "zh": "流终止节点",
                "ru": "Конечный узел потока",
            }
        },
    },
    {
        "key": "uml_DecisionNode",
        "label": "Decision Node",
        "category": "UML:Activity",
        "icon": "change_history",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Entscheidungsknoten",
                "fr": "Nœud de décision",
                "es": "Nodo de decisión",
                "it": "Nodo di decisione",
                "pt": "Nó de decisão",
                "zh": "决策节点",
                "ru": "Узел решения",
            }
        },
    },
    {
        "key": "uml_ForkJoinNode",
        "label": "Fork / Join Node",
        "category": "UML:Activity",
        "icon": "drag_handle",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Verzweigung / Zusammenführung",
                "fr": "Nœud de fork / join",
                "es": "Nodo de bifurcación / unión",
                "it": "Nodo fork / join",
                "pt": "Nó de bifurcação / junção",
                "zh": "分叉/合并节点",
                "ru": "Узел ветвления / слияния",
            }
        },
    },
    {
        "key": "uml_ActivityPartition",
        "label": "Activity Partition",
        "category": "UML:Activity",
        "icon": "view_column",
        "color": "#fff7ed",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Aktivitätsbereich",
                "fr": "Partition d'activité",
                "es": "Partición de actividad",
                "it": "Partizione di attività",
                "pt": "Partição de atividade",
                "zh": "活动分区",
                "ru": "Раздел деятельности",
            }
        },
    },
    {
        "key": "uml_ObjectNode",
        "label": "Object Node",
        "category": "UML:Activity",
        "icon": "data_object",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Objektknoten",
                "fr": "Nœud objet",
                "es": "Nodo de objeto",
                "it": "Nodo oggetto",
                "pt": "Nó de objeto",
                "zh": "对象节点",
                "ru": "Объектный узел",
            }
        },
    },
    {
        "key": "uml_CentralBuffer",
        "label": "Central Buffer Node",
        "category": "UML:Activity",
        "icon": "storage",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Zentraler Pufferknoten",
                "fr": "Nœud tampon central",
                "es": "Nodo de búfer central",
                "it": "Nodo buffer centrale",
                "pt": "Nó de buffer central",
                "zh": "中央缓冲节点",
                "ru": "Центральный буферный узел",
            }
        },
    },
    {
        "key": "uml_DataStoreNode",
        "label": "Data Store Node",
        "category": "UML:Activity",
        "icon": "database",
        "color": "#fff7ed",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Datenspeicherknoten",
                "fr": "Nœud de magasin de données",
                "es": "Nodo de almacén de datos",
                "it": "Nodo archivio dati",
                "pt": "Nó de armazenamento de dados",
                "zh": "数据存储节点",
                "ru": "Узел хранилища данных",
            }
        },
    },
    # ── UML:StateMachine — State Machines (13) ────────────────────────────
    {
        "key": "uml_State",
        "label": "State",
        "category": "UML:StateMachine",
        "icon": "crop_square",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Zustand",
                "fr": "État",
                "es": "Estado",
                "it": "Stato",
                "pt": "Estado",
                "zh": "状态",
                "ru": "Состояние",
            }
        },
    },
    {
        "key": "uml_CompositeState",
        "label": "Composite State",
        "category": "UML:StateMachine",
        "icon": "web",
        "color": "#f3e8ff",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Zusammengesetzter Zustand",
                "fr": "État composite",
                "es": "Estado compuesto",
                "it": "Stato composito",
                "pt": "Estado composto",
                "zh": "复合状态",
                "ru": "Составное состояние",
            }
        },
    },
    {
        "key": "uml_SubmachineState",
        "label": "Submachine State",
        "category": "UML:StateMachine",
        "icon": "grid_view",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Untermaschinen-Zustand",
                "fr": "État sous-machine",
                "es": "Estado de submáquina",
                "it": "Stato sottomacchina",
                "pt": "Estado de submáquina",
                "zh": "子状态机状态",
                "ru": "Состояние подавтомата",
            }
        },
    },
    {
        "key": "uml_PseudostateInitial",
        "label": "Initial Pseudostate",
        "category": "UML:StateMachine",
        "icon": "fiber_manual_record",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Anfangs-Pseudozustand",
                "fr": "Pseudo-état initial",
                "es": "Pseudoestado inicial",
                "it": "Pseudostato iniziale",
                "pt": "Pseudoestado inicial",
                "zh": "初始伪状态",
                "ru": "Начальный псевдосостояние",
            }
        },
    },
    {
        "key": "uml_PseudostateFinal",
        "label": "Final State",
        "category": "UML:StateMachine",
        "icon": "stop_circle",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Endzustand",
                "fr": "État final",
                "es": "Estado final",
                "it": "Stato finale",
                "pt": "Estado final",
                "zh": "终止状态",
                "ru": "Конечное состояние",
            }
        },
    },
    {
        "key": "uml_PseudostateChoice",
        "label": "Choice",
        "category": "UML:StateMachine",
        "icon": "change_history",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Auswahl",
                "fr": "Choix",
                "es": "Elección",
                "it": "Scelta",
                "pt": "Escolha",
                "zh": "选择",
                "ru": "Выбор",
            }
        },
    },
    {
        "key": "uml_PseudostateJunction",
        "label": "Junction",
        "category": "UML:StateMachine",
        "icon": "merge",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Verbindung",
                "fr": "Jonction",
                "es": "Unión",
                "it": "Giunzione",
                "pt": "Junção",
                "zh": "汇合",
                "ru": "Соединение",
            }
        },
    },
    {
        "key": "uml_PseudostateFork",
        "label": "Fork",
        "category": "UML:StateMachine",
        "icon": "drag_handle",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Verzweigung",
                "fr": "Fourche",
                "es": "Bifurcación",
                "it": "Fork",
                "pt": "Bifurcação",
                "zh": "分叉",
                "ru": "Разветвление",
            }
        },
    },
    {
        "key": "uml_PseudostateJoin",
        "label": "Join",
        "category": "UML:StateMachine",
        "icon": "drag_handle",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Zusammenführung",
                "fr": "Fusion",
                "es": "Unión",
                "it": "Join",
                "pt": "Junção",
                "zh": "合并",
                "ru": "Слияние",
            }
        },
    },
    {
        "key": "uml_PseudostateShallowHistory",
        "label": "Shallow History",
        "category": "UML:StateMachine",
        "icon": "history",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Flache Historie",
                "fr": "Historique superficiel",
                "es": "Historial superficial",
                "it": "Storia superficiale",
                "pt": "Histórico superficial",
                "zh": "浅历史",
                "ru": "Неглубокая история",
            }
        },
    },
    {
        "key": "uml_PseudostateDeepHistory",
        "label": "Deep History",
        "category": "UML:StateMachine",
        "icon": "history_edu",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Tiefe Historie",
                "fr": "Historique profond",
                "es": "Historial profundo",
                "it": "Storia profonda",
                "pt": "Histórico profundo",
                "zh": "深历史",
                "ru": "Глубокая история",
            }
        },
    },
    {
        "key": "uml_PseudostateEntryPoint",
        "label": "Entry Point",
        "category": "UML:StateMachine",
        "icon": "login",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Einstiegspunkt",
                "fr": "Point d'entrée",
                "es": "Punto de entrada",
                "it": "Punto di ingresso",
                "pt": "Ponto de entrada",
                "zh": "入口点",
                "ru": "Точка входа",
            }
        },
    },
    {
        "key": "uml_PseudostateExitPoint",
        "label": "Exit Point",
        "category": "UML:StateMachine",
        "icon": "logout",
        "color": "#f3e8ff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Austrittspunkt",
                "fr": "Point de sortie",
                "es": "Punto de salida",
                "it": "Punto di uscita",
                "pt": "Ponto de saída",
                "zh": "出口点",
                "ru": "Точка выхода",
            }
        },
    },
    # ── UML:Sequence — Sequence Diagrams (4) ───────────────────────────────
    {
        "key": "uml_Lifeline",
        "label": "Lifeline",
        "category": "UML:Sequence",
        "icon": "vertical_align_top",
        "color": "#ecfeff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Lebenslinie",
                "fr": "Ligne de vie",
                "es": "Línea de vida",
                "it": "Linea di vita",
                "pt": "Linha de vida",
                "zh": "生命线",
                "ru": "Линия жизни",
            }
        },
    },
    {
        "key": "uml_CombinedFragment",
        "label": "Combined Fragment",
        "category": "UML:Sequence",
        "icon": "braces",
        "color": "#ecfeff",
        "has_hierarchy": True,
        "translations": {
            "label": {
                "de": "Kombiniertes Fragment",
                "fr": "Fragment combiné",
                "es": "Fragmento combinado",
                "it": "Frammento combinato",
                "pt": "Fragmento combinado",
                "zh": "组合片段",
                "ru": "Составной фрагмент",
            }
        },
    },
    {
        "key": "uml_InteractionOperand",
        "label": "Interaction Operand",
        "category": "UML:Sequence",
        "icon": "splitscreen",
        "color": "#ecfeff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Interaktionsoperand",
                "fr": "Opérande d'interaction",
                "es": "Operando de interacción",
                "it": "Operando di interazione",
                "pt": "Operando de interação",
                "zh": "交互操作数",
                "ru": "Операнд взаимодействия",
            }
        },
    },
    {
        "key": "uml_ExecutionSpecification",
        "label": "Execution Specification",
        "category": "UML:Sequence",
        "icon": "play_arrow",
        "color": "#ecfeff",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Ausführungsspezifikation",
                "fr": "Spécification d'exécution",
                "es": "Especificación de ejecución",
                "it": "Specifica di esecuzione",
                "pt": "Especificação de execução",
                "zh": "执行规范",
                "ru": "Спецификация выполнения",
            }
        },
    },
    # ── UML:Common — Cross-diagram (4) ─────────────────────────────────────
    {
        "key": "uml_Note",
        "label": "Note",
        "category": "UML:Common",
        "icon": "sticky_note_2",
        "color": "#fef3c7",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Notiz",
                "fr": "Note",
                "es": "Nota",
                "it": "Nota",
                "pt": "Nota",
                "zh": "注释",
                "ru": "Примечание",
            }
        },
    },
    {
        "key": "uml_Constraint",
        "label": "Constraint",
        "category": "UML:Common",
        "icon": "lock",
        "color": "#fef3c7",
        "has_hierarchy": False,
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
        "key": "uml_Frame",
        "label": "Diagram Frame",
        "category": "UML:Common",
        "icon": "crop_free",
        "color": "#fef3c7",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Diagrammrahmen",
                "fr": "Cadre de diagramme",
                "es": "Marco de diagrama",
                "it": "Cornice del diagramma",
                "pt": "Quadro de diagrama",
                "zh": "图框",
                "ru": "Рамка диаграммы",
            }
        },
    },
    {
        "key": "uml_Object",
        "label": "Object",
        "category": "UML:Common",
        "icon": "data_object",
        "color": "#dbeafe",
        "has_hierarchy": False,
        "translations": {
            "label": {
                "de": "Objekt",
                "fr": "Objet",
                "es": "Objeto",
                "it": "Oggetto",
                "pt": "Objeto",
                "zh": "对象",
                "ru": "Объект",
            }
        },
    },
]

# ---------------------------------------------------------------------------
# Relation types (31 total)
# ---------------------------------------------------------------------------

_RELATION_TYPES: list[dict] = [
    {
        "key": "uml_rel_Association",
        "label": "Association",
        "reverse_label": "Associated with",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Class",
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
        "key": "uml_rel_DirectedAssociation",
        "label": "Directed Association",
        "reverse_label": "Directed from",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Class",
        "translations": {
            "label": {
                "de": "Gerichtete Assoziation",
                "fr": "Association dirigée",
                "es": "Asociación dirigida",
                "it": "Associazione diretta",
                "pt": "Associação dirigida",
                "zh": "有向关联",
                "ru": "Направленная ассоциация",
            }
        },
    },
    {
        "key": "uml_rel_Aggregation",
        "label": "Aggregation",
        "reverse_label": "Part of",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Class",
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
        "key": "uml_rel_Composition",
        "label": "Composition",
        "reverse_label": "Composed in",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Class",
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
        "key": "uml_rel_Dependency",
        "label": "Dependency",
        "reverse_label": "Depended on by",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Class",
        "translations": {
            "label": {
                "de": "Abhängigkeit",
                "fr": "Dépendance",
                "es": "Dependencia",
                "it": "Dipendenza",
                "pt": "Dependência",
                "zh": "依赖",
                "ru": "Зависимость",
            }
        },
    },
    {
        "key": "uml_rel_Generalization",
        "label": "Generalization",
        "reverse_label": "Generalized by",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Class",
        "translations": {
            "label": {
                "de": "Generalisierung",
                "fr": "Généralisation",
                "es": "Generalización",
                "it": "Generalizzazione",
                "pt": "Generalização",
                "zh": "泛化",
                "ru": "Обобщение",
            }
        },
    },
    {
        "key": "uml_rel_Realization",
        "label": "Realization",
        "reverse_label": "Realized by",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Interface",
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
        "key": "uml_rel_Usage",
        "label": "Usage",
        "reverse_label": "Used by",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Interface",
        "translations": {
            "label": {
                "de": "Nutzung",
                "fr": "Utilisation",
                "es": "Uso",
                "it": "Utilizzo",
                "pt": "Uso",
                "zh": "使用",
                "ru": "Использование",
            }
        },
    },
    {
        "key": "uml_rel_Include",
        "label": "Include",
        "reverse_label": "Included by",
        "source_type_key": "uml_UseCase",
        "target_type_key": "uml_UseCase",
        "translations": {
            "label": {
                "de": "Einschluss",
                "fr": "Inclusion",
                "es": "Incluye",
                "it": "Include",
                "pt": "Inclui",
                "zh": "包含",
                "ru": "Включение",
            }
        },
    },
    {
        "key": "uml_rel_Extend",
        "label": "Extend",
        "reverse_label": "Extended by",
        "source_type_key": "uml_UseCase",
        "target_type_key": "uml_UseCase",
        "translations": {
            "label": {
                "de": "Erweiterung",
                "fr": "Extension",
                "es": "Extiende",
                "it": "Estende",
                "pt": "Estende",
                "zh": "扩展",
                "ru": "Расширение",
            }
        },
    },
    {
        "key": "uml_rel_AssociationUC",
        "label": "Association (Use Case)",
        "reverse_label": "Associated",
        "source_type_key": "uml_Actor",
        "target_type_key": "uml_UseCase",
        "translations": {
            "label": {
                "de": "Assoziation (Anwendungsfall)",
                "fr": "Association (cas d'utilisation)",
                "es": "Asociación (caso de uso)",
                "it": "Associazione (caso d'uso)",
                "pt": "Associação (caso de uso)",
                "zh": "关联（用例）",
                "ru": "Ассоциация (вариант использования)",
            }
        },
    },
    {
        "key": "uml_rel_ComponentRealization",
        "label": "Component Realization",
        "reverse_label": "Realized by",
        "source_type_key": "uml_Component",
        "target_type_key": "uml_Interface",
        "translations": {
            "label": {
                "de": "Komponentenrealisierung",
                "fr": "Réalisation de composant",
                "es": "Realización de componente",
                "it": "Realizzazione componente",
                "pt": "Realização de componente",
                "zh": "组件实现",
                "ru": "Реализация компонента",
            }
        },
    },
    {
        "key": "uml_rel_Deployment",
        "label": "Deployment",
        "reverse_label": "Deployed on",
        "source_type_key": "uml_Artifact",
        "target_type_key": "uml_Node",
        "translations": {
            "label": {
                "de": "Deployment",
                "fr": "Déploiement",
                "es": "Despliegue",
                "it": "Distribuzione",
                "pt": "Implantação",
                "zh": "部署",
                "ru": "Развёртывание",
            }
        },
    },
    {
        "key": "uml_rel_Manifestation",
        "label": "Manifestation",
        "reverse_label": "Manifested by",
        "source_type_key": "uml_Artifact",
        "target_type_key": "uml_Component",
        "translations": {
            "label": {
                "de": "Manifestation",
                "fr": "Manifestation",
                "es": "Manifestación",
                "it": "Manifestazione",
                "pt": "Manifestação",
                "zh": "表现",
                "ru": "Проявление",
            }
        },
    },
    {
        "key": "uml_rel_Substitution",
        "label": "Substitution",
        "reverse_label": "Substituted by",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Class",
        "translations": {
            "label": {
                "de": "Substitution",
                "fr": "Substitution",
                "es": "Sustitución",
                "it": "Sostituzione",
                "pt": "Substituição",
                "zh": "替换",
                "ru": "Замена",
            }
        },
    },
    {
        "key": "uml_rel_PackageImport",
        "label": "Package Import",
        "reverse_label": "Imported by",
        "source_type_key": "uml_Package",
        "target_type_key": "uml_Package",
        "translations": {
            "label": {
                "de": "Paketimport",
                "fr": "Importation de paquetage",
                "es": "Importación de paquete",
                "it": "Importazione pacchetto",
                "pt": "Importação de pacote",
                "zh": "包导入",
                "ru": "Импорт пакета",
            }
        },
    },
    {
        "key": "uml_rel_PackageMerge",
        "label": "Package Merge",
        "reverse_label": "Merged into",
        "source_type_key": "uml_Package",
        "target_type_key": "uml_Package",
        "translations": {
            "label": {
                "de": "Paketfusion",
                "fr": "Fusion de paquetage",
                "es": "Fusión de paquete",
                "it": "Fusione pacchetto",
                "pt": "Fusão de pacote",
                "zh": "包合并",
                "ru": "Объединение пакета",
            }
        },
    },
    {
        "key": "uml_rel_ElementImport",
        "label": "Element Import",
        "reverse_label": "Element imported by",
        "source_type_key": "uml_Package",
        "target_type_key": "uml_Class",
        "translations": {
            "label": {
                "de": "Elementimport",
                "fr": "Importation d'élément",
                "es": "Importación de elemento",
                "it": "Importazione elemento",
                "pt": "Importação de elemento",
                "zh": "元素导入",
                "ru": "Импорт элемента",
            }
        },
    },
    {
        "key": "uml_rel_Transition",
        "label": "Transition",
        "reverse_label": "Transitioned from",
        "source_type_key": "uml_State",
        "target_type_key": "uml_State",
        "translations": {
            "label": {
                "de": "Übergang",
                "fr": "Transition",
                "es": "Transición",
                "it": "Transizione",
                "pt": "Transição",
                "zh": "转换",
                "ru": "Переход",
            }
        },
    },
    {
        "key": "uml_rel_ControlFlow",
        "label": "Control Flow",
        "reverse_label": "Preceded by",
        "source_type_key": "uml_Action",
        "target_type_key": "uml_Action",
        "translations": {
            "label": {
                "de": "Kontrollfluss",
                "fr": "Flux de contrôle",
                "es": "Flujo de control",
                "it": "Flusso di controllo",
                "pt": "Fluxo de controle",
                "zh": "控制流",
                "ru": "Поток управления",
            }
        },
    },
    {
        "key": "uml_rel_ObjectFlow",
        "label": "Object Flow",
        "reverse_label": "Object flow from",
        "source_type_key": "uml_Action",
        "target_type_key": "uml_ObjectNode",
        "translations": {
            "label": {
                "de": "Objektfluss",
                "fr": "Flux d'objet",
                "es": "Flujo de objeto",
                "it": "Flusso di oggetto",
                "pt": "Fluxo de objeto",
                "zh": "对象流",
                "ru": "Поток объектов",
            }
        },
    },
    {
        "key": "uml_rel_MessageSync",
        "label": "Synchronous Message",
        "reverse_label": "Called by",
        "source_type_key": "uml_Lifeline",
        "target_type_key": "uml_Lifeline",
        "translations": {
            "label": {
                "de": "Synchrone Nachricht",
                "fr": "Message synchrone",
                "es": "Mensaje sincrónico",
                "it": "Messaggio sincrono",
                "pt": "Mensagem síncrona",
                "zh": "同步消息",
                "ru": "Синхронное сообщение",
            }
        },
    },
    {
        "key": "uml_rel_MessageAsync",
        "label": "Asynchronous Message",
        "reverse_label": "Sent by",
        "source_type_key": "uml_Lifeline",
        "target_type_key": "uml_Lifeline",
        "translations": {
            "label": {
                "de": "Asynchrone Nachricht",
                "fr": "Message asynchrone",
                "es": "Mensaje asincrónico",
                "it": "Messaggio asincrono",
                "pt": "Mensagem assíncrona",
                "zh": "异步消息",
                "ru": "Асинхронное сообщение",
            }
        },
    },
    {
        "key": "uml_rel_MessageReturn",
        "label": "Return Message",
        "reverse_label": "Returned to",
        "source_type_key": "uml_Lifeline",
        "target_type_key": "uml_Lifeline",
        "translations": {
            "label": {
                "de": "Rücknachricht",
                "fr": "Message de retour",
                "es": "Mensaje de retorno",
                "it": "Messaggio di ritorno",
                "pt": "Mensagem de retorno",
                "zh": "返回消息",
                "ru": "Возвратное сообщение",
            }
        },
    },
    {
        "key": "uml_rel_MessageCreate",
        "label": "Create Message",
        "reverse_label": "Created by",
        "source_type_key": "uml_Lifeline",
        "target_type_key": "uml_Lifeline",
        "translations": {
            "label": {
                "de": "Erstellungsnachricht",
                "fr": "Message de création",
                "es": "Mensaje de creación",
                "it": "Messaggio di creazione",
                "pt": "Mensagem de criação",
                "zh": "创建消息",
                "ru": "Сообщение создания",
            }
        },
    },
    {
        "key": "uml_rel_MessageDestroy",
        "label": "Destroy Message",
        "reverse_label": "Destroyed by",
        "source_type_key": "uml_Lifeline",
        "target_type_key": "uml_Lifeline",
        "translations": {
            "label": {
                "de": "Vernichtungsnachricht",
                "fr": "Message de destruction",
                "es": "Mensaje de destrucción",
                "it": "Messaggio di distruzione",
                "pt": "Mensagem de destruição",
                "zh": "销毁消息",
                "ru": "Сообщение уничтожения",
            }
        },
    },
    {
        "key": "uml_rel_SelfMessage",
        "label": "Self-Message",
        "reverse_label": "Self-called by",
        "source_type_key": "uml_Lifeline",
        "target_type_key": "uml_Lifeline",
        "translations": {
            "label": {
                "de": "Selbstnachricht",
                "fr": "Message réflexif",
                "es": "Mensaje propio",
                "it": "Messaggio a sé",
                "pt": "Mensagem própria",
                "zh": "自消息",
                "ru": "Самосообщение",
            }
        },
    },
    {
        "key": "uml_rel_ProvidedInterfaceRel",
        "label": "Provided Interface",
        "reverse_label": "Provided to",
        "source_type_key": "uml_Component",
        "target_type_key": "uml_Interface",
        "translations": {
            "label": {
                "de": "Bereitgestellte Schnittstelle",
                "fr": "Interface fournie",
                "es": "Interfaz proporcionada",
                "it": "Interfaccia fornita",
                "pt": "Interface fornecida",
                "zh": "提供接口",
                "ru": "Предоставляемый интерфейс",
            }
        },
    },
    {
        "key": "uml_rel_RequiredInterfaceRel",
        "label": "Required Interface",
        "reverse_label": "Required from",
        "source_type_key": "uml_Component",
        "target_type_key": "uml_Interface",
        "translations": {
            "label": {
                "de": "Benötigte Schnittstelle",
                "fr": "Interface requise",
                "es": "Interfaz requerida",
                "it": "Interfaccia richiesta",
                "pt": "Interface requerida",
                "zh": "需求接口",
                "ru": "Требуемый интерфейс",
            }
        },
    },
    {
        "key": "uml_rel_InformationFlow",
        "label": "Information Flow",
        "reverse_label": "Information source",
        "source_type_key": "uml_Class",
        "target_type_key": "uml_Class",
        "translations": {
            "label": {
                "de": "Informationsfluss",
                "fr": "Flux d'information",
                "es": "Flujo de información",
                "it": "Flusso di informazioni",
                "pt": "Fluxo de informação",
                "zh": "信息流",
                "ru": "Информационный поток",
            }
        },
    },
    {
        "key": "uml_rel_NoteLink",
        "label": "Note Link",
        "reverse_label": "Note linked to",
        "source_type_key": "uml_Note",
        "target_type_key": "uml_Class",
        "translations": {
            "label": {
                "de": "Notizverknüpfung",
                "fr": "Lien de note",
                "es": "Enlace de nota",
                "it": "Collegamento nota",
                "pt": "Link de nota",
                "zh": "注释链接",
                "ru": "Ссылка примечания",
            }
        },
    },
]


async def seed_uml_metamodel(db: AsyncSession) -> dict:
    """Seed all UML 2.5 card types and relation types. Idempotent."""
    existing_ct_result = await db.execute(
        select(CardType.key).where(CardType.plugin_id == PLUGIN_ID)
    )
    existing_ct_keys = {row[0] for row in existing_ct_result.all()}

    ct_created = 0
    for t in _ELEMENT_TYPES:
        if t["key"] in existing_ct_keys:
            continue
        ct = CardType(
            key=t["key"],
            label=t["label"],
            category=t["category"],
            icon=t.get("icon", "category"),
            color=t.get("color", "#1976d2"),
            plugin_id=PLUGIN_ID,
            built_in=False,
            is_hidden=False,
            has_hierarchy=t.get("has_hierarchy", False),
            sort_order=0,
            fields_schema=[],
            subtypes=[],
            translations={"label": t["translations"]["label"]},
        )
        db.add(ct)
        ct_created += 1

    existing_rt_result = await db.execute(
        select(RelationType.key).where(RelationType.plugin_id == PLUGIN_ID)
    )
    existing_rt_keys = {row[0] for row in existing_rt_result.all()}

    rt_created = 0
    for r in _RELATION_TYPES:
        if r["key"] in existing_rt_keys:
            continue
        rt = RelationType(
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
        db.add(rt)
        rt_created += 1

    await db.flush()
    return {"card_types_created": ct_created, "relation_types_created": rt_created}
