import { type BrowserContext, type APIRequestContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@turboea.demo";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "TurboEA!2025";

const TOKEN_FILE = path.join(__dirname, "../.auth/token.json");

function getCachedToken(): string {
  try {
    const data = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    return data.access_token;
  } catch {
    throw new Error(
      "No cached auth token found. Did globalSetup run? Token file: " + TOKEN_FILE,
    );
  }
}

/**
 * Inject the pre-cached admin JWT into the browser context's sessionStorage.
 * Does NOT call the login API — token is fetched once in globalSetup.
 */
export async function loginAsAdmin(
  context: BrowserContext,
  _baseURL: string,
): Promise<string> {
  const token = getCachedToken();

  await context.addInitScript(
    ({ t }) => {
      sessionStorage.setItem("token", t);
    },
    { t: token },
  );

  return token;
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
