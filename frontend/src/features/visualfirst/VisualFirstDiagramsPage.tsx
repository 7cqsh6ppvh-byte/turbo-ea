import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { api } from "@/api/client";

interface DiagramSummary {
  id: string;
  name: string;
  updated_at: string;
}

export function VisualFirstDiagramsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("visualfirst");
  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get("/diagrams?type=archimate")
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
      const d = await api.post("/diagrams", {
        name: newName.trim(),
        type: "archimate",
        data: { nodes: [], edges: [], version: "1" },
      }) as { id: string };
      navigate(`/visualfirst/${d.id}/edit`);
    } catch {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          {t("pageTitle")}
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          {t("newDiagram")}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : diagrams.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 8, color: "text.secondary" }}>
          <Typography variant="h6">{t("noDiagrams")}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {t("noDiagramsHint")}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 2,
          }}
        >
          {diagrams.map((d) => (
            <Card key={d.id} variant="outlined">
              <CardActionArea onClick={() => navigate(`/visualfirst/${d.id}/edit`)}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {d.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(d.updated_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("newDiagram")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t("diagramNameLabel")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t("cancel")}</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newName.trim() || creating}>
            {t("create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
