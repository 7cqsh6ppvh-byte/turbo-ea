import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { ReactFlowProvider } from "@xyflow/react";
import { api } from "@/api/client";
import MaterialSymbol from "@/components/MaterialSymbol";
import { VisualFirstLeftSidebar } from "./VisualFirstLeftSidebar";
import { VisualFirstCanvas } from "./VisualFirstCanvas";
import type { VisualFirstDiagramData } from "./visualFirstTypes";

export function VisualFirstDiagramEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagramName, setDiagramName] = useState("VisualFirst Diagram");
  const [initialData, setInitialData] = useState<VisualFirstDiagramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodeCardIds, setNodeCardIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    api
      .get(`/diagrams/${id}`)
      .then((resp) => {
        const d = resp as { name?: string; data?: Record<string, unknown> };
        setDiagramName(d.name ?? "VisualFirst Diagram");
        const raw = d.data ?? {};
        setInitialData(
          raw.nodes
            ? (raw as unknown as VisualFirstDiagramData)
            : { nodes: [], edges: [], version: "1" as const },
        );
      })
      .catch(() => {
        setInitialData({ nodes: [], edges: [], version: "1" });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = useCallback((_data: VisualFirstDiagramData) => {}, []);

  if (loading || !initialData) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <IconButton size="small" aria-label="Back to diagrams" onClick={() => navigate("/visualfirst")}>
            <MaterialSymbol icon="arrow_back" size={18} />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
            {diagramName}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ReactFlowProvider>
          <VisualFirstLeftSidebar currentDiagramId={id!} nodeCardIds={nodeCardIds} />
          <VisualFirstCanvas
            diagramId={id!}
            initialData={initialData}
            onSave={handleSave}
            onNodeCardIdsChange={setNodeCardIds}
          />
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
