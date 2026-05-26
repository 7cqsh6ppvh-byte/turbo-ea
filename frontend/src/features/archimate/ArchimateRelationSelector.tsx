import { useTranslation } from "react-i18next";
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
import { RELATION_LABELS, type ArchiMateRelationType } from "./types";
import { getValidRelationKeys } from "./AllowedArchiMateRelations";

const RELATION_DESCRIPTIONS: Record<ArchiMateRelationType, string> = {
  Association: "Unspecified relationship between elements",
  Composition: "Element is composed of other elements",
  Aggregation: "Element aggregates other elements",
  Realization: "Element realizes an interface or service",
  Assignment: "Active element performs a behavior element",
  Serving: "Element serves another element",
  Access: "Behavior accesses a passive structure element",
  Influence: "Element influences another element",
  Triggering: "Element triggers another behavior element",
  Flow: "Information or value flows between elements",
  Specialization: "Element specializes another element",
};

interface Props {
  open: boolean;
  sourceTypeKey: string;
  targetTypeKey: string;
  onSelect: (relationType: ArchiMateRelationType) => void;
  onClose: () => void;
  onRequestCreateMissing?: (source: string, target: string, relation: ArchiMateRelationType) => void;
}

/**
 * Dialog shown when the user draws an edge between two ArchiMate element nodes.
 * Filters relation types to show only those valid per ArchiMate 3.2 specification.
 * Shows a "Create missing relation" option when valid relations exist but aren't
 * registered in the Turbo EA metamodel.
 */
export function ArchimateRelationSelector({
  open,
  sourceTypeKey,
  targetTypeKey,
  onSelect,
  onClose,
  onRequestCreateMissing,
}: Props) {
  const { t } = useTranslation("archimate");

  // All possible ArchiMate relation types (from ARCHIMATE_RELATION_STYLES)
  const allRelationTypes = Object.keys(ARCHIMATE_RELATION_STYLES) as ArchiMateRelationType[];

  // Filter to only valid relations between these element types (returns  prefixed keys)
  const validRelations = getValidRelationKeys(sourceTypeKey, targetTypeKey);

  // Relations that exist in metamodel (have styling support)
  const registeredValid = validRelations.filter((r) =>
    allRelationTypes.includes(r as ArchiMateRelationType),
  );

  // Relations that are valid per ArchiMate spec but NOT registered (no styling support yet)
  const missingValid = validRelations.filter(
    (r) => !allRelationTypes.includes(r as ArchiMateRelationType),
  );

  // If no valid relations at all, show error state
  if (validRelations.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("relationSelector.noValidTitle")}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">{t("relationSelector.noValidDescription")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("common:actions.ok")}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("relationSelector.title")}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          {t("relationSelector.direction", {
            source: sourceTypeKey,
            target: targetTypeKey,
          })}
        </Typography>

        {/* Show registered valid relations first */}
        {registeredValid.length > 0 && (
          <>
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
              {t("relationSelector.available")}
            </Typography>
            <List dense disablePadding sx={{ mb: missingValid.length > 0 ? 2 : 0 }}>
              {registeredValid.map((key) => {
                const relationKey = key as ArchiMateRelationType;
                return (
                  <ListItemButton
                    key={key}
                    onClick={() => onSelect(relationKey)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>
                            {RELATION_LABELS[relationKey]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {RELATION_DESCRIPTIONS[relationKey]}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </>
        )}

        {/* Show missing relations with create option */}
        {missingValid.length > 0 && (
          <>
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
              {t("relationSelector.missing")}
            </Typography>
            <List dense disablePadding>
              {missingValid.map((key) => {
                const relationKey = key as ArchiMateRelationType;
                return (
                  <ListItemButton
                    key={key}
                    onClick={() => onRequestCreateMissing?.(sourceTypeKey, targetTypeKey, relationKey)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>
                            {RELATION_LABELS[relationKey]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {RELATION_DESCRIPTIONS[relationKey]}
                          </Typography>
                        </Box>
                      }
                      secondary={t("relationSelector.createPrompt")}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common:actions.cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
}