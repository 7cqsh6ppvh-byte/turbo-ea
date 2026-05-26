import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import type { CardType } from "@/types";
import { useResolveMetaLabel } from "@/hooks/useResolveLabel";
import { VISUAL_FIRST_LAYER_COLORS } from "./visualFirstShapes";

function displayCategory(category: string): string {
  return category.startsWith("ArchiMate:") ? category.slice("ArchiMate:".length) : category;
}

function groupColor(category: string, cardTypes: CardType[]): string {
  if (category.startsWith("ArchiMate:")) {
    const layer = category.slice("ArchiMate:".length);
    return VISUAL_FIRST_LAYER_COLORS[layer as keyof typeof VISUAL_FIRST_LAYER_COLORS] || "#9e9e9e";
  }
  return cardTypes[0]?.color || "#9e9e9e";
}

interface Props {
  activeTypes: CardType[];
}

export function VisualFirstElementPalette({ activeTypes }: Props) {
  const { t } = useTranslation("visualfirst");
  const rml = useResolveMetaLabel();

  const groups = useMemo(() => {
    const map = new Map<string, CardType[]>();
    for (const ct of activeTypes) {
      const cat = ct.category ?? "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(ct);
    }
    return Array.from(map.entries()).map(([category, cardTypes]) => ({
      category,
      cardTypes: [...cardTypes].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)),
    }));
  }, [activeTypes]);

  const [expanded, setExpanded] = useState<string | false>(
    groups.length > 0 ? groups[0].category : false,
  );

  const handleChange = (cat: string) => (_: unknown, isExpanded: boolean) => {
    setExpanded(isExpanded ? cat : false);
  };

  if (groups.length === 0) {
    return (
      <Box sx={{ p: 2, color: "text.secondary" }}>
        <Typography variant="caption">{t("sidebar.noTypesAvailable")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", overflowY: "auto" }}>
      {groups.map(({ category, cardTypes }) => {
        const color = groupColor(category, cardTypes);
        return (
          <Accordion
            key={category}
            expanded={expanded === category}
            onChange={handleChange(category)}
            disableGutters
            elevation={0}
            sx={{ "&:before": { display: "none" }, borderBottom: "1px solid rgba(0,0,0,0.08)" }}
          >
            <AccordionSummary
              sx={{ minHeight: 36, "& .MuiAccordionSummary-content": { my: 0.5 } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{ width: 12, height: 12, borderRadius: "2px", background: color, flexShrink: 0 }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "11px" }}>
                  {displayCategory(category)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1, pt: 0 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {cardTypes.map((ct) => (
                  <Chip
                    key={ct.key}
                    label={rml(ct.key, ct.translations, "label")}
                    size="small"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("archimate/element-type", ct.key);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    sx={{
                      fontSize: "10px",
                      height: 22,
                      cursor: "grab",
                      background: `${ct.color}cc`,
                      "&:hover": { background: ct.color },
                    }}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
