import type { Node, Edge } from "@xyflow/react";

export type ArchiMateLayer =
  | "Business"
  | "Application"
  | "Technology"
  | "Motivation"
  | "Strategy"
  | "Implementation"
  | "Physical"
  | "Composite";

export type ArchiMateRelationType =
  | "arch_rel_Association"
  | "arch_rel_Composition"
  | "arch_rel_Aggregation"
  | "arch_rel_Realization"
  | "arch_rel_Assignment"
  | "arch_rel_Serving"
  | "arch_rel_Access"
  | "arch_rel_Influence"
  | "arch_rel_Triggering"
  | "arch_rel_Flow"
  | "arch_rel_Specialization";

export type ArchiMateAspect = "ActiveStructure" | "Behavior" | "PassiveStructure" | "Other";

export interface ArchiMateDiagramNodeData extends Record<string, unknown> {
  label: string;
  elementTypeKey: string;
  cardId?: string;
  layer: ArchiMateLayer;
  aspect: ArchiMateAspect;
  color: string;
  width: number;
  height: number;
}

export interface ArchiMateDiagramEdgeData extends Record<string, unknown> {
  relationType: ArchiMateRelationType;
  relationId?: string;
  label?: string;
}

export type ArchiMateDiagramNode = Node<ArchiMateDiagramNodeData, string>;
export type ArchiMateDiagramEdge = Edge<ArchiMateDiagramEdgeData>;

export interface ArchiMateDiagramData {
  nodes: ArchiMateDiagramNode[];
  edges: ArchiMateDiagramEdge[];
  viewpoint?: string;
  version: "1";
}

export interface ArchiMateViewpoint {
  id: string;
  name: string;
  description: string;
  layers: ArchiMateLayer[];
  aspects: ArchiMateAspect[];
}

export const ARCHIMATE_VIEWPOINTS: ArchiMateViewpoint[] = [
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
