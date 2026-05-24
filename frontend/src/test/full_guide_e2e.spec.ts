import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:8920";
const EMAIL = "admin@turboea.demo";
const PASSWORD = "TurboEA!2025";

test.describe("Turbo EA E2E - Full Guide Suite", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL(`${BASE_URL}/`);
    });

    // 1. Inventory & Card Creation
    test("Inventory - search, filter and create card", async ({ page }) => {
        await page.goto(`${BASE_URL}/inventory`);
        await expect(page.locator(".ag-root-wrapper")).toBeVisible();

        // Search
        await page.fill('input[placeholder*="Search"]', "NexaCore");
        await page.waitForTimeout(1000); 
        await expect(page.locator('text="NexaCore ERP"')).toBeVisible();

        // Filter by Type
        await page.click('button[aria-label="Filter"]');
        await page.click('text="Application"');
        await expect(page.locator(".ag-row")).toContainText("Application");

        // Create Card
        await page.click('button:has-text("Create")');
        await page.fill('input[label="Name"]', "E2E Test App");
        await page.click('.MuiSelect-select:has-text("Objective")'); // Default or first type
        await page.click('li[data-value="Application"]');
        await page.click('button:has-text("Create")');
        
        await expect(page.locator('text="E2E Test App"')).toBeVisible();
        await expect(page).toHaveURL(/.*\/cards\/.*/);
    });

    // 2. Card Details
    test("Card Details - tabs and sections", async ({ page }) => {
        // Go to a known demo card (NexaCore ERP)
        await page.goto(`${BASE_URL}/inventory`);
        await page.fill('input[placeholder*="Search"]', "NexaCore ERP");
        await page.click('text="NexaCore ERP"');

        // Verify Overview sections
        await expect(page.locator('text="Description"')).toBeVisible();
        await expect(page.locator('text="Lifecycle"')).toBeVisible();
        await expect(page.locator('text="Relations"')).toBeVisible();

        // Check Tabs
        await page.click('button[role="tab"]:has-text("Stakeholders")');
        await expect(page.locator('text="Stakeholder Name"')).toBeVisible();

        await page.click('button[role="tab"]:has-text("History")');
        await expect(page.locator('text="Event"')).toBeVisible();

        await page.click('button[role="tab"]:has-text("Comments")');
        await expect(page.locator('button:has-text("Post")')).toBeVisible();
    });

    // 3. Reports
    test("Reports - check main report types", async ({ page }) => {
        const reports = ["Portfolio", "Matrix", "Lifecycle", "Dependency", "Data Quality"];
        for (const report of reports) {
            await page.goto(`${BASE_URL}/reports`);
            await page.click(`text="${report}"`);
            // Check for SVG/Canvas/Chart elements characteristic of reports
            await expect(page.locator("svg, canvas, .recharts-wrapper")).toBeVisible();
        }
    });

    // 4. GRC (Risks & Compliance)
    test("GRC - Risk Register and Compliance", async ({ page }) => {
        await page.goto(`${BASE_URL}/grc`);
        
        // Risks tab (default)
        await expect(page.locator('text="Risk Register"')).toBeVisible();
        await expect(page.locator(".MuiDataGrid-root")).toBeVisible();

        // Compliance tab
        await page.click('button[role="tab"]:has-text("Compliance")');
        await expect(page.locator('text="Compliance Status"')).toBeVisible();
    });

    // 5. BPM
    test("BPM - Business Process Overvew", async ({ page }) => {
        await page.goto(`${BASE_URL}/bpm`);
        await expect(page.locator('text="Process Maturity"')).toBeVisible();
        await expect(page.locator('text="Risk Assessment"')).toBeVisible();
    });

    // 6. PPM
    test("PPM - Portfolio and Project Detail", async ({ page }) => {
        await page.goto(`${BASE_URL}/ppm`);
        await expect(page.locator('text="Portfolio Overview"')).toBeVisible();
        await expect(page.locator(".recharts-responsive-container")).toBeVisible(); // Gantt/Charts
    });

    // 7. TurboLens
    test("TurboLens - AI Analysis sections", async ({ page }) => {
        await page.goto(`${BASE_URL}/turbolens`);
        await expect(page.locator('text="AI Insights"')).toBeVisible();
        
        await page.click('button[role="tab"]:has-text("Vendors")');
        await expect(page.locator('text="Vendor Distribution"')).toBeVisible();
    });
});
