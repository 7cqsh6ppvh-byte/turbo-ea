import type { C4Level, C4RelationType } from "./types";

export interface C4ElementMeta {
  level: C4Level;
  icon: string;
  defaultColor: string;
  defaultWidth: number;
  defaultHeight: number;
  isBoundary?: boolean;
  isExternal?: boolean;
  isPerson?: boolean;
}

export interface C4RelationStyle {
  strokeDasharray?: string;
  strokeWidth?: number;
  animated?: boolean;
  label?: string;
}

export const C4_LEVEL_COLORS: Record<C4Level, string> = {
  "C4:Context": "#dbeafe",
  "C4:Container": "#dcfce7",
  "C4:Component": "#fef9c3",
  "C4:Boundary": "#f3f4f6",
};

export const C4_ELEMENT_META: Record<string, C4ElementMeta> = {
  c4_Person: {
    level: "C4:Context",
    icon: "person",
    defaultColor: "#dbeafe",
    defaultWidth: 120,
    defaultHeight: 80,
    isPerson: true,
  },
  c4_SoftwareSystem: {
    level: "C4:Context",
    icon: "apps",
    defaultColor: "#1168bd",
    defaultWidth: 180,
    defaultHeight: 80,
  },
  c4_ExternalSystem: {
    level: "C4:Context",
    icon: "cloud_off",
    defaultColor: "#999999",
    defaultWidth: 180,
    defaultHeight: 80,
    isExternal: true,
  },
  c4_Container: {
    level: "C4:Container",
    icon: "deployed_code",
    defaultColor: "#438dd5",
    defaultWidth: 180,
    defaultHeight: 100,
  },
  c4_Component: {
    level: "C4:Component",
    icon: "extension",
    defaultColor: "#85bbf0",
    defaultWidth: 160,
    defaultHeight: 80,
  },
  c4_EnterpriseBoundary: {
    level: "C4:Boundary",
    icon: "corporate_fare",
    defaultColor: "#cccccc",
    defaultWidth: 400,
    defaultHeight: 300,
    isBoundary: true,
  },
  c4_SystemBoundary: {
    level: "C4:Boundary",
    icon: "crop_square",
    defaultColor: "#cccccc",
    defaultWidth: 400,
    defaultHeight: 300,
    isBoundary: true,
  },
  c4_ContainerBoundary: {
    level: "C4:Boundary",
    icon: "border_all",
    defaultColor: "#cccccc",
    defaultWidth: 400,
    defaultHeight: 300,
    isBoundary: true,
  },
};

export const C4_RELATION_STYLES: Record<C4RelationType, C4RelationStyle> = {
  c4_rel_uses: { strokeWidth: 1.5 },
  c4_rel_callsSync: { strokeWidth: 1.5 },
  c4_rel_callsAsync: { strokeDasharray: "6 3", strokeWidth: 1.5 },
  c4_rel_readsFrom: { strokeWidth: 1.5 },
  c4_rel_writesTo: { strokeWidth: 1.5 },
  c4_rel_deployedIn: { strokeDasharray: "4 4", strokeWidth: 1 },
};

export const C4_DIAGRAM_TYPES = [
  {
    key: "c4-context",
    label: "System Context",
    allowedElements: ["c4_Person", "c4_SoftwareSystem", "c4_ExternalSystem", "c4_EnterpriseBoundary"],
  },
  {
    key: "c4-container",
    label: "Container",
    allowedElements: ["c4_Person", "c4_Container", "c4_SoftwareSystem", "c4_ExternalSystem", "c4_SystemBoundary"],
  },
  {
    key: "c4-component",
    label: "Component",
    allowedElements: ["c4_Person", "c4_Component", "c4_Container", "c4_ExternalSystem", "c4_ContainerBoundary"],
  },
  {
    key: "c4-code",
    label: "Code",
    allowedElements: [],
  },
] as const;

export type C4DiagramTypeKey = (typeof C4_DIAGRAM_TYPES)[number]["key"];
