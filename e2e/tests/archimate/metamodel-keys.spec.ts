/**
 * Metamodel key format — verifies that arch_ / arch_rel_ / ArchiMate: prefixes
 * have been removed from ArchiMate type keys and categories (Phase 3).
 *
 * These assertions were flipped in Phase 6: before, they asserted prefixes ARE present.
 * Now they assert prefixes are ABSENT.
 */
import { test, expect } from "@playwright/test";
import { loginAsAdmin, enableArchiMate, disableArchiMate } from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("ArchiMate metamodel key format (post-Phase-3)", () => {
  let token: string;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    token = await loginAsAdmin(ctx, BASE_URL);
    await enableArchiMate(ctx.request, BASE_URL, token);
    await ctx.close();
  });

  test.afterAll(async ({ request }) => {
    await disableArchiMate(request, BASE_URL, token);
  });

  test("ArchiMate card type keys do NOT have arch_ prefix", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;
    const archTypes = types.filter((t) => t.plugin_id === "archimate");

    expect(archTypes.length).toBeGreaterThan(0);

    const withPrefix = archTypes.filter((t) => t.key.startsWith("arch_"));
    expect(withPrefix).toHaveLength(0);
  });

  test("ArchiMate relation type keys do NOT have arch_rel_ prefix", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/relation-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;
    const archRelTypes = types.filter((t) => t.plugin_id === "archimate");

    expect(archRelTypes.length).toBeGreaterThan(0);

    const withPrefix = archRelTypes.filter((t) => t.key.startsWith("arch_rel_"));
    expect(withPrefix).toHaveLength(0);
  });

  test("ArchiMate card type categories do NOT have ArchiMate: prefix", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; category?: string; plugin_id?: string }>;
    const archTypes = types.filter((t) => t.plugin_id === "archimate" && t.category);

    expect(archTypes.length).toBeGreaterThan(0);

    const withPrefix = archTypes.filter((t) => t.category?.startsWith("ArchiMate:"));
    expect(withPrefix).toHaveLength(0);
  });

  test("metamodel endpoint returns plugin_id field for ArchiMate types", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;
    const hasArchimateTypes = types.some((t) => t.plugin_id === "archimate");
    expect(hasArchimateTypes).toBeTruthy();
  });

  test("well-known type keys exist without prefix", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;
    const keys = new Set(types.map((t) => t.key));

    expect(keys.has("BusinessActor")).toBeTruthy();
    expect(keys.has("ApplicationComponent")).toBeTruthy();
    expect(keys.has("Node")).toBeTruthy();

    // Old prefixed keys must not exist
    expect(keys.has("arch_BusinessActor")).toBeFalsy();
    expect(keys.has("arch_ApplicationComponent")).toBeFalsy();
  });

  test("well-known relation type keys exist without prefix", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/relation-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;
    const keys = new Set(types.map((t) => t.key));

    expect(keys.has("Association")).toBeTruthy();
    expect(keys.has("Composition")).toBeTruthy();
    expect(keys.has("Serving")).toBeTruthy();

    expect(keys.has("arch_rel_Association")).toBeFalsy();
    expect(keys.has("arch_rel_Composition")).toBeFalsy();
  });
});
