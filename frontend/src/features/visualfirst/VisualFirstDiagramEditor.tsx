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
import CardDetailSidePanel from "@/components/CardDetailSidePanel";
import RwfCardDetailPanel from "@/features/rwf/RwfCardDetailPanel";
import { VisualFirstLeftSidebar } from "./VisualFirstLeftSidebar";
import { VisualFirstCanvas } from "./VisualFirstCanvas";
import type { VisualFirstDiagramData, VisualFirstDiagramNode } from "./visualFirstTypes";

interface VisualFirstDiagramEditorProps {
  /** When set, all reads/writes route through branch endpoints. */
  branchId?: string;
  /** Override diagram ID (used when rendered from within the RWF workspace). */
  diagramId?: string;
}

export function VisualFirstDiagramEditor({ branchId, diagramId: diagramIdProp }: VisualFirstDiagramEditorProps = {}) {
  const { id: routeId } = useParams<{ id: string }>();
  const id = diagramIdProp ?? routeId;
  const navigate = useNavigate();
  const [diagramName, setDiagramName] = useState("VisualFirst Diagram");
  const [initialData, setInitialData] = useState<VisualFirstDiagramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodeCardIds, setNodeCardIds] = useState<Set<string>>(new Set());
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const diagramUrl = branchId
          ? `/rwf/branches/${branchId}/diagrams/${id}`
          : `/diagrams/${id}`;
        const resp = await api.get(diagramUrl);
        const d = resp as { name?: string; data?: Record<string, unknown> };
        setDiagramName(d.name ?? "VisualFirst Diagram");
        const raw = d.data ?? {};
        const diagramData: VisualFirstDiagramData = raw.nodes
          ? (raw as unknown as VisualFirstDiagramData)
          : { nodes: [], edges: [], version: "1" as const };

        // Hydrate node labels from card data (branch-scoped when in branch context).
        const cardIds = diagramData.nodes
          .map((n: VisualFirstDiagramNode) => (n.data?.cardId ?? n.id) as string)
          .filter((cid) => !!cid && !cid.startsWith("temp-"));

        if (cardIds.length > 0) {
          const results = await Promise.all(
            cardIds.map((cid) => {
              const cardUrl = branchId
                ? `/rwf/branches/${branchId}/cards/${cid}`
                : `/cards/${cid}`;
              return api.get<{ id: string; name: string }>(cardUrl).catch(() => null);
            }),
          );
          const nameMap = new Map(
            results
              .filter((c): c is { id: string; name: string } => c !== null)
              .map((c) => [c.id, c.name]),
          );
          diagramData.nodes = diagramData.nodes.map((n: VisualFirstDiagramNode) => {
            const cardId = (n.data?.cardId ?? n.id) as string;
            const name = nameMap.get(cardId);
            return name ? { ...n, data: { ...n.data, label: name } } : n;
          });
        }

        setInitialData(diagramData);
      } catch {
        setInitialData({ nodes: [], edges: [], version: "1" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, branchId]);

  const handleSave = useCallback((_data: VisualFirstDiagramData) => {}, []);

  if (loading || !initialData) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const backTarget = branchId ? `/rwf/branches/${branchId}/workspace` : "/visualfirst";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <IconButton size="small" aria-label="Back to diagrams" onClick={() => navigate(backTarget)}>
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
            onCardSelect={(cardId) => { setSelectedCardId(cardId); setPanelOpen(!!cardId); }}
            branchId={branchId}
          />
        </ReactFlowProvider>
      </Box>

      {branchId ? (
        <RwfCardDetailPanel
          open={panelOpen}
          branchId={branchId}
          cardId={selectedCardId}
          onClose={() => { setPanelOpen(false); setSelectedCardId(null); }}
        />
      ) : (
        <CardDetailSidePanel
          cardId={selectedCardId}
          open={!!selectedCardId}
          onClose={() => { setSelectedCardId(null); setPanelOpen(false); }}
        />
      )}
    </Box>
  );
}
