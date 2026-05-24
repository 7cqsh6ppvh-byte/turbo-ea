import { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  XYPosition,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useDiagram, useCanvasEvents, useAutoLayout } from '../hooks/useDiagram';
import UmlNode from './UmlNode';
import UmlEdge from './UmlEdge';
import UmlToolboxSidebar from './UmlToolboxSidebar';
import UmlExportDropdown from './UmlExportDropdown';

import './UmlCanvas.css';

const nodeTypes = {
  umlNode: UmlNode,
};

const edgeTypes = {
  umlEdge: UmlEdge,
};

interface UmlCanvasProps {
  diagramId: string;
}

const UmlCanvas: React.FC<UmlCanvasProps> = ({ diagramId }) => {
  const { diagram, loading, error, refresh } = useDiagram(diagramId);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Convert diagram cards to React Flow nodes
  const initialNodes = useMemo(() => {
    return (diagram?.cards || []).map((dc: any) => ({
      id: dc.card_id,
      type: 'umlNode',
      position: { x: dc.x_pos || 0, y: dc.y_pos || 0 },
      data: {
        label: dc.card.name,
        type: dc.card.type,
        onRemove: () => handleRemoveNode(dc.card_id),
        onPositionChange: (id: string, x: number, y: number) => handleNodeDragStop(id, { x, y }),
      },
    }));
  }, [diagram]);

  // Convert diagram relations to React Flow edges
  const initialEdges = useMemo(() => {
    return (diagram?.relations || []).map((rel: any) => ({
      id: `e-${rel.id}`,
      source: rel.source_id,
      target: rel.target_id,
      type: 'umlEdge',
      data: {
        label: rel.name,
        plantuml_arrow: rel.type?.plantuml_arrow,
      },
    }));
  }, [diagram]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync state when diagram loads
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const { handleDrop, handleNodeDragStop, handleRemoveNode } = useCanvasEvents(diagramId, refresh);

  const onConnect = useCallback(
    (params: Connection) => {
      // In a real app, this would call handleCreateRelation API
      console.log('Connecting', params);
      setEdges((eds) => addEdge({ ...params, type: 'umlEdge' }, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !rfInstance) return;

      const cardTypeId = event.dataTransfer.getData('application/turboea/card-type-id');

      if (!cardTypeId) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // trigger API call to create card and add to diagram
      handleDrop(cardTypeId, position);
    },
    [rfInstance, handleDrop]
  );

  if (loading) return <div className="uml-canvas-loading">Loading Diagram...</div>;
  if (error) return <div className="uml-canvas-error">Error: {error}</div>;

  return (
    <div className="uml-editor-container">
      <UmlToolboxSidebar />
      <div className="uml-canvas-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <Panel position="top-left">
            <Button
              variant="outlined"
              size="small"
              onClick={runLayout}
              disabled={isLayoutRunning}
              startIcon={isLayoutRunning ? <CircularProgress size={18} /> : <MaterialSymbol icon="crop_rotate" />}
            >
              {isLayoutRunning ? 'Layouting...' : 'Auto-layout'}
            </Button>
          </Panel>
          <Panel position="top-right">
             <UmlExportDropdown diagramId={diagramId} />
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default UmlCanvas;
