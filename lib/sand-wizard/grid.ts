import { CellType } from './types';
import { LOGICAL_W, LOGICAL_H } from './constants';

export function createGrid(width = LOGICAL_W, height = LOGICAL_H): Uint8Array {
  return new Uint8Array(width * height);
}

export function getCell(grid: Uint8Array, x: number, y: number, width = LOGICAL_W): CellType {
  const height = grid.length / width;
  if (x < 0 || x >= width || y < 0 || y >= height) return 2;
  return grid[x + y * width] as CellType;
}

export function setCell(grid: Uint8Array, x: number, y: number, value: CellType, width = LOGICAL_W): void {
  const height = grid.length / width;
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  grid[x + y * width] = value;
}

export function isEmpty(grid: Uint8Array, x: number, y: number, width = LOGICAL_W): boolean {
  return getCell(grid, x, y, width) === 0;
}
