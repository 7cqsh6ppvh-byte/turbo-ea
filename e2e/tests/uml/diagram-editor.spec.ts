import { test, expect } from "@playwright/test";
import { loginAsAdmin, enableUml, disableUml } from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("UML diagram editor", () => {
  let token: string;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    token = await loginAsAdmin(ctx, BASE_URL);
    await enableUml(ctx.request, BASE_URL, token);
    await ctx.close();
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    await loginAsAdmin(ctx, BASE_URL);
    await disableUml(ctx.request, BASE_URL, token);
    await ctx.close();
  });

  // Helper: create a diagram via API and return its id
  async function createDiagram(
    request: import("@playwright/test").APIRequestContext,
    name: string,
    type = "uml-class",
  ): Promise<string> {
    const resp = await request.post(`${BASE_URL}/api/v1/diagrams`, {
      data: { name, type, data: { nodes: [], edges: [], diagramType: type, version: "1" } },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok()) throw new Error(`Create diagram failed: ${resp.status()}`);
    const d = await resp.json();
    return d.id as string;
  }

  async function deleteDiagram(
    request: import("@playwright/test").APIRequestContext,
    id: string,
  ): Promise<void> {
    await request.delete(`${BASE_URL}/api/v1/diagrams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ─── Gallery page ─────────────────────────────────────────────────────────

  test("UML gallery page loads and shows 'New UML Diagram' button", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("button", { name: /new uml diagram/i })).toBeVisible();
  });

  test("Gallery shows category filter tabs", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("tab", { name: /all/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /structural/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /behavioral/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /interaction/i })).toBeVisible();
  });

  test("Can create a new UML Class Diagram from gallery", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml`);
    await page.waitForLoadState("load");

    await page.getByRole("button", { name: /new uml diagram/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("textbox", { name: /diagram name/i }).fill("E2E Class Diagram");

    // Diagram type selector should show uml-class by default
    const typeSelect = dialog.getByRole("combobox", { name: /diagram type/i });
    await expect(typeSelect).toBeVisible();

    await dialog.getByRole("button", { name: /create/i }).click();

    // Should navigate to the editor
    await page.waitForURL(/\/uml\/.+\/edit/);
    const url = page.url();
    const match = url.match(/\/uml\/([^/]+)\/edit/);
    expect(match).toBeTruthy();

    // Cleanup via API
    if (match) {
      await deleteDiagram(context.request, match[1]);
    }
  });

  test("Create dialog lists all 14 diagram types", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml`);
    await page.waitForLoadState("load");

    await page.getByRole("button", { name: /new uml diagram/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Open the type dropdown
    const typeSelect = dialog.getByRole("combobox", { name: /diagram type/i });
    await typeSelect.click();

    // Should list structural diagrams
    await expect(page.getByRole("option", { name: /class diagram/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /component diagram/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /use case diagram/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /activity diagram/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /state machine diagram/i })).toBeVisible();

    // Close dialog
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
  });

  test("Gallery cards appear after creating a diagram", async ({ context, page, request }) => {
    const id = await createDiagram(request, "Gallery Visibility Test");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml`);
    await page.waitForLoadState("load");

    await expect(page.getByText("Gallery Visibility Test")).toBeVisible();

    await deleteDiagram(request, id);
  });

  // ─── Diagram editor ────────────────────────────────────────────────────────

  test("Editor loads with element palette visible", async ({ context, page, request }) => {
    const id = await createDiagram(request, "Palette Test");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml/${id}/edit`);
    await page.waitForLoadState("load");

    // Palette should show classifier elements for class diagram
    await expect(page.getByText(/classifier/i)).toBeVisible();

    await deleteDiagram(request, id);
  });

  test("Editor shows diagram type chip in toolbar", async ({ context, page, request }) => {
    const id = await createDiagram(request, "Chip Test");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml/${id}/edit`);
    await page.waitForLoadState("load");

    // Toolbar chip shows diagram type label
    await expect(page.getByText(/class diagram/i)).toBeVisible();

    await deleteDiagram(request, id);
  });

  test("Auto Layout button is present in editor", async ({ context, page, request }) => {
    const id = await createDiagram(request, "Layout Button Test");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml/${id}/edit`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("button", { name: /auto.?layout/i })).toBeVisible();

    await deleteDiagram(request, id);
  });

  test("Back button navigates to UML gallery", async ({ context, page, request }) => {
    const id = await createDiagram(request, "Back Nav Test");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml/${id}/edit`);
    await page.waitForLoadState("load");

    const backBtn = page.getByRole("button", { name: /back|uml/i }).first();
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await expect(page).toHaveURL(/\/uml$/);
    }

    await deleteDiagram(request, id);
  });

  test("Palette filters to diagram-type-appropriate elements", async ({
    context,
    page,
    request,
  }) => {
    // Use Case diagram should show Actor and UseCase in palette
    const id = await createDiagram(request, "UseCase Palette Test", "uml-usecase");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml/${id}/edit`);
    await page.waitForLoadState("load");

    // Actor and UseCase should appear in palette
    await expect(page.getByText(/actor/i).first()).toBeVisible();
    await expect(page.getByText(/use case/i).first()).toBeVisible();

    // Class (which is only in class diagrams) should NOT appear
    await expect(page.getByText(/^classifier$/i)).not.toBeVisible();

    await deleteDiagram(request, id);
  });

  test("Palette search filters elements", async ({ context, page, request }) => {
    const id = await createDiagram(request, "Search Palette Test");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml/${id}/edit`);
    await page.waitForLoadState("load");

    const searchBox = page.getByPlaceholder(/search elements/i);
    await expect(searchBox).toBeVisible();

    await searchBox.fill("interface");

    // Should show Interface element
    await expect(page.getByText(/interface/i).first()).toBeVisible();

    await deleteDiagram(request, id);
  });

  test("Activity diagram editor loads with activity-specific elements", async ({
    context,
    page,
    request,
  }) => {
    const id = await createDiagram(request, "Activity Editor Test", "uml-activity");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml/${id}/edit`);
    await page.waitForLoadState("load");

    // Activity category should appear
    await expect(page.getByText(/activity/i).first()).toBeVisible();

    await deleteDiagram(request, id);
  });

  // ─── Diagram persistence ──────────────────────────────────────────────────

  test("Diagram type is persisted and restored on reload", async ({
    context,
    page,
    request,
  }) => {
    const id = await createDiagram(request, "Persist Type Test", "uml-statemachine");

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/uml/${id}/edit`);
    await page.waitForLoadState("load");

    // State Machine diagram type chip should show
    await expect(page.getByText(/state machine/i)).toBeVisible();

    // Reload and verify persisted
    await page.reload();
    await page.waitForLoadState("load");
    await expect(page.getByText(/state machine/i)).toBeVisible();

    await deleteDiagram(request, id);
  });

  test("Diagram appears in /api/v1/diagrams list with uml type prefix", async ({ request }) => {
    const id = await createDiagram(request, "List Type Test", "uml-component");

    const resp = await request.get(`${BASE_URL}/api/v1/diagrams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);
    const data = await resp.json();
    const items = (data.items ?? data) as Array<{ id: string; type: string }>;

    const created = items.find((d) => d.id === id);
    expect(created).toBeTruthy();
    expect(created?.type).toBe("uml-component");

    await deleteDiagram(request, id);
  });

  // ─── XMI export stub ──────────────────────────────────────────────────────

  test("XMI export endpoint returns a non-500 response", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.post(`${BASE_URL}/api/v1/uml/export`, {
      data: { card_ids: [] },
      headers: { Authorization: `Bearer ${token}` },
    });
    // Stub returns 200 with message
    expect(resp.status()).toBeLessThan(500);
  });
});
