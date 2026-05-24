import { useState, useEffect, useCallback } from 'react';
import { fetchDiagram, addCardToDiagram, removeCardFromDiagram, updateCardPosition } from '../api/umlApi';

export const useDiagram = (diagramId: string) => {
  const [diagram, setDiagram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDiagram = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDiagram(diagramId);
      setDiagram(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load diagram');
    } finally {
      setLoading(false);
    }
  }, [diagramId]);

  useEffect(() => {
    if (diagramId) {
      loadDiagram();
    }
  }, [diagramId, loadDiagram]);

  return { diagram, loading, error, refresh: loadDiagram };
};

export const useCanvasEvents = (diagramId: string, onRefresh: () => void) => {
  const handleDrop = useCallback(async (cardId: string, position: { x: number, y: number }) => {
    try {
      await addCardToDiagram(diagramId, cardId, position.x, position.y);
      onRefresh();
    } catch (err) {
      console.error('Failed to add card:', err);
    }
  }, [diagramId, onRefresh]);

  const handleNodeDragStop = useCallback(async (cardId: string, position: { x: number, y: number }) => {
    try {
      await updateCardPosition(diagramId, cardId, position.x, position.y);
    } catch (err) {
      console.error('Failed to update position:', err);
    }
  }, [diagramId]);

  const handleRemoveNode = useCallback(async (cardId: string) => {
    try {
      await removeCardFromDiagram(diagramId, cardId);
      onRefresh();
    } catch (err) {
      console.error('Failed to remove card:', err);
    }
  }, [diagramId, onRefresh]);

  return { handleDrop, handleNodeDragStop, handleRemoveNode };
};

export const useExport = (diagramId: string) => {
  const [exporting, setExporting] = useState(false);

  const exportAs = useCallback(async (format: 'plantuml' | 'svg' | 'png') => {
    setExporting(true);
    try {
      const result = await fetch(`/api/uml-diagrams/${diagramId}/export?format=${format}`);
      if (!result.ok) throw new Error('Export failed');
      
      if (format === 'plantuml') {
        const text = await result.text();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagram-${diagramId}.puml`;
        a.click();
      } else {
        const blob = await result.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagram-${diagramId}.${format}`;
        a.click();
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  }, [diagramId]);

  return { exportAs, exporting };
};
