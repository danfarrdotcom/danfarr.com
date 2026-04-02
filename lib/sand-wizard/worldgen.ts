import { GameState } from './types';
import { setCell } from './grid';
import { GROUND_Y, LOGICAL_H } from './constants';

/**
 * Fill newly exposed right-edge columns with base terrain.
 * Called each frame after shiftGridLeft exposes new columns.
 * `newCols` is the number of columns that were shifted in (same as colsToShift in the loop).
 */
export function fillNewColumns(state: GameState, newCols: number): void {
  if (newCols <= 0) return;

  const width = state.gridWidth;
  const startX = width - newCols;

  for (let x = startX; x < width; x++) {
    // Solid rock floor
    for (let y = GROUND_Y; y < LOGICAL_H; y++) {
      setCell(state.grid, x, y, 2, width);
    }
    // Sand surface
    setCell(state.grid, x, GROUND_Y - 1, 1, width);
  }
}
