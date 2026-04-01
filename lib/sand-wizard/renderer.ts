import { GameState } from './types';
import {
  LOGICAL_W, LOGICAL_H, SCALE,
  SAND_COLOURS, ROCK_COLOUR, SKY_TOP, SKY_BOTTOM,
} from './constants';
import { getCell } from './grid';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
): void {
  const { grid, gridWidth, gridHeight } = state;

  const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H * SCALE);
  grad.addColorStop(0, SKY_TOP);
  grad.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LOGICAL_W * SCALE, LOGICAL_H * SCALE);

  const imageData = ctx.createImageData(LOGICAL_W * SCALE, LOGICAL_H * SCALE);
  const data = imageData.data;

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
          const px = (x * SCALE + sx) + (y * SCALE + sy) * (LOGICAL_W * SCALE);
          data[px * 4 + 0] = r;
          data[px * 4 + 1] = g;
          data[px * 4 + 2] = b;
          data[px * 4 + 3] = 255;
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
