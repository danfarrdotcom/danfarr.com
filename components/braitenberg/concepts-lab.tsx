'use client';

import { useMemo, useState } from 'react';

import { ControlRow, RangeControl } from './control-row';

type ConceptsLabVariant = 'boundary' | 'prototype' | 'sandbox';

type ConceptsLabProps = {
  variant: ConceptsLabVariant;
};

const points = [
  [0.18, 0.22],
  [0.24, 0.34],
  [0.32, 0.72],
  [0.39, 0.58],
  [0.44, 0.24],
  [0.52, 0.78],
  [0.58, 0.35],
  [0.64, 0.62],
  [0.72, 0.24],
  [0.8, 0.56],
] as const;

export default function ConceptsLab({ variant }: ConceptsLabProps) {
  const [leftBias, setLeftBias] = useState(0.28);
  const [rightBias, setRightBias] = useState(0.72);
  const [sharpness, setSharpness] = useState(
    variant === 'prototype' ? 0.22 : 0.32
  );

  const classified = useMemo(
    () =>
      points.map(([x, y]) => {
        const leftDistance = Math.hypot(x - leftBias, y - 0.42);
        const rightDistance = Math.hypot(x - rightBias, y - 0.58);
        return {
          x,
          y,
          left: leftDistance * (1 + sharpness),
          right: rightDistance,
          category: leftDistance * (1 + sharpness) <= rightDistance ? 'A' : 'B',
        };
      }),
    [leftBias, rightBias, sharpness]
  );

  return (
    <div>
      <svg
        aria-label="Concept space"
        className="block h-auto w-full"
        viewBox="0 0 280 160"
      >
        <rect fill="#fff" height="160" width="280" />
        <rect
          fill="none"
          height="112"
          stroke="rgba(24,24,24,0.24)"
          strokeWidth="1"
          width="224"
          x="28"
          y="22"
        />
        <circle
          cx={28 + leftBias * 224}
          cy={22 + 0.42 * 112}
          fill="#fff"
          r="7"
          stroke="rgba(24,24,24,0.92)"
          strokeWidth="1"
        />
        <text x={23 + leftBias * 224} y={28 + 0.42 * 112} fontSize="10">
          A
        </text>
        <circle
          cx={28 + rightBias * 224}
          cy={22 + 0.58 * 112}
          fill="rgba(24,24,24,0.92)"
          r="7"
          stroke="rgba(24,24,24,0.92)"
          strokeWidth="1"
        />
        <text x={23 + rightBias * 224} y={28 + 0.58 * 112} fontSize="10" fill="#fff">
          B
        </text>
        {classified.map((point, index) =>
          point.category === 'A' ? (
            <circle
              cx={28 + point.x * 224}
              cy={22 + point.y * 112}
              fill="#fff"
              key={index}
              r="4"
              stroke="rgba(24,24,24,0.92)"
              strokeWidth="1"
            />
          ) : (
            <rect
              fill="rgba(24,24,24,0.92)"
              height="8"
              key={index}
              stroke="rgba(24,24,24,0.92)"
              strokeWidth="1"
              width="8"
              x={24 + point.x * 224}
              y={18 + point.y * 112}
            />
          )
        )}
      </svg>

      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        Concepts can be treated as regions of selective response before they
        become explicit symbols. Move the prototypes and the categories move
        with them.
      </p>

      <ControlRow>
        <RangeControl
          label="Prototype A"
          max={0.48}
          min={0.1}
          onChange={setLeftBias}
          step={0.01}
          value={leftBias}
        />
        <RangeControl
          label="Prototype B"
          max={0.9}
          min={0.52}
          onChange={setRightBias}
          step={0.01}
          value={rightBias}
        />
        {variant !== 'boundary' ? (
          <RangeControl
            label="Sharpness"
            max={0.6}
            min={0}
            onChange={setSharpness}
            step={0.01}
            value={sharpness}
          />
        ) : null}
      </ControlRow>
    </div>
  );
}
