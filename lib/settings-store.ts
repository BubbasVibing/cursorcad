import type { CadSettings } from "@/lib/types";

const STORAGE_KEY = "cadoncrack-settings";

export const DEFAULT_SETTINGS: CadSettings = {
  unitSystem: "mm",
  gridDensity: 20,
  defaultSegments: 32,
  exportFormat: "stl",
  snapToGrid: false,
  showGrid: true,
};

export function loadSettings(): CadSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: CadSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    console.warn("[settings-store] Failed to save settings");
  }
}
