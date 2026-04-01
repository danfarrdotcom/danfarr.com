import { Player, GameState } from './types';
import { getCell } from './grid';
import { GRAVITY, JUMP_VY, LOGICAL_H, WALK_SPEED } from './constants';

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
  if (player.y >= groundY) {
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

  // Die if fallen off screen
  if (player.y > LOGICAL_H + 10) {
    player.state = 'dead';
  }
}

function findSurface(player: Player, state: GameState): number {
  const { grid, gridWidth, gridHeight } = state;
  const px = Math.round(player.x - state.cameraX);

  for (let y = Math.ceil(player.y); y < gridHeight; y++) {
    if (getCell(grid, px, y, gridWidth) !== 0) {
      return y - 1;
    }
  }
  return gridHeight + 10;
}
