# Command: Phase 4 - Integration & Polish
# Description: Execute Phase 4 (Integration, i18n, auto-layout)

--mode=parallel-agents
--agents=testing,devops,frontend-core
--prompt="Execute Phase 4: Cross-view consistency integration, internationalization (8 locales), and auto-layout (optional). Complete test_integration_cross_view.py (4 tests), i18n files and validation (5 tests), and useAutoLayout hook (4 tests). Run after Phase 2-3 completes."
--worktree=feature/implementation