'use client';

import React, { useEffect, useRef } from 'react';
import { makeEngine } from './engine';

export default function FlockPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black font-sans text-gray-900 dark:text-gray-100 px-6 py-12 md:py-20 selection:bg-blue-100 dark:selection:bg-blue-900">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            The shape of a flock
          </h1>
        </div>

        <div className="prose prose-p:text-xl prose-2xl dark:prose-invert prose-blue max-w-none">
          <p className="lead text-xl md:text-2xl leading-relaxed font-light text-gray-800 dark:text-gray-200 mb-8">
            A starling murmuration looks like choreography, but there is no
            choreographer. Tens of thousands of birds fold, split, and rejoin as
            if sharing a single intention. What you are seeing is not central
            planning, but local sensing: each bird updates from nearby
            neighbors, and the sky itself becomes computation.
          </p>

          <p>
            The classical model is simple. Each bird balances three forces:
            <strong> separation</strong> (avoid collisions),
            <strong> alignment</strong> (match heading), and
            <strong> cohesion</strong> (stay with the group). No bird knows the
            global geometry. Yet coherent structures emerge that look designed.
          </p>

          <p>
            This is useful now because the same pattern appears across modern AI
            and complex systems: global behaviour formed from local update
            rules. In transformers, graph neural nets, and multi-agent RL, we
            keep rediscovering the same principle: large-scale order can be
            produced without any single unit representing the whole.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Local Rules, Global Geometry
          </h2>

          <p>
            In computational terms, murmuration is a dynamic vector field. Each
            bird writes velocity into space by moving through it, and every
            nearby bird reads that motion as signal. The flock boundary, the
            internal vortices, and the wavefronts are all side effects of this
            repeated local read/write loop.
          </p>

          <div className="my-8 p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <h3 className="text-md font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Key Concept
            </h3>
            <p className="m-0 text-base">
              Murmuration is distributed control:{' '}
              <strong>policy without a planner</strong>. Each bird executes a
              tiny local policy; the flock is the aggregate rollout.
            </p>
          </div>

          <p>
            The first simulation strips this down to the raw flow of headings.
            Watch for laminar bands and rotating pockets appearing from nothing
            but local coupling.
          </p>
        </div>

        <Sim1 />

        <div className="prose prose-xl dark:prose-invert prose-blue max-w-none mt-12">
          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Stability vs Responsiveness
          </h2>

          <p>
            Real flocks must be stable enough to hold shape and responsive
            enough to turn instantly under threat. In the model, this tradeoff
            sits in the alignment coefficient. Too low, and the flock dissolves
            into noise. Too high, and it becomes rigid, slow to adapt, easy to
            over-steer.
          </p>

          <p>
            This is the same tension as gain tuning in control systems and
            learning-rate schedules in optimization. Coordination requires a
            narrow operating band.
          </p>
        </div>

        <Sim2 />

        <div className="prose prose-xl dark:prose-invert prose-blue max-w-none mt-12">
          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Information Through Density
          </h2>

          <p>
            A flock also encodes information in density. Compressed regions
            carry stronger directional consensus; sparse regions allow
            exploratory drift. If color maps local density, the flock reveals
            where control is concentrated.
          </p>

          <p>
            In graph terms, neighborhood degree modulates influence. High-degree
            patches stabilize headings; low-degree fringes test alternatives.
          </p>
        </div>

        <Sim3 />

        <div className="prose prose-xl dark:prose-invert prose-blue max-w-none mt-12">
          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Perturbation and Recovery
          </h2>

          <p>
            Murmurations are famous for rapid turns under predation. The key is
            not just reaction speed but recovery: can the flock absorb a shock,
            propagate a wave, and restore coherent motion without fragmenting?
          </p>

          <p>
            In the simulation, add a predator and observe how avoidance pressure
            reshapes the topology. Then remove it and watch re-convergence.
          </p>
        </div>

        <Sim4 />

        <div className="prose prose-xl dark:prose-invert prose-blue max-w-none mt-12 mb-16">
          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Phase Transitions in Coordination
          </h2>

          <p>
            Flocks exhibit phase-like changes: below a threshold of coupling,
            motion is disordered; above it, coherent flow appears. Push too far,
            and flexibility collapses. The practical lesson is universal:
            complex systems need enough coupling to coordinate and enough noise
            to adapt.
          </p>

          <p>
            This is why murmuration keeps resurfacing as a metaphor in machine
            intelligence, robotics swarms, and distributed systems. It is a
            living example of emergent optimization under local information
            constraints.
          </p>
        </div>

        <Sim5 />

        <hr className="my-12 border-gray-200 dark:border-gray-800" />

        <Sandbox />
      </div>
    </main>
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
    <div className="my-8 overflow-hidden">
      <div className="py-2 bg-white flex justify-between items-center text-sm">
        <span>FIG. 01</span>
        <span>HEADING FIELD</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={220} />
    </div>
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
    <div className="my-8 overflow-hidden">
      <div className="py-2 bg-white flex justify-between items-center text-sm">
        <span>FIG. 02</span>
        <span>ALIGNMENT TUNING</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={220} />
      <div className="py-4 bg-white flex items-center gap-4 text-md">
        <span className="text-xs text-gray-500 uppercase">Alignment</span>
        <input
          ref={sliderRef}
          type="range"
          min="0.01"
          max="0.18"
          step="0.001"
          defaultValue="0.065"
          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <span ref={valRef} className="text-xs w-16 text-right">
          0.065
        </span>
      </div>
    </div>
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
    <div className="my-8 overflow-hidden">
      <div className="py-2 bg-white flex justify-between items-center text-sm">
        <span>FIG. 03</span>
        <span>DENSITY MAP</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={220} />
      <div className="p-3 flex gap-4 justify-center bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4c7fd1]"></span> Low local
          coupling
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#d17a4c]"></span> High local
          coupling
        </div>
      </div>
    </div>
  );
}

function Sim4() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toggleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let engine: any;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        engine = makeEngine(canvasRef.current!, {
          birdCount: 260,
          colorMode: 'heading',
          predator: false,
          separation: 2.2,
          alignment: 0.065,
          cohesion: 0.005,
          predatorAvoid: 13,
          predatorRange: 130,
        });
        engine?.start();
        observer.disconnect();
      }
    });

    observer.observe(canvasRef.current);

    const handleToggle = (e: Event) => {
      if (!engine) return;
      const checked = (e.target as HTMLInputElement).checked;
      if (checked) {
        engine.p.predator = true;
        engine.addPredator();
      } else {
        engine.p.predator = false;
        engine.removePredators();
      }
    };

    toggleRef.current?.addEventListener('change', handleToggle);

    return () => {
      observer.disconnect();
      engine?.cleanup();
      toggleRef.current?.removeEventListener('change', handleToggle);
    };
  }, []);

  return (
    <div className="my-8 overflow-hidden">
      <div className="py-2 bg-white flex justify-between items-center text-sm">
        <span>FIG. 04</span>
        <span>PREDATOR PERTURBATION</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={220} />
      <div className="py-4 bg-white flex items-center gap-3 text-md">
        <input ref={toggleRef} type="checkbox" id="pred-toggle" />
        <label
          htmlFor="pred-toggle"
          className="text-xs text-gray-500 uppercase"
        >
          Enable predator
        </label>
      </div>
    </div>
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
    <div className="my-8 overflow-hidden">
      <div className="py-2 bg-white flex justify-between items-center text-sm">
        <span>FIG. 05</span>
        <span>COUPLING THRESHOLD</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={240} />
      <div className="py-4 bg-white flex items-center gap-4 text-md">
        <span className="text-xs text-gray-500 uppercase">Separation</span>
        <input
          ref={noiseRef}
          type="range"
          min="0.8"
          max="4.0"
          step="0.05"
          defaultValue="2.2"
          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <span ref={valRef} className="text-xs w-16 text-right">
          2.20
        </span>
      </div>
    </div>
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
    <div className="my-12 overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center">
        <h3 className="font-bold text-lg">Interactive Sandbox</h3>
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          EXPERIMENTAL
        </span>
      </div>

      <canvas ref={canvasRef} className="w-full block bg-black" height={420} />

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-md font-medium text-gray-700 dark:text-gray-300">
                Alignment
              </label>
              <span ref={refs.align} className="text-xs text-gray-500">
                0.065
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.18"
              step="0.001"
              defaultValue="0.065"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              onInput={(e) =>
                updateParam(
                  'alignment',
                  parseFloat((e.target as HTMLInputElement).value)
                )
              }
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-md font-medium text-gray-700 dark:text-gray-300">
                Cohesion
              </label>
              <span ref={refs.coh} className="text-xs text-gray-500">
                0.005
              </span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.02"
              step="0.001"
              defaultValue="0.005"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              onInput={(e) =>
                updateParam(
                  'cohesion',
                  parseFloat((e.target as HTMLInputElement).value)
                )
              }
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-md font-medium text-gray-700 dark:text-gray-300">
                Separation
              </label>
              <span ref={refs.sep} className="text-xs text-gray-500">
                2.20
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="4.0"
              step="0.05"
              defaultValue="2.2"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              onInput={(e) =>
                updateParam(
                  'separation',
                  parseFloat((e.target as HTMLInputElement).value)
                )
              }
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={reset}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset Flock
            </button>
            <button
              onClick={() => engineRef.current?.addPredator()}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              + Add Predator
            </button>
            <button
              onClick={() => engineRef.current?.scatter()}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Scatter
            </button>
          </div>
        </div>

        <div className="md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-8 flex flex-col justify-center space-y-2 text-md text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Bird count:</span>
            <span
              ref={refs.stats.birds}
              className="font-bold text-gray-900 dark:text-gray-100"
            >
              —
            </span>
          </div>
          <div className="flex justify-between">
            <span>Order parameter:</span>
            <span
              ref={refs.stats.order}
              className="font-bold text-gray-900 dark:text-gray-100"
            >
              —
            </span>
          </div>
          <div className="flex justify-between">
            <span>Local density:</span>
            <span
              ref={refs.stats.density}
              className="font-bold text-gray-900 dark:text-gray-100"
            >
              —
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
