/**
 * Module registry — single source of truth for all optional feature modules.
 *
 * Adding a new module (e.g. "bpmn2"):
 *  1. Add one entry to MODULE_REGISTRY below.
 *  2. Add the backend JSONB key + endpoint in settings.py.
 *  3. Add the bootstrap field in the /settings/bootstrap response and in
 *     bootstrap.ts primeBootstrap().
 *
 * Nothing else needs touching: ModuleGate, AppLayout filtering, and the
 * useModules hook all derive their behaviour from this registry.
 */

export type ModuleKey =
  | "bpm"
  | "ppm"
  | "grc"
  | "rwf"
  | "visualfirst"
  | "turbolens";

export interface ModuleDef {
  /** Unique module identifier — must match the nav item labelKey and common.json `modules.*` key. */
  key: ModuleKey;
  /** Material Symbol icon name shown in the disabled gate placeholder. */
  icon: string;
  /** Primary frontend route for this module. */
  navPath: string;
  /** Admin settings route / tab where the module can be enabled. */
  settingsTab: string;
  /** Whether the module defaults to enabled when the backend has no explicit value stored. */
  defaultEnabled: boolean;
  /**
   * Key in the /settings/bootstrap response that carries this module's enabled state.
   * Must match the snake_case field name returned by the backend.
   */
  bootstrapKey: string;
  /**
   * Backend settings endpoint path (relative to /api/v1).
   * Used as a fallback individual GET when bootstrap is unavailable.
   */
  settingsEndpoint: string;
}

/**
 * Ordered list of all optional feature modules.
 * Order here only matters for documentation — nav ordering comes from AppLayout.
 */
export const MODULE_REGISTRY: readonly ModuleDef[] = [
  {
    key: "bpm",
    icon: "route",
    navPath: "/bpm",
    settingsTab: "/admin/settings?tab=bpm",
    defaultEnabled: true,
    bootstrapKey: "bpm_enabled",
    settingsEndpoint: "/settings/bpm-enabled",
  },
  {
    key: "ppm",
    icon: "view_timeline",
    navPath: "/ppm",
    settingsTab: "/admin/settings?tab=ppm",
    defaultEnabled: false,
    bootstrapKey: "ppm_enabled",
    settingsEndpoint: "/settings/ppm-enabled",
  },
  {
    key: "grc",
    icon: "policy",
    navPath: "/grc",
    settingsTab: "/admin/settings",
    defaultEnabled: true,
    bootstrapKey: "grc_enabled",
    settingsEndpoint: "/settings/grc-enabled",
  },
  {
    key: "rwf",
    icon: "account_tree",
    navPath: "/rwf",
    settingsTab: "/admin/settings?tab=rwf",
    defaultEnabled: false,
    bootstrapKey: "rwf_enabled",
    settingsEndpoint: "/settings/rwf-enabled",
  },
  {
    key: "visualfirst",
    icon: "layers",
    navPath: "/visualfirst",
    settingsTab: "/admin/settings",
    defaultEnabled: true,
    bootstrapKey: "visualfirst_enabled",
    settingsEndpoint: "/settings/visualfirst-enabled",
  },
  {
    key: "turbolens",
    icon: "psychology",
    navPath: "/turbolens",
    settingsTab: "/admin/settings?tab=turbolens",
    defaultEnabled: true,
    bootstrapKey: "turbolens_enabled",
    settingsEndpoint: "/settings/turbolens-enabled",
  },
] as const;

/** Fast O(1) lookup by key. */
export const MODULE_MAP = Object.fromEntries(
  MODULE_REGISTRY.map((m) => [m.key, m]),
) as Record<ModuleKey, ModuleDef>;
