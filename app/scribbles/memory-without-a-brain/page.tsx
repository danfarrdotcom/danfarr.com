'use client';

import React, { useEffect, useRef } from 'react';
import { makeEngine } from './engine';

export default function MemoryPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black font-sans text-gray-900 dark:text-gray-100 px-6 py-12 md:py-20 selection:bg-blue-100 dark:selection:bg-blue-900">
      <article className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Memory without a brain
          </h1>
        </div>

        {/* Introduction */}
        <div className="prose prose-p:text-xl prose-2xl dark:prose-invert prose-blue max-w-none">
          <p className="lead text-xl md:text-2xl leading-relaxed font-light text-gray-800 dark:text-gray-200 mb-8">
            Ants don't understand how to read maps.
          </p>
          <p className="lead text-xl md:text-2xl leading-relaxed font-light text-gray-800 dark:text-gray-200 mb-8">
            {' '}
            There is no foreman, no schematic, no ant that has seen both the
            nest and the food simultaneously and plotted the optimal line
            between them. The colony solves a complex spatial optimisation
            problem by using only a single mechanism: writing to the ground, and
            reading from the ground.
          </p>

          <p>
            This is <strong>stigmergy</strong>: coordination through a shared,
            writable medium. The ground itself becomes the colony's external
            memory. Every ant is simultaneously a reader, a writer, and a
            function of what has been written before. The result is a
            distributed memory system of extraordinary adaptive power one that
            neuroscientists, computer scientists, and AI researchers have spent
            decades attempting to reverse-engineer.
          </p>

          <p>
            What makes it worth studying now, in the era of transformer models
            and billion-parameter networks, is not the ants. It is the
            architecture of the memory itself. The pheromone field is not just
            clever biologyit is a primitive but illuminating instance of the
            same tradeoffs that define every memory system in artificial
            intelligence:{' '}
            <em>what to encode, how long to retain it, and when to forget.</em>
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Memory Without a Brain
          </h2>

          <p>
            The pheromone trail is, in computational terms, a{' '}
            <strong>write-once, decay-over-time key-value store</strong>. The
            key is a grid coordinate. The value is a scalar concentrationa
            number between zero and some maximum. Every passing ant increments
            the value at its current position. Left alone, every cell's value
            approaches zero exponentially. The reading operationan ant sampling
            concentration in three forward directions and steering toward the
            maximumis essentially a gradient ascent over this field.
          </p>

          <p>
            There is no central index, no pointer structure, no query language.
            The entire computation is local: an ant only ever interacts with the
            cells directly around it. And yet the colony "knows" where food is.
            Or ratherthe ground knows, and the ants are the query interface.
          </p>

          <div className="my-8 p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <h3 className="text-md font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Key Concept
            </h3>
            <p className="m-0 text-base">
              This is the first deep parallel with modern AI:{' '}
              <strong>knowledge encoded in weights rather than symbols</strong>.
              A trained neural network doesn't store facts in named slotsit
              distributes them as superimposed patterns across millions of
              floating-point values, readable only by running a forward pass.
              The pheromone field is the same idea, in the dirt, at insect
              scale.
            </p>
          </div>

          <p>
            The simulation below shows the raw pheromone fieldno ants rendered,
            only the gradient they collectively write. Watch how quickly a
            meaningful spatial structure emerges from purely local writes. This
            is memory accreting. There is no author; there is only accumulated
            behaviour.
          </p>
        </div>

        <Sim1 />

        <div className="prose prose-xl dark:prose-invert prose-blue max-w-none mt-12">
          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Learn to forget
          </h2>

          <p>
            Here is a counterintuitive truth about memory systems:{' '}
            <strong>
              the ability to forget is as important as the ability to remember.
            </strong>{' '}
            Evaporation is not a limitation of ant biology that a
            better-engineered ant would overcome. It is load-bearing. Remove it,
            and the system breaks in a specific, instructive way.
          </p>

          <p>
            Without evaporation, every trail ever laid persists indefinitely.
            Early random walks etch permanent paths across the ground. When a
            food source is discovered, the ants must compete against the noise
            of every previous failed search. Worse: when the food is exhausted,
            the trail to it keeps attracting ants indefinitely, wasting search
            effort on an empty destination. The colony becomes a prisoner of its
            own history.
          </p>

          <blockquote className="pl-6 border-l-4 border-blue-500 italic text-gray-700 dark:text-gray-300 my-8 py-2 bg-gray-50 dark:bg-gray-900">
            "Memory without forgetting is not perfect recallit is noise
            accumulation."
            <footer className="text-md not-italic text-gray-500 mt-2">
              Dorigo &amp; Gambardella, 1997
            </footer>
          </blockquote>

          <p>
            This maps directly onto a class of problems in machine learning
            called <strong>catastrophic forgetting</strong>, or more precisely,
            the <em>stability–plasticity dilemma</em>: a model that learns new
            information perfectly tends to overwrite old information. A model
            that perfectly retains old information cannot adapt to new data.
            Every learning system must negotiate this tradeoff somewhere.
          </p>

          <p>
            In the ant model, evaporation rate is that negotiation dial. The
            simulation below exposes it directly.
          </p>
        </div>

        <Sim2 />

        <div className="prose prose-xl dark:prose-invert prose-blue max-w-none mt-12">
          <p>
            At high retention (evaporation near 1.0) watch trails calcify: the
            colony locks early, stops exploring. At high decay, trails vanish
            before the returning ant reaches homethe colony never accumulates a
            signal strong enough to follow. The optimal sits in a narrow band,
            and it shifts depending on colony size, environment complexity, and
            how frequently food sources change.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Dual Memory Channels
          </h2>

          <p>
            Real ant colonies maintain chemically distinct pheromones for
            different purposes. The canonical foraging model uses two: a{' '}
            <strong>home trail</strong> (secreted when searching, encoding "I
            came from the nest") and a <strong>food trail</strong> (secreted
            when returning, encoding "this leads to food"). An outbound ant
            reads food-trail to orient toward food; an inbound ant reads
            home-trail to orient toward the nest.
          </p>

          <p>
            This is a form of{' '}
            <strong>context-dependent memory retrieval</strong>. The same
            spatial location holds two independent values, and which one an
            agent reads depends on the agent's current state. The memory system
            is not static storageit is a two-channel signal field that different
            agents interpret differently depending on mode.
          </p>

          <p>
            This structure appears in modern AI in multiple forms. Transformer
            attention mechanisms maintain separate query, key, and value
            projections precisely so that the same stored representation can be
            retrieved by different queries for different purposes. The
            Q-function in reinforcement learning maintains separate value
            estimates for state-action pairs, playing a directly analogous role
            to the two pheromone channels: an agent in state <em>searching</em>{' '}
            queries differently than an agent in state <em>returning</em>.
          </p>
        </div>

        <Sim3 />

        <div className="prose prose-xl dark:prose-invert prose-blue max-w-none mt-12">
          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            04Credit Assignment in Space
          </h2>

          <p>
            One of the hardest problems in any learning system is{' '}
            <strong>credit assignment</strong>: if an agent takes a sequence of
            actions and eventually receives a reward, which actions caused the
            reward? Early actions are temporally distant from outcomes; how does
            the system trace responsibility backwards?
          </p>

          <p>
            The ant colony's solution is elegant and implicit. An ant that finds
            food returns to the nest, depositing food-trail the entire way. The
            density of deposit per unit length is roughly uniform. But the path
            it walked varied in length. The shorter the path, the more times
            that path gets traversed per unit timebecause each round-trip takes
            less time. More traversals means more reinforcement per unit time
            means higher pheromone density. The path length literally becomes
            its own reward signal, written into the medium.
          </p>

          <p>
            This is temporal difference learning, avant la lettre. The
            "eligibility trace"the memory of which states were recently
            visitedis simply the physical trail left by the agent's body.
            Time-discount is implemented by evaporation: older segments of trail
            have had longer to decay. The colony is computing something
            structurally identical to TD(&lambda;), but the &lambda; parameter
            is the pheromone half-life, and the trace is written in chemical ink
            on soil.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            To explore or to exploite
          </h2>

          <p>
            The single most studied tradeoff in reinforcement learning is{' '}
            <strong>exploration vs. exploitation</strong>: should an agent
            follow the best known policy (exploit) or deviate from it to
            discover potentially better alternatives (explore)? Exploit too
            aggressively and you get stuck at a local optimum. Explore too
            broadly and you never converge on any good policy.
          </p>

          <p>
            In the ant model, this dial has a name: <strong>randomness</strong>.
            Each ant, when steering, adds a random perturbation to its angle
            before also steering toward the gradient maximum. When the random
            component is high relative to the gradient signal, the ant wanders.
            When the gradient signal dominates, the ant follows established
            trails.
          </p>

          <p>
            Critically, this ratio changes dynamically with trail strength: a
            weak, nascent trail exerts little pull, so ants near it are
            effectively exploring. A strong, well-reinforced trail dominates the
            local signal, reducing effective randomness and converting nearby
            ants into exploiters. The colony self-regulates between exploration
            and exploitation{' '}
            <em>without a central controller setting any parameter</em>the
            transition is an emergent property of trail dynamics.
          </p>

          <p>
            This self-regulating mechanism is a direct analogue of{' '}
            <strong>simulated annealing</strong> and temperature schedules in
            neural networks: early training with high learning rates and dropout
            is high-temperature exploration; late-stage fine-tuning is
            exploitation of the gradient landscape discovered so far.
          </p>
        </div>

        <Sim4 />

        <div className="prose prose-xl dark:prose-invert prose-blue max-w-none mt-12">
          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Positive Feedback and Convergence
          </h2>

          <p>
            The colony finds the shortest path through{' '}
            <strong>positive feedback</strong>: good paths attract more ants,
            which make them better, which attracts more ants. This is
            autocatalysis. In machine learning terms it is gradient
            reinforcementa gradient of reward shapes future behaviour, which
            generates more reward, which sharpens the gradient.
          </p>

          <p>
            But positive feedback without a counter-force is explosiveit
            collapses all probability onto a single option. Evaporation is the
            counter-force. So is the stochastic component of ant steering.
            Together they prevent premature convergence and allow the system to
            respond to environmental changea food source that disappears, a
            shorter route that opens up when an obstacle is removed.
          </p>

          <p>
            The simulation below runs the complete system. The food clusters
            will be exhausted over time. When one disappears, watch whether the
            colony successfully reroutes to the remaining sources. This is the
            system's <em>catastrophic forgetting test</em>: can accumulated
            memory of the old path be unlearned fast enough for the colony to
            adapt?
          </p>
        </div>

        <Sim5 />

        <div className="prose prose-xl dark:prose-invert prose-blue max-w-none mt-12 mb-16">
          <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Ant Colony Optimisation
          </h2>

          <p>
            Marco Dorigo's formalisation of Ant Colony Optimisation in his 1992
            PhD thesis was part of the broader emergence of{' '}
            <strong>swarm intelligence</strong> as a computational paradigm. The
            key contribution was not a new algorithm per seit was an existence
            proof: that useful, complex, adaptive computation could arise from
            the interaction of simple agents with a shared memory, with no agent
            needing global knowledge.
          </p>

          <p>
            ACO has since been applied to the Travelling Salesman Problem,
            vehicle routing, network routing (Cisco's AntNet, 1998), protein
            structure prediction, and job-shop scheduling. In each domain the
            key insight is the same: rather than searching a state space with a
            single powerful agent, distribute the search across many weak
            agents, let them write to shared memory, and let evaporation make
            the memory selective.
          </p>

          <p>
            The deeper legacy is conceptual. Modern multi-agent reinforcement
            learningfleets of robots, simulated economies, game-playing AI
            populationsinherits the architecture directly: agents with local
            observations, shared value signals, emergent coordination. The
            pheromone field became the replay buffer, the population gradient,
            the shared Q-function. The ants became the workers in a distributed
            training run.
          </p>

          <p>And the evaporation rate became the learning rate schedule.</p>
        </div>

        <hr className="my-12 border-gray-200 dark:border-gray-800" />

        <Sandbox />
      </article>
    </main>
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
    <div className="my-8 overflow-hidden">
      <div className="py-2  bg-white flex justify-between items-center text-sm">
        <span>FIG. 01</span>
        <span>PHEROMONE FIELD ONLY</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={200} />
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
    <div className="my-8 overflow-hidden">
      <div className="py-2  bg-white flex justify-between items-center text-sm">
        <span>FIG. 02</span>
        <span>MEMORY DECAY INTERACTIVE</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={200} />
      <div className="py-4 bg-white flex items-center gap-4 text-md">
        <span className=" text-xs text-gray-500 uppercase">Decay Rate</span>
        <input
          ref={sliderRef}
          type="range"
          min="0.970"
          max="0.9995"
          step="0.0005"
          defaultValue="0.994"
          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <span ref={valRef} className=" text-xs w-16 text-right">
          0.9940
        </span>
      </div>
    </div>
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
    <div className="my-8 overflow-hidden">
      <div className="py-2  bg-white flex justify-between items-center text-sm">
        <span>FIG. 03</span>
        <span>DUAL CHANNEL MEMORY</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={220} />
      <div className="p-3 flex gap-4 justify-center bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c87840]"></span> Home trail
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4888b8]"></span> Food trail
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5a9e6e]"></span> Carrying
          food
        </div>
      </div>
    </div>
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
    <div className="my-8 overflow-hidden">
      <div className="py-2  bg-white flex justify-between items-center text-sm">
        <span>FIG. 04</span>
        <span>EXPLORATION VS EXPLOITATION</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={200} />
      <div className="py-4 bg-white flex items-center gap-4 text-md">
        <span className=" text-xs text-gray-500 uppercase">Randomness</span>
        <input
          ref={sliderRef}
          type="range"
          min="0.02"
          max="1.5"
          step="0.01"
          defaultValue="0.45"
          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <span ref={valRef} className=" text-xs w-16 text-right">
          0.45
        </span>
      </div>
    </div>
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
    <div className="my-8 overflow-hidden">
      <div className="py-2  bg-white flex justify-between items-center text-sm">
        <span>FIG. 05</span>
        <span>RESOURCE DEPLETION</span>
      </div>
      <canvas ref={canvasRef} className="w-full block bg-black" height={240} />
    </div>
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
    <div className="my-12 overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center">
        <h3 className="font-bold text-lg">Interactive Sandbox</h3>
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          EXPERIMENTAL
        </span>
      </div>

      <canvas ref={canvasRef} className="w-full block bg-black" height={400} />

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-md font-medium text-gray-700 dark:text-gray-300">
                Evaporation Rate
              </label>
              <span ref={refs.evap} className=" text-xs text-gray-500">
                0.9940
              </span>
            </div>
            <input
              ref={inputRefs.evap}
              type="range"
              min="0.970"
              max="0.9995"
              step="0.0005"
              defaultValue="0.994"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              onInput={(e) =>
                updateParam(
                  'evap',
                  parseFloat((e.target as HTMLInputElement).value)
                )
              }
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-md font-medium text-gray-700 dark:text-gray-300">
                Randomness (Explore/Exploit)
              </label>
              <span ref={refs.rand} className=" text-xs text-gray-500">
                0.45
              </span>
            </div>
            <input
              ref={inputRefs.rand}
              type="range"
              min="0.01"
              max="1.5"
              step="0.01"
              defaultValue="0.45"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              onInput={(e) =>
                updateParam(
                  'randomness',
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
              Reset World
            </button>
            <button
              onClick={() => engineRef.current?.addFood(30)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              + Add Food
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-8 flex flex-col justify-center space-y-2  text-md text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Ant Population:</span>
            <span
              ref={refs.stats.ants}
              className="font-bold text-gray-900 dark:text-gray-100"
            >
              —
            </span>
          </div>
          <div className="flex justify-between">
            <span>Food sources:</span>
            <span
              ref={refs.stats.food}
              className="font-bold text-gray-900 dark:text-gray-100"
            >
              —
            </span>
          </div>
          <div className="flex justify-between">
            <span>Memory Load:</span>
            <span
              ref={refs.stats.mem}
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
