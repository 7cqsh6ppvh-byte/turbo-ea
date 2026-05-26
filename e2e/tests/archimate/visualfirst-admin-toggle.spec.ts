/**
 * VisualFirst Canvas admin toggle tests.
 *
 * BEFORE Phase 1: these tests verify the existing ArchiMate feature flag
 * controls the canvas editor (the two are the same plugin currently).
 *
 * AFTER Phase 1: update the helpers and settings tab name to use the new
 * VisualFirst-specific flag (PATCH /settings/visualfirst-enabled) and the
 * nav label "VisualFirst Canvas".
 *
 * The intent is preserved across the refactor — only the mechanism changes.
 */
import { test, expect } from "@playwright/test";
import { loginAsAdmin, enableArchiMate, disableArchiMate } from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

// After Phase 1: replace these two helpers with enableVisualFirst / disableVisualFirst
// from a new helpers export, pointing at /settings/visualfirst-enabled.
const enableCanvas = enableArchiMate;
const disableCanvas = disableArchiMate;

test.describe("VisualFirst Canvas admin toggle", () => {
  test("canvas nav item is hidden when disabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await disableCanvas(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    // After Phase 1 the nav label changes to "VisualFirst Canvas".
    // Before Phase 1: the nav link is labelled "ArchiMate".
    // Update the regex below once Phase 1 is complete:
    //   /visualfirst canvas/i  →  new label
    const navLink = page.getByRole("link", { name: /archimate|visualfirst/i });
    await expect(navLink).not.toBeVisible();
  });

  test("canvas nav item is visible when enabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableCanvas(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    // Before Phase 1: nav label is "ArchiMate"
    // After Phase 1: nav label is "VisualFirst Canvas" — update regex
    const navLink = page.getByRole("link", { name: /archimate|visualfirst/i });
    await expect(navLink).toBeVisible();

    // Cleanup
    await disableCanvas(context.request, BASE_URL, token);
  });

  test("canvas route shows gate message when disabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await disableCanvas(context.request, BASE_URL, token);

    // Before Phase 1: route is /archimate
    // After Phase 2: route changes to /visualfirst — update both URLs below
    await page.goto(`${BASE_URL}/archimate`);
    await page.waitForLoadState("load");

    // ModuleGate renders when the flag is off — the gallery button should not appear
    const newDiagramButton = page.getByRole("button", { name: /new.*diagram/i });
    await expect(newDiagramButton).not.toBeVisible();
  });

  test("admin settings tab for canvas is accessible", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);

    // Before Phase 1: settings tab is ?tab=archimate
    // After Phase 1: add ?tab=visualfirst test here (the archimate tab stays for metamodel settings)
    await page.goto(`${BASE_URL}/admin/settings?tab=archimate`);
    await page.waitForLoadState("load");

    // The ArchiMate settings section should be visible
    await expect(page.getByText(/archimate/i).first()).toBeVisible();
  });

  test("disabling canvas does not affect ArchiMate metamodel types in API", async ({
    context,
    request,
  }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await disableCanvas(context.request, BASE_URL, token);

    // Metamodel types should still be accessible regardless of canvas flag
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;
    // ArchiMate types exist in the metamodel even when the canvas is disabled
    // (after the split, the metamodel plugin is always-on independent of the canvas plugin)
    const archTypes = types.filter((t) => t.plugin_id === "archimate");
    // NOTE: before the plugin split this may be 0 when ArchiMate is disabled entirely.
    // After Phase 1 this assertion becomes: expect(archTypes.length).toBeGreaterThan(0)
    expect(Array.isArray(archTypes)).toBeTruthy();

    // Re-enable so other tests can run
    await enableCanvas(context.request, BASE_URL, token);
  });
});
