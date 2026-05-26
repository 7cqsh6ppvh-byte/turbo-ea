/**
 * Metamodel key format — documents the current key prefix convention.
 *
 * BEFORE Phase 3: assertions verify that arch_ / arch_rel_ prefixes ARE present.
 * AFTER  Phase 3: update these assertions to verify the prefixes are ABSENT.
 *
 * This file is intentionally simple — it exists to make key renames visible
 * as test failures during the refactor.
 */
import { test, expect } from "@playwright/test";
import { loginAsAdmin, enableArchiMate, disableArchiMate } from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("ArchiMate metamodel key format", () => {
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

  test("ArchiMate card type keys currently use arch_ prefix", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;
    const archTypes = types.filter((t) => t.plugin_id === "archimate");

    // Before Phase 3: all ArchiMate type keys start with "arch_"
    // After Phase 3: update this expectation — keys will NOT have "arch_" prefix
    if (archTypes.length > 0) {
      const allPrefixed = archTypes.every((t) => t.key.startsWith("arch_"));
      expect(allPrefixed).toBeTruthy();
    }
  });

  test("ArchiMate relation type keys currently use arch_rel_ prefix", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/relation-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;
    const archRelTypes = types.filter((t) => t.plugin_id === "archimate");

    // Before Phase 3: all ArchiMate relation type keys start with "arch_rel_"
    // After Phase 3: update this expectation — keys will NOT have "arch_rel_" prefix
    if (archRelTypes.length > 0) {
      const allPrefixed = archRelTypes.every((t) => t.key.startsWith("arch_rel_"));
      expect(allPrefixed).toBeTruthy();
    }
  });

  test("ArchiMate card type categories currently use ArchiMate: prefix", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; category?: string; plugin_id?: string }>;
    const archTypes = types.filter((t) => t.plugin_id === "archimate" && t.category);

    // Before Phase 3: all ArchiMate type categories start with "ArchiMate:"
    // After Phase 3: update this expectation — categories will NOT have "ArchiMate:" prefix
    if (archTypes.length > 0) {
      const allPrefixed = archTypes.every((t) => t.category?.startsWith("ArchiMate:"));
      expect(allPrefixed).toBeTruthy();
    }
  });

  test("metamodel endpoint returns plugin_id field for ArchiMate types", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();

    const types = await resp.json() as Array<{ key: string; plugin_id?: string }>;

    // At least one type with plugin_id = "archimate" should exist when enabled
    const hasArchimateTypes = types.some((t) => t.plugin_id === "archimate");
    expect(hasArchimateTypes).toBeTruthy();
  });
});
