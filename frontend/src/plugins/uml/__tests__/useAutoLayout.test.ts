import { renderHook, act } from '@testing-library/react';
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import { useAutoLayout } from '../hooks/useAutoLayout';
import { useDiagram } from '../hooks/useDiagram';
import { updateNodePositions } from '../api/umlApi';

vi.mock('../hooks/useDiagram', () => ({
  useDiagram: vi.fn(),
}));
vi.mock('../api/umlApi', () => ({
  updateNodePositions: vi.fn(),
}));

const mockedUseDiagram = useDiagram as any;
const mockedUpdateNodePositions = updateNodePositions as any;

describe('useAutoLayout', () => {
  const mockDiagram = {
    id: 'd1',
    name: 'Test Diagram',
    cards: [
      { card_id: '1', name: 'Card 1', x_pos: 0, y_pos: 0, type: { notation: 'UML', plantuml_keyword: 'class' } },
      { card_id: '2', name: 'Card 2', x_pos: 100, y_pos: 100, type: { notation: 'UML', plantuml_keyword: 'class' } },
      { card_id: '3', name: 'Card 3', x_pos: 200, y_pos: 200, type: { notation: 'UML', plantuml_keyword: 'class' } },
    ],
    relations: [],
  };

  beforeEach(() => {
    mockedUseDiagram.mockReturnValue({
      diagram: mockDiagram,
      loading: false,
      error: null,
    });
    mockedUpdateNodePositions.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return a layout function', () => {
    const { result } = renderHook(() => useAutoLayout('d1'));
    expect(result.current.runLayout).toBeInstanceOf(Function);
  });

  it('should reposition all nodes when layout is run', async () => {
    const { result } = renderHook(() => useAutoLayout('d1'));
    const { runLayout } = result.current;

    await act(async () => {
      await runLayout();
    });

    expect(mockedUpdateNodePositions).toHaveBeenCalled();
  });
});