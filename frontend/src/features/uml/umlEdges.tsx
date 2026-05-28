import type { ComponentType } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import type { UmlDiagramEdge } from "./types";

// ─── shared helpers ───────────────────────────────────────────────────────────

const EDGE_COLOR = "#334155";

function edgeColor(selected: boolean | undefined) {
  return selected ? "#1976d2" : EDGE_COLOR;
}

function EdgeLabel({
  labelX,
  labelY,
  label,
}: {
  labelX: number;
  labelY: number;
  label?: string;
}) {
  if (!label) return null;
  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: "absolute",
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          fontSize: 9,
          color: "rgba(0,0,0,0.65)",
          background: "rgba(255,255,255,0.85)",
          borderRadius: 2,
          padding: "1px 3px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </EdgeLabelRenderer>
  );
}

// ─── Association (plain arrow) ────────────────────────────────────────────────

export function AssociationEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{ stroke: color, strokeWidth: 1.5 }}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={data?.label as string | undefined} />
    </>
  );
}

// ─── Dependency (dashed open arrow) ──────────────────────────────────────────

export function DependencyEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const headId = `dep-open-${sourceX}-${targetX}`;
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={headId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="none" stroke={color} strokeWidth="1.2" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="6 3"
        markerEnd={`url(#${headId})`}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={data?.label as string | undefined} />
    </svg>
  );
}

// ─── Generalization (solid line, hollow triangle head) ───────────────────────

export function GeneralizationEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const headId = `gen-tri-${sourceX}-${targetX}`;
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={headId}
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L9,4 L0,8 Z" fill="white" stroke={color} strokeWidth="1.2" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        markerEnd={`url(#${headId})`}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={data?.label as string | undefined} />
    </svg>
  );
}

// ─── Realization (dashed line, hollow triangle head) ─────────────────────────

export function RealizationEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const headId = `real-tri-${sourceX}-${targetX}`;
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={headId}
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L9,4 L0,8 Z" fill="white" stroke={color} strokeWidth="1.2" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="6 3"
        markerEnd={`url(#${headId})`}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={data?.label as string | undefined} />
    </svg>
  );
}

// ─── Composition (solid line, filled diamond at source) ──────────────────────

export function CompositionEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const tailId = `comp-diamond-${sourceX}-${targetX}`;
  const headId = `comp-arrow-${sourceX}-${targetX}`;
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={tailId}
          markerWidth="12"
          markerHeight="8"
          refX="1"
          refY="4"
          orient="auto"
        >
          <path d="M0,4 L6,0 L12,4 L6,8 Z" fill={color} stroke={color} strokeWidth="1" />
        </marker>
        <marker
          id={headId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="none" stroke={color} strokeWidth="1.2" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        markerStart={`url(#${tailId})`}
        markerEnd={`url(#${headId})`}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={data?.label as string | undefined} />
    </svg>
  );
}

// ─── Aggregation (solid line, hollow diamond at source) ──────────────────────

export function AggregationEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const tailId = `agg-diamond-${sourceX}-${targetX}`;
  const headId = `agg-arrow-${sourceX}-${targetX}`;
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={tailId}
          markerWidth="12"
          markerHeight="8"
          refX="1"
          refY="4"
          orient="auto"
        >
          <path d="M0,4 L6,0 L12,4 L6,8 Z" fill="white" stroke={color} strokeWidth="1.2" />
        </marker>
        <marker
          id={headId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="none" stroke={color} strokeWidth="1.2" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        markerStart={`url(#${tailId})`}
        markerEnd={`url(#${headId})`}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={data?.label as string | undefined} />
    </svg>
  );
}

// ─── Include / Extend (dashed, labeled) ──────────────────────────────────────

export function IncludeEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const headId = `inc-arrow-${sourceX}-${targetX}`;
  const relType = (data?.relTypeKey as string) || "";
  const stereo = relType === "uml_rel_extend" ? "«extend»" : "«include»";
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={headId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="none" stroke={color} strokeWidth="1.2" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="6 3"
        markerEnd={`url(#${headId})`}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={stereo} />
    </svg>
  );
}

// ─── Transition (state machine, labeled with guard/action) ───────────────────

export function TransitionEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const headId = `trans-arrow-${sourceX}-${targetX}`;
  const trigger = data?.trigger as string | undefined;
  const guard = data?.guard as string | undefined;
  const effect = data?.effect as string | undefined;
  let label = "";
  if (trigger) label += trigger;
  if (guard) label += ` [${guard}]`;
  if (effect) label += ` / ${effect}`;
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={headId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="none" stroke={color} strokeWidth="1.2" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        markerEnd={`url(#${headId})`}
      />
      {label && <EdgeLabel labelX={labelX} labelY={labelY} label={label} />}
    </svg>
  );
}

// ─── Control Flow (activity diagram) ─────────────────────────────────────────

export function ControlFlowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const headId = `cf-arrow-${sourceX}-${targetX}`;
  const guard = data?.guard as string | undefined;
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={headId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill="none" stroke={color} strokeWidth="1.2" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        markerEnd={`url(#${headId})`}
      />
      {guard && <EdgeLabel labelX={labelX} labelY={labelY} label={`[${guard}]`} />}
      {!guard && data?.label && (
        <EdgeLabel labelX={labelX} labelY={labelY} label={data.label as string} />
      )}
    </svg>
  );
}

// ─── Object Flow (activity diagram) ──────────────────────────────────────────

export function ObjectFlowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const headId = `of-arrow-${sourceX}-${targetX}`;
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={headId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6" fill={color} stroke={color} strokeWidth="1" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        markerEnd={`url(#${headId})`}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={data?.label as string | undefined} />
    </svg>
  );
}

// ─── Message (sequence diagram — horizontal straight line) ───────────────────

export function MessageEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const color = edgeColor(selected);
  const msgType = (data?.messageType as string) || "sync";
  const headId = `msg-arrow-${sourceX}-${targetX}`;
  const isDashed = msgType === "reply" || msgType === "create" || msgType === "destroy";
  const isFilledHead = msgType === "sync";
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={headId}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          {isFilledHead ? (
            <path d="M0,0 L8,3 L0,6 Z" fill={color} stroke={color} strokeWidth="1" />
          ) : (
            <path d="M0,0 L8,3 L0,6" fill="none" stroke={color} strokeWidth="1.2" />
          )}
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray={isDashed ? "6 3" : undefined}
        markerEnd={`url(#${headId})`}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={data?.label as string | undefined} />
    </svg>
  );
}

// ─── Information Flow ─────────────────────────────────────────────────────────

export function InformationFlowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlDiagramEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = edgeColor(selected);
  const headId = `if-arrow-${sourceX}-${targetX}`;
  return (
    <svg style={{ overflow: "visible", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <marker
          id={headId}
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L9,4 L0,8 Z" fill={color} stroke={color} strokeWidth="1" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="8 3"
        markerEnd={`url(#${headId})`}
      />
      <EdgeLabel labelX={labelX} labelY={labelY} label={data?.label as string | undefined} />
    </svg>
  );
}

// ─── Export EDGE_TYPES map ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EDGE_TYPES: Record<string, ComponentType<any>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_association: AssociationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_directed_association: AssociationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_dependency: DependencyEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_generalization: GeneralizationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_realization: RealizationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_composition: CompositionEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_aggregation: AggregationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_include: IncludeEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_extend: IncludeEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_transition: TransitionEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_control_flow: ControlFlowEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_object_flow: ObjectFlowEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_message: MessageEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_create_message: MessageEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_destroy_message: MessageEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_reply_message: MessageEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_information_flow: InformationFlowEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_usage: DependencyEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_abstraction: DependencyEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_interface_realization: RealizationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_component_realization: RealizationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_manifestation: DependencyEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_deployment: DependencyEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_communication_path: AssociationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_nesting: AssociationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_package_merge: DependencyEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_package_import: DependencyEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_element_import: DependencyEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_substitution: GeneralizationEdge as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_rel_exception_handler: ControlFlowEdge as ComponentType<any>,
  // default fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: AssociationEdge as ComponentType<any>,
};
