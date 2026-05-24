import os

from alembic.config import Config
from alembic import command
from app.config import settings

def run_uml_migrations(connection):
    """Run migrations for the UML plugin."""
    script_location = os.path.join(os.path.dirname(__file__), "migrations")
    ini_path = os.path.join(script_location, "alembic.ini")
    
    cfg = Config(ini_path)
    cfg.set_main_option("script_location", script_location)
    cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
    
    # Use a custom version table for the plugin
    cfg.attributes["connection"] = connection
    command.upgrade(cfg, "head")
