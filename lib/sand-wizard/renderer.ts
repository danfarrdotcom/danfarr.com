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

// --- Sprite-sheet walk cycle ---
const SHEET_COLS = 4;
const SHEET_ROWS = 2;
const WALK_FRAME_COUNT = SHEET_COLS * SHEET_ROWS; // 8
const SHEET_FRAME_W = 384; // source px per frame (1536 / 4)
const SHEET_FRAME_H = 512; // source px per frame (1024 / 2)
const WIZARD_WALK_W = 36;  // dest canvas px
const WIZARD_WALK_H = 48;  // dest canvas px

let _wizardSheet: HTMLCanvasElement | null = null;
let _sheetPending = false;

function loadWizardSheet(): void {
  if (_sheetPending) return;
  _sheetPending = true;
  const img = new Image();
  img.src = '/wizard-walk.png';
  img.onload = () => {
    const off = document.createElement('canvas');
    off.width = img.width;
    off.height = img.height;
    const oc = off.getContext('2d')!;
    oc.drawImage(img, 0, 0);
    const id = oc.getImageData(0, 0, img.width, img.height);
    const d = id.data;
    const [br, bg, bb] = [d[0], d[1], d[2]];
    const tol = 25;
    for (let i = 0; i < d.length; i += 4) {
      if (Math.abs(d[i] - br) < tol && Math.abs(d[i + 1] - bg) < tol && Math.abs(d[i + 2] - bb) < tol) {
        d[i + 3] = 0;
      }
    }
    oc.putImageData(id, 0, 0);
    _wizardSheet = off;
  };
}

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

  if (player.state === 'duck') {
    const sy = (baseY - DUCK_FRAME.length) * SCALE;
    drawSprite(ctx, sx, sy, DUCK_FRAME, WIZARD_PALETTE);
  } else if (player.state === 'jump') {
    const sy = (baseY - JUMP_FRAME.length) * SCALE;
    drawSprite(ctx, sx, sy, JUMP_FRAME, WIZARD_PALETTE);
  } else if (_wizardSheet) {
    const fi = Math.floor(frame / 8) % WALK_FRAME_COUNT;
    const col = fi % SHEET_COLS;
    const row = Math.floor(fi / SHEET_COLS);
    ctx.drawImage(
      _wizardSheet,
      col * SHEET_FRAME_W, row * SHEET_FRAME_H, SHEET_FRAME_W, SHEET_FRAME_H,
      sx, baseY * SCALE - WIZARD_WALK_H, WIZARD_WALK_W, WIZARD_WALK_H,
    );
  } else {
    loadWizardSheet();
    const bitmap = WALK_FRAMES[Math.floor(frame / 8) % 3];
    const sy = (baseY - bitmap.length) * SCALE;
    drawSprite(ctx, sx, sy, bitmap, WIZARD_PALETTE);
  }
}
