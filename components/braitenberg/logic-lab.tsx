'use client';

import { useMemo, useState } from 'react';

import { ControlRow, RangeControl, ToggleChip } from './control-row';

type LogicLabVariant = 'threshold' | 'gates' | 'sandbox';
type GateKind = 'AND' | 'OR' | 'XOR';

type LogicLabProps = {
  variant: LogicLabVariant;
};

function gateOutput(gate: GateKind, a: boolean, b: boolean) {
  if (gate === 'AND') {
    return a && b;
  }

  if (gate === 'OR') {
    return a || b;
  }

  return a !== b;
}

export default function LogicLab({ variant }: LogicLabProps) {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [gate, setGate] = useState<GateKind>('AND');
  const [weightA, setWeightA] = useState(0.8);
  const [weightB, setWeightB] = useState(0.55);
  const [threshold, setThreshold] = useState(0.9);

  const weighted = (a ? weightA : 0) + (b ? weightB : 0);
  const thresholdOn = weighted >= threshold;
  const gateOn = gateOutput(gate, a, b);

  const truthRows = useMemo(
    () =>
      [
        [false, false],
        [true, false],
        [false, true],
        [true, true],
      ] as const,
    []
  );

  return (
    <div>
      <svg aria-label="Logic plate" className="block h-auto w-full" viewBox="0 0 280 118">
        <rect fill="#fff" height="118" width="280" />
        <rect
          fill="none"
          height="68"
          stroke="rgba(24,24,24,0.88)"
          strokeWidth="1"
          width="84"
          x="28"
          y="24"
        />
        <text x="45" y="44" fontSize="11" fill="rgba(24,24,24,0.88)">
          INPUTS
        </text>
        <text x="45" y="64" fontSize="12" fill="rgba(24,24,24,0.88)">
          A {a ? '1' : '0'}
        </text>
        <text x="45" y="82" fontSize="12" fill="rgba(24,24,24,0.88)">
          B {b ? '1' : '0'}
        </text>
        <rect
          fill="none"
          height="68"
          stroke="rgba(24,24,24,0.88)"
          strokeWidth="1"
          width="84"
          x="146"
          y="24"
        />
        <text x="162" y="44" fontSize="11" fill="rgba(24,24,24,0.88)">
          OUTPUT
        </text>
        <text x="162" y="64" fontSize="12" fill="rgba(24,24,24,0.88)">
          Gate {gateOn ? '1' : '0'}
        </text>
        <text x="162" y="82" fontSize="12" fill="rgba(24,24,24,0.88)">
          Step {thresholdOn ? '1' : '0'}
        </text>
        <line
          stroke="rgba(24,24,24,0.7)"
          strokeWidth="1"
          x1="112"
          x2="146"
          y1="58"
          y2="58"
        />
      </svg>

      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        The same inputs can be read as a thresholded sum or as a discrete gate.
        That shift is where mechanism starts to look rule-like.
      </p>

      <ControlRow>
        <ToggleChip active={a} label="Input A" onClick={() => setA((v) => !v)} />
        <ToggleChip active={b} label="Input B" onClick={() => setB((v) => !v)} />
        {variant !== 'threshold' ? (
          <>
            <ToggleChip
              active={gate === 'AND'}
              label="AND"
              onClick={() => setGate('AND')}
            />
            <ToggleChip
              active={gate === 'OR'}
              label="OR"
              onClick={() => setGate('OR')}
            />
            <ToggleChip
              active={gate === 'XOR'}
              label="XOR"
              onClick={() => setGate('XOR')}
            />
          </>
        ) : null}
      </ControlRow>

      <ControlRow>
        <RangeControl
          label="Weight A"
          max={1.4}
          min={0}
          onChange={setWeightA}
          step={0.05}
          value={weightA}
        />
        <RangeControl
          label="Weight B"
          max={1.4}
          min={0}
          onChange={setWeightB}
          step={0.05}
          value={weightB}
        />
        <RangeControl
          label="Threshold"
          max={1.8}
          min={0.1}
          onChange={setThreshold}
          step={0.05}
          value={threshold}
        />
      </ControlRow>

      {variant !== 'threshold' ? (
        <div className="mt-4 border-t border-stone-300 pt-4 text-[0.95rem] leading-7 text-black">
          <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-x-3 text-[11px] uppercase tracking-[0.24em] text-stone-700">
            <span>A</span>
            <span>B</span>
            <span>{gate}</span>
            <span>Step</span>
          </div>
          <div className="mt-3 space-y-2">
            {truthRows.map(([rowA, rowB], index) => (
              <div
                className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-x-3 tabular-nums"
                key={index}
              >
                <span>{rowA ? 1 : 0}</span>
                <span>{rowB ? 1 : 0}</span>
                <span>{gateOutput(gate, rowA, rowB) ? 1 : 0}</span>
                <span>{(rowA ? weightA : 0) + (rowB ? weightB : 0) >= threshold ? 1 : 0}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
