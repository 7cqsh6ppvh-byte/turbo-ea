import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ARCHIMATE_RELATION_STYLES } from "./archimateShapes";

const RELATION_LABELS: Record<string, string> = {
  arch_rel_Association: "Association",
  arch_rel_Composition: "Composition",
  arch_rel_Aggregation: "Aggregation",
  arch_rel_Realization: "Realization",
  arch_rel_Assignment: "Assignment",
  arch_rel_Serving: "Serving",
  arch_rel_Access: "Access",
  arch_rel_Influence: "Influence",
  arch_rel_Triggering: "Triggering",
  arch_rel_Flow: "Flow",
  arch_rel_Specialization: "Specialization",
};

const RELATION_DESCRIPTIONS: Record<string, string> = {
  arch_rel_Association: "Unspecified relationship between elements",
  arch_rel_Composition: "Element is composed of other elements",
  arch_rel_Aggregation: "Element aggregates other elements",
  arch_rel_Realization: "Element realizes an interface or service",
  arch_rel_Assignment: "Active element performs a behavior element",
  arch_rel_Serving: "Element serves another element",
  arch_rel_Access: "Behavior accesses a passive structure element",
  arch_rel_Influence: "Element influences another element",
  arch_rel_Triggering: "Element triggers another behavior element",
  arch_rel_Flow: "Information or value flows between elements",
  arch_rel_Specialization: "Element specializes another element",
};

interface Props {
  open: boolean;
  sourceTypeKey: string;
  targetTypeKey: string;
  onSelect: (relationType: string) => void;
  onClose: () => void;
}

export function ArchimateRelationSelector({
  open,
  sourceTypeKey,
  targetTypeKey,
  onSelect,
  onClose,
}: Props) {
  const allRelations = Object.keys(ARCHIMATE_RELATION_STYLES);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Relation Type</DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          From: <strong>{sourceTypeKey.replace("arch_", "")}</strong> → To:{" "}
          <strong>{targetTypeKey.replace("arch_", "")}</strong>
        </Typography>
        <List dense disablePadding>
          {allRelations.map((key) => (
            <ListItemButton
              key={key}
              onClick={() => onSelect(key)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>
                      {RELATION_LABELS[key] ?? key}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {RELATION_DESCRIPTIONS[key]}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
