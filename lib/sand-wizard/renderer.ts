import { GameState } from './types';
import {
  SCALE, GROUND_Y,
  SAND_COLOURS, ROCK_COLOUR, SKY_TOP, SKY_BOTTOM,
} from './constants';
import { getCell } from './grid';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
): void {
  const { grid, gridWidth, gridHeight } = state;
  const canvasW = gridWidth * SCALE;
  const canvasH = gridHeight * SCALE;

  const imageData = ctx.createImageData(canvasW, canvasH);
  const data = imageData.data;

  // Fill sky gradient directly into ImageData
  const skyTop = hexToRgb(SKY_TOP);
  const skyBot = hexToRgb(SKY_BOTTOM);

  for (let py = 0; py < canvasH; py++) {
    const t = py / canvasH;
    const r = Math.round(skyTop[0] + (skyBot[0] - skyTop[0]) * t);
    const g = Math.round(skyTop[1] + (skyBot[1] - skyTop[1]) * t);
    const b = Math.round(skyTop[2] + (skyBot[2] - skyTop[2]) * t);
    for (let px = 0; px < canvasW; px++) {
      const idx = (py * canvasW + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

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
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
