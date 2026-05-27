/**
 * RwfMergeDialog — conflict resolution picker shown before a branch merge.
 * For each conflicting field: side-by-side main vs branch value pickers.
 */
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { api } from "@/api/client";
import type { BranchDiff, CardOverride } from "./rwf.types";

interface Props {
  open: boolean;
  branchId: string;
  diff: BranchDiff;
  onClose: () => void;
  onMerged: () => void;
}

type Resolution = "main" | "branch";

export default function RwfMergeDialog({ open, branchId, diff, onClose, onMerged }: Props) {
  const { t } = useTranslation("rwf");

  // resolutions: { override_id: { field_path: "main" | "branch" } }
  const [resolutions, setResolutions] = useState<Record<string, Record<string, Resolution>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const conflictingCards = useMemo(
    () => diff.cards.filter((c) => c.has_conflicts),
    [diff.cards],
  );
  const conflictingDiagrams = useMemo(
    () => diff.diagrams.filter((d) => d.has_conflicts),
    [diff.diagrams],
  );

  const totalConflicts = conflictingCards.length + conflictingDiagrams.length;

  const allResolved = useMemo(() => {
    for (const card of conflictingCards) {
      const cardRes = resolutions[card.override_id] ?? {};
      for (const field of Object.keys(card.conflicts)) {
        if (!cardRes[field]) return false;
      }
    }
    for (const diag of conflictingDiagrams) {
      const diagRes = resolutions[diag.override_id] ?? {};
      for (const field of Object.keys(diag.conflicts)) {
        if (!diagRes[field]) return false;
      }
    }
    return true;
  }, [conflictingCards, conflictingDiagrams, resolutions]);

  const setRes = (overrideId: string, field: string, val: Resolution) => {
    setResolutions((prev) => ({
      ...prev,
      [overrideId]: { ...(prev[overrideId] ?? {}), [field]: val },
    }));
  };

  const handleMerge = async () => {
    if (!allResolved && totalConflicts > 0) {
      setError(t("merge.resolveAll"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post(`/rwf/branches/${branchId}/merge`, { resolutions });
      onMerged();
    } catch (e: unknown) {
      const msg = (e as { detail?: string })?.detail;
      setError(msg ?? t("error.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const renderConflictRow = (
    overrideId: string,
    fieldPath: string,
    status: string,
    draft: Record<string, unknown>,
    baseSnapshot: Record<string, unknown> | undefined,
  ) => {
    const currentRes = resolutions[overrideId]?.[fieldPath];
    const baseVal = baseSnapshot?.[fieldPath];
    const branchVal = draft[fieldPath];

    return (
      <TableRow key={fieldPath}>
        <TableCell>
          <Typography variant="caption" fontFamily="monospace">{fieldPath}</Typography>
          {status === "conflict" && (
            <Chip label={t("diff.conflict")} size="small" color="error" sx={{ ml: 0.5 }} />
          )}
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="text.secondary">
            {String(baseVal ?? "—")}
          </Typography>
        </TableCell>
        <TableCell>
          <Button
            size="small"
            variant={currentRes === "main" ? "contained" : "outlined"}
            color="primary"
            onClick={() => setRes(overrideId, fieldPath, "main")}
            sx={{ minWidth: 100, mr: 0.5 }}
          >
            {t("merge.chooseMain")}
          </Button>
        </TableCell>
        <TableCell>
          <Button
            size="small"
            variant={currentRes === "branch" ? "contained" : "outlined"}
            color="secondary"
            onClick={() => setRes(overrideId, fieldPath, "branch")}
            sx={{ minWidth: 110 }}
          >
            {t("merge.chooseBranch")}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", maxWidth: 180, wordBreak: "break-all" }}
          >
            {String(branchVal ?? "—")}
          </Typography>
        </TableCell>
      </TableRow>
    );
  };

  const renderCard = (card: CardOverride) => (
    <Box key={card.override_id} mb={2}>
      <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
        {t("merge.conflictFor", { name: String(card.draft.name ?? card.card_id) })}
      </Typography>
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t("diff.field")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("diff.base")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("diff.main")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("diff.branch")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(card.conflicts).map(([field, status]) =>
              renderConflictRow(card.override_id, field, status, card.draft, card.base_snapshot),
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("merge.title")}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {totalConflicts === 0 ? (
          <Alert severity="success">{t("merge.noConflicts")}</Alert>
        ) : (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t("diff.hasConflicts", { count: totalConflicts })}
            </Alert>
            {conflictingCards.map(renderCard)}
          </>
        )}

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary">
          {t("merge.subtitle")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>{t("merge.cancel")}</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleMerge}
          disabled={saving || (!allResolved && totalConflicts > 0)}
          startIcon={<span>⬡</span>}
        >
          {t("merge.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
