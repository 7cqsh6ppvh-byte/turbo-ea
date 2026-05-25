import type { ComponentType } from "react";
import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from "@xyflow/react";
import type { ArchiMateDiagramEdgeData } from "./types";
import { ARCHIMATE_RELATION_STYLES, type ArchiMateRelationStyle } from "./archimateShapes";

export function getEdgeStyle(relationType: string): ArchiMateRelationStyle | undefined {
  return ARCHIMATE_RELATION_STYLES[relationType as keyof typeof ARCHIMATE_RELATION_STYLES];
}

const MARKER_SIZE = 10;

function buildMarkerDefs(id: string, marker: string, color: string) {
  if (marker === "diamond-filled") {
    return (
      <defs>
        <marker
          id={id}
          markerWidth={MARKER_SIZE}
          markerHeight={MARKER_SIZE}
          refX={8}
          refY={4}
          orient="auto"
        >
          <polygon points="0,4 4,0 8,4 4,8" fill={color} />
        </marker>
      </defs>
    );
  }
  if (marker === "diamond-hollow") {
    return (
      <defs>
        <marker
          id={id}
          markerWidth={MARKER_SIZE}
          markerHeight={MARKER_SIZE}
          refX={8}
          refY={4}
          orient="auto"
        >
          <polygon points="0,4 4,0 8,4 4,8" fill="white" stroke={color} strokeWidth={1} />
        </marker>
      </defs>
    );
  }
  if (marker === "circle-filled") {
    return (
      <defs>
        <marker id={id} markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
          <circle cx={4} cy={4} r={3.5} fill={color} />
        </marker>
      </defs>
    );
  }
  return null;
}

function buildTargetMarkerDefs(id: string, marker: string, color: string) {
  if (marker === "arrow-open") {
    return (
      <defs>
        <marker id={id} markerWidth={10} markerHeight={10} refX={8} refY={5} orient="auto">
          <polyline points="0,0 8,5 0,10" fill="none" stroke={color} strokeWidth={1.5} />
        </marker>
      </defs>
    );
  }
  if (marker === "arrow-filled") {
    return (
      <defs>
        <marker id={id} markerWidth={10} markerHeight={10} refX={8} refY={5} orient="auto">
          <polygon points="0,0 8,5 0,10" fill={color} />
        </marker>
      </defs>
    );
  }
  if (marker === "triangle-hollow") {
    return (
      <defs>
        <marker id={id} markerWidth={12} markerHeight={12} refX={10} refY={6} orient="auto">
          <polygon points="0,0 10,6 0,12" fill="white" stroke={color} strokeWidth={1.5} />
        </marker>
      </defs>
    );
  }
  return null;
}

function ArchimateEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<ArchiMateDiagramEdgeData>) {
  const relationType = data?.relationType ?? "arch_rel_Association";
  const style = getEdgeStyle(relationType) ?? {};
  const strokeColor = selected ? "#1976d2" : "#555";
  const strokeWidth = style.strokeWidth ?? 1;
  const strokeDasharray = style.strokeDasharray;

  const sourceMarkerId = `${id}-src`;
  const targetMarkerId = `${id}-tgt`;

  const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const srcMarkerDefs = style.sourceMarker
    ? buildMarkerDefs(sourceMarkerId, style.sourceMarker, strokeColor)
    : null;
  const tgtMarkerDefs = style.targetMarker
    ? buildTargetMarkerDefs(targetMarkerId, style.targetMarker, strokeColor)
    : null;

  return (
    <>
      {srcMarkerDefs}
      {tgtMarkerDefs}
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          markerStart: style.sourceMarker ? `url(#${sourceMarkerId})` : undefined,
          markerEnd: style.targetMarker ? `url(#${targetMarkerId})` : undefined,
        }}
      />
      {data?.label && (
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
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const _archimateEdge = ArchimateEdge as ComponentType<EdgeProps>;

export const EDGE_TYPES: Record<string, ComponentType<EdgeProps>> = Object.fromEntries(
  Object.keys(ARCHIMATE_RELATION_STYLES).map((key) => [key, _archimateEdge]),
);
