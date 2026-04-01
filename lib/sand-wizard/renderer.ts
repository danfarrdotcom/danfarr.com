import { GameState, Player } from './types';
import {
  SCALE, GROUND_Y,
  SAND_COLOURS, ROCK_COLOUR,
} from './constants';
import { getCell } from './grid';
import { fillBackground } from './background';

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

const JUMP_FRAME: string[] = [
  '..hHHh..',
  '.hHHHHh.',
  '.hHEHHh.',
  '.hHHHHh.',
  'GsWWWWw.',
  'SsWWWWw.',
  'SsWwWWw.',
  '.sWWWWw.',
  '.BWWwBw.',
  '.BBWwBw.',
  '..WWww..',
  '..Wwww..',
  '........',
  '........',
];

const DUCK_FRAME: string[] = [
  '..hHhh..',
  '.hHHHHh.',
  '.hHEHhh.',
  'SsWWWWw.',
  'SsWwWWw.',
  '.BWWWwB.',
  '.BBWwBB.',
  '........',
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

  // Draw power-ups (cyan hourglass shape)
  state.powerUps.forEach((pu) => {
    if (pu.collected) return;
    const sx = pu.x * SCALE;
    const sy = pu.y * SCALE;
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(sx, sy, 6 * SCALE, 2 * SCALE);
    ctx.fillRect(sx + 2 * SCALE, sy + 2 * SCALE, 2 * SCALE, 6 * SCALE);
    ctx.fillRect(sx, sy + 8 * SCALE, 6 * SCALE, 2 * SCALE);
  });

  if (player) {
    renderPlayer(ctx, player, frame ?? 0);
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
): void {
  if (player.state === 'dead') return;

  const sx = Math.round(player.x) * SCALE;
  const baseY = Math.round(player.y);
  const isDucking = player.state === 'duck';
  const S = SCALE;

  // Body offset when ducking
  const bodyY = isDucking ? baseY - 6 : baseY - 14;
  const sy = bodyY * SCALE;

  // Robe/body — muted purple
  ctx.fillStyle = '#5a3a7a';
  ctx.fillRect(sx + S, sy + 4 * S, 6 * S, isDucking ? 4 * S : 8 * S);

  // Hood — slightly lighter purple
  ctx.fillStyle = '#6a4a8a';
  ctx.fillRect(sx + S, sy, 6 * S, isDucking ? 3 * S : 5 * S);

  // Eye — amber glow
  ctx.fillStyle = '#ffcc88';
  ctx.fillRect(sx + 4 * S, sy + 2 * S, S, S);

  // Staff
  ctx.fillStyle = '#c2955a';
  const staffX = player.state === 'jump' ? sx + 8 * S : sx + 7 * S;
  ctx.fillRect(staffX, sy + 2 * S, S, isDucking ? 6 * S : 10 * S);

  // Walk animation — feet
  if (!isDucking && player.state !== 'jump') {
    const walkFrame = Math.floor(frame / 8) % 2;
    ctx.fillStyle = '#3a2a5a';
    ctx.fillRect(sx + S, sy + 11 * S + (walkFrame === 0 ? S : 0), 2 * S, 2 * S);
    ctx.fillRect(sx + 4 * S, sy + 11 * S + (walkFrame === 1 ? S : 0), 2 * S, 2 * S);
  }
}
