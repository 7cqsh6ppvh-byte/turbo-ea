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
import { NODE_TYPES } from "./umlNodes";
import { EDGE_TYPES } from "./umlEdges";
import { UML_ELEMENT_META } from "./umlShapes";
import { applyElkLayout } from "./umlElkLayout";
import { getUmlDiagramTypeConfig } from "./umlDiagramTypes";
import UmlRelationSelector from "./UmlRelationSelector";
import type { UmlDiagramData, UmlDiagramNode, UmlDiagramEdge, UmlDiagramType } from "./types";

interface Props {
  diagramId: string;
  diagramType: UmlDiagramType;
  initialData: UmlDiagramData;
  onSave?: (data: UmlDiagramData) => void;
}

interface PendingConnection {
  connection: Connection;
  anchorPos: { x: number; y: number };
}

export function UmlCanvas({ diagramId, diagramType, initialData, onSave }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<UmlDiagramNode>(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<UmlDiagramEdge>(initialData.edges);
  const [pendingConn, setPendingConn] = useState<PendingConnection | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [initialized, setInitialized] = useState(false);

  const config = getUmlDiagramTypeConfig(diagramType);

  useEffect(() => {
    setNodes(initialData.nodes);
    setEdges(initialData.edges);
  }, [initialData, setNodes, setEdges]);

  const scheduleSave = useCallback(
    (nextNodes: UmlDiagramNode[], nextEdges: UmlDiagramEdge[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        const data: UmlDiagramData = {
          nodes: nextNodes,
          edges: nextEdges,
          diagramType,
          version: "1",
        };
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
    (changes: NodeChange<UmlDiagramNode>[]) => {
      onNodesChange(changes);
      setNodes((nds) => {
        scheduleSave(nds, edges);
        return nds;
      });
    },
    [onNodesChange, setNodes, edges, scheduleSave],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<UmlDiagramEdge>[]) => {
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
      // Show relation selector popup near the target node
      const wrapperRect = reactFlowWrapper.current?.getBoundingClientRect();
      const anchorPos = {
        x: (wrapperRect?.left ?? 0) + (wrapperRect?.width ?? 400) / 2,
        y: (wrapperRect?.top ?? 0) + 200,
      };
      setPendingConn({ connection, anchorPos });
    },
    [],
  );

  const handleRelationSelected = useCallback(
    (relTypeKey: string) => {
      if (!pendingConn) return;
      const newEdge: UmlDiagramEdge = {
        ...pendingConn.connection,
        id: `e-${Date.now()}`,
        type: relTypeKey,
        data: { relationType: relTypeKey, relTypeKey },
      } as UmlDiagramEdge;
      setEdges((eds) => {
        const next = addEdge(newEdge, eds);
        scheduleSave(nodes, next);
        return next;
      });
      setPendingConn(null);
    },
    [pendingConn, setEdges, nodes, scheduleSave],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const typeKey = event.dataTransfer.getData("uml/element-type");
      if (!typeKey) return;

      const meta = UML_ELEMENT_META[typeKey];
      if (!meta) return;

      const wrapperRect = reactFlowWrapper.current?.getBoundingClientRect();
      const x = wrapperRect ? event.clientX - wrapperRect.left : event.clientX;
      const y = wrapperRect ? event.clientY - wrapperRect.top : event.clientY;

      const tempId = `temp-${Date.now()}`;
      const labelWords = typeKey.replace("uml_", "").replace(/([A-Z])/g, " $1").trim();
      const newNode: UmlDiagramNode = {
        id: tempId,
        type: meta.nodeType,
        position: { x, y },
        data: {
          label: labelWords,
          elementTypeKey: typeKey,
          color: meta.defaultColor,
          width: meta.defaultWidth,
          height: meta.defaultHeight,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      try {
        const card = await api.post("/cards", {
          type_key: typeKey,
          name: labelWords,
        }) as { id: string; name: string };

        setNodes((nds) =>
          nds.map((n) =>
            n.id === tempId
              ? {
                  ...n,
                  id: card.id,
                  data: { ...n.data, cardId: card.id, label: card.name },
                }
              : n,
          ),
        );
        scheduleSave(
          nodes.concat({
            ...newNode,
            id: card.id,
            data: { ...newNode.data, cardId: card.id, label: card.name },
          }),
          edges,
        );
      } catch {
        // keep optimistic node
        scheduleSave(nodes.concat(newNode), edges);
      }
    },
    [setNodes, nodes, edges, scheduleSave],
  );

  const handleAutoLayout = useCallback(async () => {
    if (nodes.length === 0) return;
    const algorithm = config?.elkAlgorithm ?? "layered";
    const laid = await applyElkLayout(nodes, edges, algorithm);
    setNodes(laid);
  }, [nodes, edges, config, setNodes]);

  return (
    <Box ref={reactFlowWrapper} sx={{ flex: 1, position: "relative", height: "100%" }}>
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10, display: "flex", gap: 1 }}>
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
        deleteKeyCode="Delete"
      >
        {initialized && (
          <>
            <Background />
            <Controls />
            <MiniMap />
          </>
        )}
      </ReactFlow>

      {pendingConn && (
        <UmlRelationSelector
          diagramType={diagramType}
          anchorPos={pendingConn.anchorPos}
          onSelect={handleRelationSelected}
          onClose={() => setPendingConn(null)}
        />
      )}
    </Box>
  );
}
