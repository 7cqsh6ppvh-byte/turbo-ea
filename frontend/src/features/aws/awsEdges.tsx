import type { ComponentType } from "react";
import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from "@xyflow/react";
import { AWS_RELATION_STYLES } from "./awsShapes";

interface AwsEdgeData extends Record<string, unknown> {
  relationType?: string;
  label?: string;
}

function AwsEdge({ id, sourceX, sourceY, targetX, targetY, data, selected }: EdgeProps) {
  const edgeData = data as AwsEdgeData | undefined;
  const relationType = edgeData?.relationType ?? "aws_rel_serviceDependency";
  const style = AWS_RELATION_STYLES[relationType] ?? {};
  const strokeColor = selected ? "#1976d2" : "#555";
  const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const markerId = `aws-arrow-${id}`;

  return (
    <>
      <defs>
        <marker id={markerId} markerWidth={10} markerHeight={10} refX={8} refY={5} orient="auto">
          <polygon points="0,0 8,5 0,10" fill={strokeColor} />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: strokeColor,
          strokeWidth: 1.5,
          strokeDasharray: style.strokeDasharray,
          markerEnd: `url(#${markerId})`,
        }}
      />
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: "9px",
              color: "rgba(0,0,0,0.6)",
              background: "rgba(255,255,255,0.85)",
              padding: "1px 3px",
              borderRadius: "2px",
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {edgeData.label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _awsEdge = AwsEdge as ComponentType<any>;

export const AWS_EDGE_TYPES: Record<string, ComponentType<any>> = // eslint-disable-line @typescript-eslint/no-explicit-any
  Object.fromEntries(Object.keys(AWS_RELATION_STYLES).map((k) => [k, _awsEdge]));
