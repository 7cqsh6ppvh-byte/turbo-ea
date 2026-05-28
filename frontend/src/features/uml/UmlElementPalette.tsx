import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { UML_ELEMENT_META } from "./umlShapes";
import { getUmlDiagramTypeConfig } from "./umlDiagramTypes";
import type { UmlDiagramType } from "./types";

interface Props {
  diagramType: UmlDiagramType;
}

interface PaletteItem {
  typeKey: string;
  label: string;
  icon: string;
  color: string;
  category: string;
}

const CATEGORY_ORDER = [
  "UML:Class",
  "UML:Component",
  "UML:Package",
  "UML:UseCase",
  "UML:Activity",
  "UML:StateMachine",
  "UML:Sequence",
  "UML:Common",
];

const CATEGORY_LABELS: Record<string, string> = {
  "UML:Class": "Classifier",
  "UML:Component": "Component/Deployment",
  "UML:Package": "Package",
  "UML:UseCase": "Use Case",
  "UML:Activity": "Activity",
  "UML:StateMachine": "State Machine",
  "UML:Sequence": "Sequence",
  "UML:Common": "Common",
};

function PaletteCard({ item }: { item: PaletteItem }) {
  const label = item.typeKey.replace("uml_", "").replace(/([A-Z])/g, " $1").trim();
  return (
    <Tooltip title={label} placement="right" arrow>
      <Box
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("uml/element-type", item.typeKey);
          e.dataTransfer.effectAllowed = "copy";
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          cursor: "grab",
          userSelect: "none",
          "&:hover": { background: "rgba(0,0,0,0.06)" },
          "&:active": { cursor: "grabbing" },
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "4px",
            background: item.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "1px solid rgba(0,0,0,0.12)",
          }}
        >
          <MaterialSymbol icon={item.icon as Parameters<typeof MaterialSymbol>[0]["icon"]} size={14} />
        </Box>
        <Typography
          sx={{
            fontSize: 11,
            lineHeight: 1.3,
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function CategorySection({ category, items }: { category: string; items: PaletteItem[] }) {
  const [open, setOpen] = useState(true);
  const label = CATEGORY_LABELS[category] ?? category;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1,
          py: 0.25,
          cursor: "pointer",
          "&:hover": { background: "rgba(0,0,0,0.04)" },
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <IconButton size="small" sx={{ p: 0, mr: 0.5 }}>
          <MaterialSymbol icon={open ? "expand_more" : "chevron_right"} size={14} />
        </IconButton>
        <Typography
          sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "text.secondary", letterSpacing: 0.5 }}
        >
          {label}
        </Typography>
        <Typography sx={{ ml: "auto", fontSize: 10, color: "text.disabled" }}>
          {items.length}
        </Typography>
      </Box>
      <Collapse in={open}>
        <Box sx={{ pl: 0.5, pb: 0.5 }}>
          {items.map((item) => (
            <PaletteCard key={item.typeKey} item={item} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export function UmlElementPalette({ diagramType }: Props) {
  const [search, setSearch] = useState("");

  const config = getUmlDiagramTypeConfig(diagramType);
  const allowed = new Set(config?.allowedElements ?? Object.keys(UML_ELEMENT_META));

  const allItems: PaletteItem[] = Object.entries(UML_ELEMENT_META)
    .filter(([key]) => allowed.has(key))
    .map(([key, meta]) => ({
      typeKey: key,
      label: key.replace("uml_", "").replace(/([A-Z])/g, " $1").trim(),
      icon: meta.icon,
      color: meta.defaultColor,
      category: meta.category,
    }));

  const filtered = search.trim()
    ? allItems.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  // Group by category
  const grouped = new Map<string, PaletteItem[]>();
  for (const item of filtered) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  const orderedCategories = CATEGORY_ORDER.filter((c) => grouped.has(c));
  for (const c of Array.from(grouped.keys())) {
    if (!orderedCategories.includes(c)) orderedCategories.push(c);
  }

  return (
    <Box
      sx={{
        width: 200,
        flexShrink: 0,
        borderRight: "1px solid rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#fafafa",
      }}
    >
      <Box sx={{ px: 1, pt: 1, pb: 0.5 }}>
        <TextField
          size="small"
          placeholder="Search elements…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{ sx: { fontSize: 12 } }}
        />
      </Box>

      <Box sx={{ overflowY: "auto", flex: 1, pt: 0.5 }}>
        {orderedCategories.map((category) => {
          const items = grouped.get(category);
          if (!items || items.length === 0) return null;
          return <CategorySection key={category} category={category} items={items} />;
        })}
        {filtered.length === 0 && (
          <Box sx={{ px: 2, py: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              No elements match
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
