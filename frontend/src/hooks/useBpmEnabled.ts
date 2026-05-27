/**
 * useBpmEnabled — backward-compatible wrapper around useModules().
 *
 * New code should prefer:
 *   const { isEnabled } = useModules();
 *   isEnabled("bpm")
 *
 * This wrapper keeps existing consumers (CardDetailContent, tests, etc.)
 * working without modification.
 */
import { useCallback } from "react";
import { useModules, setModuleEnabled, primeModuleState } from "@/hooks/useModules";

/**
 * Prime the BPM enabled state from outside the hook (e.g. from bootstrap).
 * Delegates to primeModuleState for consistency.
 */
export function invalidateBpmEnabled(v: boolean) {
  primeModuleState({ bpm: v });
}

export function useBpmEnabled() {
  const { isEnabled, isLoaded } = useModules();

  const invalidate = useCallback((newVal?: boolean) => {
    if (newVal !== undefined) {
      setModuleEnabled("bpm", newVal);
    }
  }, []);

  return {
    bpmEnabled: isEnabled("bpm"),
    bpmLoaded: isLoaded("bpm"),
    invalidateBpm: invalidate,
  };
}
