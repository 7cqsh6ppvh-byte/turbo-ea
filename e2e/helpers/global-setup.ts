/**
 * Playwright global setup — runs once before all tests.
 * Calls the login API to get a JWT and saves it to .auth/token.json.
 * Individual tests inject the token as an httpOnly cookie via loginAsAdmin().
 */
import { request as playwrightRequest } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8920";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@turboea.demo";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "TurboEA!2025";
const AUTH_DIR = path.join(__dirname, "../.auth");
const TOKEN_FILE = path.join(AUTH_DIR, "token.json");

export default async function globalSetup() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const apiContext = await playwrightRequest.newContext({ ignoreHTTPSErrors: true });
  const loginResp = await apiContext.post(`${BASE_URL}/api/v1/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (!loginResp.ok()) {
    const body = await loginResp.text();
    throw new Error(`Global setup login failed: ${loginResp.status()} ${body}`);
  }
  const { access_token } = await loginResp.json();
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ access_token }));
  await apiContext.dispose();
  console.log("[global-setup] JWT token saved to .auth/token.json");
}
