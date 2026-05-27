import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { api } from "@/api/client";
import type { RwfBranch } from "./rwf.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (branch: RwfBranch) => void;
}

export default function RwfCreateBranchDialog({ open, onClose, onCreated }: Props) {
  const { t } = useTranslation("rwf");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) { setError(t("createBranch.nameRequired")); return; }
    setSaving(true);
    try {
      const branch = await api.post<RwfBranch>("/rwf/branches", {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      setError("");
      onCreated(branch);
    } catch {
      setError(t("error.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("createBranch.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label={t("createBranch.name")}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            error={!!error}
            helperText={error}
            fullWidth
            autoFocus
            inputProps={{ "data-testid": "branch-name-input" }}
          />
          <TextField
            label={t("createBranch.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>{t("createBranch.cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
        >
          {t("createBranch.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
