import type { Node, Edge } from "@xyflow/react";

export type UmlDiagramType =
  | "uml-class"
  | "uml-object"
  | "uml-component"
  | "uml-deployment"
  | "uml-package"
  | "uml-composite"
  | "uml-profile"
  | "uml-usecase"
  | "uml-activity"
  | "uml-statemachine"
  | "uml-sequence"
  | "uml-communication"
  | "uml-timing"
  | "uml-interaction-overview";

export type UmlDiagramCategory = "Structural" | "Behavioral" | "Interaction";

export interface UmlDiagramTypeConfig {
  type: UmlDiagramType;
  label: string;
  icon: string;
  category: UmlDiagramCategory;
  allowedElements: string[];
  allowedRelations: string[];
  elkAlgorithm: "layered" | "force" | "stress" | "rectpacking";
}

export interface UmlClassAttribute {
  id: string;
  visibility: "+" | "-" | "#" | "~";
  name: string;
  type: string;
  initialValue?: string;
  isStatic?: boolean;
  isDerived?: boolean;
}

export interface UmlClassOperation {
  id: string;
  visibility: "+" | "-" | "#" | "~";
  name: string;
  parameters: string;
  returnType: string;
  isAbstract?: boolean;
  isStatic?: boolean;
}

export interface UmlNodeData extends Record<string, unknown> {
  label: string;
  elementTypeKey: string;
  cardId?: string;
  // Class diagram
  stereotype?: string;
  isAbstract?: boolean;
  attributes?: UmlClassAttribute[];
  operations?: UmlClassOperation[];
  // State diagram
  entryAction?: string;
  exitAction?: string;
  doAction?: string;
  // Sequence diagram
  instanceOf?: string;
  // Combined fragment
  interactionOperator?:
    | "alt"
    | "opt"
    | "loop"
    | "par"
    | "break"
    | "seq"
    | "strict"
    | "neg"
    | "critical"
    | "assert"
    | "ref";
  guards?: string[];
  // Appearance
  color?: string;
  width?: number;
  height?: number;
}

export interface UmlEdgeData extends Record<string, unknown> {
  relationType: string;
  relationId?: string;
  label?: string;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  guard?: string;
  stereotype?: string;
}

export type UmlDiagramNode = Node<UmlNodeData, string>;
export type UmlDiagramEdge = Edge<UmlEdgeData>;

export interface UmlDiagramData {
  nodes: UmlDiagramNode[];
  edges: UmlDiagramEdge[];
  diagramType: UmlDiagramType;
  version: "1";
}
