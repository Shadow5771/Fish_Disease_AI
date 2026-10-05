import type { ModelName } from "../types/screening";

/** Restrained identifiers for overlay and cards — not a rainbow legend. */
export const MODEL_ACCENT: Record<ModelName, string> = {
  YOLO11n: "#7ebfd4",
  YOLO11s: "#9aafc7",
  YOLO26n: "#b7c4b8",
};

export const MODEL_ACCENT_SOFT: Record<ModelName, string> = {
  YOLO11n: "rgba(126, 191, 212, 0.18)",
  YOLO11s: "rgba(154, 175, 199, 0.16)",
  YOLO26n: "rgba(183, 196, 184, 0.16)",
};

export function formatPercent(value: number | null): string {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${Math.round(ms)} ms`;
}
