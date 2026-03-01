"use client";

import type { CadSettings } from "@/lib/types";

interface SettingsPanelProps {
  settings: CadSettings;
  onSettingsChange: (settings: CadSettings) => void;
}

function PillToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white/80">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            px-2.5 py-1 text-[11px] font-medium transition-all duration-150
            ${value === opt.value
              ? "bg-violet-500 text-white"
              : "text-gray-500 hover:text-violet-500"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative w-8 h-[18px] rounded-full transition-colors duration-200
        ${checked ? "bg-violet-500" : "bg-gray-200"}
      `}
    >
      <span
        className={`
          absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${checked ? "translate-x-[14px]" : "translate-x-[2px]"}
        `}
      />
    </button>
  );
}

function Stepper({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        className="
          flex h-6 w-6 items-center justify-center rounded-md
          bg-white/80 border border-gray-200 text-gray-500
          hover:text-violet-500 disabled:opacity-30
          text-xs font-bold transition-all duration-150
        "
      >
        -
      </button>
      <span className="min-w-[3ch] text-center text-xs font-mono text-gray-600">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        className="
          flex h-6 w-6 items-center justify-center rounded-md
          bg-white/80 border border-gray-200 text-gray-500
          hover:text-violet-500 disabled:opacity-30
          text-xs font-bold transition-all duration-150
        "
      >
        +
      </button>
    </div>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-gray-600">{label}</span>
      {children}
    </div>
  );
}

export default function SettingsPanel({
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  const update = (partial: Partial<CadSettings>) =>
    onSettingsChange({ ...settings, ...partial });

  return (
    <div className="px-3 py-2 space-y-0.5">
      <SettingRow label="Unit System">
        <PillToggle
          options={[
            { label: "mm", value: "mm" as const },
            { label: "cm", value: "cm" as const },
            { label: "in", value: "in" as const },
          ]}
          value={settings.unitSystem}
          onChange={(v) => update({ unitSystem: v })}
        />
      </SettingRow>

      <SettingRow label="Grid Density">
        <Stepper
          value={settings.gridDensity}
          min={10}
          max={100}
          step={5}
          onChange={(v) => update({ gridDensity: v })}
        />
      </SettingRow>

      <SettingRow label="Segments">
        <Stepper
          value={settings.defaultSegments}
          min={16}
          max={64}
          step={8}
          onChange={(v) => update({ defaultSegments: v })}
        />
      </SettingRow>

      <SettingRow label="Export Format">
        <PillToggle
          options={[
            { label: "STL", value: "stl" as const },
            { label: "3MF", value: "3mf" as const },
          ]}
          value={settings.exportFormat}
          onChange={(v) => update({ exportFormat: v })}
        />
      </SettingRow>

      <SettingRow label="Snap to Grid">
        <ToggleSwitch
          checked={settings.snapToGrid}
          onChange={(v) => update({ snapToGrid: v })}
        />
      </SettingRow>

      <SettingRow label="Show Grid">
        <ToggleSwitch
          checked={settings.showGrid}
          onChange={(v) => update({ showGrid: v })}
        />
      </SettingRow>
    </div>
  );
}
