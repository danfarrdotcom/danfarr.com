import { GameState } from './types';
import { setCell } from './grid';
import { GROUND_Y, LOGICAL_H } from './constants';

// Deterministic hash
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Terrain height — mostly flat with deliberate traps.
 * The traps are what make the game interesting:
 * - Deep chasms (vertical drops the player falls into)
 * - Tall rock walls (player walks into and gets stuck behind)
 * - Stepped cliffs (series of ledges going up)
 */
function terrainHeight(worldX: number, state: GameState): number {
  const base = GROUND_Y;
  const difficulty = Math.min(state.score / 2000, 1);

  // Gentle rolling baseline
  const roll = Math.sin(worldX * 0.012) * 3 + Math.sin(worldX * 0.037 + 1.5) * 2;

  // --- TRAP: Deep chasm (every ~200-400 units) ---
  // A sudden drop to near screen-bottom. Player must place sand to bridge.
  const chasmSeed = Math.floor(worldX / 250);
  const chasmPos = chasmSeed * 250 + Math.floor(hash(chasmSeed * 7) * 100 + 50);
  const distToChasm = worldX - chasmPos;
  let chasm = 0;
  const chasmW = 15 + Math.floor(difficulty * 15);
  if (distToChasm >= 0 && distToChasm < chasmW) {
    chasm = 35; // deep drop
  }

  // --- TRAP: Rock wall (every ~300-500 units, offset from chasms) ---
  // A tall vertical wall. Player must place sand ramp to get over.
  const wallSeed = Math.floor((worldX + 130) / 350);
  const wallPos = wallSeed * 350 + Math.floor(hash(wallSeed * 13 + 5) * 120 + 60);
  const distToWall = worldX - wallPos;
  let wall = 0;
  if (distToWall >= 0 && distToWall < 6) {
    wall = -(15 + Math.floor(difficulty * 15)); // negative = higher ground
  }

  // --- TRAP: Stepped cliff (every ~400 units) ---
  // Ground rises sharply then stays high for a stretch.
  const cliffSeed = Math.floor((worldX + 200) / 400);
  const cliffPos = cliffSeed * 400 + Math.floor(hash(cliffSeed * 19 + 11) * 150 + 80);
  const distToCliff = worldX - cliffPos;
  let cliff = 0;
  if (distToCliff >= 0 && distToCliff < 3) {
    cliff = -(10 + Math.floor(difficulty * 10)); // sharp rise
  } else if (distToCliff >= 3 && distToCliff < 25) {
    cliff = -(10 + Math.floor(difficulty * 10)); // plateau
  } else if (distToCliff >= 25 && distToCliff < 30) {
    // Gradual descent back down
    cliff = -(10 + Math.floor(difficulty * 10)) * (1 - (distToCliff - 25) / 5);
  }

  return Math.round(base - roll + chasm + wall + cliff);
}

/**
 * Fill newly exposed right-edge columns with terrain.
 */
export function fillNewColumns(state: GameState, newCols: number): void {
  if (newCols <= 0) return;

  const width = state.gridWidth;
  const startX = width - newCols;

  for (let x = startX; x < width; x++) {
    const worldX = state.cameraX + x;
    const surfaceY = terrainHeight(worldX, state);

    // Clamp: don't let terrain go above screen or below bottom
    const clampedSurface = Math.max(10, Math.min(LOGICAL_H - 2, surfaceY));

    // Solid rock from surface down
    for (let y = clampedSurface; y < LOGICAL_H; y++) {
      setCell(state.grid, x, y, 2, width);
    }

    // Sand layer on top (2-3 pixels)
    const prevSurface = terrainHeight(worldX - 1, state);
    const sandDepth = Math.abs(clampedSurface - prevSurface) < 3 ? 3 : 1;
    for (let d = 1; d <= sandDepth; d++) {
      if (clampedSurface - d >= 0) {
        setCell(state.grid, x, clampedSurface - d, 1, width);
      }
    }

    // Buried skeletons and treasure
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
