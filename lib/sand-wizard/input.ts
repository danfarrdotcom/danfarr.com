import { GameState } from './types';
import { SCALE, SAND_COST, SAND_MAX, SAND_REGEN_BASE } from './constants';
import { setCell, getCell } from './grid';

export type InputAction = 'place' | 'remove' | null;

export function canvasToGrid(canvasPx: number): number {
  return Math.floor(canvasPx / SCALE);
}

export function applyBrush(
  state: GameState,
  canvasX: number,
  canvasY: number,
  action: InputAction,
  radius = 3,
): void {
  if (!action) return;

  const cx = canvasToGrid(canvasX);
  const cy = canvasToGrid(canvasY);

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue;
      const gx = cx + dx;
      const gy = cy + dy;

      if (action === 'place') {
        if (state.sandResource < SAND_COST) continue;
        if (getCell(state.grid, gx, gy, state.gridWidth) === 0) {
          setCell(state.grid, gx, gy, 1, state.gridWidth);
          state.sandResource = Math.max(0, state.sandResource - SAND_COST);
        }
      } else if (action === 'remove') {
        if (getCell(state.grid, gx, gy, state.gridWidth) === 1) {
          setCell(state.grid, gx, gy, 0, state.gridWidth);
        }
      }
    }
  }
}

export function regenSand(state: GameState): void {
  const sandSpent = SAND_MAX - state.sandResource;
  const rate = SAND_REGEN_BASE / (1 + sandSpent / SAND_MAX);
  state.sandResource = Math.min(SAND_MAX, state.sandResource + rate);
}
