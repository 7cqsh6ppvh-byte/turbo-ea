import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
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
import { api } from "@/api/client";
import { NODE_TYPES } from "./archimateNodes";
import { EDGE_TYPES } from "./archimateEdges";
import { ARCHIMATE_ELEMENT_META } from "./archimateShapes";
import { computeArchiMateLayout } from "./archimateElkLayout";
import type { ArchiMateDiagramData, ArchiMateDiagramNode, ArchiMateDiagramEdge } from "./types";

interface Props {
  diagramId: string;
  initialData: ArchiMateDiagramData;
  onSave?: (data: ArchiMateDiagramData) => void;
}

export function ArchimateCanvas({ diagramId, initialData, onSave }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<ArchiMateDiagramNode>(
    initialData.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<ArchiMateDiagramEdge>(
    initialData.edges,
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNodes(initialData.nodes);
    setEdges(initialData.edges);
  }, [initialData, setNodes, setEdges]);

  const scheduleSave = useCallback(
    (nextNodes: ArchiMateDiagramNode[], nextEdges: ArchiMateDiagramEdge[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        const data: ArchiMateDiagramData = { nodes: nextNodes, edges: nextEdges, version: "1" };
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
    (changes: NodeChange<ArchiMateDiagramNode>[]) => {
      onNodesChange(changes);
      setNodes((nds) => {
        scheduleSave(nds, edges);
        return nds;
      });
    },
    [onNodesChange, setNodes, edges, scheduleSave],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<ArchiMateDiagramEdge>[]) => {
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
      const newEdge: ArchiMateDiagramEdge = {
        ...connection,
        id: `e-${Date.now()}`,
        type: "arch_rel_Association",
        data: { relationType: "arch_rel_Association" },
      } as ArchiMateDiagramEdge;
      setEdges((eds) => {
        const next = addEdge(newEdge, eds);
        scheduleSave(nodes, next);
        return next;
      });
    },
    [setEdges, nodes, scheduleSave],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const typeKey = event.dataTransfer.getData("archimate/element-type");
      if (!typeKey) return;

      const meta = ARCHIMATE_ELEMENT_META[typeKey];
      if (!meta) return;

      const wrapperRect = reactFlowWrapper.current?.getBoundingClientRect();
      const x = wrapperRect ? event.clientX - wrapperRect.left : event.clientX;
      const y = wrapperRect ? event.clientY - wrapperRect.top : event.clientY;

      const tempId = `temp-${Date.now()}`;
      const newNode: ArchiMateDiagramNode = {
        id: tempId,
        type: typeKey,
        position: { x, y },
        data: {
          label: typeKey.replace("arch_", "").replace(/([A-Z])/g, " $1").trim(),
          elementTypeKey: typeKey,
          layer: meta.layer,
          aspect: meta.aspect,
          color: meta.defaultColor,
          width: meta.defaultWidth,
          height: meta.defaultHeight,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      try {
        const card = await api.post("/cards", {
          type_key: typeKey,
          name: newNode.data.label,
        }) as { id: string; name: string };

        setNodes((nds) =>
          nds.map((n) =>
            n.id === tempId
              ? { ...n, id: card.id, data: { ...n.data, cardId: card.id, label: card.name } }
              : n,
          ),
        );
      } catch {
        // keep optimistic node even if API call fails
      }
    },
    [setNodes],
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

    const positions = await computeArchiMateLayout(layoutInput);
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
          aria-label="Auto Layout"
          onClick={handleAutoLayout}
          sx={{ fontSize: "11px" }}
        >
          Auto Layout
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeTypes={NODE_TYPES as any}
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
    </Box>
  );
}
