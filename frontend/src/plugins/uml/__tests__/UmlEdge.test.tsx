import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UmlEdge from '../components/UmlEdge';
import { Position } from 'reactflow';

// Mock reactflow's utility functions as they require a complex internal state
jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  getBezierPath: jest.fn(() => ['M0 0 L100 100', 50, 50]),
  BaseEdge: ({ path, markerEnd, style }: any) => (
    <path d={path} markerEnd={markerEnd} style={style} data-testid="base-edge" />
  ),
  EdgeLabelRenderer: ({ children }: any) => <div data-testid="label-renderer">{children}</div>,
}));

const defaultEdgeProps = {
  id: 'e1-2',
  sourceX: 0,
  sourceY: 0,
  targetX: 100,
  targetY: 100,
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
  data: { label: 'my-relation' },
};

describe('UmlEdge', () => {
  it('renders a base edge path', () => {
    render(<UmlEdge {...defaultEdgeProps} />);
    const edge = screen.getByTestId('base-edge');
    expect(edge).toBeInTheDocument();
    expect(edge).toHaveAttribute('d', 'M0 0 L100 100');
  });

  it('renders a label if provided in data', () => {
    render(<UmlEdge {...defaultEdgeProps} />);
    expect(screen.getByText('my-relation')).toBeInTheDocument();
  });

  it('applies dashed style for implementation relations', () => {
    const dashedProps = {
      ...defaultEdgeProps,
      data: { plantuml_arrow: '--|>', label: 'implements' },
    };
    render(<UmlEdge {...dashedProps} />);
    const edge = screen.getByTestId('base-edge');
    expect(edge.style.strokeDasharray).toBe('5,5');
  });

  it('applies solid style by default', () => {
    render(<UmlEdge {...defaultEdgeProps} />);
    const edge = screen.getByTestId('base-edge');
    expect(edge.style.strokeDasharray).toBe('none');
  });
});
