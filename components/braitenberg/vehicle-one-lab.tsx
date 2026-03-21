'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useIntersectionObserver } from '../../hooks/use-intersection-observer';
import {
  BraitenbergEngine,
  createSource,
  createVehicleOneConfig,
} from '../../lib/braitenberg/engine';
import {
  ActionButton,
  ControlRow,
  RangeControl,
  ToggleChip,
} from './control-row';

type VehicleOneLabVariant = 'bare' | 'temperament' | 'editor' | 'sandbox';
type EditorMode = 'move-warm' | 'add-warm' | 'add-cold' | 'erase';

type VehicleOneLabProps = {
  variant: VehicleOneLabVariant;
};

const WIDTH = 720;
const HEIGHT = 280;

function initialSourcesForVariant(variant: VehicleOneLabVariant) {
  if (variant === 'editor') {
    return [
      createSource('warm-1', WIDTH * 0.72, HEIGHT * 0.36, 0.86, 105),
      createSource('cold-1', WIDTH * 0.55, HEIGHT * 0.74, -0.46, 78),
    ];
  }

  if (variant === 'sandbox') {
    return [
      createSource('warm-1', WIDTH * 0.7, HEIGHT * 0.32, 0.86, 110),
      createSource('warm-2', WIDTH * 0.58, HEIGHT * 0.76, 0.44, 88),
      createSource('cold-1', WIDTH * 0.34, HEIGHT * 0.38, -0.42, 84),
    ];
  }

  return [createSource('warm-1', WIDTH * 0.74, HEIGHT * 0.34, 0.86, 108)];
}

function defaultsForVariant(variant: VehicleOneLabVariant) {
  if (variant === 'bare') {
    return {
      fieldScale: 1,
      friction: 0.08,
      noise: 0.09,
      sensorGain: 1,
      motorGain: 1,
      showTrail: true,
      editorMode: 'move-warm' as EditorMode,
      helpText:
        'The path is the point. Warmer regions only change speed; drift and wall contact do the rest.',
    };
  }

  if (variant === 'temperament') {
    return {
      fieldScale: 1,
      friction: 0.08,
      noise: 0.18,
      sensorGain: 1,
      motorGain: 1,
      showTrail: true,
      editorMode: 'move-warm' as EditorMode,
      helpText:
        'Friction and noise change the reading long before the mechanism changes.',
    };
  }

  if (variant === 'editor') {
    return {
      fieldScale: 1,
      friction: 0.07,
      noise: 0.14,
      sensorGain: 1,
      motorGain: 1,
      showTrail: true,
      editorMode: 'move-warm' as EditorMode,
      helpText:
        'Click the plate to move the warm source, add a cold source, or erase one.',
    };
  }

  return {
    fieldScale: 1,
    friction: 0.09,
    noise: 0.16,
    sensorGain: 1,
    motorGain: 1,
    showTrail: true,
    editorMode: 'move-warm' as EditorMode,
    helpText:
      'Open the full loop: source layout, field strength, gain, trail, and reset.',
  };
}

function formatReading(value: number) {
  return value.toFixed(2);
}

export default function VehicleOneLab({ variant }: VehicleOneLabProps) {
  const initialSources = useMemo(
    () => initialSourcesForVariant(variant),
    [variant]
  );
  const defaults = useMemo(() => defaultsForVariant(variant), [variant]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BraitenbergEngine | null>(null);
  const frameRef = useRef<number>();
  const editorActiveRef = useRef(false);
  const idRef = useRef(0);
  const fieldRef = useRef<HTMLSpanElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const sourceRef = useRef<HTMLSpanElement>(null);
  const motorRef = useRef<HTMLSpanElement>(null);

  const isVisible = useIntersectionObserver(canvasRef, {
    threshold: 0,
    rootMargin: '160px',
  });

  const [fieldScale, setFieldScale] = useState(defaults.fieldScale);
  const [friction, setFriction] = useState(defaults.friction);
  const [noise, setNoise] = useState(defaults.noise);
  const [sensorGain, setSensorGain] = useState(defaults.sensorGain);
  const [motorGain, setMotorGain] = useState(defaults.motorGain);
  const [showTrail, setShowTrail] = useState(defaults.showTrail);
  const [editorMode, setEditorMode] = useState<EditorMode>(defaults.editorMode);

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
    const telemetry = engine.getTelemetry();

    if (fieldRef.current) {
      fieldRef.current.textContent = formatReading(telemetry.field);
    }

    if (speedRef.current) {
      speedRef.current.textContent = formatReading(telemetry.speed);
    }

    if (sourceRef.current) {
      sourceRef.current.textContent = telemetry.sourceCount.toString();
    }

    if (motorRef.current) {
      motorRef.current.textContent = formatReading(
        telemetry.motorOutputs.single ?? 0
      );
    }
  };

  useEffect(() => {
    const config = createVehicleOneConfig(WIDTH, HEIGHT);
    config.world.sources = initialSources.map((source) => ({ ...source }));
    config.world.fieldScale = fieldScale;
    config.vehicle.friction = friction;
    config.vehicle.noise = noise;
    config.vehicle.sensors[0].gain = sensorGain;
    config.vehicle.motors[0].gain = motorGain;
    config.showTrail = showTrail;
    engineRef.current = new BraitenbergEngine(config);
    syncFigure();

    return () => {
      engineRef.current = null;
    };
  }, [initialSources]);

  useEffect(() => {
    const engine = engineRef.current;

    if (!engine) {
      return;
    }

    engine.setFieldScale(fieldScale);
    engine.setFriction(friction);
    engine.setNoise(noise);
    engine.setSensorGain('front', sensorGain);
    engine.setMotorGain('single', motorGain);
    engine.setShowTrail(showTrail);
    syncFigure();
  }, [fieldScale, friction, motorGain, noise, sensorGain, showTrail]);

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

  const restoreScene = () => {
    const engine = engineRef.current;

    if (!engine) {
      return;
    }

    engine.setSources(initialSources.map((source) => ({ ...source })));
    engine.reset();
    syncFigure();
  };

  const resetRun = () => {
    engineRef.current?.reset();
    syncFigure();
  };

  const nextSourceId = () => {
    idRef.current += 1;
    return `source-${variant}-${idRef.current}`;
  };

  const toWorldPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const applyEditorAction = (x: number, y: number) => {
    const engine = engineRef.current;

    if (!engine || (variant !== 'editor' && variant !== 'sandbox')) {
      return;
    }

    if (editorMode === 'move-warm') {
      engine.movePrimaryWarmSource(x, y);
      syncFigure();
      return;
    }

    if (editorMode === 'add-cold') {
      engine.addSource(createSource(nextSourceId(), x, y, -0.5, 82));
      syncFigure();
      return;
    }

    if (editorMode === 'add-warm') {
      engine.addSource(createSource(nextSourceId(), x, y, 0.58, 96));
      syncFigure();
      return;
    }

    if (editorMode === 'erase') {
      engine.removeNearestSource(x, y);
      syncFigure();
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (variant !== 'editor' && variant !== 'sandbox') {
      return;
    }

    const point = toWorldPoint(event);
    applyEditorAction(point.x, point.y);
    editorActiveRef.current = editorMode === 'move-warm';
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editorActiveRef.current || editorMode !== 'move-warm') {
      return;
    }

    const point = toWorldPoint(event);
    applyEditorAction(point.x, point.y);
  };

  const handlePointerUp = () => {
    editorActiveRef.current = false;
  };

  return (
    <div>
      <div className="overflow-hidden bg-white">
        <canvas
          className="block h-auto w-full touch-none"
          height={HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={canvasRef}
          width={WIDTH}
        />
      </div>

      <p className="mt-4 text-[0.98rem] leading-7 text-black">
        {defaults.helpText}
      </p>

      {(variant === 'temperament' || variant === 'sandbox') && (
        <ControlRow>
          <RangeControl
            label="Friction"
            max={0.18}
            min={0.01}
            onChange={setFriction}
            step={0.01}
            value={friction}
          />
          <RangeControl
            label="Noise"
            max={0.5}
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
        </ControlRow>
      )}

      {variant === 'sandbox' && (
        <ControlRow>
          <RangeControl
            label="Sensor gain"
            max={2.2}
            min={0.3}
            onChange={setSensorGain}
            step={0.05}
            value={sensorGain}
          />
          <RangeControl
            label="Motor gain"
            max={2.2}
            min={0.3}
            onChange={setMotorGain}
            step={0.05}
            value={motorGain}
          />
        </ControlRow>
      )}

      {(variant === 'editor' || variant === 'sandbox') && (
        <ControlRow>
          <ToggleChip
            active={editorMode === 'move-warm'}
            label="Move warm"
            onClick={() => setEditorMode('move-warm')}
          />
          {variant === 'sandbox' && (
            <ToggleChip
              active={editorMode === 'add-warm'}
              label="Add warm"
              onClick={() => setEditorMode('add-warm')}
            />
          )}
          <ToggleChip
            active={editorMode === 'add-cold'}
            label="Add cold"
            onClick={() => setEditorMode('add-cold')}
          />
          <ToggleChip
            active={editorMode === 'erase'}
            label="Erase"
            onClick={() => setEditorMode('erase')}
          />
          <ActionButton onClick={restoreScene}>Restore field</ActionButton>
        </ControlRow>
      )}

      <ControlRow>
        <ToggleChip
          active={showTrail}
          label="Trail"
          onClick={() => setShowTrail((value) => !value)}
        />
        <ActionButton onClick={resetRun}>Reset run</ActionButton>
      </ControlRow>
    </div>
  );
}
