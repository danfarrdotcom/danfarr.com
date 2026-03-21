'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useIntersectionObserver } from '../../hooks/use-intersection-observer';
import {
  BraitenbergEngine,
  type BraitenbergSource,
  createVehicleTwoConfig,
  type VehicleTwoWiring,
} from '../../lib/braitenberg/engine';
import {
  ActionButton,
  ControlRow,
  RangeControl,
  ToggleChip,
} from './control-row';

type VehicleTwoLabVariant = 'comparison' | 'wiring' | 'field' | 'sandbox';

type VehicleTwoLabProps = {
  variant: VehicleTwoLabVariant;
};

type PlateProps = {
  width: number;
  height: number;
  initialSources: BraitenbergSource[];
  initialWiring: VehicleTwoWiring;
  helpText: string;
  compact?: boolean;
  allowWiringToggle?: boolean;
  allowFieldControls?: boolean;
  allowGainControls?: boolean;
  allowSourceMove?: boolean;
  initialFieldScale?: number;
  initialFriction?: number;
  initialNoise?: number;
  initialSensorGain?: number;
  initialMotorGain?: number;
};

const LARGE_WIDTH = 720;
const LARGE_HEIGHT = 280;
const COMPARISON_WIDTH = 340;
const COMPARISON_HEIGHT = 238;

function cloneSources(sources: BraitenbergSource[]) {
  return sources.map((source) => ({ ...source }));
}

function createInitialSources(
  width: number,
  height: number,
  variant: VehicleTwoLabVariant
) {
  if (variant === 'field') {
    return [
      {
        id: 'warm-1',
        x: width * 0.7,
        y: height * 0.28,
        strength: 0.9,
        spread: 110,
      },
    ];
  }

  if (variant === 'sandbox') {
    return [
      {
        id: 'warm-1',
        x: width * 0.74,
        y: height * 0.28,
        strength: 0.9,
        spread: 112,
      },
    ];
  }

  return [
    {
      id: 'warm-1',
      x: width * 0.76,
      y: height * 0.26,
      strength: 0.88,
      spread: 108,
    },
  ];
}

function wiringName(wiring: VehicleTwoWiring) {
  return wiring === 'direct' ? 'Fear' : 'Aggression';
}

function wiringCaption(wiring: VehicleTwoWiring) {
  return wiring === 'direct'
    ? 'Direct excitation. The near-side wheel speeds up first, so the body turns away from the brighter side.'
    : 'Crossed excitation. The far-side wheel speeds up first, so the body turns toward the brighter side and accelerates as it closes in.';
}

function Plate({
  width,
  height,
  initialSources,
  initialWiring,
  helpText,
  compact = false,
  allowWiringToggle = false,
  allowFieldControls = false,
  allowGainControls = false,
  allowSourceMove = false,
  initialFieldScale = 1,
  initialFriction = 0.05,
  initialNoise = 0.06,
  initialSensorGain = 1,
  initialMotorGain = 1,
}: PlateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BraitenbergEngine | null>(null);
  const frameRef = useRef<number>();

  const isVisible = useIntersectionObserver(canvasRef, {
    threshold: 0,
    rootMargin: '160px',
  });

  const [wiring, setWiring] = useState<VehicleTwoWiring>(initialWiring);
  const [fieldScale, setFieldScale] = useState(initialFieldScale);
  const [friction, setFriction] = useState(initialFriction);
  const [noise, setNoise] = useState(initialNoise);
  const [sensorGain, setSensorGain] = useState(initialSensorGain);
  const [motorGain, setMotorGain] = useState(initialMotorGain);
  const [showTrail, setShowTrail] = useState(true);

  const syncFigure = () => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;

    if (!canvas || !engine) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    engine.render(context);
  };

  useEffect(() => {
    const config = createVehicleTwoConfig(width, height, wiring);
    config.world.sources = cloneSources(initialSources);
    config.world.fieldScale = fieldScale;
    config.vehicle.friction = friction;
    config.vehicle.noise = noise;
    config.vehicle.sensors.forEach((sensor) => {
      sensor.gain = sensorGain;
    });
    config.vehicle.motors.forEach((motor) => {
      motor.gain = motorGain;
    });
    config.showTrail = showTrail;
    engineRef.current = new BraitenbergEngine(config);
    syncFigure();

    return () => {
      engineRef.current = null;
    };
  }, [
    fieldScale,
    friction,
    height,
    initialSources,
    motorGain,
    noise,
    sensorGain,
    showTrail,
    width,
    wiring,
  ]);

  useEffect(() => {
    if (!isVisible) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      return;
    }

    let previousFrame = performance.now();

    const renderFrame = (now: number) => {
      const engine = engineRef.current;

      if (!engine) {
        return;
      }

      const delta = Math.min(1.8, (now - previousFrame) / 16.6667);
      previousFrame = now;
      engine.step(delta);
      syncFigure();
      frameRef.current = requestAnimationFrame(renderFrame);
    };

    frameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible]);

  const resetRun = () => {
    engineRef.current?.reset();
    syncFigure();
  };

  const restoreField = () => {
    const engine = engineRef.current;

    if (!engine) {
      return;
    }

    engine.setSources(cloneSources(initialSources));
    engine.reset();
    syncFigure();
  };

  const moveWarmSource = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!allowSourceMove) {
      return;
    }

    const engine = engineRef.current;

    if (!engine) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * width;
    const y = ((event.clientY - rect.top) / rect.height) * height;

    engine.movePrimaryWarmSource(x, y);
    syncFigure();
  };

  return (
    <div>
      <div className="overflow-hidden bg-white">
        <canvas
          className="block h-auto w-full touch-none"
          height={height}
          onPointerDown={moveWarmSource}
          onPointerMove={(event) => {
            if (allowSourceMove && event.buttons === 1) {
              moveWarmSource(event);
            }
          }}
          ref={canvasRef}
          width={width}
        />
      </div>

      <div className={compact ? 'mt-3' : 'mt-4'}>
        <p className="text-[11px] uppercase tracking-[0.24em] text-stone-700">
          {wiringName(wiring)}
        </p>
        <p className="mt-2 text-[0.98rem] leading-7 text-black">
          {helpText}
        </p>
      </div>

      {allowWiringToggle && (
        <ControlRow>
          <ToggleChip
            active={wiring === 'direct'}
            label="Fear"
            onClick={() => setWiring('direct')}
          />
          <ToggleChip
            active={wiring === 'crossed'}
            label="Aggression"
            onClick={() => setWiring('crossed')}
          />
        </ControlRow>
      )}

      {(allowFieldControls || allowGainControls) && (
        <ControlRow>
          <RangeControl
            label="Noise"
            max={0.32}
            min={0}
            onChange={setNoise}
            step={0.01}
            value={noise}
          />
          <RangeControl
            label="Field"
            max={1.6}
            min={0.4}
            onChange={setFieldScale}
            step={0.02}
            value={fieldScale}
          />
          {allowFieldControls && (
            <RangeControl
              label="Friction"
              max={0.16}
              min={0.01}
              onChange={setFriction}
              step={0.01}
              value={friction}
            />
          )}
        </ControlRow>
      )}

      {allowGainControls && (
        <ControlRow>
          <RangeControl
            label="Sensor gain"
            max={2}
            min={0.4}
            onChange={setSensorGain}
            step={0.05}
            value={sensorGain}
          />
          <RangeControl
            label="Motor gain"
            max={2}
            min={0.4}
            onChange={setMotorGain}
            step={0.05}
            value={motorGain}
          />
        </ControlRow>
      )}

      <ControlRow>
        <ToggleChip
          active={showTrail}
          label="Trail"
          onClick={() => setShowTrail((value) => !value)}
        />
        <ActionButton onClick={resetRun}>Reset run</ActionButton>
        {allowSourceMove && <ActionButton onClick={restoreField}>Reset light</ActionButton>}
      </ControlRow>

      {compact && (
        <p className="mt-3 text-[0.92rem] leading-6 text-stone-700">
          {wiringCaption(wiring)}
        </p>
      )}
    </div>
  );
}

export default function VehicleTwoLab({ variant }: VehicleTwoLabProps) {
  const comparisonSources = useMemo(
    () => createInitialSources(COMPARISON_WIDTH, COMPARISON_HEIGHT, 'comparison'),
    []
  );
  const interactiveSources = useMemo(
    () => createInitialSources(LARGE_WIDTH, LARGE_HEIGHT, variant),
    [variant]
  );

  if (variant === 'comparison') {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Plate
          compact
          height={COMPARISON_HEIGHT}
          helpText="Direct wiring produces retreat. The brighter side speeds its own wheel, and the body swings away."
          initialSources={comparisonSources}
          initialWiring="direct"
          width={COMPARISON_WIDTH}
        />
        <Plate
          compact
          height={COMPARISON_HEIGHT}
          helpText="Crossed wiring produces attack. The brighter side speeds the opposite wheel, and the body turns inward."
          initialSources={comparisonSources}
          initialWiring="crossed"
          width={COMPARISON_WIDTH}
        />
      </div>
    );
  }

  if (variant === 'wiring') {
    return (
      <Plate
        allowFieldControls
        allowWiringToggle
        height={LARGE_HEIGHT}
        helpText="The source stays fixed while the wiring changes. One crossover is enough to flip avoidance into pursuit."
        initialSources={interactiveSources}
        initialWiring="direct"
        initialNoise={0.05}
        width={LARGE_WIDTH}
      />
    );
  }

  if (variant === 'field') {
    return (
      <Plate
        allowSourceMove
        allowWiringToggle
        height={LARGE_HEIGHT}
        helpText="Drag the light around the plate. The geometry changes the path, but the story still hangs on which wheel gets driven first."
        initialSources={interactiveSources}
        initialWiring="crossed"
        initialNoise={0.05}
        width={LARGE_WIDTH}
      />
    );
  }

  return (
    <Plate
      allowFieldControls
      allowGainControls
      allowSourceMove
      allowWiringToggle
      height={LARGE_HEIGHT}
      helpText="Open the full plate: wiring, source position, field strength, gain, trail, and reset."
      initialSources={interactiveSources}
      initialWiring="direct"
      initialNoise={0.06}
      width={LARGE_WIDTH}
    />
  );
}
