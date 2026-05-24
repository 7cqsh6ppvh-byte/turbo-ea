import { useState, useCallback } from 'react';
import { useDiagram } from './useDiagram';
import { updateNodePositions } from '../api/umlApi';
import * as dagre from 'dagre';

export const useAutoLayout = (diagramId: string) => {
  const { diagram, loading, error } = useDiagram(diagramId);
  const [isLayoutRunning, setIsLayoutRunning] = useState(false);

  const runLayout = useCallback(async () => {
    if (!diagram || loading || error || !diagram.cards || diagram.cards.length === 0) {
      return;
    }

    setIsLayoutRunning(true);
    try {
      // Create a new directed graph
      const g = new dagre.graphlib.Graph();
      g.setGraph({ nodesep: 50, ranksep: 50, rankdir: 'TB' });

      // Add nodes to the graph
      diagram.cards.forEach((card: any) => {
        g.setNode(card.card_id, {
          width: 120, // default width
          height: 60, // default height
        });
      });

      // Add edges to the graph (only for relations between cards in this diagram)
      const cardIds = new Set(diagram.cards.map((c: any) => c.card_id));
      diagram.relations.forEach((rel: any) => {
        if (cardIds.has(rel.source_id) && cardIds.has(rel.target_id)) {
          g.setEdge(rel.source_id, rel.target_id);
        }
      });

      // Run the layout algorithm
      dagre.layout(g);

      // Extract new positions
      const newPositions: Record<string, { x: number; y: number }> = {};
      diagram.cards.forEach((card: any) => {
        const node = g.node(card.card_id);
        if (node) {
          newPositions[card.card_id] = {
            x: Math.round(node.x),
            y: Math.round(node.y),
          };
        }
      });

      // Save new positions to the API
      await updateNodePositions(diagramId, newPositions);
    } catch (err) {
      console.error('Auto-layout failed:', err);
    } finally {
      setIsLayoutRunning(false);
    }
  }, [diagram, diagramId, loading, error]);

  return { runLayout, isLayoutRunning };
};
