"""Conftest for UML plugin tests."""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

# Import the original conftest to get its fixtures
from tests.conftest import (  # noqa: F401
    admin_role,
    admin_user,
    app_card_type,
    auth_headers,
    create_card,
    create_card_type,
    create_relation,
    create_relation_type,
    create_role,
    create_stakeholder_role_def,
    create_user,
    db as _db,
)

@pytest.fixture
def db(_db):
    return _db

@pytest.fixture
async def app():
    """Minimal test app that includes both the v1 API and the UML plugin router."""
    from fastapi import FastAPI
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded

    from app.api.v1.router import api_router
    from app.config import settings
    from app.core.rate_limit import limiter
    from app.database import get_db, engine
    from app.api.deps import get_current_user
    from app.plugins.uml.router import router as uml_router
    from app.models.user import User

    async def _override_get_db() -> AsyncSession:
        yield _db

    async def _override_get_current_user() -> User:
        return admin_user

    test_app = FastAPI()
    test_app.state.limiter = limiter
    test_app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    test_app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    test_app.include_router(uml_router)
    test_app.dependency_overrides[get_db] = _override_get_db
    test_app.dependency_overrides[get_current_user] = _override_get_current_user
    
    # Run UML migrations for the test DB (using async runner via the engine)
    from app.plugins.uml.migrations import run_uml_migrations
    
    async with engine.connect() as conn:
        await conn.run_sync(run_uml_migrations)

    yield test_app
    test_app.dependency_overrides.clear()

@pytest.fixture
async def client(app) -> AsyncClient:
    """HTTP test client using the overridden 'app' fixture."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as c:
        yield c
