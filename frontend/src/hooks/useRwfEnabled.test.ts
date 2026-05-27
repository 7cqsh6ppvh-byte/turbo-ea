/**
 * useRwfEnabled — tests for the backward-compat wrapper around useModules().
 *
 * The hook no longer makes individual API calls; module state is managed
 * centrally by useModules / primeBootstrap. These tests verify the delegate
 * contract: the hook reflects what useModules reports and `invalidateRwf`
 * propagates updates back to the shared module cache.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Reset all module state between tests so the module-level cache doesn't leak.
beforeEach(() => {
  vi.resetModules();
});

describe("useRwfEnabled", () => {
  it("returns the default enabled state before any prime", async () => {
    const { useRwfEnabled } = await import("./useRwfEnabled");
    const { result } = renderHook(() => useRwfEnabled());
    // rwf defaultEnabled = false per MODULE_REGISTRY
    expect(result.current.rwfEnabled).toBe(false);
  });

  it("reflects updated state after invalidateRwf(true)", async () => {
    const { useRwfEnabled } = await import("./useRwfEnabled");
    const { result } = renderHook(() => useRwfEnabled());

    expect(result.current.rwfEnabled).toBe(false);

    act(() => {
      result.current.invalidateRwf(true);
    });

    expect(result.current.rwfEnabled).toBe(true);
  });

  it("reflects updated state after invalidateRwf(false)", async () => {
    const { useRwfEnabled } = await import("./useRwfEnabled");
    const { primeModuleState } = await import("./useModules");
    const { result } = renderHook(() => useRwfEnabled());

    // Prime to true first
    act(() => {
      primeModuleState({ rwf: true });
    });
    expect(result.current.rwfEnabled).toBe(true);

    // Then disable
    act(() => {
      result.current.invalidateRwf(false);
    });
    expect(result.current.rwfEnabled).toBe(false);
  });

  it("calling invalidateRwf() with no args is a no-op", async () => {
    const { useRwfEnabled } = await import("./useRwfEnabled");
    const { result } = renderHook(() => useRwfEnabled());

    act(() => {
      result.current.invalidateRwf();
    });

    // State unchanged — no crash
    expect(result.current.rwfEnabled).toBe(false);
  });

  it("invalidateRwfEnabled module-level function primes the cache", async () => {
    const { useRwfEnabled, invalidateRwfEnabled } = await import("./useRwfEnabled");

    act(() => {
      invalidateRwfEnabled(true);
    });

    const { result } = renderHook(() => useRwfEnabled());
    expect(result.current.rwfEnabled).toBe(true);
  });
});
