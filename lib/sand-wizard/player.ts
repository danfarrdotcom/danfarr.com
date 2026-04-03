import { Player, GameState } from './types';
import { getCell } from './grid';
import { GRAVITY, LOGICAL_H } from './constants';

export function updatePlayer(
  player: Player,
  state: GameState,
): void {
  if (player.state === 'dead') return;

  // Gravity
  player.vy += GRAVITY;
  player.y += player.vy;

  // Surface detection — find ground below player
  const groundY = findGround(player, state);
  if (groundY === null) {
    if (player.y > LOGICAL_H + 10) {
      player.state = 'dead';
    }
  } else if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
  }

  // Wall collision — check if terrain is blocking the player's body
  // The player occupies roughly px to px+4 horizontally, and py-14 to py vertically
  // Check a column just ahead of the player for solid terrain at body height
  const px = Math.round(player.x);
  const py = Math.round(player.y);
  const { grid, gridWidth } = state;

  // Check if there's a wall at the player's position (terrain scrolled into them)
  // Scan the player's body column for solid cells
  let blocked = false;
  let wallTop = py;
  for (let checkY = py; checkY >= py - 14; checkY--) {
    if (checkY < 0) break;
    if (getCell(grid, px + 2, checkY, gridWidth) !== 0) {
      blocked = true;
      wallTop = checkY;
    } else if (blocked) {
      break; // found top of wall
    }
  }

  if (blocked) {
    const wallHeight = py - wallTop;
    if (wallHeight <= 5) {
      // Small bump — ride over it
      player.y = wallTop - 1;
      player.vy = -0.5;
    } else {
      // Tall wall — push player left
      player.x -= 2.0;
    }
  }

  // Die if pushed off the left edge of the screen
  if (player.x < -5) {
    player.state = 'dead';
  }
}

function findGround(player: Player, state: GameState): number | null {
  const { grid, gridWidth, gridHeight } = state;
  const px = Math.round(player.x);
  const py = Math.ceil(player.y);

  // If inside solid, push up
  if (px >= 0 && px < gridWidth && py >= 0 && py < gridHeight && getCell(grid, px, py, gridWidth) !== 0) {
    let top = py;
    while (top > 0 && getCell(grid, px, top - 1, gridWidth) !== 0) {
      top--;
    }
    return top - 1;
  }

  // Scan down for ground
  for (let y = Math.max(0, py); y < gridHeight; y++) {
    if (getCell(grid, px, y, gridWidth) !== 0) {
      return y - 1;
    }
  }
  return null;
}
