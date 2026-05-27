/** Shared helpers for the Release Workflow module. */
import type { BranchStatus } from "./rwf.types";

export const STATUS_COLOR: Record<BranchStatus, string> = {
  open: "#1976d2",
  in_review: "#ed6c02",
  approved: "#2e7d32",
  merged: "#6a1b9a",
  rejected: "#c62828",
  abandoned: "#757575",
  rolled_back: "#5d4037",
};

export const STATUS_BG: Record<BranchStatus, string> = {
  open: "#e3f2fd",
  in_review: "#fff3e0",
  approved: "#e8f5e9",
  merged: "#f3e5f5",
  rejected: "#ffebee",
  abandoned: "#f5f5f5",
  rolled_back: "#efebe9",
};

export function fmt(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function fmtDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
