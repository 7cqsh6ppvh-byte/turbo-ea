import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import { invalidateC4Enabled } from "@/hooks/useC4Enabled";

interface C4Status {
  enabled: boolean;
  card_types_count: number;
  relation_types_count: number;
  cards_count: number;
  diagrams_count: number;
}

export default function C4Admin() {
  const { t } = useTranslation("c4");
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<C4Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const loadStatus = useCallback(() => {
    setLoading(true);
    api
      .get<C4Status>("/settings/c4-status")
      .then((r) => {
        setStatus(r);
        setEnabled(r.enabled);
      })
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleToggle = async (value: boolean) => {
    setSaving(true);
    try {
      await api.patch("/settings/c4-enabled", { enabled: value });
      setEnabled(value);
      invalidateC4Enabled(value);
      loadStatus();
      setSnack(value ? t("admin.activate") : t("admin.deactivate"));
    } catch {
      setSnack("Error updating C4 settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async () => {
    setRollbackOpen(false);
    setSaving(true);
    try {
      await api.delete("/settings/c4-enabled");
      setEnabled(false);
      invalidateC4Enabled(false);
      loadStatus();
      setSnack(t("admin.rollbackSuccess"));
    } catch {
      setSnack("Error uninstalling C4 plugin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <MaterialSymbol icon="account_tree" size={22} color="#1168bd" />
          <Typography variant="h6" fontWeight={700}>
            {t("admin.title")}
          </Typography>
          <Chip
            label={enabled ? "Enabled" : "Disabled"}
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

      {status && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
            {t("admin.statusTitle")}
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<MaterialSymbol icon="category" size={16} />}
              label={t("admin.statusCardTypes", { count: status.card_types_count })}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<MaterialSymbol icon="sync_alt" size={16} />}
              label={t("admin.statusRelationTypes", { count: status.relation_types_count })}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<MaterialSymbol icon="article" size={16} />}
              label={t("admin.statusCards", { count: status.cards_count })}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<MaterialSymbol icon="schema" size={16} />}
              label={t("admin.statusDiagrams", { count: status.diagrams_count })}
              variant="outlined"
              size="small"
            />
          </Stack>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderColor: "error.main" }}>
        <Typography variant="subtitle2" fontWeight={700} color="error" sx={{ mb: 1 }}>
          {t("admin.dangerZone")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2">{t("admin.rollbackButton")}</Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={saving}
            onClick={() => setRollbackOpen(true)}
          >
            {t("admin.rollbackButton")}
          </Button>
        </Box>
      </Paper>

      <Dialog open={rollbackOpen} onClose={() => setRollbackOpen(false)}>
        <DialogTitle>{t("admin.rollbackConfirmTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("admin.rollbackConfirmBody")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackOpen(false)}>{t("admin.rollbackCancel")}</Button>
          <Button color="error" variant="contained" onClick={handleRollback}>
            {t("admin.rollbackConfirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        message={snack}
      />
    </Box>
  );
}
