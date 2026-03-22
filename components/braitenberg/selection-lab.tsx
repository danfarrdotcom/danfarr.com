'use client';

import { useMemo, useState } from 'react';

import { ActionButton, ControlRow, RangeControl } from './control-row';

type SelectionLabVariant = 'selection' | 'pressure' | 'sandbox';

type SelectionLabProps = {
  variant: SelectionLabVariant;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function mutate(value: number, amount: number) {
  return clamp(value + (Math.random() - 0.5) * amount);
}

function createPopulation(size = 18) {
  return Array.from({ length: size }, () => Math.random());
}

function fitness(value: number, target: number) {
  return 1 - Math.abs(value - target);
}

export default function SelectionLab({ variant }: SelectionLabProps) {
  const [population, setPopulation] = useState<number[]>(() => createPopulation());
  const [generation, setGeneration] = useState(0);
  const [target, setTarget] = useState(0.68);
  const [mutation, setMutation] = useState(0.18);
  const [survivalRate, setSurvivalRate] = useState(
    variant === 'pressure' ? 0.22 : 0.35
  );

  const ranked = useMemo(
    () =>
      population
        .map((value) => ({ value, score: fitness(value, target) }))
        .sort((a, b) => b.score - a.score),
    [population, target]
  );

  const survivors = Math.max(2, Math.round(population.length * survivalRate));
  const mean =
    population.reduce((total, value) => total + value, 0) / population.length;

  const stepGeneration = (steps = 1) => {
    let next = population.slice();
    let nextGeneration = generation;

    for (let step = 0; step < steps; step += 1) {
      const nextRanked = next
        .map((value) => ({ value, score: fitness(value, target) }))
        .sort((a, b) => b.score - a.score);
      const pool = nextRanked.slice(0, survivors).map((entry) => entry.value);
      next = Array.from({ length: next.length }, (_, index) =>
        mutate(pool[index % pool.length], mutation)
      );
      nextGeneration += 1;
    }

    setPopulation(next);
    setGeneration(nextGeneration);
  };

  const resetPopulation = () => {
    setPopulation(createPopulation());
    setGeneration(0);
  };

  return (
    <div>
      <svg
        aria-label="Selection plate"
        className="block h-auto w-full"
        viewBox="0 0 320 126"
      >
        <rect fill="#fff" height="126" width="320" />
        <line
          stroke="rgba(24,24,24,0.24)"
          strokeWidth="1"
          x1="24"
          x2="296"
          y1="96"
          y2="96"
        />
        <line
          stroke="rgba(24,24,24,0.4)"
          strokeDasharray="3 4"
          strokeWidth="1"
          x1={24 + target * 272}
          x2={24 + target * 272}
          y1="18"
          y2="104"
        />
        {ranked.map((entry, index) => (
          <circle
            cx={24 + entry.value * 272}
            cy={92 - index * 3.8}
            fill={index < survivors ? 'rgba(24,24,24,0.92)' : '#fff'}
            key={`${entry.value}-${index}`}
            r="3.2"
            stroke="rgba(24,24,24,0.92)"
            strokeWidth="1"
          />
        ))}
        <text x="24" y="116" fontSize="11" fill="rgba(24,24,24,0.7)">
          generation {generation}
        </text>
        <text x="220" y="116" fontSize="11" fill="rgba(24,24,24,0.7)">
          mean {mean.toFixed(2)}
        </text>
      </svg>

      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        Selection does not need foresight. It only needs a target zone and a
        way to keep whatever already lands nearer to it.
      </p>

      <ControlRow>
        <ActionButton onClick={() => stepGeneration(1)}>Step</ActionButton>
        <ActionButton onClick={() => stepGeneration(8)}>Run 8</ActionButton>
        <ActionButton onClick={resetPopulation}>Reset</ActionButton>
      </ControlRow>

      <ControlRow>
        <RangeControl
          label="Target"
          max={0.9}
          min={0.1}
          onChange={setTarget}
          step={0.01}
          value={target}
        />
        <RangeControl
          label="Mutation"
          max={0.4}
          min={0.02}
          onChange={setMutation}
          step={0.01}
          value={mutation}
        />
        <RangeControl
          label="Survival"
          max={0.8}
          min={0.1}
          onChange={setSurvivalRate}
          step={0.01}
          value={survivalRate}
        />
      </ControlRow>
    </div>
  );
}
