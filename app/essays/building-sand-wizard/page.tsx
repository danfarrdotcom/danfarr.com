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

// ─── Figure 05 — Parallax background ────────────────────────────────────────

function ParallaxDemo() {
  const W = 400;
  const H = 225;
  const S = 2;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const cameraRef = useRef(0);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const cw = W * S;
    const ch = H * S;

    // Palette
    const hex = (h: string): [number, number, number] => {
      const n = parseInt(h.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const lerp = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];

    const skyTop = hex('#8b3a0f');
    const skyBot = hex('#d47a3a');
    const groundY = H - 40;
    const layers = [
      { color: hex('#7a3a18'), yBase: 140, factor: 0.1, amp: 8, freq: 0.02 },
      { color: hex('#a05a28'), yBase: 155, factor: 0.3, amp: 10, freq: 0.035 },
      { color: hex('#b8742a'), yBase: 168, factor: 0.6, amp: 6, freq: 0.06 },
    ];
    const spireColor = hex('#5a2810');

    const loop = () => {
      cameraRef.current += speedRef.current;
      const cam = cameraRef.current;
      const img = ctx.createImageData(cw, ch);
      const d = img.data;

      // Sky gradient
      const skyH = groundY * S;
      for (let py = 0; py < ch; py++) {
        const t = Math.min(1, py / skyH);
        const c = lerp(skyTop, skyBot, t);
        for (let px = 0; px < cw; px++) {
          const idx = (py * cw + px) * 4;
          d[idx] = c[0]; d[idx + 1] = c[1]; d[idx + 2] = c[2]; d[idx + 3] = 255;
        }
      }

      // Rock spires (factor 0.04)
      const spireOff = cam * 0.04;
      for (let lx = 0; lx < W; lx++) {
        const wx = lx + spireOff;
        const sv = Math.sin(wx * 0.008) + Math.sin(wx * 0.023 + 1.4) * 0.5;
        if (sv > 0.8) {
          const sh = Math.round((sv - 0.8) * 150);
          for (let ly = 155 - sh; ly < 155; ly++) {
            const t2 = (155 - ly) / sh;
            const hw = Math.max(1, Math.round((1 - t2 * 0.7) * 3));
            for (let dx2 = -hw; dx2 <= hw; dx2++) {
              const px2 = lx + dx2;
              if (px2 >= 0 && px2 < W) {
                for (let sy = 0; sy < S; sy++)
                  for (let sx = 0; sx < S; sx++) {
                    const idx = ((ly * S + sy) * cw + (px2 * S + sx)) * 4;
                    d[idx] = spireColor[0]; d[idx + 1] = spireColor[1]; d[idx + 2] = spireColor[2]; d[idx + 3] = 255;
                  }
              }
            }
          }
        }
      }

      // Dune layers
      for (const layer of layers) {
        const off = cam * layer.factor;
        for (let lx = 0; lx < W; lx++) {
          const wx = lx + off;
          const duneY = Math.round(layer.yBase + Math.sin(wx * layer.freq) * layer.amp);
          for (let ly = duneY; ly < groundY; ly++) {
            for (let sy = 0; sy < S; sy++)
              for (let sx = 0; sx < S; sx++) {
                const idx = ((ly * S + sy) * cw + (lx * S + sx)) * 4;
                d[idx] = layer.color[0]; d[idx + 1] = layer.color[1]; d[idx + 2] = layer.color[2]; d[idx + 3] = 255;
              }
          }
        }
      }

      // Ground
      const groundCol = hex('#8b6347');
      for (let ly = groundY; ly < H; ly++)
        for (let lx = 0; lx < W; lx++)
          for (let sy = 0; sy < S; sy++)
            for (let sx = 0; sx < S; sx++) {
              const idx = ((ly * S + sy) * cw + (lx * S + sx)) * 4;
              d[idx] = groundCol[0]; d[idx + 1] = groundCol[1]; d[idx + 2] = groundCol[2]; d[idx + 3] = 255;
            }

      ctx.putImageData(img, 0, 0);

      // Layer speed labels
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      const labels = [
        { y: 100, text: 'spires ×0.04', factor: 0.04 },
        { y: 140, text: 'far dunes ×0.1', factor: 0.1 },
        { y: 155, text: 'mid dunes ×0.3', factor: 0.3 },
        { y: 170, text: 'near dunes ×0.6', factor: 0.6 },
        { y: groundY + 4, text: 'ground ×1.0', factor: 1.0 },
      ];
      for (const l of labels) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(l.text, (W - 4) * S, l.y * S);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <FigureBlock
      caption="Five layers scroll at different rates. Distant spires barely move (×0.04); near dunes track the camera closely (×0.6). The ground scrolls at full speed. This creates depth from a flat pixel grid."
      figure="05"
      label="Parallax layers"
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
            <span>Scroll speed</span>
            <span>{speed.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-black"
          />
        </label>
      </ControlRow>
    </FigureBlock>
  );
}

// ─── Figure 06 — Enemy collision demo ───────────────────────────────────────

type DemoEnemy = {
  type: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  frame: number;
};

function EnemyDemo() {
  const W = 200;
  const H = 80;
  const S = 3;
  const GROUND = H - 12;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const stateRef = useRef({
    playerX: 40,
    playerY: GROUND - 1,
    playerDead: false,
    shielded: false,
    enemies: [] as DemoEnemy[],
    frame: 0,
    deathFlash: 0,
  });

  const spawnWave = useCallback(() => {
    const s = stateRef.current;
    s.playerX = 40;
    s.playerY = GROUND - 1;
    s.playerDead = false;
    s.deathFlash = 0;
    s.enemies = [
      { type: 'boulder', x: W + 10, y: GROUND - 8, vx: -1.2, vy: 0, width: 8, height: 8, frame: 0 },
      { type: 'falling-rock', x: 100, y: -16, vx: 0, vy: 0.6, width: 12, height: 12, frame: 0 },
      { type: 'scorpion', x: W + 60, y: GROUND - 4, vx: -0.8, vy: 0, width: 8, height: 4, frame: 0 },
      { type: 'cactus', x: W + 120, y: GROUND - 10, vx: -0.8, vy: 0, width: 10, height: 10, frame: 0 },
    ];
  }, []);

  useEffect(() => {
    spawnWave();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const cw = W * S;
    const ch = H * S;

    const loop = () => {
      const s = stateRef.current;
      s.frame++;

      // Update enemies
      if (!s.playerDead) {
        for (const e of s.enemies) {
          e.x += e.vx;
          e.y += e.vy;
          e.frame++;

          // Falling rock stops at ground
          if (e.type === 'falling-rock' && e.y + e.height >= GROUND) {
            e.y = GROUND - e.height;
            e.vy = 0;
          }

          // AABB collision with player (4×14 hitbox)
          const px = s.playerX;
          const py = s.playerY;
          const pTop = py - 14;
          if (
            px < e.x + e.width &&
            px + 4 > e.x &&
            pTop < e.y + e.height &&
            py > e.y
          ) {
            if (s.shielded) {
              s.shielded = false;
            } else {
              s.playerDead = true;
              s.deathFlash = 20;
            }
          }
        }
      }

      if (s.deathFlash > 0) s.deathFlash--;

      // Respawn enemies that leave the screen
      for (const e of s.enemies) {
        if (e.type !== 'falling-rock' && e.x + e.width < -10) {
          e.x = W + 20 + Math.random() * 40;
        }
      }

      // Render
      ctx.fillStyle = '#d47a3a';
      ctx.fillRect(0, 0, cw, ch);
      // Ground
      ctx.fillStyle = '#8b6347';
      ctx.fillRect(0, GROUND * S, cw, (H - GROUND) * S);
      // Sand surface
      ctx.fillStyle = '#c2955a';
      ctx.fillRect(0, (GROUND - 1) * S, cw, S);

      // Draw enemies
      for (const e of s.enemies) {
        const ex = Math.round(e.x) * S;
        const ey = Math.round(e.y) * S;
        const ew = e.width * S;
        const eh = e.height * S;

        // Hitbox outline
        ctx.strokeStyle = 'rgba(255,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(ex, ey, ew, eh);

        if (e.type === 'boulder') {
          ctx.fillStyle = '#777777';
          ctx.beginPath();
          ctx.ellipse(ex + ew / 2, ey + eh / 2, ew / 2, eh / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#444444';
          ctx.beginPath();
          ctx.ellipse(ex + ew / 2, ey + eh / 2, ew / 2 - S, eh / 2 - S, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'falling-rock') {
          ctx.fillStyle = '#888888';
          ctx.fillRect(ex + S, ey, ew - 2 * S, eh);
          ctx.fillRect(ex, ey + S, ew, eh - 2 * S);
          ctx.fillStyle = '#555555';
          ctx.fillRect(ex + 2 * S, ey + S, ew - 4 * S, eh - 2 * S);
          // Shadow telegraph
          if (e.vy > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(ex, GROUND * S - S, ew, 2 * S);
          }
        } else if (e.type === 'scorpion') {
          ctx.fillStyle = '#3a2010';
          ctx.fillRect(ex + 2 * S, ey + S, 4 * S, 2 * S);
          ctx.fillStyle = '#cc4400';
          ctx.fillRect(ex + S, ey, S, S); // stinger
          ctx.fillStyle = '#3a2010';
          ctx.fillRect(ex, ey + S, S, S); // tail
        } else if (e.type === 'cactus') {
          ctx.fillStyle = '#22781e';
          ctx.fillRect(ex + 2 * S, ey, (e.width - 4) * S, eh);
          ctx.fillRect(ex, ey + 3 * S, ew, (e.height - 6) * S);
          ctx.fillStyle = '#145a10';
          ctx.fillRect(ex + Math.floor(e.width / 2) * S, ey + S, S, eh - 2 * S);
        }
      }

      // Draw player
      const px = Math.round(s.playerX) * S;
      const py = Math.round(s.playerY) * S;
      const pTop = (Math.round(s.playerY) - 14) * S;

      if (!s.playerDead) {
        // Player hitbox outline
        ctx.strokeStyle = 'rgba(0,200,0,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, pTop, 4 * S, 14 * S);

        // Simple wizard shape
        ctx.fillStyle = '#6a1b9a'; // hat
        ctx.fillRect(px, pTop, 4 * S, 4 * S);
        ctx.fillStyle = '#c48a5a'; // face
        ctx.fillRect(px, pTop + 4 * S, 4 * S, 3 * S);
        ctx.fillStyle = '#7b1fa2'; // robe
        ctx.fillRect(px, pTop + 7 * S, 4 * S, 7 * S);

        // Shield bubble
        if (s.shielded) {
          ctx.strokeStyle = 'rgba(100,180,255,0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(px + 2 * S, pTop + 7 * S, 5 * S, 9 * S, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        // Death flash
        if (s.deathFlash > 0 && s.deathFlash % 4 < 2) {
          ctx.fillStyle = 'rgba(255,50,50,0.6)';
          ctx.fillRect(px - 2 * S, pTop - 2 * S, 8 * S, 18 * S);
        }
        // X eyes
        ctx.fillStyle = '#ff0000';
        ctx.font = `${3 * S}px monospace`;
        ctx.fillText('💀', px - S, pTop + 8 * S);
      }

      // Labels
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'left';
      ctx.fillText(s.playerDead ? 'DEAD — contact kill' : s.shielded ? 'SHIELDED' : 'alive', 4, 12);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawnWave]);

  return (
    <FigureBlock
      caption="Each enemy has an axis-aligned bounding box (red outline). The wizard's hitbox is 4×14 pixels (green). Any overlap triggers death — unless a shield absorbs the hit. Falling rocks telegraph their landing with a ground shadow."
      figure="06"
      label="Contact death"
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
        <ActionButton onClick={spawnWave}>Reset</ActionButton>
        <ToggleChip
          active={stateRef.current.shielded}
          label="Give shield"
          onClick={() => { stateRef.current.shielded = true; stateRef.current.playerDead = false; }}
        />
      </ControlRow>
    </FigureBlock>
  );
}

// ─── Figure 07 — The full game ──────────────────────────────────────────────

function FullGame() {
  return (
    <FigureBlock
      caption="The complete game. Click to place sand, right-click to remove it. Build ramps over obstacles, fill chasms, and keep the wizard alive as long as you can."
      figure="07"
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
      readingTime="12 min read"
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

      <ArticleSection title="Parallax depth">
        <p>
          The background is built from five layers that scroll at different
          fractions of the camera speed. Distant rock spires move at just 4% of
          the camera rate. Three dune layers sit between them at 10%, 30%, and
          60%. The foreground terrain scrolls at full speed.
        </p>
        <p>
          Each layer is a sine-wave silhouette rendered directly into
          the <code>ImageData</code> buffer before the grid is painted on top.
          The sky is a vertical gradient that transitions from a night palette
          (deep indigo) to a day palette (burnt orange) as the score increases,
          giving the game a sense of time passing.
        </p>
        <p>
          Decorative elements ride on specific layers: palm trees on the middle
          dunes (×0.3), camel silhouettes on the far dunes (×0.1), and circling
          bird flocks that orbit fixed points in the sky. A Majora's Mask-style
          moon/sun face watches from the upper right, its expression shifting
          from neutral to menacing as more obstacles appear on screen.
        </p>
      </ArticleSection>

      <ParallaxDemo />

      <Callout label="Why parallax matters">
        <p>
          Without parallax, the desert looks flat — a texture sliding left.
          With it, the player perceives depth, distance, and atmosphere from
          nothing but offset multipliers on a 2D grid. It's the cheapest
          possible 3D illusion.
        </p>
      </Callout>

      <ArticleSection title="Enemies and contact death">
        <p>
          Eight obstacle types populate the desert, each with distinct behaviour.
          Boulders roll left at constant velocity, ploughing through any sand in
          their path. Falling rocks drop from above with a ground-shadow
          telegraph, then embed themselves as permanent rock cells on impact.
          Dust devils wander horizontally, scattering any sand they touch.
          Scorpions and snakes sit on the ground, animated but stationary.
          Cacti scale in size with difficulty. Cave gates descend from above
          with a narrow gap the wizard must pass through. Rock arches are baked
          directly into the grid as impassable terrain.
        </p>
        <p>
          Collision detection is axis-aligned bounding box (AABB). The wizard's
          hitbox is 4 pixels wide and 14 pixels tall. Each obstacle has its own
          bounding box defined by width and height. Every frame, the game checks
          whether these rectangles overlap:
        </p>
        <p>
          <code>
            player.x &lt; obstacle.x + width &amp;&amp; player.x + 4 &gt; obstacle.x
            &amp;&amp; player.top &lt; obstacle.y + height &amp;&amp; player.y &gt; obstacle.y
          </code>
        </p>
        <p>
          If they overlap, the wizard dies instantly — unless a shield power-up
          is active, in which case the shield absorbs the hit and deactivates.
          There is no health bar, no knockback, no invincibility frames. One
          touch and you're dead. This keeps the stakes high and makes the
          sand-placement mechanic feel urgent.
        </p>
      </ArticleSection>

      <EnemyDemo />

      <ArticleSection title="Near-misses and spawn pacing">
        <p>
          When the wizard passes within 12 pixels of a boulder or falling rock
          without actually colliding, the game awards 50 bonus points and plays
          a chime. A 30-frame cooldown prevents the same obstacle from
          triggering multiple near-miss rewards. This encourages risky play —
          building minimal sand bridges rather than burying every hazard.
        </p>
        <p>
          Obstacle spawning is paced by a rolling interval that tightens with
          difficulty. At low difficulty, spawns are 150–400 pixels apart and
          limited to pits, falling rocks, cacti, scorpions, and snakes. As
          difficulty rises, boulders, rock arches, cave gates, and dust devils
          enter the pool, and multiple obstacles can spawn simultaneously.
          Power-ups appear every 500–700 pixels, offering sand refills, shields,
          sand bursts, slow-time, or full tank restores.
        </p>
      </ArticleSection>

      <ArticleSection title="Putting it together">
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
          with palette lookups — each sprite is a 2D array of single characters
          mapped to hex colours. The whole frame is a
          single <code>putImageData</code> call for the background and grid,
          then <code>fillRect</code> overlays for obstacles, power-ups,
          particles, and screen shake.
        </p>
      </ArticleSection>

      <FullGame />
    </EssayShell>
  );
}
