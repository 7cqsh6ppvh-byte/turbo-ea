import { useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { AWS_ELEMENT_META, AWS_CATEGORIES } from "./awsShapes";

interface Props {
  onDragStart?: (elementTypeKey: string) => void;
}

export default function AwsElementPalette({ onDragStart }: Props) {
  const { t } = useTranslation("aws");
  const [expanded, setExpanded] = useState<string | false>("AWS:Compute");

  return (
    <Box sx={{ width: 200, overflowY: "auto", borderRight: "1px solid", borderColor: "divider", height: "100%" }}>
      {AWS_CATEGORIES.map((cat) => {
        const items = AWS_ELEMENT_META.filter((e) => e.category === cat);
        return (
          <Accordion
            key={cat}
            expanded={expanded === cat}
            onChange={(_, isExp) => setExpanded(isExp ? cat : false)}
            disableGutters
            sx={{ "&:before": { display: "none" }, boxShadow: "none", borderBottom: "1px solid", borderColor: "divider" }}
          >
            <AccordionSummary sx={{ minHeight: 36, "& .MuiAccordionSummary-content": { my: 0 } }}>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: "10px", textTransform: "uppercase" }}>
                {t(`elementCategories.${cat}`, cat.replace("AWS:", ""))}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0.5 }}>
              {items.map((el) => (
                <Tooltip key={el.key} title={el.label} placement="right">
                  <Box
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("aws/element-type", el.key);
                      onDragStart?.(el.key);
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 0.75,
                      py: 0.4,
                      cursor: "grab",
                      borderRadius: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box sx={{ width: 18, height: 18, bgcolor: el.color, borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MaterialSymbol icon={el.icon} size={12} color="#fff" />
                    </Box>
                    <Typography sx={{ fontSize: "10px", lineHeight: 1.2 }} noWrap>
                      {el.label}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
