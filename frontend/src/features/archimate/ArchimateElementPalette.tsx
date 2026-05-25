import { useState } from "react";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import type { ArchiMateLayer } from "./types";
import { ARCHIMATE_ELEMENT_META, ARCHIMATE_LAYER_COLORS } from "./archimateShapes";

const LAYERS_ORDER: ArchiMateLayer[] = [
  "Business",
  "Application",
  "Technology",
  "Motivation",
  "Strategy",
  "Implementation",
  "Physical",
  "Composite",
];

function toDisplayLabel(key: string): string {
  return key
    .replace("arch_", "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

interface Props {
  defaultExpandedLayer?: ArchiMateLayer;
}

export function ArchimateElementPalette({ defaultExpandedLayer = "Application" }: Props) {
  const [expanded, setExpanded] = useState<ArchiMateLayer | false>(defaultExpandedLayer);

  const handleChange = (layer: ArchiMateLayer) => (_: unknown, isExpanded: boolean) => {
    setExpanded(isExpanded ? layer : false);
  };

  const elementsByLayer = LAYERS_ORDER.map((layer) => ({
    layer,
    color: ARCHIMATE_LAYER_COLORS[layer],
    elements: Object.entries(ARCHIMATE_ELEMENT_META)
      .filter(([, meta]) => meta.layer === layer)
      .map(([key, meta]) => ({ key, meta })),
  }));

  return (
    <Box
      sx={{
        width: 240,
        height: "100%",
        overflowY: "auto",
        borderRight: "1px solid rgba(0,0,0,0.12)",
        flexShrink: 0,
      }}
    >
      {elementsByLayer.map(({ layer, color, elements }) => (
        <Accordion
          key={layer}
          expanded={expanded === layer}
          onChange={handleChange(layer)}
          disableGutters
          elevation={0}
          sx={{ "&:before": { display: "none" }, borderBottom: "1px solid rgba(0,0,0,0.08)" }}
        >
          <AccordionSummary sx={{ minHeight: 36, "& .MuiAccordionSummary-content": { my: 0.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{ width: 12, height: 12, borderRadius: "2px", background: color, flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "11px" }}>
                {layer}
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
                    e.dataTransfer.setData("archimate/element-type", key);
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
