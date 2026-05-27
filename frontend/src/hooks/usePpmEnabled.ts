/**
 * usePpmEnabled — backward-compatible wrapper around useModules().
 *
 * New code should prefer:
 *   const { isEnabled } = useModules();
 *   isEnabled("ppm")
 */
import { useCallback } from "react";
import { useModules, setModuleEnabled, primeModuleState } from "@/hooks/useModules";

export function invalidatePpmEnabled(v: boolean) {
  primeModuleState({ ppm: v });
}

export function usePpmEnabled() {
  const { isEnabled, isLoaded } = useModules();

  const invalidate = useCallback((newVal?: boolean) => {
    if (newVal !== undefined) {
      setModuleEnabled("ppm", newVal);
    }
  }, []);

  return {
    ppmEnabled: isEnabled("ppm"),
    ppmLoaded: isLoaded("ppm"),
    invalidatePpm: invalidate,
  };
}
