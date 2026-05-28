import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import { useGcpEnabled } from "@/hooks/useGcpEnabled";

interface GcpStatus {
  enabled: boolean;
  card_types: number;
  relation_types: number;
  cards: number;
  diagrams: number;
}

export default function GcpAdmin() {
  const { t } = useTranslation("gcp");
  const { gcpEnabled, invalidateGcp } = useGcpEnabled();
  const [status, setStatus] = useState<GcpStatus | null>(null);
  const [toggling, setToggling] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rolling, setRolling] = useState(false);

  async function loadStatus() {
    try {
      const s = await api.get<GcpStatus>("/settings/gcp-status");
      setStatus(s);
    } catch {}
  }

  async function handleToggle(enabled: boolean) {
    setToggling(true);
    try {
      await api.patch("/settings/gcp-enabled", { enabled });
      invalidateGcp(enabled);
      await loadStatus();
    } finally {
      setToggling(false);
    }
  }

  async function handleRollback() {
    setRolling(true);
    try {
      await api.delete("/settings/gcp-enabled");
      invalidateGcp(false);
      setStatus(null);
    } finally {
      setRolling(false);
      setRollbackOpen(false);
    }
  }

  if (!status) {
    loadStatus();
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <MaterialSymbol icon="cloud" size={32} color="#DB4437" />
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {t("admin.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("admin.description")}
          </Typography>
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={gcpEnabled}
              disabled={toggling}
              onChange={(e) => handleToggle(e.target.checked)}
            />
          }
          label={gcpEnabled ? t("admin.deactivate") : t("admin.activate")}
        />
      </Paper>

      {status && gcpEnabled && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            {t("admin.statusTitle")}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={t("admin.statusCardTypes", { count: status.card_types })} size="small" />
            <Chip label={t("admin.statusRelationTypes", { count: status.relation_types })} size="small" />
            <Chip label={t("admin.statusCards", { count: status.cards })} size="small" />
            <Chip label={t("admin.statusDiagrams", { count: status.diagrams })} size="small" />
          </Stack>
        </Paper>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle2" fontWeight={600} color="error" sx={{ mb: 2 }}>
        {t("admin.dangerZone")}
      </Typography>
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={() => setRollbackOpen(true)}
      >
        {t("admin.rollbackButton")}
      </Button>

      <Dialog open={rollbackOpen} onClose={() => setRollbackOpen(false)}>
        <DialogTitle>{t("admin.rollbackConfirmTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("admin.rollbackConfirmBody")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackOpen(false)}>{t("admin.rollbackCancel")}</Button>
          <Button color="error" onClick={handleRollback} disabled={rolling}>
            {t("admin.rollbackConfirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
