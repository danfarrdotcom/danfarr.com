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
  // Hat
  T: '#6a1b9a', t: '#4a148c', U: '#5a1090', K: '#cc9900', // hat top, dark, mid, buckle gold
  // Face
  F: '#c48a5a', f: '#a06830', N: '#8a5530', // skin, shadow skin, nose
  E: '#88ccff',                               // eye
  // Beard
  D: '#c0c0c0', d: '#909090',                // beard light, dark
  // Robe
  P: '#7b1fa2', p: '#5c1080', R: '#6a1b9a', r: '#3a0a60', // robe shades
  // Staff & boots
  S: '#8b6347', s: '#6b4a30', G: '#ffd700', g: '#ccaa00', // staff wood, gold orb
  B: '#303030', b: '#1a1a1a',                // boots
};

// 12px wide × 18 rows — floppy hat, beard, flowing robe, staff
const WALK_FRAMES: string[][] = [
  [
    '....tt......',  // hat tip curls
    '...tTTt.....',  // hat top
    '..tTTTTt....',  // hat brim widens
    '.tTTKTTTt...',  // hat with gold buckle
    'ttTTTTTTtt..',  // wide brim
    '..fFFFFf....',  // face top
    '..fEFEFf....',  // eyes
    '..fFNFFf....',  // nose
    '..dDDDDd....',  // beard top
    '..dDddDd....',  // beard detail
    '.pPRRRRPp...',  // robe shoulders
    '.pRRrrRRp...',  // robe chest folds
    '.pRRrrRRp...',  // robe mid
    '.prRRRRrp...',  // robe lower
    '.prRRRRrpSs.',  // robe + staff
    '..rRrrRr.Sg.',  // robe hem + staff + gold orb
    '.Bb....bBSs.',  // boots + staff
    '..b....b....',  // boot soles
  ],
  [
    '....tt......',
    '...tTTt.....',
    '..tTTTTt....',
    '.tTTKTTTt...',
    'ttTTTTTTtt..',
    '..fFFFFf....',
    '..fEFEFf....',
    '..fFNFFf....',
    '..dDDDDd....',
    '..dDddDd....',
    '.pPRRRRPp...',
    '.pRRrrRRp...',
    '.pRRrrRRp...',
    '.prRRRRrp...',
    '.prRRRRrpSs.',
    '..rRrrRr.Sg.',
    '..Bb..bBSs..',
    '...b..b.....',
  ],
  [
    '.....tt.....',
    '....tTTt....',
    '...tTTTTt...',
    '..tTTKTTTt..',
    '.ttTTTTTTtt.',
    '...fFFFFf...',
    '...fEFEFf...',
    '...fFNFFf...',
    '...dDDDDd...',
    '...dDddDd...',
    '..pPRRRRPp..',
    '..pRRrrRRp..',
    '..pRRrrRRp..',
    '..prRRRRrp..',
    'Ss.rRRRRrp..',
    '.gS.rRrrRr..',
    '.sSBb..bB...',
    '....b..b....',
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

// Craggy boulder shape — 8×8 with irregular edges, multiple variants
const BOULDER_SHAPES: string[][] = [
  [
    '..DDDD..',
    '.DLLLLD.',
    'DLLLLLD.',
    'DLLLLLLD',
    'DLLLLLLD',
    '.DLLLLLD',
    '.DLLLLD.',
    '..DDDD..',
  ],
  [
    '..DDD...',
    '.DLLLD..',
    'DLLLLLDD',
    'DLLLLLD.',
    'DDLLLLD.',
    '.DLLLLD.',
    '..DLLLD.',
    '...DDD..',
  ],
  [
    '...DDD..',
    '.DDLLLD.',
    'DLLLLLD.',
    'DLLLLLDD',
    'DLLLLLLD',
    'DDLLLD..',
    '.DDLLD..',
    '..DDD...',
  ],
];
const BOULDER_PALETTE: Record<string, string> = {
  D: '#444444', L: '#777777',
};

// Falling rock — jagged shapes, multiple variants per size
const ROCK_SHAPES: Record<number, string[][]> = {
  4: [
    ['..DD', '.DLD', 'DLLD', '.DD.'],
    ['.DD.', 'DLLD', '.DLD', '..DD'],
    ['.DD.', 'DLDD', 'DLLD', '.DD.'],
  ],
  8: [
    [
      '..DDDD..',
      '.DLLLDD.',
      'DLLLLLD.',
      'DLLLLLDD',
      'DDLLLLD.',
      '.DLLLD..',
      '..DLLD..',
      '...DD...',
    ],
    [
      '...DDD..',
      '..DLLLD.',
      '.DLLLLD.',
      'DLLLLLD.',
      'DLLLLLDD',
      '.DDLLLD.',
      '..DLLD..',
      '...DD...',
    ],
    [
      '..DDD...',
      '.DLLDD..',
      'DLLLLLDD',
      'DLLLLLD.',
      '.DLLLLDD',
      '.DDLLD..',
      '..DDD...',
      '........',
    ],
  ],
  12: [
    [
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
    [
      '...DDDDD....',
      '..DLLLLLD...',
      '.DLLLLLLLDD.',
      'DLLLLLLLLLD.',
      'DLLLLLLLLD..',
      '.DDLLLLLLD..',
      '..DLLLLLLDD.',
      '..DDLLLLLD..',
      '...DLLLLD...',
      '...DDLLDD...',
      '....DDDD....',
      '............',
    ],
  ],
  16: [
    [
      '.....DDDDD.....',
      '...DDLLLLLDD...',
      '..DLLLLLLLLDD..',
      '.DLLLLLLLLLLD..',
      'DLLLLLLLLLLLLDD',
      'DLLLLLLLLLLLLD.',
      'DDLLLLLLLLLLLDD',
      '.DLLLLLLLLLLLD.',
      '.DDLLLLLLLLLD..',
      '..DLLLLLLLLLDD.',
      '..DDLLLLLLLLD..',
      '...DLLLLLLLD...',
      '...DDLLLLDD....',
      '....DDLLDD.....',
      '.....DDDD......',
      '......DD.......',
    ],
    [
      '......DDDD.....',
      '....DDLLLDD....',
      '..DDLLLLLLLDD..',
      '.DLLLLLLLLLLDD.',
      'DLLLLLLLLLLLLD.',
      'DLLLLLLLLLLLLDD',
      '.DDLLLLLLLLLLD.',
      '..DLLLLLLLLLLD.',
      '..DDLLLLLLLLDD.',
      '...DLLLLLLLD...',
      '...DDLLLLLDD...',
      '....DLLLLD.....',
      '....DDLLDD.....',
      '.....DDDD......',
      '......DD.......',
      '................',
    ],
  ],
  20: [
    [
      '........DDDD........',
      '......DDLLLDD.......',
      '....DDLLLLLLLDD.....',
      '..DDLLLLLLLLLLLDD...',
      '.DLLLLLLLLLLLLLLD...',
      'DLLLLLLLLLLLLLLLLDD.',
      'DLLLLLLLLLLLLLLLLD..',
      'DDLLLLLLLLLLLLLLLLDD',
      '.DLLLLLLLLLLLLLLLD..',
      '.DDLLLLLLLLLLLLLLD..',
      '..DLLLLLLLLLLLLLDD..',
      '..DDLLLLLLLLLLLD....',
      '...DLLLLLLLLLLDD....',
      '...DDLLLLLLLLD......',
      '....DDLLLLLLDD......',
      '....DDLLLLDD........',
      '.....DDDLDD.........',
      '......DDDD..........',
      '.......DD...........',
      '....................',
    ],
  ],
  24: [
    [
      '..........DDDDD.............',
      '........DDLLLLLDD...........',
      '......DDLLLLLLLLLDD.........',
      '....DDLLLLLLLLLLLLLDD.......',
      '..DDLLLLLLLLLLLLLLLLLDD.....',
      '.DLLLLLLLLLLLLLLLLLLLLD.....',
      'DLLLLLLLLLLLLLLLLLLLLLLDD...',
      'DLLLLLLLLLLLLLLLLLLLLLLD....',
      'DDLLLLLLLLLLLLLLLLLLLLLDD...',
      '.DDLLLLLLLLLLLLLLLLLLLLLD...',
      '..DLLLLLLLLLLLLLLLLLLLD.....',
      '..DDLLLLLLLLLLLLLLLLLDD.....',
      '...DLLLLLLLLLLLLLLLLD.......',
      '...DDLLLLLLLLLLLLLLDD.......',
      '....DLLLLLLLLLLLLLD.........',
      '....DDLLLLLLLLLLLDD.........',
      '.....DDLLLLLLLLLD...........',
      '......DDLLLLLDD.............',
      '.......DDDLLDD..............',
      '........DDDDD...............',
      '.........DDD................',
      '..........D.................',
      '............................',
      '............................',
    ],
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
  mouseCanvasX?: number,
  mouseCanvasY?: number,
  mouseAction?: 'place' | 'remove' | null,
): void {
  const { grid, gridWidth, gridHeight } = state;
  const canvasW = gridWidth * SCALE;
  const canvasH = gridHeight * SCALE;

  if (!_imageData || _imageData.width !== canvasW || _imageData.height !== canvasH) {
    _imageData = ctx.createImageData(canvasW, canvasH);
  }
  const imageData = _imageData;
  const data = imageData.data;

  fillBackground(data, canvasW, canvasH, state.cameraX, state.score, state.obstacles.length, frame ?? 0);

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
      const variants = BOULDER_SHAPES;
      const variant = variants[Math.abs(Math.round(obs.x * 7 + obs.y * 13)) % variants.length];
      drawSprite(ctx, Math.round(obs.x) * SCALE, Math.round(obs.y) * SCALE, variant, BOULDER_PALETTE);
      return;
    }
    if (obs.type === 'falling-rock') {
      const variants = ROCK_SHAPES[obs.width] ?? ROCK_SHAPES[16];
      const variant = variants[Math.abs(Math.round(obs.x * 7 + obs.y * 13)) % variants.length];
      drawSprite(ctx, Math.round(obs.x) * SCALE, Math.round(obs.y) * SCALE, variant, ROCK_PALETTE);
      // Shadow telegraph
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(Math.round(obs.x) * SCALE, GROUND_Y * SCALE, obs.width * SCALE, SCALE * 2);
      return;
    }
    if (obs.type === 'cactus') {
      renderCactus(ctx, obs);
      return;
    }
    if (obs.type === 'dust-devil') {
      renderDustDevil(ctx, obs, frame ?? 0);
      return;
    }
    if (obs.type === 'scorpion') {
      renderScorpion(ctx, obs);
      return;
    }
    if (obs.type === 'snake') {
      renderSnake(ctx, obs, frame ?? 0);
      return;
    }
    // rock-arch is baked into the grid, no dynamic rendering needed
  });

  // Power-ups
  const PU_COLORS: Record<string, string> = {
    'sand-boost': '#f5c842', 'shield': '#42aaff',
    'sand-burst': '#ff8c00', 'slow-scroll': '#44dd88',
    'sand-full': '#ff44ff',
  };
  state.powerUps.forEach((pu) => {
    if (pu.collected) return;
    const cx = pu.x * SCALE + 3 * SCALE;
    const cy = pu.y * SCALE + 3 * SCALE;
    const r = 4 * SCALE;
    const color = PU_COLORS[pu.type] ?? '#00ffcc';
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);

    // Outer glow
    ctx.globalAlpha = 0.2 + 0.2 * pulse;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.fill();

    // Main circle
    ctx.globalAlpha = 0.6 + 0.3 * pulse;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
    ctx.fill();

    // Bright center
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  if (player) renderPlayer(ctx, player, frame ?? 0, state);

  // Electric bolt from wizard to mouse — only when clicking
  if (player && mouseAction && mouseCanvasX !== undefined && mouseCanvasY !== undefined) {
    renderLightningBolt(ctx, player, mouseCanvasX, mouseCanvasY, frame ?? 0);
  }

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

function renderCactus(ctx: CanvasRenderingContext2D, obs: Obstacle): void {
  const sx = Math.round(obs.x) * SCALE;
  const sy = Math.round(obs.y) * SCALE;
  const size = obs.width; // square: width = height
  const green = '#22781e';
  const darkGreen = '#145a10';
  const spine = '#c0d090';

  // Main body — oval-ish
  ctx.fillStyle = green;
  for (let dy = 1; dy < size - 1; dy++) {
    const rowW = Math.max(1, Math.round((size / 2) * (1 - Math.abs(dy - size / 2) / (size / 2) * 0.4)));
    const startX = Math.round((size - rowW) / 2);
    ctx.fillRect(sx + startX * SCALE, sy + dy * SCALE, rowW * SCALE, SCALE);
  }
  // Dark center line
  ctx.fillStyle = darkGreen;
  const midX = Math.floor(size / 2);
  for (let dy = 2; dy < size - 2; dy++) {
    ctx.fillRect(sx + midX * SCALE, sy + dy * SCALE, SCALE, SCALE);
  }
  // Arms (on larger cacti)
  if (size >= 12) {
    ctx.fillStyle = green;
    const armY1 = sy + Math.floor(size * 0.3) * SCALE;
    ctx.fillRect(sx - 2 * SCALE, armY1, 2 * SCALE, SCALE);
    ctx.fillRect(sx - 2 * SCALE, armY1 - SCALE, SCALE, SCALE);
    ctx.fillRect(sx - 2 * SCALE, armY1 - 2 * SCALE, SCALE, SCALE);
    const armY2 = sy + Math.floor(size * 0.55) * SCALE;
    ctx.fillRect(sx + size * SCALE, armY2, 2 * SCALE, SCALE);
    ctx.fillRect(sx + (size + 1) * SCALE, armY2 - SCALE, SCALE, SCALE);
    ctx.fillRect(sx + (size + 1) * SCALE, armY2 - 2 * SCALE, SCALE, SCALE);
  }
  // Spines
  ctx.fillStyle = spine;
  ctx.fillRect(sx + midX * SCALE, sy - SCALE, SCALE, SCALE);
  if (size >= 12) {
    ctx.fillRect(sx - 3 * SCALE, sy + Math.floor(size * 0.3) * SCALE - 3 * SCALE, SCALE, SCALE);
    ctx.fillRect(sx + (size + 2) * SCALE, sy + Math.floor(size * 0.55) * SCALE - 3 * SCALE, SCALE, SCALE);
  }
}

function renderScorpion(ctx: CanvasRenderingContext2D, obs: Obstacle): void {
  const sx = Math.round(obs.x) * SCALE;
  const sy = Math.round(obs.y) * SCALE;
  const f = (obs.frame ?? 0);
  const legWiggle = Math.sin(f * 0.3) > 0 ? SCALE : 0;
  // Body — dark brown
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(sx + 2 * SCALE, sy + 2 * SCALE, 4 * SCALE, 2 * SCALE);
  // Head
  ctx.fillRect(sx + 6 * SCALE, sy + 2 * SCALE, 2 * SCALE, SCALE);
  // Tail — curves up
  ctx.fillStyle = '#4a2a14';
  ctx.fillRect(sx + SCALE, sy + 2 * SCALE, SCALE, SCALE);
  ctx.fillRect(sx, sy + SCALE, SCALE, SCALE);
  ctx.fillRect(sx, sy, SCALE, SCALE);
  // Stinger
  ctx.fillStyle = '#cc4400';
  ctx.fillRect(sx + SCALE, sy, SCALE, SCALE);
  // Pincers
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(sx + 7 * SCALE, sy + SCALE, SCALE, SCALE);
  ctx.fillRect(sx + 7 * SCALE, sy + 3 * SCALE, SCALE, SCALE);
  // Legs
  ctx.fillStyle = '#2a1808';
  ctx.fillRect(sx + 3 * SCALE, sy + 4 * SCALE - legWiggle, SCALE, SCALE);
  ctx.fillRect(sx + 5 * SCALE, sy + 4 * SCALE - legWiggle, SCALE, SCALE);
}

function renderSnake(ctx: CanvasRenderingContext2D, obs: Obstacle, frame: number): void {
  const sx = Math.round(obs.x) * SCALE;
  const sy = Math.round(obs.y) * SCALE;
  const slither = Math.sin(frame * 0.2);
  // Body — sinuous S-curve
  ctx.fillStyle = '#2a6a20';
  for (let i = 0; i < 10; i++) {
    const wave = Math.round(Math.sin(i * 0.8 + frame * 0.15) * 1);
    ctx.fillRect(sx + i * SCALE, sy + SCALE + wave * SCALE, SCALE, SCALE);
  }
  // Head
  ctx.fillStyle = '#1a4a10';
  ctx.fillRect(sx + 10 * SCALE, sy + SCALE + Math.round(slither) * SCALE, SCALE, 2 * SCALE);
  // Eyes
  ctx.fillStyle = '#ff4400';
  ctx.fillRect(sx + 10 * SCALE, sy + SCALE + Math.round(slither) * SCALE, SCALE, SCALE);
  // Tongue flicker
  if (Math.sin(frame * 0.4) > 0.5) {
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(sx + 11 * SCALE, sy + SCALE + Math.round(slither) * SCALE, SCALE, SCALE);
  }
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

function renderLightningBolt(
  ctx: CanvasRenderingContext2D,
  player: Player,
  mouseX: number, mouseY: number,
  frame: number,
): void {
  const sx = Math.round(player.x) * SCALE + 10 * SCALE;
  const sy = (Math.round(player.y) - 5) * SCALE;
  const ex = mouseX;
  const ey = mouseY;
  const dx = ex - sx;
  const dy = ey - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 5) return;

  const segments = Math.max(5, Math.floor(dist / 20));
  const points: Array<[number, number]> = [[sx, sy]];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const jitter = 8 + dist * 0.03;
    const ox = (Math.sin(frame * 0.8 + i * 3.7) * jitter);
    const oy = (Math.cos(frame * 0.6 + i * 2.3) * jitter);
    points.push([sx + dx * t + ox, sy + dy * t + oy]);
  }
  points.push([ex, ey]);

  ctx.save();

  // Outer glow
  ctx.shadowColor = '#b060ff';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = 'rgba(180,130,255,0.4)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();

  // Core bolt
  ctx.shadowColor = '#d0a0ff';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = '#d0a0ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();

  // Bright center
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 6;
  ctx.strokeStyle = '#f0e0ff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();

  // Glow at cursor impact point
  ctx.shadowBlur = 0;
  const gradient = ctx.createRadialGradient(ex, ey, 0, ex, ey, 18);
  gradient.addColorStop(0, 'rgba(200,160,255,0.5)');
  gradient.addColorStop(1, 'rgba(200,160,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(ex - 18, ey - 18, 36, 36);

  ctx.restore();
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
    ctx.ellipse(sx + 6 * SCALE, sy + 9 * SCALE, 8 * SCALE, 11 * SCALE, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
