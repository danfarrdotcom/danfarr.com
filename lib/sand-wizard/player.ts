import { Player, GameState } from './types';
import { getCell } from './grid';
import { GRAVITY, JUMP_VY, LOGICAL_H } from './constants';

export function updatePlayer(
  player: Player,
  state: GameState,
  keys: Set<string>,
): void {
  if (player.state === 'dead') return;

  // Gravity
  player.vy += GRAVITY;
  player.y += player.vy;

  // Surface detection
  const groundY = findSurface(player, state);
  if (groundY === null) {
    // No ground — player is in free fall off the world
    if (player.y > LOGICAL_H + 10) {
      player.state = 'dead';
    }
  } else if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    if (player.state === 'jump') player.state = 'walk';
  }

  // Jump
  if ((keys.has('Space') || keys.has('ArrowUp')) && player.state !== 'jump') {
    player.vy = JUMP_VY;
    player.state = 'jump';
  }

  // Duck
  if (keys.has('ArrowDown') && player.state !== 'jump') {
    player.state = 'duck';
  } else if (player.state === 'duck' && !keys.has('ArrowDown')) {
    player.state = 'walk';
  }
}

function findSurface(player: Player, state: GameState): number | null {
  const { grid, gridWidth, gridHeight } = state;
  const px = Math.round(player.x);  // screen-space, no cameraX offset

  for (let y = Math.ceil(player.y); y < gridHeight; y++) {
    if (getCell(grid, px, y, gridWidth) !== 0) {
      return y - 1;
    }
  }
  return null; // no ground found
}
