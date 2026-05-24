import React, { useState, useRef, memo } from 'react';
import { NodeProps, Handle, Position, useReactFlow } from 'reactflow';
import MaterialSymbol from '@/components/MaterialSymbol';
import './UmlNode.css'; // Assuming CSS for styling

interface UmlNodeData {
  label: string;
  type: {
    notation: string;
    plantuml_keyword: string;
    plantuml_stereotype: string;
    plantuml_color: string;
  };
  onRemove: (cardId: string) => void;
  onPositionChange: (cardId: string, x: number, y: number) => void;
}

const UmlNode: React.FC<NodeProps<UmlNodeData>> = ({ data, id, selected }) => {
  const reactFlowInstance = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (currentLabel !== data.label) {
      // Update label logic - would ideally call an API here
      console.log(`Updating label for node ${id} to: ${currentLabel}`);
      // In a real scenario, call an API to update the card name
      // For now, we'll simulate the position update on label change
      if (nodeRef.current) {
        const { x, y } = nodeRef.current.getBoundingClientRect();
        const rflowBounds = reactFlowInstance.getViewport();
        const nodeX = (x - rflowBounds.x) / rflowBounds.zoom;
        const nodeY = (y - rflowBounds.y) / rflowBounds.zoom;
        data.onPositionChange(id, nodeX, nodeY); // Simulate position update with label change
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      inputRef.current?.blur();
    } else if (event.key === 'Escape') {
      setCurrentLabel(data.label);
      setIsEditing(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLabel(event.target.value);
  };

  // Determine node class based on type or stereotype
  let nodeClass = 'uml-node';
  if (data.type) {
    if (data.type.plantuml_keyword === 'interface') {
      nodeClass += ' uml-node-interface';
    } else if (data.type.plantuml_keyword === 'abstract') {
      nodeClass += ' uml-node-abstract';
    } else if (data.type.plantuml_keyword === 'component') {
      nodeClass += ' uml-node-component';
    }
    if (data.type.plantuml_stereotype) {
      nodeClass += ` uml-node-stereotype-${data.type.plantuml_stereotype.replace(/[«»]/g, '').toLowerCase()}`;
    }
  }
  if (selected) {
    nodeClass += ' selected';
  }

  return (
    <div ref={nodeRef} className={nodeClass} onDoubleClick={handleDoubleClick}>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle type="target" position={Position.Top} id="b" />

      <div className="uml-node-header">
        {!isEditing ? (
          <span className="uml-node-label">{data.label}</span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={currentLabel}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="uml-node-input"
          />
        )}
        {data.type?.plantuml_stereotype && (
          <span className="uml-node-stereotype">{data.type.plantuml_stereotype}</span>
        )}
        <button onClick={() => data.onRemove(id)} className="uml-node-delete-button">
          <MaterialSymbol icon="close" size={18} />
        </button>
      </div>

      {data.type?.plantuml_keyword === 'component' && (
        <div className="uml-node-icon">
          <MaterialSymbol icon="widgets" size={24} /> {/* Example icon */} 
        </div>
      )}

      {/* Add other compartments here if needed based on card type */}
    </div>
  );
};

export default memo(UmlNode);
