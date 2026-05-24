import React from 'react';
import { useParams } from 'react-router-dom';
import UmlCanvas from '../components/UmlCanvas';

const UmlCanvasEditor = () => {
  const { diagramId } = useParams<{ diagramId: string }>();

  if (!diagramId) {
    return <div>No diagram selected</div>;
  }

  return (
    <div className="uml-page" style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}>
       <div className="uml-page-header" style={{ padding: '8px 16px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
          <h2>UML Diagram Editor</h2>
       </div>
       <div style={{ flexGrow: 1, position: 'relative' }}>
          <UmlCanvas diagramId={diagramId} />
       </div>
    </div>
  );
};

export default UmlCanvasEditor;
