import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import { UML_DIAGRAM_TYPES } from "./umlDiagramTypes";
import type { UmlDiagramType, UmlDiagramCategory } from "./types";

interface DiagramSummary {
  id: string;
  name: string;
  type: string;
  updated_at: string;
}

const CATEGORY_TABS: { value: UmlDiagramCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Structural", label: "Structural" },
  { value: "Behavioral", label: "Behavioral" },
  { value: "Interaction", label: "Interaction" },
];

const CATEGORY_COLOR: Record<string, "primary" | "success" | "info"> = {
  Structural: "primary",
  Behavioral: "success",
  Interaction: "info",
};

export function UmlDiagramsPage() {
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<UmlDiagramType>("uml-class");
  const [creating, setCreating] = useState(false);
  const [tabValue, setTabValue] = useState<UmlDiagramCategory | "all">("all");

  useEffect(() => {
    api
      .get("/diagrams?type=uml")
      .then((resp) => {
        const r = resp as { items?: DiagramSummary[] } | DiagramSummary[];
        const items = (r as { items?: DiagramSummary[] }).items ?? (r as DiagramSummary[]) ?? [];
        // Also include all uml-* typed diagrams from backend
        setDiagrams(items.filter((d) => d.type?.startsWith("uml")));
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
        type: newType,
        data: { nodes: [], edges: [], diagramType: newType, version: "1" },
      }) as { id: string };
      navigate(`/uml/${d.id}/edit`);
    } catch {
      setCreating(false);
    }
  };

  const getDiagramConfig = (type: string) =>
    UML_DIAGRAM_TYPES.find((t) => t.type === type);

  const visibleDiagrams =
    tabValue === "all"
      ? diagrams
      : diagrams.filter((d) => {
          const cfg = getDiagramConfig(d.type);
          return cfg?.category === tabValue;
        });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <MaterialSymbol icon="schema" size={28} />
          <Typography variant="h5" fontWeight={700}>
            UML Diagrams
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<MaterialSymbol icon="add" size={18} />}
          onClick={() => {
            setNewName("");
            setNewType("uml-class");
            setCreateOpen(true);
          }}
        >
          New UML Diagram
        </Button>
      </Box>

      {/* Category filter tabs */}
      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        sx={{ mb: 3, borderBottom: "1px solid rgba(0,0,0,0.12)" }}
      >
        {CATEGORY_TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} sx={{ fontSize: 13 }} />
        ))}
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : visibleDiagrams.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 8, color: "text.secondary" }}>
          <MaterialSymbol icon="schema" size={48} />
          <Typography variant="h6" sx={{ mt: 1 }}>
            No UML diagrams yet
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Create your first diagram to get started.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => setCreateOpen(true)}>
            New UML Diagram
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 2,
          }}
        >
          {visibleDiagrams.map((d) => {
            const cfg = getDiagramConfig(d.type);
            return (
              <Card key={d.id} variant="outlined">
                <CardActionArea onClick={() => navigate(`/uml/${d.id}/edit`)}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
                      {cfg && (
                        <MaterialSymbol
                          icon={cfg.icon as Parameters<typeof MaterialSymbol>[0]["icon"]}
                          size={20}
                        />
                      )}
                      <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
                        {d.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      {cfg && (
                        <>
                          <Chip
                            size="small"
                            label={cfg.label}
                            sx={{ fontSize: 10, height: 20 }}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={cfg.category}
                            color={CATEGORY_COLOR[cfg.category] ?? "default"}
                            sx={{ fontSize: 10, height: 20 }}
                          />
                        </>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      {new Date(d.updated_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New UML Diagram</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Diagram name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <TextField
            select
            fullWidth
            label="Diagram type"
            value={newType}
            onChange={(e) => setNewType(e.target.value as UmlDiagramType)}
          >
            {UML_DIAGRAM_TYPES.map((t) => (
              <MenuItem key={t.type} value={t.type}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <MaterialSymbol
                    icon={t.icon as Parameters<typeof MaterialSymbol>[0]["icon"]}
                    size={18}
                  />
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
                      {t.label}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.2 }}>
                      {t.category}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
