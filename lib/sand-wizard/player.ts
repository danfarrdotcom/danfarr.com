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

  // Surface detection
  const groundY = findSurface(player, state);
  if (groundY === null) {
    if (player.y > LOGICAL_H + 10) {
      player.state = 'dead';
    }
  } else if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    if (player.state !== 'walk') player.state = 'walk';
  }

  // Horizontal wall collision — chest height
  const frontX = Math.round(player.x) + 4;
  const chestY = Math.round(player.y) - 4;
  if (getCell(state.grid, frontX, chestY, state.gridWidth) !== 0) {
    player.state = 'dead';
  }
}

function findSurface(player: Player, state: GameState): number | null {
  const { grid, gridWidth, gridHeight } = state;
  const px = Math.round(player.x);
  for (let y = Math.ceil(player.y); y < gridHeight; y++) {
    if (getCell(grid, px, y, gridWidth) !== 0) {
      return y - 1;
    }
  }
  return null;
}
