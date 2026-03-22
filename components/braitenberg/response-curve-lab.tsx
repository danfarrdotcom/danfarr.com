'use client';

import { useMemo, useState } from 'react';

import { ControlRow, RangeControl, ToggleChip } from './control-row';

type ResponseCurveLabVariant = 'profiles' | 'band' | 'sandbox';
type CurveProfile = 'broad' | 'narrow' | 'averse';

type ResponseCurveLabProps = {
  variant: ResponseCurveLabVariant;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function curveValue(
  x: number,
  profile: CurveProfile,
  center: number,
  width: number,
  floor: number,
  invert: boolean
) {
  const distance = (x - center) / Math.max(width, 0.08);
  let value = Math.exp(-(distance ** 2) * (profile === 'narrow' ? 5 : 2.1));

  if (profile === 'averse') {
    value = 1 - value;
  }

  value = floor + value * (1 - floor);

  if (invert) {
    value = 1 - value;
  }

  return clamp(value);
}

function curvePath(
  profile: CurveProfile,
  center: number,
  width: number,
  floor: number,
  invert: boolean
) {
  const points: string[] = [];

  for (let index = 0; index <= 64; index += 1) {
    const x = index / 64;
    const y = curveValue(x, profile, center, width, floor, invert);
    points.push(`${x * 280},${120 - y * 92}`);
  }

  return points.join(' ');
}

export default function ResponseCurveLab({ variant }: ResponseCurveLabProps) {
  const [profile, setProfile] = useState<CurveProfile>('broad');
  const [center, setCenter] = useState(0.6);
  const [width, setWidth] = useState(variant === 'band' ? 0.18 : 0.28);
  const [floor, setFloor] = useState(0.08);
  const [signal, setSignal] = useState(0.62);
  const [invert, setInvert] = useState(false);

  const output = useMemo(
    () => curveValue(signal, profile, center, width, floor, invert),
    [center, floor, invert, profile, signal, width]
  );

  const path = useMemo(
    () => curvePath(profile, center, width, floor, invert),
    [center, floor, invert, profile, width]
  );

  return (
    <div>
      <svg
        aria-label="Response curve"
        className="block h-auto w-full"
        viewBox="0 0 280 140"
      >
        <rect fill="#fff" height="140" width="280" />
        <line
          stroke="rgba(24,24,24,0.24)"
          strokeWidth="1"
          x1="24"
          x2="24"
          y1="20"
          y2="120"
        />
        <line
          stroke="rgba(24,24,24,0.24)"
          strokeWidth="1"
          x1="24"
          x2="260"
          y1="120"
          y2="120"
        />
        <polyline
          fill="none"
          points={path}
          stroke="rgba(24,24,24,0.92)"
          strokeWidth="1.2"
          transform="translate(24,0)"
        />
        <line
          stroke="rgba(24,24,24,0.36)"
          strokeDasharray="3 4"
          strokeWidth="1"
          x1={24 + signal * 280}
          x2={24 + signal * 280}
          y1="20"
          y2="120"
        />
        <circle
          cx={24 + signal * 280}
          cy={120 - output * 92}
          fill="#fff"
          r="4"
          stroke="rgba(24,24,24,0.92)"
          strokeWidth="1"
        />
      </svg>

      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        Signal <span className="tabular-nums">{signal.toFixed(2)}</span>{' '}
        produces output <span className="tabular-nums">{output.toFixed(2)}</span>.
        In this chapter, taste lives in the shape of that curve.
      </p>

      <ControlRow>
        <ToggleChip
          active={profile === 'broad'}
          label="Broad"
          onClick={() => setProfile('broad')}
        />
        <ToggleChip
          active={profile === 'narrow'}
          label="Narrow"
          onClick={() => setProfile('narrow')}
        />
        <ToggleChip
          active={profile === 'averse'}
          label="Averse"
          onClick={() => setProfile('averse')}
        />
        {variant === 'sandbox' ? (
          <ToggleChip
            active={invert}
            label="Invert"
            onClick={() => setInvert((value) => !value)}
          />
        ) : null}
      </ControlRow>

      <ControlRow>
        <RangeControl
          label="Signal"
          max={1}
          min={0}
          onChange={setSignal}
          step={0.01}
          value={signal}
        />
        <RangeControl
          label="Center"
          max={0.9}
          min={0.1}
          onChange={setCenter}
          step={0.01}
          value={center}
        />
        <RangeControl
          label="Width"
          max={0.45}
          min={0.08}
          onChange={setWidth}
          step={0.01}
          value={width}
        />
        {variant === 'sandbox' ? (
          <RangeControl
            label="Floor"
            max={0.4}
            min={0}
            onChange={setFloor}
            step={0.01}
            value={floor}
          />
        ) : null}
      </ControlRow>
    </div>
  );
}
