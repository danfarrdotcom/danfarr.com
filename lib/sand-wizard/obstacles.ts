import { GameState, Obstacle, PowerUp, Player } from './types';
import { setCell, getCell } from './grid';
import { GROUND_Y, LOGICAL_H, POWERUP_RESTORE, WALK_SPEED } from './constants';

/** Carve a pit — clear cells from GROUND_Y-1 down across `width` columns starting at screen gx */
export function carvePit(state: GameState, gx: number, width: number): void {
  for (let x = gx; x < gx + width && x < state.gridWidth; x++) {
    setCell(state.grid, x, GROUND_Y - 1, 0, state.gridWidth);
    for (let y = GROUND_Y; y < LOGICAL_H; y++) {
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
      // Displace sand in boulder's full occupied rectangle
      const gx = Math.round(obs.x);
      for (let dy = 0; dy < obs.height; dy++) {
        for (let dx = 0; dx < obs.width; dx++) {
          if (getCell(state.grid, gx + dx, Math.round(obs.y) + dy, state.gridWidth) === 1) {
            setCell(state.grid, gx + dx, Math.round(obs.y) + dy, 0, state.gridWidth);
          }
        }
      }
    }

    if (obs.type === 'falling-rock') {
      obs.y += obs.vy;
      // Check ground contact across full width
      const gx = Math.round(obs.x);
      const bottomY = Math.round(obs.y + obs.height);
      let hitGround = false;
      for (let dx = 0; dx < obs.width; dx++) {
        if (getCell(state.grid, gx + dx, bottomY, state.gridWidth) !== 0) {
          hitGround = true;
          break;
        }
      }
      if (hitGround) {
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

  // Scroll power-ups leftward with the grid
  state.powerUps.forEach((pu) => {
    pu.x -= WALK_SPEED;
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
  state.powerUps = state.powerUps.filter((pu) => !pu.collected && pu.x > -20);

  // Spawn next obstacle when the world has scrolled far enough
  if (state.cameraX >= state.nextSpawnX) {
    const roll = Math.random();
    const difficulty = Math.min(state.score / 500, 1);
    const spawnGx = state.gridWidth - 10; // spawn near right edge

    if (roll < 0.25) {
      carvePit(state, spawnGx - 20, 15 + Math.floor(Math.random() * 15));
    } else if (roll < 0.45 && difficulty > 0.1) {
      buildWall(state, spawnGx - 5, 10 + Math.floor(Math.random() * 15 * difficulty));
      if (Math.random() < 0.4) spawnPowerUp(state, spawnGx - 60);
    } else if (roll < 0.6 && difficulty > 0.2) {
      spawnBoulder(state, spawnGx);
    } else if (roll < 0.73 && difficulty > 0.4) {
      spawnFallingRock(state, spawnGx - 20);
      if (Math.random() < 0.5) spawnFallingRock(state, spawnGx - 50);
    } else if (roll < 0.85 && difficulty > 0.5) {
      spawnDustDevil(state, spawnGx - 30);
    } else {
      // Flat + occasional power-up
      if (Math.random() < 0.3) spawnPowerUp(state, spawnGx - 40);
    }

    // Advance spawn frontier by 200–400 world units
    state.nextSpawnX += 200 + Math.floor(Math.random() * 200);
  }
}
