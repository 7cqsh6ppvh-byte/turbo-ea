import type { ComponentType } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { AWS_ELEMENT_MAP } from "./awsShapes";

interface AwsNodeData extends Record<string, unknown> {
  label: string;
  elementTypeKey: string;
  cardId?: string;
}

function AwsServiceNode({ data, selected }: NodeProps) {
  const nodeData = data as AwsNodeData;
  const meta = AWS_ELEMENT_MAP.get(nodeData.elementTypeKey);
  const color = meta?.color ?? "#FF9900";
  const icon = meta?.icon ?? "cloud";

  return (
    <Box
      sx={{
        minWidth: 140,
        maxWidth: 200,
        border: selected ? `2px solid #1976d2` : `1px solid ${color}`,
        borderRadius: "6px",
        background: "#fff",
        boxShadow: selected ? "0 0 0 2px rgba(25,118,210,0.2)" : "0 1px 3px rgba(0,0,0,0.12)",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      <Handle type="target" position={Position.Top} />
      {/* Orange/colored header band */}
      <Box
        sx={{
          background: color,
          px: 1,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <MaterialSymbol icon={icon} size={14} color="#fff" />
        <Typography sx={{ fontSize: "9px", color: "#fff", fontWeight: 600, lineHeight: 1.2 }}>
          {meta?.category?.replace("AWS:", "") ?? "AWS"}
        </Typography>
      </Box>
      {/* Service name */}
      <Box sx={{ px: 1, py: 0.75 }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 600, lineHeight: 1.3, color: "#111" }}>
          {nodeData.label || meta?.label || nodeData.elementTypeKey}
        </Typography>
      </Box>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
}

function AwsContainerNode({ data, selected }: NodeProps) {
  const nodeData = data as AwsNodeData;
  const meta = AWS_ELEMENT_MAP.get(nodeData.elementTypeKey);
  const color = meta?.color ?? "#232F3E";

  return (
    <Box
      sx={{
        minWidth: 200,
        minHeight: 120,
        border: `2px dashed ${color}`,
        borderRadius: "4px",
        background: "rgba(35,47,62,0.04)",
        padding: "4px 8px",
        boxShadow: selected ? `0 0 0 2px ${color}40` : "none",
        cursor: "default",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Typography
        sx={{ fontSize: "10px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        {nodeData.label || meta?.label || nodeData.elementTypeKey}
      </Typography>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
}

const CONTAINER_TYPES = new Set([
  "aws_Account", "aws_Region", "aws_AvailabilityZone", "aws_VPC", "aws_Subnet",
]);

function AwsNodeRouter(props: NodeProps) {
  const data = props.data as AwsNodeData;
  if (CONTAINER_TYPES.has(data.elementTypeKey)) {
    return <AwsContainerNode {...props} />;
  }
  return <AwsServiceNode {...props} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _awsNode = AwsNodeRouter as ComponentType<any>;

export const AWS_NODE_TYPES = Object.fromEntries(
  Array.from({ length: 52 }, (_, i) => i).map(() => null).filter(Boolean)
) as Record<string, ComponentType<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

// Build node type map: each element key maps to the shared router
import { AWS_ELEMENT_META } from "./awsShapes";
export const AWS_NODE_TYPES_MAP: Record<string, ComponentType<any>> = // eslint-disable-line @typescript-eslint/no-explicit-any
  Object.fromEntries(AWS_ELEMENT_META.map((e) => [e.key, _awsNode]));
