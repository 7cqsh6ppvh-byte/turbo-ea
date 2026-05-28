import { test, expect } from "@playwright/test";
import { loginAsAdmin, enableUml, disableUml } from "../../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("UML feature flag", () => {
  test("UML nav item is hidden when disabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await disableUml(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    const navLink = page.getByRole("link", { name: /^uml$/i });
    await expect(navLink).not.toBeVisible();
  });

  test("UML nav item is visible when enabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableUml(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    const navLink = page.getByRole("link", { name: /^uml$/i });
    await expect(navLink).toBeVisible();

    await disableUml(context.request, BASE_URL, token);
  });

  test("/uml route shows ModuleGate message when disabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await disableUml(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/uml`);
    await page.waitForLoadState("load");

    // Gallery page "New UML Diagram" button must not appear
    await expect(page.getByRole("button", { name: /new uml diagram/i })).not.toBeVisible();
  });

  test("/uml route loads gallery when enabled", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    await enableUml(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/uml`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("button", { name: /new uml diagram/i })).toBeVisible();

    await disableUml(context.request, BASE_URL, token);
  });

  test("UML settings tab is accessible in admin settings", async ({ context, page }) => {
    await loginAsAdmin(context, BASE_URL);

    await page.goto(`${BASE_URL}/admin/settings?tab=uml`);
    await page.waitForLoadState("load");

    // The UML admin panel heading should appear
    await expect(page.getByText(/uml/i).first()).toBeVisible();
  });

  test("/settings/uml-enabled returns the current state", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    // Enable then verify via API
    await enableUml(context.request, BASE_URL, token);
    const enabledResp = await context.request.get(`${BASE_URL}/api/v1/settings/uml-enabled`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(enabledResp.ok()).toBe(true);
    const enabled = await enabledResp.json();
    expect(enabled.enabled).toBe(true);

    // Disable then verify
    await disableUml(context.request, BASE_URL, token);
    const disabledResp = await context.request.get(`${BASE_URL}/api/v1/settings/uml-enabled`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(disabledResp.ok()).toBe(true);
    const disabled = await disabledResp.json();
    expect(disabled.enabled).toBe(false);
  });

  test("bootstrap includes uml_enabled field", async ({ context }) => {
    const token = await loginAsAdmin(context, BASE_URL);

    const resp = await context.request.get(`${BASE_URL}/api/v1/settings/bootstrap`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBe(true);
    const data = await resp.json();
    expect(typeof data.uml_enabled).toBe("boolean");
  });

  test("UML admin toggle activates the plugin", async ({ context, page }) => {
    const token = await loginAsAdmin(context, BASE_URL);
    // Start disabled
    await disableUml(context.request, BASE_URL, token);

    await page.goto(`${BASE_URL}/admin/settings?tab=uml`);
    await page.waitForLoadState("load");

    // Find the enable toggle/switch and enable it
    const toggle = page.getByRole("checkbox", { name: /enable uml/i });
    if (await toggle.isVisible()) {
      if (!(await toggle.isChecked())) {
        await toggle.click();
        await page.waitForTimeout(1000);
      }
      await expect(toggle).toBeChecked();
    }

    // Verify via API
    const resp = await context.request.get(`${BASE_URL}/api/v1/settings/uml-enabled`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    expect(data.enabled).toBe(true);

    // Cleanup
    await disableUml(context.request, BASE_URL, token);
  });
});
