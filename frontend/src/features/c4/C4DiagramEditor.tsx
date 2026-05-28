import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useTranslation } from "react-i18next";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";

interface DiagramData {
  id: string;
  name: string;
  type: string;
}

export default function C4DiagramEditor() {
  const { t } = useTranslation("c4");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState<DiagramData | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<DiagramData>(`/diagrams/${id}`).then(setDiagram).catch(() => {});
  }, [id]);

  if (!diagram) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: "#1168bd" }}>
        <Toolbar variant="dense">
          <IconButton color="inherit" onClick={() => navigate("/c4")} edge="start" sx={{ mr: 1 }}>
            <MaterialSymbol icon="arrow_back" size={20} color="#fff" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#fff", flexGrow: 1 }}>
            {diagram.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", maxWidth: 480 }}>
          <Typography variant="h6" gutterBottom>
            {t("pageTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("editorComingSoon")}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
