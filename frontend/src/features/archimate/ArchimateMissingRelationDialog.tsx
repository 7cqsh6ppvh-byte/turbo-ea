import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { type ArchiMateRelationType, RELATION_LABELS } from "./types";
import { api } from "@/api/client";

interface Props {
  open: boolean;
  sourceTypeKey: string;
  targetTypeKey: string;
  relationType: ArchiMateRelationType | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Dialog shown when user wants to create a missing ArchiMate relation type
 * that is valid per ArchiMate spec but not yet registered in Turbo EA metamodel.
 */
export function ArchimateMissingRelationDialog({
  open,
  sourceTypeKey,
  targetTypeKey,
  relationType,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useTranslation(["archimate", "common"]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!relationType) return;
    setCreating(true);
    setError(null);
    try {
      const relationName = RELATION_LABELS[relationType] ?? relationType;
      await api.post("/api/v1/archimate/relation-types", {
        source_type_key: sourceTypeKey,
        target_type_key: targetTypeKey,
        relation_name: relationName,
      });
      onSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  // Reset error when dialog closes
  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("missingRelation.title")}</DialogTitle>
      <DialogContent>
        {relationType && (
          <>
            <DialogContentText sx={{ mb: 2 }}>
              {t("missingRelation.description", {
                relation: RELATION_LABELS[relationType] ?? relationType,
                source: sourceTypeKey,
                target: targetTypeKey,
              })}
            </DialogContentText>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={creating}>
          {t("common:actions.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={creating || !relationType}
          startIcon={creating ? <CircularProgress size={16} /> : undefined}
        >
          {creating ? t("common:actions.creating") : t("common:actions.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}