import { describe, it, expect } from "vitest";
import { ARCHIMATE_RELATION_STYLES } from "./archimateShapes";
import { EDGE_TYPES, getEdgeStyle } from "./archimateEdges";

describe("ARCHIMATE_RELATION_STYLES coverage", () => {
  it("defines styles for all 11 relation types", () => {
    expect(Object.keys(ARCHIMATE_RELATION_STYLES)).toHaveLength(11);
  });

  it("Composition has filled diamond source marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["Composition"].sourceMarker).toBe("diamond-filled");
  });

  it("Aggregation has hollow diamond source marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["Aggregation"].sourceMarker).toBe("diamond-hollow");
  });

  it("Realization uses dashed line", () => {
    expect(ARCHIMATE_RELATION_STYLES["Realization"].strokeDasharray).toBeTruthy();
  });

  it("Assignment has filled circle source marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["Assignment"].sourceMarker).toBe("circle-filled");
  });

  it("Triggering has filled arrow target marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["Triggering"].targetMarker).toBe("arrow-filled");
  });

  it("Flow has dashed line and filled arrow", () => {
    const style = ARCHIMATE_RELATION_STYLES["Flow"];
    expect(style.strokeDasharray).toBeTruthy();
    expect(style.targetMarker).toBe("arrow-filled");
  });

  it("Specialization has hollow triangle target marker", () => {
    expect(ARCHIMATE_RELATION_STYLES["Specialization"].targetMarker).toBe(
      "triangle-hollow",
    );
  });

  it("Association has no special markers", () => {
    const style = ARCHIMATE_RELATION_STYLES["Association"];
    expect(style.sourceMarker).toBeUndefined();
    expect(style.targetMarker).toBeUndefined();
  });

  it("Access uses dashed line", () => {
    expect(ARCHIMATE_RELATION_STYLES["Access"].strokeDasharray).toBeTruthy();
  });

  it("Influence uses dashed line", () => {
    expect(ARCHIMATE_RELATION_STYLES["Influence"].strokeDasharray).toBeTruthy();
  });
});

describe("EDGE_TYPES", () => {
  it("covers all 11 relation type keys", () => {
    const relKeys = Object.keys(ARCHIMATE_RELATION_STYLES);
    for (const key of relKeys) {
      expect(EDGE_TYPES[key], `Missing edge type for ${key}`).toBeDefined();
    }
  });

  it("has an entry for Association", () => {
    expect(EDGE_TYPES["Association"]).toBeDefined();
  });

  it("has an entry for Composition", () => {
    expect(EDGE_TYPES["Composition"]).toBeDefined();
  });

  it("has an entry for Specialization", () => {
    expect(EDGE_TYPES["Specialization"]).toBeDefined();
  });
});

describe("getEdgeStyle", () => {
  it("returns style for known relation type", () => {
    const style = getEdgeStyle("Serving");
    expect(style).toBeDefined();
    expect(style?.targetMarker).toBe("arrow-open");
  });

  it("returns undefined for unknown relation type", () => {
    expect(getEdgeStyle("unknown_rel")).toBeUndefined();
  });

  it("returns correct strokeDasharray for Realization", () => {
    const style = getEdgeStyle("Realization");
    expect(style?.strokeDasharray).toBeTruthy();
  });
});
