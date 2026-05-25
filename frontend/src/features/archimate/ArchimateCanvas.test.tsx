import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import "@testing-library/jest-dom";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

vi.mock("@/api/client", () => ({
  api: {
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import { api } from "@/api/client";
import { ArchimateCanvas } from "./ArchimateCanvas";
import type { ArchiMateDiagramData } from "./types";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
);

const emptyDiagram: ArchiMateDiagramData = { nodes: [], edges: [], version: "1" };

const diagramWithNodes: ArchiMateDiagramData = {
  nodes: [
    {
      id: "n1",
      type: "arch_ApplicationComponent",
      position: { x: 100, y: 100 },
      data: {
        label: "NexaCore ERP",
        elementTypeKey: "arch_ApplicationComponent",
        layer: "Application",
        aspect: "ActiveStructure",
        color: "#b3d9ff",
        width: 160,
        height: 60,
      },
    },
  ],
  edges: [],
  version: "1",
};

describe("ArchimateCanvas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty canvas without errors", () => {
    render(<ArchimateCanvas diagramId="d1" initialData={emptyDiagram} />, { wrapper });
    expect(document.querySelector(".react-flow")).toBeTruthy();
  });

  it("loads nodes from diagram data on mount", () => {
    render(<ArchimateCanvas diagramId="d1" initialData={diagramWithNodes} />, { wrapper });
    expect(screen.getByText("NexaCore ERP")).toBeInTheDocument();
  });

  it("calls POST /cards when element is dropped from palette", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "card-1",
      name: "New Application Component",
    });

    const { container } = render(
      <ArchimateCanvas diagramId="d1" initialData={emptyDiagram} />,
      { wrapper },
    );

    const canvas = container.querySelector(".react-flow__pane");
    expect(canvas).toBeTruthy();

    const dropEvent = new MouseEvent("drop", { bubbles: true, clientX: 200, clientY: 200 });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        getData: vi.fn().mockReturnValue("arch_ApplicationComponent"),
      },
    });
    fireEvent(canvas!, dropEvent);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/cards",
        expect.objectContaining({ type_key: "arch_ApplicationComponent" }),
      );
    });
  });

  it("renders auto-layout button", () => {
    render(<ArchimateCanvas diagramId="d1" initialData={emptyDiagram} />, { wrapper });
    expect(screen.getByRole("button", { name: /auto.?layout/i })).toBeInTheDocument();
  });

  it("accepts an onSave callback prop", () => {
    const onSave = vi.fn();
    render(
      <ArchimateCanvas diagramId="d1" initialData={emptyDiagram} onSave={onSave} />,
      { wrapper },
    );
    expect(document.querySelector(".react-flow")).toBeTruthy();
  });
});
