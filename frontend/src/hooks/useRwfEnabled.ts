/**
 * useRwfEnabled — backward-compatible wrapper around useModules().
 *
 * New code should prefer:
 *   const { isEnabled } = useModules();
 *   isEnabled("rwf")
 */
import { useCallback } from "react";
import { useModules, setModuleEnabled, primeModuleState } from "@/hooks/useModules";

export function invalidateRwfEnabled(v: boolean) {
  primeModuleState({ rwf: v });
}

export function useRwfEnabled() {
  const { isEnabled, isLoaded } = useModules();

  const invalidate = useCallback((newVal?: boolean) => {
    if (newVal !== undefined) {
      setModuleEnabled("rwf", newVal);
    }
  }, []);

  return {
    rwfEnabled: isEnabled("rwf"),
    rwfLoaded: isLoaded("rwf"),
    invalidateRwf: invalidate,
  };
}
