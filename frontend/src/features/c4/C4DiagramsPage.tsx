import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import { C4_DIAGRAM_TYPES } from "./c4Shapes";

interface DiagramSummary {
  id: string;
  name: string;
  type: string;
  updated_at: string;
}

export function C4DiagramsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("c4");
  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("c4-context");
  const [creating, setCreating] = useState(false);

  const loadDiagrams = () => {
    setLoading(true);
    api
      .get("/diagrams?type=c4-context&type=c4-container&type=c4-component&type=c4-code")
      .then((resp) => {
        const r = resp as { items?: DiagramSummary[] } | DiagramSummary[];
        const items = (r as { items?: DiagramSummary[] }).items ?? (r as DiagramSummary[]) ?? [];
        // Filter to only c4 diagram types
        setDiagrams(items.filter((d) => d.type?.startsWith("c4-")));
      })
      .catch(() => setDiagrams([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDiagrams();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const d = (await api.post("/diagrams", {
        name: newName.trim(),
        type: newType,
        data: { nodes: [], edges: [], diagramType: newType, version: "1" },
      })) as { id: string };
      navigate(`/c4/${d.id}/edit`);
    } catch {
      setCreating(false);
    }
  };

  const handleOpenCreate = () => {
    setNewName("");
    setNewType("c4-context");
    setCreateOpen(true);
  };

  const typeLabel = (type: string) =>
    C4_DIAGRAM_TYPES.find((dt) => dt.key === type)?.label ?? type;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MaterialSymbol icon="account_tree" size={28} color="#1168bd" />
          <Typography variant="h5" fontWeight={700}>
            {t("pageTitle")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<MaterialSymbol icon="add" size={18} />} onClick={handleOpenCreate}>
          {t("newDiagram")}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : diagrams.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 8, color: "text.secondary" }}>
          <MaterialSymbol icon="account_tree" size={56} color="#ccc" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t("noDiagrams")}
          </Typography>
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
              <CardActionArea onClick={() => navigate(`/c4/${d.id}/edit`)}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1, mr: 1 }}>
                      {d.name}
                    </Typography>
                    <Chip label={typeLabel(d.type)} size="small" variant="outlined" sx={{ flexShrink: 0 }} />
                  </Box>
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
        <DialogContent sx={{ pt: "16px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Diagram name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newType !== "c4-code" && handleCreate()}
          />
          <TextField
            select
            fullWidth
            label="Diagram type"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            {C4_DIAGRAM_TYPES.map((dt) => (
              <MenuItem key={dt.key} value={dt.key}>
                {dt.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newName.trim() || creating}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
