"""UML Diagrams plugin for Turbo EA.

Provides a canvas-based diagram editor with PlantUML export.
"""

from app.plugins.uml.plugin import UmlPlugin

__all__ = ["Plugin", "UmlPlugin"]
Plugin = UmlPlugin