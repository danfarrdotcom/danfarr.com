import { GameState, Obstacle, PowerUp, PowerUpType, Player } from './types';
import { setCell, getCell } from './grid';
import { GROUND_Y, LOGICAL_H, POWERUP_RESTORE, WALK_SPEED, SAND_MAX } from './constants';
import { rng } from './rng';

/** Carve a pit */
export function carvePit(state: GameState, gx: number, width: number): void {
  for (let x = gx; x < gx + width && x < state.gridWidth; x++) {
    for (let y = GROUND_Y - 4; y < LOGICAL_H; y++) {
      setCell(state.grid, x, y, 0, state.gridWidth);
    }
  }
}

/** Build a solid rock wall */
export function buildWall(state: GameState, gx: number, height: number): void {
  for (let x = gx; x < gx + 4 && x < state.gridWidth; x++) {
    for (let y = GROUND_Y - height; y < GROUND_Y; y++) {
      setCell(state.grid, x, y, 2, state.gridWidth);
    }
  }
}

export function spawnBoulder(state: GameState, gx: number): void {
  state.obstacles.push({
    type: 'boulder', x: gx, y: GROUND_Y - 8,
    vx: -1.5, vy: 0, width: 8, height: 8,
  });
}

export function spawnBoulderFast(state: GameState, gx: number): void {
  const difficulty = Math.min(state.score / 2000, 1);
  state.obstacles.push({
    type: 'boulder', x: gx, y: GROUND_Y - 8,
    vx: -(1.5 + difficulty * 1.5), vy: 0, width: 8, height: 8,
  });
}

export function spawnFallingRock(state: GameState, gx: number, difficulty: number): void {
  const sizes = [4, 8, 12];
  const maxSize = difficulty > 0.5 ? 3 : difficulty > 0.25 ? 2 : 1;
  const size = sizes[Math.floor(rng() * maxSize)];
  state.obstacles.push({
    type: 'falling-rock', x: gx, y: -size,
    vx: 0, vy: 0.7 + rng() * 0.4, width: size, height: size,
  });
}

export function spawnDustDevil(state: GameState, gx: number): void {
  state.obstacles.push({
    type: 'dust-devil', x: gx, y: GROUND_Y - 20,
    vx: (rng() > 0.5 ? 1 : -1) * 0.5, vy: 0, width: 10, height: 20,
  });
}

export function spawnCaveGate(state: GameState, _gx: number, difficulty: number): void {
  const gateW = state.gridWidth;
  const gateH = 30 + Math.floor(rng() * 20 * difficulty);
  const gapH = Math.max(14, Math.round(24 - difficulty * 10));
  const gapY = Math.floor(rng() * (gateH - gapH));
  state.obstacles.push({
    type: 'cave-gate', x: 0, y: -gateH,
    vx: 0, vy: 0.6 + difficulty * 0.4, width: gateW, height: gateH,
    gapY, gapH,
  });
}

/** Spawn a vulture — glides in from the right, swoops down at the player, climbs back up */
export function spawnVulture(state: GameState, gx: number): void {
  const altitude = 20 + Math.floor(rng() * 30);
  state.obstacles.push({
    type: 'vulture', x: gx, y: altitude,
    vx: -1.8, vy: 0, width: 12, height: 8,
    swoopPhase: 'glide', startY: altitude,
    targetX: 80 + Math.floor(rng() * 100), // x where it starts diving
    frame: 0,
  });
}

/** Spawn a rock arch — a terrain obstacle: tall rock pillars with a gap the wizard must pass through */
export function spawnRockArch(state: GameState, gx: number): void {
  const archW = 6;
  const archH = 30 + Math.floor(rng() * 15);
  const gapH = 16 + Math.floor(rng() * 6);
  const gapBottom = GROUND_Y;
  // Build left pillar
  for (let x = gx; x < gx + archW && x < state.gridWidth; x++) {
    // Top section (above gap)
    for (let y = gapBottom - archH; y < gapBottom - gapH; y++) {
      if (y >= 0) setCell(state.grid, x, y, 2, state.gridWidth);
    }
    // Lintel across top
    if (x >= gx + 1 && x < gx + archW - 1) {
      const lintelY = gapBottom - gapH;
      if (lintelY >= 0) setCell(state.grid, x, lintelY, 2, state.gridWidth);
    }
  }
  // Also stamp some jagged rock bits around the arch edges
  for (let d = 0; d < 3; d++) {
    const jx = gx + Math.floor(rng() * archW);
    const jy = gapBottom - gapH - 1 - d;
    if (jy >= 0 && jx < state.gridWidth) setCell(state.grid, jx, jy, 2, state.gridWidth);
  }
}

export function spawnTypedPowerUp(state: GameState, gx: number, difficulty: number): void {
  const roll = rng();
  let type: PowerUpType;
  if (roll < 0.45) type = 'sand-boost';
  else if (roll < 0.7) type = 'shield';
  else if (roll < 0.85) type = 'sand-burst';
  else type = 'slow-scroll';
  state.powerUps.push({ x: gx, y: GROUND_Y - 12, collected: false, type });
}

export function updateObstacles(state: GameState, player: Player): void {
  state.obstacles = state.obstacles.filter((obs) => {
    // Scroll left with terrain (not for cave-gate)
    if (obs.type !== 'cave-gate') {
      obs.x -= WALK_SPEED;
      if (obs.x + obs.width < -20) return false;
    }

    if (obs.type === 'boulder') {
      obs.x += obs.vx;
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

    if (obs.type === 'vulture') {
      obs.frame = (obs.frame ?? 0) + 1;
      const phase = obs.swoopPhase ?? 'glide';

      if (phase === 'glide') {
        // Glide toward targetX, slight sine bob
        obs.y = (obs.startY ?? 30) + Math.sin(obs.frame * 0.08) * 3;
        if (obs.x <= (obs.targetX ?? 80)) {
          obs.swoopPhase = 'dive';
        }
      } else if (phase === 'dive') {
        // Dive toward player's y
        obs.vy += 0.3;
        obs.y += obs.vy;
        if (obs.y >= GROUND_Y - 14) {
          obs.swoopPhase = 'climb';
          obs.vy = -2.5;
        }
      } else if (phase === 'climb') {
        obs.vy += 0.05; // slow deceleration upward
        obs.y += obs.vy;
        if (obs.y < -20) return false;
      }
    }

    if (obs.type === 'cave-gate') {
      obs.y += obs.vy;
      const px = Math.round(player.x);
      const py = Math.round(player.y);
      const playerTop = py - 14;
      const obsBottom = obs.y + obs.height;
      if (playerTop < obsBottom && playerTop > obs.y) {
        const localTop = playerTop - obs.y;
        const localBot = py - obs.y;
        const inGap = localTop >= (obs.gapY ?? 0) && localBot <= (obs.gapY ?? 0) + (obs.gapH ?? 14);
        if (!inGap) {
          if (state.shieldActive) state.shieldActive = false;
          else player.state = 'dead';
        }
      }
      if (obs.y > LOGICAL_H + 10) return false;
      return true;
    }

    // rock-arch is static terrain, just scroll off
    if (obs.type === 'rock-arch') {
      if (obs.x + obs.width < -10) return false;
      return true;
    }

    // Generic AABB collision for boulder, falling-rock, dust-devil, vulture
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
      if (state.shieldActive) state.shieldActive = false;
      else player.state = 'dead';
    }

    return true;
  });

  // Scroll power-ups
  state.powerUps.forEach((pu) => { pu.x -= WALK_SPEED; });

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

  state.powerUps = state.powerUps.filter((pu) => !pu.collected && pu.x > -20);

  // --- Obstacle spawner ---
  if (state.cameraX >= state.nextSpawnX) {
    const difficulty = Math.min(state.score / 2000, 1);
    const spawnGx = state.gridWidth - 10;
    const roll = rng();

    if (difficulty < 0.25) {
      // Early: pits, small falling rocks, occasional vulture
      if (roll < 0.4) carvePit(state, spawnGx - 20, 10 + Math.floor(rng() * 10));
      else if (roll < 0.75) spawnFallingRock(state, spawnGx - 20, difficulty);
      else spawnVulture(state, spawnGx);
    } else if (difficulty < 0.5) {
      if (roll < 0.2) carvePit(state, spawnGx - 20, 12 + Math.floor(rng() * 12));
      else if (roll < 0.35) spawnFallingRock(state, spawnGx - 20, difficulty);
      else if (roll < 0.5) spawnBoulder(state, spawnGx);
      else if (roll < 0.65) spawnVulture(state, spawnGx);
      else if (roll < 0.8) spawnRockArch(state, spawnGx - 15);
      else spawnCaveGate(state, 0, difficulty);
    } else if (difficulty < 0.75) {
      if (roll < 0.15) carvePit(state, spawnGx - 20, 15 + Math.floor(rng() * 15));
      else if (roll < 0.3) {
        spawnFallingRock(state, spawnGx - 20, difficulty);
        if (rng() < 0.5) spawnFallingRock(state, spawnGx - 50, difficulty);
      }
      else if (roll < 0.42) spawnBoulder(state, spawnGx);
      else if (roll < 0.55) spawnVulture(state, spawnGx);
      else if (roll < 0.65) spawnRockArch(state, spawnGx - 15);
      else if (roll < 0.8) spawnCaveGate(state, 0, difficulty);
      else spawnDustDevil(state, spawnGx - 30);
    } else {
      // Max difficulty: everything, combos
      if (roll < 0.12) carvePit(state, spawnGx - 20, 20 + Math.floor(rng() * 20));
      else if (roll < 0.28) {
        spawnFallingRock(state, spawnGx - 10, difficulty);
        spawnFallingRock(state, spawnGx - 30, difficulty);
        if (rng() < 0.5) spawnFallingRock(state, spawnGx - 50, difficulty);
      }
      else if (roll < 0.38) spawnBoulderFast(state, spawnGx);
      else if (roll < 0.5) {
        spawnVulture(state, spawnGx);
        if (rng() < 0.3) spawnVulture(state, spawnGx + 30); // pair of vultures
      }
      else if (roll < 0.6) spawnRockArch(state, spawnGx - 15);
      else if (roll < 0.78) spawnCaveGate(state, 0, difficulty);
      else spawnDustDevil(state, spawnGx - 30);
    }

    const minInterval = 150;
    const maxInterval = 400;
    state.nextSpawnX = state.cameraX + minInterval + Math.floor(rng() * (maxInterval - minInterval) * (1 - difficulty));
  }

  // Power-up schedule
  if (state.cameraX >= state.nextPowerUpX) {
    spawnTypedPowerUp(state, state.gridWidth - 50, Math.min(state.score / 2000, 1));
    state.nextPowerUpX += 500 + Math.floor(rng() * 200);
  }
}
