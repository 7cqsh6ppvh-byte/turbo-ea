/**
 * useModules — unified module-state singleton.
 *
 * Replaces the N separate use{Module}Enabled hooks with a single cache that
 * holds the enabled/disabled state for every optional feature module.
 *
 * Inflight-promise pattern (same as useCurrency, useBpmEnabled):
 *   _cache  — current known state (may be partial while bootstrap is in flight)
 *   _inflight — deduplicated in-flight fetch (prevents duplicate GETs on
 *               simultaneous first-mount subscribers)
 *   _listeners — subscriber set notified on every state change
 *
 * Usage:
 *   const { isEnabled, isLoaded } = useModules();
 *   if (!isLoaded("rwf")) return <Spinner />;
 *   if (!isEnabled("rwf")) return <Disabled />;
 *
 * Bootstrap priming (called once after login):
 *   import { primeModuleState } from "@/hooks/useModules";
 *   primeModuleState({ bpm: true, ppm: false, grc: true, ... });
 *
 * Admin settings toggle (after a PATCH response):
 *   import { setModuleEnabled } from "@/hooks/useModules";
 *   setModuleEnabled("rwf", true);
 */

import { useState, useEffect, useCallback } from "react";
import { api } from "@/api/client";
import { MODULE_REGISTRY, MODULE_MAP, type ModuleKey } from "@/config/modules";

// ─── Module-level singleton state ────────────────────────────────────────────

/** Enabled state for each module that has been fetched or primed. */
let _cache: Partial<Record<ModuleKey, boolean>> = {};
/** Inflight fallback-fetch promise (started when bootstrap didn't cover a key). */
let _inflight: Partial<Record<ModuleKey, Promise<void>>> = {};
/** Subscriber set — notified on every cache update. */
let _listeners: Array<(snapshot: Partial<Record<ModuleKey, boolean>>) => void> = [];

function _notify() {
  const snapshot = { ..._cache };
  _listeners.forEach((fn) => fn(snapshot));
}

// ─── Public priming / update API (called from outside hooks) ─────────────────

/**
 * Prime one or more module states from the bootstrap response or after a PATCH.
 * Accepts a plain object mapping ModuleKey → boolean; unknown keys are ignored.
 */
export function primeModuleState(updates: Partial<Record<string, boolean>>) {
  let changed = false;
  for (const [k, v] of Object.entries(updates)) {
    if (k in MODULE_MAP && _cache[k as ModuleKey] !== v) {
      _cache[k as ModuleKey] = v as boolean;
      changed = true;
    }
  }
  if (changed) _notify();
}

/**
 * Update a single module's enabled state (e.g. after an admin PATCH response).
 * Also cancels any in-flight individual fetch for that module.
 */
export function setModuleEnabled(key: ModuleKey, enabled: boolean) {
  _cache[key] = enabled;
  delete _inflight[key];
  _notify();
}

/**
 * Reset the entire cache — called on logout so the next session re-fetches.
 */
export function resetModuleCache() {
  _cache = {};
  _inflight = {};
  // Don't notify listeners — they'll pick up the new state on next mount.
}

// ─── Internal fetch fallback ─────────────────────────────────────────────────

/** Fetch a single module's state from its dedicated settings endpoint. */
function _fetchModule(key: ModuleKey): Promise<void> {
  if (_inflight[key]) return _inflight[key]!;
  const def = MODULE_MAP[key];
  const p = (async () => {
    try {
      const res = await api.get<{ enabled: boolean }>(def.settingsEndpoint);
      _cache[key] = res.enabled;
      _notify();
    } catch {
      // Default on failure — don't leave key absent from cache forever
      if (!(_cache[key] !== undefined)) {
        _cache[key] = def.defaultEnabled;
        _notify();
      }
    }
  })().finally(() => {
    delete _inflight[key];
  });
  _inflight[key] = p;
  return p;
}

/** Ensure all registered modules are present in cache, fetching missing ones. */
function _ensureAllLoaded() {
  for (const mod of MODULE_REGISTRY) {
    if (!(_cache[mod.key] !== undefined)) {
      _fetchModule(mod.key);
    }
  }
}

// ─── React hook ──────────────────────────────────────────────────────────────

export interface UseModulesReturn {
  /** True if this module is enabled (falls back to ModuleDef.defaultEnabled until loaded). */
  isEnabled: (key: ModuleKey) => boolean;
  /** True once the module's state has been fetched or primed from bootstrap. */
  isLoaded: (key: ModuleKey) => boolean;
  /**
   * Returns { enabled, loaded } for a specific module — convenient for
   * components that only care about one module (mirrors the old hook shape).
   */
  moduleState: (key: ModuleKey) => { enabled: boolean; loaded: boolean };
}

export function useModules(): UseModulesReturn {
  const [snapshot, setSnapshot] = useState<Partial<Record<ModuleKey, boolean>>>({ ..._cache });

  useEffect(() => {
    const listener = (snap: Partial<Record<ModuleKey, boolean>>) => {
      setSnapshot({ ...snap });
    };
    _listeners.push(listener);

    // Trigger fetches for any modules not yet in cache
    _ensureAllLoaded();

    // Sync snapshot immediately in case cache was primed before mount
    setSnapshot({ ..._cache });

    return () => {
      _listeners = _listeners.filter((fn) => fn !== listener);
    };
  }, []);

  const isEnabled = useCallback(
    (key: ModuleKey) => snapshot[key] ?? MODULE_MAP[key].defaultEnabled,
    [snapshot],
  );

  const isLoaded = useCallback(
    (key: ModuleKey) => key in snapshot,
    [snapshot],
  );

  const moduleState = useCallback(
    (key: ModuleKey) => ({
      enabled: snapshot[key] ?? MODULE_MAP[key].defaultEnabled,
      loaded: key in snapshot,
    }),
    [snapshot],
  );

  return { isEnabled, isLoaded, moduleState };
}

// ─── Backward-compat helpers ─────────────────────────────────────────────────
// These thin wrappers let existing per-module consumers (CardDetailContent,
// tests, etc.) continue working without modification.

/** @deprecated Use useModules().isEnabled("bpm") instead. */
export function useBpmEnabledCompat() {
  const { isEnabled, isLoaded } = useModules();
  const setEnabled = useCallback((v: boolean) => setModuleEnabled("bpm", v), []);
  return { bpmEnabled: isEnabled("bpm"), bpmLoaded: isLoaded("bpm"), setBpmEnabled: setEnabled };
}

/** @deprecated Use useModules().isEnabled("ppm") instead. */
export function usePpmEnabledCompat() {
  const { isEnabled, isLoaded } = useModules();
  const setEnabled = useCallback((v: boolean) => setModuleEnabled("ppm", v), []);
  return { ppmEnabled: isEnabled("ppm"), ppmLoaded: isLoaded("ppm"), setPpmEnabled: setEnabled };
}

/** @deprecated Use useModules().isEnabled("grc") instead. */
export function useGrcEnabledCompat() {
  const { isEnabled, isLoaded } = useModules();
  const setEnabled = useCallback((v: boolean) => setModuleEnabled("grc", v), []);
  return { grcEnabled: isEnabled("grc"), grcLoaded: isLoaded("grc"), setGrcEnabled: setEnabled };
}

/** @deprecated Use useModules().isEnabled("rwf") instead. */
export function useRwfEnabledCompat() {
  const { isEnabled, isLoaded } = useModules();
  const setEnabled = useCallback((v: boolean) => setModuleEnabled("rwf", v), []);
  return { rwfEnabled: isEnabled("rwf"), rwfLoaded: isLoaded("rwf"), setRwfEnabled: setEnabled };
}

/** @deprecated Use useModules().isEnabled("visualfirst") instead. */
export function useVisualFirstEnabledCompat() {
  const { isEnabled, isLoaded } = useModules();
  const setEnabled = useCallback((v: boolean) => setModuleEnabled("visualfirst", v), []);
  return {
    visualFirstEnabled: isEnabled("visualfirst"),
    visualFirstLoaded: isLoaded("visualfirst"),
    setVisualFirstEnabled: setEnabled,
  };
}
