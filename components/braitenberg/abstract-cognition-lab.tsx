'use client';

import { useMemo, useState } from 'react';

import { ActionButton, ControlRow, RangeControl, ToggleChip } from './control-row';

type AbstractMode =
  | 'ideas'
  | 'regularities'
  | 'trains'
  | 'foresight'
  | 'bias';

type AbstractVariant = 'simple' | 'sandbox';

type AbstractCognitionLabProps = {
  mode: AbstractMode;
  variant?: AbstractVariant;
};

const featurePools = {
  source: ['trace', 'gate', 'map', 'memory'],
  modifier: ['local', 'predictive', 'biased', 'composite'],
};

function IdeasView({ sandbox }: { sandbox: boolean }) {
  const [novelty, setNovelty] = useState(0.56);
  const [bias, setBias] = useState(0.44);

  const ideas = useMemo(
    () =>
      featurePools.source.flatMap((source, sIndex) =>
        featurePools.modifier.slice(0, sandbox ? 4 : 3).map((modifier, mIndex) => ({
          label: `${modifier} ${source}`,
          score: ((sIndex + 1) * novelty + (mIndex + 1) * bias) / 6,
        }))
      ),
    [bias, novelty, sandbox]
  );

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        {ideas.slice(0, sandbox ? 8 : 4).map((idea) => (
          <div className="border border-stone-300 p-3" key={idea.label}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-700">
              Candidate
            </p>
            <p className="mt-2 text-[1rem] leading-7 text-black">{idea.label}</p>
            <p className="mt-2 text-[0.92rem] leading-6 text-stone-700">
              novelty score {idea.score.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        New ideas can look like recombinations of existing fragments before they
        look like insight.
      </p>
      <ControlRow>
        <RangeControl
          label="Novelty"
          max={1}
          min={0}
          onChange={setNovelty}
          step={0.01}
          value={novelty}
        />
        <RangeControl
          label="Coherence"
          max={1}
          min={0}
          onChange={setBias}
          step={0.01}
          value={bias}
        />
      </ControlRow>
    </div>
  );
}

function RegularitiesView({ sandbox }: { sandbox: boolean }) {
  const [windowSize, setWindowSize] = useState(sandbox ? 4 : 3);
  const [noise, setNoise] = useState(0.12);
  const base = 'ABBABBABBABBABBA';
  const stream = base
    .split('')
    .map((char, index) =>
      sandbox && index % Math.max(3, Math.round(8 - noise * 20)) === 0
        ? char === 'A'
          ? 'B'
          : 'A'
        : char
    )
    .join('');

  const chunks = Array.from({ length: stream.length - windowSize + 1 }, (_, index) =>
    stream.slice(index, index + windowSize)
  );
  const winner =
    chunks.sort(
      (a, b) =>
        chunks.filter((value) => value === b).length -
        chunks.filter((value) => value === a).length
    )[0] ?? '';

  return (
    <div>
      <div className="border border-stone-300 p-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-700">
          Stream
        </p>
        <p className="mt-3 font-mono text-[1.05rem] tracking-[0.22em] text-black">
          {stream}
        </p>
        <p className="mt-4 text-[0.98rem] leading-7 text-black">
          dominant window: <span className="font-mono">{winner}</span>
        </p>
      </div>
      <ControlRow>
        <RangeControl
          label="Window"
          max={sandbox ? 6 : 5}
          min={2}
          onChange={(value) => setWindowSize(Math.round(value))}
          step={1}
          value={windowSize}
        />
        {sandbox ? (
          <RangeControl
            label="Noise"
            max={0.4}
            min={0}
            onChange={setNoise}
            step={0.01}
            value={noise}
          />
        ) : null}
      </ControlRow>
    </div>
  );
}

function TrainsView({ sandbox }: { sandbox: boolean }) {
  const [persistence, setPersistence] = useState(0.56);
  const [advance, setAdvance] = useState(4);
  const states = ['sense', 'hold', 'compare', 'shift', 'echo'];

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-5">
        {states.map((state, index) => {
          const active = Math.max(0, 1 - Math.abs(index - (advance % states.length)) * persistence);

          return (
            <div
              className="border border-stone-300 p-3"
              key={state}
              style={{ background: `rgba(24,24,24,${Math.min(0.88, active)})`, color: active > 0.45 ? '#fff' : '#111' }}
            >
              <p className="text-[11px] uppercase tracking-[0.24em]">
                State
              </p>
              <p className="mt-2 text-[1rem] leading-7">{state}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        Trains of thought can be modeled as persistent activation moving across
        a chain, not as a fully symbolic inner narration.
      </p>
      <ControlRow>
        <RangeControl
          label="Persistence"
          max={0.9}
          min={0.1}
          onChange={setPersistence}
          step={0.01}
          value={persistence}
        />
        <RangeControl
          label="Step"
          max={sandbox ? 12 : 8}
          min={0}
          onChange={(value) => setAdvance(Math.round(value))}
          step={1}
          value={advance}
        />
      </ControlRow>
    </div>
  );
}

function ForesightView({ sandbox }: { sandbox: boolean }) {
  const [horizon, setHorizon] = useState(sandbox ? 0.18 : 0.12);
  const [drag, setDrag] = useState(0.08);

  const actual = Array.from({ length: 50 }, (_, index) => {
    const t = index / 49;
    return `${24 + t * 248},${86 - Math.sin(t * Math.PI * 2) * 28}`;
  }).join(' ');

  const predicted = Array.from({ length: 50 }, (_, index) => {
    const t = index / 49;
    return `${24 + t * 248},${86 - Math.sin((t + horizon) * Math.PI * 2) * (28 - drag * 18)}`;
  }).join(' ');

  return (
    <div>
      <svg aria-label="Prediction trace" className="block h-auto w-full" viewBox="0 0 296 132">
        <rect fill="#fff" height="132" width="296" />
        <line stroke="rgba(24,24,24,0.24)" strokeWidth="1" x1="24" x2="272" y1="86" y2="86" />
        <polyline fill="none" points={actual} stroke="rgba(24,24,24,0.9)" strokeWidth="1.2" />
        <polyline fill="none" points={predicted} stroke="rgba(24,24,24,0.48)" strokeDasharray="3 4" strokeWidth="1.2" />
      </svg>
      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        Foresight appears when internal traces get slightly ahead of the world,
        even if the mechanism is still very small.
      </p>
      <ControlRow>
        <RangeControl
          label="Horizon"
          max={0.3}
          min={0}
          onChange={setHorizon}
          step={0.01}
          value={horizon}
        />
        {sandbox ? (
          <RangeControl
            label="Drag"
            max={0.24}
            min={0}
            onChange={setDrag}
            step={0.01}
            value={drag}
          />
        ) : null}
      </ControlRow>
    </div>
  );
}

function BiasView({ sandbox }: { sandbox: boolean }) {
  const [optimism, setOptimism] = useState(0.22);
  const [selfBias, setSelfBias] = useState(0.18);
  const evidence = [
    { label: 'gain', value: 0.34 },
    { label: 'risk', value: -0.28 },
    { label: 'noise', value: -0.18 },
    { label: 'support', value: 0.24 },
  ];

  const worldScore = evidence.reduce((total, item) => total + item.value, 0);
  const selfScore = evidence.reduce(
    (total, item) =>
      total + item.value + (item.value > 0 ? optimism : -optimism / 2) + selfBias * 0.08,
    0
  );

  return (
    <div>
      <div className="space-y-3">
        {evidence.map((item) => (
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3" key={item.label}>
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-700">
              {item.label}
            </p>
            <div className="relative h-6 border border-stone-300">
              <div
                className="absolute top-0 h-full bg-black"
                style={{
                  left: item.value < 0 ? `${50 + item.value * 50}%` : '50%',
                  width: `${Math.abs(item.value) * 50}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="border border-stone-300 p-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-700">
            World score
          </p>
          <p className="mt-2 text-[1.05rem] leading-7 text-black">{worldScore.toFixed(2)}</p>
        </div>
        <div className="border border-stone-300 p-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-700">
            Self score
          </p>
          <p className="mt-2 text-[1.05rem] leading-7 text-black">{selfScore.toFixed(2)}</p>
        </div>
      </div>
      <ControlRow>
        <RangeControl
          label="Optimism"
          max={0.6}
          min={0}
          onChange={setOptimism}
          step={0.01}
          value={optimism}
        />
        {sandbox ? (
          <RangeControl
            label="Egotism"
            max={0.6}
            min={0}
            onChange={setSelfBias}
            step={0.01}
            value={selfBias}
          />
        ) : null}
      </ControlRow>
    </div>
  );
}

export default function AbstractCognitionLab({
  mode,
  variant = 'simple',
}: AbstractCognitionLabProps) {
  const sandbox = variant === 'sandbox';

  if (mode === 'ideas') {
    return <IdeasView sandbox={sandbox} />;
  }

  if (mode === 'regularities') {
    return <RegularitiesView sandbox={sandbox} />;
  }

  if (mode === 'trains') {
    return <TrainsView sandbox={sandbox} />;
  }

  if (mode === 'foresight') {
    return <ForesightView sandbox={sandbox} />;
  }

  return <BiasView sandbox={sandbox} />;
}
