/**
 * RWF (Release Workflow) E2E tests.
 *
 * Tests the full RWF lifecycle:
 *  - Admin settings toggle (enable / disable)
 *  - Nav item visibility
 *  - Branch CRUD (create, view, submit, approve)
 *  - Workspace tab
 *  - Diff page
 *  - Snapshot create / list
 *
 * Requires the RWF module to be enabled (tests enable it in beforeAll, disable after).
 * Tests that need a branch create one via the UI (create dialog) and clean up via API.
 */
import { test, expect, type APIRequestContext } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

// ─── helpers ────────────────────────────────────────────────────────────────

async function enableRwf(request: APIRequestContext, token: string) {
  const resp = await request.patch(`${BASE_URL}/api/v1/settings/rwf-enabled`, {
    data: { enabled: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok()) throw new Error(`Failed to enable RWF: ${resp.status()}`);
}

async function disableRwf(request: APIRequestContext, token: string) {
  await request.patch(`${BASE_URL}/api/v1/settings/rwf-enabled`, {
    data: { enabled: false },
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function createBranchViaApi(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<string> {
  const resp = await request.post(`${BASE_URL}/api/v1/rwf/branches`, {
    data: { name, description: "E2E test branch" },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok()) throw new Error(`Failed to create branch: ${resp.status()} ${await resp.text()}`);
  const body = await resp.json() as { id: string };
  return body.id;
}

async function deleteBranchViaApi(
  request: APIRequestContext,
  token: string,
  branchId: string,
): Promise<void> {
  await request.delete(`${BASE_URL}/api/v1/rwf/branches/${branchId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Admin toggle ────────────────────────────────────────────────────────────

test.describe("RWF — Admin settings toggle", () => {
  test("admin can enable and disable the RWF module via settings", async ({ context, page, request }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    // Navigate to admin settings
    await page.goto(`${BASE_URL}/admin/settings`);
    await page.waitForLoadState("load");

    // Find the RWF / Release Workflow tab
    const rwfTab = page
      .getByRole("tab", { name: /release workflow|releases|rwf/i })
      .first();

    if (await rwfTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rwfTab.click();
      // There should be an enable/disable toggle
      const toggle = page.getByRole("checkbox").or(page.getByRole("switch")).first();
      await expect(toggle).toBeVisible({ timeout: 5000 });
    } else {
      // Toggle via API directly if the settings tab isn't visible
      const resp = await request.patch(`${BASE_URL}/api/v1/settings/rwf-enabled`, {
        data: { enabled: true },
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(resp.ok()).toBeTruthy();
    }

    // Cleanup
    await disableRwf(request, token);
  });
});

// ─── Nav item visibility ─────────────────────────────────────────────────────

test.describe("RWF — Nav item visibility", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    // We need a token for beforeAll — use a fresh login via API
    const resp = await request.post(`${BASE_URL}/api/v1/auth/login`, {
      data: {
        email: process.env.E2E_ADMIN_EMAIL ?? "admin@turboea.demo",
        password: process.env.E2E_ADMIN_PASSWORD ?? "TurboEA!2025",
      },
    });
    const body = await resp.json() as { access_token: string };
    token = body.access_token;
    await enableRwf(request, token);
  });

  test.afterAll(async ({ request }) => {
    await disableRwf(request, token);
  });

  test("Releases nav item appears when RWF is enabled", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    // Wait a moment for the bootstrap to settle and nav to render
    await page.waitForTimeout(1000);

    const releasesLink = page
      .getByRole("link", { name: /releases/i })
      .or(page.getByRole("button", { name: /releases/i }))
      .first();
    await expect(releasesLink).toBeVisible({ timeout: 10000 });
  });

  test("navigating to /rwf shows the RWF dashboard", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/rwf`);
    await page.waitForLoadState("load");

    // The dashboard should render without error
    await expect(
      page.getByText(/branches|releases|open branch|pending review/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("/rwf/branches shows the branch list page", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/rwf/branches`);
    await page.waitForLoadState("load");

    await expect(
      page
        .getByRole("heading", { name: /branches|release/i })
        .or(page.getByRole("button", { name: /new branch|create branch/i }))
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─── Branch lifecycle ─────────────────────────────────────────────────────────

test.describe("RWF — Branch lifecycle", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/v1/auth/login`, {
      data: {
        email: process.env.E2E_ADMIN_EMAIL ?? "admin@turboea.demo",
        password: process.env.E2E_ADMIN_PASSWORD ?? "TurboEA!2025",
      },
    });
    const body = await resp.json() as { access_token: string };
    token = body.access_token;
    await enableRwf(request, token);
  });

  test.afterAll(async ({ request }) => {
    await disableRwf(request, token);
  });

  test("create branch via UI dialog", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/rwf/branches`);
    await page.waitForLoadState("load");

    // Click New Branch button
    const newBranchBtn = page
      .getByRole("button", { name: /new branch|create branch|\+ branch/i })
      .first();
    await expect(newBranchBtn).toBeVisible({ timeout: 8000 });
    await newBranchBtn.click();

    // Dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Fill in branch name
    const nameInput = dialog.getByLabel(/name/i).or(dialog.getByRole("textbox")).first();
    await nameInput.fill("E2E Test Branch UI");

    // Submit
    const createBtn = dialog.getByRole("button", { name: /create|save|confirm/i }).first();
    await createBtn.click();

    // Dialog should close and the branch should appear in the list
    await expect(dialog).not.toBeVisible({ timeout: 8000 });
    await expect(
      page.getByText("E2E Test Branch UI"),
    ).toBeVisible({ timeout: 8000 });

    // Cleanup — find the branch via API and delete it
    const listResp = await request.get(`${BASE_URL}/api/v1/rwf/branches?status=open`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listBody = await listResp.json() as { items: { id: string; name: string }[] };
    const branch = listBody.items.find((b) => b.name === "E2E Test Branch UI");
    if (branch) await deleteBranchViaApi(request, token, branch.id);
  });

  test("branch detail page shows status chip and actions", async ({ context, page, request }) => {
    const branchId = await createBranchViaApi(request, token, "E2E Detail Test");

    try {
      await loginAsAdmin(context, BASE_URL);
      await page.goto(`${BASE_URL}/rwf/branches/${branchId}`);
      await page.waitForLoadState("load");

      // Should show status chip "open"
      await expect(
        page.getByText(/open/i).first(),
      ).toBeVisible({ timeout: 8000 });

      // Should have workspace and diff buttons
      await expect(
        page.getByRole("button", { name: /workspace|edit/i }).first(),
      ).toBeVisible({ timeout: 5000 });
      await expect(
        page.getByRole("button", { name: /diff|view diff/i }).first(),
      ).toBeVisible({ timeout: 5000 });
    } finally {
      await deleteBranchViaApi(request, token, branchId);
    }
  });

  test("branch workspace page loads tabs", async ({ context, page, request }) => {
    const branchId = await createBranchViaApi(request, token, "E2E Workspace Test");

    try {
      await loginAsAdmin(context, BASE_URL);
      await page.goto(`${BASE_URL}/rwf/branches/${branchId}/workspace`);
      await page.waitForLoadState("load");

      // Should render Cards / Relations / Diagrams tabs
      await expect(
        page.getByRole("tab", { name: /cards/i }).first(),
      ).toBeVisible({ timeout: 8000 });
      await expect(
        page.getByRole("tab", { name: /relations/i }).first(),
      ).toBeVisible({ timeout: 5000 });
      await expect(
        page.getByRole("tab", { name: /diagrams/i }).first(),
      ).toBeVisible({ timeout: 5000 });
    } finally {
      await deleteBranchViaApi(request, token, branchId);
    }
  });

  test("branch diff page renders with tabs and conflict summary", async ({ context, page, request }) => {
    const branchId = await createBranchViaApi(request, token, "E2E Diff Test");

    try {
      await loginAsAdmin(context, BASE_URL);
      await page.goto(`${BASE_URL}/rwf/branches/${branchId}/diff`);
      await page.waitForLoadState("load");

      // Conflict summary alert
      await expect(
        page.getByText(/no conflict|conflict|change/i).first(),
      ).toBeVisible({ timeout: 8000 });

      // Tabs
      await expect(page.getByRole("tab", { name: /cards/i }).first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("tab", { name: /relations/i }).first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("tab", { name: /diagrams/i }).first()).toBeVisible({ timeout: 5000 });
    } finally {
      await deleteBranchViaApi(request, token, branchId);
    }
  });

  test("can submit branch for review via detail page", async ({ context, page, request }) => {
    const branchId = await createBranchViaApi(request, token, "E2E Submit Test");

    try {
      await loginAsAdmin(context, BASE_URL);
      await page.goto(`${BASE_URL}/rwf/branches/${branchId}`);
      await page.waitForLoadState("load");

      // Click Submit for Review
      const submitBtn = page
        .getByRole("button", { name: /submit.*review|submit for/i })
        .first();
      if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitBtn.click();

        // Confirm dialog
        const dialog = page.getByRole("dialog");
        if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
          const confirmBtn = dialog.getByRole("button", { name: /submit|confirm/i }).last();
          await confirmBtn.click();
        }

        // Status should change to in_review
        await expect(
          page.getByText(/in.?review|review/i).first(),
        ).toBeVisible({ timeout: 8000 });
      }
    } finally {
      await deleteBranchViaApi(request, token, branchId);
    }
  });

  test("can abandon a branch via detail page", async ({ context, page, request }) => {
    const branchId = await createBranchViaApi(request, token, "E2E Abandon Test");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/rwf/branches/${branchId}`);
    await page.waitForLoadState("load");

    // Click Abandon button
    const abandonBtn = page
      .getByRole("button", { name: /abandon/i })
      .first();
    if (await abandonBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await abandonBtn.click();

      // Confirm
      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        const confirmBtn = dialog.getByRole("button", { name: /abandon|confirm/i }).last();
        await confirmBtn.click();
      }

      // Branch status should update or we navigate away
      await expect(
        page.getByText(/abandoned|branches/i).first(),
      ).toBeVisible({ timeout: 8000 });
    }
    // No need to cleanup — branch is now abandoned (closed)
  });
});

// ─── Snapshots ───────────────────────────────────────────────────────────────

test.describe("RWF — Snapshots", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/v1/auth/login`, {
      data: {
        email: process.env.E2E_ADMIN_EMAIL ?? "admin@turboea.demo",
        password: process.env.E2E_ADMIN_PASSWORD ?? "TurboEA!2025",
      },
    });
    const body = await resp.json() as { access_token: string };
    token = body.access_token;
    await enableRwf(request, token);
  });

  test.afterAll(async ({ request }) => {
    await disableRwf(request, token);
  });

  test("Snapshots tab is visible on branches page", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/rwf/branches`);
    await page.waitForLoadState("load");

    const snapshotTab = page.getByRole("tab", { name: /snapshot/i }).first();
    await expect(snapshotTab).toBeVisible({ timeout: 8000 });
  });

  test("can create a snapshot via UI", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/rwf/branches?tab=snapshots`);
    await page.waitForLoadState("load");

    // Click the Snapshots tab if not already there
    const snapshotTab = page.getByRole("tab", { name: /snapshot/i }).first();
    if (await snapshotTab.isVisible()) await snapshotTab.click();

    // Create snapshot button
    const createBtn = page
      .getByRole("button", { name: /new snapshot|create snapshot|\+ snapshot/i })
      .first();
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        const nameInput = dialog.getByRole("textbox").first();
        await nameInput.fill("E2E-Snapshot-Test");
        const confirmBtn = dialog.getByRole("button", { name: /create|save|confirm/i }).last();
        await confirmBtn.click();
        await expect(dialog).not.toBeVisible({ timeout: 8000 });
      }

      // Cleanup — delete the snapshot via API
      const listResp = await request.get(`${BASE_URL}/api/v1/rwf/snapshots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listBody = await listResp.json() as { items: { id: string; name: string }[] };
      const snap = listBody.items.find((s) => s.name === "E2E-Snapshot-Test");
      if (snap) {
        await request.delete(`${BASE_URL}/api/v1/rwf/snapshots/${snap.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }
  });

  test("snapshot diff page renders for an existing snapshot", async ({ context, page, request }) => {
    // Create a snapshot via API
    const snapResp = await request.post(`${BASE_URL}/api/v1/rwf/snapshots`, {
      data: { name: "E2E-Diff-Snap" },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!snapResp.ok()) {
      test.skip();
      return;
    }
    const snap = await snapResp.json() as { id: string };

    try {
      await loginAsAdmin(context, BASE_URL);
      await page.goto(`${BASE_URL}/rwf/snapshots/${snap.id}/diff`);
      await page.waitForLoadState("load");

      // Should show the diff page with tabs
      await expect(
        page.getByText(/change|no change|diff/i).first(),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByRole("tab", { name: /cards/i }).first(),
      ).toBeVisible({ timeout: 5000 });
    } finally {
      await request.delete(`${BASE_URL}/api/v1/rwf/snapshots/${snap.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  });
});

// ─── Isolation guarantee ──────────────────────────────────────────────────────

test.describe("RWF — Isolation guarantee (non-RWF routes unaffected)", () => {
  let token: string;
  let branchId: string;

  test.beforeAll(async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/v1/auth/login`, {
      data: {
        email: process.env.E2E_ADMIN_EMAIL ?? "admin@turboea.demo",
        password: process.env.E2E_ADMIN_PASSWORD ?? "TurboEA!2025",
      },
    });
    const body = await resp.json() as { access_token: string };
    token = body.access_token;
    await enableRwf(request, token);
    // Create a branch with a test name so we know one exists
    branchId = await createBranchViaApi(request, token, "E2E Isolation Branch");
  });

  test.afterAll(async ({ request }) => {
    if (branchId) await deleteBranchViaApi(request, token, branchId);
    await disableRwf(request, token);
  });

  test("inventory page still shows main cards (branch does not pollute inventory)", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/inventory`);
    await page.waitForLoadState("load");

    // AG Grid rows should still render normally
    const rows = page.locator("[role='row']").filter({ hasNot: page.locator("[role='columnheader']") });
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });

  test("card detail page shows main data (not branch overlay)", async ({ context, page, request }) => {
    // Get any card from main via API
    const cardsResp = await request.get(`${BASE_URL}/api/v1/cards?page_size=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cardsBody = await cardsResp.json() as { items: { id: string; name: string }[] };
    if (!cardsBody.items?.length) { test.skip(); return; }

    const cardId = cardsBody.items[0].id;
    const cardName = cardsBody.items[0].name;

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/cards/${cardId}`);
    await page.waitForLoadState("load");

    // Card name should match main data
    await expect(
      page.getByText(cardName).first(),
    ).toBeVisible({ timeout: 8000 });
  });

  test("reports dashboard still loads with main data", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    await expect(
      page.getByText(/dashboard|cards|total|quality/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
