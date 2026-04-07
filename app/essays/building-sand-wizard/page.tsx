'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import ArticleSection from '../../../components/braitenberg/article-section';
import Callout from '../../../components/braitenberg/callout';
import FigureBlock from '../../../components/braitenberg/figure-block';
import {
  ActionButton,
  ControlRow,
  ToggleChip,
} from '../../../components/braitenberg/control-row';
import EssayShell from '../../../components/essay-shell';

import { SCALE, LOGICAL_W, LOGICAL_H, GROUND_Y, SAND_COLOURS, ROCK_COLOUR } from '../../../lib/sand-wizard/constants';
import { createGrid, getCell, setCell } from '../../../lib/sand-wizard/grid';
import { stepSand } from '../../../lib/sand-wizard/physics';
import { rng, resetRng } from '../../../lib/sand-wizard/rng';

// ─── Shared mini-renderer ───────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const SKY: [number, number, number] = hexToRgb('#d47a3a');

function renderMiniGrid(
  ctx: CanvasRenderingContext2D,
  grid: Uint8Array,
  w: number,
  h: number,
  scale: number,
) {
  const cw = w * scale;
  const ch = h * scale;
  const img = ctx.createImageData(cw, ch);
  const d = img.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const cell = getCell(grid, x, y, w);
      const [r, g, b] =
        cell === 1
          ? hexToRgb(SAND_COLOURS[(x * 3 + y * 7) % SAND_COLOURS.length])
          : cell === 2
            ? hexToRgb(ROCK_COLOUR)
            : SKY;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const idx = ((y * scale + sy) * cw + (x * scale + sx)) * 4;
          d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

// ─── Figure 01 — Sand physics sandbox ───────────────────────────────────────

function SandPhysicsDemo() {
  const W = 120;
  const H = 80;
  const S = 4;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef(createGrid(W, H));
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const mouseRef = useRef<{ x: number; y: number; down: boolean }>({ x: 0, y: 0, down: false });

  const reset = useCallback(() => {
    gridRef.current = createGrid(W, H);
    // Rock floor
    for (let x = 0; x < W; x++)
      for (let y = H - 4; y < H; y++)
        setCell(gridRef.current, x, y, 2, W);
  }, []);

  useEffect(() => {
    reset();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const getPos = (e: MouseEvent | Touch) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: Math.floor(((e.clientX - r.left) / r.width) * W),
        y: Math.floor(((e.clientY - r.top) / r.height) * H),
      };
    };

    const onDown = (e: MouseEvent) => { e.preventDefault(); mouseRef.current.down = true; Object.assign(mouseRef.current, getPos(e)); };
    const onUp = () => { mouseRef.current.down = false; };
    const onMove = (e: MouseEvent) => { if (mouseRef.current.down) Object.assign(mouseRef.current, getPos(e)); };
    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); mouseRef.current.down = true; Object.assign(mouseRef.current, getPos(e.touches[0])); };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); Object.assign(mouseRef.current, getPos(e.touches[0])); };
    const onTouchEnd = (e: TouchEvent) => { e.preventDefault(); mouseRef.current.down = false; };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    const loop = () => {
      frameRef.current++;
      if (mouseRef.current.down) {
        const { x, y } = mouseRef.current;
        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++)
            if (dx * dx + dy * dy <= 4 && getCell(gridRef.current, x + dx, y + dy, W) === 0)
              setCell(gridRef.current, x + dx, y + dy, 1, W);
      }
      stepSand(gridRef.current, W, H, frameRef.current);
      renderMiniGrid(ctx, gridRef.current, W, H, S);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [reset]);

  return (
    <FigureBlock
      caption="Click or drag to drop sand. Each grain checks below, below-left, and below-right every frame. The alternating scan direction prevents directional bias."
      figure="01"
      label="Falling-sand physics"
    >
      <div className="overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={W * S}
          height={H * S}
          className="block w-full touch-none cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <ControlRow>
        <ActionButton onClick={reset}>Clear</ActionButton>
      </ControlRow>
    </FigureBlock>
  );
}

// ─── Figure 02 — Terrain generation ─────────────────────────────────────────

function TerrainDemo() {
  const W = 200;
  const H = 80;
  const S = 3;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState(0);
  const valRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const grid = createGrid(W, H);
    const baseY = H - 16;
    const d = difficulty;

    for (let x = 0; x < W; x++) {
      const j1 = Math.sin(x * 0.08) * 4 * d;
      const j2 = Math.sin(x * 0.17 + 1.3) * 3 * d;
      const j3 = Math.sin(x * 0.31 + 4.7) * 2 * d;
      const gentle = Math.sin(x * 0.012) * 3 + Math.sin(x * 0.025 + 1.5) * 2;
      const saw = (((x * 0.04) % 1 + 1) % 1) * 8 * d - 4 * d;
      const surfaceY = Math.round(baseY - gentle - j1 - j2 - j3 - saw);
      const clamped = Math.max(4, Math.min(H - 2, surfaceY));

      for (let y = clamped; y < H; y++) setCell(grid, x, y, 2, W);
      if (clamped - 1 >= 0) setCell(grid, x, clamped - 1, 1, W);
      if (clamped - 2 >= 0) setCell(grid, x, clamped - 2, 1, W);
    }

    renderMiniGrid(ctx, grid, W, H, S);
  }, [difficulty]);

  return (
    <FigureBlock
      caption="Terrain is built from layered sine waves and sawtooth functions. As difficulty rises, higher-frequency terms dominate and the landscape becomes jagged."
      figure="02"
      label="Procedural terrain"
    >
      <div className="overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={W * S}
          height={H * S}
          className="block w-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <ControlRow>
        <label className="min-w-[220px] px-2 py-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
            <span>Difficulty</span>
            <span ref={valRef}>{difficulty.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={difficulty}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setDifficulty(v);
              if (valRef.current) valRef.current.textContent = v.toFixed(2);
            }}
            className="w-full accent-black"
          />
        </label>
      </ControlRow>
    </FigureBlock>
  );
}

// ─── Figure 03 — RNG visualisation ──────────────────────────────────────────

function RngDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed, setSeed] = useState(42);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = 300;
    const H = 120;
    ctx.clearRect(0, 0, W, H);

    // Generate values from the LCG
    let s = seed;
    const vals: number[] = [];
    for (let i = 0; i < 300; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) | 0;
      vals.push((s >>> 0) / 0x100000000);
    }

    // Draw as a waveform
    ctx.strokeStyle = '#c2955a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    vals.forEach((v, i) => {
      const x = (i / vals.length) * W;
      const y = (1 - v) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [seed]);

  return (
    <FigureBlock
      caption="The same seed always produces the same sequence. This means every player faces identical terrain for a given run, making scores comparable."
      figure="03"
      label="Deterministic RNG"
    >
      <div className="overflow-hidden bg-stone-100">
        <canvas ref={canvasRef} width={300} height={120} className="block w-full" />
      </div>
      <ControlRow>
        <label className="min-w-[220px] px-2 py-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
            <span>Seed</span>
            <span>{seed}</span>
          </div>
          <input
            type="range"
            min="1"
            max="999"
            step="1"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
            className="w-full accent-black"
          />
        </label>
      </ControlRow>
    </FigureBlock>
  );
}

// ─── Figure 04 — Brush mechanics ────────────────────────────────────────────

function BrushDemo() {
  const W = 120;
  const H = 80;
  const S = 4;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef(createGrid(W, H));
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const mouseRef = useRef<{ x: number; y: number; action: 'place' | 'remove' | null }>({ x: 0, y: 0, action: null });
  const [radius, setRadius] = useState(3);
  const radiusRef = useRef(3);

  const reset = useCallback(() => {
    const grid = createGrid(W, H);
    // Rock floor + some terrain
    for (let x = 0; x < W; x++) {
      const surfY = H - 20 + Math.round(Math.sin(x * 0.05) * 4);
      for (let y = surfY; y < H; y++) setCell(grid, x, y, 2, W);
      setCell(grid, x, surfY - 1, 1, W);
      setCell(grid, x, surfY - 2, 1, W);
    }
    gridRef.current = grid;
  }, []);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => { radiusRef.current = radius; }, [radius]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const getPos = (e: MouseEvent | Touch) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: Math.floor(((e.clientX - r.left) / r.width) * W),
        y: Math.floor(((e.clientY - r.top) / r.height) * H),
      };
    };

    const onDown = (e: MouseEvent) => {
      e.preventDefault();
      mouseRef.current.action = e.button === 2 ? 'remove' : 'place';
      Object.assign(mouseRef.current, getPos(e));
    };
    const onUp = () => { mouseRef.current.action = null; };
    const onMove = (e: MouseEvent) => { Object.assign(mouseRef.current, getPos(e)); };
    const onCtx = (e: Event) => e.preventDefault();
    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); mouseRef.current.action = 'place'; Object.assign(mouseRef.current, getPos(e.touches[0])); };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); Object.assign(mouseRef.current, getPos(e.touches[0])); };
    const onTouchEnd = (e: TouchEvent) => { e.preventDefault(); mouseRef.current.action = null; };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('contextmenu', onCtx);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    const loop = () => {
      frameRef.current++;
      const { x, y, action } = mouseRef.current;
      const r = radiusRef.current;
      if (action) {
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy > r * r) continue;
            if (action === 'place' && getCell(gridRef.current, x + dx, y + dy, W) === 0)
              setCell(gridRef.current, x + dx, y + dy, 1, W);
            else if (action === 'remove' && getCell(gridRef.current, x + dx, y + dy, W) === 1)
              setCell(gridRef.current, x + dx, y + dy, 0, W);
          }
      }
      stepSand(gridRef.current, W, H, frameRef.current);
      renderMiniGrid(ctx, gridRef.current, W, H, S);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('contextmenu', onCtx);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <FigureBlock
      caption="Left-click places sand, right-click removes it. The brush radius controls how many cells are affected per frame. In the game, this is the wizard's primary tool for survival."
      figure="04"
      label="Place & remove brush"
    >
      <div className="overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={W * S}
          height={H * S}
          className="block w-full touch-none cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <ControlRow>
        <label className="min-w-[220px] px-2 py-1">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-stone-700">
            <span>Brush radius</span>
            <span>{radius}</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full accent-black"
          />
        </label>
        <ActionButton onClick={reset}>Reset</ActionButton>
      </ControlRow>
    </FigureBlock>
  );
}

// ─── Figure 05 — The full game ──────────────────────────────────────────────

function FullGame() {
  return (
    <FigureBlock
      caption="The complete game. Click to place sand, right-click to remove it. Build ramps over obstacles, fill chasms, and keep the wizard alive as long as you can."
      figure="05"
      label="Sand Wizard"
    >
      <div
        className="overflow-hidden w-full aspect-video"
        style={{ background: '#1a0a00' }}
      >
        <iframe
          src="/games/sand-wizard"
          className="w-full h-full border-0"
          title="Sand Wizard"
          allow="autoplay"
        />
      </div>
    </FigureBlock>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BuildingSandWizardPage() {
  return (
    <EssayShell
      dek="A falling-sand game where you conjure terrain to keep a tiny wizard alive. Built from a grid of cells, a deterministic RNG, and a circular brush — no physics engine required."
      readingTime="8 min read"
      title="Building Sand Wizard"
    >
      <ArticleSection>
        <p>
          Sand Wizard is a side-scrolling survival game. A pixel-art wizard walks
          endlessly to the right across a procedurally generated desert. The
          terrain gets increasingly hostile — chasms, spike walls, boulders,
          falling rocks — and the player's only tool is sand. Click to conjure it,
          right-click to remove it. Build ramps, fill gaps, block hazards.
        </p>
        <p>
          The entire thing runs on a 400×225 logical grid, scaled 3× to canvas
          pixels. There is no physics engine. Every behaviour — gravity, terrain,
          obstacles — is a direct manipulation of that grid. This article walks
          through the core systems and lets you play with each one.
        </p>
      </ArticleSection>

      <ArticleSection title="Falling sand">
        <p>
          The foundation is a cellular automaton. Each cell in the grid is one of
          three types: empty, sand, or rock. Every frame, the simulation scans
          bottom-to-top. For each sand cell, it checks: can I fall straight down?
          If not, can I slide diagonally? If neither, stay put.
        </p>
        <p>
          The scan direction alternates each row (left-to-right on even rows,
          right-to-left on odd) to prevent sand from developing a directional
          bias. The diagonal check is randomised — left-first or right-first —
          so piles form natural slopes rather than leaning consistently.
        </p>
      </ArticleSection>

      <SandPhysicsDemo />

      <ArticleSection title="Procedural terrain">
        <p>
          The world generates one column at a time as the camera scrolls right.
          Each column's surface height is computed from the world X coordinate
          using layered sine waves at different frequencies. Low frequencies
          create gentle rolling dunes; high frequencies add jagged spikes.
        </p>
        <p>
          Difficulty scales from 0 to 1 based on the player's score. At zero,
          only the gentle low-frequency terms are active. As difficulty rises,
          sawtooth waves and higher harmonics kick in, producing increasingly
          treacherous terrain. Chasms, spike walls, and ridges are layered on
          top using hash-seeded intervals.
        </p>
      </ArticleSection>

      <TerrainDemo />

      <Callout label="Design choice">
        <p>
          Terrain is computed from a pure function of world X and score — no
          stored map, no chunks. This means the world is infinite and
          deterministic: the same score always produces the same landscape.
        </p>
      </Callout>

      <ArticleSection title="Deterministic randomness">
        <p>
          The game uses a linear congruential generator seeded at 42. Every call
          to <code>rng()</code> advances the same global state, so the sequence
          of "random" decisions — which way sand slides, where obstacles spawn —
          is identical every run. This makes high scores meaningful: everyone
          faces the same game.
        </p>
        <p>
          The constants (multiplier 1664525, increment 1013904223) are the
          classic Numerical Recipes LCG. It's fast, tiny, and good enough for a
          game that needs unpredictable-looking behaviour without cryptographic
          strength.
        </p>
      </ArticleSection>

      <RngDemo />

      <ArticleSection title="The brush">
        <p>
          Player interaction is a circular brush that writes cells into the grid.
          Left-click sets empty cells to sand; right-click clears sand cells back
          to empty. Rock is immutable — you can't paint over it or erase it.
        </p>
        <p>
          Sand is a finite resource that regenerates slowly. The regen rate
          decreases as the tank empties, creating pressure: spend sand freely
          early and you'll run dry when you need it most. Power-ups restore
          sand in bursts, rewarding exploration.
        </p>
      </ArticleSection>

      <BrushDemo />

      <ArticleSection title="Scrolling and the player">
        <p>
          The camera scrolls at a constant rate (1.2 pixels per frame). The grid
          shifts left by integer columns, and new columns are generated on the
          right edge. The wizard walks on top of whatever surface exists beneath
          them — sand or rock — using a simple ground-detection scan.
        </p>
        <p>
          Small bumps (≤5 cells) are auto-climbed. Taller walls push the wizard
          left. If the wizard is pushed off the left edge of the screen, they
          die. This creates the core tension: the world scrolls relentlessly,
          and you must keep the path clear.
        </p>
      </ArticleSection>

      <ArticleSection title="Putting it together">
        <p>
          Obstacles — boulders, falling rocks, dust devils, scorpions, snakes,
          cacti — spawn at intervals that tighten with difficulty. Each has
          simple movement rules (constant velocity, sine-wave paths) and
          collision is axis-aligned bounding box. Near-misses award bonus
          points and trigger a screen shake.
        </p>
        <p>
          Audio is entirely synthesised from the Web Audio API — no sample files.
          A Hijaz-scale melody plays over a sub-bass drone, with sparse
          tabla-like percussion and occasional wind. Sound effects are single
          oscillator bursts.
        </p>
        <p>
          The renderer writes directly to an <code>ImageData</code> buffer,
          painting each grid cell as a 3×3 block of canvas pixels. Sprites
          (wizard, vultures, scorpions) are drawn from character-map bitmaps
          with palette lookups. The whole frame is a single <code>putImageData</code> call
          plus a few <code>fillRect</code> overlays.
        </p>
      </ArticleSection>

      <FullGame />
    </EssayShell>
  );
}
