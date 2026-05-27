/**
 * RwfWorkspace tests — verifies that the workspace calls branch endpoints
 * exclusively (/rwf/branches/{id}/*) and never the main card/relation tables.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/api/client";
import RwfWorkspace from "../RwfWorkspace";

const BRANCH_ID = "branch-111";

const mockBranch = {
  id: BRANCH_ID,
  name: "feature/my-branch",
  description: null,
  status: "open",
  base_snapshot_at: new Date().toISOString(),
  created_by: "user-1",
  reviewed_by: null,
  reviewed_at: null,
  review_comment: null,
  rolled_back_by: null,
  rolled_back_at: null,
  can_rollback: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  change_counts: { cards: 1, relations: 0, diagrams: 0 },
};

const mockCardsResponse = {
  items: [
    {
      id: "card-1",
      _override_id: "ov-card-1",
      _override: "modified",
      name: "NexaCore ERP",
      type: "Application",
      subtype: null,
      status: "ACTIVE",
    },
  ],
  total: 1,
};

const mockRelationsResponse = { items: [], total: 0 };

const mockDiffResponse = {
  cards: [],
  relations: [],
  diagrams: [
    {
      override_id: "diag-override-1",
      diagram_id: "diag-1",
      operation: "modified",
      draft: { name: "System Overview" },
      base_snapshot: null,
      has_conflicts: false,
      conflicts: {},
    },
  ],
};

function renderWorkspace(branchId = BRANCH_ID) {
  return render(
    <MemoryRouter initialEntries={[`/rwf/branches/${branchId}/workspace`]}>
      <Routes>
        <Route path="/rwf/branches/:id/workspace" element={<RwfWorkspace />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === `/rwf/branches/${BRANCH_ID}`) return Promise.resolve(mockBranch);
    if (url === `/rwf/branches/${BRANCH_ID}/cards`) return Promise.resolve(mockCardsResponse);
    if (url === `/rwf/branches/${BRANCH_ID}/relations`) return Promise.resolve(mockRelationsResponse);
    if (url === `/rwf/branches/${BRANCH_ID}/diff`) return Promise.resolve(mockDiffResponse);
    return Promise.resolve({ items: [], total: 0 });
  });
});

describe("RwfWorkspace", () => {
  it("calls branch-scoped endpoints, NOT the main /cards or /relations endpoints", async () => {
    renderWorkspace();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    const calledUrls = vi.mocked(api.get).mock.calls.map(([url]) => url);

    // Must call branch endpoints
    expect(calledUrls).toContain(`/rwf/branches/${BRANCH_ID}`);
    expect(calledUrls).toContain(`/rwf/branches/${BRANCH_ID}/cards`);
    expect(calledUrls).toContain(`/rwf/branches/${BRANCH_ID}/relations`);
    expect(calledUrls).toContain(`/rwf/branches/${BRANCH_ID}/diff`);

    // Must NOT call main endpoints
    expect(calledUrls).not.toContain("/cards");
    expect(calledUrls).not.toContain("/relations");
    expect(calledUrls).not.toContain("/diagrams");
  });

  it("renders the branch name in the workspace title", async () => {
    renderWorkspace();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(screen.getByText("feature/my-branch")).toBeInTheDocument();
  });

  it("renders a card from the branch in the cards tab", async () => {
    renderWorkspace();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(screen.getByText("NexaCore ERP")).toBeInTheDocument();
  });

  it("shows a 'modified' operation badge for overridden cards", async () => {
    renderWorkspace();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // The operation chip should show the localized string for 'modified'
    expect(screen.getByText(/modified/i)).toBeInTheDocument();
  });

  it("shows the diagrams tab with overrides from the diff endpoint", async () => {
    renderWorkspace();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Click the Diagrams tab
    const diagramsTab = screen.getByRole("tab", { name: /diagrams/i });
    diagramsTab.click();

    await waitFor(() => {
      expect(screen.getByText("System Overview")).toBeInTheDocument();
    });
  });
});
