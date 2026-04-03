import { GameState } from './types';
import { setCell } from './grid';
import { GROUND_Y, LOGICAL_H } from './constants';

/**
 * Simple hash for terrain height — deterministic from world-x position.
 * Produces varied ground: flat stretches, rocky jags, small mesas.
 */
function terrainHeight(worldX: number): number {
  // Layer multiple sine waves at different frequencies for organic feel
  const base = GROUND_Y;
  const h1 = Math.sin(worldX * 0.015) * 6;                    // broad rolling hills
  const h2 = Math.sin(worldX * 0.047 + 2.3) * 3;              // medium bumps
  const h3 = Math.sin(worldX * 0.13 + 5.1) * 1.5;             // small jags
  // Occasional sharp mesa/spire: use a stepped function
  const mesa = Math.abs(Math.sin(worldX * 0.0073 + 1.7));
  const spike = mesa > 0.92 ? (mesa - 0.92) * 120 : 0;        // rare tall spikes
  const ridge = mesa > 0.8 ? (mesa - 0.8) * 30 : 0;           // wider ridges

  return Math.round(base - h1 - h2 - h3 - spike - ridge);
}

/**
 * Fill newly exposed right-edge columns with varied terrain.
 * Called each frame after shiftGridLeft exposes new columns.
 */
export function fillNewColumns(state: GameState, newCols: number): void {
  if (newCols <= 0) return;

  const width = state.gridWidth;
  const startX = width - newCols;

  for (let x = startX; x < width; x++) {
    // World-space x for deterministic terrain
    const worldX = state.cameraX + x;
    const surfaceY = terrainHeight(worldX);

    // Solid rock from surface down
    for (let y = surfaceY; y < LOGICAL_H; y++) {
      setCell(state.grid, x, y, 2, width);
    }

    // Sand layer on top (1-3 pixels depending on slope)
    const prevSurface = terrainHeight(worldX - 1);
    const sandDepth = Math.abs(surfaceY - prevSurface) < 2 ? 2 : 1; // less sand on steep slopes
    for (let d = 1; d <= sandDepth; d++) {
      if (surfaceY - d >= 0) {
        setCell(state.grid, x, surfaceY - d, 1, width);
      }
    }

    // Scattered loose rocks above surface (small pixel jags)
    const jag = Math.sin(worldX * 0.31 + worldX * worldX * 0.0001);
    if (jag > 0.7 && surfaceY - 3 >= 0) {
      setCell(state.grid, x, surfaceY - 3, 2, width);
    }
    if (jag > 0.85 && surfaceY - 4 >= 0) {
      setCell(state.grid, x, surfaceY - 4, 2, width);
    }
  }
}
