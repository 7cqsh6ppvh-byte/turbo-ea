import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { ReactFlowProvider } from "@xyflow/react";
import { api } from "@/api/client";
import { ArchimateElementPalette } from "./ArchimateElementPalette";
import { ArchimateCanvas } from "./ArchimateCanvas";
import type { ArchiMateDiagramData } from "./types";

export function ArchimateDiagramEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagramName, setDiagramName] = useState("ArchiMate Diagram");
  const [initialData, setInitialData] = useState<ArchiMateDiagramData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/diagrams/${id}`)
      .then((resp) => {
        const d = resp as { name?: string; data?: Record<string, unknown> };
        setDiagramName(d.name ?? "ArchiMate Diagram");
        const raw = d.data ?? {};
        setInitialData(
          raw.nodes
            ? (raw as unknown as ArchiMateDiagramData)
            : { nodes: [], edges: [], version: "1" as const },
        );
      })
      .catch(() => {
        setInitialData({ nodes: [], edges: [], version: "1" });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = useCallback(
    (_data: ArchiMateDiagramData) => {
      // Save triggered by canvas debounce — just update title if needed
    },
    [],
  );

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
          <IconButton
            size="small"
            aria-label="Back to diagrams"
            onClick={() => navigate("/archimate")}
          >
            ←
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
            {diagramName}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ArchimateElementPalette />
        <ReactFlowProvider>
          <ArchimateCanvas diagramId={id!} initialData={initialData} onSave={handleSave} />
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
