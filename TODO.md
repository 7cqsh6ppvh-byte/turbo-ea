# TODO

## Goal
Set up a production-like environment for Turbo EA using Docker Compose with demo data seeded.

## Tasks

### 1. Environment Preparation
- [x] Create `.env` file from `.env.example`
- [x] Configure `SEED_DEMO=true` in `.env`
- [x] Generate a secure `SECRET_KEY` for the `.env` file

### 2. Container Orchestration
- [x] Pull the latest Docker images from GHCR
- [x] Start the core containers (`db`, `backend`, `frontend`, `nginx`) in detached mode
- [x] Verify all containers are healthy and running
- [x] Create Playwright E2E tests for UML Plugin features (CRUD, Canvas, Export)
- [x] Create Playwright E2E tests for Main Application Dashboard features (Top Nav, Summary Cards, Charts, Workspace)
- [x] Create Playwright E2E tests for Inventory (Filters, Search, Export, Create Card)
- [x] Create Playwright E2E tests for Card Details (Tabs, Sections, History, Stakeholders)
- [x] Create Playwright E2E tests for Reports (Portfolio, Matrix, Lifecycle, Dependency, Data Quality)
- [x] Create Playwright E2E tests for GRC (Risks, Compliance Findings, Governance)
- [x] Create Playwright E2E tests for BPM (Process List, BPMN Modeler, Assessments)
- [x] Create Playwright E2E tests for PPM (Portfolio, Project Detail, Tasks, Cost, Risks)
- [x] Create Playwright E2E tests for TurboLens (Vendor Analysis, Duplicate Detection, Modernization)

### 3. Verification
- [x] Wait for database migrations and demo seeding to complete (monitor logs)
- [x] Verify the application is accessible via the configured host port (default 8920)

## Notes
- Using production-like images (GHCR) as requested.
- AI and MCP profiles are excluded per instructions.
- SEED_DEMO=true will populate the NexaTech Industries dataset on the first start.
