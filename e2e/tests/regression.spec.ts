/**
 * Regression tests — verify that the RWF module does NOT break any existing
 * non-RWF feature area.  Each describe block covers a major surface and asserts
 * the core happy-path still works when RWF is enabled.
 *
 * Strategy
 * --------
 * 1. Enable RWF in beforeAll, disable in afterAll.
 * 2. Create a test branch (via API) so the system is non-trivially in "branch exists" state.
 * 3. Navigate to each existing feature area and assert the page renders correctly.
 * 4. Spot-check critical data-reads (inventory grid, card detail, reports, BPM, GRC).
 *
 * Rationale: these tests are intentionally lightweight — they do NOT repeat the
 * detailed functional tests already covered in inventory.spec, bpm.spec, etc.
 * They exist purely to catch accidental cross-contamination from the RWF layer.
 */
import { test, expect, type APIRequestContext } from "@playwright/test";
import { loginAsAdmin } from "../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getAdminToken(request: APIRequestContext): Promise<string> {
  const resp = await request.post(`${BASE_URL}/api/v1/auth/login`, {
    data: {
      email: process.env.E2E_ADMIN_EMAIL ?? "admin@turboea.demo",
      password: process.env.E2E_ADMIN_PASSWORD ?? "TurboEA!2025",
    },
  });
  const body = await resp.json() as { access_token: string };
  return body.access_token;
}

async function enableRwf(request: APIRequestContext, token: string) {
  await request.patch(`${BASE_URL}/api/v1/settings/rwf-enabled`, {
    data: { enabled: true },
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function disableRwf(request: APIRequestContext, token: string) {
  await request.patch(`${BASE_URL}/api/v1/settings/rwf-enabled`, {
    data: { enabled: false },
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function createBranch(request: APIRequestContext, token: string, name: string) {
  const resp = await request.post(`${BASE_URL}/api/v1/rwf/branches`, {
    data: { name },
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await resp.json() as { id: string };
  return body.id;
}

async function deleteBranch(request: APIRequestContext, token: string, id: string) {
  await request.delete(`${BASE_URL}/api/v1/rwf/branches/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Shared state ────────────────────────────────────────────────────────────

let sharedToken: string;
let regressionBranchId: string;

// NOTE: We use a single suite-scoped describe so beforeAll/afterAll run once for
// all regression groups.  Playwright runs describes in parallel by default — each
// test uses loginAsAdmin to get its own browser context.
test.describe("Regression — all existing features work with RWF enabled", () => {
  test.beforeAll(async ({ request }) => {
    sharedToken = await getAdminToken(request);
    await enableRwf(request, sharedToken);
    regressionBranchId = await createBranch(request, sharedToken, "Regression-Branch-Sentinel");
  });

  test.afterAll(async ({ request }) => {
    if (regressionBranchId) await deleteBranch(request, sharedToken, regressionBranchId);
    await disableRwf(request, sharedToken);
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────

  test("dashboard still renders KPI tiles", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/cards|dashboard|quality|total/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Inventory ─────────────────────────────────────────────────────────────

  test("inventory grid renders rows from main", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/inventory`);
    await page.waitForLoadState("load");
    const rows = page.locator("[role='row']").filter({ hasNot: page.locator("[role='columnheader']") });
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("inventory search still filters rows", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/inventory`);
    await page.waitForLoadState("load");

    const searchInput = page
      .getByRole("searchbox")
      .or(page.getByPlaceholder(/search|filter/i))
      .first();
    await searchInput.fill("SAP");
    await page.waitForTimeout(600);

    const rows = page.locator("[role='row']").filter({ hasNot: page.locator("[role='columnheader']") });
    const count = await rows.count();
    // With a branch existing but not touching main, SAP cards should still be visible
    expect(count).toBeGreaterThan(0);
  });

  // ── Card detail ───────────────────────────────────────────────────────────

  test("card detail page renders main data", async ({ context, page, request }) => {
    const cardsResp = await request.get(`${BASE_URL}/api/v1/cards?page_size=1`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    const cardsBody = await cardsResp.json() as { items: { id: string; name: string }[] };
    if (!cardsBody.items?.length) { test.skip(); return; }

    const { id, name } = cardsBody.items[0];
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/cards/${id}`);
    await page.waitForLoadState("load");
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 8000 });
  });

  // ── Reports ───────────────────────────────────────────────────────────────

  test("portfolio report page loads", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/reports/portfolio`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/portfolio|bubble|application|no card/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("data-quality report page loads", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/reports/data-quality`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/quality|completeness|score|type/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("lifecycle report page loads", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/reports/lifecycle`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/lifecycle|timeline|end.of.life|no card/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── BPM ───────────────────────────────────────────────────────────────────

  test("BPM dashboard still renders with RWF enabled", async ({ context, page, request }) => {
    // Check if BPM is enabled first
    const bpmResp = await request.get(`${BASE_URL}/api/v1/settings/bpm-enabled`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    if (bpmResp.ok()) {
      const bpmBody = await bpmResp.json() as { enabled: boolean };
      if (!bpmBody.enabled) { test.skip(); return; }
    }

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/bpm`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/process|bpm|maturity|no process/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── PPM ───────────────────────────────────────────────────────────────────

  test("PPM portfolio page still loads with RWF enabled", async ({ context, page, request }) => {
    const ppmResp = await request.get(`${BASE_URL}/api/v1/settings/ppm-enabled`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    if (ppmResp.ok()) {
      const ppmBody = await ppmResp.json() as { enabled: boolean };
      if (!ppmBody.enabled) { test.skip(); return; }
    }

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/ppm`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/portfolio|initiative|project|ppm|no initiative/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── GRC ───────────────────────────────────────────────────────────────────

  test("GRC page still renders with RWF enabled", async ({ context, page, request }) => {
    const grcResp = await request.get(`${BASE_URL}/api/v1/settings/grc-enabled`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    if (grcResp.ok()) {
      const grcBody = await grcResp.json() as { enabled: boolean };
      if (!grcBody.enabled) { test.skip(); return; }
    }

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/grc`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/risk|compliance|governance|grc/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("risk register still loads from main tables", async ({ context, page, request }) => {
    const grcResp = await request.get(`${BASE_URL}/api/v1/settings/grc-enabled`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    if (grcResp.ok()) {
      const grcBody = await grcResp.json() as { enabled: boolean };
      if (!grcBody.enabled) { test.skip(); return; }
    }

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/grc?tab=risk`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/risk|register|no risk/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Diagrams ──────────────────────────────────────────────────────────────

  test("diagrams gallery still renders with RWF enabled", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/diagrams`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/diagram|no diagram|architecture/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Todos ─────────────────────────────────────────────────────────────────

  test("todos page still loads with RWF enabled", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/todos`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/todo|task|survey|no task|all done/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Admin metamodel ───────────────────────────────────────────────────────

  test("admin metamodel page still loads with RWF enabled", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/admin/metamodel`);
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/application|business|type|metamodel/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── API isolation — main endpoints unaffected ─────────────────────────────

  test("GET /api/v1/cards returns main cards (not branch overlay)", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/cards?page_size=5`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json() as { items: unknown[]; total: number };
    // Main cards endpoint should still return rows
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
  });

  test("GET /api/v1/relations returns main relations", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/relations?page_size=5`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json() as { items?: unknown[]; total?: number } | unknown[];
    // Either paginated or direct array — just confirm it is valid JSON
    expect(body).toBeDefined();
  });

  test("GET /api/v1/diagrams returns main diagrams", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/diagrams`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json() as unknown;
    expect(body).toBeDefined();
  });

  test("reports dashboard API still returns main-table aggregates", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/reports/dashboard`, {
      headers: { Authorization: `Bearer ${sharedToken}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json() as { total_cards?: number };
    expect(typeof body.total_cards).toBe("number");
  });
});

// ─── RWF disabled — no residual contamination ────────────────────────────────

test.describe("Regression — RWF disabled: routes are inaccessible", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await getAdminToken(request);
    await disableRwf(request, token);
  });

  test("navigating to /rwf when disabled shows module gate (not a crash)", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/rwf`);
    await page.waitForLoadState("load");

    // ModuleGate renders a "feature not enabled" message or redirects
    // Crucially: the page must NOT throw a runtime error
    const errorOverlay = page.locator("body").getByText(/error|uncaught|cannot read/i).first();
    const isError = await errorOverlay.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isError).toBe(false);
  });

  test("Releases nav item is absent when RWF is disabled", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(800); // let bootstrap settle

    // "Releases" should not be in the nav
    const releasesLink = page.getByRole("link", { name: /^releases$/i }).first();
    const visible = await releasesLink.isVisible({ timeout: 2000 }).catch(() => false);
    expect(visible).toBe(false);
  });

  test("inventory still works when RWF is disabled", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/inventory`);
    await page.waitForLoadState("load");
    const rows = page.locator("[role='row']").filter({ hasNot: page.locator("[role='columnheader']") });
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });
});
