import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useTranslation } from "react-i18next";
import { getUmlDiagramTypeConfig } from "./umlDiagramTypes";

interface Props {
  diagramType: string;
  anchorPos: { x: number; y: number };
  onSelect: (relTypeKey: string) => void;
  onClose: () => void;
}

const RELATION_META: Record<string, { label: string; description: string }> = {
  uml_rel_association: { label: "Association", description: "Structural link" },
  uml_rel_directed_association: { label: "Directed Association", description: "Navigable link" },
  uml_rel_dependency: { label: "Dependency", description: "One element depends on another" },
  uml_rel_generalization: { label: "Generalization", description: "Inheritance (is-a)" },
  uml_rel_realization: { label: "Realization", description: "Implements interface" },
  uml_rel_composition: { label: "Composition", description: "Strong ownership" },
  uml_rel_aggregation: { label: "Aggregation", description: "Weak ownership" },
  uml_rel_include: { label: "Include", description: "Use case includes another" },
  uml_rel_extend: { label: "Extend", description: "Use case extends another" },
  uml_rel_transition: { label: "Transition", description: "State transition" },
  uml_rel_control_flow: { label: "Control Flow", description: "Activity flow" },
  uml_rel_object_flow: { label: "Object Flow", description: "Object token flow" },
  uml_rel_message: { label: "Message", description: "Synchronous message" },
  uml_rel_create_message: { label: "Create Message", description: "Object creation message" },
  uml_rel_destroy_message: { label: "Destroy Message", description: "Object destruction message" },
  uml_rel_reply_message: { label: "Reply Message", description: "Response message" },
  uml_rel_information_flow: { label: "Information Flow", description: "Data flow" },
  uml_rel_usage: { label: "Usage", description: "One element uses another" },
  uml_rel_abstraction: { label: "Abstraction", description: "Mapping between levels" },
  uml_rel_interface_realization: { label: "Interface Realization", description: "Implements interface" },
  uml_rel_component_realization: { label: "Component Realization", description: "Component realized by" },
  uml_rel_manifestation: { label: "Manifestation", description: "Artifact manifests" },
  uml_rel_deployment: { label: "Deployment", description: "Deployed on node" },
  uml_rel_communication_path: { label: "Communication Path", description: "Network link" },
  uml_rel_nesting: { label: "Nesting", description: "Containment" },
  uml_rel_package_merge: { label: "Package Merge", description: "Merge packages" },
  uml_rel_package_import: { label: "Package Import", description: "Import package" },
  uml_rel_element_import: { label: "Element Import", description: "Import element" },
  uml_rel_substitution: { label: "Substitution", description: "Substitutable type" },
  uml_rel_exception_handler: { label: "Exception Handler", description: "Exception handling edge" },
};

export default function UmlRelationSelector({ diagramType, anchorPos, onSelect, onClose }: Props) {
  const { t } = useTranslation("uml");
  const [filter, setFilter] = useState("");

  const config = getUmlDiagramTypeConfig(diagramType);
  const allowed = config?.allowedRelations ?? Object.keys(RELATION_META);

  const filtered = allowed.filter((key) => {
    const meta = RELATION_META[key];
    if (!meta) return false;
    const q = filter.toLowerCase();
    return meta.label.toLowerCase().includes(q) || meta.description.toLowerCase().includes(q);
  });

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          left: anchorPos.x,
          top: anchorPos.y,
          zIndex: 9999,
          width: 260,
          maxHeight: 320,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            {t("visibility.selectRelation", "Select Relation Type")}
          </Typography>
          <Box
            component="input"
            autoFocus
            placeholder={t("visibility.filterRelations", "Filter…")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{
              display: "block",
              width: "100%",
              mt: 0.5,
              border: "1px solid rgba(0,0,0,0.2)",
              borderRadius: 1,
              px: 1,
              py: 0.4,
              fontSize: 12,
              outline: "none",
              "&:focus": { borderColor: "primary.main" },
            }}
          />
        </Box>
        <List dense disablePadding sx={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {t("visibility.noRelations", "No matching relations")}
              </Typography>
            </Box>
          )}
          {filtered.map((key) => {
            const meta = RELATION_META[key] ?? { label: key, description: "" };
            return (
              <ListItemButton
                key={key}
                dense
                onClick={() => { onSelect(key); onClose(); }}
                sx={{ py: 0.5 }}
              >
                <ListItemText
                  primary={meta.label}
                  secondary={meta.description}
                  primaryTypographyProps={{ fontSize: 12, fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: 10 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Paper>
    </ClickAwayListener>
  );
}
