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
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api, ApiError } from "@/api/client";

function fmtApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const d = err.detail;
    const body =
      typeof d === "string" && d
        ? d
        : d && typeof d === "object"
          ? JSON.stringify(d)
          : err.message || "";
    return `HTTP ${err.status}${body ? ": " + body : ""}`;
  }
  if (err instanceof Error) return err.message || err.name;
  return String(err);
}

interface MigrationResult {
  cards_deleted: number;
  relations_deleted: number;
  card_types_deleted: number;
  relation_types_deleted: number;
  demo_cards_created: number;
  demo_relations_created: number;
}

export default function ArchiMateAdmin() {
  const { t } = useTranslation("visualfirst");
  const [enabled, setEnabled] = useState(false);
  const [seedDemoEnabled, setSeedDemoEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/settings/archimate-enabled")
      .then((r) => setEnabled((r as { enabled: boolean }).enabled ?? false))
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (value: boolean) => {
    setSaving(true);
    try {
      await api.patch("/settings/archimate-enabled", { enabled: value });
      setEnabled(value);
      setSnack(value ? t("admin.enabled") : t("admin.disabled"));
    } catch (err) {
      const detail = fmtApiError(err);
      setSnack(`Error updating ArchiMate settings: ${detail}`);
      console.error("[ArchiMateAdmin] toggle failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleMigrate = async () => {
    setConfirmOpen(false);
    setMigrating(true);
    try {
      const result = await api.post<MigrationResult>("/settings/archimate-migrate-unique", {
        seed_demo: seedDemoEnabled,
      });
      if (seedDemoEnabled) {
        setSnack(
          t("admin.migrateUnique.successWithDemo", {
            cards: result.cards_deleted,
            relations: result.relations_deleted,
            types: result.card_types_deleted,
            rt: result.relation_types_deleted,
            demoCards: result.demo_cards_created,
            demoRels: result.demo_relations_created,
          })
        );
      } else {
        setSnack(
          t("admin.migrateUnique.successNoDemo", {
            cards: result.cards_deleted,
            relations: result.relations_deleted,
            types: result.card_types_deleted,
            rt: result.relation_types_deleted,
          })
        );
      }
    } catch (err) {
      const detail = fmtApiError(err);
      setSnack(`Migration failed: ${detail}`);
      console.error("[ArchiMateAdmin] migration failed:", err);
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const migrateDisabled = !enabled || saving || migrating;

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <MaterialSymbol icon="account_tree" size={22} color="#1976d2" />
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
          ArchiMate 3.2 migration plugin with 61 element types across 8 layers,
          11 relation types, and AMEFF model exchange format support.
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={saving}
            />
          }
          label={enabled ? t("admin.enable") : t("admin.enable")}
        />
      </Paper>

      {enabled && (
        <>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              {t("admin.migrateUnique.seedDemoSection")}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={seedDemoEnabled}
                  onChange={(e) => setSeedDemoEnabled(e.target.checked)}
                  disabled={saving || migrating}
                />
              }
              label={t("admin.migrateUnique.seedDemoToggle")}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              {t("export.title")} / {t("import.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use <code>POST /api/v1/archimate/export</code> to download an AMEFF XML file,
              or <code>POST /api/v1/archimate/import</code> to import one.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderColor: "warning.main" }}>
            <Typography variant="subtitle2" fontWeight={700} color="warning.main" sx={{ mb: 1 }}>
              {t("admin.migrateUnique.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {seedDemoEnabled
                ? t("admin.migrateUnique.description")
                : t("admin.migrateUnique.descriptionNoDemo")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                disabled={migrateDisabled}
                startIcon={
                  migrating ? (
                    <CircularProgress size={16} />
                  ) : (
                    <MaterialSymbol icon="delete_sweep" size={18} />
                  )
                }
                onClick={() => setConfirmOpen(true)}
              >
                {migrating ? "..." : t("admin.migrateUnique.button")}
              </Button>
            </Box>
          </Paper>
        </>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderColor: "error.main" }}>
        <Typography variant="subtitle2" fontWeight={700} color="error" sx={{ mb: 1 }}>
          {t("admin.dangerZone")}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2">{t("admin.hideAll")}</Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={!enabled || saving}
            onClick={() => handleToggle(false)}
          >
            {t("admin.disable")}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!snack}
        autoHideDuration={15000}
        onClose={() => setSnack(null)}
        message={snack}
      />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("admin.migrateUnique.title")}</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {seedDemoEnabled
              ? t("admin.migrateUnique.confirm")
              : t("admin.migrateUnique.confirmNoDemo")}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t("cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleMigrate}
            disabled={migrating}
          >
            {t("admin.migrateUnique.button")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
