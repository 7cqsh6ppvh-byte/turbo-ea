import ELK from "elkjs/lib/elk.bundled.js";
import type { Node, Edge } from "@xyflow/react";
import type { UmlDiagramNode, UmlDiagramEdge } from "./types";

const elk = new ELK();

export type ElkAlgorithm =
  | "layered"
  | "stress"
  | "mrtree"
  | "force"
  | "disco"
  | "rectpacking"
  | "radial";

const ALGORITHM_DEFAULTS: Record<ElkAlgorithm, Record<string, string>> = {
  layered: {
    "elk.algorithm": "layered",
    "elk.direction": "DOWN",
    "elk.layered.spacing.nodeNodeBetweenLayers": "60",
    "elk.spacing.nodeNode": "40",
    "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  },
  stress: {
    "elk.algorithm": "stress",
    "elk.spacing.nodeNode": "80",
  },
  mrtree: {
    "elk.algorithm": "mrtree",
    "elk.direction": "DOWN",
    "elk.spacing.nodeNode": "40",
  },
  force: {
    "elk.algorithm": "force",
    "elk.spacing.nodeNode": "60",
  },
  disco: {
    "elk.algorithm": "disco",
    "elk.spacing.nodeNode": "60",
  },
  rectpacking: {
    "elk.algorithm": "rectpacking",
    "elk.spacing.nodeNode": "20",
  },
  radial: {
    "elk.algorithm": "radial",
    "elk.spacing.nodeNode": "40",
  },
};

export async function applyElkLayout(
  nodes: Node<UmlDiagramNode["data"]>[],
  edges: Edge<UmlDiagramEdge["data"]>[],
  algorithm: ElkAlgorithm = "layered",
): Promise<Node<UmlDiagramNode["data"]>[]> {
  if (nodes.length === 0) return nodes;

  const layoutOptions = ALGORITHM_DEFAULTS[algorithm] ?? ALGORITHM_DEFAULTS.layered;

  const elkGraph = {
    id: "root",
    layoutOptions,
    children: nodes.map((n) => ({
      id: n.id,
      width: n.measured?.width ?? (n.data?.width as number) ?? 160,
      height: n.measured?.height ?? (n.data?.height as number) ?? 60,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };

  try {
    const laid = await elk.layout(elkGraph);
    const posMap = new Map<string, { x: number; y: number }>();
    for (const child of laid.children ?? []) {
      posMap.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
    }
    return nodes.map((n) => {
      const pos = posMap.get(n.id);
      if (!pos) return n;
      return { ...n, position: pos };
    });
  } catch {
    return nodes;
  }
}
