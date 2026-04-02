import { getCell, setCell } from './grid';
import { LOGICAL_W, LOGICAL_H } from './constants';

export function stepSand(grid: Uint8Array, width = LOGICAL_W, height = LOGICAL_H, frame = 0): void {
  for (let y = height - 2; y >= 0; y--) {
    const leftToRight = ((y + frame) % 2 === 0);
    for (let i = 0; i < width; i++) {
      const x = leftToRight ? i : width - 1 - i;
      if (getCell(grid, x, y, width) !== 1) continue;

      if (getCell(grid, x, y + 1, width) === 0) {
        setCell(grid, x, y, 0, width);
        setCell(grid, x, y + 1, 1, width);
        continue;
      }

      const tryLeft = Math.random() > 0.5;
      const dx1 = tryLeft ? -1 : 1;
      const dx2 = tryLeft ? 1 : -1;

      if (getCell(grid, x + dx1, y + 1, width) === 0) {
        setCell(grid, x, y, 0, width);
        setCell(grid, x + dx1, y + 1, 1, width);
      } else if (getCell(grid, x + dx2, y + 1, width) === 0) {
        setCell(grid, x, y, 0, width);
        setCell(grid, x + dx2, y + 1, 1, width);
      }
    }
  }
}

/**
 * Shift the entire grid left by `pixels` columns (integer).
 * Columns that scroll off the left are discarded.
 * New columns on the right are filled with empty (0).
 */
export function shiftGridLeft(grid: Uint8Array, width: number, height: number, pixels: number): void {
  const cols = Math.floor(pixels);
  if (cols <= 0) return;

  // Shift rows left
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    grid.copyWithin(rowOffset, rowOffset + cols, rowOffset + width);
    // Clear the newly exposed right columns
    grid.fill(0, rowOffset + width - cols, rowOffset + width);
  }
}
