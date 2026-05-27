/**
 * RwfCardDetailPanel — a right-hand Drawer for viewing and editing a card
 * inside a branch workspace.
 *
 * All reads and writes go to the branch endpoints:
 *   GET  /rwf/branches/{branchId}/cards/{cardId}
 *   PATCH /rwf/branches/{branchId}/cards/{cardId}
 *
 * The main card endpoints are never called.
 */
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import type { BranchCard } from "./rwf.types";

interface Props {
  open: boolean;
  branchId: string;
  cardId: string | null;
  readOnly?: boolean;
  onClose: () => void;
  onSaved?: (card: BranchCard) => void;
}

export default function RwfCardDetailPanel({
  open,
  branchId,
  cardId,
  readOnly = false,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation("rwf");

  const [card, setCard] = useState<BranchCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    if (!cardId || !open) return;
    setLoading(true);
    setError("");
    try {
      const c = await api.get<BranchCard>(`/rwf/branches/${branchId}/cards/${cardId}`);
      setCard(c);
      setName(c.name ?? "");
      setDescription(c.description ?? "");
      setDirty(false);
    } catch {
      setError(t("error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [branchId, cardId, open, t]);

  useEffect(() => {
    if (open && cardId) load();
  }, [open, cardId, load]);

  const handleSave = async () => {
    if (!cardId) return;
    setSaving(true);
    setError("");
    try {
      const updated = await api.patch<BranchCard>(
        `/rwf/branches/${branchId}/cards/${cardId}`,
        { name, description },
      );
      setCard(updated);
      setDirty(false);
      onSaved?.(updated);
    } catch {
      setError(t("error.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setCard(null);
    setDirty(false);
    setError("");
    onClose();
  };

  const operationColor = {
    modified: "warning",
    created: "success",
    deleted: "error",
  } as const;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 480 } } }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <MaterialSymbol icon="article" size={20} />
          <Typography variant="subtitle1" fontWeight={700}>
            {card?.name ?? "…"}
          </Typography>
          {card?._override && (
            <Chip
              label={t(`rwf:workspace.operation.${card._override}`)}
              size="small"
              color={operationColor[card._override] ?? "default"}
            />
          )}
        </Stack>
        <IconButton size="small" onClick={handleClose}>
          <MaterialSymbol icon="close" size={20} />
        </IconButton>
      </Stack>

      {/* Body */}
      <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {card && !loading && (
          <Stack spacing={2}>
            {/* Type / subtype row */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={card.type} size="small" variant="outlined" />
              {card.subtype && (
                <Chip label={card.subtype} size="small" variant="outlined" />
              )}
              {card.status && (
                <Chip label={card.status} size="small" color="default" />
              )}
            </Stack>

            <Divider />

            {/* Name field */}
            <TextField
              label={t("workspace.col.name")}
              value={name}
              size="small"
              fullWidth
              disabled={readOnly || saving}
              onChange={(e) => { setName(e.target.value); setDirty(true); }}
            />

            {/* Description field */}
            <TextField
              label={t("panel.description")}
              value={description}
              size="small"
              fullWidth
              multiline
              minRows={4}
              disabled={readOnly || saving}
              onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
            />

            {/* Attributes (read-only display of custom fields) */}
            {card.attributes && Object.keys(card.attributes).length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="text.secondary">
                  {t("panel.attributes")}
                </Typography>
                <Stack spacing={0.5}>
                  {Object.entries(card.attributes).map(([key, val]) => (
                    <Stack key={key} direction="row" spacing={1}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ minWidth: 130, fontWeight: 600 }}
                      >
                        {key}
                      </Typography>
                      <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
                        {val === null || val === undefined
                          ? "—"
                          : typeof val === "object"
                            ? JSON.stringify(val)
                            : String(val)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      {!readOnly && card && (
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}
        >
          <Button size="small" onClick={handleClose} disabled={saving}>
            {t("createBranch.cancel")}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={!dirty || saving}
            startIcon={saving ? <CircularProgress size={14} /> : undefined}
          >
            {saving ? t("panel.saving") : t("panel.save")}
          </Button>
        </Stack>
      )}
    </Drawer>
  );
}
