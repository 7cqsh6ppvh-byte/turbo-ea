import { describe, it, expect } from "vitest";
import {
  ARCHIMATE_ELEMENT_META,
  ARCHIMATE_LAYER_COLORS,
  ARCHIMATE_RELATION_STYLES,
  getElementMeta,
  getRelationStyle,
} from "./archimateShapes";

describe("ArchiMate Element Metadata", () => {
  it("defines metadata for all 61 element types", () => {
    expect(Object.keys(ARCHIMATE_ELEMENT_META)).toHaveLength(61);
  });

  it("no element keys have arch_ prefix", () => {
    const invalid = Object.keys(ARCHIMATE_ELEMENT_META).filter((k) => k.startsWith("arch_"));
    expect(invalid).toHaveLength(0);
  });

  it("all elements have a valid layer", () => {
    const validLayers = [
      "Business", "Application", "Technology",
      "Motivation", "Strategy", "Implementation", "Physical", "Composite",
    ];
    const invalid = Object.values(ARCHIMATE_ELEMENT_META).filter(
      (m) => !validLayers.includes(m.layer),
    );
    expect(invalid).toHaveLength(0);
  });

  it("all elements have a defaultColor", () => {
    const missing = Object.values(ARCHIMATE_ELEMENT_META).filter(
      (m) => !m.defaultColor?.startsWith("#"),
    );
    expect(missing).toHaveLength(0);
  });

  it("all elements have defaultWidth and defaultHeight", () => {
    const missing = Object.values(ARCHIMATE_ELEMENT_META).filter(
      (m) => !m.defaultWidth || !m.defaultHeight,
    );
    expect(missing).toHaveLength(0);
  });

  it("all elements have an aspect assignment", () => {
    const validAspects = ["ActiveStructure", "Behavior", "PassiveStructure", "Other"];
    const invalid = Object.values(ARCHIMATE_ELEMENT_META).filter(
      (m) => !validAspects.includes(m.aspect),
    );
    expect(invalid).toHaveLength(0);
  });

  it("getElementMeta returns metadata for known key", () => {
    const meta = getElementMeta("ApplicationComponent");
    expect(meta).toBeDefined();
    expect(meta?.layer).toBe("Application");
    expect(meta?.aspect).toBe("ActiveStructure");
  });

  it("getElementMeta returns undefined for unknown key", () => {
    expect(getElementMeta("unknown_key")).toBeUndefined();
  });
});

describe("ArchiMate Layer Colors", () => {
  it("covers all 8 layers", () => {
    const layers = Object.keys(ARCHIMATE_LAYER_COLORS);
    expect(layers).toHaveLength(8);
  });

  it("all layer colors are valid hex strings", () => {
    const invalid = Object.values(ARCHIMATE_LAYER_COLORS).filter(
      (c) => !/^#[0-9a-fA-F]{3,8}$/.test(c),
    );
    expect(invalid).toHaveLength(0);
  });

  it("Business layer is yellow", () => {
    expect(ARCHIMATE_LAYER_COLORS["Business"]).toBe("#f5e27a");
  });

  it("Application layer is blue", () => {
    expect(ARCHIMATE_LAYER_COLORS["Application"]).toBe("#b3d9ff");
  });

  it("Technology layer is green", () => {
    expect(ARCHIMATE_LAYER_COLORS["Technology"]).toBe("#aae6aa");
  });
});

describe("ArchiMate Relation Styles", () => {
  it("defines styles for all 11 relation types", () => {
    expect(Object.keys(ARCHIMATE_RELATION_STYLES)).toHaveLength(11);
  });

  it("no relation style keys have arch_rel_ prefix", () => {
    const invalid = Object.keys(ARCHIMATE_RELATION_STYLES).filter(
      (k) => k.startsWith("arch_rel_"),
    );
    expect(invalid).toHaveLength(0);
  });

  it("Composition has filled diamond source marker", () => {
    const style = ARCHIMATE_RELATION_STYLES["Composition"];
    expect(style.sourceMarker).toBe("diamond-filled");
  });

  it("Realization uses dashed line", () => {
    const style = ARCHIMATE_RELATION_STYLES["Realization"];
    expect(style.strokeDasharray).toBeTruthy();
  });

  it("Assignment has filled circle source marker", () => {
    const style = ARCHIMATE_RELATION_STYLES["Assignment"];
    expect(style.sourceMarker).toBe("circle-filled");
  });

  it("Association has no special markers", () => {
    const style = ARCHIMATE_RELATION_STYLES["Association"];
    expect(style.sourceMarker).toBeUndefined();
  });

  it("getRelationStyle returns style for known key", () => {
    const style = getRelationStyle("Serving");
    expect(style).toBeDefined();
  });

  it("getRelationStyle returns undefined for unknown key", () => {
    expect(getRelationStyle("unknown_rel")).toBeUndefined();
  });
});
