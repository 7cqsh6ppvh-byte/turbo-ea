from alembic import context
from sqlalchemy import engine_from_config, pool
from app.config import settings
from app.plugins.uml.models import Base

config = context.config

def run_migrations_online():
    connectable = config.attributes.get("connection", None)
    if connectable is None:
        # Fallback for manual CLI usage
        from sqlalchemy import create_engine
        connectable = create_engine(settings.DATABASE_URL.replace("asyncpg", "psycopg2"))

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=Base.metadata,
            version_table="alembic_version_plugin_uml"
        )
        with context.begin_transaction():
            context.run_migrations()

run_migrations_online()
