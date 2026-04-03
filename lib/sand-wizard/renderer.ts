import { GameState, Player } from './types';
import {
  SCALE, GROUND_Y, CANVAS_W,
  SAND_COLOURS, ROCK_COLOUR,
} from './constants';
import { getCell } from './grid';
import { fillBackground } from './background';
import { getParticles } from './particles';
import { updateShake } from './screenshake';

const WIZARD_PALETTE: Record<string, string> = {
  W: '#e8e8f0', // white robe body
  w: '#c8c8d8', // robe shadow/fold
  H: '#d0d0e8', // hood highlight
  h: '#a0a0c0', // hood shadow
  S: '#c2955a', // staff wood
  s: '#8b6347', // staff shadow
  G: '#aaddff', // staff gem
  E: '#ffcc88', // eye glow
  B: '#303030', // boot/foot
};

// Walk cycle — 3 frames, advance every 8 game frames
// 8 cols × 14 rows. Column 0 is leftmost (staff side).
const WALK_FRAMES: string[][] = [
  // Frame 0 — left foot forward
  [
    '..hHHh..',
    '.hHHHHh.',
    '.hHEHHh.',
    '.hHHHHh.',
    'SsWWWWw.',
    'SsWWWWw.',
    '.sWwWWw.',
    '..WWWWw.',
    '.sWWwWw.',
    '..WWWWw.',
    '.sWwWww.',
    '..WwWww.',
    '.B...w..',
    'BB....B.',
  ],
  // Frame 1 — mid-stride (feet together)
  [
    '..hHHh..',
    '.hHHHHh.',
    '.hHEHHh.',
    '.hHHHHh.',
    'SsWWWWw.',
    'SsWWWWw.',
    '.sWwWWw.',
    '..WWWWw.',
    '.sWWwWw.',
    '..WWWWw.',
    '.sWwWww.',
    '..WWWww.',
    '.BB.ww..',
    '........',
  ],
  // Frame 2 — right foot forward
  [
    '..hHHh..',
    '.hHHHHh.',
    '.hHEHHh.',
    '.hHHHHh.',
    '.sWWWWwS',
    '.sWWWWwS',
    '.sWWwWws',
    '..WWWWw.',
    '.sWWwWw.',
    '..WWWWw.',
    '.sWwWww.',
    '..WwWww.',
    '..w...BB',
    '.B......',
  ],
];


let _imageData: ImageData | null = null;

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  player?: Player,
  frame?: number,
): void {
  const { grid, gridWidth, gridHeight } = state;
  const canvasW = gridWidth * SCALE;
  const canvasH = gridHeight * SCALE;

  // Reuse ImageData across frames — allocate once
  if (!_imageData || _imageData.width !== canvasW || _imageData.height !== canvasH) {
    _imageData = ctx.createImageData(canvasW, canvasH);
  }
  const imageData = _imageData;
  const data = imageData.data;

  // Fill parallax background (sky gradient + dunes + sun)
  fillBackground(data, canvasW, canvasH, state.cameraX);

  // Paint sand and rock pixels on top
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cell = getCell(grid, x, y, gridWidth);
      if (cell === 0) continue;

      const hex = cell === 1
        ? SAND_COLOURS[(x * 3 + y * 7) % SAND_COLOURS.length]
        : ROCK_COLOUR;

      const [r, g, b] = hexToRgb(hex);

      for (let sy = 0; sy < SCALE; sy++) {
        for (let sx = 0; sx < SCALE; sx++) {
          const idx = ((y * SCALE + sy) * canvasW + (x * SCALE + sx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Draw dynamic obstacles
  state.obstacles.forEach((obs) => {
    const sx = obs.x * SCALE;
    const sy = obs.y * SCALE;
    const sw = obs.width * SCALE;
    const sh = obs.height * SCALE;

    if (obs.type === 'cave-gate') {
      const oy = obs.y * SCALE;
      const gapYAbs = (obs.y + (obs.gapY ?? 0)) * SCALE;
      const gapHPx = (obs.gapH ?? 14) * SCALE;

      // Top slab
      ctx.fillStyle = '#4a3728';
      ctx.fillRect(0, oy, CANVAS_W, (obs.gapY ?? 0) * SCALE);
      // Bottom slab
      const bottomStart = gapYAbs + gapHPx;
      const bottomH = (obs.height - (obs.gapY ?? 0)) * SCALE - gapHPx;
      ctx.fillRect(0, bottomStart, CANVAS_W, bottomH);

      // Gap outline hint
      ctx.strokeStyle = 'rgba(255,200,100,0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, gapYAbs, CANVAS_W, gapHPx);

      // Ground shadow telegraph
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, GROUND_Y * SCALE, CANVAS_W, SCALE * 2);
      return; // skip other type checks for this obstacle
    }

    if (obs.type === 'boulder') {
      ctx.fillStyle = '#555555';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = '#888888';
      ctx.fillRect(sx + SCALE, sy + SCALE, sw - SCALE * 2, sh - SCALE * 2);
    }
    if (obs.type === 'falling-rock') {
      ctx.fillStyle = '#666666';
      ctx.fillRect(sx, sy, sw, sh);
      // Shadow telegraph on ground
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(sx, GROUND_Y * SCALE, sw, SCALE * 2);
    }
    if (obs.type === 'dust-devil') {
      ctx.fillStyle = 'rgba(194,149,90,0.35)';
      ctx.fillRect(sx - sw / 2, sy, sw * 2, sh);
    }
  });

  // Draw power-ups — typed colored orbs with pulsing glow
  const PU_COLORS: Record<string, string> = {
    'sand-boost':  '#f5c842',
    'shield':      '#42aaff',
    'sand-burst':  '#ff8c00',
    'slow-scroll': '#44dd88',
  };

  state.powerUps.forEach((pu) => {
    if (pu.collected) return;
    const sx = pu.x * SCALE;
    const sy = pu.y * SCALE;
    const color = PU_COLORS[pu.type] ?? '#00ffcc';
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3 + 0.4 * pulse;
    ctx.fillRect(sx - SCALE, sy - SCALE, 8 * SCALE, 8 * SCALE);
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.fillRect(sx + SCALE, sy + SCALE, 4 * SCALE, 4 * SCALE);
  });

  if (player) {
    renderPlayer(ctx, player, frame ?? 0, state);
  }

  // Particles
  const parts = getParticles();
  for (const p of parts) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x * SCALE, p.y * SCALE, p.size * SCALE, p.size * SCALE);
  }
  ctx.globalAlpha = 1;

  // Screen shake
  const shake = updateShake();
  if (shake.x !== 0 || shake.y !== 0) {
    const img = ctx.getImageData(0, 0, canvasW, canvasH);
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.putImageData(img, Math.round(shake.x * SCALE), Math.round(shake.y * SCALE));
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  bitmap: string[],
  palette: Record<string, string>,
): void {
  const cellSize = SCALE;
  // Group rects by color to minimise fillStyle state changes
  const batches = new Map<string, Array<[number, number]>>();
  for (let row = 0; row < bitmap.length; row++) {
    const line = bitmap[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.') continue;
      const color = palette[ch];
      if (!color) continue;
      let batch = batches.get(color);
      if (!batch) { batch = []; batches.set(color, batch); }
      batch.push([col, row]);
    }
  }
  batches.forEach((cells, color) => {
    ctx.fillStyle = color;
    for (const [col, row] of cells) {
      ctx.fillRect(sx + col * cellSize, sy + row * cellSize, cellSize, cellSize);
    }
  });
}

function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  frame: number,
  state: GameState,
): void {
  if (player.state === 'dead') return;

  const sx = Math.round(player.x) * SCALE;
  const baseY = Math.round(player.y);
  const bitmap = WALK_FRAMES[Math.floor(frame / 8) % 3];
  const sy = (baseY - bitmap.length) * SCALE;
  drawSprite(ctx, sx, sy, bitmap, WIZARD_PALETTE);

  // Shield aura
  if (state.shieldActive) {
    ctx.strokeStyle = 'rgba(100,180,255,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(
      sx + 4 * SCALE,
      sy + 7 * SCALE,
      6 * SCALE,
      9 * SCALE,
      0, 0, Math.PI * 2,
    );
    ctx.stroke();
  }
}
