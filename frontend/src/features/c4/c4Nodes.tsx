import type { ComponentType } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { C4DiagramNode } from "./types";
import { C4_ELEMENT_META } from "./c4Shapes";

function C4PersonNode({ data, selected }: NodeProps<C4DiagramNode>) {
  const isExternal = data.external ?? false;
  const fillColor = isExternal ? "#999999" : "#08427b";
  const textColor = "#ffffff";

  return (
    <Box
      sx={{
        width: data.width || 120,
        height: data.height || 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        cursor: "default",
        userSelect: "none",
        position: "relative",
        outline: selected ? "2px solid #1976d2" : "none",
        borderRadius: "4px",
      }}
    >
      {/* Stick figure */}
      <svg width="36" height="44" viewBox="0 0 36 44" style={{ flexShrink: 0 }}>
        {/* Head */}
        <circle cx="18" cy="8" r="7" fill={fillColor} />
        {/* Body */}
        <line x1="18" y1="15" x2="18" y2="30" stroke={fillColor} strokeWidth="2.5" />
        {/* Arms */}
        <line x1="6" y1="21" x2="30" y2="21" stroke={fillColor} strokeWidth="2.5" />
        {/* Left leg */}
        <line x1="18" y1="30" x2="8" y2="43" stroke={fillColor} strokeWidth="2.5" />
        {/* Right leg */}
        <line x1="18" y1="30" x2="28" y2="43" stroke={fillColor} strokeWidth="2.5" />
      </svg>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          fontSize: "11px",
          textAlign: "center",
          color: fillColor,
          lineHeight: 1.2,
          wordBreak: "break-word",
          px: 0.5,
        }}
      >
        {data.label}
      </Typography>
      {data.technology && (
        <Typography
          variant="caption"
          sx={{ fontSize: "9px", color: "text.secondary", fontStyle: "italic", textAlign: "center" }}
        >
          [{data.technology}]
        </Typography>
      )}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
}

function C4SystemNode({ data, selected }: NodeProps<C4DiagramNode>) {
  const meta = C4_ELEMENT_META[data.elementTypeKey];
  const isExternal = data.external ?? data.elementTypeKey === "c4_ExternalSystem";
  const bgColor = isExternal ? "#999999" : data.color || meta?.defaultColor || "#1168bd";
  const textColor = "#ffffff";

  return (
    <Box
      sx={{
        width: data.width || 180,
        height: data.height || 80,
        background: bgColor,
        border: selected ? "2px solid #1976d2" : "none",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 1.5,
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
        gap: 0.25,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "12px",
          textAlign: "center",
          color: textColor,
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {data.label}
      </Typography>
      {data.technology && (
        <Typography sx={{ fontSize: "9px", color: "rgba(255,255,255,0.8)", fontStyle: "italic", textAlign: "center" }}>
          [{data.technology}]
        </Typography>
      )}
      {data.description && (
        <Typography sx={{ fontSize: "9px", color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 1.2 }}>
          {data.description}
        </Typography>
      )}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
}

function C4ContainerNode({ data, selected }: NodeProps<C4DiagramNode>) {
  const isExternal = data.external ?? false;
  const bgColor = isExternal ? "#999999" : data.color || "#438dd5";
  const textColor = "#ffffff";

  return (
    <Box
      sx={{
        width: data.width || 180,
        height: data.height || 100,
        background: bgColor,
        border: selected ? "2px solid #1976d2" : "none",
        borderRadius: "6px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 1.5,
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
        gap: 0.25,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "12px",
          textAlign: "center",
          color: textColor,
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {data.label}
      </Typography>
      {data.technology && (
        <Typography sx={{ fontSize: "9px", color: "rgba(255,255,255,0.75)", fontStyle: "italic", textAlign: "center" }}>
          [{data.technology}]
        </Typography>
      )}
      {data.description && (
        <Typography sx={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.2 }}>
          {data.description}
        </Typography>
      )}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
}

function C4ComponentNode({ data, selected }: NodeProps<C4DiagramNode>) {
  const isExternal = data.external ?? false;
  const bgColor = isExternal ? "#cccccc" : data.color || "#85bbf0";

  return (
    <Box
      sx={{
        width: data.width || 160,
        height: data.height || 80,
        background: bgColor,
        border: selected ? "2px solid #1976d2" : "1px solid rgba(0,0,0,0.2)",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 1.5,
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
        gap: 0.25,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "11px",
          textAlign: "center",
          color: "rgba(0,0,0,0.8)",
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {data.label}
      </Typography>
      {data.technology && (
        <Typography sx={{ fontSize: "9px", color: "text.secondary", fontStyle: "italic", textAlign: "center" }}>
          [{data.technology}]
        </Typography>
      )}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
}

function C4BoundaryNode({ data, selected }: NodeProps<C4DiagramNode>) {
  return (
    <Box
      sx={{
        width: data.width || 400,
        height: data.height || 300,
        border: selected ? "2px dashed #1976d2" : "2px dashed rgba(0,0,0,0.25)",
        borderRadius: "8px",
        background: "rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <Typography
        sx={{
          position: "absolute",
          top: 8,
          left: 12,
          fontSize: "11px",
          fontWeight: 700,
          color: "rgba(0,0,0,0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _person = C4PersonNode as ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _system = C4SystemNode as ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _container = C4ContainerNode as ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _component = C4ComponentNode as ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _boundary = C4BoundaryNode as ComponentType<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const C4_NODE_TYPES: Record<string, ComponentType<any>> = {
  c4_Person: _person,
  c4_SoftwareSystem: _system,
  c4_ExternalSystem: _system,
  c4_Container: _container,
  c4_Component: _component,
  c4_EnterpriseBoundary: _boundary,
  c4_SystemBoundary: _boundary,
  c4_ContainerBoundary: _boundary,
};
