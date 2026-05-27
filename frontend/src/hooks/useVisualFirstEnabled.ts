/**
 * useVisualFirstEnabled — backward-compatible wrapper around useModules().
 *
 * New code should prefer:
 *   const { isEnabled } = useModules();
 *   isEnabled("visualfirst")
 */
import { useCallback } from "react";
import { useModules, setModuleEnabled, primeModuleState } from "@/hooks/useModules";

export function invalidateVisualFirstEnabled(v: boolean) {
  primeModuleState({ visualfirst: v });
}

export function useVisualFirstEnabled() {
  const { isEnabled, isLoaded } = useModules();

  const invalidate = useCallback((newVal?: boolean) => {
    if (newVal !== undefined) {
      setModuleEnabled("visualfirst", newVal);
    }
  }, []);

  return {
    visualFirstEnabled: isEnabled("visualfirst"),
    visualFirstLoaded: isLoaded("visualfirst"),
    invalidateVisualFirst: invalidate,
  };
}
