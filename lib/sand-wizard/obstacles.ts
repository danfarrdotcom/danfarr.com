import { GameState, Obstacle, PowerUp, PowerUpType, Player } from './types';
import { setCell, getCell } from './grid';
import { GROUND_Y, LOGICAL_H, POWERUP_RESTORE, WALK_SPEED, SAND_MAX } from './constants';
import { rng } from './rng';

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

/** Spawn a fast boulder — speed scales with difficulty */
export function spawnBoulderFast(state: GameState, gx: number): void {
  const difficulty = Math.min(state.score / 2000, 1);
  state.obstacles.push({
    type: 'boulder',
    x: gx,
    y: GROUND_Y - 8,
    vx: -(1.5 + difficulty * 1.5),
    vy: 0,
    width: 8,
    height: 8,
  });
}

/** Spawn a falling rock at screen-space gx — size scales with difficulty */
export function spawnFallingRock(state: GameState, gx: number, difficulty: number): void {
  const sizes = [4, 8, 12];
  const maxSize = difficulty > 0.5 ? 3 : difficulty > 0.25 ? 2 : 1;
  const size = sizes[Math.floor(rng() * maxSize)];
  state.obstacles.push({
    type: 'falling-rock',
    x: gx,
    y: -size,
    vx: 0,
    vy: 0.7 + rng() * 0.4,
    width: size,
    height: size,
  });
}

/** Spawn a dust devil at screen-space gx */
export function spawnDustDevil(state: GameState, gx: number): void {
  state.obstacles.push({
    type: 'dust-devil',
    x: gx,
    y: GROUND_Y - 20,
    vx: (rng() > 0.5 ? 1 : -1) * 0.5,
    vy: 0,
    width: 10,
    height: 20,
  });
}

/** Spawn a cave gate descending from the sky — full-width bar with a gap */
export function spawnCaveGate(state: GameState, gx: number, difficulty: number): void {
  const gateW = state.gridWidth;
  const gateH = 30 + Math.floor(rng() * 20 * difficulty);
  const gapH = Math.max(14, Math.round(24 - difficulty * 10));
  const gapY = Math.floor(rng() * (gateH - gapH));

  state.obstacles.push({
    type: 'cave-gate',
    x: 0,
    y: -gateH,
    vx: 0,
    vy: 0.6 + difficulty * 0.4,
    width: gateW,
    height: gateH,
    gapY,
    gapH,
  });
}

/** Spawn a typed power-up at screen-space gx */
export function spawnTypedPowerUp(state: GameState, gx: number, difficulty: number): void {
  const roll = rng();
  let type: PowerUpType;
  if (roll < 0.45) type = 'sand-boost';
  else if (roll < 0.7) type = 'shield';
  else if (roll < 0.85) type = 'sand-burst';
  else type = 'slow-scroll';

  state.powerUps.push({
    x: gx,
    y: GROUND_Y - 12,
    collected: false,
    type,
  });
}

export function updateObstacles(state: GameState, player: Player): void {
  state.obstacles = state.obstacles.filter((obs) => {
    // Scroll left with terrain (not for cave-gate — it's screen-anchored)
    if (obs.type !== 'cave-gate') {
      obs.x -= WALK_SPEED;
      if (obs.x + obs.width < 0) return false;
    }

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
      const gx = Math.round(obs.x);
      const gy = Math.round(obs.y);
      for (let dy = 0; dy < obs.height; dy += 2) {
        for (let dx = -2; dx <= 2; dx++) {
          if (getCell(state.grid, gx + dx, gy + dy, state.gridWidth) === 1) {
            setCell(state.grid, gx + dx, gy + dy, 0, state.gridWidth);
            const nx = gx + dx + Math.round((rng() - 0.5) * 6);
            const ny = gy + dy - Math.round(rng() * 4);
            if (getCell(state.grid, nx, ny, state.gridWidth) === 0) {
              setCell(state.grid, nx, ny, 1, state.gridWidth);
            }
          }
        }
      }
    }

    if (obs.type === 'cave-gate') {
      obs.y += obs.vy;

      const px = Math.round(player.x);
      const py = Math.round(player.y);
      const playerTop = py - 14; // wizard sprite is 14px tall
      const obsBottom = obs.y + obs.height;

      if (playerTop < obsBottom && playerTop > obs.y) {
        const localTop = playerTop - obs.y;
        const localBot = py - obs.y;
        const inGap = localTop >= (obs.gapY ?? 0) && localBot <= (obs.gapY ?? 0) + (obs.gapH ?? 14);
        if (!inGap) {
          if (state.shieldActive) {
            state.shieldActive = false;
          } else {
            player.state = 'dead';
          }
        }
      }

      if (obs.y > LOGICAL_H + 10) return false;
      return true;
    }

    // Generic AABB collision for boulder, falling-rock, dust-devil
    const px = Math.round(player.x);
    const py = Math.round(player.y);
    const ox = Math.round(obs.x);
    const oy = Math.round(obs.y);
    const playerTop = py - 14;

    const collides =
      px < ox + obs.width &&
      px + 4 > ox &&
      playerTop < oy + obs.height &&
      py > oy;

    if (collides) {
      if (state.shieldActive) {
        state.shieldActive = false;
      } else {
        player.state = 'dead';
      }
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
      if (pu.type === 'sand-boost') {
        state.sandResource = Math.min(SAND_MAX, state.sandResource + POWERUP_RESTORE);
      } else if (pu.type === 'shield') {
        state.shieldActive = true;
      } else if (pu.type === 'sand-burst') {
        state.sandResource = Math.min(SAND_MAX, state.sandResource + 2000);
        const bx = Math.round(player.x) - 5;
        const by = Math.round(player.y);
        for (let dx = 0; dx < 10; dx++) {
          for (let dy = 0; dy < 6; dy++) {
            setCell(state.grid, bx + dx, by - dy, 1, state.gridWidth);
          }
        }
      } else if (pu.type === 'slow-scroll') {
        state.slowScrollFrames = 300;
      }
    }
  });

  // Remove collected or off-screen power-ups
  state.powerUps = state.powerUps.filter((pu) => !pu.collected && pu.x > -20);

  // Obstacle spawner — seeded RNG, difficulty-gated phases
  if (state.cameraX >= state.nextSpawnX) {
    const difficulty = Math.min(state.score / 2000, 1);
    const spawnGx = state.gridWidth - 10;
    const roll = rng();

    if (difficulty < 0.25) {
      if (roll < 0.5) {
        carvePit(state, spawnGx - 20, 10 + Math.floor(rng() * 10));
      } else {
        spawnFallingRock(state, spawnGx - 20, difficulty);
      }
    } else if (difficulty < 0.5) {
      if (roll < 0.3) carvePit(state, spawnGx - 20, 12 + Math.floor(rng() * 12));
      else if (roll < 0.5) spawnFallingRock(state, spawnGx - 20, difficulty);
      else if (roll < 0.7) spawnBoulder(state, spawnGx);
      else spawnCaveGate(state, 0, difficulty);
    } else if (difficulty < 0.75) {
      if (roll < 0.25) carvePit(state, spawnGx - 20, 15 + Math.floor(rng() * 15));
      else if (roll < 0.45) {
        spawnFallingRock(state, spawnGx - 20, difficulty);
        if (rng() < 0.5) spawnFallingRock(state, spawnGx - 50, difficulty);
      }
      else if (roll < 0.6) spawnBoulder(state, spawnGx);
      else if (roll < 0.75) spawnCaveGate(state, 0, difficulty);
      else spawnDustDevil(state, spawnGx - 30);
    } else {
      if (roll < 0.2) carvePit(state, spawnGx - 20, 20 + Math.floor(rng() * 20));
      else if (roll < 0.4) {
        spawnFallingRock(state, spawnGx - 10, difficulty);
        spawnFallingRock(state, spawnGx - 30, difficulty);
        if (rng() < 0.5) spawnFallingRock(state, spawnGx - 50, difficulty);
      }
      else if (roll < 0.55) spawnBoulderFast(state, spawnGx);
      else if (roll < 0.75) spawnCaveGate(state, 0, difficulty);
      else spawnDustDevil(state, spawnGx - 30);
    }

    const minInterval = 150;
    const maxInterval = 400;
    state.nextSpawnX = state.cameraX + minInterval + Math.floor(rng() * (maxInterval - minInterval) * (1 - difficulty));
  }

  // Power-up schedule — independent of obstacle spawner
  if (state.cameraX >= state.nextPowerUpX) {
    spawnTypedPowerUp(state, state.gridWidth - 50, Math.min(state.score / 2000, 1));
    state.nextPowerUpX += 500 + Math.floor(rng() * 200);
  }
}
