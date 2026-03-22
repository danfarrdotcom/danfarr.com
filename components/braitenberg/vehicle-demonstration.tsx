'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useIntersectionObserver } from '../../hooks/use-intersection-observer';
import {
  BraitenbergEngine,
  createSource,
  createVehicleOneConfig,
  createVehicleThreeConfig,
  createVehicleTwoConfig,
  type BraitenbergEngineConfig,
  type BraitenbergSource,
} from '../../lib/braitenberg/engine';
import {
  ActionButton,
  ControlRow,
  RangeControl,
  ToggleChip,
} from './control-row';

type VehicleDemonstrationProps = {
  slug: string;
};

type VehicleDemoPreset = {
  label: string;
  caption: string;
  helpText: string;
  allowSourceMove?: boolean;
  createConfig: (width: number, height: number) => BraitenbergEngineConfig;
};

const WIDTH = 720;
const HEIGHT = 280;

function cloneSources(sources: BraitenbergSource[]) {
  return sources.map((source) => ({ ...source }));
}

const DEMO_PRESETS: Record<string, VehicleDemoPreset> = {
  'vehicle-4-values-and-special-tastes': {
    label: 'Preferred corridor',
    caption:
      'Even with a simple body, a mixture of attraction and aversion starts to read as taste. The path itself becomes a visible preference ordering.',
    helpText:
      'Drag the main warm source. This plate stays grounded in a literal Braitenberg body while the chapter moves toward values and preference.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleThreeConfig(width, height, 'direct');
      config.vehicle.startY = height * 0.72;
      config.vehicle.noise = 0.04;
      config.world.fieldScale = 1.02;
      config.world.sources = [
        createSource('warm-1', width * 0.74, height * 0.28, 0.92, 110),
        createSource('warm-2', width * 0.55, height * 0.62, 0.42, 94),
        createSource('cold-1', width * 0.32, height * 0.34, -0.44, 86),
      ];
      return config;
    },
  },
  'vehicle-5-logic': {
    label: 'Conditional-seeming turn',
    caption:
      'There is no symbolic rule here, only crossed excitation in a shaped field. Yet the resulting commitment still feels conditional and deliberate.',
    helpText:
      'Move the brightest source and watch how the same vehicle begins to look rule-like once multiple cues share the plate.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleTwoConfig(width, height, 'crossed');
      config.vehicle.noise = 0.035;
      config.vehicle.friction = 0.045;
      config.world.fieldScale = 0.98;
      config.world.sources = [
        createSource('warm-1', width * 0.72, height * 0.24, 0.8, 96),
        createSource('warm-2', width * 0.82, height * 0.54, 0.62, 88),
        createSource('cold-1', width * 0.42, height * 0.58, -0.28, 90),
      ];
      return config;
    },
  },
  'vehicle-6-selection-the-impersonal-engineer': {
    label: 'Viable body',
    caption:
      'Selection can be read off the trajectory: some bodies keep finding workable paths in the same world. This one survives because its coupling stays viable.',
    helpText:
      'Selection is easier to see when the same landscape is held fixed and only the body keeps proving that it can cope with it.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleTwoConfig(width, height, 'crossed');
      config.vehicle.noise = 0.03;
      config.vehicle.friction = 0.04;
      config.world.fieldScale = 1;
      config.world.sources = [
        createSource('warm-1', width * 0.76, height * 0.22, 0.9, 102),
        createSource('warm-2', width * 0.6, height * 0.72, 0.36, 90),
        createSource('cold-1', width * 0.4, height * 0.38, -0.34, 96),
      ];
      return config;
    },
  },
  'vehicle-7-concepts': {
    label: 'Recurring responses',
    caption:
      'Concept-like distinctions can begin as stable differences in response. The body does not name the regions, but it does not treat them as the same either.',
    helpText:
      'Keep the body fixed and move the main source around. The category is not stored as a word; it shows up in the repeatable shape of the response.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleOneConfig(width, height);
      config.vehicle.noise = 0.14;
      config.world.fieldScale = 1.06;
      config.world.sources = [
        createSource('warm-1', width * 0.72, height * 0.28, 0.88, 110),
        createSource('warm-2', width * 0.54, height * 0.72, 0.4, 90),
        createSource('cold-1', width * 0.28, height * 0.36, -0.36, 82),
      ];
      return config;
    },
  },
  'vehicle-8-space-things-and-movements': {
    label: 'World-shaped path',
    caption:
      'Spatial understanding first appears as a path that bends with the world. The route carries information about layout before any explicit map exists.',
    helpText:
      'Drag the main source and read the world off the curve. This is the spatial argument in its most literal form: movement shaped by layout.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleTwoConfig(width, height, 'direct');
      config.vehicle.noise = 0.04;
      config.world.fieldScale = 1.02;
      config.world.sources = [
        createSource('warm-1', width * 0.78, height * 0.26, 0.9, 106),
        createSource('warm-2', width * 0.66, height * 0.7, 0.34, 88),
        createSource('cold-1', width * 0.48, height * 0.46, -0.32, 82),
      ];
      return config;
    },
  },
  'vehicle-9-shapes': {
    label: 'Sequential form',
    caption:
      'A shape can begin as an ordered sequence of encounters. The body never sees a finished form all at once; it accumulates one by moving through it.',
    helpText:
      'The three warm points act like a crude outline. What matters is the sequence of encounters the body stitches into a single path.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleOneConfig(width, height);
      config.vehicle.noise = 0.11;
      config.world.fieldScale = 1;
      config.world.sources = [
        createSource('warm-1', width * 0.72, height * 0.24, 0.72, 88),
        createSource('warm-2', width * 0.84, height * 0.64, 0.72, 88),
        createSource('warm-3', width * 0.58, height * 0.66, 0.72, 88),
      ];
      return config;
    },
  },
  'vehicle-10-getting-ideas': {
    label: 'Recombined route',
    caption:
      'The body is unchanged, but a richer field yields fresh trajectories. That is the point of the chapter: novelty can begin as a recombination of existing parts.',
    helpText:
      'This plate keeps the argument concrete. New-seeming behavior can emerge from the same old vehicle when the arrangement of possibilities changes.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleThreeConfig(width, height, 'crossed');
      config.vehicle.noise = 0.045;
      config.world.fieldScale = 1.04;
      config.world.sources = [
        createSource('warm-1', width * 0.76, height * 0.24, 0.84, 102),
        createSource('warm-2', width * 0.62, height * 0.5, 0.5, 86),
        createSource('warm-3', width * 0.74, height * 0.76, 0.42, 84),
      ];
      return config;
    },
  },
  'vehicle-11-rules-and-regularities': {
    label: 'Repeated trace',
    caption:
      'Regularity is easiest to spot as repetition. When the world is patterned, the path begins to pattern itself too, long before anyone writes down a rule.',
    helpText:
      'The evenly spaced sources push the body into a recurring rhythm. Pattern sensitivity often starts as repeated movement in repeated terrain.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleOneConfig(width, height);
      config.vehicle.noise = 0.08;
      config.world.fieldScale = 0.96;
      config.world.sources = [
        createSource('warm-1', width * 0.52, height * 0.24, 0.48, 72),
        createSource('warm-2', width * 0.66, height * 0.4, 0.48, 72),
        createSource('warm-3', width * 0.8, height * 0.56, 0.48, 72),
      ];
      return config;
    },
  },
  'vehicle-12-trains-of-thought': {
    label: 'Chained attractors',
    caption:
      'A train of thought can start as a train of motion. The body hands itself from one attractor to the next, making continuity feel cognitive.',
    helpText:
      'The chapter moves into chaining and persistence. This plate keeps that idea attached to a body that literally travels from one attractor to another.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleThreeConfig(width, height, 'direct');
      config.vehicle.noise = 0.04;
      config.world.fieldScale = 1.02;
      config.world.sources = [
        createSource('warm-1', width * 0.62, height * 0.24, 0.72, 88),
        createSource('warm-2', width * 0.78, height * 0.48, 0.66, 88),
        createSource('warm-3', width * 0.68, height * 0.76, 0.52, 84),
      ];
      return config;
    },
  },
  'vehicle-13-foresight': {
    label: 'Early bend',
    caption:
      'Prediction first looks like an early turn. The body begins to adjust before arrival because its sensors are already registering what lies ahead.',
    helpText:
      'Foresight does not need an inner narrator. A body with the right coupling can look anticipatory simply by bending early.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleTwoConfig(width, height, 'crossed');
      config.vehicle.noise = 0.03;
      config.world.fieldScale = 1.08;
      config.world.sources = [
        createSource('warm-1', width * 0.8, height * 0.22, 0.92, 110),
        createSource('cold-1', width * 0.62, height * 0.54, -0.36, 88),
      ];
      return config;
    },
  },
  'vehicle-14-egotism-and-optimism': {
    label: 'Skewed terrain',
    caption:
      'Bias can be represented as a skew in the terrain itself. The body is still mechanical, but asymmetry in what counts as attractive changes the whole reading of its path.',
    helpText:
      'Drag the warm source and notice how quickly the same vehicle starts to look partial once the field itself is unevenly weighted.',
    allowSourceMove: true,
    createConfig: (width, height) => {
      const config = createVehicleThreeConfig(width, height, 'crossed');
      config.vehicle.noise = 0.045;
      config.world.fieldScale = 0.98;
      config.world.sources = [
        createSource('warm-1', width * 0.76, height * 0.24, 0.9, 106),
        createSource('warm-2', width * 0.58, height * 0.64, 0.28, 78),
        createSource('cold-1', width * 0.4, height * 0.4, -0.24, 88),
      ];
      return config;
    },
  },
};

export default function VehicleDemonstration({
  slug,
}: VehicleDemonstrationProps) {
  const preset = DEMO_PRESETS[slug];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BraitenbergEngine | null>(null);
  const frameRef = useRef<number>();
  const draggingRef = useRef(false);

  const isVisible = useIntersectionObserver(canvasRef, {
    threshold: 0,
    rootMargin: '160px',
  });

  const baseConfig = useMemo(() => {
    if (!preset) {
      return null;
    }

    return preset.createConfig(WIDTH, HEIGHT);
  }, [preset]);

  const initialSources = useMemo(
    () => (baseConfig ? cloneSources(baseConfig.world.sources) : []),
    [baseConfig]
  );

  const [fieldScale, setFieldScale] = useState(baseConfig?.world.fieldScale ?? 1);
  const [noise, setNoise] = useState(baseConfig?.vehicle.noise ?? 0.08);
  const [sensorGain, setSensorGain] = useState(
    baseConfig?.vehicle.sensors[0]?.gain ?? 1
  );
  const [showTrail, setShowTrail] = useState(baseConfig?.showTrail ?? true);

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
    if (!baseConfig) {
      return;
    }

    setFieldScale(baseConfig.world.fieldScale);
    setNoise(baseConfig.vehicle.noise);
    setSensorGain(baseConfig.vehicle.sensors[0]?.gain ?? 1);
    setShowTrail(baseConfig.showTrail ?? true);
  }, [baseConfig]);

  useEffect(() => {
    if (!baseConfig) {
      engineRef.current = null;
      return;
    }

    const config = preset.createConfig(WIDTH, HEIGHT);
    config.world.fieldScale = fieldScale;
    config.vehicle.noise = noise;
    config.vehicle.sensors.forEach((sensor) => {
      sensor.gain = sensorGain;
    });
    config.showTrail = showTrail;
    engineRef.current = new BraitenbergEngine(config);
    syncFigure();

    return () => {
      engineRef.current = null;
    };
  }, [baseConfig, fieldScale, noise, preset, sensorGain, showTrail]);

  useEffect(() => {
    if (!isVisible || !engineRef.current) {
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

  const moveWarmSource = (clientX: number, clientY: number) => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;

    if (!preset?.allowSourceMove || !engine || !canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    const y = ((clientY - rect.top) / rect.height) * HEIGHT;

    engine.movePrimaryWarmSource(x, y);
    syncFigure();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!preset?.allowSourceMove) {
      return;
    }

    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveWarmSource(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current || !preset?.allowSourceMove) {
      return;
    }

    moveWarmSource(event.clientX, event.clientY);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const resetRun = () => {
    engineRef.current?.reset();
    syncFigure();
  };

  const restoreField = () => {
    const engine = engineRef.current;

    if (!engine || initialSources.length === 0) {
      return;
    }

    engine.setSources(cloneSources(initialSources));
    engine.reset();
    syncFigure();
  };

  if (!preset || !baseConfig) {
    return null;
  }

  return (
    <section className="border-t border-stone-300 pt-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em] text-stone-700">
        <span>Vehicle demonstration</span>
        <span>{preset.label}</span>
      </div>

      <div className="overflow-hidden bg-white">
        <canvas
          className={`block h-auto w-full bg-white ${
            preset.allowSourceMove ? 'cursor-crosshair touch-none' : ''
          }`}
          height={HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          ref={canvasRef}
          width={WIDTH}
        />
      </div>

      <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-stone-700">
        {preset.helpText}
      </p>

      <ControlRow>
        <RangeControl
          label="Field"
          max={1.4}
          min={0.55}
          onChange={setFieldScale}
          step={0.01}
          value={fieldScale}
        />
        <RangeControl
          label="Sensitivity"
          max={1.4}
          min={0.45}
          onChange={setSensorGain}
          step={0.01}
          value={sensorGain}
        />
        <RangeControl
          label="Noise"
          max={0.28}
          min={0}
          onChange={setNoise}
          step={0.01}
          value={noise}
        />
        <ToggleChip
          active={showTrail}
          label="Trail"
          onClick={() => setShowTrail((current) => !current)}
        />
        <ActionButton onClick={resetRun}>Reset run</ActionButton>
        {preset.allowSourceMove ? (
          <ActionButton onClick={restoreField}>Restore field</ActionButton>
        ) : null}
      </ControlRow>

      <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-stone-700">
        <span className="mr-2 text-[11px] uppercase tracking-[0.24em] text-black">
          Demonstration
        </span>
        {preset.caption}
      </p>
    </section>
  );
}
