import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { ReactFlowProvider } from "@xyflow/react";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import { UmlCanvas } from "./UmlCanvas";
import { UmlElementPalette } from "./UmlElementPalette";
import { getUmlDiagramTypeConfig, UML_DIAGRAM_TYPES } from "./umlDiagramTypes";
import type { UmlDiagramData, UmlDiagramType } from "./types";

export function UmlDiagramEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagramName, setDiagramName] = useState("UML Diagram");
  const [diagramType, setDiagramType] = useState<UmlDiagramType>("uml-class");
  const [initialData, setInitialData] = useState<UmlDiagramData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/diagrams/${id}`)
      .then((resp) => {
        const d = resp as { name?: string; type?: string; data?: Record<string, unknown> };
        setDiagramName(d.name ?? "UML Diagram");
        const rawType = (d.type ?? "uml-class") as UmlDiagramType;
        setDiagramType(rawType);
        const raw = d.data ?? {};
        setInitialData(
          raw.nodes
            ? (raw as unknown as UmlDiagramData)
            : { nodes: [], edges: [], diagramType: rawType, version: "1" as const },
        );
      })
      .catch(() => {
        setInitialData({ nodes: [], edges: [], diagramType, version: "1" });
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = useCallback((_data: UmlDiagramData) => {
    // triggered by canvas auto-save debounce
  }, []);

  const config = getUmlDiagramTypeConfig(diagramType);
  const category = UML_DIAGRAM_TYPES.find((t) => t.type === diagramType)?.category;

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
            aria-label="Back to UML diagrams"
            onClick={() => navigate("/uml")}
          >
            <MaterialSymbol icon="arrow_back" size={18} />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }} noWrap>
            {diagramName}
          </Typography>
          {config && (
            <Chip
              size="small"
              label={config.label}
              icon={<MaterialSymbol icon={config.icon as Parameters<typeof MaterialSymbol>[0]["icon"]} size={14} />}
              variant="outlined"
              sx={{ fontSize: 11 }}
            />
          )}
          {category && (
            <Chip
              size="small"
              label={category}
              color={
                category === "Structural"
                  ? "primary"
                  : category === "Behavioral"
                    ? "success"
                    : "info"
              }
              sx={{ fontSize: 11 }}
            />
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <UmlElementPalette diagramType={diagramType} />
        <ReactFlowProvider>
          <UmlCanvas
            diagramId={id!}
            diagramType={diagramType}
            initialData={initialData}
            onSave={handleSave}
          />
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
