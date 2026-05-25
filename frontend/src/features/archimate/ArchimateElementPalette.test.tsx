import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ArchimateElementPalette } from "./ArchimateElementPalette";

describe("ArchimateElementPalette", () => {
  it("renders all 8 layer groups", () => {
    render(<ArchimateElementPalette />);
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("Application")).toBeInTheDocument();
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Motivation")).toBeInTheDocument();
    expect(screen.getByText("Strategy")).toBeInTheDocument();
    expect(screen.getByText("Implementation")).toBeInTheDocument();
    expect(screen.getByText("Physical")).toBeInTheDocument();
    expect(screen.getByText("Composite")).toBeInTheDocument();
  });

  it("renders element chips within expanded layer", () => {
    render(<ArchimateElementPalette defaultExpandedLayer="Application" />);
    expect(screen.getByText("Application Component")).toBeInTheDocument();
  });

  it("sets dataTransfer on drag start", () => {
    render(<ArchimateElementPalette defaultExpandedLayer="Application" />);
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
      "arch_ApplicationComponent",
    );
  });

  it("shows Application layer expanded by default when no prop given", () => {
    render(<ArchimateElementPalette />);
    expect(screen.getByText("Application Component")).toBeInTheDocument();
  });
});
