/**
 * useGrcEnabled — module-level singleton that caches whether the GRC
 * (Governance, Risk, Compliance) module is enabled. Same pattern as
 * useBpmEnabled / usePpmEnabled.
 */
import { useState, useEffect, useCallback } from "react";
import { api } from "@/api/client";

let _cached: boolean | null = null;
let _inflight: Promise<void> | null = null;
let _listeners: Array<(v: boolean) => void> = [];

function _notify(v: boolean) {
  _cached = v;
  _listeners.forEach((fn) => fn(v));
}

/**
 * Prime the cache from outside the hook (e.g. /settings/bootstrap on app boot)
 * so first-mount consumers skip their own GET.
 */
export function invalidateGrcEnabled(v: boolean) {
  _notify(v);
}

function _fetch(): Promise<void> {
  if (_inflight) return _inflight;
  _inflight = (async () => {
    try {
      const res = await api.get<{ enabled: boolean }>("/settings/grc-enabled");
      _notify(res.enabled);
    } catch {
      // default to true if fetch fails
      if (_cached === null) _notify(true);
    }
  })().finally(() => {
    _inflight = null;
  });
  return _inflight;
}

export function useGrcEnabled() {
  const [enabled, setEnabled] = useState<boolean>(_cached ?? true);
  const [loaded, setLoaded] = useState<boolean>(_cached !== null);

  useEffect(() => {
    const listener = (v: boolean) => {
      setEnabled(v);
      setLoaded(true);
    };
    _listeners.push(listener);
    if (_cached === null) {
      _fetch();
    } else {
      setEnabled(_cached);
      setLoaded(true);
    }
    return () => {
      _listeners = _listeners.filter((fn) => fn !== listener);
    };
  }, []);

  const invalidate = useCallback((newVal?: boolean) => {
    if (newVal !== undefined) {
      _notify(newVal);
    } else {
      _cached = null;
      _fetch();
    }
  }, []);

  return { grcEnabled: enabled, grcLoaded: loaded, invalidateGrc: invalidate };
}
