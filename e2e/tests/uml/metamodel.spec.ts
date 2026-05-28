import { test, expect } from "@playwright/test";
import { loginAsAdmin, enableUml, disableUml } from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("UML metamodel", () => {
  test.beforeEach(async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableUml(context.request, BASE_URL, token);
  });

  test.afterEach(async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await disableUml(context.request, BASE_URL, token);
  });

  // ─── Card types ─────────────────────────────────────────────────────────────

  test("UML card types are registered in the metamodel after enabling", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);

    const types = await resp.json();
    const keys = types.map((t: { key: string }) => t.key);
    const umlTypes = keys.filter((k: string) => k.startsWith("uml_"));

    expect(umlTypes.length).toBeGreaterThanOrEqual(10);
  });

  test("Core UML class diagram types exist", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const keys = types.map((t: { key: string }) => t.key);

    // Class diagram
    expect(keys).toContain("uml_Class");
    expect(keys).toContain("uml_Interface");
    expect(keys).toContain("uml_Enumeration");
    expect(keys).toContain("uml_AbstractClass");
  });

  test("Core UML structural types exist", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const keys = types.map((t: { key: string }) => t.key);

    // Component / Deployment
    expect(keys).toContain("uml_Component");
    expect(keys).toContain("uml_Node");
    expect(keys).toContain("uml_Artifact");

    // Package
    expect(keys).toContain("uml_Package");
    expect(keys).toContain("uml_Model");
  });

  test("Core UML behavioral types exist", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const keys = types.map((t: { key: string }) => t.key);

    // Use case
    expect(keys).toContain("uml_Actor");
    expect(keys).toContain("uml_UseCase");

    // Activity
    expect(keys).toContain("uml_Action");
    expect(keys).toContain("uml_InitialNode");
    expect(keys).toContain("uml_ActivityFinalNode");

    // State machine
    expect(keys).toContain("uml_State");
    expect(keys).toContain("uml_PseudostateInitial");
  });

  test("UML sequence diagram types exist", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const keys = types.map((t: { key: string }) => t.key);

    expect(keys).toContain("uml_Lifeline");
    expect(keys).toContain("uml_CombinedFragment");
  });

  test("UML types have plugin_id=uml", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const umlTypes = types.filter((t: { key: string }) => t.key.startsWith("uml_"));

    for (const t of umlTypes) {
      expect(t.plugin_id).toBe("uml");
    }
  });

  test("UML seed is idempotent — second enable does not duplicate types", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    // First enable done in beforeEach — enable again
    await enableUml(context.request, BASE_URL, token);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const umlKeys = types.map((t: { key: string }) => t.key).filter((k: string) => k.startsWith("uml_"));

    // No duplicates
    const unique = new Set(umlKeys);
    expect(umlKeys.length).toBe(unique.size);
  });

  // ─── Relation types ──────────────────────────────────────────────────────────

  test("UML relation types are registered after enabling", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/relation-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);

    const relTypes = await resp.json();
    const umlRels = relTypes.filter((r: { key: string }) => r.key.startsWith("uml_rel_"));
    expect(umlRels.length).toBeGreaterThanOrEqual(5);
  });

  test("Core UML relation types exist", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/relation-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const relTypes = await resp.json();
    const keys = relTypes.map((r: { key: string }) => r.key);

    expect(keys).toContain("uml_rel_association");
    expect(keys).toContain("uml_rel_generalization");
    expect(keys).toContain("uml_rel_realization");
    expect(keys).toContain("uml_rel_dependency");
    expect(keys).toContain("uml_rel_composition");
    expect(keys).toContain("uml_rel_aggregation");
  });

  // ─── Deactivation ────────────────────────────────────────────────────────────

  test("Disabling UML hides card types from metamodel listing", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    // Disable (afterEach will do it too, that's fine)
    await disableUml(context.request, BASE_URL, token);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const visibleUmlTypes = types.filter((t: { key: string; is_hidden?: boolean }) =>
      t.key.startsWith("uml_") && !t.is_hidden,
    );

    expect(visibleUmlTypes.length).toBe(0);
  });

  test("Re-enabling UML makes types visible again", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    await disableUml(context.request, BASE_URL, token);
    await enableUml(context.request, BASE_URL, token);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const visibleUmlTypes = types.filter((t: { key: string }) => t.key.startsWith("uml_"));
    expect(visibleUmlTypes.length).toBeGreaterThan(0);
  });

  // ─── Status endpoint ─────────────────────────────────────────────────────────

  test("/settings/uml-status returns counts", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/settings/uml-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);

    const data = await resp.json();
    expect(typeof data.enabled).toBe("boolean");
    expect(typeof data.card_types_count).toBe("number");
    expect(typeof data.relation_types_count).toBe("number");
    expect(typeof data.cards_count).toBe("number");
    expect(typeof data.diagrams_count).toBe("number");
    expect(data.card_types_count).toBeGreaterThan(0);
    expect(data.relation_types_count).toBeGreaterThan(0);
  });

  // ─── Coexistence with core types ────────────────────────────────────────────

  test("Core EA card types are unaffected by enabling UML", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/metamodel/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const types = await resp.json();
    const keys = types.map((t: { key: string }) => t.key);

    // Core types must still be present alongside UML types
    expect(keys).toContain("Application");
    expect(keys).toContain("BusinessCapability");
    expect(keys).toContain("Organization");
    expect(keys).toContain("Initiative");
  });

  test("UML diagram-types endpoint returns 14 types", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/uml/diagram-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);

    const data = await resp.json();
    // Should have Structural + Behavioral + Interaction categories
    expect(data.length).toBe(14);
    const categories = [...new Set(data.map((d: { category: string }) => d.category))];
    expect(categories).toContain("Structural");
    expect(categories).toContain("Behavioral");
    expect(categories).toContain("Interaction");
  });
});
