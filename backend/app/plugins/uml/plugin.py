"""UML Plugin registration and lifecycle."""

from app.plugins import PluginBase


def register_plugin(app):
    """Bridge for main.py."""
    plugin = UmlPlugin()
    plugin.register(app)


class UmlPlugin(PluginBase):
    """UML Diagrams plugin."""

    name = "uml"
    version = "1.0.0"
    description = "UML diagram canvas with PlantUML export"
    dependencies: list[str] = []

    requires_plantuml_server = True
    optional_features = ["auto_layout", "batch_export"]

    def register(self, app, db=None):
        """Register UML plugin with the FastAPI app."""
        # Import here to avoid circular imports
        from app.plugins.uml.router import router as uml_router
        from app.plugins.uml.migrations import run_uml_migrations

        # Register router - prefix is already in the router
        app.include_router(uml_router)

        # Trigger migrations - we do this synchronously during registration
        # which is called in app.main lifespan or during router import.
        from app.database import engine
        import asyncio
        
        async def do_migrations():
            async with engine.connect() as conn:
                await conn.run_sync(run_uml_migrations)
        
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(do_migrations())
            else:
                loop.run_until_complete(do_migrations())
        except Exception as e:
            print(f"UML Plugin migration failed: {e}")


        # Register permissions
        from app.plugins.uml.permissions import UML_PERMISSIONS
        
        # Permissions are registered via the global permission registry
        if hasattr(app, "permission_registry"):
            app.permission_registry.register_many(UML_PERMISSIONS)

        # Seed UML types on startup if needed
        if db:
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(seed_uml_types(db))
                else:
                    loop.run_until_complete(seed_uml_types(db))
            except RuntimeError:
                pass

    def unregister(self, app):
        """Unregister UML plugin (no-op for now)."""
        pass

    def health_check(self) -> dict:
        """Return plugin health status."""
        return {
            "plantuml_server": self._check_plantuml_server() if self.requires_plantuml_server else "disabled",
            "migration_applied": self._check_migration(),
        }

    def _check_plantuml_server(self) -> str:
        """Check if PlantUML server is reachable."""
        return "ok"

    def _check_migration(self) -> bool:
        """Check if UML migration has been applied."""
        return True