import { GameState } from './types';
import { setCell } from './grid';
import { GROUND_Y, LOGICAL_H } from './constants';

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Jagged, spiked terrain with traps.
 * Base terrain is spiky/uneven. Traps layer on top.
 */
function terrainHeight(worldX: number, state: GameState): number {
  const base = GROUND_Y;
  const difficulty = Math.min(state.score / 2000, 1);
  const d = difficulty; // shorthand

  // Baseline: smooth at start, increasingly jagged with difficulty
  const j1 = Math.sin(worldX * 0.08) * 4 * d;
  const j2 = Math.sin(worldX * 0.17 + 1.3) * 3 * d;
  const j3 = Math.sin(worldX * 0.31 + 4.7) * 2 * d;
  const j4 = Math.sin(worldX * 0.53 + 2.1) * 1.5 * d;
  const saw1 = (((worldX * 0.04) % 1 + 1) % 1) * 8 * d - 4 * d;
  const saw2 = (((worldX * 0.11 + 0.5) % 1 + 1) % 1) * 6 * d - 3 * d;
  // Gentle rolling that's always present
  const gentle = Math.sin(worldX * 0.012) * 3 + Math.sin(worldX * 0.025 + 1.5) * 2;
  const jagged = gentle + j1 + j2 + j3 + j4 + saw1 + saw2;

  // --- TRAP: Deep chasm (only after some progress) ---
  let chasm = 0;
  if (d > 0.1) {
    const chasmSeed = Math.floor(worldX / 220);
    const chasmPos = chasmSeed * 220 + Math.floor(hash(chasmSeed * 7) * 80 + 40);
    const distToChasm = worldX - chasmPos;
    const chasmW = Math.floor(8 + d * 22);
    if (distToChasm >= 0 && distToChasm < chasmW) {
      chasm = 20 + d * 20;
    }
  }

  // --- TRAP: Spike wall (only after some progress) ---
  let wall = 0;
  if (d > 0.15) {
    const wallSeed = Math.floor((worldX + 110) / 300);
    const wallPos = wallSeed * 300 + Math.floor(hash(wallSeed * 13 + 5) * 100 + 50);
    const distToWall = worldX - wallPos;
    if (distToWall >= 0 && distToWall < 5) {
      wall = -(10 + Math.floor(d * 22));
    }
  }

  // --- TRAP: Jagged ridge (only mid-game+) ---
  let ridge = 0;
  if (d > 0.3) {
    const ridgeSeed = Math.floor((worldX + 170) / 350);
    const ridgePos = ridgeSeed * 350 + Math.floor(hash(ridgeSeed * 19 + 11) * 120 + 60);
    const distToRidge = worldX - ridgePos;
    if (distToRidge >= 0 && distToRidge < 30) {
      const peak = Math.abs(Math.sin(distToRidge * 0.8)) * (8 + d * 14);
      ridge = -peak;
    }
  }

  return Math.round(base - jagged + chasm + wall + ridge);
}

export function fillNewColumns(state: GameState, newCols: number): void {
  if (newCols <= 0) return;

  const width = state.gridWidth;
  const startX = width - newCols;

  for (let x = startX; x < width; x++) {
    const worldX = state.cameraX + x;
    const surfaceY = terrainHeight(worldX, state);
    const clampedSurface = Math.max(10, Math.min(LOGICAL_H - 2, surfaceY));

    // Solid rock from surface down
    for (let y = clampedSurface; y < LOGICAL_H; y++) {
      setCell(state.grid, x, y, 2, width);
    }

    // Thin sand layer on top — thinner on steep slopes for jagged look
    const prevSurface = terrainHeight(worldX - 1, state);
    const slope = Math.abs(clampedSurface - prevSurface);
    const sandDepth = slope < 2 ? 2 : slope < 4 ? 1 : 0;
    for (let d = 1; d <= sandDepth; d++) {
      if (clampedSurface - d >= 0) {
        setCell(state.grid, x, clampedSurface - d, 1, width);
      }
    }

    // Buried items
    const buried = Math.sin(worldX * 0.071 + 42.3);
    if (buried > 0.92) {
      for (let d = 5; d < 9; d++) {
        if (clampedSurface + d < LOGICAL_H) setCell(state.grid, x, clampedSurface + d, 2, width);
      }
    }
    if (buried < -0.94) {
      for (let d = 3; d < 5; d++) {
        if (clampedSurface + d < LOGICAL_H) setCell(state.grid, x, clampedSurface + d, 2, width);
      }
    }
  }
}
