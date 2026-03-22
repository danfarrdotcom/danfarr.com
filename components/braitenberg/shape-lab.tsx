'use client';

import { useMemo, useState } from 'react';

import { ControlRow, RangeControl, ToggleChip } from './control-row';

type ShapeLabVariant = 'scan' | 'compare' | 'sandbox';
type ShapeKind = 'circle' | 'square' | 'triangle';

type ShapeLabProps = {
  variant: ShapeLabVariant;
};

function normalizedWidth(shape: ShapeKind, x: number) {
  const offset = Math.abs(x - 0.5) * 2;

  if (shape === 'circle') {
    return offset > 1 ? 0 : Math.sqrt(1 - offset ** 2);
  }

  if (shape === 'square') {
    return offset > 1 ? 0 : 1;
  }

  return Math.max(0, 1 - offset);
}

function tracePoints(shape: ShapeKind) {
  return Array.from({ length: 48 }, (_, index) => {
    const x = index / 47;
    const width = normalizedWidth(shape, x);
    return `${24 + x * 120},${132 - width * 78}`;
  }).join(' ');
}

export default function ShapeLab({ variant }: ShapeLabProps) {
  const [shape, setShape] = useState<ShapeKind>('circle');
  const [scan, setScan] = useState(0.46);
  const [aperture, setAperture] = useState(0.06);

  const signature = useMemo(() => tracePoints(shape), [shape]);
  const width = normalizedWidth(shape, scan);

  return (
    <div>
      <svg aria-label="Shape scan" className="block h-auto w-full" viewBox="0 0 320 160">
        <rect fill="#fff" height="160" width="320" />
        <rect
          fill="none"
          height="110"
          stroke="rgba(24,24,24,0.24)"
          strokeWidth="1"
          width="120"
          x="24"
          y="24"
        />
        <rect
          fill="none"
          height="110"
          stroke="rgba(24,24,24,0.24)"
          strokeWidth="1"
          width="128"
          x="168"
          y="24"
        />
        {shape === 'circle' ? (
          <circle
            cx="84"
            cy="79"
            fill="none"
            r="42"
            stroke="rgba(24,24,24,0.92)"
            strokeWidth="1.2"
          />
        ) : null}
        {shape === 'square' ? (
          <rect
            fill="none"
            height="84"
            stroke="rgba(24,24,24,0.92)"
            strokeWidth="1.2"
            width="84"
            x="42"
            y="37"
          />
        ) : null}
        {shape === 'triangle' ? (
          <polygon
            fill="none"
            points="84,34 40,122 128,122"
            stroke="rgba(24,24,24,0.92)"
            strokeWidth="1.2"
          />
        ) : null}
        <line
          stroke="rgba(24,24,24,0.4)"
          strokeDasharray="3 4"
          strokeWidth="1"
          x1={24 + scan * 120}
          x2={24 + scan * 120}
          y1="24"
          y2="134"
        />
        <rect
          fill="rgba(24,24,24,0.12)"
          height={width * 84}
          width={Math.max(2, aperture * 100)}
          x={24 + scan * 120 - (Math.max(2, aperture * 100) / 2)}
          y={79 - (width * 42)}
        />
        <polyline
          fill="none"
          points={signature}
          stroke="rgba(24,24,24,0.92)"
          strokeWidth="1.2"
          transform="translate(144,0)"
        />
        <line
          stroke="rgba(24,24,24,0.36)"
          strokeDasharray="3 4"
          strokeWidth="1"
          x1={168 + scan * 120}
          x2={168 + scan * 120}
          y1="24"
          y2="134"
        />
      </svg>

      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        A shape can be represented by how sensor input changes across a scan,
        not just by a static picture. The right panel shows the signature that
        unfolds over the sweep.
      </p>

      <ControlRow>
        <ToggleChip
          active={shape === 'circle'}
          label="Circle"
          onClick={() => setShape('circle')}
        />
        <ToggleChip
          active={shape === 'square'}
          label="Square"
          onClick={() => setShape('square')}
        />
        <ToggleChip
          active={shape === 'triangle'}
          label="Triangle"
          onClick={() => setShape('triangle')}
        />
      </ControlRow>

      <ControlRow>
        <RangeControl
          label="Scan"
          max={1}
          min={0}
          onChange={setScan}
          step={0.01}
          value={scan}
        />
        {variant !== 'scan' ? (
          <RangeControl
            label="Aperture"
            max={0.16}
            min={0.02}
            onChange={setAperture}
            step={0.01}
            value={aperture}
          />
        ) : null}
      </ControlRow>
    </div>
  );
}
