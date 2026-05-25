import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import "@testing-library/jest-dom";
import { ARCHIMATE_ELEMENT_META } from "./archimateShapes";
import { NODE_TYPES, ArchimateElementNode } from "./archimateNodes";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
);

const baseNodeProps = {
  id: "node-1",
  type: "arch_ApplicationComponent",
  selected: false,
  zIndex: 1,
  isConnectable: true,
  xPos: 0,
  yPos: 0,
  dragging: false,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  width: 160,
  height: 60,
};

describe("ArchimateElementNode", () => {
  it("renders with correct label", () => {
    render(
      <ArchimateElementNode
        {...baseNodeProps}
        data={{
          label: "NexaCore ERP",
          elementTypeKey: "arch_ApplicationComponent",
          layer: "Application",
          aspect: "ActiveStructure",
          color: "#b3d9ff",
          width: 160,
          height: 60,
        }}
      />,
      { wrapper },
    );
    expect(screen.getByText("NexaCore ERP")).toBeInTheDocument();
  });

  it("renders with the element layer color as background", () => {
    const { container } = render(
      <ArchimateElementNode
        {...baseNodeProps}
        data={{
          label: "Test App",
          elementTypeKey: "arch_ApplicationComponent",
          layer: "Application",
          aspect: "ActiveStructure",
          color: "#b3d9ff",
          width: 160,
          height: 60,
        }}
      />,
      { wrapper },
    );
    const nodeEl = container.querySelector("[data-color]");
    expect(nodeEl?.getAttribute("data-color")).toContain("b3d9ff");
  });

  it("renders connection handles", () => {
    const { container } = render(
      <ArchimateElementNode
        {...baseNodeProps}
        data={{
          label: "Test",
          elementTypeKey: "arch_BusinessActor",
          layer: "Business",
          aspect: "ActiveStructure",
          color: "#f5e27a",
          width: 160,
          height: 60,
        }}
      />,
      { wrapper },
    );
    const handles = container.querySelectorAll(".react-flow__handle");
    expect(handles.length).toBeGreaterThan(0);
  });
});

describe("NODE_TYPES", () => {
  it("covers all 61 element type keys", () => {
    const metaKeys = Object.keys(ARCHIMATE_ELEMENT_META);
    for (const key of metaKeys) {
      expect(NODE_TYPES[key], `Missing node type for ${key}`).toBeDefined();
    }
  });

  it("has an entry for arch_Grouping", () => {
    expect(NODE_TYPES["arch_Grouping"]).toBeDefined();
  });

  it("has an entry for arch_Junction", () => {
    expect(NODE_TYPES["arch_Junction"]).toBeDefined();
  });
});
