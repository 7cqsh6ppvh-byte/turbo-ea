/**
 * Canvas baseline — documents current behavior of the ArchiMate diagram editor.
 *
 * These tests act as a regression guard during the VisualFirst refactor.
 * After Phase 2 the routes change to /visualfirst/:id/edit — update the
 * URL patterns and nav link text at that point.
 */
import { test, expect } from "@playwright/test";
import { loginAsAdmin, enableArchiMate, disableArchiMate } from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("ArchiMate canvas editor — baseline", () => {
  let token: string;
  const createdIds: string[] = [];

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    token = await loginAsAdmin(ctx, BASE_URL);
    await enableArchiMate(ctx.request, BASE_URL, token);
    await ctx.close();
  });

  test.afterAll(async ({ request }) => {
    for (const id of createdIds) {
      await request.delete(`${BASE_URL}/api/v1/diagrams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    await disableArchiMate(request, BASE_URL, token);
  });

  async function createDiagram(request: import("@playwright/test").APIRequestContext, name: string): Promise<string> {
    const resp = await request.post(`${BASE_URL}/api/v1/diagrams`, {
      data: { name, type: "archimate" },
      headers: { Authorization: `Bearer ${token}` },
    });
    const diagram = await resp.json() as { id: string };
    createdIds.push(diagram.id);
    return diagram.id;
  }

  test("editor loads with three-tab sidebar", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Sidebar Test");

    await page.goto(`${BASE_URL}/archimate/${id}/edit`);
    await page.waitForLoadState("load");

    // All three tabs should be visible
    await expect(page.getByRole("tab", { name: /elements/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /views/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /palette/i })).toBeVisible();
  });

  test("palette tab shows ArchiMate layer groups", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Palette Layers Test");

    await page.goto(`${BASE_URL}/archimate/${id}/edit`);
    await page.waitForLoadState("load");

    // Switch to Palette tab
    await page.getByRole("tab", { name: /palette/i }).click();

    // ArchiMate layers should be visible as accordion groups
    await expect(page.getByText("Business").first()).toBeVisible();
    await expect(page.getByText("Application").first()).toBeVisible();
    await expect(page.getByText("Technology").first()).toBeVisible();
  });

  test("elements tab has search input", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Elements Search Test");

    await page.goto(`${BASE_URL}/archimate/${id}/edit`);
    await page.waitForLoadState("load");

    // Elements tab is active by default
    await page.getByRole("tab", { name: /elements/i }).click();

    // Search input should be present
    const searchInput = page.getByRole("textbox", { name: /search/i }).or(
      page.locator("input[placeholder*='search' i], input[placeholder*='cards' i], input[placeholder*='Suche' i]")
    );
    await expect(searchInput.first()).toBeVisible();
  });

  test("views tab shows diagram list area", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Views Tab Test");

    await page.goto(`${BASE_URL}/archimate/${id}/edit`);
    await page.waitForLoadState("load");

    await page.getByRole("tab", { name: /views/i }).click();

    // Should show a "New Diagram" button or diagrams header
    const newDiagramBtn = page.getByRole("button", { name: /new.*diagram/i });
    const diagramsHeader = page.getByText(/diagrams/i).first();
    const either = newDiagramBtn.or(diagramsHeader);
    await expect(either.first()).toBeVisible();
  });

  test("auto-layout button is present in toolbar", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Auto Layout Test");

    await page.goto(`${BASE_URL}/archimate/${id}/edit`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("button", { name: /auto.?layout/i })).toBeVisible();
  });

  test("back button returns to gallery", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Back Nav Test");

    await page.goto(`${BASE_URL}/archimate/${id}/edit`);
    await page.waitForLoadState("load");

    // There should be a back button or breadcrumb link
    const backBtn = page.getByRole("button", { name: /back/i }).or(
      page.getByRole("link", { name: /archimate|diagrams/i })
    );
    await backBtn.first().click();

    await expect(page).toHaveURL(/\/archimate\/?$/);
  });

  test("diagram data is saved and loadable via API", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Save Persistence Test");

    await page.goto(`${BASE_URL}/archimate/${id}/edit`);
    await page.waitForLoadState("load");

    // The canvas should load — verify diagram is fetchable
    const resp = await request.get(`${BASE_URL}/api/v1/diagrams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json() as { id: string; name: string; type: string };
    expect(data.id).toBe(id);
    expect(data.type).toBe("archimate");
  });

  test("editor page title includes diagram name", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Title Check Diagram");

    await page.goto(`${BASE_URL}/archimate/${id}/edit`);
    await page.waitForLoadState("load");

    // Diagram name should appear somewhere on the page (toolbar or browser title)
    const titleVisible = await page.getByText("Title Check Diagram").isVisible().catch(() => false);
    const browserTitle = await page.title();
    const nameInTitle = browserTitle.includes("Title Check Diagram");

    expect(titleVisible || nameInTitle).toBeTruthy();
  });

  test("gallery page has 'New ArchiMate Diagram' button", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);

    await page.goto(`${BASE_URL}/archimate`);
    await page.waitForLoadState("load");

    await expect(
      page.getByRole("button", { name: /new.*archimate.*diagram/i })
    ).toBeVisible();
  });

  test("nav link for ArchiMate is visible when enabled", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    // Nav should have an ArchiMate link
    await expect(page.getByRole("link", { name: /archimate/i })).toBeVisible();
  });
});
