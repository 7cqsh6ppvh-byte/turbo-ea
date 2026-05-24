"""Plugin system for Turbo EA.

Plugins are discovered and loaded via ENABLED_PLUGINS environment variable.
Each plugin is a Python package under app/plugins/ that implements PluginBase.
"""

from __future__ import annotations

import importlib
import os
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from fastapi import FastAPI

from sqlalchemy.ext.asyncio import AsyncSession


class PluginBase(ABC):
    """Abstract base class for Turbo EA plugins."""

    name: str = ""
    version: str = "1.0.0"
    description: str = ""
    dependencies: list[str] = []

    @abstractmethod
    def register(self, app: FastAPI, db: AsyncSession | None = None) -> None:
        """Register routes, permissions, seed data callbacks with the app."""
        ...

    @abstractmethod
    def unregister(self, app: FastAPI) -> None:
        """Clean up on plugin disable."""
        ...

    def health_check(self) -> dict[str, Any]:
        """Optional health check. Default: always healthy."""
        return {"status": "ok"}

    def get_required_env_vars(self) -> list[str]:
        """List of required environment variables."""
        return []


class PluginRegistry:
    """Central plugin loader. Reads ENABLED_PLUGINS env var."""

    def __init__(self):
        self._plugins: dict[str, PluginBase] = {}

    def discover_and_load(self, app: FastAPI, db: AsyncSession | None = None) -> None:
        """Discover and load all enabled plugins."""
        enabled = os.getenv("ENABLED_PLUGINS", "").split(",")
        for plugin_name in enabled:
            plugin_name = plugin_name.strip()
            if not plugin_name:
                continue
            module_name = f"app.plugins.{plugin_name.replace('-', '_')}"
            try:
                module = importlib.import_module(module_name)
                plugin: PluginBase = module.Plugin()  # type: ignore
                plugin.register(app, db)
                self._plugins[plugin_name] = plugin
            except Exception as e:
                # Log but don't crash - plugins are optional
                import logging
                logging.getLogger(__name__).warning(
                    f"Failed to load plugin {plugin_name}: {e}"
                )

    def is_enabled(self, name: str) -> bool:
        """Check if a plugin is loaded."""
        return name in self._plugins

    def get_plugin(self, name: str) -> PluginBase | None:
        """Get a loaded plugin by name."""
        return self._plugins.get(name)


# Global registry instance
registry = PluginRegistry()