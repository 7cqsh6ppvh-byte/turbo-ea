import { type BrowserContext, type APIRequestContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@turboea.demo";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "TurboEA!2025";

const TOKEN_FILE = path.join(__dirname, "../.auth/token.json");

/**
 * Injects the admin JWT as an httpOnly cookie into the browser context and
 * returns the token string for direct API calls.
 *
 * Using context.addCookies() is more reliable than Playwright storageState for
 * HTTPS environments (e.g. OrbStack with self-signed or local certs) because it
 * directly sets the cookie the backend expects rather than relying on the
 * storageState file restore mechanism.
 */
export async function loginAsAdmin(
  context: BrowserContext,
  baseURL: string,
): Promise<string> {
  if (!fs.existsSync(TOKEN_FILE)) {
    throw new Error(`JWT file not found: ${TOKEN_FILE}. Did globalSetup run successfully?`);
  }
  const { access_token } = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));

  const url = new URL(baseURL);
  await context.addCookies([
    {
      name: "access_token",
      value: access_token,
      domain: url.hostname,
      path: "/api",
      httpOnly: true,
      secure: url.protocol === "https:",
      sameSite: "Lax",
      // 24-hour expiry mirrors the backend's ACCESS_TOKEN_EXPIRE_MINUTES default
      expires: Math.floor(Date.now() / 1000) + 86400,
    },
  ]);

  return access_token;
}

export async function enableArchiMate(
  request: APIRequestContext,
  baseURL: string,
  token: string,
): Promise<void> {
  const resp = await request.patch(`${baseURL}/api/v1/settings/archimate-enabled`, {
    data: { enabled: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok()) {
    throw new Error(`Failed to enable ArchiMate: ${resp.status()}`);
  }
}

export async function disableArchiMate(
  request: APIRequestContext,
  baseURL: string,
  token: string,
): Promise<void> {
  const resp = await request.patch(`${baseURL}/api/v1/settings/archimate-enabled`, {
    data: { enabled: false },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok()) {
    throw new Error(`Failed to disable ArchiMate: ${resp.status()}`);
  }
}

export async function enableUml(
  request: APIRequestContext,
  baseURL: string,
  token: string,
): Promise<void> {
  const resp = await request.patch(`${baseURL}/api/v1/settings/uml-enabled`, {
    data: { enabled: true },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok()) {
    throw new Error(`Failed to enable UML: ${resp.status()} ${await resp.text()}`);
  }
}

export async function disableUml(
  request: APIRequestContext,
  baseURL: string,
  token: string,
): Promise<void> {
  const resp = await request.patch(`${baseURL}/api/v1/settings/uml-enabled`, {
    data: { enabled: false },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok()) {
    throw new Error(`Failed to disable UML: ${resp.status()} ${await resp.text()}`);
  }
}
