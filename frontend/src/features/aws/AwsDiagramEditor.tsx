import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { Node, Edge } from "@xyflow/react";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import AwsCanvas from "./AwsCanvas";
import AwsElementPalette from "./AwsElementPalette";

interface DiagramData {
  id: string;
  name: string;
  type: string;
  data: { nodes?: Node[]; edges?: Edge[] };
}

export default function AwsDiagramEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState<DiagramData | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<DiagramData>(`/diagrams/${id}`).then(setDiagram).catch(() => {});
  }, [id]);

  async function handleSave(nodes: Node[], edges: Edge[]) {
    if (!id) return;
    await api.patch(`/diagrams/${id}`, { data: { nodes, edges } }).catch(() => {});
  }

  if (!diagram) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: "#232F3E" }}>
        <Toolbar variant="dense">
          <IconButton color="inherit" onClick={() => navigate("/aws")} edge="start" sx={{ mr: 1 }}>
            <MaterialSymbol icon="arrow_back" size={20} color="#fff" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#FF9900", flexGrow: 1 }}>
            {diagram.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <AwsElementPalette />
        <Box sx={{ flex: 1, position: "relative" }}>
          <AwsCanvas
            diagramId={id!}
            initialNodes={diagram.data?.nodes ?? []}
            initialEdges={diagram.data?.edges ?? []}
            onSave={handleSave}
          />
        </Box>
      </Box>
    </Box>
  );
}
