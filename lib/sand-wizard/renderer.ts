import { GameState } from './types';
import {
  SCALE,
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
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
