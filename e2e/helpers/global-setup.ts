/**
 * Playwright global setup — runs once before all tests.
 * Logs in as admin and caches the token to .auth/token.json so individual
 * tests never need to call the login endpoint (rate limit: 10/min).
 */
import { chromium, request as playwrightRequest } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@turboea.demo";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "TurboEA!2025";
const TOKEN_FILE = path.join(__dirname, "../.auth/token.json");

export default async function globalSetup() {
  const apiContext = await playwrightRequest.newContext({
    ignoreHTTPSErrors: true,
  });

  const response = await apiContext.post(`${BASE_URL}/api/v1/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Global setup login failed: ${response.status()} ${body}`);
  }

  const { access_token } = await response.json();
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ access_token, base_url: BASE_URL }));

  await apiContext.dispose();
  console.log("[global-setup] Admin token cached to .auth/token.json");
}
