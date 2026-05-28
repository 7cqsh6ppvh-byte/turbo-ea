# UML Plugin — Comprehensive Implementation Plan

> Branch: `claude/uml-metamodel-visualfirst-QRMkj`  
> Inspired by Visual Paradigm's diagram-type-aware visual editor  
> Must coexist with the core EA metamodel **and** the ArchiMate plugin

---

## 1. Vision & Design Principles

### Goal
Give Turbo EA a fully integrated, standards-compliant **UML 2.5 visual modelling workspace** — not just a generic diagramming tool. Users should be able to draw Class Diagrams, Sequence Diagrams, Use Case Diagrams, Activity Diagrams, State Machine Diagrams, Component Diagrams, and more, with correct UML notation, element palettes scoped to the active diagram type, and a metamodel that coexists side-by-side with the core EA model and ArchiMate plugin.

### Principles
- **Diagram-type-aware canvas** — palette, allowed elements, allowed relations, layout hints, and validation rules are all determined by the selected UML diagram type (class vs. sequence vs. use case etc.)
- **Correct UML notation first** — nodes render with proper compartments, stereotypes, visibility markers; edges use correct arrowheads (hollow triangle, filled diamond, dashed lines)
- **Plugin isolation** — all types carry `plugin_id = "uml"`. Nothing touches the core metamodel or ArchiMate rows
- **Card-backed elements** — every UML element on a diagram is a Turbo EA card (`type_key = "uml_Class"` etc.), enabling RBAC, tagging, stakeholders, and cross-linking to EA cards
- **Coexistence** — a `uml_Class` node can optionally reference a core EA card (`Application`, `DataObject`…) acting as a "view" of that card in UML notation
- **XMI exchange** — standard XMI 2.1 export/import so models interop with Enterprise Architect, Visual Paradigm, Modelio, MagicDraw etc.
- **Same infrastructure** — reuses `diagrams` table, React Flow canvas, ELK layout, and the ArchiMate admin toggle pattern

---

## 2. UML 2.5 Diagram Types

| # | Type | Canvas Mode | Primary Elements |
|---|------|-------------|-----------------|
| 1 | **Class** | ReactFlow | Class, Interface, AbstractClass, DataType, Enumeration, PrimitiveType, Signal |
| 2 | **Object** | ReactFlow | Object (instance), Link |
| 3 | **Component** | ReactFlow | Component, Port, Interface (provided/required), Connector |
| 4 | **Deployment** | ReactFlow | Node, Device, ExecutionEnvironment, Artifact, DeploymentSpec |
| 5 | **Package** | ReactFlow | Package, Model, Profile, Stereotype |
| 6 | **Composite Structure** | ReactFlow | StructuredClassifier, Port, Connector, Part |
| 7 | **Profile** | ReactFlow | Profile, Stereotype, Extension, Metaclass |
| 8 | **Use Case** | ReactFlow | Actor, UseCase, Subject (system boundary) |
| 9 | **Activity** | ReactFlow | Activity, Action, InitialNode, FinalNode, DecisionNode, ForkJoin, ActivityPartition |
| 10 | **State Machine** | ReactFlow | State, CompositeState, Pseudostate (initial/final/choice/history), Transition |
| 11 | **Sequence** | SequenceCanvas (custom) | Lifeline, Message, CombinedFragment, ExecutionSpec, BoundaryNote |
| 12 | **Communication** | ReactFlow | Lifeline, Link, Message |
| 13 | **Timing** | SequenceCanvas | Lifeline, TimeConstraint, TimeInterval, Message |
| 14 | **Interaction Overview** | ReactFlow | InteractionFragment, Decision, Fork, Merge |

---

## 3. UML Metamodel (plugin_id = "uml")

### 3.1 Element Types (Card Types)

All keys prefixed `uml_`, categories prefixed `UML:`.

**Structural — Class diagram elements (category `UML:Class`)**
| Key | Label | Icon | Color |
|-----|-------|------|-------|
| `uml_Class` | Class | `view_in_ar` | `#dbeafe` |
| `uml_AbstractClass` | Abstract Class | `view_in_ar` | `#dbeafe` |
| `uml_Interface` | Interface | `api` | `#dbeafe` |
| `uml_DataType` | Data Type | `data_object` | `#dbeafe` |
| `uml_Enumeration` | Enumeration | `list` | `#dbeafe` |
| `uml_PrimitiveType` | Primitive Type | `code` | `#dbeafe` |
| `uml_Signal` | Signal | `notifications` | `#dbeafe` |

**Structural — Component/Deployment (category `UML:Component`)**
| Key | Label | Icon | Color |
|-----|-------|------|-------|
| `uml_Component` | Component | `widgets` | `#dcfce7` |
| `uml_Port` | Port | `settings_input_component` | `#dcfce7` |
| `uml_ProvidedInterface` | Provided Interface | `radio_button_checked` | `#dcfce7` |
| `uml_RequiredInterface` | Required Interface | `radio_button_unchecked` | `#dcfce7` |
| `uml_Artifact` | Artifact | `description` | `#dcfce7` |
| `uml_Node` | Node | `dns` | `#dcfce7` |
| `uml_Device` | Device | `devices` | `#dcfce7` |
| `uml_ExecutionEnvironment` | Execution Environment | `terminal` | `#dcfce7` |
| `uml_DeploymentSpec` | Deployment Specification | `settings` | `#dcfce7` |

**Structural — Package (category `UML:Package`)**
| Key | Label | Icon | Color |
|-----|-------|------|-------|
| `uml_Package` | Package | `folder_open` | `#fef9c3` |
| `uml_Model` | Model | `schema` | `#fef9c3` |
| `uml_Profile` | Profile | `tune` | `#fef9c3` |
| `uml_Stereotype` | Stereotype | `label` | `#fef9c3` |
| `uml_Namespace` | Namespace | `space_dashboard` | `#fef9c3` |

**Behavioral — Use Case (category `UML:UseCase`)**
| Key | Label | Icon | Color |
|-----|-------|------|-------|
| `uml_Actor` | Actor | `person` | `#fce7f3` |
| `uml_UseCase` | Use Case | `circle` | `#fce7f3` |
| `uml_Subject` | Subject / System Boundary | `crop_free` | `#fce7f3` |

**Behavioral — Activity (category `UML:Activity`)**
| Key | Label | Icon | Color |
|-----|-------|------|-------|
| `uml_Activity` | Activity | `account_tree` | `#fff7ed` |
| `uml_Action` | Action | `play_arrow` | `#fff7ed` |
| `uml_CallBehaviorAction` | Call Behavior Action | `call_to_action` | `#fff7ed` |
| `uml_SendSignalAction` | Send Signal Action | `send` | `#fff7ed` |
| `uml_AcceptEventAction` | Accept Event Action | `inbox` | `#fff7ed` |
| `uml_InitialNode` | Initial Node | `fiber_manual_record` | `#fff7ed` |
| `uml_ActivityFinalNode` | Activity Final Node | `stop_circle` | `#fff7ed` |
| `uml_FlowFinalNode` | Flow Final Node | `cancel` | `#fff7ed` |
| `uml_DecisionNode` | Decision / Merge Node | `change_history` | `#fff7ed` |
| `uml_ForkJoinNode` | Fork / Join Node | `drag_handle` | `#fff7ed` |
| `uml_ActivityPartition` | Activity Partition (Swimlane) | `view_column` | `#fff7ed` |
| `uml_ObjectNode` | Object Node | `data_object` | `#fff7ed` |
| `uml_CentralBuffer` | Central Buffer Node | `storage` | `#fff7ed` |
| `uml_DataStore` | Data Store Node | `database` | `#fff7ed` |

**Behavioral — State Machine (category `UML:StateMachine`)**
| Key | Label | Icon | Color |
|-----|-------|------|-------|
| `uml_State` | State | `crop_square` | `#f3e8ff` |
| `uml_CompositeState` | Composite State | `web` | `#f3e8ff` |
| `uml_SubmachineState` | Submachine State | `grid_view` | `#f3e8ff` |
| `uml_Pseudostate_Initial` | Initial Pseudostate | `fiber_manual_record` | `#f3e8ff` |
| `uml_Pseudostate_Final` | Final State | `stop_circle` | `#f3e8ff` |
| `uml_Pseudostate_Choice` | Choice | `change_history` | `#f3e8ff` |
| `uml_Pseudostate_Junction` | Junction | `merge` | `#f3e8ff` |
| `uml_Pseudostate_Fork` | Fork | `drag_handle` | `#f3e8ff` |
| `uml_Pseudostate_Join` | Join | `drag_handle` | `#f3e8ff` |
| `uml_Pseudostate_ShallowHistory` | Shallow History | `history` | `#f3e8ff` |
| `uml_Pseudostate_DeepHistory` | Deep History | `history_edu` | `#f3e8ff` |
| `uml_Pseudostate_EntryPoint` | Entry Point | `login` | `#f3e8ff` |
| `uml_Pseudostate_ExitPoint` | Exit Point | `logout` | `#f3e8ff` |

**Behavioral — Sequence (category `UML:Sequence`)**
| Key | Label | Icon | Color |
|-----|-------|------|-------|
| `uml_Lifeline` | Lifeline | `vertical_align_top` | `#ecfeff` |
| `uml_CombinedFragment` | Combined Fragment | `braces` | `#ecfeff` |
| `uml_InteractionOperand` | Interaction Operand | `splitscreen` | `#ecfeff` |
| `uml_ExecutionSpecification` | Execution Specification | `play_arrow` | `#ecfeff` |
| `uml_BoundaryNote` | Boundary Note | `note` | `#ecfeff` |
| `uml_FoundMessage` | Found Message | `call_received` | `#ecfeff` |
| `uml_LostMessage` | Lost Message | `call_made` | `#ecfeff` |

**Cross-diagram (category `UML:Common`)**
| Key | Label | Icon | Color |
|-----|-------|------|-------|
| `uml_Note` | Note | `sticky_note_2` | `#fef3c7` |
| `uml_Constraint` | Constraint | `lock` | `#fef3c7` |
| `uml_Frame` | Diagram Frame | `crop_free` | `#fef3c7` |
| `uml_Comment` | Comment | `comment` | `#fef3c7` |
| `uml_Object` | Object (instance) | `data_object` | `#dbeafe` |

**Total: ~60 element types**

---

### 3.2 Relation Types

| Key | Label | Arrowhead Style | Line Style | Diagram Types |
|-----|-------|-----------------|-----------|---------------|
| `uml_rel_Association` | Association | none/both open | solid | class, object, cd, comms |
| `uml_rel_DirectedAssociation` | Directed Association | open at target | solid | class, object |
| `uml_rel_Aggregation` | Aggregation | hollow diamond at source | solid | class |
| `uml_rel_Composition` | Composition | filled diamond at source | solid | class |
| `uml_rel_Dependency` | Dependency | open at target | dashed | class, component, deployment, pkg |
| `uml_rel_Generalization` | Generalization | hollow triangle at target | solid | class, uc |
| `uml_rel_Realization` | Realization / Implementation | hollow triangle at target | dashed | class, component |
| `uml_rel_Usage` | Usage | open at target + «use» | dashed | class, pkg |
| `uml_rel_Include` | Include | open at target + «include» | dashed | usecase |
| `uml_rel_Extend` | Extend | open at target + «extend» | dashed | usecase |
| `uml_rel_Association_UC` | Association (Use Case) | none | solid | usecase |
| `uml_rel_ComponentRealization` | Component Realization | hollow triangle | dashed | component |
| `uml_rel_Deployment` | Deployment | open + «deploy» | dashed | deployment |
| `uml_rel_Manifestation` | Manifestation | open + «manifest» | dashed | deployment |
| `uml_rel_Substitution` | Substitution | open + «substitute» | dashed | class |
| `uml_rel_PackageImport` | Package Import | open + «import» | dashed | package |
| `uml_rel_PackageMerge` | Package Merge | open + «merge» | dashed | package |
| `uml_rel_ElementImport` | Element Import | open + «access» | dashed | package |
| `uml_rel_Transition` | Transition | open at target | solid | statemachine |
| `uml_rel_ControlFlow` | Control Flow | open at target | solid | activity |
| `uml_rel_ObjectFlow` | Object Flow | open at target | dashed | activity |
| `uml_rel_MessageSync` | Synchronous Message | filled triangle | solid | sequence |
| `uml_rel_MessageAsync` | Asynchronous Message | open arrow | solid | sequence |
| `uml_rel_MessageReturn` | Return Message | open arrow | dashed | sequence |
| `uml_rel_MessageCreate` | Create Message | open + «create» | dashed | sequence |
| `uml_rel_MessageDestroy` | Destroy Message | open arrow | solid | sequence |
| `uml_rel_SelfMessage` | Self-Message | open arrow | solid | sequence |
| `uml_rel_ProvidedInterface` | Provided Interface (lollipop) | circle (lollipop) | solid | component |
| `uml_rel_RequiredInterface` | Required Interface (socket) | arc (socket) | solid | component |
| `uml_rel_InformationFlow` | Information Flow | open triangle | dashed | class, uc |
| `uml_rel_NoteLink` | Note Link | none | dashed | all |

**Total: ~31 relation types**

---

## 4. Backend Architecture

### 4.1 File Structure

```
backend/app/plugins/uml/
├── __init__.py
├── seed.py          # ~2000 lines: all 60 element types + 31 relation types
├── seed_demo.py     # Demo UML model (ATM system class diagram + checkout sequence)
└── xmi.py           # XMI 2.1 export/import

backend/app/api/v1/uml.py  # /uml router (enable, XMI import/export, status)
```

### 4.2 seed.py Pattern

Follows ArchiMate `seed.py` exactly:
- `PLUGIN_ID = "uml"`
- `_ELEMENT_TYPES: list[dict]` — 60 entries
- `_RELATION_TYPES: list[dict]` — 31 entries
- `async def seed_uml_metamodel(db: AsyncSession) -> dict`
- Idempotent: checks `CardType.plugin_id == "uml"` before inserting
- All 8 locale translations on every type

### 4.3 Settings API

New endpoints in `backend/app/api/v1/settings.py`:

```python
GET  /settings/uml-enabled     # public, no auth
PATCH /settings/uml-enabled    # admin.settings required
```

Toggle behaviour mirrors ArchiMate:
- Enable → `seed_uml_metamodel(db)` + unhide all `uml_*` types
- Disable → set `is_hidden = True` on all `uml_*` types (cards preserved, not deleted)

Bootstrap response extended with `"uml_enabled": bool`.

### 4.4 XMI Import/Export

`backend/app/plugins/uml/xmi.py`:

```python
async def export_model_to_xmi(db, name, card_ids=None) -> str  # → XMI 2.1 XML
async def import_model_from_xmi(db, xmi_content, user_id) -> dict  # → {created, skipped}
```

XMI identifier stored in `card.attributes["xmi_id"]` for deduplication.  
Supports Class, Interface, Enumeration, Component, Package, Actor, UseCase.

### 4.5 API Router

```python
# uml.py routes
POST /uml/export        # XMI export, body: {name, card_ids?}
POST /uml/import        # XMI import, multipart file upload (.xmi, .xml)
GET  /uml/diagram-types # Returns list of UML diagram types with labels/icons
```

### 4.6 Permissions

New keys in `backend/app/core/permissions.py`:

```python
"uml": {
    "uml.view": "View UML diagrams and elements",
    "uml.manage": "Create, edit, and delete UML diagrams",
},
```

Granted to roles:
- Admin: view + manage
- Member: view + manage
- BPM Admin: view + manage  
- Viewer: view only

### 4.7 Alembic Migration

No new Alembic migration needed:
- `plugin_id` column: already added in `093_add_plugin_id_to_types.py`
- `uml_enabled` setting: stored in existing `general_settings` JSONB on `app_settings`
- `diagrams.type`: existing free-text column accepts `"uml-class"`, `"uml-sequence"` etc.

---

## 5. Frontend Architecture

### 5.1 File Structure

```
frontend/src/features/uml/
├── types.ts                    # All UML TypeScript interfaces
├── umlShapes.ts                # Element metadata (size, shape, color, icon per type)
├── umlNodes.tsx                # React Flow custom node renderers (10+ node types)
├── umlEdges.tsx                # React Flow custom edge renderers (15+ edge types)
├── umlElkLayout.ts             # ELK layout per diagram type
├── umlDiagramTypes.ts          # Diagram type config (palette, allowed elements/relations)
├── UmlCanvas.tsx               # Main ReactFlow canvas component
├── SequenceCanvas.tsx          # Specialized sequence diagram renderer
├── UmlElementPalette.tsx       # Left sidebar: diagram type picker + element palette
├── UmlRelationSelector.tsx     # Edge type popup on connection
├── UmlDiagramEditor.tsx        # Editor wrapper (same pattern as ArchimateDiagramEditor)
├── UmlDiagramsPage.tsx         # Gallery / list page (same pattern as ArchimateDiagramsPage)
└── UmlClassMemberEditor.tsx    # Inline attribute/operation editor for class nodes

frontend/src/features/admin/UmlAdmin.tsx
frontend/src/hooks/useUmlEnabled.ts
frontend/src/i18n/locales/{en,de,fr,es,it,pt,zh,ru}/uml.json
```

### 5.2 TypeScript Types

```typescript
// types.ts

export type UmlDiagramType =
  | "uml-class" | "uml-object" | "uml-component" | "uml-deployment"
  | "uml-package" | "uml-composite" | "uml-profile"      // structural
  | "uml-usecase" | "uml-activity" | "uml-statemachine"  // behavioral
  | "uml-sequence" | "uml-communication" | "uml-timing" | "uml-interaction-overview";

export interface UmlDiagramTypeConfig {
  type: UmlDiagramType;
  label: string;
  icon: string;
  category: "Structural" | "Behavioral" | "Interaction";
  allowedElements: string[];    // uml_* type keys
  allowedRelations: string[];   // uml_rel_* keys
  elkAlgorithm: string;
}

export interface UmlNodeData extends Record<string, unknown> {
  label: string;
  elementTypeKey: string;
  cardId?: string;
  // Class-diagram specific
  stereotype?: string;              // «interface», «abstract», «enumeration», custom
  isAbstract?: boolean;
  attributes?: UmlClassAttribute[];
  operations?: UmlClassOperation[];
  // State-diagram specific
  entryAction?: string;
  exitAction?: string;
  doAction?: string;
  // Sequence-diagram specific
  instanceOf?: string;             // e.g. ":OrderController"
  // Combined fragment
  interactionOperator?: "alt" | "opt" | "loop" | "par" | "break" | "seq" | "strict" | "neg" | "critical" | "ignore" | "consider" | "assert" | "ref";
  guards?: string[];
}

export interface UmlClassAttribute {
  visibility: "+" | "-" | "#" | "~";
  name: string;
  type: string;
  initialValue?: string;
  isStatic?: boolean;
  isDerived?: boolean;
}

export interface UmlClassOperation {
  visibility: "+" | "-" | "#" | "~";
  name: string;
  parameters: string;
  returnType: string;
  isAbstract?: boolean;
  isStatic?: boolean;
}

export interface UmlEdgeData extends Record<string, unknown> {
  relationType: string;    // uml_rel_* key
  relationId?: string;
  label?: string;          // role name, guard condition, multiplicity
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  guard?: string;          // [condition] for transitions
  stereotype?: string;     // «include», «extend», «deploy» etc.
}

export interface UmlDiagramData {
  nodes: UmlDiagramNode[];
  edges: UmlDiagramEdge[];
  diagramType: UmlDiagramType;
  version: "1";
}
```

### 5.3 Diagram Type Configuration (umlDiagramTypes.ts)

```typescript
export const UML_DIAGRAM_TYPES: UmlDiagramTypeConfig[] = [
  {
    type: "uml-class",
    label: "Class Diagram",
    icon: "view_in_ar",
    category: "Structural",
    allowedElements: ["uml_Class", "uml_AbstractClass", "uml_Interface", "uml_DataType",
                      "uml_Enumeration", "uml_PrimitiveType", "uml_Signal", "uml_Note"],
    allowedRelations: ["uml_rel_Association", "uml_rel_DirectedAssociation",
                       "uml_rel_Aggregation", "uml_rel_Composition",
                       "uml_rel_Dependency", "uml_rel_Generalization",
                       "uml_rel_Realization", "uml_rel_Usage",
                       "uml_rel_Substitution", "uml_rel_NoteLink"],
    elkAlgorithm: "layered",
  },
  {
    type: "uml-usecase",
    label: "Use Case Diagram",
    icon: "person",
    category: "Behavioral",
    allowedElements: ["uml_Actor", "uml_UseCase", "uml_Subject", "uml_Note"],
    allowedRelations: ["uml_rel_Association_UC", "uml_rel_Include", "uml_rel_Extend",
                       "uml_rel_Generalization", "uml_rel_NoteLink"],
    elkAlgorithm: "force",
  },
  {
    type: "uml-component",
    label: "Component Diagram",
    icon: "widgets",
    category: "Structural",
    allowedElements: ["uml_Component", "uml_Port", "uml_ProvidedInterface",
                      "uml_RequiredInterface", "uml_Artifact", "uml_Note"],
    allowedRelations: ["uml_rel_Association", "uml_rel_Dependency",
                       "uml_rel_Realization", "uml_rel_ComponentRealization",
                       "uml_rel_ProvidedInterface", "uml_rel_RequiredInterface",
                       "uml_rel_NoteLink"],
    elkAlgorithm: "layered",
  },
  {
    type: "uml-deployment",
    label: "Deployment Diagram",
    icon: "dns",
    category: "Structural",
    allowedElements: ["uml_Node", "uml_Device", "uml_ExecutionEnvironment",
                      "uml_Artifact", "uml_Component", "uml_DeploymentSpec", "uml_Note"],
    allowedRelations: ["uml_rel_Association", "uml_rel_Dependency",
                       "uml_rel_Deployment", "uml_rel_Manifestation",
                       "uml_rel_NoteLink"],
    elkAlgorithm: "layered",
  },
  {
    type: "uml-package",
    label: "Package Diagram",
    icon: "folder_open",
    category: "Structural",
    allowedElements: ["uml_Package", "uml_Model", "uml_Profile", "uml_Stereotype",
                      "uml_Class", "uml_Interface", "uml_Note"],
    allowedRelations: ["uml_rel_PackageImport", "uml_rel_PackageMerge",
                       "uml_rel_ElementImport", "uml_rel_Dependency",
                       "uml_rel_NoteLink"],
    elkAlgorithm: "layered",
  },
  {
    type: "uml-activity",
    label: "Activity Diagram",
    icon: "account_tree",
    category: "Behavioral",
    allowedElements: ["uml_Activity", "uml_Action", "uml_CallBehaviorAction",
                      "uml_SendSignalAction", "uml_AcceptEventAction",
                      "uml_InitialNode", "uml_ActivityFinalNode", "uml_FlowFinalNode",
                      "uml_DecisionNode", "uml_ForkJoinNode",
                      "uml_ActivityPartition", "uml_ObjectNode",
                      "uml_CentralBuffer", "uml_DataStore", "uml_Note"],
    allowedRelations: ["uml_rel_ControlFlow", "uml_rel_ObjectFlow", "uml_rel_NoteLink"],
    elkAlgorithm: "layered",  // vertical direction
  },
  {
    type: "uml-statemachine",
    label: "State Machine Diagram",
    icon: "crop_square",
    category: "Behavioral",
    allowedElements: ["uml_State", "uml_CompositeState", "uml_SubmachineState",
                      "uml_Pseudostate_Initial", "uml_Pseudostate_Final",
                      "uml_Pseudostate_Choice", "uml_Pseudostate_Junction",
                      "uml_Pseudostate_Fork", "uml_Pseudostate_Join",
                      "uml_Pseudostate_ShallowHistory", "uml_Pseudostate_DeepHistory",
                      "uml_Note"],
    allowedRelations: ["uml_rel_Transition", "uml_rel_NoteLink"],
    elkAlgorithm: "layered",
  },
  {
    type: "uml-sequence",
    label: "Sequence Diagram",
    icon: "swap_vert",
    category: "Interaction",
    allowedElements: ["uml_Lifeline", "uml_CombinedFragment",
                      "uml_InteractionOperand", "uml_ExecutionSpecification",
                      "uml_BoundaryNote", "uml_FoundMessage", "uml_LostMessage"],
    allowedRelations: ["uml_rel_MessageSync", "uml_rel_MessageAsync",
                       "uml_rel_MessageReturn", "uml_rel_MessageCreate",
                       "uml_rel_MessageDestroy", "uml_rel_SelfMessage"],
    elkAlgorithm: "sequence",  // custom — SequenceCanvas handles layout
  },
  // ... communication, timing, interaction-overview, object, composite, profile
];
```

### 5.4 Custom Node Renderers (umlNodes.tsx)

Every renderer is a React Flow custom node. Key implementations:

#### `UmlClassNode` (handles Class, AbstractClass, Interface, DataType, Enumeration)

```
┌─────────────────────────────────────┐  ← border: 2px solid #1e3a8a
│  «interface»                        │  ← stereotype (gray, small, centered)
│  OrderService                       │  ← name (bold, italic if abstract)
├─────────────────────────────────────┤  ← divider
│  - orderId: String                  │  ← attributes (visibility + name: type)
│  + customerName: String             │
│  # totalAmount: Double = 0.0        │
├─────────────────────────────────────┤  ← divider
│  + placeOrder(items: List): void    │  ← operations (visibility + name(params): type)
│  # validateOrder(): Boolean         │
└─────────────────────────────────────┘
```

- Background: `#dbeafe` (default for classes), `#f0fdf4` for interfaces
- Width: min 180px, auto-resizes to content (ResizeObserver)
- Compartments collapsible (click divider toggles)
- Double-click name/attribute/operation to enter inline edit mode
- Static members underlined
- Abstract members italic

#### `UmlActorNode` (use case diagram)

```
      ⚪       ← filled circle for head (SVG)
     ╱│╲       ← line body + arms
      │
     ╱ ╲       ← legs
   ActorName   ← name below, centered
```

Pure SVG rendering. Width: 60px, Height: 90px.

#### `UmlUseCaseNode` (use case diagram)

```
  ╭─────────────────╮   ← ellipse/oval shape
  │  «extend»       │   ← stereotype (optional)
  │  Place Order    │   ← name centered
  ╰─────────────────╯
```

SVG ellipse. Width: 150px, Height: 60px.

#### `UmlComponentNode`

```
┌──────────────────────────────────┐  ← outer box
│  [≡≡]  «component»              │  ← component icon (SVG) + stereotype
│        OrderService              │
│                                  │
│   ○─── IOrderPort (provided)     │  ← child ports rendered as circles
│   ┤─── IPayment (required)       │  ← child ports rendered as arcs
└──────────────────────────────────┘
```

#### `UmlNodeBox` (Deployment — Node/Device/ExecutionEnvironment)

```
   ┌─────────────────────────┐
  ┌───────────────────────────┤  ← 3D perspective (CSS transform or SVG)
  │  ⊞  «device»             │
  │   ApplicationServer      │
  │   ┌────────────────┐     │
  │   │  «artifact»    │     │  ← nested artifacts
  │   │  app.war       │     │
  │   └────────────────┘     │
  └───────────────────────────┘
```

#### `UmlDecisionNode` (Activity Diagram)

```
       ◇         ← diamond shape (SVG polygon)
   [condition]   ← guard label below (if set)
```

Diamond width: 40px, height: 40px. React Flow handles are at top/left/right/bottom.

#### `UmlForkJoinNode` (Activity / State Machine)

```
  ├────────────────────────┤   ← thick horizontal bar (or vertical for join)
```

Thin rectangle 4px × 120px (horizontal) or 120px × 4px (vertical).

#### `UmlInitialNode` / `UmlFinalNode`

```
  ●         ← filled circle (initial)
  ⊙         ← circle-in-circle (activity final)
  ⊗         ← circle-with-X (flow final)
```

SVG circles. 20px × 20px.

#### `UmlStateNode` (State Machine)

```
╭───────────────────────────╮   ← rounded corners
│         Idle              │   ← name
├───────────────────────────┤   ← divider (only if actions defined)
│  entry / init()           │
│  do / listen()            │
│  exit / cleanup()         │
╰───────────────────────────╯
```

#### `UmlLifelineNode` (Sequence Diagram — SequenceCanvas only)

```
  ┌────────────────────┐   ← header box
  │  :OrderController  │   ← role name (instanceOf)
  └────────────────────┘
           │
           │               ← dashed vertical line (extends downward)
           │ ──────────>   ← message (drawn by SequenceCanvas, not ReactFlow edge)
          ┌┤
          ││  activation   ← activation box on line
          └┤
           │
```

#### `UmlPackageNode`

```
  ┌────────────────────────────────┐
  │ PackageName                    │  ← folder tab (CSS + clip-path)
  ├────────────────────────────────┤
  │                                │
  │   [child elements here]        │
  │                                │
  └────────────────────────────────┘
```

#### `UmlNoteNode`

```
  ┌─────────────────────────────┐  ← dog-eared corner (top-right)
  │  {constraint}               │
  │  or note text               │
  └─────────────────────────────┘
```

---

### 5.5 Custom Edge Renderers (umlEdges.tsx)

All edges extend React Flow's `BaseEdge` for path rendering. Custom SVG markers via `<defs>`.

SVG marker definitions (placed in a `<ReactFlowProvider>`-scoped SVG defs block):

```svg
<defs>
  <!-- Generalization / Realization target: hollow triangle -->
  <marker id="uml-hollow-triangle" orient="auto" markerWidth="10" markerHeight="10" refX="8" refY="5">
    <path d="M0,0 L8,5 L0,10 Z" fill="white" stroke="currentColor" stroke-width="1.5"/>
  </marker>
  <!-- Aggregation source: hollow diamond -->
  <marker id="uml-hollow-diamond" orient="auto-start-reverse" markerWidth="14" markerHeight="10" refX="0" refY="5">
    <path d="M0,5 L6,0 L12,5 L6,10 Z" fill="white" stroke="currentColor" stroke-width="1.5"/>
  </marker>
  <!-- Composition source: filled diamond -->
  <marker id="uml-filled-diamond" orient="auto-start-reverse" markerWidth="14" markerHeight="10" refX="0" refY="5">
    <path d="M0,5 L6,0 L12,5 L6,10 Z" fill="currentColor"/>
  </marker>
  <!-- Dependency / Include / Extend target: open arrowhead -->
  <marker id="uml-open-arrow" orient="auto" markerWidth="10" markerHeight="10" refX="8" refY="5">
    <path d="M0,0 L8,5 L0,10" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </marker>
  <!-- Synchronous message: filled triangle (Sequence) -->
  <marker id="uml-filled-triangle" orient="auto" markerWidth="8" markerHeight="8" refX="7" refY="4">
    <path d="M0,0 L7,4 L0,8 Z" fill="currentColor"/>
  </marker>
</defs>
```

Edge type → visual config table:

| Relation Key | Line | Source Marker | Target Marker | Label Style |
|---|---|---|---|---|
| `uml_rel_Association` | solid | none | none | multiplicity at both ends |
| `uml_rel_DirectedAssociation` | solid | none | open-arrow | role name |
| `uml_rel_Aggregation` | solid | hollow-diamond | none | multiplicity |
| `uml_rel_Composition` | solid | filled-diamond | none | multiplicity |
| `uml_rel_Dependency` | dashed | none | open-arrow | stereotype |
| `uml_rel_Generalization` | solid | none | hollow-triangle | none |
| `uml_rel_Realization` | dashed | none | hollow-triangle | none |
| `uml_rel_Include` | dashed | none | open-arrow | «include» |
| `uml_rel_Extend` | dashed | none | open-arrow | «extend» |
| `uml_rel_Usage` | dashed | none | open-arrow | «use» |
| `uml_rel_Deployment` | dashed | none | open-arrow | «deploy» |
| `uml_rel_Transition` | solid | none | open-arrow | event [guard]/action |
| `uml_rel_ControlFlow` | solid | none | open-arrow | guard |
| `uml_rel_ObjectFlow` | dashed | none | open-arrow | guard |
| `uml_rel_MessageSync` | solid | none | filled-triangle | message name() |
| `uml_rel_MessageAsync` | solid | none | open-arrow | message name() |
| `uml_rel_MessageReturn` | dashed | none | open-arrow | return value |
| `uml_rel_NoteLink` | dashed | none | none | none (gray) |

---

### 5.6 Sequence Diagram Canvas (SequenceCanvas.tsx)

The Sequence Diagram requires a fundamentally different layout model:

```
Architecture:
  SequenceCanvas is NOT a React Flow canvas.
  It renders using SVG directly for precise control.

  State model:
    lifelines: Array<{id, label, instanceOf, x, width}>     ← horizontal axis
    messages: Array<{id, from, to, type, label, y, isSelf}>  ← vertical axis (time)
    fragments: Array<{id, from_x, to_x, y_start, y_end, operator, guards}> ← overlays
    execSpecs: Array<{id, lifelineId, y_start, y_end}>        ← activation boxes

  Layout algorithm:
    1. Lifelines auto-spaced horizontally at fixed intervals (min 200px apart)
    2. New messages inserted at cursor Y position, auto-shifts later messages down
    3. Activation boxes drawn as thin rectangles overlaid on lifeline
    4. Combined fragments drawn as semi-transparent overlay boxes
    5. Drag lifeline header to reorder horizontally
    6. Scroll canvas vertically (virtual)

  Interaction:
    - Drag from one lifeline head to another → creates Message
    - Right-click message → change type (sync/async/return/create/destroy)
    - Click on activation box to label or resize
    - Drag combined fragment corner to expand/shrink
    - Double-click lifeline header to rename
```

**SequenceCanvas Props:**
```typescript
interface SequenceCanvasProps {
  diagramId: string;
  initialData: UmlSequenceDiagramData;
  onSave?: (data: UmlSequenceDiagramData) => void;
}
```

---

### 5.7 Element Palette (UmlElementPalette.tsx)

Top section: **Diagram Type Selector** (dropdown or tab strip):
```
  [ Class ] [ Use Case ] [ Component ] [ Activity ] [ State ] [ Sequence ] [ ▾ More ]
```

Below: element list filtered to `allowedElements` of selected diagram type:
```
  ── Structural ──────────────────
  [⬜] Class
  [⬜] Abstract Class
  [⬜] Interface
  [⬜] Enumeration
  ── Common ──────────────────────
  [📋] Note
```

Drag-and-drop behaviour:
- Drag element from palette → drop on canvas → creates card + node optimistically
- New card created via `POST /cards` with `type_key = "uml_Class"` etc.
- Optimistic node shown immediately, updated with real card ID on API response

---

### 5.8 Relation Type Selector (UmlRelationSelector.tsx)

Appears as a floating popup when user completes a connection drag:
```
  ┌────────────────────────────────────┐
  │ Select relationship type           │
  │                                    │
  │  ─────────  Association            │
  │  ─────────→ Directed Association   │
  │  ◇──────── Aggregation             │
  │  ◆──────── Composition             │
  │  - - - - → Dependency             │
  │  ────────▷ Generalization          │
  │  - - - - ▷ Realization             │
  └────────────────────────────────────┘
```

Filtered to `allowedRelations` of active diagram type.

---

### 5.9 UmlCanvas.tsx (ReactFlow-based, for non-sequence diagrams)

Extends ArchimateCanvas pattern with:
- `diagramType` prop determines which node/edge types are registered
- `UmlRelationSelector` popup on connect
- `UmlElementPalette` in left sidebar
- Drop zone for palette drags
- Auto-save debounced 800ms via `PATCH /diagrams/{id}`
- ELK auto-layout button (algorithm from diagram type config)
- Diagram type indicator in header

---

### 5.10 Routing (App.tsx additions)

```typescript
const UmlDiagramsPage = lazy(() => import("@/features/uml/UmlDiagramsPage"));
const UmlDiagramEditor = lazy(() => import("@/features/uml/UmlDiagramEditor"));

// Routes:
<Route path="/uml" element={<UmlDiagramsPage />} />
<Route path="/uml/:id/edit" element={<UmlDiagramEditor />} />
```

### 5.11 Navigation (AppLayout.tsx)

```typescript
{ labelKey: "uml", icon: "schema", path: "/uml", permission: "uml.view" }
// Only shown when umlEnabled = true (same pattern as archiMateEnabled)
```

### 5.12 useUmlEnabled.ts

Module-level singleton hook following ArchiMate pattern exactly:
- Module-level `_cached`, `_inflight`, `_listeners`
- `invalidateUmlEnabled(v)` exported for bootstrap priming
- `useUmlEnabled()` returns `{ umlEnabled, umlLoaded, invalidateUml }`

---

## 6. i18n (Translation Files)

New namespace `uml` in all 8 locales. Keys:

```json
{
  "pageTitle": "UML Diagrams",
  "newDiagram": "New UML Diagram",
  "noDiagrams": "No UML diagrams yet",
  "noDiagramsHint": "Create your first diagram to get started.",
  "diagramType": "Diagram Type",
  "diagramTypes": {
    "uml-class": "Class Diagram",
    "uml-object": "Object Diagram",
    "uml-component": "Component Diagram",
    "uml-deployment": "Deployment Diagram",
    "uml-package": "Package Diagram",
    "uml-usecase": "Use Case Diagram",
    "uml-activity": "Activity Diagram",
    "uml-statemachine": "State Machine Diagram",
    "uml-sequence": "Sequence Diagram",
    "uml-communication": "Communication Diagram",
    "uml-timing": "Timing Diagram",
    "uml-interaction-overview": "Interaction Overview Diagram",
    "uml-composite": "Composite Structure Diagram",
    "uml-profile": "Profile Diagram"
  },
  "relation": {
    "uml_rel_Association": "Association",
    "uml_rel_Aggregation": "Aggregation",
    "uml_rel_Composition": "Composition",
    ...
  },
  "visibility": {
    "+": "public",
    "-": "private",
    "#": "protected",
    "~": "package"
  },
  "admin": {
    "title": "UML",
    "enable": "Enable UML",
    "enabled": "UML is enabled",
    "disabled": "UML is disabled",
    "seedDemo": "Seed Demo Data",
    "dangerZone": "Danger Zone"
  },
  "export": {
    "title": "Export UML Model (XMI)",
    "button": "Export XMI",
    "success": "Model exported successfully"
  },
  "import": {
    "title": "Import UML Model (XMI)",
    "button": "Import XMI",
    "success": "Model imported: {{created}} created, {{skipped}} skipped"
  }
}
```

---

## 7. Coexistence with EA Metamodel and ArchiMate

### Rule 1: Namespace Isolation

- All UML types: `plugin_id = "uml"`, keys prefixed `uml_`, categories prefixed `UML:`
- All ArchiMate types: `plugin_id = "archimate"`, prefixed `arch_`
- Core EA types: `plugin_id = NULL`, no prefix
- Each plugin can be enabled/disabled independently

### Rule 2: Card-Backed Elements (Cross-Model References)

A UML class node CAN reference a core EA card:
- `card.attributes["linked_ea_card_id"]` = UUID of the linked EA card
- UML canvas shows a small link icon on backed nodes
- Clicking the icon navigates to the EA card detail
- This is optional — a UML class doesn't need an EA counterpart

Example use case: Draw a Class Diagram where each class corresponds to an EA `Application` card. The UML diagram is a structural view of the EA inventory.

### Rule 3: Shared Diagram Storage

All diagrams (DrawIO, ArchiMate, UML) share the `diagrams` table. The `type` column discriminates:
- `"drawio"` → rendered by DiagramEditor (DrawIO iframe)
- `"archimate"` → rendered by ArchimateDiagramEditor (ReactFlow)
- `"uml-class"`, `"uml-sequence"` etc. → rendered by UmlDiagramEditor (ReactFlow or SequenceCanvas)

### Rule 4: Inventory Coexistence

UML types appear in the inventory page when enabled. Admin can:
- Filter by `UML:*` category to see only UML elements
- Hide UML types from inventory via the admin toggle (sets `is_hidden = True`)
- Create UML cards directly from the inventory (but this is unusual)

---

## 8. Implementation Phases

### Phase 1 — Core Infrastructure & Class Diagram (this PR)

**Duration estimate**: ~4-5 days of focused work

Backend:
- [ ] `backend/app/plugins/uml/__init__.py`
- [ ] `backend/app/plugins/uml/seed.py` — all 60 element types + 31 relation types
- [ ] `backend/app/api/v1/uml.py` — enable/disable + XMI stub
- [ ] `backend/app/core/permissions.py` — add uml.* keys
- [ ] `backend/app/api/v1/settings.py` — GET/PATCH /settings/uml-enabled, bootstrap
- [ ] `backend/app/main.py` — wire plugin seed + SEED_UML env var

Frontend (Structural Diagrams):
- [ ] `frontend/src/plugins/uml/types.ts`
- [ ] `frontend/src/plugins/uml/umlShapes.ts`
- [ ] `frontend/src/plugins/uml/umlNodes.tsx` — Class, Interface, AbstractClass, Enumeration, Note
- [ ] `frontend/src/plugins/uml/umlEdges.tsx` — all structural relations
- [ ] `frontend/src/plugins/uml/umlDiagramTypes.ts`
- [ ] `frontend/src/plugins/uml/umlElkLayout.ts`
- [ ] `frontend/src/plugins/uml/UmlCanvas.tsx`
- [ ] `frontend/src/plugins/uml/UmlElementPalette.tsx`
- [ ] `frontend/src/plugins/uml/UmlRelationSelector.tsx`
- [ ] `frontend/src/plugins/uml/UmlDiagramEditor.tsx`
- [ ] `frontend/src/plugins/uml/UmlDiagramsPage.tsx`
- [ ] `frontend/src/hooks/useUmlEnabled.ts`
- [ ] `frontend/src/features/admin/UmlAdmin.tsx`
- [ ] i18n files (8 locales)
- [ ] App.tsx routes + AppLayout.tsx nav
- [ ] SettingsAdmin.tsx UML tab

Tests:
- [ ] `backend/tests/plugins/test_uml_seed.py`
- [ ] `backend/tests/api/test_uml_settings.py`
- [ ] `frontend/src/features/uml/umlNodes.test.tsx`
- [ ] `frontend/src/features/uml/umlEdges.test.ts`
- [ ] `frontend/src/features/uml/umlShapes.test.ts`

### Phase 2 — Behavioral Diagrams (Activity, State Machine)

Frontend:
- [ ] `umlNodes.tsx` — Actor, UseCase, Subject, Action, InitialNode, FinalNode, DecisionNode, ForkJoinNode, State, CompositeState, Pseudostates
- [ ] Activity Diagram canvas configuration (swimlane support via ReactFlow node groups)
- [ ] State Machine Diagram canvas configuration
- [ ] Use Case Diagram canvas configuration
- [ ] Component Diagram canvas configuration
- [ ] Deployment Diagram (3D node boxes)

### Phase 3 — Sequence Diagram

Frontend:
- [ ] `SequenceCanvas.tsx` — custom SVG renderer for sequence diagrams
- [ ] `SequenceDiagram.tsx` — Lifeline + Message + CombinedFragment rendering
- [ ] Timing Diagram canvas

### Phase 4 — Package, Composite, Profile + XMI

Backend:
- [ ] `backend/app/plugins/uml/xmi.py` — full XMI 2.1 import/export
- [ ] Package Diagram (nested containers in ReactFlow using NodeGroup)
- [ ] Composite Structure Diagram
- [ ] Profile Diagram

### Phase 5 — Demo Data + Polish

Backend:
- [ ] `backend/app/plugins/uml/seed_demo.py` — ATM system class diagram + order process sequence diagram
- [ ] `backend/app/main.py` — SEED_UML env var

Frontend:
- [ ] `UmlClassMemberEditor.tsx` — improved inline editing
- [ ] Keyboard shortcuts (Ctrl+drag to connect, Del to delete, Ctrl+Z undo)
- [ ] Export as SVG/PNG
- [ ] Diagram thumbnail generation for gallery

---

## 9. Key Technical Decisions

### Decision 1: ReactFlow for All Structural Diagrams
**Rationale**: ReactFlow handles free-form graphs well. Class, Component, Deployment, Package, Use Case, Activity, State Machine diagrams are all essentially graphs with nodes and edges. ELK provides good auto-layout for all of these.

### Decision 2: Custom SVG Canvas for Sequence Diagrams
**Rationale**: Sequence diagrams have fundamentally different constraints. Lifelines must be horizontally ordered, messages flow in time order, and the Y axis represents time. ReactFlow's free-form positioning would make this awkward. A custom SVG renderer gives full control.

### Decision 3: Card-Backed Elements
**Rationale**: Every UML element on a diagram is a real Turbo EA card. This enables RBAC, tagging, stakeholders, and cross-linking. It also means UML diagrams participate in the event stream, data quality scoring, and all other EA features.

### Decision 4: Diagram Type as Diagram.type Value
**Rationale**: Storing `"uml-class"` vs `"uml-sequence"` in the `diagrams.type` field means the gallery can filter by diagram type, and the editor knows which canvas to render. This is consistent with `"archimate"` and `"drawio"` types.

### Decision 5: Inline Class Member Editing
**Rationale**: Class diagrams are most useful when you can edit attributes and operations directly in the compartments. This is what makes Visual Paradigm feel productive. We implement this with React-controlled inputs inside the node.

### Decision 6: UML Notation Correctness
**Rationale**: The correct UML arrowheads, line styles, and notation are what distinguish a UML tool from a generic diagrammer. We implement them using SVG `<marker>` definitions. This is non-trivial but essential.

---

## 10. Testing Strategy

### Backend Tests

```python
# test_uml_seed.py
- test_seed_is_idempotent()  — runs seed twice, expects same row count
- test_all_element_types_inserted()  — asserts 60 types with plugin_id="uml"
- test_all_relation_types_inserted()  — asserts 31 types
- test_disable_hides_all_types()  — PATCH enabled=False, asserts is_hidden on all uml_* types
- test_enable_unhides_all_types()  — PATCH enabled=True, asserts is_hidden=False

# test_uml_settings.py
- test_get_uml_enabled_unauthenticated()  — 200 {enabled: false}
- test_patch_uml_enabled_requires_admin()  — 403 for non-admin
- test_patch_uml_enabled_seeds_and_enables()  — 200, types exist
```

### Frontend Tests

```typescript
// umlNodes.test.tsx
- renders UmlClassNode with 3 compartments
- renders attributes with visibility markers (+/-/#/~)
- renders operations with correct formatting
- collapses/expands compartments on divider click

// umlEdges.test.ts
- returns correct SVG path for each relation type
- applies correct stroke-dasharray for dashed edges
- renders correct source/target markers

// umlShapes.test.ts
- returns correct metadata for all 60 element types
- filters allowed elements by diagram type
```

---

## 11. Demo Data (seed_demo.py)

### ATM System Class Diagram

Elements:
- `ATM` (Class): + cardNumber: String, + amount: Double, + session(): Session
- `BankServer` (Class): + validate(card: Card): Boolean, + transfer(amount: Double): void
- `Card` (Class): - cardNumber: String, - pin: String, + validate(pin: String): Boolean
- `Account` (Class): - balance: Double, + withdraw(amount: Double): void, + deposit(amount: Double): void
- `Session` (Class): + startTime: DateTime, + isActive: Boolean, + end(): void
- `IAuthService` (Interface): + authenticate(card: Card, pin: String): Boolean
- `AccountType` (Enumeration): CHECKING, SAVINGS, CREDIT

Relations:
- ATM → BankServer: Association
- ATM → Session: Composition
- BankServer → IAuthService: Realization
- Card → Account: Association (0..1 to *)
- Account ← AccountType: Dependency

### Order Processing Use Case Diagram

Elements:
- `Customer` (Actor)
- `PaymentService` (Actor, external system)
- `PlaceOrder` (UseCase)
- `ProcessPayment` (UseCase)
- `CheckInventory` (UseCase)
- `ShipOrder` (UseCase)
- `TrackOrder` (UseCase)

Relations:
- Customer → PlaceOrder: Association
- Customer → TrackOrder: Association
- PlaceOrder → ProcessPayment: Include
- PlaceOrder → CheckInventory: Include
- CheckInventory → ShipOrder: Extend
- PaymentService → ProcessPayment: Association

### Order Controller Sequence Diagram

Lifelines: `Customer`, `:OrderController`, `:InventoryService`, `:PaymentGateway`
Messages:
1. Customer →sync `placeOrder(items)` → :OrderController
2. :OrderController →sync `checkStock(items)` → :InventoryService
3. :InventoryService →return `stockAvailable: Boolean` → :OrderController
4. :OrderController →sync `charge(card, amount)` → :PaymentGateway
5. :PaymentGateway →return `transactionId` → :OrderController
6. :OrderController →return `orderId` → Customer

---

## 12. Documentation Updates

Per CLAUDE.md requirements, documentation must accompany the feature:

- `docs/guide/uml.md` (+ 7 locale variants) — User guide for UML diagrams
- `docs/admin/uml.md` (+ 7 locale variants) — Admin guide (enable/disable, XMI import/export)
- `docs/reference/glossary.md` — Add UML terminology
- `mkdocs.yml` — Add UML pages to nav

Screenshots needed (add to `scripts/screenshots/pages.ts`):
- UML diagrams gallery page
- Class diagram canvas with multi-compartment class node
- Use Case diagram canvas
- Sequence diagram canvas
- Admin settings — UML tab

---

## Summary

| Metric | Value |
|--------|-------|
| New backend files | ~8 |
| New frontend files | ~22 |
| New test files | ~10 |
| New i18n files | 8 (one per locale) |
| UML element card types | ~60 |
| UML relation types | ~31 |
| UML diagram types supported | 14 (Phase 1 delivers 3-5) |
| Alembic migrations needed | 0 (plugin_id already exists) |
| Breaks existing functionality | No (fully additive, plugin_id isolated) |
