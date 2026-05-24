# PlantUML Plugin - Multi-Agent Orchestration Plan

**Version:** 1.0 | **Based on:** plantuml_integration_spec_v3_agent_ready.md

---

## Overview

This plan enables parallel execution by multiple agents managed by the Kilo orchestrator. Tasks are organized into phases with explicit dependencies and parallelizable work streams.

---

## Agent Roles & Responsibilities

| Agent | Focus Area | Working Directory | Primary Language |
|-------|------------|-------------------|------------------|
| `agent-backend-infra` | Plugin infrastructure, registry, migrations | `app/plugins/` | Python/FastAPI |
| `agent-backend-assembler` | PlantUML assembler, exporter, export API | `app/plugins/uml/services/` | Python |
| `agent-backend-api` | CRUD endpoints, diagram-card management, permissions | `app/plugins/uml/` | Python/FastAPI |
| `agent-frontend-core` | Canvas, nodes, edges, drag-drop, hooks | `src/plugins/uml/components/`, `src/plugins/uml/hooks/` | TypeScript/React |
| `agent-frontend-ui` | Dialogs, sidebar, list pages, export dropdown | `src/plugins/uml/components/`, `src/plugins/uml/pages/` | TypeScript/React |
| `agent-testing` | Integration tests, E2E, performance, security | `app/plugins/uml/tests/`, `cypress/e2e/uml/` | Python/Cypress |
| `agent-devops` | Docker, deployment, documentation | `docker-compose.yml`, `docs/` | YAML/Markdown |

---

## Execution Phases

### Phase 1: Foundation (Sequential)
**Duration:** 2-3 agent-days | **Agents:** `agent-backend-infra`

```
Task Group: 1.1 Plugin Infrastructure
├─ agent-backend-infra
│  ├─ Write test_plugin_registry.py (4 tests)
│  ├─ Implement PluginBase, PluginRegistry (app/plugins/__init__.py)
│  ├─ Implement UmlPlugin class (app/plugins/uml/plugin.py)
│  └─ Wire into app.main.py
└─ Verification: pytest test_plugin_registry.py (all pass)

Task Group: 1.2 Database Models & Migration
├─ agent-backend-infra
│  ├─ Write test_models.py (7 tests)
│  ├─ Implement UmlDiagram, UmlDiagramCard models
│  ├─ Write Alembic migration 001_uml_tables.py
│  ├─ Write test_migration.py (6 tests)
│  └─ Verification: alembic upgrade/downgrade
└─ Dependencies: 1.1 complete

Task Group: 1.3 Seed Data & Schemas
├─ agent-backend-infra
│  ├─ Write test_seed.py (5 tests)
│  ├─ Implement seed.py
│  ├─ Write test_schemas.py (7 tests)
│  ├─ Implement schemas.py
│  └─ Verification: pytest test_seed.py, test_schemas.py
└─ Dependencies: 1.2 complete

Task Group: 1.4-1.6 Diagram API + Permissions
├─ agent-backend-api
│  ├─ Write test_router_diagrams.py (14 tests)
│  ├─ Implement CRUD router endpoints
│  ├─ Write test_router_diagram_cards.py (8 tests)
│  ├─ Extend router with card management
│  ├─ Write test_permissions.py (6 tests)
│  ├─ Implement permissions.py, add decorators
│  └─ Verification: pytest tests/ (all 45 tests)
└─ Dependencies: 1.2, 1.3 complete
```

**Phase 1 Completion Gate:** All ~45 tests pass, plugin loads conditionally

---

### Phase 2 & 3: Parallel Execution (Maximum Parallelization)
**Duration:** 4-5 agent-days | **Agents:** Run in parallel after Phase 1

#### Team Alpha: Backend Assembler (agent-backend-assembler)
```
Task Group: 2.1-2.2 Assembler Core + Edge Cases
├─ Write test_assembler.py (32 tests)
├─ Implement assembler service (services/assembler.py)
│  ├─ assemble_plantuml()
│  ├─ sanitize_card_name()
│  └─ get_relations_between()
├─ Verification: pytest test_assembler.py (all 32 pass)

Task Group: 2.3-2.5 Export Pipeline
├─ Write test_router_export.py (19 tests)
├─ Write test_exporter.py (7 tests)
├─ Implement exporter service (services/exporter.py)
├─ Extend router with export endpoints
│  ├─ GET /api/uml-diagrams/:id/export?format=puml
│  ├─ GET /api/uml-diagrams/:id/export?format=svg
│  ├─ GET /api/uml-diagrams/:id/export?format=png
│  └─ GET /api/uml-diagrams/export-batch
├─ Verification: pytest test_exporter.py, test_router_export.py
└─ Dependencies: 2.2 complete
```

#### Team Beta: Frontend Canvas (agent-frontend-core + agent-frontend-ui)
```
Task Group: 3.1 API Client & Hooks
├─ agent-frontend-core
│  ├─ Write umlApi.test.ts (7 tests)
│  ├─ Implement api/umlApi.ts
│  ├─ Write useDiagram.test.ts (4 tests)
│  ├─ Implement hooks/useDiagram.ts, hooks/useExport.ts
│  └─ Verification: npx jest umlApi.test.ts, useDiagram.test.ts

Task Group: 3.2-3.4 Canvas Core
├─ agent-frontend-core
│  ├─ Write UmlToolboxSidebar.test.tsx (6 tests)
│  ├─ Implement UmlToolboxSidebar.tsx
│  ├─ Write UmlNode.test.tsx (9 tests)
│  ├─ Implement components/UmlNode.tsx
│  ├─ Write UmlEdge.test.tsx (3 tests)
│  ├─ Implement components/UmlEdge.tsx
│  ├─ Write useCanvasEvents.test.ts (9 tests)
│  ├─ Implement hooks/useCanvasEvents.ts
│  ├─ Write UmlCanvas.test.tsx (6 tests)
│  └─ Implement components/UmlCanvas.tsx, pages/UmlCanvasEditor.tsx
└─ Dependencies: 3.1 complete

Task Group: 3.5-3.6 UI Polish
├─ agent-frontend-ui
│  ├─ Write UmlDeleteDialog.test.tsx (5 tests)
│  ├─ Implement components/UmlDeleteDialog.tsx
│  ├─ Write RelationTypePicker.test.tsx (3 tests)
│  ├─ Implement components/RelationTypePicker.tsx
│  ├─ Write UmlDiagramList.test.tsx (6 tests)
│  ├─ Implement pages/UmlDiagramList.tsx
│  ├─ Write UmlExportDropdown.test.tsx (8 tests)
│  ├─ Implement components/UmlExportDropdown.tsx
│  ├─ Implement src/plugins/uml/index.ts (plugin manifest)
│  └─ Verification: npx jest (all 68 frontend tests)
```

**Phase 2+3 Completion Gate:** ~96 backend + ~68 frontend = ~164 tests pass

---

### Phase 4: Integration & Polish (Parallelizable Components)
**Duration:** 2 agent-days | **Agents:** Mixed

```
Task Group: 4.1-4.2 Integration
├─ agent-testing
│  ├─ Write test_integration_cross_view.py (4 tests)
│  ├─ Implement card detail panel trigger
│  └─ Verification: pytest test_integration_cross_view.py

Task Group: 4.3 Internationalization
├─ agent-devops
│  ├─ Write i18n.test.ts (5 tests)
│  ├─ Create i18n locale files (8 locales)
│  ├─ Extend plugin index.ts for i18n registration
│  └─ Verification: npx jest i18n.test.ts, visual validation

Task Group: 4.4 Auto-Layout (Should-Have)
├─ agent-frontend-core
│  ├─ Write useAutoLayout.test.ts (4 tests)
│  ├─ Implement hooks/useAutoLayout.ts (dagre)
│  ├─ Add button to UmlCanvas.tsx
│  └─ Verification: npx jest useAutoLayout.test.ts
```

---

### Phase 5: Testing & Performance (Sequential but Fast)
**Duration:** 1-2 agent-days | **Agent:** agent-testing

```
Task Group: 5.1-5.4 Comprehensive Testing
├─ agent-testing
│  ├─ Write test_integration_workflow.py (9 tests)
│  ├─ Write Cypress E2E tests (14 tests)
│  ├─ Write test_security.py (6 tests)
│  ├─ Write test_performance.py (4 tests)
│  ├─ Write performance.test.tsx (2 tests)
│  └─ Verification: 
│     ├─ pytest --cov=app/plugins/uml (>85% coverage)
│     └─ npx cypress run (14 tests pass)
```

---

### Phase 6: Deployment (Final)
**Duration:** 0.5 agent-day | **Agent:** agent-devops

```
Task Group: 6.1-6.2 Production Ready
├─ agent-devops
│  ├─ Write test_deployment.py (4 tests)
│  ├─ Update docker-compose.yml (plantuml profile)
│  ├─ Create .env.example with PLANTUML_* vars
│  ├─ Write docs/plugins/uml/API.md
│  ├─ Write docs/plugins/uml/USER_GUIDE.md
│  ├─ Write docs/plugins/uml/ADMIN_GUIDE.md
│  └─ Final smoke test checklist
```

---

## Parallel Execution Timeline (Critical Path)

```
Day 1: Phase 1.1-1.2 (agent-backend-infra)
Day 2: Phase 1.3-1.4 (agents-backend-infra, agent-backend-api)
Day 3: Phase 2.1-2.2 START, Phase 3.1-3.2 START
       ════════════════════════════════════════════════
       │         Phase 2 & 3 RUN IN PARALLEL         │
       ════════════════════════════════════════════════
Day 3-5: Phase 2.3-2.5 (agent-backend-assembler)
         Phase 3.3-3.6 (agent-frontend-core, agent-frontend-ui)
Day 6: Phase 4 (Mixed agents)
Day 7: Phase 5 (agent-testing)
Day 8: Phase 6 (agent-devops)
```

---

## Kilo Agent Definitions

Agent definitions are located in `.kilo/agent/`:

```
.kilo/agent/
├── backend-infra.md      # Plugin infrastructure agent
├── backend-assembler.md  # Assembler/exporter agent
├── backend-api.md        # CRUD API agent
├── frontend-core.md      # Canvas core agent
├── frontend-ui.md        # UI components agent
├── testing.md            # Integration/E2E testing agent
└── devops.md             # DevOps/documentation agent
```

---

## Kilo Commands

Execution commands are located in `.kilo/command/`:

```
.kilo/command/
├── phase-1.md            # Foundation (sequential)
├── phase-2-3.md          # Parallel execution (backend assembler + frontend)
├── phase-4.md            # Integration & polish
├── phase-5.md            # Testing & performance
└── phase-6.md            # Deployment & docs
```

---

## Kilo Orchestrator Commands

```bash
# Phase 1: Single agent execution
/kilo run phase-1

# Phase 2 & 3: Parallel agent execution  
/kilo run phase-2-3

# Phase 4-6: Sequential execution
/kilo run phase-4
/kilo run phase-5  
/kilo run phase-6
```

---

## Worktree Strategy

```
main/                       # Main branch
├── feature/plugin-infra/   # Phase 1 work (--worktree in phase-1.md)
├── feature/implementation/ # Phases 2-4 work (--worktree in phase-2-3.md, phase-4.md)
├── feature/testing/        # Phase 5 work (--worktree in phase-5.md)
└── feature/deployment/     # Phase 6 work (--worktree in phase-6.md)
```

---

## Test Verification Commands

```bash
# Backend tests
pytest app/plugins/uml/tests/ -v --cov=app/plugins/uml

# Frontend tests
npx jest src/plugins/uml/ --coverage

# E2E tests
npx cypress run --spec "cypress/e2e/uml/**"
```

---

## Success Criteria

- [ ] All ~222 tests pass
- [ ] Backend coverage >85%
- [ ] Frontend coverage >85%
- [ ] Cypress E2E: 14/14 pass
- [ ] Docker compose --profile uml up works
- [ ] All 14 acceptance criteria verified