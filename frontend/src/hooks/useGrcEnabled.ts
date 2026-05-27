/**
 * useGrcEnabled — backward-compatible wrapper around useModules().
 *
 * New code should prefer:
 *   const { isEnabled } = useModules();
 *   isEnabled("grc")
 */
import { useCallback } from "react";
import { useModules, setModuleEnabled, primeModuleState } from "@/hooks/useModules";

export function invalidateGrcEnabled(v: boolean) {
  primeModuleState({ grc: v });
}

export function useGrcEnabled() {
  const { isEnabled, isLoaded } = useModules();

  const invalidate = useCallback((newVal?: boolean) => {
    if (newVal !== undefined) {
      setModuleEnabled("grc", newVal);
    }
  }, []);

  return {
    grcEnabled: isEnabled("grc"),
    grcLoaded: isLoaded("grc"),
    invalidateGrc: invalidate,
  };
}
