import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { useState } from "react";
import { C4_ELEMENT_META, C4_LEVEL_COLORS, C4_DIAGRAM_TYPES, type C4DiagramTypeKey } from "./c4Shapes";
import type { C4Level } from "./types";

const LEVELS_ORDER: C4Level[] = ["C4:Context", "C4:Container", "C4:Component", "C4:Boundary"];

function toDisplayLabel(key: string): string {
  return key
    .replace("c4_", "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

interface Props {
  diagramType: C4DiagramTypeKey;
}

export function C4ElementPalette({ diagramType }: Props) {
  const [expanded, setExpanded] = useState<C4Level | false>("C4:Context");

  const allowedElements =
    C4_DIAGRAM_TYPES.find((dt) => dt.key === diagramType)?.allowedElements ?? [];

  const levelGroups = LEVELS_ORDER.map((level) => ({
    level,
    color: C4_LEVEL_COLORS[level],
    elements: Object.entries(C4_ELEMENT_META)
      .filter(([key, meta]) => meta.level === level && allowedElements.includes(key as never))
      .map(([key, meta]) => ({ key, meta })),
  })).filter((g) => g.elements.length > 0);

  if (diagramType === "c4-code") {
    return (
      <Box
        sx={{
          width: 220,
          height: "100%",
          borderRight: "1px solid rgba(0,0,0,0.12)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Code-level diagrams reference source code directly. Use the description field on Container elements to link to code repositories.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 220,
        height: "100%",
        overflowY: "auto",
        borderRight: "1px solid rgba(0,0,0,0.12)",
        flexShrink: 0,
      }}
    >
      {levelGroups.map(({ level, color, elements }) => (
        <Accordion
          key={level}
          expanded={expanded === level}
          onChange={(_, isExpanded) => setExpanded(isExpanded ? level : false)}
          disableGutters
          elevation={0}
          sx={{ "&:before": { display: "none" }, borderBottom: "1px solid rgba(0,0,0,0.08)" }}
        >
          <AccordionSummary sx={{ minHeight: 36, "& .MuiAccordionSummary-content": { my: 0.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "2px", background: color, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "11px" }}>
                {level.replace("C4:", "")}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1, pt: 0 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {elements.map(({ key }) => (
                <Chip
                  key={key}
                  label={toDisplayLabel(key)}
                  size="small"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("c4/element-type", key);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  sx={{
                    fontSize: "10px",
                    height: 22,
                    cursor: "grab",
                    background: `${color}cc`,
                    "&:hover": { background: color },
                  }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
