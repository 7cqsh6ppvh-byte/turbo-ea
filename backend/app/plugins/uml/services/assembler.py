import re
from typing import Optional

def sanitize_card_name(name: Optional[str]) -> str:
    """Sanitize card name for PlantUML to prevent syntax breakage or injection."""
    if not name:
        return "unnamed"
    
    # Strip dangerous keywords
    dangerous = ["@startuml", "@enduml", "!include"]
    for word in dangerous:
        name = name.replace(word, "")
        
    # Escape double quotes
    name = name.replace('"', '""')
    
    # Strip newlines
    name = name.replace("\n", " ").replace("\r", "")
    
    # Truncate
    return name[:255].strip()

def assemble_plantuml(diagram, skinparam: Optional[str] = None) -> str:
    """Assemble PlantUML text from a diagram model."""
    lines = ["@startuml", f'title "{sanitize_card_name(diagram.name)}"']
    
    # Default skinparams for a cleaner look
    lines.extend([
        "skinparam shadowing false",
        "skinparam packageStyle rectangle",
        "skinparam roundCorner 5",
    ])
    
    if skinparam:
        lines.append(skinparam)
        
    # Add Cards
    for diag_card in diagram.cards:
        card = diag_card.card
        ctype = card.type
        
        # We need the notation and plantuml columns from card_type
        # Assuming they are already on the model via the migration
        keyword = getattr(ctype, "plantuml_keyword", "class")
        stereotype = getattr(ctype, "plantuml_stereotype", None)
        color = getattr(ctype, "plantuml_color", None)
        
        line = f'{keyword} "{sanitize_card_name(card.name)}" as card_{card.id}'
        if stereotype:
            line += f" <<{stereotype}>>"
        if color:
            line += f" {color}"
            
        lines.append(line)
        
    # Add Relations (only between cards in this diagram)
    card_ids = {dc.card_id for dc in diagram.cards}
    # This logic might need a session or pre-loaded relations
    # For now, we assume relations are passed or handled by the caller
    # In a real implementation, we'd query relations where both source/target are in card_ids
    
    lines.append("@enduml")
    return "\n".join(lines)
