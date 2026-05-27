/**
 * RwfMergeDialog tests — conflict resolution UI logic.
 * Verifies that:
 * - When there are no conflicts the merge button is enabled immediately.
 * - When there are conflicts the merge button is disabled until all are resolved.
 * - Selecting "main" or "branch" for each conflict enables the merge button.
 * - On submit the correct resolutions are posted to the merge endpoint.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "@/api/client";
import RwfMergeDialog from "../RwfMergeDialog";
import type { BranchDiff } from "../rwf.types";

const BRANCH_ID = "branch-999";

const emptyDiff: BranchDiff = { cards: [], relations: [], diagrams: [] };

const diffWithConflict: BranchDiff = {
  cards: [
    {
      override_id: "ov-1",
      card_id: "card-1",
      operation: "modified",
      draft: { name: "New Name", status: "ACTIVE" },
      base_snapshot: { name: "Old Name", status: "ACTIVE" },
      has_conflicts: true,
      conflicts: { name: "conflict" },
    },
  ],
  relations: [],
  diagrams: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.post).mockResolvedValue({ id: BRANCH_ID, status: "merged" });
});

describe("RwfMergeDialog — no conflicts", () => {
  it("shows 'no conflicts' message and enables merge button immediately", async () => {
    const onMerged = vi.fn();
    render(
      <RwfMergeDialog
        open
        branchId={BRANCH_ID}
        diff={emptyDiff}
        onClose={vi.fn()}
        onMerged={onMerged}
      />,
    );

    expect(screen.getByText(/no conflicts/i)).toBeInTheDocument();

    const mergeBtn = screen.getByRole("button", { name: /merge into main/i });
    expect(mergeBtn).not.toBeDisabled();
  });

  it("calls POST /rwf/branches/{id}/merge with empty resolutions when confirmed", async () => {
    const user = userEvent.setup();
    const onMerged = vi.fn();

    render(
      <RwfMergeDialog
        open
        branchId={BRANCH_ID}
        diff={emptyDiff}
        onClose={vi.fn()}
        onMerged={onMerged}
      />,
    );

    await user.click(screen.getByRole("button", { name: /merge into main/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/rwf/branches/${BRANCH_ID}/merge`,
        { resolutions: {} },
      );
    });
    expect(onMerged).toHaveBeenCalled();
  });
});

describe("RwfMergeDialog — with conflicts", () => {
  it("shows conflict field name in the dialog", async () => {
    render(
      <RwfMergeDialog
        open
        branchId={BRANCH_ID}
        diff={diffWithConflict}
        onClose={vi.fn()}
        onMerged={vi.fn()}
      />,
    );

    // Should show the field path "name" as a conflict
    expect(screen.getByText("name")).toBeInTheDocument();
  });

  it("disables merge button when conflicts are unresolved", () => {
    render(
      <RwfMergeDialog
        open
        branchId={BRANCH_ID}
        diff={diffWithConflict}
        onClose={vi.fn()}
        onMerged={vi.fn()}
      />,
    );

    // Merge button must be disabled until all conflicts are resolved
    const mergeBtn = screen.getByRole("button", { name: /merge into main/i });
    expect(mergeBtn).toBeDisabled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("enables merge after resolving all conflicts by choosing 'main'", async () => {
    const user = userEvent.setup();
    const onMerged = vi.fn();

    render(
      <RwfMergeDialog
        open
        branchId={BRANCH_ID}
        diff={diffWithConflict}
        onClose={vi.fn()}
        onMerged={onMerged}
      />,
    );

    // Click "Use main value" button to resolve the conflict
    const useMainBtn = screen.getByRole("button", { name: /use main value/i });
    await user.click(useMainBtn);

    // Now merge should proceed
    await user.click(screen.getByRole("button", { name: /merge into main/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/rwf/branches/${BRANCH_ID}/merge`,
        {
          resolutions: {
            "ov-1": { name: "main" },
          },
        },
      );
    });
    expect(onMerged).toHaveBeenCalled();
  });

  it("enables merge after resolving all conflicts by choosing 'branch'", async () => {
    const user = userEvent.setup();
    const onMerged = vi.fn();

    render(
      <RwfMergeDialog
        open
        branchId={BRANCH_ID}
        diff={diffWithConflict}
        onClose={vi.fn()}
        onMerged={onMerged}
      />,
    );

    // Click "Use branch value" button
    const useBranchBtn = screen.getByRole("button", { name: /use branch value/i });
    await user.click(useBranchBtn);

    await user.click(screen.getByRole("button", { name: /merge into main/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/rwf/branches/${BRANCH_ID}/merge`,
        {
          resolutions: {
            "ov-1": { name: "branch" },
          },
        },
      );
    });
    expect(onMerged).toHaveBeenCalled();
  });
});
