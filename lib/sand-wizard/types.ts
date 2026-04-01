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
  state: 'walk' | 'jump' | 'duck' | 'dead';
}

export interface Obstacle {
  type: 'boulder' | 'falling-rock' | 'dust-devil' | 'geyser';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
}

export interface PowerUp {
  x: number;
  y: number;
  collected: boolean;
}
