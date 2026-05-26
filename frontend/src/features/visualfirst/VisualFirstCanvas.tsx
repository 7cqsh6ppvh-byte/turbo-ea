import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type NodeChange,
  type EdgeChange,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { api } from "@/api/client";
import { useMetamodel } from "@/hooks/useMetamodel";
import { useResolveMetaLabel } from "@/hooks/useResolveLabel";
import { VISUAL_FIRST_NODE_TYPES } from "./visualFirstNodes";
import { EDGE_TYPES } from "./visualFirstEdges";
import { VISUAL_FIRST_ELEMENT_META } from "./visualFirstShapes";
import { computeVisualFirstLayout } from "./visualFirstElkLayout";
import type {
  VisualFirstRelationType,
  VisualFirstDiagramData,
  VisualFirstDiagramNode,
  VisualFirstDiagramEdge,
  ExistingCardDrop,
} from "./visualFirstTypes";
import { VisualFirstRelationSelector } from "./VisualFirstRelationSelector";
import { VisualFirstMissingRelationDialog } from "./VisualFirstMissingRelationDialog";

interface Props {
  diagramId: string;
  initialData: VisualFirstDiagramData;
  onSave?: (data: VisualFirstDiagramData) => void;
  onNodeCardIdsChange?: (ids: Set<string>) => void;
  onCardSelect?: (cardId: string | null) => void;
}

export function VisualFirstCanvas({ diagramId, initialData, onSave, onNodeCardIdsChange, onCardSelect }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<VisualFirstDiagramNode>(
    initialData.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<VisualFirstDiagramEdge>(
    initialData.edges,
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation("visualfirst");
  const { screenToFlowPosition } = useReactFlow();
  const { types, getType } = useMetamodel();
  const rml = useResolveMetaLabel();
  const [duplicateToast, setDuplicateToast] = useState(false);
  const [mismatchToast, setMismatchToast] = useState(false);
  const [createdToast, setCreatedToast] = useState(false);
  const [createdRelationName, setCreatedRelationName] = useState<string>("");

  // Relation selector state
  const [relSelectorOpen, setRelSelectorOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [pendingSourceType, setPendingSourceType] = useState<string>("");
  const [pendingTargetType, setPendingTargetType] = useState<string>("");

  // Missing relation dialog state
  const [missingRelDialogOpen, setMissingRelDialogOpen] = useState(false);
  const [missingRelSource, setMissingRelSource] = useState<string>("");
  const [missingRelTarget, setMissingRelTarget] = useState<string>("");
  const [missingRelType, setMissingRelType] = useState<VisualFirstRelationType | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeTypes = useMemo<Record<string, ComponentType<any>>>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extra: Record<string, ComponentType<any>> = {};
    for (const t of types) {
      if (!t.is_hidden && !VISUAL_FIRST_NODE_TYPES[t.key]) {
        extra[t.key] = VISUAL_FIRST_NODE_TYPES["generic"] ?? Object.values(VISUAL_FIRST_NODE_TYPES)[0];
      }
    }
    return { ...VISUAL_FIRST_NODE_TYPES, ...extra };
  }, [types]);

  useEffect(() => {
    setNodes(initialData.nodes);
    setEdges(initialData.edges);
  }, [initialData, setNodes, setEdges]);

  // Emit nodeCardIds to parent sidebar.
  useEffect(() => {
    const ids = new Set<string>();
    for (const n of nodes) {
      if (n.data.cardId) ids.add(n.data.cardId as string);
      ids.add(n.id);
    }
    onNodeCardIdsChange?.(ids);
  }, [nodes, onNodeCardIdsChange]);

  const scheduleSave = useCallback(
    (nextNodes: VisualFirstDiagramNode[], nextEdges: VisualFirstDiagramEdge[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        const data: VisualFirstDiagramData = { nodes: nextNodes, edges: nextEdges, version: "1" };
        try {
          await api.patch(`/diagrams/${diagramId}`, { data });
          onSave?.(data);
        } catch {
          // ignore save errors silently
        }
      }, 800);
    },
    [diagramId, onSave],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<VisualFirstDiagramNode>[]) => {
      onNodesChange(changes);
      setNodes((nds) => {
        scheduleSave(nds, edges);
        return nds;
      });
    },
    [onNodesChange, setNodes, edges, scheduleSave],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<VisualFirstDiagramEdge>[]) => {
      onEdgesChange(changes);
      setEdges((eds) => {
        scheduleSave(nodes, eds);
        return eds;
      });
    },
    [onEdgesChange, setEdges, nodes, scheduleSave],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      const sourceType = sourceNode?.data.elementTypeKey as string;
      const targetType = targetNode?.data.elementTypeKey as string;

      setPendingConnection(connection);
      setPendingSourceType(sourceType);
      setPendingTargetType(targetType);
      setRelSelectorOpen(true);
    },
    [nodes],
  );

  const handleRelationSelect = useCallback(
    (relationType: VisualFirstRelationType) => {
      if (!pendingConnection) return;
      const newEdge: VisualFirstDiagramEdge = {
        ...pendingConnection,
        id: `e-${Date.now()}`,
        type: relationType,
        data: { relationType },
      } as VisualFirstDiagramEdge;
      setEdges((eds) => {
        const next = addEdge(newEdge, eds);
        scheduleSave(nodes, next);
        return next;
      });
      setRelSelectorOpen(false);
      setPendingConnection(null);
    },
    [pendingConnection, setEdges, nodes, scheduleSave],
  );

  const handleRequestCreateMissing = useCallback(
    (source: string, target: string, relation: VisualFirstRelationType) => {
      setMissingRelSource(source);
      setMissingRelTarget(target);
      setMissingRelType(relation);
      setMissingRelDialogOpen(true);
    },
    [],
  );

  const handleMissingRelationCreated = useCallback(() => {
    setMissingRelDialogOpen(false);
    setCreatedRelationName(missingRelType ?? "");
    setCreatedToast(true);
    setRelSelectorOpen(false);
    setPendingConnection(null);
  }, [missingRelType]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      // ── Drop from Elements tree (existing card) ──────────────────────────────
      const existingJson = event.dataTransfer.getData("archimate/existing-card");
      if (existingJson) {
        const { cardId, typeKey, name } = JSON.parse(existingJson) as ExistingCardDrop;

        if (nodes.some((n) => n.data.cardId === cardId || n.id === cardId)) {
          setDuplicateToast(true);
          return;
        }

        const isArchDrop = getType(typeKey)?.plugin_id === "archimate";
        const canvasHasArch = nodes.some((n) =>
          getType(String(n.data.elementTypeKey ?? ""))?.plugin_id === "archimate",
        );
        const canvasHasStd = nodes.some(
          (n) => getType(String(n.data.elementTypeKey ?? ""))?.plugin_id !== "archimate",
        );
        if ((isArchDrop && canvasHasStd) || (!isArchDrop && canvasHasArch)) {
          setMismatchToast(true);
          return;
        }

        const archMeta = VISUAL_FIRST_ELEMENT_META[typeKey];
        const ct = getType(typeKey);
        const newNode: VisualFirstDiagramNode = {
          id: cardId,
          type: nodeTypes[typeKey] ? typeKey : "ApplicationComponent",
          position,
          data: {
            label: name,
            elementTypeKey: typeKey,
            cardId,
            layer: archMeta?.layer ?? ct?.category ?? "Other",
            aspect: archMeta?.aspect ?? "Other",
            color: archMeta?.defaultColor ?? ct?.color ?? "#e0e0e0",
            icon: ct?.icon,
            width: archMeta?.defaultWidth ?? 160,
            height: archMeta?.defaultHeight ?? 60,
          },
        };
        setNodes((nds) => {
          const next = [...nds, newNode];
          scheduleSave(next, edges);
          return next;
        });
        return;
      }

      // ── Drop from Palette (create new card) ─────────────────────────────────
      const typeKey = event.dataTransfer.getData("archimate/element-type");
      if (!typeKey) return;

      const archMeta = VISUAL_FIRST_ELEMENT_META[typeKey];
      const ct = getType(typeKey);
      const label =
        rml(typeKey, ct?.translations, "label") ||
        typeKey.replace(/([A-Z])/g, " $1").trim();

      const tempId = `temp-${Date.now()}`;
      const newNode: VisualFirstDiagramNode = {
        id: tempId,
        type: nodeTypes[typeKey] ? typeKey : "ApplicationComponent",
        position,
        data: {
          label,
          elementTypeKey: typeKey,
          layer: archMeta?.layer ?? ct?.category ?? "Other",
          aspect: archMeta?.aspect ?? "Other",
          color: archMeta?.defaultColor ?? ct?.color ?? "#e0e0e0",
          icon: ct?.icon,
          width: archMeta?.defaultWidth ?? 160,
          height: archMeta?.defaultHeight ?? 60,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      try {
        const card = (await api.post("/cards", {
          type: typeKey,
          name: label,
        })) as { id: string; name: string };

        setNodes((nds) => {
          const next = nds.map((n) =>
            n.id === tempId
              ? { ...n, id: card.id, data: { ...n.data, cardId: card.id, label: card.name } }
              : n,
          );
          scheduleSave(next, edges);
          return next;
        });
      } catch {
        // keep optimistic node even if API call fails
      }
    },
    [nodes, edges, setNodes, scheduleSave, screenToFlowPosition, nodeTypes, getType, rml],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: VisualFirstDiagramNode) => {
      const cardId = (node.data.cardId as string | undefined) ?? node.id;
      onCardSelect?.(cardId);
    },
    [onCardSelect],
  );

  const handleAutoLayout = useCallback(async () => {
    if (nodes.length === 0) return;

    const layoutInput = {
      nodes: nodes.map((n) => ({
        id: n.id,
        width: (n.data.width as number) || 160,
        height: (n.data.height as number) || 60,
      })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    };

    const positions = await computeVisualFirstLayout(layoutInput);
    const posMap = new Map(positions.map((p) => [p.id, { x: p.x, y: p.y }]));

    setNodes((nds) =>
      nds.map((n) => {
        const pos = posMap.get(n.id);
        return pos ? { ...n, position: pos } : n;
      }),
    );
  }, [nodes, edges, setNodes]);

  const [initialized, setInitialized] = useState(false);

  return (
    <Box ref={reactFlowWrapper} sx={{ flex: 1, position: "relative", height: "100%" }}>
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
        <Button
          size="small"
          variant="outlined"
          aria-label={t("autoLayout")}
          onClick={handleAutoLayout}
          sx={{ fontSize: "11px" }}
        >
          {t("autoLayout")}
        </Button>
      </Box>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={handleNodeClick}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeTypes={nodeTypes as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        edgeTypes={EDGE_TYPES as any}
        onInit={() => setInitialized(true)}
        fitView
      >
        {initialized && (
          <>
            <Background />
            <Controls />
            <MiniMap />
          </>
        )}
      </ReactFlow>

      <VisualFirstRelationSelector
        open={relSelectorOpen}
        sourceTypeKey={pendingSourceType}
        targetTypeKey={pendingTargetType}
        onSelect={handleRelationSelect}
        onClose={() => {
          setRelSelectorOpen(false);
          setPendingConnection(null);
        }}
        onRequestCreateMissing={handleRequestCreateMissing}
      />

      <VisualFirstMissingRelationDialog
        open={missingRelDialogOpen}
        sourceTypeKey={missingRelSource}
        targetTypeKey={missingRelTarget}
        relationType={missingRelType}
        onClose={() => setMissingRelDialogOpen(false)}
        onSuccess={handleMissingRelationCreated}
      />

      <Snackbar
        open={duplicateToast}
        autoHideDuration={3000}
        onClose={() => setDuplicateToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={() => setDuplicateToast(false)} sx={{ fontSize: "12px" }}>
          {t("sidebar.duplicateCard")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={mismatchToast}
        autoHideDuration={4000}
        onClose={() => setMismatchToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setMismatchToast(false)} sx={{ fontSize: "12px" }}>
          {t("sidebar.mixedMetamodel")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={createdToast}
        autoHideDuration={4000}
        onClose={() => setCreatedToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setCreatedToast(false)} sx={{ fontSize: "12px" }}>
          {t("relationSelector.created", { relation: createdRelationName })}
        </Alert>
      </Snackbar>
    </Box>
  );
}
