'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import ArticleSection from '../../../components/braitenberg/article-section';
import Callout from '../../../components/braitenberg/callout';
import FigureBlock from '../../../components/braitenberg/figure-block';
import {
  ActionButton,
  ControlRow,
  RangeControl,
  ToggleChip,
} from '../../../components/braitenberg/control-row';
import EssayShell from '../../../components/essay-shell';
import { makeEngine } from './engine';

function StatItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-stone-300 bg-white px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-700 ${
        wide ? 'w-full' : ''
      }`}
    >
      <span>{label} </span>
      <strong className="font-semibold text-black">{value}</strong>
    </div>
  );
}

function StatStrip({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <StatItem key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}

export default function FlowWithoutTrafficLightsPage() {
  return (
    <EssayShell
      dek="Stand at the mouth of a busy station and watch the pavement organize itself. No one paints lanes. No one assigns right of way. People only keep going, avoid collisions, and copy the flow that already seems to work."
      readingTime="9 min read"
      title="Flow without traffic lights"
    >
      <ArticleSection>
        <p>
          The surprise is not that crowds are complicated. They are. The surprise
          is that one of their clearest visible patterns, the spontaneous lane,
          needs almost none of that complication to appear in a model.
        </p>
        <p>
          Start with three rules. First,
          <strong> separation</strong>: do not bump into people. Second,
          <strong> alignment</strong>: if a nearby stream is moving the same way
          you are, it is cheaper to fall in behind it than to cut across it.
          Third, <strong> destination bias</strong>: keep going where you meant
          to go.
        </p>
        <p>
          Repeat that decision a few hundred times and the crowd begins to look
          managed. But nobody managed it. The lane is an agreement produced by
          local repair.
        </p>
      </ArticleSection>

      <ArticleSection title="The Pavement Organizes Itself">
        <p>
          This is the boids structure translated into a city. Separation stays
          separation. Alignment stays alignment. Cohesion becomes something more
          urban: persistence of destination. A pedestrian does not want to stay
          with the flock. They want to stay with their route.
        </p>
        <p>
          The result is not a bird shape in the sky but a temporary piece of
          traffic engineering. Opposed streams braid into lanes because lane
          formation is the cheapest way to reduce conflict while preserving
          forward motion.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          A spontaneous pedestrian lane is
          <strong> distributed negotiation</strong>. Each walker solves a tiny
          local problem, and the pavement accumulates those solutions into
          public order.
        </p>
      </Callout>

      <ArticleSection>
        <p>
          The first simulation shows the raw phenomenon: two crowds crossing in
          opposite directions through the same corridor. Watch for dark and
          light bands to appear without any top-down rule about which side
          should win.
        </p>
      </ArticleSection>

      <Sim1 />

      <ArticleSection title="Density Makes the Lane Legible">
        <p>
          At low density there is enough slack for everyone to improvise. The
          pattern barely needs to stabilize. As density rises, random weaving
          becomes expensive. The crowd starts computing with its own bodies.
        </p>
        <p>
          That is why a rush-hour pavement often looks more ordered than a quiet
          one. Pressure forces the local rule to become visible.
        </p>
      </ArticleSection>

      <Sim2 />

      <ArticleSection title="Obstacles Become Geometry">
        <p>
          A pillar, escalator mouth, sandwich board, or station gate does not
          just occupy space. It rewrites the negotiation. Streams split, fold
          around the bottleneck, and reconstitute themselves on the far side.
        </p>
        <p>
          In that sense crowd management is often indirect. Change the geometry
          and the local rules do the rest.
        </p>
      </ArticleSection>

      <Sim3 />

      <ArticleSection title="What the Crowd Knows">
        <p>
          No pedestrian knows the global optimal arrangement. Nobody sees the
          whole phase portrait. But the crowd still discovers one because each
          walker is constantly reading the micro-signals left by everyone else:
          gaps, headings, pockets of resistance, lanes that are beginning to
          harden.
        </p>
        <p>
          This is why the right metaphor is not obedience. It is computation.
          The pavement keeps updating a solution to a local packing and routing
          problem, and the visible lane is the current best guess.
        </p>
      </ArticleSection>

      <ArticleSection title="Why This Matters">
        <p>
          Once you see it, you stop thinking of urban order as something that
          must be imposed to exist. Some of it is grown in place from repeated
          local decisions. That does not mean planners are irrelevant. It means
          their job is often to shape the conditions under which a good
          equilibrium is likely to appear.
        </p>
        <p>
          A narrow corridor, a misplaced barrier, a turnstile bank a few meters
          too far forward: these are not cosmetic details. They are parameter
          settings in a live multi-agent system.
        </p>
      </ArticleSection>

      <Sandbox />
    </EssayShell>
  );
}

function Sim1() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof makeEngine> | null>(null);
  const laneRef = useRef<HTMLSpanElement>(null);
  const encounterRef = useRef<HTMLSpanElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const [speed, setSpeed] = useState(1.35);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const parent = canvasRef.current.parentElement;

    if (parent) {
      canvasRef.current.width = parent.clientWidth;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || !canvasRef.current) {
          return;
        }

        engineRef.current = makeEngine(canvasRef.current, {
          colorMode: 'direction',
          onTick({ avgSpeed, encounterRate, laneStrength }) {
            if (laneRef.current) {
              laneRef.current.textContent = laneStrength.toFixed(2);
            }

            if (encounterRef.current) {
              encounterRef.current.textContent = `${Math.round(
                encounterRate * 100
              )}%`;
            }

            if (speedRef.current) {
              speedRef.current.textContent = avgSpeed.toFixed(2);
            }
          },
          pedestrianCount: 180,
          showAgents: true,
          showTrails: true,
          speed,
        });

        engineRef.current?.start();
        observer.disconnect();
      },
      { threshold: 0.05 }
    );

    observer.observe(canvasRef.current);

    return () => {
      observer.disconnect();
      engineRef.current?.cleanup();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) {
      return;
    }

    engineRef.current.reset({ speed });
  }, [speed]);

  return (
    <FigureBlock
      caption="Opposed streams sort themselves into lanes because lane formation is cheaper than perpetual collision repair."
      figure="01"
      label="Bidirectional lane formation"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-white" height={230} />
      </div>
      <ControlRow>
        <RangeControl
          label="Speed"
          max={2.2}
          min={0.8}
          onChange={setSpeed}
          step={0.05}
          value={speed}
          valueLabel={speed.toFixed(2)}
        />
        <ActionButton onClick={() => engineRef.current?.reset()}>
          Reset corridor
        </ActionButton>
      </ControlRow>
      <StatStrip
        items={[
          {
            label: 'Lane strength',
            value: <span ref={laneRef}>0.00</span>,
          },
          {
            label: 'Crossflow encounters',
            value: <span ref={encounterRef}>0%</span>,
          },
          {
            label: 'Average speed',
            value: <span ref={speedRef}>0.00</span>,
          },
        ]}
      />
    </FigureBlock>
  );
}

function Sim2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof makeEngine> | null>(null);
  const laneRef = useRef<HTMLSpanElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const [density, setDensity] = useState(180);
  const [speed, setSpeed] = useState(1.35);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const parent = canvasRef.current.parentElement;

    if (parent) {
      canvasRef.current.width = parent.clientWidth;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || !canvasRef.current) {
          return;
        }

        engineRef.current = makeEngine(canvasRef.current, {
          colorMode: 'density',
          onTick({ avgSpeed, laneStrength }) {
            if (laneRef.current) {
              laneRef.current.textContent = laneStrength.toFixed(2);
            }

            if (speedRef.current) {
              speedRef.current.textContent = avgSpeed.toFixed(2);
            }
          },
          pedestrianCount: density,
          showAgents: true,
          showTrails: false,
          speed,
        });

        engineRef.current?.start();
        observer.disconnect();
      },
      { threshold: 0.05 }
    );

    observer.observe(canvasRef.current);

    return () => {
      observer.disconnect();
      engineRef.current?.cleanup();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) {
      return;
    }

    engineRef.current.reset({ pedestrianCount: density });
  }, [density, speed]);

  return (
    <FigureBlock
      caption="Crowding makes the hidden rule visible. With more bodies in the corridor, spontaneous order becomes easier to see and harder to avoid."
      figure="02"
      label="Density tuning"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-white" height={230} />
      </div>
      <ControlRow>
        <RangeControl
          label="Pedestrian count"
          max={320}
          min={80}
          onChange={(value) => setDensity(Math.round(value))}
          step={1}
          value={density}
          valueLabel={String(density)}
        />
        <RangeControl
          label="Speed"
          max={2.2}
          min={0.8}
          onChange={setSpeed}
          step={0.05}
          value={speed}
          valueLabel={speed.toFixed(2)}
        />
        <ActionButton onClick={() => engineRef.current?.reset()}>
          Reset corridor
        </ActionButton>
      </ControlRow>
      <StatStrip
        items={[
          {
            label: 'Lane strength',
            value: <span ref={laneRef}>0.00</span>,
          },
          {
            label: 'Average speed',
            value: <span ref={speedRef}>0.00</span>,
          },
        ]}
      />
    </FigureBlock>
  );
}

function Sim3() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof makeEngine> | null>(null);
  const laneRef = useRef<HTMLSpanElement>(null);
  const encounterRef = useRef<HTMLSpanElement>(null);
  const [obstacle, setObstacle] = useState(true);
  const [speed, setSpeed] = useState(1.35);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const parent = canvasRef.current.parentElement;

    if (parent) {
      canvasRef.current.width = parent.clientWidth;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || !canvasRef.current) {
          return;
        }

        engineRef.current = makeEngine(canvasRef.current, {
          colorMode: 'direction',
          obstacle,
          onTick({ encounterRate, laneStrength }) {
            if (laneRef.current) {
              laneRef.current.textContent = laneStrength.toFixed(2);
            }

            if (encounterRef.current) {
              encounterRef.current.textContent = `${Math.round(
                encounterRate * 100
              )}%`;
            }
          },
          pedestrianCount: 190,
          showAgents: true,
          showTrails: true,
          speed,
        });

        engineRef.current?.start();
        observer.disconnect();
      },
      { threshold: 0.05 }
    );

    observer.observe(canvasRef.current);

    return () => {
      observer.disconnect();
      engineRef.current?.cleanup();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) {
      return;
    }

    engineRef.current.p.obstacle = obstacle;
    engineRef.current.reset();
  }, [obstacle, speed]);

  return (
    <FigureBlock
      caption="A single obstacle changes the global flow because it changes the sequence of local evasions everyone has to solve."
      figure="03"
      label="Bottleneck geometry"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-white" height={230} />
      </div>
      <ControlRow>
        <RangeControl
          label="Speed"
          max={2.2}
          min={0.8}
          onChange={setSpeed}
          step={0.05}
          value={speed}
          valueLabel={speed.toFixed(2)}
        />
        <ToggleChip
          active={obstacle}
          label={obstacle ? 'Obstacle on' : 'Obstacle off'}
          onClick={() => setObstacle((current) => !current)}
        />
        <ActionButton onClick={() => engineRef.current?.reset()}>
          Reset corridor
        </ActionButton>
      </ControlRow>
      <StatStrip
        items={[
          {
            label: 'Lane strength',
            value: <span ref={laneRef}>0.00</span>,
          },
          {
            label: 'Crossflow encounters',
            value: <span ref={encounterRef}>0%</span>,
          },
        ]}
      />
    </FigureBlock>
  );
}

function Sandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof makeEngine> | null>(null);
  const laneRef = useRef<HTMLSpanElement>(null);
  const encounterRef = useRef<HTMLSpanElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(220);
  const [alignment, setAlignment] = useState(0.09);
  const [separation, setSeparation] = useState(0.24);
  const [goalForce, setGoalForce] = useState(0.055);
  const [speed, setSpeed] = useState(1.35);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const parent = canvasRef.current.parentElement;

    if (parent) {
      canvasRef.current.width = parent.clientWidth;
    }

    engineRef.current = makeEngine(canvasRef.current, {
      alignment,
      goalForce,
      onTick({ avgSpeed, encounterRate, laneStrength }) {
        if (laneRef.current) {
          laneRef.current.textContent = laneStrength.toFixed(2);
        }

        if (encounterRef.current) {
          encounterRef.current.textContent = `${Math.round(
            encounterRate * 100
          )}%`;
        }

        if (speedRef.current) {
          speedRef.current.textContent = avgSpeed.toFixed(2);
        }
      },
      pedestrianCount: count,
      separation,
      showAgents: true,
      showTrails: true,
      speed,
    });

    engineRef.current?.start();

    return () => engineRef.current?.cleanup();
  }, []);

  useEffect(() => {
    if (!engineRef.current) {
      return;
    }

    engineRef.current.reset({
      alignment,
      goalForce,
      pedestrianCount: count,
      separation,
      speed,
    });
  }, [alignment, count, goalForce, separation, speed]);

  return (
    <FigureBlock
      caption="Open the corridor directly. Change the local rule weights and watch the pavement decide whether to become a lane system or a knot."
      figure="04"
      label="Open plate"
    >
      <div className="overflow-hidden bg-white">
        <canvas ref={canvasRef} className="block w-full bg-white" height={360} />
      </div>
      <div className="grid gap-8 border-t border-stone-300 pt-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-2">
          <RangeControl
            label="Pedestrian count"
            max={320}
            min={80}
            onChange={(value) => setCount(Math.round(value))}
            step={1}
            value={count}
            valueLabel={String(count)}
          />
          <RangeControl
            label="Alignment"
            max={0.2}
            min={0.02}
            onChange={setAlignment}
            step={0.005}
            value={alignment}
            valueLabel={alignment.toFixed(3)}
          />
          <RangeControl
            label="Separation"
            max={0.5}
            min={0.05}
            onChange={setSeparation}
            step={0.01}
            value={separation}
            valueLabel={separation.toFixed(2)}
          />
          <RangeControl
            label="Goal force"
            max={0.12}
            min={0.02}
            onChange={setGoalForce}
            step={0.005}
            value={goalForce}
            valueLabel={goalForce.toFixed(3)}
          />
          <RangeControl
            label="Speed"
            max={2.2}
            min={0.8}
            onChange={setSpeed}
            step={0.05}
            value={speed}
            valueLabel={speed.toFixed(2)}
          />
          <div className="px-2 py-1">
            <ActionButton onClick={() => engineRef.current?.reset()}>
              Randomize crowd
            </ActionButton>
          </div>
        </div>
        <div className="space-y-2 border-l border-stone-300 pl-5">
          <StatItem
            label="Lane strength"
            value={<span ref={laneRef}>0.00</span>}
            wide
          />
          <StatItem
            label="Crossflow encounters"
            value={<span ref={encounterRef}>0%</span>}
            wide
          />
          <StatItem
            label="Average speed"
            value={<span ref={speedRef}>0.00</span>}
            wide
          />
        </div>
      </div>
    </FigureBlock>
  );
}
