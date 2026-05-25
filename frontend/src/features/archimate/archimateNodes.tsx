import type { ComponentType } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ArchiMateDiagramNode } from "./types";
import { ARCHIMATE_ELEMENT_META } from "./archimateShapes";

const ASPECT_MARK: Record<string, string> = {
  ActiveStructure: "▪",
  Behavior: "◦",
  PassiveStructure: "◿",
  Other: "",
};

export function ArchimateElementNode({ data, selected }: NodeProps<ArchiMateDiagramNode>) {
  const meta = ARCHIMATE_ELEMENT_META[data.elementTypeKey];
  const bgColor = data.color || meta?.defaultColor || "#e0e0e0";
  const aspectMark = ASPECT_MARK[data.aspect] || "";

  return (
    <Box
      style={{ background: bgColor }}
      data-color={bgColor}
      sx={{
        width: data.width || 160,
        height: data.height || 60,
        background: bgColor,
        border: selected ? "2px solid #1976d2" : "1.5px solid rgba(0,0,0,0.25)",
        borderRadius: "2px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      {aspectMark && (
        <Box
          sx={{
            position: "absolute",
            top: 3,
            right: 5,
            fontSize: "10px",
            lineHeight: 1,
            color: "rgba(0,0,0,0.5)",
          }}
        >
          {aspectMark}
        </Box>
      )}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          fontSize: "11px",
          textAlign: "center",
          lineHeight: 1.2,
          px: 1,
          color: "rgba(0,0,0,0.75)",
          wordBreak: "break-word",
        }}
      >
        {data.label}
      </Typography>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
}

export function ArchimateGroupingNode({ data, selected }: NodeProps<ArchiMateDiagramNode>) {
  const bgColor = data.color || "#ffffff";
  return (
    <Box
      sx={{
        width: data.width || 240,
        height: data.height || 160,
        background: `${bgColor}80`,
        border: selected ? "2px dashed #1976d2" : "2px dashed rgba(0,0,0,0.25)",
        borderRadius: "4px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        position: "relative",
        boxSizing: "border-box",
        cursor: "default",
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, fontSize: "11px", p: 1, color: "rgba(0,0,0,0.6)" }}
      >
        {data.label}
      </Typography>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
}

export function ArchimateJunctionNode({ selected }: NodeProps<ArchiMateDiagramNode>) {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        background: selected ? "#1976d2" : "#333",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _elementNode = ArchimateElementNode as ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _groupingNode = ArchimateGroupingNode as ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _junctionNode = ArchimateJunctionNode as ComponentType<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NODE_TYPES: Record<string, ComponentType<any>> = Object.fromEntries(
  Object.keys(ARCHIMATE_ELEMENT_META).map((key) => {
    if (key === "arch_Grouping" || key === "arch_Location") return [key, _groupingNode];
    if (key === "arch_Junction") return [key, _junctionNode];
    return [key, _elementNode];
  }),
);
