# Command: Phase 2-3 - Parallel Execution
# Description: Execute Phase 2 (Backend Assembler) and Phase 3 (Frontend Canvas) in parallel

--mode=parallel-agents
--agents=backend-assembler,frontend-core,frontend-ui
--prompt="Execute Phase 2 (Backend Assembler) and Phase 3 (Frontend Canvas) in parallel. Team Alpha: Backend Assembler - complete assembler service (32 tests) and export pipeline (26 tests). Team Beta: Frontend Core - complete API client/hooks, toolbox, nodes, edges, canvas (42 tests). Team Gamma: Frontend UI - complete dialogs, list page, export dropdown (21 tests). Total: ~99 tests. All teams depend on Phase 1 completion."
--worktree=feature/implementation