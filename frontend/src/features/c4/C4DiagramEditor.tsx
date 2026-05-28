import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { api } from "@/api/client";
import { C4Canvas } from "./C4Canvas";
import { C4ElementPalette } from "./C4ElementPalette";
import type { C4DiagramData } from "./types";
import { C4_DIAGRAM_TYPES, type C4DiagramTypeKey } from "./c4Shapes";
import MaterialSymbol from "@/components/MaterialSymbol";

interface DiagramRecord {
  id: string;
  name: string;
  type: string;
  data: C4DiagramData;
}

export function C4DiagramEditor() {
  const { id: diagramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState<DiagramRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!diagramId) { navigate("/c4"); return; }
    api
      .get<DiagramRecord>(`/diagrams/${diagramId}`)
      .then((r) => setDiagram(r))
      .catch(() => navigate("/c4"))
      .finally(() => setLoading(false));
  }, [diagramId, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!diagram) return null;

  const diagramType = (diagram.data?.diagramType ?? diagram.type.replace("c4-diagram-", "c4-")) as C4DiagramTypeKey;
  const typeLabel = C4_DIAGRAM_TYPES.find((dt) => dt.key === diagramType)?.label ?? diagramType;

  const initialData: C4DiagramData = diagram.data ?? {
    nodes: [],
    edges: [],
    diagramType: "c4-context",
    version: "1",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <IconButton edge="start" onClick={() => navigate("/c4")} size="small" sx={{ mr: 1 }}>
            <MaterialSymbol icon="arrow_back" size={20} />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }} noWrap>
            {diagram.name}
          </Typography>
          <Chip label={typeLabel} size="small" variant="outlined" />
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <C4ElementPalette diagramType={diagramType} />
        <C4Canvas
          diagramId={diagramId ?? ""}
          diagramType={diagramType}
          initialData={initialData}
        />
      </Box>
    </Box>
  );
}
