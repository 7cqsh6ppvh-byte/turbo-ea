import type { Node, Edge } from "@xyflow/react";

export type VisualFirstLayer =
  | "Business"
  | "Application"
  | "Technology"
  | "Motivation"
  | "Strategy"
  | "Implementation"
  | "Physical"
  | "Composite";

export type VisualFirstRelationType =
  | "Association"
  | "Composition"
  | "Aggregation"
  | "Realization"
  | "Assignment"
  | "Serving"
  | "Access"
  | "Influence"
  | "Triggering"
  | "Flow"
  | "Specialization";

export type VisualFirstAspect = "ActiveStructure" | "Behavior" | "PassiveStructure" | "Other";

// Labels for ArchiMate relation types
export const RELATION_LABELS: Record<VisualFirstRelationType, string> = {
  Association: "Association",
  Composition: "Composition",
  Aggregation: "Aggregation",
  Realization: "Realization",
  Assignment: "Assignment",
  Serving: "Serving",
  Access: "Access",
  Influence: "Influence",
  Triggering: "Triggering",
  Flow: "Flow",
  Specialization: "Specialization",
};

export interface VisualFirstDiagramNodeData extends Record<string, unknown> {
  label: string;
  elementTypeKey: string;
  cardId?: string;
  layer: VisualFirstLayer | string;
  aspect: VisualFirstAspect | string;
  color: string;
  width: number;
  height: number;
  icon?: string;
}

export interface ExistingCardDrop {
  cardId: string;
  typeKey: string;
  name: string;
}

export interface VisualFirstDiagramEdgeData extends Record<string, unknown> {
  relationType: VisualFirstRelationType;
  relationId?: string;
  label?: string;
}

export type VisualFirstDiagramNode = Node<VisualFirstDiagramNodeData, string>;
export type VisualFirstDiagramEdge = Edge<VisualFirstDiagramEdgeData>;

export interface VisualFirstDiagramData {
  nodes: VisualFirstDiagramNode[];
  edges: VisualFirstDiagramEdge[];
  viewpoint?: string;
  version: "1";
}

export interface VisualFirstViewpoint {
  id: string;
  name: string;
  description: string;
  layers: VisualFirstLayer[];
  aspects: VisualFirstAspect[];
}

export const VISUAL_FIRST_VIEWPOINTS: VisualFirstViewpoint[] = [
  {
    id: "organization",
    name: "Organization",
    description: "Actors, roles, and organizational structure",
    layers: ["Business"],
    aspects: ["ActiveStructure"],
  },
  {
    id: "business_function",
    name: "Business Function",
    description: "Functions performed by the business",
    layers: ["Business"],
    aspects: ["Behavior"],
  },
  {
    id: "business_process",
    name: "Business Process",
    description: "Business processes and their interactions",
    layers: ["Business"],
    aspects: ["Behavior", "ActiveStructure"],
  },
  {
    id: "business_cooperation",
    name: "Business Cooperation",
    description: "Collaboration between business processes and roles",
    layers: ["Business"],
    aspects: ["Behavior", "ActiveStructure"],
  },
  {
    id: "product",
    name: "Product",
    description: "Products and services offered to customers",
    layers: ["Business"],
    aspects: ["Behavior", "PassiveStructure"],
  },
  {
    id: "application_cooperation",
    name: "Application Cooperation",
    description: "Interactions between applications",
    layers: ["Application"],
    aspects: ["ActiveStructure", "Behavior"],
  },
  {
    id: "application_usage",
    name: "Application Usage",
    description: "How applications support business processes",
    layers: ["Business", "Application"],
    aspects: ["ActiveStructure", "Behavior"],
  },
  {
    id: "application_behavior",
    name: "Application Behavior",
    description: "Application functions, processes and interactions",
    layers: ["Application"],
    aspects: ["Behavior"],
  },
  {
    id: "application_structure",
    name: "Application Structure",
    description: "Application components and their data relations",
    layers: ["Application"],
    aspects: ["ActiveStructure", "PassiveStructure"],
  },
  {
    id: "technology",
    name: "Technology",
    description: "Technology infrastructure and nodes",
    layers: ["Technology"],
    aspects: ["ActiveStructure", "Behavior"],
  },
  {
    id: "technology_usage",
    name: "Technology Usage",
    description: "How technology supports applications",
    layers: ["Application", "Technology"],
    aspects: ["ActiveStructure", "Behavior"],
  },
  {
    id: "infrastructure_usage",
    name: "Infrastructure Usage",
    description: "Infrastructure supporting business and application",
    layers: ["Business", "Application", "Technology"],
    aspects: ["ActiveStructure"],
  },
  {
    id: "implementation_deployment",
    name: "Implementation & Deployment",
    description: "Mapping applications to technology",
    layers: ["Application", "Technology"],
    aspects: ["ActiveStructure", "PassiveStructure"],
  },
  {
    id: "motivation",
    name: "Motivation",
    description: "Drivers, goals, principles and requirements",
    layers: ["Motivation"],
    aspects: ["Other"],
  },
  {
    id: "strategy",
    name: "Strategy",
    description: "Capabilities, resources and courses of action",
    layers: ["Strategy"],
    aspects: ["ActiveStructure", "Behavior"],
  },
  {
    id: "capability_map",
    name: "Capability Map",
    description: "Organizational capabilities",
    layers: ["Strategy"],
    aspects: ["Behavior"],
  },
  {
    id: "roadmap",
    name: "Roadmap",
    description: "Migration planning and plateaus",
    layers: ["Implementation"],
    aspects: ["Behavior", "PassiveStructure"],
  },
  {
    id: "migration",
    name: "Migration",
    description: "Gaps, plateaus and work packages for migration",
    layers: ["Implementation"],
    aspects: ["Behavior", "PassiveStructure"],
  },
  {
    id: "physical",
    name: "Physical",
    description: "Physical equipment, facilities and materials",
    layers: ["Physical"],
    aspects: ["ActiveStructure", "Behavior", "PassiveStructure"],
  },
  {
    id: "layered",
    name: "Layered",
    description: "Full multi-layer view across all ArchiMate layers",
    layers: ["Business", "Application", "Technology"],
    aspects: ["ActiveStructure", "Behavior", "PassiveStructure"],
  },
  {
    id: "total",
    name: "Total",
    description: "All ArchiMate elements across all layers",
    layers: [
      "Business",
      "Application",
      "Technology",
      "Motivation",
      "Strategy",
      "Implementation",
      "Physical",
      "Composite",
    ],
    aspects: ["ActiveStructure", "Behavior", "PassiveStructure", "Other"],
  },
];
