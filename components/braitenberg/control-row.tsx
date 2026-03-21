'use client';

import type { ChangeEvent, MouseEventHandler, ReactNode } from 'react';

type ControlRowProps = {
  children: ReactNode;
};

type RangeControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueLabel?: string;
};

type ToggleChipProps = {
  active: boolean;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

type ActionButtonProps = {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function ControlRow({ children }: ControlRowProps) {
  return <div className="mt-4 flex flex-wrap gap-2">{children}</div>;
}

export function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueLabel,
}: RangeControlProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(event.target.value));
  };

  return (
    <label className="min-w-[180px] px-3 py-2">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-500">
        <span>{label}</span>
        <span>{valueLabel ?? value.toFixed(2)}</span>
      </div>
      <input
        className="w-full accent-stone-700"
        max={max}
        min={min}
        onChange={handleChange}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}

export function ToggleChip({ active, label, onClick }: ToggleChipProps) {
  return (
    <button
      className={`border px-3 py-2 font-sans rounded-2xl text-sm transition-colors ${
        active
          ? 'border-stone-900 bg-stone-900 text-[#fbfaf4]'
          : 'border-stone-300 bg-transparent text-stone-600 hover:border-stone-400'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function ActionButton({ children, onClick }: ActionButtonProps) {
  return (
    <button
      className="border border-stone-300 rounded-2xl bg-transparent px-3 py-2 text-md font-sans text-md uppercase text-stone-700 transition-colors hover:border-stone-400"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
