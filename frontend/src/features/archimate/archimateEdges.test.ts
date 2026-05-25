import { describe, it, expect } from "vitest";
import { ARCHIMATE_RELATION_STYLES } from "./archimateShapes";
import { EDGE_TYPES, getEdgeStyle } from "./archimateEdges";

describe("ARCHIMATE_RELATION_STYLES coverage", () => {
  it("defines styles for all 11 relation types", () => {
    expect(Object.keys(ARCHIMATE_RELATION_STYLES)).toHaveLength(11);
  });

  it("Composition has filled diamond source marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["arch_rel_Composition"].sourceMarker).toBe("diamond-filled");
  });

  it("Aggregation has hollow diamond source marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["arch_rel_Aggregation"].sourceMarker).toBe("diamond-hollow");
  });

  it("Realization uses dashed line", () => {
    expect(ARCHIMATE_RELATION_STYLES["arch_rel_Realization"].strokeDasharray).toBeTruthy();
  });

  it("Assignment has filled circle source marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["arch_rel_Assignment"].sourceMarker).toBe("circle-filled");
  });

  it("Triggering has filled arrow target marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["arch_rel_Triggering"].targetMarker).toBe("arrow-filled");
  });

  it("Flow has dashed line and filled arrow", () => {
    const style = ARCHIMATE_RELATION_STYLES["arch_rel_Flow"];
    expect(style.strokeDasharray).toBeTruthy();
    expect(style.targetMarker).toBe("arrow-filled");
  });

  it("Specialization has hollow triangle target marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["arch_rel_Specialization"].targetMarker).toBe(
      "triangle-hollow",
    );
  });

  it("Association has no special markers", () => {
    const style = ARCHIMATE_RELATION_STYLES["arch_rel_Association"];
    expect(style.sourceMarker).toBeUndefined();
    expect(style.targetMarker).toBeUndefined();
  });

  it("Access uses dashed line", () => {
    expect(ARCHIMATE_RELATION_STYLES["arch_rel_Access"].strokeDasharray).toBeTruthy();
  });

  it("Influence uses dashed line", () => {
    expect(ARCHIMATE_RELATION_STYLES["arch_rel_Influence"].strokeDasharray).toBeTruthy();
  });
});

describe("EDGE_TYPES", () => {
  it("covers all 11 relation type keys", () => {
    const relKeys = Object.keys(ARCHIMATE_RELATION_STYLES);
    for (const key of relKeys) {
      expect(EDGE_TYPES[key], `Missing edge type for ${key}`).toBeDefined();
    }
  });

  it("has an entry for arch_rel_Association", () => {
    expect(EDGE_TYPES["arch_rel_Association"]).toBeDefined();
  });

  it("has an entry for arch_rel_Composition", () => {
    expect(EDGE_TYPES["arch_rel_Composition"]).toBeDefined();
  });

  it("has an entry for arch_rel_Specialization", () => {
    expect(EDGE_TYPES["arch_rel_Specialization"]).toBeDefined();
  });
});

describe("getEdgeStyle", () => {
  it("returns style for known relation type", () => {
    const style = getEdgeStyle("arch_rel_Serving");
    expect(style).toBeDefined();
    expect(style?.targetMarker).toBe("arrow-open");
  });

  it("returns undefined for unknown relation type", () => {
    expect(getEdgeStyle("unknown_rel")).toBeUndefined();
  });

  it("returns correct strokeDasharray for Realization", () => {
    const style = getEdgeStyle("arch_rel_Realization");
    expect(style?.strokeDasharray).toBeTruthy();
  });
});
