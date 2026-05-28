import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import { invalidateUmlEnabled } from "@/hooks/useUmlEnabled";

interface UmlStatus {
  enabled: boolean;
  card_types_count: number;
  relation_types_count: number;
  cards_count: number;
  diagrams_count: number;
}

export default function UmlAdmin() {
  const { t } = useTranslation("uml");
  const [status, setStatus] = useState<UmlStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const loadStatus = () => {
    api
      .get<UmlStatus>("/settings/uml-status")
      .then((r) => setStatus(r))
      .catch(() => {
        // Fallback: load just the enabled flag
        api
          .get<{ enabled: boolean }>("/settings/uml-enabled")
          .then((r) =>
            setStatus({
              enabled: r.enabled,
              card_types_count: 0,
              relation_types_count: 0,
              cards_count: 0,
              diagrams_count: 0,
            }),
          )
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleToggle = async (value: boolean) => {
    setSaving(true);
    try {
      await api.patch("/settings/uml-enabled", { enabled: value });
      invalidateUmlEnabled(value);
      setSnack(value ? t("admin.activated") : t("admin.deactivated"));
      loadStatus();
    } catch {
      setSnack(t("admin.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async () => {
    setRolling(true);
    try {
      const result = await api.delete<{
        deleted_cards: number;
        deleted_relations: number;
        deleted_diagrams: number;
        deleted_card_types: number;
        deleted_relation_types: number;
      }>("/settings/uml-enabled");
      invalidateUmlEnabled(false);
      setRollbackOpen(false);
      setSnack(
        t("admin.rollbackSuccess", {
          cards: result.deleted_cards,
          diagrams: result.deleted_diagrams,
          types: result.deleted_card_types,
        }),
      );
      loadStatus();
    } catch {
      setSnack(t("admin.rollbackError"));
    } finally {
      setRolling(false);
    }
  };

  const handleXmiExport = async () => {
    try {
      const res = await fetch("/api/v1/uml/export", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Turbo-EA-Origin": "web",
        },
        body: JSON.stringify({ name: "UML Model" }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "uml-model.xmi";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setSnack(t("export.error"));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const enabled = status?.enabled ?? false;

  return (
    <Box>
      {/* Main toggle card */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <MaterialSymbol icon="schema" size={22} color="#1976d2" />
          <Typography variant="h6" fontWeight={700}>
            {t("admin.title")}
          </Typography>
          <Chip
            label={enabled ? t("admin.enabled") : t("admin.disabled")}
            size="small"
            color={enabled ? "success" : "default"}
            sx={{ ml: 1 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("admin.description")}
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={saving}
            />
          }
          label={enabled ? t("admin.deactivate") : t("admin.activate")}
        />
      </Paper>

      {/* Status card */}
      {status && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            {t("admin.statusTitle")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              label={t("admin.statusCardTypes", { count: status.card_types_count })}
              variant="outlined"
              size="small"
            />
            <Chip
              label={t("admin.statusRelationTypes", { count: status.relation_types_count })}
              variant="outlined"
              size="small"
            />
            <Chip
              label={t("admin.statusCards", { count: status.cards_count })}
              variant="outlined"
              size="small"
              color={status.cards_count > 0 ? "primary" : "default"}
            />
            <Chip
              label={t("admin.statusDiagrams", { count: status.diagrams_count })}
              variant="outlined"
              size="small"
              color={status.diagrams_count > 0 ? "primary" : "default"}
            />
          </Box>
        </Paper>
      )}

      {/* XMI import/export */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          {t("export.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("export.description")}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<MaterialSymbol icon="download" size={18} />}
            disabled={!enabled}
            onClick={handleXmiExport}
          >
            {t("export.button")}
          </Button>
        </Box>
      </Paper>

      {/* Danger zone */}
      <Paper variant="outlined" sx={{ p: 3, borderColor: "error.main" }}>
        <Typography variant="subtitle1" fontWeight={700} color="error" sx={{ mb: 1 }}>
          {t("admin.dangerZone")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("admin.rollbackDescription")}
        </Typography>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<MaterialSymbol icon="delete_forever" size={18} />}
          onClick={() => setRollbackOpen(true)}
        >
          {t("admin.rollbackButton")}
        </Button>
      </Paper>

      {/* Rollback confirmation dialog */}
      <Dialog
        open={rollbackOpen}
        onClose={() => !rolling && setRollbackOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "error.main" }}>{t("admin.rollbackConfirmTitle")}</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {t("admin.rollbackWarning")}
          </Alert>
          <DialogContentText>
            {t("admin.rollbackConfirmText", {
              cards: status?.cards_count ?? 0,
              diagrams: status?.diagrams_count ?? 0,
              types: status?.card_types_count ?? 0,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackOpen(false)} disabled={rolling}>
            {t("admin.cancel")}
          </Button>
          <Button variant="contained" color="error" onClick={handleRollback} disabled={rolling}>
            {rolling ? <CircularProgress size={18} /> : t("admin.rollbackConfirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        message={snack}
      />
    </Box>
  );
}
