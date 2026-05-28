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
import { C4_NODE_TYPES } from "./c4Nodes";
import { C4_EDGE_TYPES } from "./c4Edges";
import { C4_ELEMENT_META } from "./c4Shapes";
import type { C4DiagramData, C4DiagramNode, C4DiagramEdge, C4RelationType } from "./types";
import type { C4DiagramTypeKey } from "./c4Shapes";

interface Props {
  diagramId: string;
  diagramType: C4DiagramTypeKey;
  initialData: C4DiagramData;
  onSave?: (data: C4DiagramData) => void;
}

export function C4Canvas({ diagramId, diagramType, initialData, onSave }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<C4DiagramNode>(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<C4DiagramEdge>(initialData.edges);
  const [initialized, setInitialized] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNodes(initialData.nodes);
    setEdges(initialData.edges);
  }, [initialData, setNodes, setEdges]);

  const scheduleSave = useCallback(
    (nextNodes: C4DiagramNode[], nextEdges: C4DiagramEdge[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        const data: C4DiagramData = { nodes: nextNodes, edges: nextEdges, diagramType, version: "1" };
        try {
          await api.patch(`/diagrams/${diagramId}`, { data });
          onSave?.(data);
        } catch {
          // ignore save errors silently
        }
      }, 800);
    },
    [diagramId, diagramType, onSave],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<C4DiagramNode>[]) => {
      onNodesChange(changes);
      setNodes((nds) => {
        scheduleSave(nds, edges);
        return nds;
      });
    },
    [onNodesChange, setNodes, edges, scheduleSave],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<C4DiagramEdge>[]) => {
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
      const newEdge: C4DiagramEdge = {
        ...connection,
        id: `e-${Date.now()}`,
        type: "c4_rel_uses" as C4RelationType,
        data: { relationType: "c4_rel_uses" },
      } as C4DiagramEdge;
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
      const typeKey = event.dataTransfer.getData("c4/element-type");
      if (!typeKey) return;

      const meta = C4_ELEMENT_META[typeKey];
      if (!meta) return;

      const wrapperRect = reactFlowWrapper.current?.getBoundingClientRect();
      const x = wrapperRect ? event.clientX - wrapperRect.left : event.clientX;
      const y = wrapperRect ? event.clientY - wrapperRect.top : event.clientY;

      const displayLabel = typeKey.replace("c4_", "").replace(/([A-Z])/g, " $1").trim();
      const tempId = `temp-${Date.now()}`;

      const newNode: C4DiagramNode = {
        id: tempId,
        type: typeKey,
        position: { x, y },
        data: {
          label: displayLabel,
          elementTypeKey: typeKey,
          level: meta.level,
          color: meta.defaultColor,
          width: meta.defaultWidth,
          height: meta.defaultHeight,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      try {
        const card = await api.post("/cards", {
          type_key: typeKey,
          name: displayLabel,
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

  return (
    <Box ref={reactFlowWrapper} sx={{ flex: 1, position: "relative", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeTypes={C4_NODE_TYPES as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        edgeTypes={C4_EDGE_TYPES as any}
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
