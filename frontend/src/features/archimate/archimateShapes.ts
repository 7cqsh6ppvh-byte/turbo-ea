import type { ArchiMateAspect, ArchiMateLayer, ArchiMateRelationType } from "./types";

export interface ArchiMateElementMeta {
  layer: ArchiMateLayer;
  aspect: ArchiMateAspect;
  icon: string;
  defaultColor: string;
  defaultWidth: number;
  defaultHeight: number;
}

export interface ArchiMateRelationStyle {
  strokeDasharray?: string;
  strokeWidth?: number;
  sourceMarker?: "diamond-filled" | "diamond-hollow" | "circle-filled" | "arrow-hollow";
  targetMarker?: "arrow-open" | "arrow-filled" | "triangle-hollow";
  animated?: boolean;
}

export const ARCHIMATE_LAYER_COLORS: Record<ArchiMateLayer, string> = {
  Business: "#f5e27a",
  Application: "#b3d9ff",
  Technology: "#aae6aa",
  Motivation: "#ffcca8",
  Strategy: "#d9b3ff",
  Implementation: "#e0e0e0",
  Physical: "#c8e6c9",
  Composite: "#ffffff",
};

export const ARCHIMATE_ELEMENT_META: Record<string, ArchiMateElementMeta> = {
  // Business Layer — Active Structure
  BusinessActor: { layer: "Business", aspect: "ActiveStructure", icon: "person", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  BusinessRole: { layer: "Business", aspect: "ActiveStructure", icon: "badge", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  BusinessCollaboration: { layer: "Business", aspect: "ActiveStructure", icon: "group", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  BusinessInterface: { layer: "Business", aspect: "ActiveStructure", icon: "swap_horiz", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  // Business Layer — Behavior
  BusinessProcess: { layer: "Business", aspect: "Behavior", icon: "route", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  BusinessFunction: { layer: "Business", aspect: "Behavior", icon: "functions", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  BusinessInteraction: { layer: "Business", aspect: "Behavior", icon: "handshake", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  BusinessEvent: { layer: "Business", aspect: "Behavior", icon: "event", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  BusinessService: { layer: "Business", aspect: "Behavior", icon: "miscellaneous_services", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  // Business Layer — Passive Structure
  BusinessObject: { layer: "Business", aspect: "PassiveStructure", icon: "description", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  Contract: { layer: "Business", aspect: "PassiveStructure", icon: "gavel", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  Representation: { layer: "Business", aspect: "PassiveStructure", icon: "article", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  Product: { layer: "Business", aspect: "PassiveStructure", icon: "shopping_bag", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  // Application Layer — Active Structure
  ApplicationComponent: { layer: "Application", aspect: "ActiveStructure", icon: "apps", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  ApplicationCollaboration: { layer: "Application", aspect: "ActiveStructure", icon: "hub", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  ApplicationInterface: { layer: "Application", aspect: "ActiveStructure", icon: "api", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  // Application Layer — Behavior
  ApplicationProcess: { layer: "Application", aspect: "Behavior", icon: "account_tree", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  ApplicationFunction: { layer: "Application", aspect: "Behavior", icon: "functions", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  ApplicationInteraction: { layer: "Application", aspect: "Behavior", icon: "sync_alt", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  ApplicationEvent: { layer: "Application", aspect: "Behavior", icon: "notifications", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  ApplicationService: { layer: "Application", aspect: "Behavior", icon: "miscellaneous_services", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  // Application Layer — Passive Structure
  DataObject: { layer: "Application", aspect: "PassiveStructure", icon: "database", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  // Technology Layer — Active Structure
  Node: { layer: "Technology", aspect: "ActiveStructure", icon: "dns", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  Device: { layer: "Technology", aspect: "ActiveStructure", icon: "devices", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  SystemSoftware: { layer: "Technology", aspect: "ActiveStructure", icon: "terminal", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  TechnologyCollaboration: { layer: "Technology", aspect: "ActiveStructure", icon: "group_work", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  TechnologyInterface: { layer: "Technology", aspect: "ActiveStructure", icon: "settings_input_component", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  Path: { layer: "Technology", aspect: "ActiveStructure", icon: "cable", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  CommunicationNetwork: { layer: "Technology", aspect: "ActiveStructure", icon: "lan", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  // Technology Layer — Behavior
  TechnologyProcess: { layer: "Technology", aspect: "Behavior", icon: "settings", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  TechnologyFunction: { layer: "Technology", aspect: "Behavior", icon: "build", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  TechnologyInteraction: { layer: "Technology", aspect: "Behavior", icon: "compare_arrows", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  TechnologyEvent: { layer: "Technology", aspect: "Behavior", icon: "event_note", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  TechnologyService: { layer: "Technology", aspect: "Behavior", icon: "cloud", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  // Technology Layer — Passive Structure
  Artifact: { layer: "Technology", aspect: "PassiveStructure", icon: "inventory_2", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  // Motivation Layer
  Stakeholder: { layer: "Motivation", aspect: "Other", icon: "groups", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  Driver: { layer: "Motivation", aspect: "Other", icon: "trending_up", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  Assessment: { layer: "Motivation", aspect: "Other", icon: "assessment", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  Goal: { layer: "Motivation", aspect: "Other", icon: "flag", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  Outcome: { layer: "Motivation", aspect: "Other", icon: "emoji_events", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  Principle: { layer: "Motivation", aspect: "Other", icon: "balance", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  Requirement: { layer: "Motivation", aspect: "Other", icon: "checklist", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  Constraint: { layer: "Motivation", aspect: "Other", icon: "block", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  Meaning: { layer: "Motivation", aspect: "Other", icon: "lightbulb", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  Value: { layer: "Motivation", aspect: "Other", icon: "star", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  // Strategy Layer
  Resource: { layer: "Strategy", aspect: "ActiveStructure", icon: "inventory", defaultColor: "#d9b3ff", defaultWidth: 160, defaultHeight: 60 },
  Capability: { layer: "Strategy", aspect: "Behavior", icon: "psychology", defaultColor: "#d9b3ff", defaultWidth: 160, defaultHeight: 60 },
  ValueStream: { layer: "Strategy", aspect: "Behavior", icon: "waterfall_chart", defaultColor: "#d9b3ff", defaultWidth: 160, defaultHeight: 60 },
  CourseOfAction: { layer: "Strategy", aspect: "Behavior", icon: "map", defaultColor: "#d9b3ff", defaultWidth: 160, defaultHeight: 60 },
  // Implementation Layer
  WorkPackage: { layer: "Implementation", aspect: "Behavior", icon: "work", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  ImplementationEvent: { layer: "Implementation", aspect: "Behavior", icon: "event_available", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  Deliverable: { layer: "Implementation", aspect: "PassiveStructure", icon: "task_alt", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  Gap: { layer: "Implementation", aspect: "PassiveStructure", icon: "difference", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  Plateau: { layer: "Implementation", aspect: "PassiveStructure", icon: "landscape", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  // Physical Layer
  Equipment: { layer: "Physical", aspect: "ActiveStructure", icon: "precision_manufacturing", defaultColor: "#c8e6c9", defaultWidth: 160, defaultHeight: 60 },
  Facility: { layer: "Physical", aspect: "ActiveStructure", icon: "warehouse", defaultColor: "#c8e6c9", defaultWidth: 160, defaultHeight: 60 },
  DistributionNetwork: { layer: "Physical", aspect: "ActiveStructure", icon: "share", defaultColor: "#c8e6c9", defaultWidth: 160, defaultHeight: 60 },
  Material: { layer: "Physical", aspect: "PassiveStructure", icon: "category", defaultColor: "#c8e6c9", defaultWidth: 160, defaultHeight: 60 },
  // Composite Layer
  Grouping: { layer: "Composite", aspect: "Other", icon: "folder_open", defaultColor: "#ffffff", defaultWidth: 240, defaultHeight: 160 },
  Location: { layer: "Composite", aspect: "Other", icon: "place", defaultColor: "#ffffff", defaultWidth: 240, defaultHeight: 160 },
  Junction: { layer: "Composite", aspect: "Other", icon: "merge_type", defaultColor: "#ffffff", defaultWidth: 40, defaultHeight: 40 },
};

export const ARCHIMATE_RELATION_STYLES: Record<ArchiMateRelationType, ArchiMateRelationStyle> = {
  Association: {
    strokeWidth: 1,
  },
  Composition: {
    strokeWidth: 2,
    sourceMarker: "diamond-filled",
    targetMarker: "arrow-open",
  },
  Aggregation: {
    strokeWidth: 2,
    sourceMarker: "diamond-hollow",
    targetMarker: "arrow-open",
  },
  Realization: {
    strokeDasharray: "8 4",
    strokeWidth: 1,
    targetMarker: "arrow-open",
  },
  Assignment: {
    strokeWidth: 2,
    sourceMarker: "circle-filled",
    targetMarker: "arrow-open",
  },
  Serving: {
    strokeWidth: 1,
    targetMarker: "arrow-open",
  },
  Access: {
    strokeDasharray: "6 3",
    strokeWidth: 1,
    targetMarker: "arrow-open",
  },
  Influence: {
    strokeDasharray: "6 3",
    strokeWidth: 1,
    targetMarker: "arrow-open",
  },
  Triggering: {
    strokeWidth: 2,
    targetMarker: "arrow-filled",
  },
  Flow: {
    strokeDasharray: "6 3",
    strokeWidth: 1,
    targetMarker: "arrow-filled",
  },
  Specialization: {
    strokeWidth: 1,
    targetMarker: "triangle-hollow",
  },
};

export function getElementMeta(key: string): ArchiMateElementMeta | undefined {
  return ARCHIMATE_ELEMENT_META[key];
}

export function getRelationStyle(key: string): ArchiMateRelationStyle | undefined {
  return ARCHIMATE_RELATION_STYLES[key as ArchiMateRelationType];
}
