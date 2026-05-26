/**
 * VisualFirst Canvas admin toggle tests (Phase 6 update).
 *
 * Uses the VisualFirst-specific flag (PATCH /settings/visualfirst-enabled)
 * and the nav label "VisualFirst Canvas".
 */
import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  enableArchiMate,
  enableVisualFirst,
  disableVisualFirst,
} from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("VisualFirst Canvas admin toggle", () => {
  test.beforeAll(async ({ browser }) => {
    // Ensure ArchiMate metamodel is enabled (independent of VisualFirst canvas)
    const ctx = await browser.newContext();
    const token = await loginAsAdmin(ctx, BASE_URL);
    await enableArchiMate(ctx.request, BASE_URL, token);
    await ctx.close();
  });

  test("canvas nav item is hidden when VisualFirst is disabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await disableVisualFirst(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    const navLink = page.getByRole("link", { name: /visualfirst canvas/i });
    await expect(navLink).not.toBeVisible();
  });

  test("canvas nav item is visible when VisualFirst is enabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableVisualFirst(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    const navLink = page.getByRole("link", { name: /visualfirst canvas/i });
    await expect(navLink).toBeVisible();

    await disableVisualFirst(context.request, BASE_URL, token);
  });

  test("/visualfirst route shows gate message when VisualFirst is disabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await disableVisualFirst(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/visualfirst`);
    await page.waitForLoadState("load");

    // ModuleGate renders when the flag is off — the gallery button should not appear
    const newDiagramButton = page.getByRole("button", { name: /new.*diagram/i });
    await expect(newDiagramButton).not.toBeVisible();
  });

  test("admin settings tab for VisualFirst Canvas is accessible", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);

    await page.goto(`${BASE_URL}/admin/settings?tab=visualfirst`);
    await page.waitForLoadState("load");

    await expect(page.getByText(/visualfirst/i).first()).toBeVisible();
  });

  test("admin settings tab for ArchiMate metamodel remains accessible", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);

    await page.goto(`${BASE_URL}/admin/settings?tab=archimate`);
    await page.waitForLoadState("load");

    await expect(page.getByText(/archimate/i).first()).toBeVisible();
  });

  test("disabling VisualFirst does not affect ArchiMate metamodel types in API", async ({
    context,
    request,
  }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await disableVisualFirst(context.request, BASE_URL, token);

    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;
    const archTypes = types.filter((t) => t.plugin_id === "archimate");
    // The ArchiMate metamodel plugin is independent of the VisualFirst canvas plugin
    expect(archTypes.length).toBeGreaterThan(0);

    await enableVisualFirst(context.request, BASE_URL, token);
  });
});
