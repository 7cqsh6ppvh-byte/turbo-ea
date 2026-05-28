import { useCallback, useEffect, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState, type Connection, type Node, type Edge, type OnConnectEnd } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { api } from "@/api/client";
import { AWS_NODE_TYPES_MAP } from "./awsNodes";
import { AWS_EDGE_TYPES } from "./awsEdges";
import { AWS_ELEMENT_MAP } from "./awsShapes";

interface Props {
  diagramId: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  onSave: (nodes: Node[], edges: Edge[]) => void;
}

export default function AwsCanvas({ diagramId, initialNodes, initialEdges, onSave }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSave(n: Node[], e: Edge[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onSave(n, e), 800);
  }

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [diagramId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge({ ...params, type: "aws_rel_serviceDependency", data: { relationType: "aws_rel_serviceDependency" } }, edges);
      setEdges(newEdges);
      scheduleSave(nodes, newEdges);
    },
    [edges, nodes], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const elementTypeKey = event.dataTransfer.getData("aws/element-type");
      if (!elementTypeKey) return;
      const meta = AWS_ELEMENT_MAP.get(elementTypeKey);
      if (!meta) return;

      const bounds = (event.target as HTMLElement).closest(".react-flow")?.getBoundingClientRect();
      const x = bounds ? event.clientX - bounds.left : event.clientX;
      const y = bounds ? event.clientY - bounds.top : event.clientY;

      let cardId: string | undefined;
      try {
        const card = await api.post<{ id: string }>("/cards", {
          name: meta.label,
          type: elementTypeKey,
          status: "DRAFT",
        });
        cardId = card.id;
      } catch {}

      const newNode: Node = {
        id: `aws-${Date.now()}`,
        type: elementTypeKey,
        position: { x, y },
        data: { label: meta.label, elementTypeKey, cardId },
      };
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      scheduleSave(newNodes, edges);
    },
    [nodes, edges], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes);
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
        }}
        onNodesChangeCapture={() => scheduleSave(nodes, edges)}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={AWS_NODE_TYPES_MAP}
        edgeTypes={AWS_EDGE_TYPES}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
