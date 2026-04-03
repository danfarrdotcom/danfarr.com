import { GameState, Player, Obstacle } from './types';
import {
  SCALE, GROUND_Y, CANVAS_W,
  SAND_COLOURS, ROCK_COLOUR,
} from './constants';
import { getCell } from './grid';
import { fillBackground } from './background';
import { getParticles } from './particles';
import { updateShake } from './screenshake';

const WIZARD_PALETTE: Record<string, string> = {
  W: '#e8e8f0', w: '#c8c8d8', H: '#d0d0e8', h: '#a0a0c0',
  S: '#c2955a', s: '#8b6347', G: '#aaddff', E: '#ffcc88', B: '#303030',
};

const WALK_FRAMES: string[][] = [
  [
    '..hHHh..', '.hHHHHh.', '.hHEHHh.', '.hHHHHh.',
    'SsWWWWw.', 'SsWWWWw.', '.sWwWWw.', '..WWWWw.',
    '.sWWwWw.', '..WWWWw.', '.sWwWww.', '..WwWww.',
    '.B...w..', 'BB....B.',
  ],
  [
    '..hHHh..', '.hHHHHh.', '.hHEHHh.', '.hHHHHh.',
    'SsWWWWw.', 'SsWWWWw.', '.sWwWWw.', '..WWWWw.',
    '.sWWwWw.', '..WWWWw.', '.sWwWww.', '..WWWww.',
    '.BB.ww..', '........',
  ],
  [
    '..hHHh..', '.hHHHHh.', '.hHEHHh.', '.hHHHHh.',
    '.sWWWWwS', '.sWWWWwS', '.sWWwWws', '..WWWWw.',
    '.sWWwWw.', '..WWWWw.', '.sWwWww.', '..WwWww.',
    '..w...BB', '.B......',
  ],
];

// Vulture sprite — 12×8 pixel art, 3 wing-flap frames
const VULTURE_PALETTE: Record<string, string> = {
  B: '#1a1a1a', b: '#333333', W: '#4a3a2a', w: '#6b5a44',
  R: '#aa2222', E: '#ffcc00', H: '#2a2a2a',
};

const VULTURE_FRAMES: string[][] = [
  // Wings up
  [
    '.B........B.',
    'BB........BB',
    '.BWwwwwwWB..',
    '..BwwHRwB...',
    '..BwwEwwB...',
    '...BwwwB....',
    '...BBBB.....',
    '............',
  ],
  // Wings mid
  [
    '............',
    'BBwwwwwwwwBB',
    '..BwwwwwwB..',
    '..BwwHRwB...',
    '..BwwEwwB...',
    '...BwwwB....',
    '...BBBB.....',
    '............',
  ],
  // Wings down
  [
    '............',
    '..BwwwwwwB..',
    '..BwwwwwwB..',
    '..BwwHRwB...',
    '..BwwEwwB...',
    'BB.BwwwB..BB',
    '.B.BBBB..B.',
    '............',
  ],
];

// Craggy boulder shape — 8×8 with irregular edges
const BOULDER_SHAPE: string[] = [
  '..DDDD..',
  '.DLLLLD.',
  'DLLLLLD.',
  'DLLLLLLD',
  'DLLLLLLD',
  '.DLLLLLD',
  '.DLLLLD.',
  '..DDDD..',
];
const BOULDER_PALETTE: Record<string, string> = {
  D: '#444444', L: '#777777',
};

// Falling rock — jagged shape
const ROCK_SHAPES: Record<number, string[]> = {
  4: ['..DD', '.DLD', 'DLLD', '.DD.'],
  8: [
    '..DDDD..',
    '.DLLLDD.',
    'DLLLLLD.',
    'DLLLLLDD',
    'DDLLLLD.',
    '.DLLLD..',
    '..DLLD..',
    '...DD...',
  ],
  12: [
    '....DDDD....',
    '..DDLLLDD...',
    '.DLLLLLLDD..',
    'DLLLLLLLLD..',
    'DLLLLLLLLDD.',
    'DDLLLLLLLLDD',
    '.DLLLLLLLD..',
    '.DDLLLLLLD..',
    '..DLLLLLD...',
    '..DDLLLDD...',
    '...DDLDD....',
    '....DDD.....',
  ],
};
const ROCK_PALETTE: Record<string, string> = {
  D: '#555555', L: '#888888',
};

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

  if (!_imageData || _imageData.width !== canvasW || _imageData.height !== canvasH) {
    _imageData = ctx.createImageData(canvasW, canvasH);
  }
  const imageData = _imageData;
  const data = imageData.data;

  fillBackground(data, canvasW, canvasH, state.cameraX);

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
          data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Draw obstacles
  state.obstacles.forEach((obs) => {
    if (obs.type === 'cave-gate') {
      renderCaveGate(ctx, obs);
      return;
    }
    if (obs.type === 'boulder') {
      drawSprite(ctx, Math.round(obs.x) * SCALE, Math.round(obs.y) * SCALE, BOULDER_SHAPE, BOULDER_PALETTE);
      return;
    }
    if (obs.type === 'falling-rock') {
      const shape = ROCK_SHAPES[obs.width] ?? ROCK_SHAPES[8];
      drawSprite(ctx, Math.round(obs.x) * SCALE, Math.round(obs.y) * SCALE, shape, ROCK_PALETTE);
      // Shadow telegraph
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(Math.round(obs.x) * SCALE, GROUND_Y * SCALE, obs.width * SCALE, SCALE * 2);
      return;
    }
    if (obs.type === 'dust-devil') {
      renderDustDevil(ctx, obs, frame ?? 0);
      return;
    }
    if (obs.type === 'vulture') {
      const wingFrame = Math.floor((obs.frame ?? 0) / 6) % 3;
      const bitmap = VULTURE_FRAMES[wingFrame];
      drawSprite(ctx, Math.round(obs.x) * SCALE, Math.round(obs.y) * SCALE, bitmap, VULTURE_PALETTE);
      // Shadow on ground when diving
      if (obs.swoopPhase === 'dive') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(Math.round(obs.x) * SCALE, GROUND_Y * SCALE, obs.width * SCALE, SCALE * 2);
      }
      return;
    }
    // rock-arch is baked into the grid, no dynamic rendering needed
  });

  // Power-ups
  const PU_COLORS: Record<string, string> = {
    'sand-boost': '#f5c842', 'shield': '#42aaff',
    'sand-burst': '#ff8c00', 'slow-scroll': '#44dd88',
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

  if (player) renderPlayer(ctx, player, frame ?? 0, state);

  // Particles
  const parts = getParticles();
  for (const p of parts) {
    ctx.globalAlpha = p.life / p.maxLife;
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

function renderCaveGate(ctx: CanvasRenderingContext2D, obs: Obstacle): void {
  const oy = obs.y * SCALE;
  const gapYAbs = (obs.y + (obs.gapY ?? 0)) * SCALE;
  const gapHPx = (obs.gapH ?? 14) * SCALE;
  ctx.fillStyle = '#4a3728';
  ctx.fillRect(0, oy, CANVAS_W, (obs.gapY ?? 0) * SCALE);
  const bottomStart = gapYAbs + gapHPx;
  const bottomH = (obs.height - (obs.gapY ?? 0)) * SCALE - gapHPx;
  ctx.fillRect(0, bottomStart, CANVAS_W, bottomH);
  // Jagged edges on gap
  ctx.fillStyle = '#3a2a1a';
  for (let i = 0; i < CANVAS_W; i += SCALE * 4) {
    const jag = Math.sin(i * 0.07) * SCALE * 2;
    ctx.fillRect(i, gapYAbs - Math.abs(jag), SCALE * 2, Math.abs(jag));
    ctx.fillRect(i, gapYAbs + gapHPx, SCALE * 2, Math.abs(jag));
  }
  ctx.strokeStyle = 'rgba(255,200,100,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, gapYAbs, CANVAS_W, gapHPx);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, GROUND_Y * SCALE, CANVAS_W, SCALE * 2);
}

function renderDustDevil(ctx: CanvasRenderingContext2D, obs: Obstacle, frame: number): void {
  const sx = obs.x * SCALE;
  const sy = obs.y * SCALE;
  const sw = obs.width * SCALE;
  const sh = obs.height * SCALE;
  // Swirling sand particles
  ctx.fillStyle = 'rgba(194,149,90,0.25)';
  ctx.fillRect(sx - sw / 2, sy, sw * 2, sh);
  // Animated sand specks
  ctx.fillStyle = 'rgba(210,170,100,0.6)';
  for (let i = 0; i < 8; i++) {
    const angle = (frame * 0.15 + i * 0.8);
    const r = sw * 0.3 + Math.sin(i * 2.1) * sw * 0.2;
    const px = sx + sw / 2 + Math.cos(angle) * r;
    const py = sy + (i / 8) * sh;
    ctx.fillRect(px, py, SCALE, SCALE);
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number,
  bitmap: string[],
  palette: Record<string, string>,
): void {
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
      ctx.fillRect(sx + col * SCALE, sy + row * SCALE, SCALE, SCALE);
    }
  });
}

function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player, frame: number, state: GameState,
): void {
  if (player.state === 'dead') return;
  const sx = Math.round(player.x) * SCALE;
  const baseY = Math.round(player.y);
  const bitmap = WALK_FRAMES[Math.floor(frame / 8) % 3];
  const sy = (baseY - bitmap.length) * SCALE;
  drawSprite(ctx, sx, sy, bitmap, WIZARD_PALETTE);
  if (state.shieldActive) {
    ctx.strokeStyle = 'rgba(100,180,255,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(sx + 4 * SCALE, sy + 7 * SCALE, 6 * SCALE, 9 * SCALE, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
