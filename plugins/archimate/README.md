# ArchiMate Plugin for Turbo EA

[![ArchiMate 3.2](https://img.shields.io/badge/ArchiMate-3.2-blue)](https://www.opengroup.org/archimate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A plugin that brings full ArchiMate 3.2 support to Turbo EA, enabling you to create, visualize, and exchange ArchiMate models within your enterprise architecture landscape.

## Overview

The ArchiMate plugin extends Turbo EA with:

- **61 ArchiMate element types** across 8 layers (Business, Application, Technology, Motivation, Strategy, Implementation & Migration, Physical, Composite)
- **11 relation types** following ArchiMate 3.2 conventions (Association, Composition, Aggregation, Realization, Assignment, Serving, Access, Influence, Triggering, Flow, Specialization)
- **Interactive diagram editor** with React Flow-based canvas, ArchiMate-shaped nodes, and auto-layout capabilities
- **AMEFF (ArchiMate Model Exchange File Format) import/export** for interoperability with Archi, Bizzdesign, and other tools
- **20 built-in viewpoints** for filtered diagram views (Organization, Business Process, Application Cooperation, Technology, Motivation, Strategy, Roadmap, etc.)

## Prerequisites

- Turbo EA installed and running (v1.29.0 or later)
- Admin access to the Turbo EA instance
- PostgreSQL database (configured via `.env` as per standard Turbo EA setup)

## Installation

### 1. Backend Setup

The plugin is included in the Turbo EA backend. No additional installation is required.

#### Database Migration

Run the database migration to add the `plugin_id` column to the metamodel tables:

```bash
cd backend
alembic upgrade head
```

This adds the `plugin_id` column to `card_types` and `relation_types` tables to track plugin-owned metamodel entries.

### 2. Enable the ArchiMate Module

Enable the module via the Admin Settings UI:

1. Navigate to **Admin → Settings**
2. Open the **ArchiMate** tab
3. Toggle **Enable ArchiMate** to ON

Or enable via environment variable for initial setup:

```bash
# Add to .env
SEED_ARCHIMATE=true  # Seeds demo ArchiMate data on startup
```

### 3. Seed Demo Data (Optional)

To seed the NexaTech Industries ArchiMate demo model:

```bash
# Add to .env and restart
SEED_DEMO=true
# or just ArchiMate demo
SEED_ARCHIMATE=true
```

This creates 30+ demo ArchiMate cards representing:

- Business Actors, Roles, Processes, and Services
- Application Components and Services (SAP S/4HANA, Salesforce CRM, etc.)
- Technology Nodes, Devices, and Systems
- Motivation elements (Goals, Drivers, Requirements)
- Strategy capabilities and value streams
- Composite groupings and viewpoints

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SEED_ARCHIMATE` | `false` | Seed ArchiMate demo data on startup |
| `MIGRATE_ARCHIMATE_UNIQUE` | `false` | Strip all non-ArchiMate data (dangerous — see Migration section) |

### Permissions

Two permissions control ArchiMate functionality:

| Permission | Key | Description |
|------------|-----|-------------|
| View ArchiMate | `archimate.view` | View ArchiMate diagrams and models |
| Manage ArchiMate | `archimate.manage` | Create/edit ArchiMate elements, import/export models |

By default, these are granted to:
- **Admin** role: Both permissions
- **Member** role: View only (when module is enabled)

## Usage

### Creating ArchiMate Diagrams

1. Navigate to **ArchiMate** in the main navigation
2. Click **New ArchiMate Diagram**
3. Name your diagram and click **Create**

### Working with Elements

The editor provides three tabs in the left sidebar:

- **Elements**: Browse and search existing EA cards (filtered to show only ArchiMate-compatible types when in ArchiMate mode)
- **Views**: Apply ArchiMate viewpoints to filter the diagram (Business Process, Application Cooperation, Technology, etc.)
- **Palette**: Drag ArchiMate element types onto the canvas to create new cards

### Relations

Create relations by:

1. Dragging from the Palette to create new elements
2. Connecting elements with the connection tool (click-and-drag from one node to another)
3. Selecting the appropriate ArchiMate relation type in the dialog

### AMEFF Import/Export

#### Export

From the diagram editor:
1. Click the **Export** button in the toolbar
2. Download the `.xml` file compliant with ArchiMate Model Exchange File Format 3.x

#### Import

From the ArchiMate gallery page:
1. Click **Import AMEFF**
2. Upload an ArchiMate 3.x XML file
3. Elements are created as `arch_*` typed cards with identifiers preserved in `attributes.ameff_identifier`

### Viewpoints

The plugin includes 20 standard ArchiMate viewpoints. Select from the **Views** tab to filter displayed elements by layer and aspect combinations.

## ArchiMate Layers and Elements

| Layer | Elements (examples) |
|-------|---------------------|
| **Business** | Business Actor, Business Role, Business Process, Business Function, Business Service, Business Object, Contract, Product |
| **Application** | Application Component, Application Interface, Application Service, Application Function, Data Object |
| **Technology** | Node, Device, System Software, Technology Service, Technology Interface, Artifact |
| **Motivation** | Stakeholder, Driver, Goal, Requirement, Constraint, Principle, Value |
| **Strategy** | Capability, Resource, Value Stream, Course of Action |
| **Implementation & Migration** | Work Package, Deliverable, Gap, Plateau |
| **Physical** | Equipment, Facility, Distribution Network, Material |
| **Composite** | Grouping, Location, Junction |

## Migration to ArchiMate-Only Mode

> **Warning**: This operation is irreversible and permanently deletes non-ArchiMate data.

To convert an instance to ArchiMate-only:

1. Back up your database
2. Navigate to **Admin → Settings → ArchiMate**
3. In the **Danger Zone** section, click **Run Migration**
4. Confirm the destructive action

This removes:
- All non-ArchiMate card types
- All non-ArchiMate relation types
- All cards whose type doesn't start with `arch_`
- All relations connecting non-ArchiMate cards

## Development

### Project Structure

```
turbo-ea/
├── archimate-lang/              # Langium grammar for ArchiMate DSL
│   ├── src/
│   │   ├── grammar/             # ArchiMate grammar definition
│   │   ├── codegen/             # Metamodel code generation
│   │   └── generated/           # Generated grammar artifacts
│   └── package.json
├── backend/
│   └── app/plugins/archimate/   # Backend plugin module
│       ├── __init__.py          # Empty (included in main.py)
│       ├── seed.py              # Metamodel definitions
│       ├── seed_demo.py         # Demo data
│       ├── ameff.py             # Import/export logic
│       └── migrate_unique.py    # Destructive migration
└── frontend/
    └── src/features/archimate/  # React components
        ├── ArchimateCanvas.tsx    # React Flow diagram canvas
        ├── ArchimateDiagramsPage.tsx
        ├── ArchimateDiagramEditor.tsx
        ├── ArchimateElementPalette.tsx
        ├── ArchimateElementsTree.tsx
        ├── ArchimateViewsTree.tsx
        ├── archimateNodes.tsx     # Node components
        ├── archimateEdges.tsx     # Edge handling
        ├── archimateShapes.ts     # Shape metadata
        └── archimateElkLayout.ts  # Auto-layout algorithm
```

### Building the Langium Grammar (optional)

If modifying the ArchiMate DSL grammar:

```bash
cd archimate-lang
npm install
npm run build        # Compile TypeScript
npm run generate     # Generate Langium artifacts
npm run codegen      # Generate metamodel definitions
npm test             # Run grammar tests
```

### Running Tests

```bash
# Backend unit tests
cd backend
pytest tests/api/test_archimate_migration.py
pytest tests/services/test_archimate_seed.py
pytest tests/services/test_archimate_seed_demo.py
pytest tests/services/test_archimate_ameff.py

# Frontend tests
cd frontend
npm run test:run -- src/features/archimate/

# E2E tests
cd e2e
npm test -- tests/archimate/
```

## API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/archimate-enabled` | Public | Check if ArchiMate module is enabled |
| PATCH | `/api/v1/archimate-enabled` | Admin | Enable/disable module |
| POST | `/api/v1/archimate/export` | `archimate.view` | Export ArchiMate cards as AMEFF XML |
| POST | `/api/v1/archimate/import` | `archimate.manage` | Import AMEFF XML |
| POST | `/api/v1/archimate-migrate-unique` | `archimate.manage` | Convert instance to ArchiMate-only |

## Troubleshooting

### ArchiMate cards don't appear in inventory

- Verify the module is enabled via **Admin → Settings → ArchiMate**
- Check that the card type key starts with `arch_` (e.g., `arch_ApplicationComponent`)
- Confirm your user has `archimate.view` permission

### Import fails with "Invalid AMEFF file"

- Ensure the XML file is valid ArchiMate 3.x format
- Check UTF-8 encoding
- Verify file size is under 10MB
- Run `SEED_DEMO=true` to ensure ArchiMate metamodel is seeded

### Migration removes too much data

The migration is intentionally destructive. If you need to preserve standard Turbo EA card types alongside ArchiMate, **do not run the migration**. Instead, use the standard metamodel toggle to hide/show types as needed.

## Credits

- ArchiMate element and relation definitions derived from **[bigArchiMate](https://github.com/borkdominik/bigArchiMate)** by Dominik Bork, MIT License
- AMEFF specification from **[The Open Group](https://www.opengroup.org/open-group-archimate-model-exchange-file-format)**
- Built with **[Langium](https://langium.org/)** DSL framework

## License

MIT License. See `LICENSE` file for details.

## Uninstallation

Since the ArchiMate plugin is integrated into Turbo EA core, "uninstall" means disabling the module and optionally cleaning up data.

### Disable the Module

1. Navigate to **Admin → Settings**
2. Open the **ArchiMate** tab
3. Toggle **Enable ArchiMate** to OFF
4. Refresh the page — ArchiMate cards will be hidden from the inventory and navigation

### Remove ArchiMate Data (Optional)

To delete all ArchiMate cards, relations, and diagram data:

**Via Admin UI:**
1. Go to **Admin → Settings → ArchiMate**
2. Click **Delete All ArchiMate Data** in the Danger Zone (if available)

**Via Database (advanced):**
```sql
-- Delete ArchiMate relations
DELETE FROM relations WHERE type LIKE 'arch_rel_%';

-- Delete ArchiMate cards
DELETE FROM cards WHERE type LIKE 'arch_%';

-- Delete ArchiMate card types (optional - they'll remain hidden)
DELETE FROM card_types WHERE plugin_id = 'archimate';

-- Delete ArchiMate relation types
DELETE FROM relation_types WHERE plugin_id = 'archimate';
```

**Via Reset (nuclear option):**
```bash
# Reset the entire database
RESET_DB=true docker compose up --build -d
```

## Plugin Location in Codebase

The ArchiMate plugin is built into Turbo EA and resides in three locations:

| Location | Purpose |
|----------|---------|
| `/backend/app/plugins/archimate/` | Python backend module containing metamodel seed, AMEFF import/export, and migration logic |
| `/frontend/src/features/archimate/` | React components for the diagram editor, canvas, and sidebar UI |
| `/archimate-lang/` | Langium-based DSL grammar and metamodel code generation (build-time only) |

### Backend Plugin Entry Points

The plugin is loaded automatically by `app/main.py` during startup:

- `seed_archimate_metamodel()` - Seeds card types, relation types, and translations
- `seed_archimate_demo()` - Seeds demo data (gated by `SEED_ARCHIMATE` env var)
- `migrate_archimate_unique()` - Destructive migration to ArchiMate-only mode

### Frontend Module Gate

The ArchiMate routes (`/archimate`, `/archimate/:id/edit`) are protected by the `ModuleGate` component which checks the `archimate_enabled` bootstrap setting before rendering.