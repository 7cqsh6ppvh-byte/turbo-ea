import type { ComponentType } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { UmlDiagramNode } from "./types";

// ─── helpers ────────────────────────────────────────────────────────────────

const HANDLE_STYLE = { opacity: 0 };

function AllHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Left} style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} style={HANDLE_STYLE} />
    </>
  );
}

// ─── Class / Interface / Enumeration node (3-compartment box) ───────────────

export function UmlClassNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 200;
  const label = data.label as string;
  const stereotype = data.stereotype as string | undefined;
  const isAbstract = !!(data.isAbstract as boolean | undefined);
  const isInterface = (data.elementTypeKey as string) === "uml_Interface";
  const isEnum = (data.elementTypeKey as string) === "uml_Enumeration";
  const isDataType = (data.elementTypeKey as string) === "uml_DataType";
  const borderColor = isInterface ? "#4c1d95" : "#1e3a8a";
  const bgHeader = (data.color as string) || (isInterface ? "#ede9fe" : "#dbeafe");

  // derive stereotype label
  let stereoLabel = stereotype ?? "";
  if (!stereoLabel) {
    if (isInterface) stereoLabel = "«interface»";
    else if (isEnum) stereoLabel = "«enumeration»";
    else if (isDataType) stereoLabel = "«dataType»";
  }

  const attrs = (data.attributes as { id: string; visibility: string; name: string; type: string; isStatic?: boolean; isDerived?: boolean }[] | undefined) ?? [];
  const ops = (data.operations as { id: string; visibility: string; name: string; parameters: string; returnType: string; isAbstract?: boolean; isStatic?: boolean }[] | undefined) ?? [];

  return (
    <Box
      sx={{
        width: w,
        border: selected ? `2px solid #1976d2` : `1.5px solid ${borderColor}`,
        borderRadius: "2px",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Header compartment */}
      <Box
        sx={{
          background: bgHeader,
          borderBottom: `1px solid ${borderColor}`,
          px: 1,
          py: 0.5,
          textAlign: "center",
          minHeight: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {stereoLabel && (
          <Typography
            sx={{ fontSize: "9px", fontStyle: "italic", color: "rgba(0,0,0,0.6)", lineHeight: 1.2 }}
          >
            {stereoLabel}
          </Typography>
        )}
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 700,
            fontStyle: isAbstract ? "italic" : "normal",
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Attributes compartment */}
      <Box
        sx={{
          borderBottom: `1px solid ${borderColor}`,
          px: 1,
          py: 0.25,
          minHeight: 18,
          background: "#fff",
        }}
      >
        {attrs.length === 0 ? (
          <Box sx={{ height: 14 }} />
        ) : (
          attrs.map((a) => (
            <Typography
              key={a.id}
              sx={{
                fontSize: "9px",
                lineHeight: 1.5,
                fontFamily: "monospace",
                textDecoration: a.isStatic ? "underline" : "none",
                color: "rgba(0,0,0,0.75)",
              }}
            >
              {a.visibility}
              {a.isDerived ? "/" : ""}
              {a.name}: {a.type}
            </Typography>
          ))
        )}
      </Box>

      {/* Operations compartment */}
      <Box sx={{ px: 1, py: 0.25, minHeight: 18, background: "#fff" }}>
        {ops.length === 0 ? (
          <Box sx={{ height: 14 }} />
        ) : (
          ops.map((o) => (
            <Typography
              key={o.id}
              sx={{
                fontSize: "9px",
                lineHeight: 1.5,
                fontFamily: "monospace",
                fontStyle: o.isAbstract ? "italic" : "normal",
                textDecoration: o.isStatic ? "underline" : "none",
                color: "rgba(0,0,0,0.75)",
              }}
            >
              {o.visibility}
              {o.name}({o.parameters}): {o.returnType}
            </Typography>
          ))
        )}
      </Box>

      <AllHandles />
    </Box>
  );
}

// ─── Actor (stick figure) ────────────────────────────────────────────────────

export function UmlActorNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const label = data.label as string;
  return (
    <Box
      sx={{
        width: 60,
        height: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "default",
        userSelect: "none",
        position: "relative",
      }}
    >
      <svg width={60} height={72}>
        {/* Head */}
        <circle
          cx={30}
          cy={12}
          r={10}
          fill="none"
          stroke={selected ? "#1976d2" : "#333"}
          strokeWidth={1.5}
        />
        {/* Body */}
        <line
          x1={30}
          y1={22}
          x2={30}
          y2={50}
          stroke={selected ? "#1976d2" : "#333"}
          strokeWidth={1.5}
        />
        {/* Arms */}
        <line
          x1={12}
          y1={34}
          x2={48}
          y2={34}
          stroke={selected ? "#1976d2" : "#333"}
          strokeWidth={1.5}
        />
        {/* Left leg */}
        <line
          x1={30}
          y1={50}
          x2={14}
          y2={68}
          stroke={selected ? "#1976d2" : "#333"}
          strokeWidth={1.5}
        />
        {/* Right leg */}
        <line
          x1={30}
          y1={50}
          x2={46}
          y2={68}
          stroke={selected ? "#1976d2" : "#333"}
          strokeWidth={1.5}
        />
      </svg>
      <Typography
        sx={{ fontSize: "10px", fontWeight: 600, textAlign: "center", lineHeight: 1.2, mt: 0.25 }}
      >
        {label}
      </Typography>
      <AllHandles />
    </Box>
  );
}

// ─── Use Case (ellipse) ──────────────────────────────────────────────────────

export function UmlUseCaseNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 150;
  const h = (data.height as number) || 60;
  const label = data.label as string;
  const stereotype = data.stereotype as string | undefined;
  const rx = w / 2;
  const ry = h / 2;

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <ellipse
          cx={rx}
          cy={ry}
          rx={rx - 1}
          ry={ry - 1}
          fill={(data.color as string) || "#fce7f3"}
          stroke={selected ? "#1976d2" : "#be185d"}
          strokeWidth={selected ? 2 : 1.5}
        />
        {stereotype && (
          <text
            x={rx}
            y={ry - 8}
            textAnchor="middle"
            fontSize={9}
            fontStyle="italic"
            fill="rgba(0,0,0,0.55)"
          >
            {stereotype}
          </text>
        )}
        <text
          x={rx}
          y={stereotype ? ry + 6 : ry + 4}
          textAnchor="middle"
          fontSize={10}
          fontWeight="600"
          fill="rgba(0,0,0,0.8)"
        >
          {label}
        </text>
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Note (dog-eared rectangle) ──────────────────────────────────────────────

export function UmlNoteNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 160;
  const h = (data.height as number) || 80;
  const label = data.label as string;
  const fold = 14;

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={w} height={h}>
        {/* Main body */}
        <polygon
          points={`0,0 ${w - fold},0 ${w},${fold} ${w},${h} 0,${h}`}
          fill={(data.color as string) || "#fef3c7"}
          stroke={selected ? "#1976d2" : "#b45309"}
          strokeWidth={selected ? 2 : 1.2}
        />
        {/* Fold triangle */}
        <polygon
          points={`${w - fold},0 ${w - fold},${fold} ${w},${fold}`}
          fill="#fde68a"
          stroke={selected ? "#1976d2" : "#b45309"}
          strokeWidth={1}
        />
        {/* Text */}
        <foreignObject x={6} y={4} width={w - fold - 8} height={h - 10}>
          <div
            // @ts-expect-error xmlns attr
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              fontSize: "9px",
              lineHeight: "1.4",
              wordBreak: "break-word",
              color: "rgba(0,0,0,0.75)",
              overflow: "hidden",
              height: "100%",
            }}
          >
            {label}
          </div>
        </foreignObject>
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Action (rounded rectangle) ──────────────────────────────────────────────

export function UmlActionNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 160;
  const h = (data.height as number) || 50;
  const label = data.label as string;
  const bgColor = (data.color as string) || "#fff7ed";
  const isCallBehavior = (data.elementTypeKey as string) === "uml_CallBehaviorAction";

  return (
    <Box
      sx={{
        width: w,
        height: h,
        background: bgColor,
        border: selected ? "2px solid #1976d2" : "1.5px solid #c2410c",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      <Typography
        sx={{ fontSize: "10px", fontWeight: 600, textAlign: "center", px: 1, lineHeight: 1.3 }}
      >
        {label}
      </Typography>
      {isCallBehavior && (
        <Box
          sx={{
            position: "absolute",
            right: 6,
            bottom: 4,
            fontSize: "8px",
            color: "rgba(0,0,0,0.4)",
          }}
        >
          ▶▶
        </Box>
      )}
      <AllHandles />
    </Box>
  );
}

// ─── Decision / Choice (diamond) ─────────────────────────────────────────────

export function UmlDecisionNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const size = (data.width as number) || 40;
  const half = size / 2;

  return (
    <Box
      sx={{ width: size, height: size, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={size} height={size}>
        <polygon
          points={`${half},1 ${size - 1},${half} ${half},${size - 1} 1,${half}`}
          fill={(data.color as string) || "#fff7ed"}
          stroke={selected ? "#1976d2" : "#c2410c"}
          strokeWidth={selected ? 2 : 1.5}
        />
      </svg>
      {/* 4 handles at the diamond tips */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...HANDLE_STYLE, top: 0, left: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...HANDLE_STYLE, bottom: 0, left: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ ...HANDLE_STYLE, left: 0, top: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ ...HANDLE_STYLE, right: 0, top: "50%" }}
      />
    </Box>
  );
}

// ─── Fork / Join (thick bar) ─────────────────────────────────────────────────

export function UmlForkJoinNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 120;
  return (
    <Box
      sx={{
        width: w,
        height: 6,
        background: selected ? "#1976d2" : "#1f2937",
        borderRadius: "2px",
        position: "relative",
        cursor: "default",
        userSelect: "none",
      }}
    >
      <AllHandles />
    </Box>
  );
}

// ─── Initial node (filled circle) ───────────────────────────────────────────

export function UmlInitialNodeRenderer({ selected }: NodeProps<UmlDiagramNode>) {
  return (
    <Box
      sx={{ width: 24, height: 24, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={24} height={24}>
        <circle
          cx={12}
          cy={12}
          r={11}
          fill={selected ? "#1976d2" : "#1f2937"}
          stroke="none"
        />
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Activity Final (circle-in-circle) ──────────────────────────────────────

export function UmlFinalNodeRenderer({ selected }: NodeProps<UmlDiagramNode>) {
  const stroke = selected ? "#1976d2" : "#1f2937";
  return (
    <Box
      sx={{ width: 30, height: 30, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={30} height={30}>
        <circle cx={15} cy={15} r={14} fill="white" stroke={stroke} strokeWidth={1.5} />
        <circle cx={15} cy={15} r={9} fill={stroke} />
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Flow Final (circle with X) ─────────────────────────────────────────────

export function UmlFlowFinalNodeRenderer({ selected }: NodeProps<UmlDiagramNode>) {
  const stroke = selected ? "#1976d2" : "#1f2937";
  const s = 30;
  const c = s / 2;
  const r = s / 2 - 1;
  const offset = r * 0.65;
  return (
    <Box
      sx={{ width: s, height: s, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={s} height={s}>
        <circle cx={c} cy={c} r={r} fill="white" stroke={stroke} strokeWidth={1.5} />
        <line
          x1={c - offset}
          y1={c - offset}
          x2={c + offset}
          y2={c + offset}
          stroke={stroke}
          strokeWidth={1.5}
        />
        <line
          x1={c + offset}
          y1={c - offset}
          x2={c - offset}
          y2={c + offset}
          stroke={stroke}
          strokeWidth={1.5}
        />
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── State (rounded rectangle with compartments) ────────────────────────────

export function UmlStateNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 160;
  const label = data.label as string;
  const entryAction = data.entryAction as string | undefined;
  const exitAction = data.exitAction as string | undefined;
  const doAction = data.doAction as string | undefined;
  const bgColor = (data.color as string) || "#f3e8ff";
  const hasActions = entryAction || exitAction || doAction;

  return (
    <Box
      sx={{
        width: w,
        background: bgColor,
        border: selected ? "2px solid #1976d2" : "1.5px solid #6b21a8",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 1.5, py: 0.75, textAlign: "center" }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 700, lineHeight: 1.3 }}>{label}</Typography>
      </Box>
      {hasActions && (
        <Box
          sx={{
            borderTop: "1px solid #6b21a8",
            px: 1.5,
            py: 0.5,
            background: "rgba(255,255,255,0.5)",
          }}
        >
          {entryAction && (
            <Typography sx={{ fontSize: "9px", lineHeight: 1.5, fontFamily: "monospace" }}>
              entry / {entryAction}
            </Typography>
          )}
          {doAction && (
            <Typography sx={{ fontSize: "9px", lineHeight: 1.5, fontFamily: "monospace" }}>
              do / {doAction}
            </Typography>
          )}
          {exitAction && (
            <Typography sx={{ fontSize: "9px", lineHeight: 1.5, fontFamily: "monospace" }}>
              exit / {exitAction}
            </Typography>
          )}
        </Box>
      )}
      <AllHandles />
    </Box>
  );
}

// ─── Lifeline (box + dashed vertical line) ───────────────────────────────────

export function UmlLifelineNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 120;
  const h = (data.height as number) || 200;
  const label = data.label as string;
  const instanceOf = data.instanceOf as string | undefined;
  const headerH = 40;
  const lineX = w / 2;
  const bgColor = (data.color as string) || "#ecfeff";
  const borderC = selected ? "#1976d2" : "#0e7490";

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      {/* Header box */}
      <Box
        sx={{
          width: w,
          height: headerH,
          background: bgColor,
          border: `1.5px solid ${borderC}`,
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <Typography sx={{ fontSize: "10px", fontWeight: 600, textDecoration: "underline" }}>
          {instanceOf ? `${label} : ${instanceOf}` : `: ${label}`}
        </Typography>
      </Box>
      {/* Dashed lifeline */}
      <svg
        width={w}
        height={h - headerH}
        style={{ position: "absolute", top: headerH, left: 0 }}
      >
        <line
          x1={lineX}
          y1={0}
          x2={lineX}
          y2={h - headerH}
          stroke={borderC}
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Component (rectangle with component icon) ───────────────────────────────

export function UmlComponentNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 180;
  const h = (data.height as number) || 80;
  const label = data.label as string;
  const bgColor = (data.color as string) || "#dcfce7";
  const borderC = selected ? "#1976d2" : "#15803d";

  return (
    <Box
      sx={{
        width: w,
        height: h,
        background: bgColor,
        border: `1.5px solid ${borderC}`,
        borderRadius: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      {/* «component» stereotype */}
      <Box
        sx={{
          position: "absolute",
          top: 4,
          left: 8,
          right: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{ fontSize: "9px", fontStyle: "italic", color: "rgba(0,0,0,0.55)", lineHeight: 1.2 }}
        >
          «component»
        </Typography>
        <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>{label}</Typography>
      </Box>
      {/* UML component icon (two small rectangles) */}
      <svg
        width={20}
        height={22}
        style={{ position: "absolute", top: 8, right: 6 }}
      >
        <rect x={5} y={0} width={15} height={20} fill="none" stroke={borderC} strokeWidth={1.2} />
        <rect x={0} y={4} width={9} height={4} fill={bgColor} stroke={borderC} strokeWidth={1.2} />
        <rect x={0} y={12} width={9} height={4} fill={bgColor} stroke={borderC} strokeWidth={1.2} />
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Node 3D (pseudo-3D box) ─────────────────────────────────────────────────

export function UmlNode3DRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 200;
  const h = (data.height as number) || 100;
  const label = data.label as string;
  const bgColor = (data.color as string) || "#dcfce7";
  const borderC = selected ? "#1976d2" : "#15803d";
  const depth = 14;
  const typeKey = data.elementTypeKey as string;
  const stereo =
    typeKey === "uml_Device"
      ? "«device»"
      : typeKey === "uml_ExecutionEnvironment"
        ? "«executionEnvironment»"
        : "«node»";

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        {/* Main front face */}
        <rect
          x={0}
          y={depth}
          width={w - depth}
          height={h - depth}
          fill={bgColor}
          stroke={borderC}
          strokeWidth={selected ? 2 : 1.5}
        />
        {/* Top face */}
        <polygon
          points={`0,${depth} ${depth},0 ${w},0 ${w - depth},${depth}`}
          fill={bgColor}
          stroke={borderC}
          strokeWidth={selected ? 2 : 1.5}
          style={{ opacity: 0.85 }}
        />
        {/* Right face */}
        <polygon
          points={`${w - depth},${depth} ${w},0 ${w},${h - depth} ${w - depth},${h}`}
          fill={bgColor}
          stroke={borderC}
          strokeWidth={selected ? 2 : 1.5}
          style={{ opacity: 0.7 }}
        />
        {/* Stereotype */}
        <text
          x={(w - depth) / 2}
          y={depth + 18}
          textAnchor="middle"
          fontSize={9}
          fontStyle="italic"
          fill="rgba(0,0,0,0.55)"
        >
          {stereo}
        </text>
        {/* Label */}
        <text
          x={(w - depth) / 2}
          y={depth + 34}
          textAnchor="middle"
          fontSize={11}
          fontWeight="700"
          fill="rgba(0,0,0,0.8)"
        >
          {label}
        </text>
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Artifact (dog-eared) ────────────────────────────────────────────────────

export function UmlArtifactNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 160;
  const h = (data.height as number) || 60;
  const label = data.label as string;
  const fold = 12;
  const bgColor = (data.color as string) || "#dcfce7";
  const borderC = selected ? "#1976d2" : "#15803d";

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={w} height={h}>
        <polygon
          points={`0,0 ${w - fold},0 ${w},${fold} ${w},${h} 0,${h}`}
          fill={bgColor}
          stroke={borderC}
          strokeWidth={selected ? 2 : 1.5}
        />
        <polygon
          points={`${w - fold},0 ${w - fold},${fold} ${w},${fold}`}
          fill="#d1fae5"
          stroke={borderC}
          strokeWidth={1}
        />
        <text
          x={w / 2 - 4}
          y={h / 2 - 4}
          textAnchor="middle"
          fontSize={9}
          fontStyle="italic"
          fill="rgba(0,0,0,0.55)"
        >
          «artifact»
        </text>
        <text
          x={w / 2 - 4}
          y={h / 2 + 8}
          textAnchor="middle"
          fontSize={10}
          fontWeight="700"
          fill="rgba(0,0,0,0.8)"
        >
          {label}
        </text>
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Package (folder shape) ──────────────────────────────────────────────────

export function UmlPackageNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 200;
  const h = (data.height as number) || 120;
  const label = data.label as string;
  const bgColor = (data.color as string) || "#fef9c3";
  const borderC = selected ? "#1976d2" : "#854d0e";
  const tabW = Math.min(80, w * 0.45);
  const tabH = 20;

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={w} height={h}>
        {/* Tab */}
        <rect
          x={0}
          y={0}
          width={tabW}
          height={tabH}
          fill={bgColor}
          stroke={borderC}
          strokeWidth={selected ? 2 : 1.5}
        />
        {/* Label in tab */}
        <text
          x={tabW / 2}
          y={tabH - 5}
          textAnchor="middle"
          fontSize={9}
          fontWeight="600"
          fill="rgba(0,0,0,0.75)"
        >
          {label}
        </text>
        {/* Body */}
        <rect
          x={0}
          y={tabH}
          width={w}
          height={h - tabH}
          fill={bgColor}
          stroke={borderC}
          strokeWidth={selected ? 2 : 1.5}
        />
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Subject (dashed system boundary) ────────────────────────────────────────

export function UmlSubjectNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 300;
  const h = (data.height as number) || 250;
  const label = data.label as string;

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={w} height={h}>
        <rect
          x={1}
          y={1}
          width={w - 2}
          height={h - 2}
          fill="rgba(252,231,243,0.25)"
          stroke={selected ? "#1976d2" : "#be185d"}
          strokeWidth={selected ? 2 : 1.5}
          strokeDasharray="6 3"
          rx={4}
        />
        <text
          x={8}
          y={18}
          fontSize={11}
          fontWeight="700"
          fill="rgba(0,0,0,0.7)"
        >
          {label}
        </text>
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Combined Fragment (interaction box) ─────────────────────────────────────

export function UmlFragmentNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 300;
  const h = (data.height as number) || 200;
  const operator = (data.interactionOperator as string) || "alt";
  const guards = (data.guards as string[] | undefined) ?? [];
  const labelW = Math.min(50, operator.length * 8 + 10);
  const labelH = 22;

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={w} height={h}>
        <rect
          x={1}
          y={1}
          width={w - 2}
          height={h - 2}
          fill="rgba(236,254,255,0.5)"
          stroke={selected ? "#1976d2" : "#0e7490"}
          strokeWidth={selected ? 2 : 1.5}
        />
        {/* Pentagon tab */}
        <polygon
          points={`0,0 ${labelW},0 ${labelW + 8},${labelH / 2} ${labelW},${labelH} 0,${labelH}`}
          fill="#cffafe"
          stroke={selected ? "#1976d2" : "#0e7490"}
          strokeWidth={1.2}
        />
        <text
          x={labelW / 2}
          y={labelH - 6}
          textAnchor="middle"
          fontSize={10}
          fontWeight="700"
          fill="#0e7490"
        >
          {operator}
        </text>
        {/* Guard lines (dashed horizontal dividers) */}
        {guards.map((g, i) => {
          const y = labelH + ((h - labelH) / (guards.length + 1)) * (i + 1);
          return (
            <g key={i}>
              <line
                x1={1}
                y1={y}
                x2={w - 1}
                y2={y}
                stroke="#0e7490"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text x={6} y={y - 3} fontSize={9} fontStyle="italic" fill="rgba(0,0,0,0.55)">
                [{g}]
              </text>
            </g>
          );
        })}
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── History pseudostate (H / H*) ────────────────────────────────────────────

export function UmlHistoryNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const isDeep = (data.elementTypeKey as string) === "uml_PseudostateDeepHistory";
  const s = 30;
  const c = s / 2;
  const r = s / 2 - 1;
  const stroke = selected ? "#1976d2" : "#6b21a8";

  return (
    <Box
      sx={{ width: s, height: s, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={s} height={s}>
        <circle cx={c} cy={c} r={r} fill="#f3e8ff" stroke={stroke} strokeWidth={1.5} />
        <text x={c} y={c + 4} textAnchor="middle" fontSize={10} fontWeight="700" fill={stroke}>
          {isDeep ? "H*" : "H"}
        </text>
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Entry/Exit point ────────────────────────────────────────────────────────

export function UmlEntryExitNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const isExit = (data.elementTypeKey as string) === "uml_PseudostateExitPoint";
  const s = 24;
  const c = s / 2;
  const r = s / 2 - 1;
  const stroke = selected ? "#1976d2" : "#6b21a8";
  const offset = r * 0.6;

  return (
    <Box
      sx={{ width: s, height: s, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={s} height={s}>
        <circle cx={c} cy={c} r={r} fill="white" stroke={stroke} strokeWidth={1.5} />
        {isExit && (
          <>
            <line
              x1={c - offset}
              y1={c - offset}
              x2={c + offset}
              y2={c + offset}
              stroke={stroke}
              strokeWidth={1.5}
            />
            <line
              x1={c + offset}
              y1={c - offset}
              x2={c - offset}
              y2={c + offset}
              stroke={stroke}
              strokeWidth={1.5}
            />
          </>
        )}
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Junction (small filled circle) ─────────────────────────────────────────

export function UmlJunctionNodeRenderer({ selected }: NodeProps<UmlDiagramNode>) {
  const s = 20;
  const c = s / 2;
  const r = s / 2 - 1;

  return (
    <Box
      sx={{ width: s, height: s, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={s} height={s}>
        <circle cx={c} cy={c} r={r} fill={selected ? "#1976d2" : "#6b21a8"} />
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Activity Partition (swim lane) ──────────────────────────────────────────

export function UmlPartitionNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 200;
  const h = (data.height as number) || 300;
  const label = data.label as string;
  const labelBarH = 30;
  const bgColor = (data.color as string) || "#fff7ed";
  const borderC = selected ? "#1976d2" : "#c2410c";

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={w} height={h}>
        {/* Label bar */}
        <rect
          x={0}
          y={0}
          width={w}
          height={labelBarH}
          fill={bgColor}
          stroke={borderC}
          strokeWidth={selected ? 2 : 1.5}
        />
        <text
          x={w / 2}
          y={labelBarH - 8}
          textAnchor="middle"
          fontSize={11}
          fontWeight="700"
          fill="rgba(0,0,0,0.75)"
        >
          {label}
        </text>
        {/* Body with dashed border */}
        <rect
          x={0}
          y={labelBarH}
          width={w}
          height={h - labelBarH}
          fill="rgba(255,247,237,0.3)"
          stroke={borderC}
          strokeWidth={1.2}
          strokeDasharray="5 3"
        />
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Frame (diagram frame with pentagon label) ────────────────────────────────

export function UmlFrameNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 300;
  const h = (data.height as number) || 200;
  const label = data.label as string;
  const labelW = Math.min(100, label.length * 8 + 12);
  const labelH = 22;

  return (
    <Box
      sx={{ width: w, height: h, position: "relative", cursor: "default", userSelect: "none" }}
    >
      <svg width={w} height={h}>
        <rect
          x={1}
          y={1}
          width={w - 2}
          height={h - 2}
          fill="rgba(248,250,252,0.6)"
          stroke={selected ? "#1976d2" : "#64748b"}
          strokeWidth={selected ? 2 : 1}
        />
        {/* Pentagon tab */}
        <polygon
          points={`0,0 ${labelW},0 ${labelW + 8},${labelH / 2} ${labelW},${labelH} 0,${labelH}`}
          fill="#f1f5f9"
          stroke={selected ? "#1976d2" : "#64748b"}
          strokeWidth={1}
        />
        <text
          x={labelW / 2}
          y={labelH - 6}
          textAnchor="middle"
          fontSize={9}
          fontWeight="600"
          fill="rgba(0,0,0,0.65)"
        >
          {label}
        </text>
      </svg>
      <AllHandles />
    </Box>
  );
}

// ─── Activity (rounded rectangle, larger) ────────────────────────────────────

export function UmlActivityNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 180;
  const h = (data.height as number) || 80;
  const label = data.label as string;
  const bgColor = (data.color as string) || "#fff7ed";

  return (
    <Box
      sx={{
        width: w,
        height: h,
        background: bgColor,
        border: selected ? "2px solid #1976d2" : "1.5px solid #c2410c",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 4,
          right: 8,
          fontSize: "9px",
          fontStyle: "italic",
          color: "rgba(0,0,0,0.4)",
        }}
      >
        «activity»
      </Box>
      <Typography
        sx={{ fontSize: "11px", fontWeight: 600, textAlign: "center", px: 1.5, lineHeight: 1.3 }}
      >
        {label}
      </Typography>
      <AllHandles />
    </Box>
  );
}

// ─── Default fallback node ────────────────────────────────────────────────────

export function UmlDefaultNodeRenderer({ data, selected }: NodeProps<UmlDiagramNode>) {
  const w = (data.width as number) || 160;
  const h = (data.height as number) || 60;
  const label = data.label as string;
  const bgColor = (data.color as string) || "#e0e0e0";

  return (
    <Box
      sx={{
        width: w,
        height: h,
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
        {label}
      </Typography>
      <AllHandles />
    </Box>
  );
}

// ─── Export NODE_TYPES map ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NODE_TYPES: Record<string, ComponentType<any>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_class: UmlClassNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_actor: UmlActorNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_usecase: UmlUseCaseNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_note: UmlNoteNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_action: UmlActionNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_decision: UmlDecisionNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_forkjoin: UmlForkJoinNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_initial: UmlInitialNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_final: UmlFinalNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_flowfinal: UmlFlowFinalNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_state: UmlStateNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_lifeline: UmlLifelineNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_component: UmlComponentNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_node3d: UmlNode3DRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_artifact: UmlArtifactNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_package: UmlPackageNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_subject: UmlSubjectNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_fragment: UmlFragmentNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_history: UmlHistoryNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_entryexit: UmlEntryExitNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_junction: UmlJunctionNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_partition: UmlPartitionNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_frame: UmlFrameNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_activity: UmlActivityNodeRenderer as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uml_default: UmlDefaultNodeRenderer as ComponentType<any>,
};
