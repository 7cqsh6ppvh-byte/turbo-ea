import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/client";

let _cached: boolean | null = null;
let _inflight: Promise<void> | null = null;
let _listeners: Array<(v: boolean) => void> = [];

function _notify(v: boolean) {
  _cached = v;
  _listeners.forEach((fn) => fn(v));
}

export function invalidateGcpEnabled(v: boolean) {
  _notify(v);
}

function _fetch(): Promise<void> {
  if (_inflight) return _inflight;
  _inflight = (async () => {
    try {
      const res = await api.get<{ enabled: boolean }>("/settings/gcp-enabled");
      _notify(res.enabled);
    } catch {
      if (_cached === null) _notify(false);
    }
  })().finally(() => {
    _inflight = null;
  });
  return _inflight;
}

export function useGcpEnabled() {
  const [enabled, setEnabled] = useState<boolean>(_cached ?? false);
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

  return { gcpEnabled: enabled, gcpLoaded: loaded, invalidateGcp: invalidate };
}
