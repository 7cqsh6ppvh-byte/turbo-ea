/**
 * usePpmEnabled — tests for the backward-compat wrapper around useModules().
 *
 * The hook no longer makes individual API calls; module state is managed
 * centrally by useModules / primeBootstrap. These tests verify the delegate
 * contract: the hook reflects what useModules reports and `invalidatePpm`
 * propagates updates back to the shared module cache.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Reset all module state between tests so the module-level cache doesn't leak.
beforeEach(() => {
  vi.resetModules();
});

describe("usePpmEnabled", () => {
  it("returns the default enabled state before any prime", async () => {
    const { usePpmEnabled } = await import("./usePpmEnabled");
    const { result } = renderHook(() => usePpmEnabled());
    // ppm defaultEnabled = false per MODULE_REGISTRY
    expect(result.current.ppmEnabled).toBe(false);
  });

  it("reflects updated state after invalidatePpm(true)", async () => {
    const { usePpmEnabled } = await import("./usePpmEnabled");
    const { result } = renderHook(() => usePpmEnabled());

    expect(result.current.ppmEnabled).toBe(false);

    act(() => {
      result.current.invalidatePpm(true);
    });

    expect(result.current.ppmEnabled).toBe(true);
  });

  it("reflects updated state after invalidatePpm(false)", async () => {
    const { usePpmEnabled } = await import("./usePpmEnabled");
    const { primeModuleState } = await import("./useModules");
    const { result } = renderHook(() => usePpmEnabled());

    // Prime to true first
    act(() => {
      primeModuleState({ ppm: true });
    });
    expect(result.current.ppmEnabled).toBe(true);

    // Then disable
    act(() => {
      result.current.invalidatePpm(false);
    });
    expect(result.current.ppmEnabled).toBe(false);
  });

  it("calling invalidatePpm() with no args is a no-op", async () => {
    const { usePpmEnabled } = await import("./usePpmEnabled");
    const { result } = renderHook(() => usePpmEnabled());

    act(() => {
      result.current.invalidatePpm();
    });

    // State unchanged — no crash
    expect(result.current.ppmEnabled).toBe(false);
  });

  it("invalidatePpmEnabled module-level function primes the cache", async () => {
    const { usePpmEnabled, invalidatePpmEnabled } = await import("./usePpmEnabled");

    act(() => {
      invalidatePpmEnabled(true);
    });

    const { result } = renderHook(() => usePpmEnabled());
    expect(result.current.ppmEnabled).toBe(true);
  });
});
