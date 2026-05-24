import httpx
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

PLANTUML_SERVER_URL = os.getenv("PLANTUML_SERVER_URL", "http://localhost:8180")
PLANTUML_TIMEOUT = float(os.getenv("PLANTUML_TIMEOUT", "10.0"))
PLANTUML_ENABLED = os.getenv("PLANTUML_ENABLED", "true").lower() == "true"

async def render_diagram(plantuml_text: str, fmt: str = "svg") -> bytes:
    """Send PlantUML text to server and return rendered image bytes."""
    if not PLANTUML_ENABLED:
        raise RuntimeError("PlantUML export is disabled")
        
    # PlantUML server expects the format in the path: /svg/, /png/, etc.
    # The text is typically passed as a POST body or encoded in URL
    # For long diagrams, POST to /svg/ is safer
    
    url = f"{PLANTUML_SERVER_URL.rstrip('/')}/{fmt}/"
    
    try:
        async with httpx.AsyncClient(timeout=PLANTUML_TIMEOUT) as client:
            response = await client.post(url, content=plantuml_text)
            response.raise_for_status()
            return response.content
    except httpx.HTTPError as e:
        logger.error(f"PlantUML server error: {e}")
        raise RuntimeError(f"PlantUML server unreachable or returned error: {e}")

async def check_server_health() -> bool:
    """Quick check if PlantUML server is up."""
    if not PLANTUML_ENABLED:
        return False
    try:
        # Check with a simple valid diagram
        await render_diagram("@startuml\n@enduml", "svg")
        return True
    except Exception:
        return False
