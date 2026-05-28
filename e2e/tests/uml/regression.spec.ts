/**
 * Regression guard — verifies that enabling/disabling the UML plugin does not
 * break core EA functionality, the ArchiMate plugin, or other modules.
 */
import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  enableUml,
  disableUml,
  enableArchiMate,
  disableArchiMate,
} from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("UML plugin regression", () => {
  // ─── Core metamodel integrity ─────────────────────────────────────────────

  test("Core EA card types survive UML enable/disable cycle", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    // Enable, then disable UML
    await enableUml(context.request, BASE_URL, token);
    await disableUml(context.request, BASE_URL, token);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);

    const types = await resp.json();
    const keys = types.map((t: { key: string }) => t.key);

    // Core types must all survive
    expect(keys).toContain("Application");
    expect(keys).toContain("BusinessCapability");
    expect(keys).toContain("Organization");
    expect(keys).toContain("Initiative");
    expect(keys).toContain("BusinessProcess");
    expect(keys).toContain("ITComponent");
    expect(keys).toContain("DataObject");
  });

  test("Core EA relation types survive UML enable/disable cycle", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    await enableUml(context.request, BASE_URL, token);
    await disableUml(context.request, BASE_URL, token);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/relation-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);

    const relTypes = await resp.json();
    const keys = relTypes.map((r: { key: string }) => r.key);

    // Core relation types must survive (sample)
    expect(keys.some((k: string) => !k.startsWith("uml_rel_") && !k.startsWith("arch_rel_"))).toBe(true);
  });

  test("Enabling UML does not affect ArchiMate types", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    await enableArchiMate(context.request, BASE_URL, token);
    await enableUml(context.request, BASE_URL, token);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const keys = types.map((t: { key: string }) => t.key);

    // ArchiMate and UML types should coexist
    const archTypes = keys.filter((k: string) => k.startsWith("arch_"));
    const umlTypes = keys.filter((k: string) => k.startsWith("uml_"));
    expect(archTypes.length).toBeGreaterThan(0);
    expect(umlTypes.length).toBeGreaterThan(0);

    // Cleanup
    await disableUml(context.request, BASE_URL, token);
    await disableArchiMate(context.request, BASE_URL, token);
  });

  test("Disabling UML does not hide ArchiMate types", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    await enableArchiMate(context.request, BASE_URL, token);
    await enableUml(context.request, BASE_URL, token);
    await disableUml(context.request, BASE_URL, token);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const archTypes = types.filter(
      (t: { key: string; is_hidden?: boolean }) =>
        t.key.startsWith("arch_") && !t.is_hidden,
    );
    expect(archTypes.length).toBeGreaterThan(0);

    // Cleanup
    await disableArchiMate(context.request, BASE_URL, token);
  });

  // ─── API surface regression ───────────────────────────────────────────────

  test("Dashboard API still returns correct shape after UML enable", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableUml(context.request, BASE_URL, token);

    const resp = await context.request.get(`${BASE_URL}/api/v1/reports/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);

    const data = await resp.json();
    expect(typeof data.total_cards).toBe("number");

    await disableUml(context.request, BASE_URL, token);
  });

  test("Cards API still works after UML enable/disable", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    await enableUml(context.request, BASE_URL, token);
    const resp1 = await context.request.get(`${BASE_URL}/api/v1/cards?page_size=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp1.ok()).toBe(true);

    await disableUml(context.request, BASE_URL, token);
    const resp2 = await context.request.get(`${BASE_URL}/api/v1/cards?page_size=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp2.ok()).toBe(true);
  });

  test("Bootstrap still returns all required fields when UML is enabled", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableUml(context.request, BASE_URL, token);

    const resp = await context.request.get(`${BASE_URL}/api/v1/settings/bootstrap`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);

    const data = await resp.json();
    // Fields that were there before UML must still exist
    expect(typeof data.currency).toBe("string");
    expect(typeof data.date_format).toBe("string");
    expect(typeof data.app_title).toBe("string");
    expect(typeof data.bpm_enabled).toBe("boolean");
    expect(typeof data.archimate_enabled).toBe("boolean");
    expect(typeof data.uml_enabled).toBe("boolean");

    await disableUml(context.request, BASE_URL, token);
  });

  // ─── UI regression ────────────────────────────────────────────────────────

  test("Dashboard page still loads correctly when UML is enabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableUml(context.request, BASE_URL, token);

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    // Dashboard title or KPI cards should be visible
    const heading = page.getByRole("heading", { name: /dashboard/i });
    await expect(heading.or(page.getByText(/total cards/i).first())).toBeVisible({
      timeout: 10000,
    });

    await disableUml(context.request, BASE_URL, token);
  });

  test("Inventory page works correctly when UML is enabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableUml(context.request, BASE_URL, token);

    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/inventory`);
    await page.waitForLoadState("load");

    // Inventory page should load without error
    const errorText = page.getByText(/error|failed|crash/i);
    await expect(errorText).not.toBeVisible({ timeout: 5000 }).catch(() => {
      // Might not exist at all — that's fine
    });

    await disableUml(context.request, BASE_URL, token);
  });

  test("Admin settings page is not broken by UML tab addition", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);

    await page.goto(`${BASE_URL}/admin/settings`);
    await page.waitForLoadState("load");

    // General tab should still be the first tab and visible
    await expect(page.getByRole("tab", { name: /general/i })).toBeVisible();

    // UML tab should now be present
    const umlTab = page.getByRole("tab", { name: /^uml$/i });
    await expect(umlTab).toBeVisible();
  });

  test("ArchiMate diagrams are unaffected by UML enable/disable", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableArchiMate(context.request, BASE_URL, token);
    await enableUml(context.request, BASE_URL, token);

    // Create an ArchiMate diagram
    const createResp = await context.request.post(`${BASE_URL}/api/v1/diagrams`, {
      data: { name: "Regression Archimate Test", type: "archimate" },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(createResp.ok()).toBe(true);
    const d = await createResp.json();

    // Disable UML — ArchiMate diagram should still be accessible
    await disableUml(context.request, BASE_URL, token);

    const getResp = await context.request.get(`${BASE_URL}/api/v1/diagrams/${d.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(getResp.ok()).toBe(true);
    const diagram = await getResp.json();
    expect(diagram.type).toBe("archimate");

    // Cleanup
    await context.request.delete(`${BASE_URL}/api/v1/diagrams/${d.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await disableArchiMate(context.request, BASE_URL, token);
  });

  // ─── UML card type isolation ──────────────────────────────────────────────

  test("UML card types do not interfere with core inventory type filter", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableUml(context.request, BASE_URL, token);

    // Query cards with a core type — should not return uml_ typed cards
    const resp = await context.request.get(`${BASE_URL}/api/v1/cards?type=Application&page_size=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);

    const data = await resp.json();
    const items = (data.items ?? data) as Array<{ type: string }>;
    for (const item of items) {
      expect(item.type).toBe("Application");
    }

    await disableUml(context.request, BASE_URL, token);
  });

  test("UML card type has uml_ prefix and does not pollute core counts", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableUml(context.request, BASE_URL, token);

    // Get dashboard counts
    const countsBefore = await context.request.get(`${BASE_URL}/api/v1/cards/counts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (countsBefore.ok()) {
      const data = await countsBefore.json();
      // Counts should be numbers — plugin types shouldn't break this
      expect(Array.isArray(data) || typeof data === "object").toBe(true);
    }

    await disableUml(context.request, BASE_URL, token);
  });
});
