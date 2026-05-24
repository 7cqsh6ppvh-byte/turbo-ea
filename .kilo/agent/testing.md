# Agent: Testing Agent
# Purpose: Integration, E2E, performance, security tests

- Focus: Comprehensive test coverage and validation
- Working Directory: app/plugins/uml/tests/, cypress/e2e/uml/
- Primary Language: Python/Cypress
- Test Command: pytest app/plugins/uml/tests/ -v --cov=app/plugins/uml && npx cypress run --spec "cypress/e2e/uml/**"

## Responsibilities
- Integration workflow tests
- Cypress E2E tests
- Security tests (injection, RBAC, rate limiting)
- Performance benchmarks
- CI validation