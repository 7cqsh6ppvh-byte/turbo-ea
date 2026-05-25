import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ArchimateRelationSelector } from "./ArchimateRelationSelector";

describe("ArchimateRelationSelector", () => {
  it("renders when open", () => {
    render(
      <ArchimateRelationSelector
        open={true}
        sourceTypeKey="arch_ApplicationComponent"
        targetTypeKey="arch_ApplicationService"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ArchimateRelationSelector
        open={false}
        sourceTypeKey="arch_ApplicationComponent"
        targetTypeKey="arch_ApplicationService"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows relation type options", () => {
    render(
      <ArchimateRelationSelector
        open={true}
        sourceTypeKey="arch_ApplicationComponent"
        targetTypeKey="arch_ApplicationService"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    // Association is always valid
    expect(screen.getByText(/Association/i)).toBeInTheDocument();
  });

  it("calls onSelect with chosen relation type key", () => {
    const onSelect = vi.fn();
    render(
      <ArchimateRelationSelector
        open={true}
        sourceTypeKey="arch_ApplicationComponent"
        targetTypeKey="arch_ApplicationService"
        onSelect={onSelect}
        onClose={vi.fn()}
      />,
    );
    const assocBtn = screen.getByText(/Association/i).closest("button") ??
      screen.getByRole("button", { name: /Association/i });
    fireEvent.click(assocBtn!);
    expect(onSelect).toHaveBeenCalledWith("arch_rel_Association");
  });

  it("calls onClose when cancel is clicked", () => {
    const onClose = vi.fn();
    render(
      <ArchimateRelationSelector
        open={true}
        sourceTypeKey="arch_ApplicationComponent"
        targetTypeKey="arch_ApplicationService"
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
