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
  nextSpawnX: number;
  shieldActive: boolean;
  slowScrollFrames: number;
  nextPowerUpX: number;
  terrainSeed: number;  // rolling seed for terrain height variation
}

export interface Player {
  x: number;
  y: number;
  vy: number;
  state: 'walk' | 'dead';
}

export interface Obstacle {
  type: 'boulder' | 'falling-rock' | 'dust-devil' | 'cave-gate' | 'vulture' | 'rock-arch';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  gapY?: number;
  gapH?: number;
  swoopPhase?: 'glide' | 'dive' | 'climb';  // vulture only
  startY?: number;   // vulture: altitude before dive
  targetX?: number;  // vulture: x where it begins diving
  frame?: number;    // animation frame counter
}

export type PowerUpType = 'sand-boost' | 'shield' | 'sand-burst' | 'slow-scroll';

export interface PowerUp {
  x: number;
  y: number;
  collected: boolean;
  type: PowerUpType;
}
