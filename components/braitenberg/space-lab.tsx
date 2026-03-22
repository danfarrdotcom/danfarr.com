'use client';

import { useMemo, useState } from 'react';

import { ControlRow, RangeControl } from './control-row';

type SpaceLabVariant = 'trace' | 'map' | 'sandbox';

type SpaceLabProps = {
  variant: SpaceLabVariant;
};

const pathPoints = Array.from({ length: 48 }, (_, index) => {
  const t = index / 47;
  return {
    x: 0.14 + 0.72 * t,
    y: 0.52 + Math.sin(t * Math.PI * 2.3) * 0.18,
  };
});

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export default function SpaceLab({ variant }: SpaceLabProps) {
  const [step, setStep] = useState(28);
  const [sensor, setSensor] = useState(0.18);
  const [memory, setMemory] = useState(0.65);

  const upto = pathPoints.slice(0, step + 1);
  const current = upto[upto.length - 1];

  const grid = useMemo(() => {
    const cells = Array.from({ length: 24 }, () => 0);

    upto.forEach((point, index) => {
      const x = clamp(point.x + Math.sin(index * 0.8) * sensor * 0.2);
      const y = clamp(point.y + Math.cos(index * 0.6) * sensor * 0.14);
      const column = Math.min(5, Math.floor(x * 6));
      const row = Math.min(3, Math.floor(y * 4));
      cells[row * 6 + column] += memory;
    });

    return cells;
  }, [memory, sensor, upto]);

  return (
    <div>
      <svg aria-label="Spatial plate" className="block h-auto w-full" viewBox="0 0 320 160">
        <rect fill="#fff" height="160" width="320" />
        <rect
          fill="none"
          height="110"
          stroke="rgba(24,24,24,0.24)"
          strokeWidth="1"
          width="138"
          x="24"
          y="24"
        />
        <rect
          fill="none"
          height="110"
          stroke="rgba(24,24,24,0.24)"
          strokeWidth="1"
          width="110"
          x="186"
          y="24"
        />
        <polyline
          fill="none"
          points={upto
            .map((point) => `${24 + point.x * 138},${24 + point.y * 110}`)
            .join(' ')}
          stroke="rgba(24,24,24,0.82)"
          strokeDasharray="3 4"
          strokeWidth="1.2"
        />
        <circle
          cx={24 + current.x * 138}
          cy={24 + current.y * 110}
          fill="#fff"
          r="5"
          stroke="rgba(24,24,24,0.92)"
          strokeWidth="1"
        />
        <circle
          cx={24 + current.x * 138}
          cy={24 + current.y * 110}
          fill="none"
          r={sensor * 52}
          stroke="rgba(24,24,24,0.24)"
          strokeDasharray="3 4"
          strokeWidth="1"
        />

        {grid.map((value, index) => {
          const row = Math.floor(index / 6);
          const column = index % 6;
          const opacity = Math.min(0.92, value / 6);

          return (
            <rect
              fill={`rgba(24,24,24,${opacity})`}
              height="24"
              key={index}
              stroke="rgba(24,24,24,0.18)"
              strokeWidth="1"
              width="18"
              x={192 + column * 18}
              y={30 + row * 24}
            />
          );
        })}
      </svg>

      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        A map can be implicit in accumulated sensorimotor traces. The body moves
        through the world on the left; a coarse internal occupancy picture
        appears on the right.
      </p>

      <ControlRow>
        <RangeControl
          label="Step"
          max={47}
          min={4}
          onChange={(value) => setStep(Math.round(value))}
          step={1}
          value={step}
        />
        <RangeControl
          label="Sensor"
          max={0.34}
          min={0.06}
          onChange={setSensor}
          step={0.01}
          value={sensor}
        />
        {variant !== 'trace' ? (
          <RangeControl
            label="Memory"
            max={1}
            min={0.2}
            onChange={setMemory}
            step={0.01}
            value={memory}
          />
        ) : null}
      </ControlRow>
    </div>
  );
}
