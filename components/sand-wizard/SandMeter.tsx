interface SandMeterProps {
  value: number;   // 0–1000
  max: number;     // 1000
}

export default function SandMeter({ value, max }: SandMeterProps) {
  const pct = value / max;
  const filled = Math.round(pct * 10);
  const empty = 10 - filled;

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-amber-300 select-none">
      <span className="text-amber-500">SAND</span>
      <span className="tracking-wider">
        {'≈'.repeat(filled)}
        {'░'.repeat(empty)}
      </span>
      <span className="text-amber-600">{Math.floor(value)}</span>
    </div>
  );
}
