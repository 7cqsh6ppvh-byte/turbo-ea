/**
 * UML Plugin API Client
 */

const API_BASE = '/api/uml-diagrams';

export const fetchDiagrams = async (workspaceId: string) => {
  const resp = await fetch(`${API_BASE}?workspace_id=${workspaceId}`);
  if (!resp.ok) throw new Error('Failed to fetch UML diagrams');
  return resp.json();
};

export const fetchDiagram = async (id: string) => {
  const resp = await fetch(`${API_BASE}/${id}`);
  if (!resp.ok) throw new Error('Failed to fetch UML diagram');
  return resp.json();
};

export const createDiagram = async (workspaceId: string, name: string) => {
  const resp = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspace_id: workspaceId, name }),
  });
  if (!resp.ok) throw new Error('Failed to create UML diagram');
  return resp.json();
};

export const addCardToDiagram = async (diagramId: string, cardId: string, x: number, y: number) => {
  const resp = await fetch(`${API_BASE}/${diagramId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card_id: cardId, x_pos: x, y_pos: y }),
  });
  if (!resp.ok) throw new Error('Failed to add card to diagram');
  return resp.json();
};

export const updateCardPosition = async (diagramId: string, cardId: string, x: number, y: number) => {
  const resp = await fetch(`${API_BASE}/${diagramId}/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x_pos: x, y_pos: y }),
  });
  if (!resp.ok) throw new Error('Failed to update card position');
  return resp.json();
};

export const removeCardFromDiagram = async (diagramId: string, cardId: string) => {
  const resp = await fetch(`${API_BASE}/${diagramId}/cards/${cardId}`, {
    method: 'DELETE',
  });
  if (!resp.ok) throw new Error('Failed to remove card from diagram');
  return resp;
};

export const deleteDiagram = async (id: string) => {
  const resp = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!resp.ok) throw new Error('Failed to delete diagram');
  return resp;
};

export const exportDiagram = async (id: string, format: 'plantuml' | 'svg' | 'png') => {
  const url = `${API_BASE}/${id}/export?format=${format}`;
  if (format === 'plantuml') {
      const resp = await fetch(url);
      return resp.text();
  }
  // For images, we usually want a blob or a direct link
  return url;
};
