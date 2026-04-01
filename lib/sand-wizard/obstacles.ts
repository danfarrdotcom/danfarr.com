import { GameState, Obstacle, PowerUp, Player } from './types';
import { setCell, getCell } from './grid';
import { GROUND_Y, LOGICAL_H, POWERUP_RESTORE } from './constants';

/** Carve a pit — clear cells from GROUND_Y-2 down across `width` columns starting at screen gx */
export function carvePit(state: GameState, gx: number, width: number): void {
  for (let x = gx; x < gx + width && x < state.gridWidth; x++) {
    for (let y = GROUND_Y - 2; y < LOGICAL_H; y++) {
      setCell(state.grid, x, y, 0, state.gridWidth);
    }
  }
}

/** Build a solid rock wall of `height` rows tall starting at screen gx (4px wide) */
export function buildWall(state: GameState, gx: number, height: number): void {
  for (let x = gx; x < gx + 4 && x < state.gridWidth; x++) {
    for (let y = GROUND_Y - height; y < GROUND_Y; y++) {
      setCell(state.grid, x, y, 2, state.gridWidth);
    }
  }
}

/** Spawn a boulder at screen-space gx, on the ground, rolling left */
export function spawnBoulder(state: GameState, gx: number): void {
  state.obstacles.push({
    type: 'boulder',
    x: gx,
    y: GROUND_Y - 8,
    vx: -1.5,
    vy: 0,
    width: 8,
    height: 8,
  });
}

/** Spawn a falling rock at screen-space gx, falling from y=10 */
export function spawnFallingRock(state: GameState, gx: number): void {
  state.obstacles.push({
    type: 'falling-rock',
    x: gx,
    y: 10,
    vx: 0,
    vy: 0.8,
    width: 6,
    height: 6,
  });
}

/** Spawn a dust devil at screen-space gx */
export function spawnDustDevil(state: GameState, gx: number): void {
  state.obstacles.push({
    type: 'dust-devil',
    x: gx,
    y: GROUND_Y - 20,
    vx: (Math.random() > 0.5 ? 1 : -1) * 0.5,
    vy: 0,
    width: 10,
    height: 20,
  });
}

/** Spawn a power-up at screen-space gx */
export function spawnPowerUp(state: GameState, gx: number): void {
  state.powerUps.push({
    x: gx,
    y: GROUND_Y - 12,
    collected: false,
  });
}

export function updateObstacles(state: GameState, player: Player): void {
  state.obstacles = state.obstacles.filter((obs) => {
    // Remove off left edge
    if (obs.x + obs.width < 0) return false;

    if (obs.type === 'boulder') {
      obs.x += obs.vx;
      // Displace sand pixels in boulder's path
      const gx = Math.round(obs.x);
      const gy = Math.round(obs.y);
      for (let dx = 0; dx < obs.width; dx++) {
        if (getCell(state.grid, gx + dx, gy, state.gridWidth) === 1) {
          setCell(state.grid, gx + dx, gy, 0, state.gridWidth);
        }
      }
    }

    if (obs.type === 'falling-rock') {
      obs.y += obs.vy;
      const gx = Math.round(obs.x);
      const gy = Math.round(obs.y + obs.height);
      if (getCell(state.grid, gx, gy, state.gridWidth) !== 0) {
        // Settle: bake into grid as solid rock
        for (let dx = 0; dx < obs.width; dx++) {
          for (let dy = 0; dy < obs.height; dy++) {
            setCell(state.grid, gx + dx, Math.round(obs.y) + dy, 2, state.gridWidth);
          }
        }
        return false;
      }
    }

    if (obs.type === 'dust-devil') {
      obs.x += obs.vx;
      if (obs.x < 5 || obs.x > state.gridWidth - 15) obs.vx *= -1;
      // Scatter nearby sand
      const gx = Math.round(obs.x);
      const gy = Math.round(obs.y);
      for (let dy = 0; dy < obs.height; dy += 2) {
        for (let dx = -2; dx <= 2; dx++) {
          if (getCell(state.grid, gx + dx, gy + dy, state.gridWidth) === 1) {
            setCell(state.grid, gx + dx, gy + dy, 0, state.gridWidth);
            const nx = gx + dx + Math.round((Math.random() - 0.5) * 6);
            const ny = gy + dy - Math.round(Math.random() * 4);
            if (getCell(state.grid, nx, ny, state.gridWidth) === 0) {
              setCell(state.grid, nx, ny, 1, state.gridWidth);
            }
          }
        }
      }
    }

    // Collision with player (screen-space AABB)
    const px = Math.round(player.x);
    const py = Math.round(player.y);
    const ox = Math.round(obs.x);
    const oy = Math.round(obs.y);
    const playerH = player.state === 'duck' ? 4 : 8;

    const collides =
      px < ox + obs.width &&
      px + 4 > ox &&
      py < oy + obs.height &&
      py + playerH > oy;

    if (collides) {
      player.state = 'dead';
    }

    return true;
  });

  // Power-up collection
  state.powerUps.forEach((pu) => {
    if (pu.collected) return;
    const px = Math.round(player.x);
    const py = Math.round(player.y);
    if (Math.abs(px - pu.x) < 8 && Math.abs(py - pu.y) < 12) {
      pu.collected = true;
      state.sandResource = Math.min(1000, state.sandResource + POWERUP_RESTORE);
    }
  });

  // Remove collected or off-screen power-ups
  state.powerUps = state.powerUps.filter((pu) => !pu.collected && pu.x > -10);
}
