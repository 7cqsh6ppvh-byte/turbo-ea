import type { Node, Edge } from "@xyflow/react";

export type C4Level = "C4:Context" | "C4:Container" | "C4:Component" | "C4:Boundary";

export type C4RelationType =
  | "c4_rel_uses"
  | "c4_rel_callsSync"
  | "c4_rel_callsAsync"
  | "c4_rel_readsFrom"
  | "c4_rel_writesTo"
  | "c4_rel_deployedIn";

export interface C4DiagramNodeData extends Record<string, unknown> {
  label: string;
  elementTypeKey: string;
  cardId?: string;
  level: C4Level;
  color: string;
  technology?: string;
  description?: string;
  external?: boolean;
  width: number;
  height: number;
}

export interface C4DiagramEdgeData extends Record<string, unknown> {
  relationType: C4RelationType;
  relationId?: string;
  label?: string;
  technology?: string;
}

export type C4DiagramNode = Node<C4DiagramNodeData, string>;
export type C4DiagramEdge = Edge<C4DiagramEdgeData>;

export interface C4DiagramData {
  nodes: C4DiagramNode[];
  edges: C4DiagramEdge[];
  diagramType: "c4-context" | "c4-container" | "c4-component" | "c4-code";
  version: "1";
}
