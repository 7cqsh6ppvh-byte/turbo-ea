import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:8920";
const EMAIL = "admin@turboea.demo";
const PASSWORD = "TurboEA!2025";

test.describe("Main Application Dashboard E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`);
  });

  test("Top Navigation Bar should be visible and functional", async ({ page }) => {
    // Check main navigation elements
    const navBar = page.locator('nav');
    await expect(page.locator('text="Dashboard"')).toBeVisible();
    await expect(page.locator('text="Inventory"')).toBeVisible();
    await expect(page.locator('text="Reports"')).toBeVisible();
    await expect(page.locator('text="BPM"')).toBeVisible();
    await expect(page.locator('text="Diagrams"')).toBeVisible();
    await expect(page.locator('text="EA Delivery"')).toBeVisible();
    await expect(page.locator('text="Todos"')).toBeVisible();

    // Verify Search bar
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    // Verify Create button
    await expect(page.locator('button:has-text("Create")')).toBeVisible();

    // Verify Notification bell
    await expect(page.locator('button[aria-label*="notifications"]')).toBeVisible();

    // Verify Profile button
    await expect(page.locator('button[aria-label*="account"]')).toBeVisible();
  });

  test("Summary Cards should display type distribution and status", async ({ page }) => {
    // Check for Type Summary Cards (Applications, Organizations, etc.)
    // These should be visible on the default Dashboard tab
    await expect(page.locator('text="Application"')).toBeVisible();
    await expect(page.locator('text="Organization"')).toBeVisible();
    await expect(page.locator('text="Business Capability"')).toBeVisible();

    // Clicking a summary card should navigate to Inventory
    await page.click('text="Application"');
    await expect(page).toHaveURL(/.*\/inventory\?type=Application/);
  });

  test("Charts and Statistics should be visible", async ({ page }) => {
    // Data Quality section
    await expect(page.locator('text="Overall Quality"')).toBeVisible();

    // Approval Status section
    await expect(page.locator('text="Approval Status"')).toBeVisible();

    // Recent Activity feed
    await expect(page.locator('text="Recent Activity"')).toBeVisible();
  });

  test("Workspace tab should show user-specific assignments", async ({ page }) => {
    // Switch to Workspace tab
    await page.click('button[role="tab"]:has-text("Workspace")');

    // Verify sections
    await expect(page.locator('text="Favorites"')).toBeVisible();
    await expect(page.locator('text="My Pending Surveys"')).toBeVisible();
    await expect(page.locator('text="Cards I Have a Role In"')).toBeVisible();
  });
});
