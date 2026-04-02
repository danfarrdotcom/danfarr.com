export type CellType = 0 | 1 | 2;
// 0 = empty, 1 = sand, 2 = solid rock

export interface GameState {
  grid: Uint8Array;
  gridWidth: number;
  gridHeight: number;
  sandResource: number;
  score: number;
  phase: 'title' | 'playing' | 'dead';
  cameraX: number;
  obstacles: Obstacle[];
  powerUps: PowerUp[];
  nextSpawnX: number;  // screen-space x where next obstacle will be spawned
}

export interface Player {
  x: number;
  y: number;
  vy: number;
  state: 'walk' | 'dead';
}

export interface Obstacle {
  type: 'boulder' | 'falling-rock' | 'dust-devil' | 'cave-gate';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  gapY?: number;    // cave-gate only: y of the gap start (grid units from top of obstacle)
  gapH?: number;   // cave-gate only: gap height in grid units
}

export type PowerUpType = 'sand-boost' | 'shield' | 'sand-burst' | 'slow-scroll';

export interface PowerUp {
  x: number;
  y: number;
  collected: boolean;
  type: PowerUpType;
}
