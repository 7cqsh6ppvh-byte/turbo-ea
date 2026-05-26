import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";

interface DiagramSummary {
  id: string;
  name: string;
  updated_at: string;
}

interface Props {
  currentDiagramId: string;
}

export function VisualFirstViewsTree({ currentDiagramId }: Props) {
  const { t } = useTranslation("visualfirst");
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get<{ items?: DiagramSummary[] } | DiagramSummary[]>("/diagrams?type=archimate")
      .then((resp) => {
        const r = resp as { items?: DiagramSummary[] } | DiagramSummary[];
        setDiagrams((r as { items?: DiagramSummary[] }).items ?? (r as DiagramSummary[]) ?? []);
      })
      .catch(() => setDiagrams([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = (await api.post("/diagrams", {
        name: newName.trim(),
        type: "archimate",
        data: { nodes: [], edges: [], version: "1" },
      })) as { id: string; name: string; updated_at: string };
      setDiagrams((prev) => [created, ...prev]);
      setCreateOpen(false);
      setNewName("");
      navigate(`/visualfirst/${created.id}/edit`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "10px",
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            flex: 1,
          }}
        >
          {t("sidebar.diagramsHeader")}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setCreateOpen(true)}
          aria-label={t("sidebar.newDiagram")}
        >
          <MaterialSymbol icon="add" size={16} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={20} />
          </Box>
        ) : diagrams.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, color: "text.disabled" }}>
            <MaterialSymbol icon="schema" size={28} color="#bbb" />
            <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
              {t("sidebar.noDiagrams")}
            </Typography>
          </Box>
        ) : (
          diagrams.map((d) => {
            const isCurrent = d.id === currentDiagramId;
            return (
              <Box
                key={d.id}
                onClick={() => navigate(`/visualfirst/${d.id}/edit`)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  bgcolor: isCurrent ? "primary.50" : "transparent",
                  "&:hover": { bgcolor: isCurrent ? "primary.50" : "action.hover" },
                }}
              >
                <MaterialSymbol icon="schema" size={14} color={isCurrent ? "#1976d2" : "#999"} />
                <Typography
                  variant="caption"
                  sx={{
                    flex: 1,
                    fontSize: "11px",
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? "primary.main" : "text.primary",
                  }}
                  noWrap
                >
                  {d.name}
                </Typography>
                {isCurrent && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>
            );
          })
        )}
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "16px" }}>{t("sidebar.newDiagram")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={t("diagramName")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t("cancel")}</Button>
          <Button
            variant="contained"
            disabled={!newName.trim() || creating}
            onClick={handleCreate}
          >
            {t("create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
