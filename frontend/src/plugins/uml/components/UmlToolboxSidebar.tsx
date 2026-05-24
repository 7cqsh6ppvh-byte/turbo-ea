import React, { useState, useEffect } from 'react';

const UmlToolboxSidebar = () => {
  const [cardTypes, setCardTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      try {
        // Fetch card types filtered by notation 'UML'
        const resp = await fetch('/api/card-types?notation=UML');
        if (resp.ok) {
          const data = await resp.json();
          setCardTypes(data);
        }
      } catch (err) {
        console.error('Failed to load UML types', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  const onDragStart = (event: React.DragEvent, typeId: string) => {
    event.dataTransfer.setData('application/turboea/card-type-id', typeId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="uml-toolbox" style={{ width: 200, borderRight: '1px solid #ccc', padding: 10 }}>
      <h3>UML Toolbox</h3>
      {loading && <p>Loading...</p>}
      <div className="toolbox-items" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cardTypes.map(type => (
          <div
            key={type.id}
            draggable
            onDragStart={(e) => onDragStart(e, type.id)}
            style={{
              padding: '8px 12px',
              background: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: 4,
              cursor: 'grab',
              fontSize: '0.9rem'
            }}
          >
            {type.name}
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 20 }}>
        Drag items onto the canvas to add cards.
      </p>
    </div>
  );
};

export default UmlToolboxSidebar;
