'use client';

import { useEffect, useRef, useState } from 'react';

import ArticleSection from '../../../components/braitenberg/article-section';
import Callout from '../../../components/braitenberg/callout';
import FigureBlock from '../../../components/braitenberg/figure-block';
import {
  ActionButton,
  ControlRow,
  ToggleChip,
} from '../../../components/braitenberg/control-row';
import EssayShell from '../../../components/essay-shell';
import { makeEngine } from './engine';

export default function FlockPage() {
  return (
    <EssayShell
      dek="A starling murmuration looks like choreography, but there is no choreographer. Tens of thousands of birds fold, split, and rejoin through local sensing alone, until the sky itself starts to look like computation."
      readingTime="9 min read"
      title="The shape of a flock"
    >
      <ArticleSection>
        <p>
          The classical model is simple. Each bird balances three forces:
          <strong> separation</strong> (avoid collisions),
          <strong> alignment</strong> (match heading), and
          <strong> cohesion</strong> (stay with the group). No bird knows the
          global geometry. Yet coherent structures emerge that look designed.
        </p>
        <p>
          This is useful now because the same pattern appears across modern AI
          and complex systems: global behaviour formed from local update rules.
          In transformers, graph neural nets, and multi-agent reinforcement
          learning, we keep rediscovering the same principle: large-scale order
          can be produced without any single unit representing the whole.
        </p>
      </ArticleSection>

      <ArticleSection title="Local Rules, Global Geometry">
        <p>
          In computational terms, murmuration is a dynamic vector field. Each
          bird writes velocity into space by moving through it, and every nearby
          bird reads that motion as signal. The flock boundary, the internal
          vortices, and the wavefronts are all side effects of this repeated
          local read/write loop.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Murmuration is distributed control:
          <strong> policy without a planner</strong>. Each bird executes a tiny
          local policy; the flock is the aggregate rollout.
        </p>
      </Callout>

      <ArticleSection>
        <p>
          The first simulation strips this down to the raw flow of headings.
          Watch for laminar bands and rotating pockets appearing from nothing
          but local coupling.
        </p>
      </ArticleSection>

        <Sim1 />

      <ArticleSection title="Stability vs Responsiveness">
        <p>
          Real flocks must be stable enough to hold shape and responsive enough
          to turn instantly under threat. In the model, this tradeoff sits in
          the alignment coefficient. Too low, and the flock dissolves into
          noise. Too high, and it becomes rigid, slow to adapt, easy to
          over-steer.
        </p>
        <p>
          This is the same tension as gain tuning in control systems and
          learning-rate schedules in optimization. Coordination requires a
          narrow operating band.
        </p>
      </ArticleSection>

        <Sim2 />

      <ArticleSection title="Information Through Density">
        <p>
          A flock also encodes information in density. Compressed regions carry
          stronger directional consensus; sparse regions allow exploratory
          drift. If tone tracks local density, the flock reveals where control
          is concentrated.
        </p>
        <p>
          In graph terms, neighborhood degree modulates influence. High-degree
          patches stabilize headings; low-degree fringes test alternatives.
        </p>
      </ArticleSection>

        <Sim3 />

      <ArticleSection title="Perturbation and Recovery">
        <p>
          Murmurations are famous for rapid turns under predation. The key is
          not just reaction speed but recovery: can the flock absorb a shock,
          propagate a wave, and restore coherent motion without fragmenting?
        </p>
        <p>
          In the simulation, add a predator and observe how avoidance pressure
          reshapes the topology. Then remove it and watch re-convergence.
        </p>
      </ArticleSection>

        <Sim4 />

      <ArticleSection title="Phase Transitions in Coordination">
        <p>
          Flocks exhibit phase-like changes: below a threshold of coupling,
          motion is disordered; above it, coherent flow appears. Push too far,
          and flexibility collapses. The practical lesson is universal: complex
          systems need enough coupling to coordinate and enough noise to adapt.
        </p>
        <p>
          This is why murmuration keeps resurfacing as a metaphor in machine
          intelligence, robotics swarms, and distributed systems. It is a living
          example of emergent optimization under local information constraints.
        </p>
      </ArticleSection>

        <Sim5 />

        <Sandbox />
    </EssayShell>
  );
}

function Sim1() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let engine: any;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          engine = makeEngine(canvasRef.current!, {
            birdCount: 320,
            showBirds: true,
            showTrails: true,
            colorMode: 'heading',
            separation: 2.1,
            alignment: 0.07,
            cohesion: 0.005,
            visualRange: 58,
          });
          engine?.start();
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvasRef.current);
    return () => {
      observer.disconnect();
      engine?.cleanup();
    };
  }, []);

  return (
    <FigureBlock
      caption="Local heading updates produce coherent bands and rotating pockets without any bird representing the global shape."
      figure="01"
      label="Heading field"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-white" height={220} />
      </div>
    </FigureBlock>
  );
}

function Sim2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let engine: any;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        engine = makeEngine(canvasRef.current!, {
          birdCount: 280,
          colorMode: 'mono',
          separation: 2.2,
          alignment: 0.065,
          cohesion: 0.005,
          visualRange: 60,
        });
        engine?.start();
        observer.disconnect();
      }
    });

    observer.observe(canvasRef.current);

    const handleInput = (e: Event) => {
      if (!engine) return;
      const value = parseFloat((e.target as HTMLInputElement).value);
      engine.p.alignment = value;
      if (valRef.current) valRef.current.textContent = value.toFixed(3);
    };

    sliderRef.current?.addEventListener('input', handleInput);

    return () => {
      observer.disconnect();
      engine?.cleanup();
      sliderRef.current?.removeEventListener('input', handleInput);
    };
  }, []);

  return (
    <FigureBlock
      caption="Coordination lives in a narrow gain range. Too little alignment dissolves the flock; too much makes it rigid."
      figure="02"
      label="Alignment tuning"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-white" height={220} />
      </div>
      <ControlRow>
        <label className="min-w-[220px] px-2 py-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
            <span>Alignment</span>
            <span ref={valRef}>0.065</span>
          </div>
          <input
            ref={sliderRef}
            type="range"
            min="0.01"
            max="0.18"
            step="0.001"
            defaultValue="0.065"
            className="w-full accent-black"
          />
        </label>
      </ControlRow>
    </FigureBlock>
  );
}

function Sim3() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let engine: any;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        engine = makeEngine(canvasRef.current!, {
          birdCount: 300,
          colorMode: 'density',
          showTrails: false,
          separation: 2.4,
          alignment: 0.06,
          cohesion: 0.0055,
          visualRange: 65,
        });
        engine?.start();
        observer.disconnect();
      }
    });

    observer.observe(canvasRef.current);
    return () => {
      observer.disconnect();
      engine?.cleanup();
    };
  }, []);

  return (
    <FigureBlock
      caption="Density acts like a moving concentration of control: compressed regions stabilize headings while sparse fringes explore."
      figure="03"
      label="Density map"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-black" height={220} />
      </div>
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-stone-700">
        <span>Lighter: low local coupling</span>
        <span>Darker: high local coupling</span>
      </p>
    </FigureBlock>
  );
}

function Sim4() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const [predatorEnabled, setPredatorEnabled] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        engineRef.current = makeEngine(canvasRef.current!, {
          birdCount: 260,
          colorMode: 'heading',
          predator: false,
          separation: 2.2,
          alignment: 0.065,
          cohesion: 0.005,
          predatorAvoid: 13,
          predatorRange: 130,
        });
        engineRef.current?.start();
        observer.disconnect();
      }
    });

    observer.observe(canvasRef.current);

    return () => {
      observer.disconnect();
      engineRef.current?.cleanup();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;

    if (!engine) {
      return;
    }

    if (predatorEnabled) {
      engine.p.predator = true;
      engine.addPredator();
      return;
    }

    engine.p.predator = false;
    engine.removePredators();
  }, [predatorEnabled]);

  return (
    <FigureBlock
      caption="Predation tests not just reaction speed but recovery: whether the flock can absorb a disturbance and recover coherent motion."
      figure="04"
      label="Predator perturbation"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-white" height={220} />
      </div>
      <ControlRow>
        <ToggleChip
          active={predatorEnabled}
          label={predatorEnabled ? 'Predator on' : 'Predator off'}
          onClick={() => setPredatorEnabled((current) => !current)}
        />
      </ControlRow>
    </FigureBlock>
  );
}

function Sim5() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseRef = useRef<HTMLInputElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let engine: any;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        engine = makeEngine(canvasRef.current!, {
          birdCount: 340,
          colorMode: 'speed',
          separation: 2.2,
          alignment: 0.07,
          cohesion: 0.005,
          showTrails: true,
          maxSpeed: 4.2,
        });
        engine?.start();
        observer.disconnect();
      }
    });

    observer.observe(canvasRef.current);

    const handleInput = (e: Event) => {
      if (!engine) return;
      const value = parseFloat((e.target as HTMLInputElement).value);
      engine.p.separation = value;
      if (valRef.current) valRef.current.textContent = value.toFixed(2);
    };

    noiseRef.current?.addEventListener('input', handleInput);

    return () => {
      observer.disconnect();
      engine?.cleanup();
      noiseRef.current?.removeEventListener('input', handleInput);
    };
  }, []);

  return (
    <FigureBlock
      caption="Push coupling too low and the flock disperses; too high and flexibility collapses. The usable regime is a narrow middle band."
      figure="05"
      label="Coupling threshold"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-white" height={240} />
      </div>
      <ControlRow>
        <label className="min-w-[220px] px-2 py-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
            <span>Separation</span>
            <span ref={valRef}>2.20</span>
          </div>
          <input
            ref={noiseRef}
            type="range"
            min="0.8"
            max="4.0"
            step="0.05"
            defaultValue="2.2"
            className="w-full accent-black"
          />
        </label>
      </ControlRow>
    </FigureBlock>
  );
}

function Sandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);

  const refs = {
    align: useRef<HTMLSpanElement>(null),
    coh: useRef<HTMLSpanElement>(null),
    sep: useRef<HTMLSpanElement>(null),
    stats: {
      birds: useRef<HTMLSpanElement>(null),
      order: useRef<HTMLSpanElement>(null),
      density: useRef<HTMLSpanElement>(null),
    },
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const parent = canvasRef.current.parentElement;
    if (parent) canvasRef.current.width = parent.clientWidth;

    const engine = makeEngine(canvasRef.current, {
      birdCount: 320,
      separation: 2.2,
      alignment: 0.065,
      cohesion: 0.005,
      colorMode: 'heading',
      showTrails: true,
      onTick({ birdCount, order, avgDensity }: any) {
        if (refs.stats.birds.current)
          refs.stats.birds.current.textContent = String(birdCount);
        if (refs.stats.order.current)
          refs.stats.order.current.textContent = order.toFixed(3);
        if (refs.stats.density.current)
          refs.stats.density.current.textContent = avgDensity.toFixed(1);
      },
    });

    engineRef.current = engine;
    engine?.start();

    return () => engine?.cleanup();
  }, []);

  const updateParam = (key: string, value: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.p[key] = value;

    if (key === 'alignment' && refs.align.current)
      refs.align.current.textContent = value.toFixed(3);
    if (key === 'cohesion' && refs.coh.current)
      refs.coh.current.textContent = value.toFixed(3);
    if (key === 'separation' && refs.sep.current)
      refs.sep.current.textContent = value.toFixed(2);
  };

  const reset = () => {
    engineRef.current?.reset();
  };

  return (
    <FigureBlock
      caption="Open the full flock and tune the three local rules directly. The global form changes without ever introducing a central coordinator."
      figure="06"
      label="Open plate"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-white" height={420} />
      </div>

      <div className="grid gap-8 border-t border-stone-300 pt-4 md:grid-cols-[minmax(0,1fr)_200px]">
        <div className="space-y-4">
          <label className="block px-2 py-1">
            <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
              <span>Alignment</span>
              <span ref={refs.align}>0.065</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.18"
              step="0.001"
              defaultValue="0.065"
              className="w-full accent-black"
              onInput={(e) =>
                updateParam(
                  'alignment',
                  parseFloat((e.target as HTMLInputElement).value)
                )
              }
            />
          </label>

          <label className="block px-2 py-1">
            <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
              <span>Cohesion</span>
              <span ref={refs.coh}>0.005</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.02"
              step="0.001"
              defaultValue="0.005"
              className="w-full accent-black"
              onInput={(e) =>
                updateParam(
                  'cohesion',
                  parseFloat((e.target as HTMLInputElement).value)
                )
              }
            />
          </label>

          <label className="block px-2 py-1">
            <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
              <span>Separation</span>
              <span ref={refs.sep}>2.20</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="4.0"
              step="0.05"
              defaultValue="2.2"
              className="w-full accent-black"
              onInput={(e) =>
                updateParam(
                  'separation',
                  parseFloat((e.target as HTMLInputElement).value)
                )
              }
            />
          </label>

          <ControlRow>
            <ActionButton onClick={reset}>Reset flock</ActionButton>
            <ActionButton onClick={() => engineRef.current?.addPredator()}>
              Add predator
            </ActionButton>
            <ActionButton onClick={() => engineRef.current?.scatter()}>
              Scatter
            </ActionButton>
          </ControlRow>
        </div>

        <div className="space-y-3 border-t border-stone-300 pt-4 text-[0.98rem] leading-7 text-stone-700 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="flex justify-between gap-6">
            <span>Bird count</span>
            <span ref={refs.stats.birds} className="text-black">
              —
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Order parameter</span>
            <span ref={refs.stats.order} className="text-black">
              —
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Local density</span>
            <span ref={refs.stats.density} className="text-black">
              —
            </span>
          </div>
        </div>
      </div>
    </FigureBlock>
  );
}
