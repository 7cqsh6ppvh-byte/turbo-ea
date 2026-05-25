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
  arch_BusinessActor: { layer: "Business", aspect: "ActiveStructure", icon: "person", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_BusinessRole: { layer: "Business", aspect: "ActiveStructure", icon: "badge", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_BusinessCollaboration: { layer: "Business", aspect: "ActiveStructure", icon: "group", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_BusinessInterface: { layer: "Business", aspect: "ActiveStructure", icon: "swap_horiz", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  // Business Layer — Behavior
  arch_BusinessProcess: { layer: "Business", aspect: "Behavior", icon: "route", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_BusinessFunction: { layer: "Business", aspect: "Behavior", icon: "functions", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_BusinessInteraction: { layer: "Business", aspect: "Behavior", icon: "handshake", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_BusinessEvent: { layer: "Business", aspect: "Behavior", icon: "event", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_BusinessService: { layer: "Business", aspect: "Behavior", icon: "miscellaneous_services", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  // Business Layer — Passive Structure
  arch_BusinessObject: { layer: "Business", aspect: "PassiveStructure", icon: "description", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_Contract: { layer: "Business", aspect: "PassiveStructure", icon: "gavel", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_Representation: { layer: "Business", aspect: "PassiveStructure", icon: "article", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  arch_Product: { layer: "Business", aspect: "PassiveStructure", icon: "shopping_bag", defaultColor: "#f5e27a", defaultWidth: 160, defaultHeight: 60 },
  // Application Layer — Active Structure
  arch_ApplicationComponent: { layer: "Application", aspect: "ActiveStructure", icon: "apps", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  arch_ApplicationCollaboration: { layer: "Application", aspect: "ActiveStructure", icon: "hub", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  arch_ApplicationInterface: { layer: "Application", aspect: "ActiveStructure", icon: "api", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  // Application Layer — Behavior
  arch_ApplicationProcess: { layer: "Application", aspect: "Behavior", icon: "account_tree", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  arch_ApplicationFunction: { layer: "Application", aspect: "Behavior", icon: "functions", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  arch_ApplicationInteraction: { layer: "Application", aspect: "Behavior", icon: "sync_alt", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  arch_ApplicationEvent: { layer: "Application", aspect: "Behavior", icon: "notifications", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  arch_ApplicationService: { layer: "Application", aspect: "Behavior", icon: "miscellaneous_services", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  // Application Layer — Passive Structure
  arch_DataObject: { layer: "Application", aspect: "PassiveStructure", icon: "database", defaultColor: "#b3d9ff", defaultWidth: 160, defaultHeight: 60 },
  // Technology Layer — Active Structure
  arch_Node: { layer: "Technology", aspect: "ActiveStructure", icon: "dns", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_Device: { layer: "Technology", aspect: "ActiveStructure", icon: "devices", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_SystemSoftware: { layer: "Technology", aspect: "ActiveStructure", icon: "terminal", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_TechnologyCollaboration: { layer: "Technology", aspect: "ActiveStructure", icon: "group_work", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_TechnologyInterface: { layer: "Technology", aspect: "ActiveStructure", icon: "settings_input_component", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_Path: { layer: "Technology", aspect: "ActiveStructure", icon: "cable", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_CommunicationNetwork: { layer: "Technology", aspect: "ActiveStructure", icon: "lan", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  // Technology Layer — Behavior
  arch_TechnologyProcess: { layer: "Technology", aspect: "Behavior", icon: "settings", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_TechnologyFunction: { layer: "Technology", aspect: "Behavior", icon: "build", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_TechnologyInteraction: { layer: "Technology", aspect: "Behavior", icon: "compare_arrows", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_TechnologyEvent: { layer: "Technology", aspect: "Behavior", icon: "event_note", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  arch_TechnologyService: { layer: "Technology", aspect: "Behavior", icon: "cloud", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  // Technology Layer — Passive Structure
  arch_Artifact: { layer: "Technology", aspect: "PassiveStructure", icon: "inventory_2", defaultColor: "#aae6aa", defaultWidth: 160, defaultHeight: 60 },
  // Motivation Layer
  arch_Stakeholder: { layer: "Motivation", aspect: "Other", icon: "groups", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  arch_Driver: { layer: "Motivation", aspect: "Other", icon: "trending_up", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  arch_Assessment: { layer: "Motivation", aspect: "Other", icon: "assessment", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  arch_Goal: { layer: "Motivation", aspect: "Other", icon: "flag", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  arch_Outcome: { layer: "Motivation", aspect: "Other", icon: "emoji_events", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  arch_Principle: { layer: "Motivation", aspect: "Other", icon: "balance", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  arch_Requirement: { layer: "Motivation", aspect: "Other", icon: "checklist", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  arch_Constraint: { layer: "Motivation", aspect: "Other", icon: "block", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  arch_Meaning: { layer: "Motivation", aspect: "Other", icon: "lightbulb", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  arch_Value: { layer: "Motivation", aspect: "Other", icon: "star", defaultColor: "#ffcca8", defaultWidth: 160, defaultHeight: 60 },
  // Strategy Layer
  arch_Resource: { layer: "Strategy", aspect: "ActiveStructure", icon: "inventory", defaultColor: "#d9b3ff", defaultWidth: 160, defaultHeight: 60 },
  arch_Capability: { layer: "Strategy", aspect: "Behavior", icon: "psychology", defaultColor: "#d9b3ff", defaultWidth: 160, defaultHeight: 60 },
  arch_ValueStream: { layer: "Strategy", aspect: "Behavior", icon: "waterfall_chart", defaultColor: "#d9b3ff", defaultWidth: 160, defaultHeight: 60 },
  arch_CourseOfAction: { layer: "Strategy", aspect: "Behavior", icon: "map", defaultColor: "#d9b3ff", defaultWidth: 160, defaultHeight: 60 },
  // Implementation Layer
  arch_WorkPackage: { layer: "Implementation", aspect: "Behavior", icon: "work", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  arch_ImplementationEvent: { layer: "Implementation", aspect: "Behavior", icon: "event_available", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  arch_Deliverable: { layer: "Implementation", aspect: "PassiveStructure", icon: "task_alt", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  arch_Gap: { layer: "Implementation", aspect: "PassiveStructure", icon: "difference", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  arch_Plateau: { layer: "Implementation", aspect: "PassiveStructure", icon: "landscape", defaultColor: "#e0e0e0", defaultWidth: 160, defaultHeight: 60 },
  // Physical Layer
  arch_Equipment: { layer: "Physical", aspect: "ActiveStructure", icon: "precision_manufacturing", defaultColor: "#c8e6c9", defaultWidth: 160, defaultHeight: 60 },
  arch_Facility: { layer: "Physical", aspect: "ActiveStructure", icon: "warehouse", defaultColor: "#c8e6c9", defaultWidth: 160, defaultHeight: 60 },
  arch_DistributionNetwork: { layer: "Physical", aspect: "ActiveStructure", icon: "share", defaultColor: "#c8e6c9", defaultWidth: 160, defaultHeight: 60 },
  arch_Material: { layer: "Physical", aspect: "PassiveStructure", icon: "category", defaultColor: "#c8e6c9", defaultWidth: 160, defaultHeight: 60 },
  // Composite Layer
  arch_Grouping: { layer: "Composite", aspect: "Other", icon: "folder_open", defaultColor: "#ffffff", defaultWidth: 240, defaultHeight: 160 },
  arch_Location: { layer: "Composite", aspect: "Other", icon: "place", defaultColor: "#ffffff", defaultWidth: 240, defaultHeight: 160 },
  arch_Junction: { layer: "Composite", aspect: "Other", icon: "merge_type", defaultColor: "#ffffff", defaultWidth: 40, defaultHeight: 40 },
};

export const ARCHIMATE_RELATION_STYLES: Record<ArchiMateRelationType, ArchiMateRelationStyle> = {
  arch_rel_Association: {
    strokeWidth: 1,
  },
  arch_rel_Composition: {
    strokeWidth: 2,
    sourceMarker: "diamond-filled",
    targetMarker: "arrow-open",
  },
  arch_rel_Aggregation: {
    strokeWidth: 2,
    sourceMarker: "diamond-hollow",
    targetMarker: "arrow-open",
  },
  arch_rel_Realization: {
    strokeDasharray: "8 4",
    strokeWidth: 1,
    targetMarker: "arrow-open",
  },
  arch_rel_Assignment: {
    strokeWidth: 2,
    sourceMarker: "circle-filled",
    targetMarker: "arrow-open",
  },
  arch_rel_Serving: {
    strokeWidth: 1,
    targetMarker: "arrow-open",
  },
  arch_rel_Access: {
    strokeDasharray: "6 3",
    strokeWidth: 1,
    targetMarker: "arrow-open",
  },
  arch_rel_Influence: {
    strokeDasharray: "6 3",
    strokeWidth: 1,
    targetMarker: "arrow-open",
  },
  arch_rel_Triggering: {
    strokeWidth: 2,
    targetMarker: "arrow-filled",
  },
  arch_rel_Flow: {
    strokeDasharray: "6 3",
    strokeWidth: 1,
    targetMarker: "arrow-filled",
  },
  arch_rel_Specialization: {
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
