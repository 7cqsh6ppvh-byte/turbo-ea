# Agent: Backend Assembler Agent
# Purpose: PlantUML assembler and exporter

- Focus: PlantUML text generation and export pipeline
- Working Directory: app/plugins/uml/services/
- Primary Language: Python
- Test Command: pytest app/plugins/uml/tests/test_assembler.py app/plugins/uml/tests/test_exporter.py -v

## Responsibilities
- PlantUML assembler service (assemble_plantuml, sanitize_card_name)
- Exporter service (render_diagram, server communication)
- Export API endpoints (puml, svg, png, batch)
- Rate limiting and error handling