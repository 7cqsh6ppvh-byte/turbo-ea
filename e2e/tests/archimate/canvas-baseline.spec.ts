/**
 * Canvas baseline — documents behavior of the VisualFirst diagram editor.
 *
 * Routes are at /visualfirst and /visualfirst/:id/edit.
 * Nav link is "VisualFirst Canvas".
 */
import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  enableArchiMate,
  disableArchiMate,
  enableVisualFirst,
  disableVisualFirst,
} from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("VisualFirst canvas editor", () => {
  let token: string;
  const createdIds: string[] = [];

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    token = await loginAsAdmin(ctx, BASE_URL);
    await enableArchiMate(ctx.request, BASE_URL, token);
    await enableVisualFirst(ctx.request, BASE_URL, token);
    await ctx.close();
  });

  test.afterAll(async ({ request }) => {
    for (const id of createdIds) {
      await request.delete(`${BASE_URL}/api/v1/diagrams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    await disableArchiMate(request, BASE_URL, token);
    await disableVisualFirst(request, BASE_URL, token);
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

  test("editor loads at /visualfirst/:id/edit with three-tab sidebar", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Sidebar Test");

    await page.goto(`${BASE_URL}/visualfirst/${id}/edit`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("tab", { name: /elements/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /views/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /palette/i })).toBeVisible();
  });

  test("palette tab shows ArchiMate layer groups", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Palette Layers Test");

    await page.goto(`${BASE_URL}/visualfirst/${id}/edit`);
    await page.waitForLoadState("load");

    await page.getByRole("tab", { name: /palette/i }).click();

    await expect(page.getByText("Business").first()).toBeVisible();
    await expect(page.getByText("Application").first()).toBeVisible();
    await expect(page.getByText("Technology").first()).toBeVisible();
  });

  test("elements tab has search input", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Elements Search Test");

    await page.goto(`${BASE_URL}/visualfirst/${id}/edit`);
    await page.waitForLoadState("load");

    await page.getByRole("tab", { name: /elements/i }).click();

    const searchInput = page.getByRole("textbox", { name: /search/i }).or(
      page.locator("input[placeholder*='search' i], input[placeholder*='cards' i], input[placeholder*='Suche' i]")
    );
    await expect(searchInput.first()).toBeVisible();
  });

  test("views tab shows diagram list area", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Views Tab Test");

    await page.goto(`${BASE_URL}/visualfirst/${id}/edit`);
    await page.waitForLoadState("load");

    await page.getByRole("tab", { name: /views/i }).click();

    const newDiagramBtn = page.getByRole("button", { name: /new.*diagram/i });
    const diagramsHeader = page.getByText(/diagrams/i).first();
    const either = newDiagramBtn.or(diagramsHeader);
    await expect(either.first()).toBeVisible();
  });

  test("auto-layout button is present in toolbar", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Auto Layout Test");

    await page.goto(`${BASE_URL}/visualfirst/${id}/edit`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("button", { name: /auto.?layout/i })).toBeVisible();
  });

  test("back button returns to VisualFirst gallery", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Back Nav Test");

    await page.goto(`${BASE_URL}/visualfirst/${id}/edit`);
    await page.waitForLoadState("load");

    const backBtn = page.getByRole("button", { name: /back/i }).or(
      page.getByRole("link", { name: /visualfirst|diagrams/i })
    );
    await backBtn.first().click();

    await expect(page).toHaveURL(/\/visualfirst\/?$/);
  });

  test("diagram data is saved and loadable via API", async ({ context, page, request }) => {
    await loginAsAdmin(context, BASE_URL);
    const id = await createDiagram(request, "Save Persistence Test");

    await page.goto(`${BASE_URL}/visualfirst/${id}/edit`);
    await page.waitForLoadState("load");

    const resp = await request.get(`${BASE_URL}/api/v1/diagrams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json() as { id: string; name: string; type: string };
    expect(data.id).toBe(id);
    expect(data.type).toBe("archimate");
  });

  test("gallery page has 'New Diagram' button", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);

    await page.goto(`${BASE_URL}/visualfirst`);
    await page.waitForLoadState("load");

    await expect(
      page.getByRole("button", { name: /new.*diagram/i })
    ).toBeVisible();
  });

  test("nav link for VisualFirst Canvas is visible when enabled", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("link", { name: /visualfirst canvas/i })).toBeVisible();
  });


});
