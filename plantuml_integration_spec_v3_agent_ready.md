# PlantUML Integration for Turbo EA — Agent-Ready Specification

**Version 3.1 Agent-Ready — May 24, 2026**

Adapted from v3.0 Comprehensive for: Plugin Architecture, Extensibility, and TDD-First AI Coding Agent Implementation

---

## Table of Contents

- [Part 1: Plugin / Modular Architecture Analysis](#part-1-plugin--modular-architecture-analysis)
- [Part 2: Extensibility Assessment](#part-2-extensibility-assessment)
- [Part 3: TDD Implementation Plan for Coding Agent](#part-3-tdd-implementation-plan-for-coding-agent)
- [Appendix A: Plugin Manifest Schema](#appendix-a-plugin-manifest-schema)
- [Appendix B: ERD Extension Walkthrough](#appendix-b-erd-extension-walkthrough)
- [Appendix C: Dependency Graph](#appendix-c-dependency-graph)

---

# Part 1: Plugin / Modular Architecture Analysis

## 1.1 Current Design Assessment

The v3 spec is **partially modular** but **not plugin-ready**. Here is a component-by-component evaluation:

| Component | Currently Modular? | Plugin-Ready? | Gap |
|-----------|-------------------|---------------|-----|
| **Database schema** (Alembic migration) | ❌ Monolithic migration | ❌ | Migration is in the main Alembic chain; no isolated migration namespace |
| **SQLAlchemy models** (UmlDiagram, UmlDiagramCard) | ⚠️ Partially | ❌ | Models are defined alongside core models; no separate module |
| **API routes** (uml-diagrams, export) | ⚠️ Partially | ⚠️ | FastAPI routers *can* be registered conditionally, but spec assumes always-on |
| **PlantUML Assembler** | ✅ Yes | ✅ | Pure function, no side effects, easily isolatable |
| **PlantUML Server** (Docker container) | ✅ Yes | ✅ | Separate container, already optional (PLANTUML_ENABLED flag) |
| **Frontend components** (UmlCanvas, toolbox, etc.) | ⚠️ Partially | ❌ | Components exist but are assumed to be part of the main bundle; no lazy loading or feature gating |
| **Seed data** (card_types, relation_types) | ❌ No | ❌ | Inserted directly into shared tables with no namespace or ownership marker |
| **RBAC permissions** | ⚠️ Partially | ❌ | Permission keys defined but not conditionally registered |
| **i18n strings** | ✅ Yes | ✅ | Prefixed with `uml.*`, easily isolatable |

**Verdict: 3/9 components are plugin-ready. The design needs targeted changes to become a true plugin.**

## 1.2 Required Changes for Plugin Architecture

### 1.2.1 Backend: Plugin Module Structure

Create a self-contained Python package under `app/plugins/uml/`:

```
app/
├── plugins/
│   ├── __init__.py              # Plugin registry & loader
│   └── uml/
│       ├── __init__.py          # Plugin manifest (name, version, dependencies)
│       ├── plugin.py            # Plugin lifecycle: register(), unregister()
│       ├── models.py            # UmlDiagram, UmlDiagramCard SQLAlchemy models
│       ├── schemas.py           # Pydantic request/response schemas
│       ├── router.py            # FastAPI router (all /api/uml-diagrams/* routes)
│       ├── services/
│       │   ├── assembler.py     # PlantUML assembler (pure function)
│       │   └── exporter.py      # Export logic (calls PlantUML server)
│       ├── migrations/
│       │   └── 001_uml_tables.py  # Isolated Alembic migration
│       ├── seed.py              # Seed data loader
│       ├── permissions.py       # RBAC permission definitions
│       ├── i18n/
│       │   ├── en.json
│       │   ├── de.json
│       │   └── ...              # 8 locale files
│       └── tests/               # All plugin tests co-located
│           ├── test_assembler.py
│           ├── test_router.py
│           ├── test_models.py
│           └── test_exporter.py
```

### 1.2.2 Plugin Manifest & Lifecycle

```python
# app/plugins/uml/plugin.py

from app.plugins import PluginBase

class UmlPlugin(PluginBase):
    name = "uml-diagrams"
    version = "1.0.0"
    description = "UML diagram canvas + PlantUML headless export"
    dependencies = []  # No dependency on other plugins
    
    # Feature flags
    requires_plantuml_server = True  # For SVG/PNG export
    optional_features = ["batch_export", "preview_panel"]
    
    def register(self, app):
        """Called on startup if plugin is enabled."""
        # 1. Register FastAPI router
        from .router import router
        app.include_router(router, prefix="/api/uml-diagrams", tags=["UML Diagrams"])
        
        # 2. Register RBAC permissions
        from .permissions import UML_PERMISSIONS
        app.permission_registry.register_many(UML_PERMISSIONS)
        
        # 3. Register seed data callback
        from .seed import seed_uml_types
        app.on_first_run(seed_uml_types)
    
    def unregister(self, app):
        """Called on shutdown or plugin disable."""
        pass  # Routes auto-removed; permissions soft-disabled

    def health_check(self) -> dict:
        """Plugin-specific health check."""
        return {
            "plantuml_server": self._check_plantuml_server(),
            "migration_applied": self._check_migration(),
        }
```

### 1.2.3 Plugin Registry & Feature Flags

```python
# app/plugins/__init__.py

import os
from typing import Dict

class PluginRegistry:
    """Central plugin loader. Reads ENABLED_PLUGINS env var."""
    
    def __init__(self):
        self._plugins: Dict[str, PluginBase] = {}
    
    def discover_and_load(self, app):
        enabled = os.getenv("ENABLED_PLUGINS", "").split(",")
        # e.g., ENABLED_PLUGINS=uml-diagrams,archimate-views
        for plugin_name in enabled:
            plugin_name = plugin_name.strip()
            if not plugin_name:
                continue
            module = importlib.import_module(f"app.plugins.{plugin_name.replace('-', '_')}")
            plugin = module.Plugin()
            plugin.register(app)
            self._plugins[plugin_name] = plugin
    
    def is_enabled(self, name: str) -> bool:
        return name in self._plugins
```

**Configuration** (`.env`):
```bash
# Plugin system
ENABLED_PLUGINS=uml-diagrams

# UML plugin-specific
PLANTUML_SERVER_URL=https://camo.githubusercontent.com/33c8121990ecd37aaa4a6e27a14d9edfd176cacbfa433dc2bc01ff36871ed2d6/68747470733a2f2f7777772e706c616e74756d6c2e636f6d2f706c616e74756d6c2f7376672f5a504456592d656d34434e56796f626f4e6d4c526b385f3531714e6174694277317a547a4d61496378495862637849524a3155412d6a727473625a735a7a4a734153553979706964634e486732476f4c416644357a525657724b6a6f3151614d566d6533396d4d6f6a3158674767436d494f356d305f3452644433413873474d584f57706946504e6879536f394c4a55597966324e6b4c50494162314f49306a36545237542d74616a5246564f30514b7668666352362d7775545979443334554d57484e32436d39774b5562416a594273744f696b616e4952476b4336752d6d62537759706375464b554d474372726e6853725a4e5134785535456c4b792d384a31674c58375637545f36536a694a4f453931486463543367464451443448652d48706641524e712d6a72704e6e5f33375931593575596662752d774c4475494c4f4a63426b753750414e787147565731306a55367539674f367173587a75706546785a657463786752624263772d4e635f4c706b306c4e677132457644625472664c746d6a4e5f6e4a5253704c52704849306462772d6a676e5a756261525a794f304f6564534b5a6a465f32614a464470417643415a464a5648536c306c704f425a334b74495159364555346e687633704b5138346e614c3464566c704e766c6659594a62587a30573030
PLANTUML_TIMEOUT=10
PLANTUML_ENABLED=true
```

### 1.2.4 Isolated Database Migrations

Instead of adding to the main Alembic migration chain, the plugin uses a **multi-head migration** approach:

```python
# app/plugins/uml/migrations/env.py
# Plugin migrations run in a separate Alembic branch

def run_plugin_migrations():
    """Run only UML plugin migrations. Called by plugin.register()."""
    alembic_cfg = Config()
    alembic_cfg.set_main_option("script_location", "app/plugins/uml/migrations")
    alembic_cfg.set_main_option("version_table", "alembic_version_plugin_uml")
    command.upgrade(alembic_cfg, "head")
```

Key design decisions:
- **Separate version table**: `alembic_version_plugin_uml` (not the main `alembic_version`)
- **Additive-only**: Plugin only ADDs columns and tables; never modifies existing core columns
- **Clean uninstall**: `downgrade` drops all plugin tables and columns; core DB untouched
- **card_types / relation_types columns**: The `notation`, `plantuml_keyword`, etc. columns are added to shared tables — this is the one coupling point. If the plugin is uninstalled, these columns are dropped (existing rows unaffected since they were all NULL).

### 1.2.5 Frontend: Lazy-Loaded Module

```typescript
// src/plugins/uml/index.ts  — Plugin entry point

export const UmlPlugin: FrontendPlugin = {
  name: "uml-diagrams",
  routes: [
    {
      path: "/workspace/:workspaceId/uml-diagrams",
      component: React.lazy(() => import("./pages/UmlDiagramList")),
    },
    {
      path: "/workspace/:workspaceId/uml-diagrams/:diagramId",
      component: React.lazy(() => import("./pages/UmlCanvasEditor")),
    },
  ],
  navItems: [
    {
      label: "uml.nav_title",  // i18n key
      icon: "AccountTree",
      path: "/uml-diagrams",
      requiredPermission: "uml_diagrams.view",
    },
  ],
};
```

```
src/plugins/
└── uml/
    ├── index.ts                  # Plugin manifest
    ├── pages/
    │   ├── UmlDiagramList.tsx
    │   └── UmlCanvasEditor.tsx
    ├── components/
    │   ├── UmlCanvas.tsx
    │   ├── UmlToolboxSidebar.tsx
    │   ├── UmlNode.tsx
    │   ├── UmlEdge.tsx
    │   ├── UmlDeleteDialog.tsx
    │   ├── UmlExportDropdown.tsx
    │   └── RelationTypePicker.tsx
    ├── hooks/
    │   ├── useDiagram.ts
    │   ├── useCanvasEvents.ts
    │   └── useExport.ts
    ├── api/
    │   └── umlApi.ts             # API client functions
    ├── i18n/
    │   ├── en.json
    │   └── ...
    └── __tests__/
        ├── UmlCanvas.test.tsx
        ├── UmlToolboxSidebar.test.tsx
        └── ...
```

### 1.2.6 Docker Compose: Optional Service

```yaml
# docker-compose.yml — PlantUML server is a named profile
services:
  plantuml:
    image: plantuml/plantuml-server:jetty
    profiles: ["uml"]   # Only starts with: docker compose --profile uml up
    restart: unless-stopped
    ports:
      - "127.0.0.1:8180:8080"
    environment:
      - PLANTUML_LIMIT_SIZE=16384
    deploy:
      resources:
        limits:
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/svg/SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9vt98pKi1IW80"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Startup with plugin**: `docker compose --profile uml up`
**Startup without plugin**: `docker compose up` (PlantUML container never starts)

## 1.3 Plugin Architecture Summary

| Concern | Solution |
|---------|----------|
| **Enable/disable** | `ENABLED_PLUGINS` env var; backend conditionally registers routes, permissions, seeds |
| **Backend isolation** | `app/plugins/uml/` package with own models, router, services, migrations |
| **DB isolation** | Separate Alembic version table; additive columns on shared tables; clean downgrade |
| **Frontend isolation** | `src/plugins/uml/` with `React.lazy()` code-splitting; nav items conditionally rendered |
| **Docker isolation** | PlantUML server behind Docker Compose `profiles: ["uml"]` |
| **Config isolation** | Plugin-specific env vars (`PLANTUML_*`); plugin manifest declares required config |
| **Test isolation** | Tests co-located in plugin directory; can be run independently |
| **Uninstall** | `alembic downgrade base` on plugin branch; remove plugin folder; remove from ENABLED_PLUGINS |

**Coupling points** (unavoidable):
1. `card_types` and `relation_types` tables gain nullable columns — these are the semantic bridge between the core metamodel and the UML plugin
2. The plugin's `uml_diagram_cards` junction table references the core `cards` table (FK)
3. Frontend plugin registry must be recognized by the main app shell

These coupling points are **minimal and well-bounded** — exactly what a good plugin architecture looks like.

---

# Part 2: Extensibility Assessment

## 2.1 "Zero-Code Extensibility" — Claim Evaluation

The spec claims that adding a new UML type requires "only a database INSERT — no code changes." Let's test this claim rigorously.

### Test: Adding a new UML type (e.g., "UML Enum")

**Step 1**: Insert seed data
```sql
INSERT INTO card_types (name, notation, plantuml_keyword, plantuml_stereotype, plantuml_color)
VALUES ('UML Enum', 'UML', 'enum', '«enumeration»', '#lightyellow');
```

**What happens automatically (zero code)**:
- ✅ Toolbox sidebar picks it up (queries `notation='UML'` dynamically)
- ✅ PlantUML assembler generates correct syntax (`enum "MyEnum" as card_xxx «enumeration» #lightyellow`)
- ✅ Export endpoints work (assembler reads metadata from card_type)
- ✅ Canvas drag-and-drop works (generic UmlNode renders any card_type)
- ✅ RBAC works (permissions are on `uml_diagrams`, not on individual card types)

**What does NOT happen automatically (needs code)**:
- ❌ Custom node visual styling (dashed border for interface, compartments for class attributes) — the current `UmlNode` component would render a generic box
- ❌ Type-specific validation rules (e.g., "Enum must have at least one value")
- ❌ Type-specific canvas behavior (e.g., package nodes contain child nodes)

**Verdict: The claim is ~70% true.** For basic "appears in toolbox, renders on canvas, exports correctly" — yes, zero code. For type-specific visual rendering and behavior — code is needed.

### 2.2 Extending to a New Diagram Family: ERD

Let's evaluate what it takes to add Entity-Relationship Diagrams (ERD):

#### What's Reusable (diagram-type-agnostic)

| Component | Reusable? | Notes |
|-----------|-----------|-------|
| Plugin infrastructure | ✅ 100% | Same plugin pattern, separate `app/plugins/erd/` |
| Database tables | ✅ 90% | `uml_diagrams` table works for any diagram type (rename to `diagrams`?); junction table identical |
| Assembler pattern | ✅ 80% | Same algorithm: iterate cards → build syntax lines → iterate relations → build arrows |
| Export pipeline | ✅ 95% | Same endpoint pattern: `.puml`, SVG, PNG; same PlantUML server |
| Canvas (React Flow) | ✅ 70% | React Flow canvas, drag-drop, connect — all reusable; node rendering needs new styles |
| Toolbox sidebar | ✅ 90% | Same pattern: filter by `notation='ERD'` |
| Delete dialog | ✅ 100% | Identical UX |
| RBAC pattern | ✅ 100% | Same permission pattern: `erd_diagrams.view`, `.create`, etc. |
| i18n pattern | ✅ 100% | Same prefix pattern: `erd.*` |

#### What's ERD-Specific (needs new code)

| Component | What's Needed | Effort |
|-----------|--------------|--------|
| **Seed data** | New card_types: Entity, Weak Entity, Attribute, etc. | Trivial (SQL) |
| **Custom node styles** | Entity = rectangle, Attribute = ellipse, Relationship = diamond | Small (CSS + React) |
| **Cardinality labels** | "1:N", "M:N" on edges instead of simple arrows | Small (edge label logic) |
| **PlantUML ERD syntax** | PlantUML uses `entity` keyword + different arrow syntax for ERD | Small (assembler handles via metadata) |
| **Validation rules** | Entity must have a primary key attribute; relationship connects entities | Medium (new validation layer) |
| **Attribute compartments** | ERD entities show attributes in a list inside the node | Medium (custom node rendering) |

#### ERD Extension: Concrete Steps

```sql
-- Step 1: Seed card_types (zero code)
INSERT INTO card_types (name, notation, plantuml_keyword, plantuml_stereotype, plantuml_color) VALUES
  ('ERD Entity',         'ERD', 'entity', NULL,          '#lightblue'),
  ('ERD Weak Entity',    'ERD', 'entity', '«weak»',      '#lightyellow'),
  ('ERD Attribute',      'ERD', 'object', '«attribute»',  '#white'),
  ('ERD Relationship',   'ERD', 'diamond', NULL,          '#lightgreen');

-- Step 2: Seed relation_types (zero code)
INSERT INTO relation_types (name, plantuml_arrow) VALUES
  ('has_attribute', '--'),
  ('one_to_many', '||--o{'),
  ('many_to_many', '}o--o{'),
  ('one_to_one', '||--||');
```

```typescript
// Step 3: Custom ERD node (small code change)
// src/plugins/uml/components/nodes/ErdEntityNode.tsx
// ~50 lines of React — renders entity with attribute compartments
```

**Total effort for ERD**: ~2-3 days (mostly custom node rendering + edge labels).

### 2.3 Architectural Improvements for Maximum Extensibility

#### Improvement 1: Generalize Table Names

Rename `uml_diagrams` → `diagrams` and `uml_diagram_cards` → `diagram_cards`. The `diagram_type` column already supports different values. This eliminates the "UML" assumption baked into table names.

```
diagrams                    (was: uml_diagrams)
├── diagram_type: "class"   (UML)
├── diagram_type: "erd"     (ERD)
├── diagram_type: "state"   (State Machine)
└── diagram_type: "arch"    (Architecture)
```

#### Improvement 2: Node Renderer Registry

Instead of a monolithic `UmlNode` component that handles all types, create a **renderer registry**:

```typescript
// src/plugins/uml/components/NodeRendererRegistry.ts

type NodeRenderer = React.ComponentType<NodeProps>;

const registry: Record<string, NodeRenderer> = {};

export function registerNodeRenderer(notation: string, keyword: string, renderer: NodeRenderer) {
  registry[`${notation}:${keyword}`] = renderer;
}

export function getNodeRenderer(notation: string, keyword: string): NodeRenderer {
  return registry[`${notation}:${keyword}`] || DefaultNode;
}

// Registration (called by each plugin)
registerNodeRenderer("UML", "class", UmlClassNode);
registerNodeRenderer("UML", "interface", UmlInterfaceNode);
registerNodeRenderer("ERD", "entity", ErdEntityNode);
```

#### Improvement 3: Assembler Strategy Pattern

Instead of one assembler function, use a strategy pattern where each diagram type can provide its own assembly rules:

```python
# app/plugins/uml/services/assembler.py

class AssemblerStrategy:
    """Base class for diagram-type-specific assembly."""
    
    def assemble_header(self, diagram) -> list[str]:
        return ["@startuml", f'title "{sanitize(diagram.name)}"']
    
    def assemble_card(self, card, card_type) -> str | None:
        if not card_type.plantuml_keyword:
            return None
        return f'{card_type.plantuml_keyword} "{sanitize(card.name)}" as card_{card.id}'
    
    def assemble_relation(self, rel, rel_type) -> str | None:
        if not rel_type.plantuml_arrow:
            return None
        return f"card_{rel.source_id} {rel_type.plantuml_arrow} card_{rel.target_id}"
    
    def assemble_footer(self, diagram) -> list[str]:
        return ["@enduml"]

class ErdAssemblerStrategy(AssemblerStrategy):
    """ERD-specific overrides."""
    
    def assemble_card(self, card, card_type) -> str | None:
        # ERD entities include attributes as fields
        line = super().assemble_card(card, card_type)
        if line and card_type.plantuml_keyword == "entity":
            attrs = get_card_fields(card.id)
            if attrs:
                line += " {\n"
                for attr in attrs:
                    pk = "* " if attr.is_primary_key else "  "
                    line += f"  {pk}{attr.name} : {attr.data_type}\n"
                line += "}"
        return line

# Registry
ASSEMBLER_STRATEGIES: dict[str, AssemblerStrategy] = {
    "class": AssemblerStrategy(),
    "component": AssemblerStrategy(),
    "erd": ErdAssemblerStrategy(),
}
```

#### Improvement 4: `notation` Column as Plugin Namespace

The `notation` column on `card_types` already serves as a namespace. Formalize this:

- Each plugin "owns" a notation value: UML plugin owns `notation='UML'`, ERD plugin owns `notation='ERD'`
- Toolbox filters by notation
- Assembler selects strategy by notation
- Uninstalling a plugin can safely `DELETE FROM card_types WHERE notation = 'ERD'`

### 2.4 Extensibility Scorecard

| Future Diagram Type | Seed Data Only? | Code Changes | Effort |
|---------------------|----------------|--------------|--------|
| **UML Enum** (new UML type) | ✅ Yes | None | Minutes |
| **UML Stereotype** (new UML type) | ✅ Yes | None | Minutes |
| **ERD** | Partial | Custom nodes, edge labels | 2-3 days |
| **State Machine** | Partial | State/transition node shapes | 2-3 days |
| **Architecture (C4)** | Partial | Container/boundary rendering | 3-5 days |
| **BPMN** | ❌ No | Substantial (swimlanes, gateways) | 1-2 weeks |
| **Sequence Diagram** | ❌ No | Fundamentally different canvas model | 2-3 weeks |

**Summary**: The architecture is **excellent for similar diagram families** (class-like, entity-like) and **good for moderately different families** (state machines, C4). It **does not support fundamentally different paradigms** (sequence diagrams, BPMN swimlanes) without significant new code — which is an honest and appropriate boundary.

---

# Part 3: TDD Implementation Plan for Coding Agent

## Guiding Principles for the Coding Agent

1. **Red-Green-Refactor**: Write a failing test → make it pass → refactor
2. **One checkpoint = one runnable, testable unit**: After each checkpoint, run `pytest` (backend) or `npm test` (frontend) and all tests pass
3. **File-by-file**: Each task specifies exact file paths to create or modify
4. **Dependencies explicit**: No task starts before its listed dependencies are complete
5. **Acceptance criteria per checkpoint**: Clear pass/fail criteria

## Convention Notes

- **Backend path root**: `app/plugins/uml/` (plugin structure from Part 1)
- **Frontend path root**: `src/plugins/uml/`
- **Test runner (backend)**: `pytest app/plugins/uml/tests/`
- **Test runner (frontend)**: `npx jest src/plugins/uml/`
- **E2E test runner**: `npx cypress run --spec cypress/e2e/uml/**`

---

## Phase 1: Plugin Skeleton & Database Foundations

### Checkpoint 1.1: Plugin Infrastructure

```
Phase 1: Plugin Skeleton & Database Foundations
├── Checkpoint 1.1: Plugin Infrastructure
│   ├── Task 1: Write tests for plugin registry
│   │   - File: app/plugins/tests/test_plugin_registry.py
│   │   - Test cases:
│   │     • test_registry_loads_enabled_plugin
│   │     • test_registry_skips_disabled_plugin
│   │     • test_registry_handles_empty_env_var
│   │     • test_plugin_health_check_returns_dict
│   ├── Task 2: Implement plugin registry
│   │   - Files:
│   │     • app/plugins/__init__.py       (PluginBase, PluginRegistry)
│   │     • app/plugins/uml/__init__.py   (module init)
│   │     • app/plugins/uml/plugin.py     (UmlPlugin class, stub register/unregister)
│   │   - Dependencies: None
│   ├── Task 3: Wire plugin registry into app startup
│   │   - File: app/main.py (add PluginRegistry.discover_and_load() call)
│   │   - Dependencies: Task 2
│   └── Verification:
│       - Run: pytest app/plugins/tests/test_plugin_registry.py — all 4 tests pass
│       - Run: ENABLED_PLUGINS=uml-diagrams uvicorn app.main:app — app starts, no errors
│       - Run: ENABLED_PLUGINS="" uvicorn app.main:app — app starts, UML routes not registered
```

### Checkpoint 1.2: Database Models & Migration

```
├── Checkpoint 1.2: Database Models & Migration
│   ├── Task 1: Write tests for SQLAlchemy models
│   │   - File: app/plugins/uml/tests/test_models.py
│   │   - Test cases:
│   │     • test_uml_diagram_creation_with_required_fields
│   │     • test_uml_diagram_creation_fails_without_name
│   │     • test_uml_diagram_card_composite_pk
│   │     • test_uml_diagram_card_cascade_delete_on_diagram
│   │     • test_uml_diagram_card_cascade_delete_on_card
│   │     • test_card_type_plantuml_columns_nullable
│   │     • test_relation_type_plantuml_arrow_nullable
│   ├── Task 2: Implement SQLAlchemy models
│   │   - File: app/plugins/uml/models.py
│   │   - Models: UmlDiagram, UmlDiagramCard
│   │   - Dependencies: None (uses existing Base, Card, Workspace, User models)
│   ├── Task 3: Write Alembic migration
│   │   - File: app/plugins/uml/migrations/001_uml_tables.py
│   │   - Operations:
│   │     • ADD columns to card_types: notation, plantuml_keyword, plantuml_stereotype, plantuml_color
│   │     • ADD column to relation_types: plantuml_arrow
│   │     • CREATE INDEX ix_card_types_notation
│   │     • CREATE TABLE uml_diagrams
│   │     • CREATE TABLE uml_diagram_cards
│   │   - Dependencies: Task 2
│   ├── Task 4: Write migration tests
│   │   - File: app/plugins/uml/tests/test_migration.py
│   │   - Test cases:
│   │     • test_upgrade_creates_tables
│   │     • test_upgrade_adds_columns_to_card_types
│   │     • test_upgrade_adds_column_to_relation_types
│   │     • test_upgrade_creates_index
│   │     • test_downgrade_removes_all_plugin_artifacts
│   │     • test_upgrade_is_idempotent_safe (run twice, no error)
│   │   - Dependencies: Task 3
│   └── Verification:
│       - Run: alembic upgrade head (plugin branch) — no errors
│       - Run: alembic downgrade base (plugin branch) — clean removal
│       - Run: pytest app/plugins/uml/tests/test_models.py — all tests pass
│       - Run: pytest app/plugins/uml/tests/test_migration.py — all tests pass
│       - Inspect DB: tables exist, columns exist, index exists
```

### Checkpoint 1.3: Seed Data & Pydantic Schemas

```
├── Checkpoint 1.3: Seed Data & Pydantic Schemas
│   ├── Task 1: Write tests for seed data
│   │   - File: app/plugins/uml/tests/test_seed.py
│   │   - Test cases:
│   │     • test_seed_creates_6_uml_card_types
│   │     • test_seed_creates_6_relation_types_with_arrows
│   │     • test_seed_card_types_have_notation_UML
│   │     • test_seed_is_idempotent (run twice, no duplicates)
│   │     • test_existing_card_types_unaffected (notation stays NULL)
│   ├── Task 2: Implement seed data loader
│   │   - File: app/plugins/uml/seed.py
│   │   - Function: seed_uml_types(session) — inserts card_types + relation_types
│   │   - Dependencies: Checkpoint 1.2 (models + migration)
│   ├── Task 3: Write tests for Pydantic schemas
│   │   - File: app/plugins/uml/tests/test_schemas.py
│   │   - Test cases:
│   │     • test_diagram_create_schema_valid
│   │     • test_diagram_create_schema_rejects_empty_name
│   │     • test_diagram_create_schema_rejects_invalid_type
│   │     • test_diagram_response_schema_serialization
│   │     • test_diagram_card_add_schema_valid
│   │     • test_diagram_card_position_schema_valid
│   │     • test_export_format_enum_values
│   ├── Task 4: Implement Pydantic schemas
│   │   - File: app/plugins/uml/schemas.py
│   │   - Schemas: DiagramCreate, DiagramUpdate, DiagramResponse,
│   │     DiagramListResponse, DiagramCardAdd, DiagramCardUpdate,
│   │     ExportFormat (enum)
│   │   - Dependencies: None
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_seed.py — all tests pass
│       - Run: pytest app/plugins/uml/tests/test_schemas.py — all tests pass
│       - DB contains 6 UML card types, 6 relation types with arrows
```

### Checkpoint 1.4: CRUD API Endpoints (Diagrams)

```
├── Checkpoint 1.4: CRUD API Endpoints (Diagrams)
│   ├── Task 1: Write tests for diagram CRUD
│   │   - File: app/plugins/uml/tests/test_router_diagrams.py
│   │   - Test cases:
│   │     • test_create_diagram_returns_201
│   │     • test_create_diagram_missing_name_returns_422
│   │     • test_list_diagrams_returns_empty_list
│   │     • test_list_diagrams_returns_created_diagrams
│   │     • test_list_diagrams_filters_by_workspace
│   │     • test_list_diagrams_filters_by_type
│   │     • test_get_diagram_returns_cards_and_relations
│   │     • test_get_diagram_not_found_returns_404
│   │     • test_update_diagram_name
│   │     • test_delete_diagram_returns_204
│   │     • test_delete_diagram_cascades_to_diagram_cards
│   │     • test_delete_diagram_does_not_delete_repository_cards
│   │     • test_duplicate_diagram_creates_copy_with_positions
│   │     • test_duplicate_diagram_does_not_copy_cards
│   ├── Task 2: Implement diagram CRUD router
│   │   - File: app/plugins/uml/router.py
│   │   - Endpoints:
│   │     • POST   /api/uml-diagrams
│   │     • GET    /api/uml-diagrams
│   │     • GET    /api/uml-diagrams/:id
│   │     • PATCH  /api/uml-diagrams/:id
│   │     • DELETE /api/uml-diagrams/:id
│   │     • POST   /api/uml-diagrams/:id/duplicate
│   │   - Dependencies: Checkpoint 1.2 (models), Checkpoint 1.3 (schemas)
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_router_diagrams.py — all 14 tests pass
│       - Run: curl POST /api/uml-diagrams with valid JSON — 201 response
│       - Run: curl GET /api/uml-diagrams — returns list
```

### Checkpoint 1.5: Diagram-Card Management API

```
├── Checkpoint 1.5: Diagram-Card Management API
│   ├── Task 1: Write tests for diagram-card management
│   │   - File: app/plugins/uml/tests/test_router_diagram_cards.py
│   │   - Test cases:
│   │     • test_add_card_to_diagram_returns_201
│   │     • test_add_card_with_position
│   │     • test_add_duplicate_card_returns_409
│   │     • test_add_card_nonexistent_diagram_returns_404
│   │     • test_remove_card_from_diagram_returns_204
│   │     • test_remove_card_does_not_delete_repository_card
│   │     • test_update_card_position
│   │     • test_update_card_position_nonexistent_returns_404
│   ├── Task 2: Implement diagram-card management endpoints
│   │   - File: app/plugins/uml/router.py (extend)
│   │   - Endpoints:
│   │     • POST   /api/uml-diagrams/:id/cards
│   │     • DELETE /api/uml-diagrams/:id/cards/:card_id
│   │     • PATCH  /api/uml-diagrams/:id/cards/:card_id
│   │   - Dependencies: Checkpoint 1.4
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_router_diagram_cards.py — all 8 tests pass
│       - Full Phase 1 verification: pytest app/plugins/uml/tests/ — ALL tests pass
```

### Checkpoint 1.6: RBAC Permissions

```
└── Checkpoint 1.6: RBAC Permissions
    ├── Task 1: Write tests for permission enforcement
    │   - File: app/plugins/uml/tests/test_permissions.py
    │   - Test cases:
    │     • test_create_diagram_requires_create_permission
    │     • test_view_diagram_requires_view_permission
    │     • test_edit_diagram_requires_edit_permission
    │     • test_delete_diagram_requires_delete_permission
    │     • test_unauthenticated_request_returns_401
    │     • test_wrong_workspace_returns_403
    ├── Task 2: Implement permission definitions and middleware
    │   - File: app/plugins/uml/permissions.py
    │   - Constants: UML_PERMISSIONS list
    │   - File: app/plugins/uml/router.py (add permission decorators)
    │   - Dependencies: Checkpoint 1.4, 1.5
    └── Verification:
        - Run: pytest app/plugins/uml/tests/test_permissions.py — all 6 tests pass
        - PHASE 1 COMPLETE: Run full test suite — all tests green
        - Total test count: ~45 tests
```

---

## Phase 2: PlantUML Assembler & Export Pipeline

### Checkpoint 2.1: Assembler Core — Happy Path

```
Phase 2: PlantUML Assembler & Export Pipeline
├── Checkpoint 2.1: Assembler Core — Happy Path
│   ├── Task 1: Write assembler unit tests (happy path)
│   │   - File: app/plugins/uml/tests/test_assembler.py
│   │   - Test cases:
│   │     • test_assemble_empty_diagram_returns_startuml_enduml
│   │     • test_assemble_single_class_card
│   │     • test_assemble_class_with_stereotype_and_color
│   │     • test_assemble_interface_card
│   │     • test_assemble_abstract_class_card
│   │     • test_assemble_component_card
│   │     • test_assemble_package_card
│   │     • test_assemble_actor_card
│   │     • test_assemble_single_relation_implements
│   │     • test_assemble_single_relation_extends
│   │     • test_assemble_all_arrow_types (6 types)
│   │     • test_assemble_relation_with_label
│   │     • test_assemble_full_diagram_3_cards_2_relations
│   │     • test_assemble_includes_title
│   │     • test_assemble_includes_skinparam_defaults
│   │     • test_assemble_custom_skinparam_overrides_defaults
│   ├── Task 2: Implement assembler service
│   │   - File: app/plugins/uml/services/assembler.py
│   │   - Functions:
│   │     • assemble_plantuml(diagram, skinparam=None) -> str
│   │     • _assemble_card_line(card, card_type) -> str | None
│   │     • _assemble_relation_line(rel, rel_type) -> str | None
│   │   - Dependencies: Checkpoint 1.2 (models)
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_assembler.py — all 16 tests pass
│       - Manually inspect generated PlantUML text for correctness
```

### Checkpoint 2.2: Assembler — Edge Cases & Sanitization

```
├── Checkpoint 2.2: Assembler — Edge Cases & Sanitization
│   ├── Task 1: Write edge case + sanitization tests
│   │   - File: app/plugins/uml/tests/test_assembler.py (extend)
│   │   - Test cases:
│   │     • test_sanitize_empty_name_returns_unnamed
│   │     • test_sanitize_name_with_double_quotes_escaped
│   │     • test_sanitize_name_with_single_quotes_preserved
│   │     • test_sanitize_name_with_newlines_stripped
│   │     • test_sanitize_name_with_emoji_preserved
│   │     • test_sanitize_name_with_startuml_stripped
│   │     • test_sanitize_name_with_enduml_stripped
│   │     • test_sanitize_name_with_include_stripped
│   │     • test_sanitize_name_over_255_chars_truncated
│   │     • test_assemble_card_null_keyword_skipped_warning_logged
│   │     • test_assemble_card_null_stereotype_omitted
│   │     • test_assemble_card_null_color_omitted
│   │     • test_assemble_relation_null_arrow_skipped_warning_logged
│   │     • test_assemble_disconnected_nodes_renders_nodes_only
│   │     • test_assemble_cyclic_relations_no_error
│   │     • test_assemble_relation_only_includes_cards_in_diagram
│   ├── Task 2: Implement sanitize_card_name() and edge case handling
│   │   - File: app/plugins/uml/services/assembler.py (extend)
│   │   - Functions:
│   │     • sanitize_card_name(name) -> str
│   │     • get_relations_between(card_ids, session) -> list
│   │   - Dependencies: Checkpoint 2.1
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_assembler.py — all 32 tests pass
│       - Cumulative: 32 assembler tests + Phase 1 tests
```

### Checkpoint 2.3: Export Endpoint — .puml Format

```
├── Checkpoint 2.3: Export Endpoint — .puml Format
│   ├── Task 1: Write export endpoint tests (.puml)
│   │   - File: app/plugins/uml/tests/test_router_export.py
│   │   - Test cases:
│   │     • test_export_plantuml_returns_200_text_plain
│   │     • test_export_plantuml_content_starts_with_startuml
│   │     • test_export_plantuml_content_ends_with_enduml
│   │     • test_export_plantuml_contains_card_names
│   │     • test_export_plantuml_contains_relations
│   │     • test_export_plantuml_nonexistent_diagram_returns_404
│   │     • test_export_invalid_format_returns_400
│   │     • test_export_requires_export_permission
│   ├── Task 2: Implement .puml export endpoint
│   │   - File: app/plugins/uml/router.py (add export endpoint)
│   │   - Endpoint: GET /api/uml-diagrams/:id/export?format=plantuml
│   │   - Dependencies: Checkpoint 2.2 (assembler), Checkpoint 1.4 (router)
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_router_export.py — all 8 tests pass
│       - curl: GET /api/uml-diagrams/{id}/export?format=plantuml — valid PlantUML text
```

### Checkpoint 2.4: PlantUML Server Communication & SVG/PNG Export

```
├── Checkpoint 2.4: PlantUML Server Communication & SVG/PNG Export
│   ├── Task 1: Write exporter service tests
│   │   - File: app/plugins/uml/tests/test_exporter.py
│   │   - Test cases:
│   │     • test_render_svg_calls_plantuml_server
│   │     • test_render_svg_returns_valid_svg (contains <svg> tag)
│   │     • test_render_png_returns_valid_png (PNG header bytes)
│   │     • test_render_svg_server_down_raises_service_unavailable
│   │     • test_render_svg_server_timeout_raises_service_unavailable
│   │     • test_render_with_plantuml_disabled_raises_service_unavailable
│   │     • test_render_respects_timeout_config
│   │   - Fixtures: mock PlantUML server responses using httpx_mock or responses
│   ├── Task 2: Implement exporter service
│   │   - File: app/plugins/uml/services/exporter.py
│   │   - Functions:
│   │     • render_diagram(plantuml_text, format) -> bytes
│   │     • _post_to_plantuml_server(text, format) -> bytes
│   │     • check_server_health() -> bool
│   │   - Dependencies: Checkpoint 2.3
│   ├── Task 3: Write SVG/PNG export endpoint tests
│   │   - File: app/plugins/uml/tests/test_router_export.py (extend)
│   │   - Test cases:
│   │     • test_export_svg_returns_200_image_svg_xml
│   │     • test_export_png_returns_200_image_png
│   │     • test_export_svg_server_down_returns_503
│   │     • test_export_png_server_down_returns_503
│   │     • test_export_svg_contains_diagram_elements
│   ├── Task 4: Extend export endpoint for SVG/PNG
│   │   - File: app/plugins/uml/router.py (extend export endpoint)
│   │   - Dependencies: Task 2
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_exporter.py — all 7 tests pass
│       - Run: pytest app/plugins/uml/tests/test_router_export.py — all 13 tests pass
│       - Integration: start PlantUML Docker container, curl SVG export — valid SVG returned
```

### Checkpoint 2.5: Batch Export & Rate Limiting

```
└── Checkpoint 2.5: Batch Export & Rate Limiting
    ├── Task 1: Write batch export tests
    │   - File: app/plugins/uml/tests/test_router_export.py (extend)
    │   - Test cases:
    │     • test_batch_export_returns_zip
    │     • test_batch_export_zip_contains_correct_file_count
    │     • test_batch_export_zip_filenames_match_diagram_names
    │     • test_batch_export_empty_ids_returns_400
    │     • test_batch_export_nonexistent_id_skipped_with_warning
    │     • test_rate_limit_exceeded_returns_429
    ├── Task 2: Implement batch export endpoint + rate limiting
    │   - File: app/plugins/uml/router.py (add batch endpoint, rate limiter)
    │   - Endpoint: GET /api/uml-diagrams/export-batch?ids=...&format=svg
    │   - Dependencies: Checkpoint 2.4
    └── Verification:
        - Run: pytest app/plugins/uml/tests/test_router_export.py — all 19 tests pass
        - PHASE 2 COMPLETE: Run full test suite — all tests green
        - Total test count: ~96 tests
```

---

## Phase 3: Frontend — Canvas Core

### Checkpoint 3.1: API Client & Hooks

```
Phase 3: Frontend — Canvas Core
├── Checkpoint 3.1: API Client & Hooks
│   ├── Task 1: Write tests for API client functions
│   │   - File: src/plugins/uml/__tests__/umlApi.test.ts
│   │   - Test cases:
│   │     • test_fetchDiagrams_calls_correct_endpoint
│   │     • test_fetchDiagram_returns_cards_and_relations
│   │     • test_createDiagram_sends_correct_payload
│   │     • test_addCardToDiagram_sends_position
│   │     • test_updateCardPosition_sends_patch
│   │     • test_exportDiagram_handles_all_formats
│   │     • test_api_error_throws_with_status_code
│   │   - Mock: MSW (Mock Service Worker) or jest.mock for fetch
│   ├── Task 2: Implement API client
│   │   - File: src/plugins/uml/api/umlApi.ts
│   │   - Functions: fetchDiagrams, fetchDiagram, createDiagram,
│   │     deleteDiagram, addCardToDiagram, removeCardFromDiagram,
│   │     updateCardPosition, exportDiagram, batchExportDiagrams
│   │   - Dependencies: None
│   ├── Task 3: Write tests for custom hooks
│   │   - File: src/plugins/uml/__tests__/useDiagram.test.ts
│   │   - Test cases:
│   │     • test_useDiagram_fetches_on_mount
│   │     • test_useDiagram_returns_loading_state
│   │     • test_useDiagram_returns_error_on_fetch_failure
│   │     • test_useDiagram_returns_cards_and_relations
│   ├── Task 4: Implement custom hooks
│   │   - Files:
│   │     • src/plugins/uml/hooks/useDiagram.ts
│   │     • src/plugins/uml/hooks/useExport.ts
│   │   - Dependencies: Task 2
│   └── Verification:
│       - Run: npx jest src/plugins/uml/__tests__/umlApi.test.ts — all 7 tests pass
│       - Run: npx jest src/plugins/uml/__tests__/useDiagram.test.ts — all 4 tests pass
```

### Checkpoint 3.2: UML Toolbox Sidebar

```
├── Checkpoint 3.2: UML Toolbox Sidebar
│   ├── Task 1: Write RTL tests for UmlToolboxSidebar
│   │   - File: src/plugins/uml/__tests__/UmlToolboxSidebar.test.tsx
│   │   - Test cases:
│   │     • test_renders_all_UML_card_types
│   │     • test_does_not_render_non_UML_types
│   │     • test_each_type_has_draggable_attribute
│   │     • test_onDragStart_sets_card_type_id_in_dataTransfer
│   │     • test_shows_loading_spinner_while_fetching
│   │     • test_shows_error_message_on_fetch_failure
│   ├── Task 2: Implement UmlToolboxSidebar
│   │   - File: src/plugins/uml/components/UmlToolboxSidebar.tsx
│   │   - Dependencies: Checkpoint 3.1 (API client)
│   └── Verification:
│       - Run: npx jest src/plugins/uml/__tests__/UmlToolboxSidebar.test.tsx — all 6 pass
```

### Checkpoint 3.3: Custom Node & Edge Components

```
├── Checkpoint 3.3: Custom Node & Edge Components
│   ├── Task 1: Write RTL tests for UmlNode
│   │   - File: src/plugins/uml/__tests__/UmlNode.test.tsx
│   │   - Test cases:
│   │     • test_renders_card_name_as_label
│   │     • test_class_node_has_solid_border
│   │     • test_interface_node_has_dashed_border
│   │     • test_abstract_node_has_italic_label
│   │     • test_component_node_shows_component_icon
│   │     • test_double_click_enters_edit_mode
│   │     • test_blur_exits_edit_mode_and_calls_onLabelChange
│   │     • test_enter_key_exits_edit_mode
│   │     • test_escape_key_cancels_edit
│   ├── Task 2: Implement UmlNode component
│   │   - File: src/plugins/uml/components/UmlNode.tsx
│   │   - Dependencies: None (pure component)
│   ├── Task 3: Write RTL tests for UmlEdge
│   │   - File: src/plugins/uml/__tests__/UmlEdge.test.tsx
│   │   - Test cases:
│   │     • test_renders_relation_label
│   │     • test_renders_correct_arrow_style_per_type
│   │     • test_click_label_opens_type_picker (stub)
│   ├── Task 4: Implement UmlEdge component
│   │   - File: src/plugins/uml/components/UmlEdge.tsx
│   │   - Dependencies: None (pure component)
│   └── Verification:
│       - Run: npx jest src/plugins/uml/__tests__/UmlNode.test.tsx — all 9 pass
│       - Run: npx jest src/plugins/uml/__tests__/UmlEdge.test.tsx — all 3 pass
```

### Checkpoint 3.4: Canvas — Drag-Drop & Connect

```
├── Checkpoint 3.4: Canvas — Drag-Drop & Connect
│   ├── Task 1: Write tests for canvas event hooks
│   │   - File: src/plugins/uml/__tests__/useCanvasEvents.test.ts
│   │   - Test cases:
│   │     • test_onDrop_calls_createCard_then_addToDiagram
│   │     • test_onDrop_rollback_on_createCard_failure
│   │     • test_onDrop_rollback_on_addToDiagram_failure
│   │     • test_onConnect_calls_createRelation
│   │     • test_onConnect_rollback_on_failure
│   │     • test_onNodeDragStop_calls_updatePosition
│   │     • test_onNodeDragStop_snaps_back_on_failure
│   │     • test_onLabelChange_calls_updateCard
│   │     • test_onLabelChange_reverts_on_failure
│   ├── Task 2: Implement canvas event hooks
│   │   - File: src/plugins/uml/hooks/useCanvasEvents.ts
│   │   - Dependencies: Checkpoint 3.1 (API client)
│   ├── Task 3: Write RTL tests for UmlCanvas
│   │   - File: src/plugins/uml/__tests__/UmlCanvas.test.tsx
│   │   - Test cases:
│   │     • test_renders_react_flow_with_nodes_from_diagram
│   │     • test_renders_edges_from_relations
│   │     • test_renders_toolbox_sidebar
│   │     • test_renders_zoom_controls
│   │     • test_shows_loading_state
│   │     • test_shows_error_state
│   ├── Task 4: Implement UmlCanvas component
│   │   - File: src/plugins/uml/components/UmlCanvas.tsx
│   │   - File: src/plugins/uml/pages/UmlCanvasEditor.tsx (page wrapper)
│   │   - Dependencies: All previous Checkpoint 3.x
│   └── Verification:
│       - Run: npx jest src/plugins/uml/__tests__/useCanvasEvents.test.ts — all 9 pass
│       - Run: npx jest src/plugins/uml/__tests__/UmlCanvas.test.tsx — all 6 pass
```

### Checkpoint 3.5: Dialogs — Delete & Relation Picker

```
├── Checkpoint 3.5: Dialogs — Delete & Relation Picker
│   ├── Task 1: Write RTL tests for UmlDeleteDialog
│   │   - File: src/plugins/uml/__tests__/UmlDeleteDialog.test.tsx
│   │   - Test cases:
│   │     • test_renders_both_options
│   │     • test_remove_from_diagram_calls_removeCard
│   │     • test_delete_from_repository_calls_deleteCard
│   │     • test_cancel_closes_dialog
│   │     • test_shows_card_name_in_dialog
│   ├── Task 2: Implement UmlDeleteDialog
│   │   - File: src/plugins/uml/components/UmlDeleteDialog.tsx
│   ├── Task 3: Write RTL tests for RelationTypePicker
│   │   - File: src/plugins/uml/__tests__/RelationTypePicker.test.tsx
│   │   - Test cases:
│   │     • test_renders_all_relation_types
│   │     • test_selecting_type_calls_onSelect
│   │     • test_cancel_closes_picker
│   ├── Task 4: Implement RelationTypePicker
│   │   - File: src/plugins/uml/components/RelationTypePicker.tsx
│   └── Verification:
│       - Run: npx jest src/plugins/uml/__tests__/UmlDeleteDialog.test.tsx — all 5 pass
│       - Run: npx jest src/plugins/uml/__tests__/RelationTypePicker.test.tsx — all 3 pass
```

### Checkpoint 3.6: Diagram List Page

```
└── Checkpoint 3.6: Diagram List Page
    ├── Task 1: Write RTL tests for UmlDiagramList
    │   - File: src/plugins/uml/__tests__/UmlDiagramList.test.tsx
    │   - Test cases:
    │     • test_renders_list_of_diagrams
    │     • test_shows_card_and_relation_count
    │     • test_create_button_opens_create_dialog
    │     • test_click_diagram_navigates_to_canvas
    │     • test_delete_button_shows_confirmation
    │     • test_empty_state_shown_when_no_diagrams
    ├── Task 2: Implement UmlDiagramList
    │   - File: src/plugins/uml/pages/UmlDiagramList.tsx
    │   - Dependencies: Checkpoint 3.1
    ├── Task 3: Register frontend plugin routes
    │   - File: src/plugins/uml/index.ts (plugin manifest with routes + navItems)
    │   - File: src/App.tsx or src/plugins/registry.ts (register UML plugin)
    └── Verification:
        - Run: npx jest src/plugins/uml/__tests__/UmlDiagramList.test.tsx — all 6 pass
        - PHASE 3 COMPLETE: Run full frontend test suite — all tests green
        - Total frontend tests: ~68 tests
```

---

## Phase 4: Integration, Export UI & Polish

### Checkpoint 4.1: Export UI Components

```
Phase 4: Integration, Export UI & Polish
├── Checkpoint 4.1: Export UI Components
│   ├── Task 1: Write RTL tests for UmlExportDropdown
│   │   - File: src/plugins/uml/__tests__/UmlExportDropdown.test.tsx
│   │   - Test cases:
│   │     • test_renders_three_format_options
│   │     • test_renders_copy_to_clipboard_option
│   │     • test_click_puml_triggers_download
│   │     • test_click_svg_triggers_download
│   │     • test_click_png_triggers_download
│   │     • test_copy_to_clipboard_copies_plantuml_text
│   │     • test_shows_error_toast_on_export_failure
│   │     • test_shows_loading_indicator_during_export
│   ├── Task 2: Implement UmlExportDropdown
│   │   - File: src/plugins/uml/components/UmlExportDropdown.tsx
│   │   - Dependencies: Checkpoint 3.1 (useExport hook)
│   └── Verification:
│       - Run: npx jest src/plugins/uml/__tests__/UmlExportDropdown.test.tsx — all 8 pass
```

### Checkpoint 4.2: Cross-View Consistency & Card Detail Panel

```
├── Checkpoint 4.2: Cross-View Consistency & Card Detail Panel
│   ├── Task 1: Write integration tests for cross-view consistency
│   │   - File: app/plugins/uml/tests/test_integration_cross_view.py
│   │   - Test cases:
│   │     • test_card_created_via_diagram_visible_in_cards_list_api
│   │     • test_card_renamed_via_diagram_reflects_in_cards_api
│   │     • test_card_deleted_from_repository_removed_from_diagram
│   │     • test_relation_created_via_diagram_visible_in_relations_api
│   ├── Task 2: Verify existing API integration (no new code expected — just tests)
│   │   - Dependencies: Phase 1 + Phase 2
│   ├── Task 3: Write RTL test for card detail panel integration
│   │   - File: src/plugins/uml/__tests__/UmlCanvas.test.tsx (extend)
│   │   - Test cases:
│   │     • test_click_node_opens_card_detail_panel
│   │     • test_card_detail_panel_shows_card_fields
│   ├── Task 4: Implement card detail panel trigger in UmlCanvas
│   │   - File: src/plugins/uml/components/UmlCanvas.tsx (extend onClick handler)
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_integration_cross_view.py — all 4 pass
│       - Run: npx jest src/plugins/uml/__tests__/UmlCanvas.test.tsx — all tests pass
```

### Checkpoint 4.3: Internationalization

```
├── Checkpoint 4.3: Internationalization
│   ├── Task 1: Write i18n validation tests
│   │   - File: src/plugins/uml/__tests__/i18n.test.ts
│   │   - Test cases:
│   │     • test_all_8_locale_files_exist
│   │     • test_all_locale_files_have_same_keys
│   │     • test_no_missing_keys_in_any_locale
│   │     • test_en_locale_has_all_required_keys (reference list)
│   │     • test_no_hardcoded_strings_in_components (scan .tsx files)
│   ├── Task 2: Create i18n locale files
│   │   - Files: src/plugins/uml/i18n/{en,de,fr,es,it,nl,pt,pl}.json
│   │   - Keys: ~15 strings (toolbox, dialogs, export, errors)
│   │   - Dependencies: None
│   ├── Task 3: Register i18n namespace in plugin
│   │   - File: src/plugins/uml/index.ts (extend to register i18n namespace)
│   └── Verification:
│       - Run: npx jest src/plugins/uml/__tests__/i18n.test.ts — all 5 pass
│       - Visual: render app in each locale, no [MISSING_KEY]
```

### Checkpoint 4.4: Auto-Layout (Should-Have)

```
└── Checkpoint 4.4: Auto-Layout (Should-Have)
    ├── Task 1: Write tests for auto-layout
    │   - File: src/plugins/uml/__tests__/useAutoLayout.test.ts
    │   - Test cases:
    │     • test_auto_layout_repositions_all_nodes
    │     • test_auto_layout_preserves_node_count
    │     • test_auto_layout_saves_new_positions_to_api
    │     • test_auto_layout_handles_empty_diagram
    ├── Task 2: Implement auto-layout hook
    │   - File: src/plugins/uml/hooks/useAutoLayout.ts
    │   - Library: dagre (npm install dagre @types/dagre)
    │   - Dependencies: Checkpoint 3.4
    ├── Task 3: Add auto-layout button to canvas toolbar
    │   - File: src/plugins/uml/components/UmlCanvas.tsx (extend)
    └── Verification:
        - Run: npx jest src/plugins/uml/__tests__/useAutoLayout.test.ts — all 4 pass
        - PHASE 4 COMPLETE: Run full test suite (backend + frontend)
        - Total test count: ~115 backend + ~85 frontend = ~200 tests
```

---

## Phase 5: End-to-End Testing & Performance

### Checkpoint 5.1: Backend Integration Test Suite

```
Phase 5: End-to-End Testing & Performance
├── Checkpoint 5.1: Backend Integration Test Suite
│   ├── Task 1: Write full workflow integration tests
│   │   - File: app/plugins/uml/tests/test_integration_workflow.py
│   │   - Test cases:
│   │     • test_full_workflow_create_diagram_add_cards_export_puml
│   │     • test_full_workflow_create_diagram_add_cards_export_svg
│   │     • test_full_workflow_duplicate_diagram_preserves_positions
│   │     • test_full_workflow_delete_diagram_cleans_up_junction
│   │     • test_full_workflow_card_appears_in_multiple_diagrams
│   │     • test_batch_export_zip_contains_valid_files
│   │     • test_export_100_node_diagram_under_3_seconds
│   │     • test_plantuml_server_down_graceful_degradation
│   │     • test_zero_code_extensibility_new_card_type_exports_correctly
│   ├── Task 2: Fix any issues found
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_integration_workflow.py — all 9 pass
│       - Performance: 100-node export < 3s (NFR-03)
```

### Checkpoint 5.2: Cypress E2E Test Suite

```
├── Checkpoint 5.2: Cypress E2E Test Suite
│   ├── Task 1: Write Cypress E2E tests
│   │   - File: cypress/e2e/uml/diagram_crud.cy.ts
│   │   - Test cases:
│   │     • test_create_new_diagram_from_list_page
│   │     • test_open_diagram_shows_canvas
│   │     • test_rename_diagram
│   │     • test_delete_diagram_removes_from_list
│   │   - File: cypress/e2e/uml/canvas_interactions.cy.ts
│   │   - Test cases:
│   │     • test_drag_class_from_toolbox_creates_node_and_card
│   │     • test_connect_two_nodes_creates_relation
│   │     • test_inline_rename_node_updates_card
│   │     • test_delete_node_remove_from_diagram_only
│   │     • test_delete_node_delete_from_repository
│   │     • test_node_drag_updates_position
│   │   - File: cypress/e2e/uml/export.cy.ts
│   │   - Test cases:
│   │     • test_export_puml_downloads_file
│   │     • test_export_svg_downloads_file
│   │     • test_export_dropdown_shows_all_options
│   │     • test_error_recovery_api_failure_shows_toast
│   ├── Task 2: Fix any issues found during E2E testing
│   └── Verification:
│       - Run: npx cypress run --spec "cypress/e2e/uml/**" — all 14 tests pass
```

### Checkpoint 5.3: Security & Permission E2E

```
├── Checkpoint 5.3: Security & Permission E2E
│   ├── Task 1: Write security tests
│   │   - File: app/plugins/uml/tests/test_security.py
│   │   - Test cases:
│   │     • test_plantuml_injection_startuml_in_card_name_sanitized
│   │     • test_plantuml_injection_include_in_card_name_sanitized
│   │     • test_export_without_permission_returns_403
│   │     • test_cross_workspace_access_returns_403
│   │     • test_rate_limit_on_export_enforced
│   │     • test_unauthenticated_access_returns_401
│   ├── Task 2: Fix any security issues found
│   └── Verification:
│       - Run: pytest app/plugins/uml/tests/test_security.py — all 6 pass
```

### Checkpoint 5.4: Performance Benchmarks

```
└── Checkpoint 5.4: Performance Benchmarks
    ├── Task 1: Write performance benchmark tests
    │   - File: app/plugins/uml/tests/test_performance.py
    │   - Test cases:
    │     • test_export_100_nodes_under_3_seconds
    │     • test_api_response_under_200ms_p95
    │     • test_diagram_load_200_cards_response_time
    │   - File: src/plugins/uml/__tests__/performance.test.tsx
    │   - Test cases:
    │     • test_canvas_renders_200_nodes_within_2_seconds
    ├── Task 2: Optimize any failing benchmarks
    └── Verification:
        - PHASE 5 COMPLETE: ALL tests pass
        - Coverage: > 85% (run: pytest --cov=app/plugins/uml)
        - Total test count: ~230 tests
```

---

## Phase 6: Docker Deployment & Documentation

### Checkpoint 6.1: Docker Compose & Environment Config

```
Phase 6: Docker Deployment & Documentation
├── Checkpoint 6.1: Docker Compose & Environment Config
│   ├── Task 1: Write deployment verification tests
│   │   - File: app/plugins/uml/tests/test_deployment.py
│   │   - Test cases:
│   │     • test_plantuml_server_health_check_passes
│   │     • test_plantuml_server_not_accessible_from_host_external
│   │     • test_env_vars_loaded_correctly
│   │     • test_plugin_disabled_routes_not_registered
│   ├── Task 2: Update Docker Compose
│   │   - File: docker-compose.yml (add plantuml service with profile)
│   │   - File: .env.example (add PLANTUML_* + ENABLED_PLUGINS vars)
│   │   - Dependencies: None
│   └── Verification:
│       - Run: docker compose --profile uml up — all services healthy
│       - Run: curl http://localhost:8180 — PlantUML responds
│       - Run: curl http://<external_ip>:8180 — connection refused (internal only)
```

### Checkpoint 6.2: Documentation & Final Validation

```
└── Checkpoint 6.2: Documentation & Final Validation
    ├── Task 1: Write API documentation
    │   - File: docs/plugins/uml/API.md
    │   - Content: All endpoints with request/response examples
    ├── Task 2: Write user guide
    │   - File: docs/plugins/uml/USER_GUIDE.md
    │   - Content: How to create diagrams, export, add types
    ├── Task 3: Write admin guide
    │   - File: docs/plugins/uml/ADMIN_GUIDE.md
    │   - Content: PlantUML server config, monitoring, troubleshooting
    ├── Task 4: Update OpenAPI spec
    │   - File: openapi.yaml or auto-generated from FastAPI
    ├── Task 5: Final smoke test
    │   - Manual: Full workflow on staging environment
    │   - Checklist:
    │     □ Create diagram
    │     □ Add 5 cards via drag-drop
    │     □ Connect cards
    │     □ Rename a card inline
    │     □ Export .puml — valid syntax
    │     □ Export SVG — renders correctly
    │     □ Delete diagram
    │     □ Verify plugin disable works
    └── Verification:
        - ALL PHASES COMPLETE
        - All ~230 tests pass
        - Coverage > 85%
        - All 14 acceptance criteria from original spec verified
        - Documentation complete
```

---

## Dependency Graph (Summary)

```
Phase 1: Plugin Skeleton & DB
  1.1 Plugin Infrastructure ──────────────┐
  1.2 DB Models & Migration ──────────────┤
  1.3 Seed Data & Schemas ────────────────┤ (depends on 1.2)
  1.4 Diagram CRUD API ──────────────────┤ (depends on 1.2, 1.3)
  1.5 Diagram-Card API ──────────────────┤ (depends on 1.4)
  1.6 RBAC Permissions ──────────────────┘ (depends on 1.4, 1.5)
                    │
         ┌─────────┴──────────┐
         ▼                    ▼
Phase 2: Assembler       Phase 3: Canvas
  2.1 Happy Path           3.1 API Client & Hooks
  2.2 Edge Cases           3.2 Toolbox Sidebar
  2.3 .puml Export         3.3 Node & Edge
  2.4 SVG/PNG Export       3.4 Drag-Drop & Connect
  2.5 Batch Export         3.5 Dialogs
         │                 3.6 Diagram List
         └─────────┬──────────┘
                   ▼
Phase 4: Integration & Polish
  4.1 Export UI
  4.2 Cross-View Consistency
  4.3 i18n
  4.4 Auto-Layout
                   │
                   ▼
Phase 5: E2E Testing & Performance
  5.1 Backend Integration
  5.2 Cypress E2E
  5.3 Security
  5.4 Performance
                   │
                   ▼
Phase 6: Deployment & Docs
  6.1 Docker & Config
  6.2 Documentation & Final Validation
```

**Phase 2 and Phase 3 can run in parallel** after Phase 1 completes — they have no mutual dependencies. Phase 4 requires both Phase 2 and Phase 3.

---

## Cumulative Test Count by Phase

| Phase | New Tests | Cumulative | Backend | Frontend | E2E |
|-------|-----------|-----------|---------|----------|-----|
| Phase 1 | ~45 | 45 | 45 | 0 | 0 |
| Phase 2 | ~51 | 96 | 96 | 0 | 0 |
| Phase 3 | ~68 | 164 | 96 | 68 | 0 |
| Phase 4 | ~21 | 185 | 100 | 85 | 0 |
| Phase 5 | ~33 | 218 | 118 | 86 | 14 |
| Phase 6 | ~4 | 222 | 122 | 86 | 14 |

**Target: >85% code coverage, ~222 automated tests**

---

## Acceptance Criteria Cross-Reference

| Original AC | Verified In | Phase |
|-------------|------------|-------|
| AC-01: Drag creates card | Cypress E2E (5.2) + RTL (3.4) | 3, 5 |
| AC-02: Connect creates relation | Cypress E2E (5.2) + RTL (3.4) | 3, 5 |
| AC-03: Rename updates card | Cypress E2E (5.2) + RTL (3.3) | 3, 5 |
| AC-04: Delete dual semantics | RTL (3.5) + Cypress (5.2) | 3, 5 |
| AC-05: Export .puml valid | Unit (2.1, 2.2) + Integration (5.1) | 2, 5 |
| AC-06: Export SVG valid | Unit (2.4) + Integration (5.1) | 2, 5 |
| AC-07: Zero-code extensibility | Integration (5.1: test_zero_code_extensibility) | 5 |
| AC-08: Graceful degradation | Unit (2.4) + Integration (5.1) | 2, 5 |
| AC-09: Cross-view consistency | Integration (4.2) | 4 |
| AC-10: 200 nodes at 60fps | Performance (5.4) | 5 |
| AC-11: i18n 8 locales | Unit (4.3) | 4 |
| AC-12: PlantUML internal only | Deployment (6.1) | 6 |
| AC-13: Batch export ZIP | Unit (2.5) + Integration (5.1) | 2, 5 |
| AC-14: NULL keyword skipped | Unit (2.2) | 2 |

---

# Appendix A: Plugin Manifest Schema

```python
# app/plugins/base.py

from abc import ABC, abstractmethod
from fastapi import FastAPI

class PluginBase(ABC):
    name: str                    # Unique plugin identifier (kebab-case)
    version: str                 # Semver
    description: str             # Human-readable description
    dependencies: list[str]      # Other plugin names this depends on
    
    @abstractmethod
    def register(self, app: FastAPI) -> None:
        """Register routes, permissions, seed data callbacks."""
        ...
    
    @abstractmethod
    def unregister(self, app: FastAPI) -> None:
        """Clean up on plugin disable."""
        ...
    
    def health_check(self) -> dict:
        """Optional health check. Default: always healthy."""
        return {"status": "ok"}
    
    def get_required_env_vars(self) -> list[str]:
        """List of required environment variables."""
        return []
```

---

# Appendix B: ERD Extension Walkthrough

This demonstrates how a coding agent would add ERD support after the UML plugin is built:

```
1. Create app/plugins/erd/ (copy structure from app/plugins/uml/)
2. Seed data: INSERT card_types with notation='ERD'
3. Seed data: INSERT relation_types with ERD arrows (||--o{, etc.)
4. Custom node: ErdEntityNode.tsx (rectangle with attribute compartments)
5. Custom assembler strategy: ErdAssemblerStrategy (entity keyword + field list)
6. Register plugin: ENABLED_PLUGINS=uml-diagrams,erd-diagrams
7. Done. ~2-3 days of work.
```

No changes to: plugin registry, canvas infrastructure, export pipeline, RBAC, i18n framework, Docker setup.

---

# Appendix C: Dependency Graph

```
                    ┌──────────────────────────────┐
                    │  Core Turbo EA Platform       │
                    │  (cards, relations, auth,      │
                    │   workspaces, users)           │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │  Plugin Registry              │
                    │  (app/plugins/__init__.py)     │
                    └──────────┬───────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼──────┐ ┌──────▼─────┐  ┌───────▼──────┐
     │  UML Plugin   │ │ ERD Plugin │  │ Future Plugin│
     │  (v1.0)       │ │ (v1.0)     │  │              │
     └───────────────┘ └────────────┘  └──────────────┘
              │
     ┌────────┼──────────────┐
     │        │              │
┌────▼───┐ ┌─▼──────┐ ┌────▼────┐
│Models  │ │Router  │ │Services │
│        │ │        │ │         │
│Diagram │ │CRUD    │ │Assembler│
│DiagCard│ │Export  │ │Exporter │
└────────┘ │Batch   │ └─────────┘
           └────────┘
```

---

**Document Version**: 3.1 Agent-Ready
**Date**: May 24, 2026
**Adapted from**: v3.0 Comprehensive
**Purpose**: Plugin architecture analysis, extensibility assessment, and TDD-first implementation plan for AI coding agent

---

**END OF AGENT-READY SPECIFICATION**
