import type { ComponentType } from "react";
import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from "@xyflow/react";
import type { C4DiagramEdge } from "./types";
import { C4_RELATION_STYLES } from "./c4Shapes";

function C4Edge({ id, sourceX, sourceY, targetX, targetY, data, selected }: EdgeProps<C4DiagramEdge>) {
  const relationType = (data?.relationType as string | undefined) ?? "c4_rel_uses";
  const style = C4_RELATION_STYLES[relationType as keyof typeof C4_RELATION_STYLES] ?? {};
  const strokeColor = selected ? "#1976d2" : "#444";
  const strokeWidth = style.strokeWidth ?? 1.5;
  const strokeDasharray = style.strokeDasharray;

  const markerId = `${id}-arrow`;
  const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const labelText = (data?.label as string | undefined) || (data?.technology as string | undefined);

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
          strokeWidth,
          strokeDasharray,
          markerEnd: `url(#${markerId})`,
        }}
      />
      {labelText && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: "9px",
              color: "rgba(0,0,0,0.65)",
              background: "rgba(255,255,255,0.9)",
              padding: "1px 4px",
              borderRadius: "2px",
              pointerEvents: "all",
              maxWidth: "120px",
              textAlign: "center",
            }}
            className="nodrag nopan"
          >
            {labelText}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _c4Edge = C4Edge as ComponentType<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const C4_EDGE_TYPES: Record<string, ComponentType<any>> = Object.fromEntries(
  Object.keys(C4_RELATION_STYLES).map((key) => [key, _c4Edge]),
);
