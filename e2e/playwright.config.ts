import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60000, // 60s per test for slow environments
  globalSetup: "./helpers/global-setup.ts", // One login; JWT saved to .auth/token.json
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8920",
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 30000,
    // No storageState here — auth is injected per-context via loginAsAdmin()
    // using context.addCookies(), which is more reliable for HTTPS/OrbStack setups.
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  workers: process.env.CI ? 1 : 2,
});
