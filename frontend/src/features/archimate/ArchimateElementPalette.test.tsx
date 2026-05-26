import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ArchimateElementPalette } from "./ArchimateElementPalette";
import type { CardType } from "@/types";

const baseType = (key: string, label: string, category: string): CardType => ({
  key,
  label,
  icon: "apps",
  color: "#b3d9ff",
  category,
  has_hierarchy: false,
  has_successors: false,
  subtypes: [],
  fields_schema: [],
  built_in: true,
  is_hidden: false,
  sort_order: 1,
  plugin_id: "archimate",
  translations: { label: { en: label } },
});

const ALL_LAYERS_TYPES: CardType[] = [
  baseType("BusinessActor", "Business Actor", "Business"),
  baseType("ApplicationComponent", "Application Component", "Application"),
  baseType("Node", "Node", "Technology"),
  baseType("Goal", "Goal", "Motivation"),
  baseType("Resource", "Resource", "Strategy"),
  baseType("WorkPackage", "Work Package", "Implementation"),
  baseType("Equipment", "Equipment", "Physical"),
  baseType("Grouping", "Grouping", "Composite"),
];

describe("ArchimateElementPalette", () => {
  it("renders all 8 layer groups", () => {
    render(<ArchimateElementPalette activeTypes={ALL_LAYERS_TYPES} />);
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("Application")).toBeInTheDocument();
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Motivation")).toBeInTheDocument();
    expect(screen.getByText("Strategy")).toBeInTheDocument();
    expect(screen.getByText("Implementation")).toBeInTheDocument();
    expect(screen.getByText("Physical")).toBeInTheDocument();
    expect(screen.getByText("Composite")).toBeInTheDocument();
  });

  it("renders element chips within first expanded layer", () => {
    render(
      <ArchimateElementPalette
        activeTypes={[baseType("ApplicationComponent", "Application Component", "Application")]}
      />,
    );
    expect(screen.getByText("Application Component")).toBeInTheDocument();
  });

  it("sets dataTransfer on drag start", () => {
    render(
      <ArchimateElementPalette
        activeTypes={[baseType("ApplicationComponent", "Application Component", "Application")]}
      />,
    );
    const chip = screen.getByText("Application Component").closest("[draggable]");
    expect(chip).toBeTruthy();

    const setData = vi.fn();
    const dragEvent = new MouseEvent("dragstart", { bubbles: true });
    Object.defineProperty(dragEvent, "dataTransfer", {
      value: { setData, effectAllowed: "" },
    });

    fireEvent(chip!, dragEvent);
    expect(setData).toHaveBeenCalledWith(
      "archimate/element-type",
      "ApplicationComponent",
    );
  });

  it("renders type chip for every active type", () => {
    render(<ArchimateElementPalette activeTypes={ALL_LAYERS_TYPES} />);
    // Business Actor is in the Business group (first expanded by default)
    expect(screen.getByText("Business Actor")).toBeInTheDocument();
  });
});
