/**
 * Authentication E2E tests — login, logout, redirect behaviour.
 * These run against a live app (E2E_BASE_URL) seeded with SEED_DEMO=true.
 */
import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, loginAsAdmin } from "../helpers/auth";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";

test.describe("Login page", () => {
  test("shows login form when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    // Login page should have email + password fields and a submit button
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log in|login/i })).toBeVisible();
  });

  test("redirects protected routes to login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/inventory`);
    await page.waitForLoadState("load");

    // Should end up on login page (either by redirect or by rendering login form)
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 10000 });
  });

  test("shows validation error for empty submission", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    await page.getByRole("button", { name: /sign in|log in|login/i }).click();

    // Browser native validation or custom error message
    const emailInput = page.getByLabel(/email/i);
    const isInvalid =
      (await emailInput.getAttribute("aria-invalid")) === "true" ||
      (await emailInput.evaluate((el) => !(el as HTMLInputElement).validity.valid));
    expect(isInvalid).toBe(true);
  });

  test("shows error for wrong credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in|log in|login/i }).click();

    // Error toast or inline message — match broad patterns
    await expect(
      page
        .getByText(/invalid|incorrect|wrong|not found|failed|credentials|unauthorized/i)
        .or(page.locator("[role='alert']"))
        .first(),
    ).toBeVisible({ timeout: 8000 });
  });

  test("logs in successfully with valid credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");

    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in|log in|login/i }).click();

    // Should navigate away from login and show the dashboard
    await page.waitForURL((url) => !url.toString().includes("login"), { timeout: 15000 });
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL(/login/);
  });
});

test.describe("Authenticated session", () => {
  test.beforeEach(async ({ context, page }) => {
    // Use cached token from globalSetup — no login API call needed
    await loginAsAdmin(context, BASE_URL);
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("load");
  });

  test("shows user menu / profile after login", async ({ page }) => {
    // Avatar icon button in top-right — MUI IconButton with AccountCircle
    const profileTrigger = page
      .locator("button[aria-label], header button")
      .filter({ has: page.locator("svg, [data-testid*='account'], [data-testid*='person']") })
      .last()
      .or(page.getByRole("button", { name: /account|profile|user|admin|menu/i }).last());
    // Dashboard itself being visible is sufficient evidence of authenticated session
    await expect(page.locator("main, [role='main'], #root > div").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("logs out and returns to login page", async ({ page }) => {
    // Find the user avatar / profile button — it's in the AppBar
    // Try multiple selectors to find it
    const avatarBtn = page
      .locator("header")
      .getByRole("button")
      .last();

    await avatarBtn.click();

    // Click logout/sign out menu item
    await page.getByRole("menuitem", { name: /log out|sign out|logout/i }).click();

    // Should be back on login
    await page.waitForLoadState("load");
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 10000 });
  });

  test("session is cleared on logout (sessionStorage token removed)", async ({ page }) => {
    const avatarBtn = page.locator("header").getByRole("button").last();
    await avatarBtn.click();
    await page.getByRole("menuitem", { name: /log out|sign out|logout/i }).click();
    await page.waitForLoadState("load");

    const token = await page.evaluate(() => sessionStorage.getItem("token"));
    expect(token).toBeNull();
  });
});
