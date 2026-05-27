/**
 * RwfSyncDialog — pull main changes into branch, surface conflicts for resolution.
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { api } from "@/api/client";

interface SyncResult {
  conflicts?: Record<string, unknown>[];
  applied?: number;
}

interface Props {
  open: boolean;
  branchId: string;
  onClose: () => void;
  onSynced: () => void;
}

export default function RwfSyncDialog({ open, branchId, onClose, onSynced }: Props) {
  const { t } = useTranslation("rwf");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) { setResult(null); setError(""); }
  }, [open]);

  const handleSync = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post<SyncResult>(`/rwf/branches/${branchId}/sync`, {
        resolutions: {},
      });
      setResult(res);
      if (!res.conflicts || res.conflicts.length === 0) {
        // no conflicts — auto-close after brief delay
        setTimeout(() => { onSynced(); }, 800);
      }
    } catch (e: unknown) {
      const msg = (e as { detail?: string })?.detail;
      setError(msg ?? t("error.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  const hasConflicts = result?.conflicts && result.conflicts.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("sync.title")}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">{t("sync.subtitle")}</Typography>

          {error && <Alert severity="error">{error}</Alert>}

          {result && !hasConflicts && (
            <Alert severity="success">{t("sync.noConflicts")}</Alert>
          )}

          {hasConflicts && (
            <Alert severity="warning">
              {result!.conflicts!.length} conflict(s) detected. Auto-resolution applied
              (branch changes preserved). Review the diff to verify.
            </Alert>
          )}

          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Syncing…</Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("sync.cancel")}</Button>
        {!result && (
          <Button variant="contained" onClick={handleSync} disabled={loading}>
            {t("sync.confirm")}
          </Button>
        )}
        {result && (
          <Button variant="contained" color="success" onClick={onSynced}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
