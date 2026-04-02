import { GameState, Player } from './types';
import { createGrid, setCell } from './grid';
import { LOGICAL_W, LOGICAL_H, GROUND_Y, SAND_MAX } from './constants';

export function createInitialState(): GameState {
  const grid = createGrid(LOGICAL_W, LOGICAL_H);

  // Seed flat ground: solid rock floor + sand surface
  for (let x = 0; x < LOGICAL_W; x++) {
    for (let y = GROUND_Y; y < LOGICAL_H; y++) {
      setCell(grid, x, y, 2);
    }
    setCell(grid, x, GROUND_Y - 1, 1);
  }

  return {
    grid,
    gridWidth: LOGICAL_W,
    gridHeight: LOGICAL_H,
    sandResource: SAND_MAX,
    score: 0,
    phase: 'title',
    cameraX: 0,
    obstacles: [],
    powerUps: [],
    nextSpawnX: 350,  // first obstacle spawns near right edge of screen
  };
}

export function createInitialPlayer(): Player {
  return {
    x: 40,
    y: GROUND_Y - 2,
    vy: 0,
    state: 'walk',
  };
}
