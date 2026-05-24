import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:8920";
const EMAIL = "admin@turboea.demo";
const PASSWORD = "TurboEA!2025";

test.describe("UML Plugin E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`);
  });

  test("should create and delete a UML diagram", async ({ page }) => {
    // Navigate to UML Diagrams (using the path from the spec)
    await page.click('text="account_tree"'); // UML Diagrams icon in nav
    await expect(page).toHaveURL(/.*\/uml-diagrams/);

    // Create New Diagram
    await page.click('button:has-text("Create")');
    await page.fill('input[label="Name"]', "E2E Test Diagram");
    await page.click('button:has-text("Create")');

    // Verify it exists in the list
    await expect(page.locator('text="E2E Test Diagram"')).toBeVisible();

    // Delete the diagram
    await page.click('button[aria-label="delete"]'); // Assuming there's a delete button in the list
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('text="E2E Test Diagram"')).not.toBeVisible();
  });

  test("should interact with the UML Canvas", async ({ page }) => {
     // Navigate and create a diagram for canvas testing
    await page.goto(`${BASE_URL}/uml-diagrams`);
    await page.click('button:has-text("Create")');
    await page.fill('input[label="Name"]', "Canvas Test Diagram");
    await page.click('button:has-text("Create")');
    
    // Click on the diagram to open the editor
    await page.click('text="Canvas Test Diagram"');
    await expect(page).toHaveURL(/.*\/uml-diagrams\/.*/);

    // Verify Toolbox visibility
    await expect(page.locator('text="Toolbox"')).toBeVisible();
    await expect(page.locator('text="Class"')).toBeVisible();

    // Verify Export options
    await page.click('button[aria-label="Export"]');
    await expect(page.locator('text="PlantUML"')).toBeVisible();
    await expect(page.locator('text="SVG"')).toBeVisible();
    await expect(page.locator('text="PNG"')).toBeVisible();
  });
});
