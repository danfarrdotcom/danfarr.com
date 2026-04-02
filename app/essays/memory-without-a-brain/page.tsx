'use client';

import { useEffect, useRef } from 'react';

import ArticleSection from '../../../components/braitenberg/article-section';
import Callout from '../../../components/braitenberg/callout';
import FigureBlock from '../../../components/braitenberg/figure-block';
import {
  ActionButton,
  ControlRow,
} from '../../../components/braitenberg/control-row';
import EssayShell from '../../../components/essay-shell';
import { makeEngine } from './engine';

export default function MemoryPage() {
  return (
    <EssayShell
      dek="Ants don't understand how to read maps. There is no foreman, no schematic, and no ant that has seen both the nest and the food simultaneously and plotted the optimal route, so how does the colony find its way? The answer is that it doesn't find its way, it writes its way. The ground itself becomes the colony's external memory, and every ant is a reader and a writer of that memory. This is stigmergy, and it is a powerful example of how a memory system can be architected without a brain."
      title="Memory without a brain"
    >
      <ArticleSection>
        <p>
          The colony solves a complex spatial optimisation problem by using only
          a single mechanism: writing to the ground and reading from the ground.
        </p>
        <p>
          This is <strong>stigmergy</strong>: coordination through a shared,
          writable medium. The ground itself becomes the colony&apos;s external
          memory. Every ant is simultaneously a reader, a writer, and a function
          of what has been written before.
        </p>
        <p>
          What makes it worth studying now is not the ants. It is the
          architecture of the memory itself. The pheromone field is not just
          clever biology; it is a primitive but illuminating instance of the
          same tradeoffs that define every memory system in artificial
          intelligence:
          <em> what to encode, how long to retain it, and when to forget.</em>
        </p>
      </ArticleSection>

      <ArticleSection title="Memory Without a Brain">
        <p>
          The pheromone trail is, in computational terms, a
          <strong> write-once, decay-over-time key-value store</strong>. The key
          is a grid coordinate. The value is a scalar concentration.
        </p>
        <p>
          Every passing ant increments the value at its current position. Left
          alone, every cell&apos;s value approaches zero exponentially. The
          reading operation, an ant sampling concentration in three forward
          directions and steering toward the maximum, is essentially a gradient
          ascent over this field.
        </p>
        <p>
          There is no central index, no pointer structure, no query language.
          The entire computation is local. And yet the colony &quot;knows&quot;
          where food is. Or rather, the ground knows, and the ants are the query
          interface.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          This is the first deep parallel with modern AI:
          <strong> knowledge encoded in weights rather than symbols</strong>. A
          trained neural network does not store facts in named slots; it
          distributes them as superimposed patterns across millions of
          floating-point values, readable only by running a forward pass.
        </p>
      </Callout>

      <ArticleSection>
        <p>
          The simulation below shows the raw pheromone field, with no ants
          rendered, only the gradient they collectively write. Watch how quickly
          a meaningful spatial structure emerges from purely local writes.
        </p>
      </ArticleSection>

      <Sim1 />

      <ArticleSection title="Learn to Forget">
        <p>
          Here is a counterintuitive truth about memory systems:
          <strong>
            {' '}
            the ability to forget is as important as the ability to remember.
          </strong>
          Evaporation is not a limitation of ant biology; it is load-bearing.
        </p>
        <p>
          Without evaporation, every trail ever laid persists indefinitely.
          Early random walks etch permanent paths across the ground. When a food
          source is discovered, the ants must compete against the noise of every
          previous failed search.
        </p>
        <p>
          This maps directly onto the stability-plasticity dilemma in machine
          learning: every learning system must negotiate retention against
          adaptation somewhere.
        </p>
      </ArticleSection>

      <Callout label="Quoted point">
        <p>
          &quot;Memory without forgetting is not perfect recall; it is noise
          accumulation.&quot;
        </p>
        <p>Dorigo &amp; Gambardella, 1997.</p>
      </Callout>

      <ArticleSection>
        <p>
          In the ant model, evaporation rate is the negotiation dial. The
          simulation below exposes it directly.
        </p>
      </ArticleSection>

      <Sim2 />

      <ArticleSection>
        <p>
          At high retention, trails calcify and the colony locks early. At high
          decay, trails vanish before a returning ant reaches home. The optimal
          sits in a narrow band.
        </p>
      </ArticleSection>

      <ArticleSection title="Dual Memory Channels">
        <p>
          Real ant colonies maintain chemically distinct pheromones for
          different purposes. The canonical foraging model uses two:
          <strong> home trail</strong> and a <strong>food trail</strong>.
        </p>
        <p>
          This is a form of
          <strong> context-dependent memory retrieval</strong>. The same spatial
          location holds two independent values, and which one an agent reads
          depends on the agent&apos;s current state.
        </p>
        <p>
          This structure appears in modern AI whenever the same stored
          representation can be queried differently for different purposes.
        </p>
      </ArticleSection>

      <Sim3 />

      <ArticleSection title="Credit Assignment in Space">
        <p>
          One of the hardest problems in any learning system is
          <strong> credit assignment</strong>: if an agent takes a sequence of
          actions and eventually receives a reward, which actions caused it?
        </p>
        <p>
          The ant colony&apos;s solution is elegant and implicit. Shorter paths
          get traversed more often per unit time, so they receive more
          reinforcement per unit time. Path length literally becomes its own
          reward signal, written into the medium.
        </p>
        <p>
          This is temporal difference learning, avant la lettre. The eligibility
          trace is the physical trail left by the agent&apos;s body, and time
          discount is implemented by evaporation.
        </p>
      </ArticleSection>

      <ArticleSection title="To Explore or to Exploit">
        <p>
          The single most studied tradeoff in reinforcement learning is
          <strong> exploration vs. exploitation</strong>. In the ant model, this
          dial has a name: <strong>randomness</strong>.
        </p>
        <p>
          When the random component is high relative to the gradient signal, the
          ant wanders. When the gradient signal dominates, the ant follows
          established trails.
        </p>
        <p>
          Trail strength changes this ratio dynamically, so the colony
          self-regulates between exploration and exploitation without a central
          controller setting any parameter.
        </p>
      </ArticleSection>

      <Sim4 />

      <ArticleSection title="Positive Feedback and Convergence">
        <p>
          The colony finds the shortest path through
          <strong> positive feedback</strong>: good paths attract more ants,
          which make them better, which attracts more ants.
        </p>
        <p>
          But positive feedback without a counter-force is explosive.
          Evaporation and stochastic steering are the counter-forces that
          prevent premature convergence and allow the system to respond when the
          environment changes.
        </p>
        <p>
          The complete simulation below is the system&apos;s catastrophic
          forgetting test: can accumulated memory of the old path be unlearned
          fast enough for the colony to adapt?
        </p>
      </ArticleSection>

      <Sim5 />

      <ArticleSection title="Ant Colony Optimisation">
        <p>
          Marco Dorigo&apos;s formalisation of Ant Colony Optimisation in 1992
          was part of the broader emergence of
          <strong> swarm intelligence</strong> as a computational paradigm.
        </p>
        <p>
          The key contribution was not merely a new algorithm. It was an
          existence proof that useful, adaptive computation could arise from
          simple agents interacting through shared memory, with no agent needing
          global knowledge.
        </p>
        <p>And the evaporation rate became the learning-rate schedule.</p>
      </ArticleSection>

      <Sandbox />
    </EssayShell>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SIMULATION COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

function Sim1() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const engine = makeEngine(canvasRef.current!, {
            antCount: 130,
            showAnts: false,
            followPhero: true,
            dualColor: false,
            evap: 0.993,
            deposit: 70,
            setup({ placeFood, COLS, ROWS }: any) {
              placeFood(Math.floor(COLS * 0.73), Math.floor(ROWS * 0.28), 35);
              placeFood(Math.floor(COLS * 0.79), Math.floor(ROWS * 0.72), 35);
            },
          });
          if (engine) engine.start();
          observer.disconnect();
          return () => engine?.cleanup();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <FigureBlock
      caption="A collective memory appears as a writable field before any explicit map exists. The colony accumulates structure locally and reads it back as guidance."
      figure="01"
      label="Pheromone field only"
    >
      <div className="overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="block w-full bg-white"
          height={200}
        />
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
          antCount: 100,
          showAnts: true,
          followPhero: true,
          evap: 0.994,
          deposit: 65,
          setup({ placeFood, COLS, ROWS }: any) {
            placeFood(Math.floor(COLS * 0.73), Math.floor(ROWS * 0.5), 45);
          },
        });
        if (engine) engine.start();
        observer.disconnect();
      }
    });
    observer.observe(canvasRef.current);

    const handleInput = (e: Event) => {
      if (engine) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        engine.p.evap = val;
        if (valRef.current) valRef.current.textContent = val.toFixed(4);
      }
    };
    if (sliderRef.current)
      sliderRef.current.addEventListener('input', handleInput);

    return () => {
      observer.disconnect();
      engine?.cleanup();
      if (sliderRef.current)
        sliderRef.current.removeEventListener('input', handleInput);
    };
  }, []);

  return (
    <FigureBlock
      caption="Forgetting is not a defect in the memory system. It is the mechanism that keeps the colony from becoming trapped by stale paths."
      figure="02"
      label="Memory decay interactive"
    >
      <div className="overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="block w-full bg-white"
          height={200}
        />
      </div>
      <ControlRow>
        <label className="min-w-[220px] px-2 py-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
            <span>Decay rate</span>
            <span ref={valRef}>0.9940</span>
          </div>
          <input
            ref={sliderRef}
            type="range"
            min="0.970"
            max="0.9995"
            step="0.0005"
            defaultValue="0.994"
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
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const engine = makeEngine(canvasRef.current!, {
          antCount: 110,
          showAnts: true,
          followPhero: true,
          dualColor: true,
          evap: 0.993,
          deposit: 65,
          setup({ placeFood, COLS, ROWS }: any) {
            placeFood(Math.floor(COLS * 0.76), Math.floor(ROWS * 0.3), 30);
            placeFood(Math.floor(COLS * 0.78), Math.floor(ROWS * 0.7), 30);
          },
        });
        if (engine) engine.start();
        observer.disconnect();
        return () => engine?.cleanup();
      }
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <FigureBlock
      caption="The same terrain can hold multiple memories at once. Which channel matters depends on the agent’s current state."
      figure="03"
      label="Dual channel memory"
    >
      <div className="overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="block w-full bg-white"
          height={220}
        />
      </div>
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-stone-700">
        <span>Darker weave: home trail</span>
        <span>Lighter weave: food trail</span>
        <span>Outlined ant: carrying food</span>
      </p>
    </FigureBlock>
  );
}

function Sim4() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let engine: any;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        engine = makeEngine(canvasRef.current!, {
          antCount: 100,
          showAnts: true,
          followPhero: true,
          randomness: 0.45,
          evap: 0.993,
          setup({ placeFood, COLS, ROWS }: any) {
            placeFood(Math.floor(COLS * 0.73), Math.floor(ROWS * 0.5), 40);
          },
        });
        if (engine) engine.start();
        observer.disconnect();
      }
    });
    observer.observe(canvasRef.current);

    const handleInput = (e: Event) => {
      if (engine) {
        const val = parseFloat((e.target as HTMLInputElement).value);
        engine.p.randomness = val;
        if (valRef.current) valRef.current.textContent = val.toFixed(2);
      }
    };
    if (sliderRef.current)
      sliderRef.current.addEventListener('input', handleInput);

    return () => {
      observer.disconnect();
      engine?.cleanup();
      if (sliderRef.current)
        sliderRef.current.removeEventListener('input', handleInput);
    };
  }, []);

  return (
    <FigureBlock
      caption="Exploration and exploitation are not separately commanded. They emerge from the changing balance between noise and trail strength."
      figure="04"
      label="Exploration vs exploitation"
    >
      <div className="overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="block w-full bg-white"
          height={200}
        />
      </div>
      <ControlRow>
        <label className="min-w-[220px] px-2 py-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
            <span>Randomness</span>
            <span ref={valRef}>0.45</span>
          </div>
          <input
            ref={sliderRef}
            type="range"
            min="0.02"
            max="1.5"
            step="0.01"
            defaultValue="0.45"
            className="w-full accent-black"
          />
        </label>
      </ControlRow>
    </FigureBlock>
  );
}

function Sim5() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const engine = makeEngine(canvasRef.current!, {
            antCount: 130,
            showAnts: true,
            followPhero: true,
            evap: 0.993,
            deposit: 65,
            setup({ placeFood, COLS, ROWS }: any) {
              placeFood(Math.floor(COLS * 0.55), Math.floor(ROWS * 0.2), 30);
              placeFood(Math.floor(COLS * 0.76), Math.floor(ROWS * 0.5), 40);
              placeFood(Math.floor(COLS * 0.55), Math.floor(ROWS * 0.8), 30);
            },
          });
          if (engine) engine.start();
          observer.disconnect();
          return () => engine?.cleanup();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <FigureBlock
      caption="When resources disappear, the colony has to unlearn its best path quickly enough to converge on the next one."
      figure="05"
      label="Resource depletion"
    >
      <div className="overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="block w-full bg-white"
          height={240}
        />
      </div>
    </FigureBlock>
  );
}

function Sandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);

  // Refs for display values
  const refs = {
    evap: useRef<HTMLSpanElement>(null),
    rand: useRef<HTMLSpanElement>(null),
    stats: {
      ants: useRef<HTMLSpanElement>(null),
      food: useRef<HTMLSpanElement>(null),
      mem: useRef<HTMLSpanElement>(null),
    },
  };

  const inputRefs = {
    evap: useRef<HTMLInputElement>(null),
    rand: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple responsive width logic
    const parent = canvasRef.current.parentElement;
    if (parent) {
      canvasRef.current.width = parent.clientWidth;
    }

    const engine = makeEngine(canvasRef.current, {
      antCount: 150,
      showAnts: true,
      followPhero: true,
      dualColor: false,
      evap: 0.994,
      deposit: 65,
      setup({ placeFood, COLS, ROWS }: any) {
        placeFood(Math.floor(COLS * 0.76), Math.floor(ROWS * 0.25), 40);
        placeFood(Math.floor(COLS * 0.8), Math.floor(ROWS * 0.75), 40);
        placeFood(Math.floor(COLS * 0.54), Math.floor(ROWS * 0.14), 28);
      },
      onTick({ tick, foods, ants, collected, memLoad }: any) {
        if (refs.stats.ants.current)
          refs.stats.ants.current.textContent = ants.length;
        if (refs.stats.food.current)
          refs.stats.food.current.textContent = foods.length;
        if (refs.stats.mem.current)
          refs.stats.mem.current.textContent = (memLoad * 100).toFixed(1) + '%';
      },
    });

    engineRef.current = engine;
    engine?.start();

    return () => {
      engine?.cleanup();
    };
  }, []);

  const updateParam = (key: string, val: number) => {
    if (!engineRef.current) return;
    engineRef.current.p[key] = val;
    // @ts-ignore
    const ref = refs[key.replace('randomness', 'rand')];
    if (ref && ref.current) {
      if (key === 'evap') ref.current.textContent = val.toFixed(4);
      else ref.current.textContent = val.toFixed(2);
    }
  };

  const reset = () => {
    if (engineRef.current) {
      engineRef.current.p.anneal = false;
      engineRef.current.reset();
    }
  };

  return (
    <FigureBlock
      caption="Open the colony model and tune evaporation and randomness directly. The memory field thickens, thins, and reroutes as the balance changes."
      figure="06"
      label="Open plate"
    >
      <div className="overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="block w-full bg-white"
          height={400}
        />
      </div>

      <div className="grid gap-8 border-t border-stone-300 pt-4 md:grid-cols-[minmax(0,1fr)_200px]">
        <div className="space-y-4">
          <label className="block px-2 py-1">
            <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
              <span>Evaporation</span>
              <span ref={refs.evap}>0.9940</span>
            </div>
            <input
              ref={inputRefs.evap}
              type="range"
              min="0.970"
              max="0.9995"
              step="0.0005"
              defaultValue="0.994"
              className="w-full accent-black"
              onInput={(e) =>
                updateParam(
                  'evap',
                  parseFloat((e.target as HTMLInputElement).value)
                )
              }
            />
          </label>

          <label className="block px-2 py-1">
            <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
              <span>Randomness</span>
              <span ref={refs.rand}>0.45</span>
            </div>
            <input
              ref={inputRefs.rand}
              type="range"
              min="0.01"
              max="1.5"
              step="0.01"
              defaultValue="0.45"
              className="w-full accent-black"
              onInput={(e) =>
                updateParam(
                  'randomness',
                  parseFloat((e.target as HTMLInputElement).value)
                )
              }
            />
          </label>

          <ControlRow>
            <ActionButton onClick={reset}>Reset world</ActionButton>
            <ActionButton onClick={() => engineRef.current?.addFood(30)}>
              Add food
            </ActionButton>
          </ControlRow>
        </div>

        <div className="space-y-3 border-t border-stone-300 pt-4 text-[0.98rem] leading-7 text-stone-700 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="flex justify-between gap-6">
            <span>Ant population</span>
            <span ref={refs.stats.ants} className="text-black">
              —
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Food sources</span>
            <span ref={refs.stats.food} className="text-black">
              —
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Memory load</span>
            <span ref={refs.stats.mem} className="text-black">
              —
            </span>
          </div>
        </div>
      </div>
    </FigureBlock>
  );
}
