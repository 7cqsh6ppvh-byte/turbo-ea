# Command: Phase 1 - Foundation
# Description: Execute Phase 1 tasks (plugin infrastructure through permissions)

--mode=agent
--agent=backend-infra
--prompt="Execute Phase 1 of the PlantUML plugin: Plugin Infrastructure, Database Models & Migration, Seed Data & Schemas, and Diagram CRUD API. Follow the TDD approach specified in the spec. Create tests first, then implement. Verify all ~45 tests pass after each checkpoint."
--worktree=feature/plugin-infra