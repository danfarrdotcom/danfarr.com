# Sand Wizard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove jump/duck, make sand the only mechanic, add cave gates + multi-size rocks, 4 power-up types, and deterministic seeded level progression.

**Architecture:** Minimal changes to existing lib/sand-wizard modules — strip player states, extend obstacle types, swap Math.random() for a seeded LCG, rebalance sand constants.

**Tech Stack:** Next.js 14, TypeScript, HTML5 Canvas, pixel-art cellular automaton

> **No test runner exists.** Verification = `pnpm build` (TypeScript) + visual check via `pnpm dev` at http://localhost:3000/games/sand-wizard.

---

### Task 1: Strip jump/duck — constants & types

**Files:**
- Modify: `lib/sand-wizard/constants.ts`
- Modify: `lib/sand-wizard/types.ts`

**Step 1: Update constants**

In `lib/sand-wizard/constants.ts`:
- Remove `JUMP_VY` export entirely
- Change `SAND_MAX` from `1000` to `10000`
- Add `SAND_REGEN_BASE = 30 / 60` (replaces `SAND_REGEN_PER_FRAME`)
- Keep `SAND_COST = 1`, `POWERUP_RESTORE` → change to `3000`

Result:
```ts
export const SAND_MAX = 10000;
export const SAND_REGEN_BASE = 30 / 60;
export const SAND_COST = 1;
export const POWERUP_RESTORE = 3000;
// remove: JUMP_VY, SAND_REGEN_PER_FRAME
```

**Step 2: Update Player type**

In `lib/sand-wizard/types.ts`, change Player state union:
```ts
export interface Player {
  x: number;
  y: number;
  vy: number;
  state: 'walk' | 'dead';  // removed: 'jump' | 'duck'
}
```

**Step 3: Update Obstacle type — add new types and PowerUp types**

```ts
export interface Obstacle {
  type: 'boulder' | 'falling-rock' | 'dust-devil' | 'cave-gate';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  gapY?: number;    // cave-gate only: y of the gap start (grid units from top of obstacle)
  gapH?: number;   // cave-gate only: gap height in grid units
}

export type PowerUpType = 'sand-boost' | 'shield' | 'sand-burst' | 'slow-scroll';

export interface PowerUp {
  x: number;
  y: number;
  collected: boolean;
  type: PowerUpType;
}
```

**Step 4: Verify TypeScript**

```bash
pnpm build 2>&1 | grep -E "error|Error" | head -30
```

Expected: errors listing usages of removed fields — that's fine, we fix those next.

**Step 5: Commit**

```bash
git add lib/sand-wizard/constants.ts lib/sand-wizard/types.ts
git commit -m "refactor: strip jump/duck from types, rebalance sand constants"
```

---

### Task 2: Add seeded RNG module

**Files:**
- Create: `lib/sand-wizard/rng.ts`

**Step 1: Write the LCG**

```ts
// lib/sand-wizard/rng.ts
let _seed = 42;

export function resetRng(): void {
  _seed = 42;
}

/** Returns a pseudo-random float in [0, 1) — same sequence each game */
export function rng(): number {
  _seed = (Math.imul(_seed, 1664525) + 1013904223) | 0;
  return (_seed >>> 0) / 0x100000000;
}
```

**Step 2: Export from index**

In `lib/sand-wizard/index.ts`, add:
```ts
export * from './rng';
```

**Step 3: Verify TypeScript**

```bash
pnpm build 2>&1 | grep -E "^.*error TS" | head -20
```

**Step 4: Commit**

```bash
git add lib/sand-wizard/rng.ts lib/sand-wizard/index.ts
git commit -m "feat: add seeded LCG rng module"
```

---

### Task 3: Update player logic — remove jump/duck

**Files:**
- Modify: `lib/sand-wizard/player.ts`

**Step 1: Rewrite player.ts**

Replace entire file with:

```ts
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
```

Note: `keys` parameter removed — player has no key-driven actions now.

**Step 2: Fix call site in SandWizardGame.tsx**

Find: `updatePlayer(player, state, keysRef.current);`
Change to: `updatePlayer(player, state);`

**Step 3: Verify TypeScript**

```bash
pnpm build 2>&1 | grep -E "^.*error TS" | head -20
```

**Step 4: Commit**

```bash
git add lib/sand-wizard/player.ts components/sand-wizard/SandWizardGame.tsx
git commit -m "refactor: remove jump/duck from player — sand-only mechanic"
```

---

### Task 4: Update sand regen — inverse scaling

**Files:**
- Modify: `lib/sand-wizard/input.ts`

**Step 1: Update regenSand**

Replace the `regenSand` function:

```ts
import { SAND_REGEN_BASE, SAND_MAX, SAND_COST } from './constants';

export function regenSand(state: GameState): void {
  const sandSpent = SAND_MAX - state.sandResource;
  const rate = SAND_REGEN_BASE / (1 + sandSpent / SAND_MAX);
  state.sandResource = Math.min(SAND_MAX, state.sandResource + rate);
}
```

Also remove the import of `SAND_REGEN_PER_FRAME` (no longer exists).

**Step 2: Verify TypeScript**

```bash
pnpm build 2>&1 | grep -E "^.*error TS" | head -20
```

**Step 3: Commit**

```bash
git add lib/sand-wizard/input.ts
git commit -m "feat: inverse-scaling sand regen — slower when more sand spent"
```

---

### Task 5: Update state — reset RNG on game start

**Files:**
- Modify: `lib/sand-wizard/state.ts`

**Step 1: Import and call resetRng**

Add to top: `import { resetRng } from './rng';`

At the start of `createInitialState()`, call `resetRng();`

Also update `createInitialPlayer` to only use `'walk'` state (already matches new type).

**Step 2: Add `shieldActive` and `slowScrollFrames` to GameState**

In `types.ts`, add to `GameState`:
```ts
shieldActive: boolean;
slowScrollFrames: number;
nextPowerUpX: number;
```

In `state.ts`, initialise them:
```ts
shieldActive: false,
slowScrollFrames: 0,
nextPowerUpX: 600,
```

**Step 3: Verify TypeScript**

```bash
pnpm build 2>&1 | grep -E "^.*error TS" | head -20
```

**Step 4: Commit**

```bash
git add lib/sand-wizard/state.ts lib/sand-wizard/types.ts
git commit -m "feat: reset seeded RNG on game start, add shield/slow-scroll state"
```

---

### Task 6: Rework obstacles — cave gates, multi-size rocks, seeded RNG

**Files:**
- Modify: `lib/sand-wizard/obstacles.ts`

**Step 1: Replace Math.random() with rng()**

Add import: `import { rng } from './rng';`
Replace every `Math.random()` call with `rng()`.

**Step 2: Add spawnCaveGate function**

```ts
/** Spawn a cave gate descending from the sky.
 *  Full-width bar with a gap. Gap position varies by difficulty. */
export function spawnCaveGate(state: GameState, gx: number, difficulty: number): void {
  const gateW = state.gridWidth;           // spans full screen width
  const gateH = 30 + Math.floor(rng() * 20 * difficulty); // thicker at higher diff
  const gapH = Math.max(14, Math.round(24 - difficulty * 10)); // narrows with difficulty
  const gapY = Math.floor(rng() * (gateH - gapH));            // random gap position

  state.obstacles.push({
    type: 'cave-gate',
    x: 0,               // always anchored left (full width)
    y: -gateH,          // starts above screen
    vx: 0,
    vy: 0.6 + difficulty * 0.4,  // faster at higher difficulty
    width: gateW,
    height: gateH,
    gapY,
    gapH,
  });
}
```

**Step 3: Update spawnFallingRock to support sizes**

```ts
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
```

**Step 4: Update updateObstacles — cave-gate movement + collision**

In the `state.obstacles.filter` loop, add the cave-gate case:

```ts
if (obs.type === 'cave-gate') {
  obs.y += obs.vy;
  // Collision: player is inside the gate's y range
  const px = Math.round(player.x);
  const py = Math.round(player.y);
  const playerTop = py - 8; // wizard is 14px tall, feet at py
  const obsBottom = obs.y + obs.height;

  if (playerTop < obsBottom && py > obs.y) {
    // Player overlaps gate vertically — check if inside gap
    const localTop = playerTop - obs.y;
    const localBot = py - obs.y;
    const inGap = localTop >= obs.gapY! && localBot <= obs.gapY! + obs.gapH!;
    if (!inGap) player.state = 'dead';
  }

  // Remove once scrolled past bottom
  if (obs.y > LOGICAL_H + 10) return false;
}
```

Also remove cave-gate from the AABB collision block at the bottom (it has its own check above) by adding:
```ts
if (obs.type === 'cave-gate') return true; // collision handled above
```
before the generic AABB block.

**Step 5: Rewrite the spawn block to use seeded RNG and separate power-up schedule**

Replace the `if (state.cameraX >= state.nextSpawnX)` block:

```ts
if (state.cameraX >= state.nextSpawnX) {
  const difficulty = Math.min(state.score / 2000, 1);
  const spawnGx = state.gridWidth - 10;
  const roll = rng();

  if (difficulty < 0.25) {
    // Phase 1: pits and small rocks only
    if (roll < 0.5) {
      carvePit(state, spawnGx - 20, 10 + Math.floor(rng() * 10));
    } else {
      spawnFallingRock(state, spawnGx - 20, difficulty);
    }
  } else if (difficulty < 0.5) {
    // Phase 2: add boulders, cave gates
    if (roll < 0.3) carvePit(state, spawnGx - 20, 12 + Math.floor(rng() * 12));
    else if (roll < 0.5) spawnFallingRock(state, spawnGx - 20, difficulty);
    else if (roll < 0.7) spawnBoulder(state, spawnGx);
    else spawnCaveGate(state, 0, difficulty);
  } else if (difficulty < 0.75) {
    // Phase 3: medium rocks, narrower gates, dust devils
    if (roll < 0.25) carvePit(state, spawnGx - 20, 15 + Math.floor(rng() * 15));
    else if (roll < 0.45) { spawnFallingRock(state, spawnGx - 20, difficulty); if (rng() < 0.5) spawnFallingRock(state, spawnGx - 50, difficulty); }
    else if (roll < 0.6) spawnBoulder(state, spawnGx);
    else if (roll < 0.75) spawnCaveGate(state, 0, difficulty);
    else spawnDustDevil(state, spawnGx - 30);
  } else {
    // Phase 4: large rocks, tight gates, fast boulders, volleys
    if (roll < 0.2) carvePit(state, spawnGx - 20, 20 + Math.floor(rng() * 20));
    else if (roll < 0.4) {
      spawnFallingRock(state, spawnGx - 10, difficulty);
      spawnFallingRock(state, spawnGx - 30, difficulty);
      if (rng() < 0.5) spawnFallingRock(state, spawnGx - 50, difficulty);
    }
    else if (roll < 0.55) { const b = spawnBoulderFast(state, spawnGx); }
    else if (roll < 0.75) spawnCaveGate(state, 0, difficulty);
    else spawnDustDevil(state, spawnGx - 30);
  }

  // Shrink spawn interval as difficulty grows
  const minInterval = 150;
  const maxInterval = 400;
  state.nextSpawnX += minInterval + Math.floor(rng() * (maxInterval - minInterval) * (1 - difficulty));
}

// Power-up schedule (independent of obstacle spawner)
if (state.cameraX >= state.nextPowerUpX) {
  spawnTypedPowerUp(state, state.gridWidth - 50, Math.min(state.score / 2000, 1));
  state.nextPowerUpX += 500 + Math.floor(rng() * 200);
}
```

**Step 6: Add spawnBoulderFast and spawnTypedPowerUp**

```ts
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
```

Also import `PowerUpType` from types.

**Step 7: Update power-up collection logic**

Replace the power-up collection block with typed handling:

```ts
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
      // Dump sand at wizard's feet in a 10-wide burst
      const gx = Math.round(player.x) - 5;
      const gy = Math.round(player.y);
      for (let dx = 0; dx < 10; dx++) {
        for (let dy = 0; dy < 6; dy++) {
          setCell(state.grid, gx + dx, gy - dy, 1, state.gridWidth);
        }
      }
    } else if (pu.type === 'slow-scroll') {
      state.slowScrollFrames = 300; // 5 seconds at 60fps
    }
  }
});
```

**Step 8: Handle shield absorbing a kill**

In the AABB collision block (and cave-gate collision), instead of `player.state = 'dead'`, do:

```ts
if (state.shieldActive) {
  state.shieldActive = false;
} else {
  player.state = 'dead';
}
```

**Step 9: Remove old `spawnPowerUp` and fix imports**

Delete old `spawnPowerUp` function. Fix any TS import errors.

**Step 10: Verify TypeScript**

```bash
pnpm build 2>&1 | grep -E "^.*error TS" | head -30
```

**Step 11: Commit**

```bash
git add lib/sand-wizard/obstacles.ts
git commit -m "feat: cave gates, multi-size rocks, 4 power-up types, seeded spawner"
```

---

### Task 7: Update game loop — slow scroll effect + shield tick

**Files:**
- Modify: `components/sand-wizard/SandWizardGame.tsx`

**Step 1: Remove jump/duck key bindings**

Remove the `keysRef` from the component entirely (no more keyboard game input).

Remove:
```ts
const keysRef = useRef<Set<string>>(new Set());
```
And remove: `window.addEventListener('keydown', onKeyDown)`, `window.removeEventListener`, `keysRef.current.clear()` in startGame.

Keep Space to start/restart (move that to `onKeyDown` but without adding to keysRef):
```ts
const onKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    if (stateRef.current.phase === 'title') startGame();
    if (stateRef.current.phase === 'dead') startGame();
  }
};
```

**Step 2: Apply slow scroll**

Replace:
```ts
scrollAccRef.current += WALK_SPEED;
```
With:
```ts
const state = stateRef.current;
const effectiveSpeed = state.slowScrollFrames > 0 ? WALK_SPEED * 0.5 : WALK_SPEED;
if (state.slowScrollFrames > 0) state.slowScrollFrames--;
scrollAccRef.current += effectiveSpeed;
```

**Step 3: Fix updatePlayer call site**

Change: `updatePlayer(player, state, keysRef.current);`
To: `updatePlayer(player, state);`

(May already be done in Task 3 — verify.)

**Step 4: Verify TypeScript and run dev**

```bash
pnpm build 2>&1 | grep -E "^.*error TS" | head -20
```

Then `pnpm dev` and visit http://localhost:3000/games/sand-wizard — confirm wizard walks, can't jump, sand depletes/regens.

**Step 5: Commit**

```bash
git add components/sand-wizard/SandWizardGame.tsx
git commit -m "feat: slow-scroll effect in game loop, remove keyboard movement bindings"
```

---

### Task 8: Update renderer — cave gates, typed power-ups, shield aura

**Files:**
- Modify: `lib/sand-wizard/renderer.ts`

**Step 1: Remove JUMP_FRAME and DUCK_FRAME, simplify renderPlayer**

Delete `JUMP_FRAME` and `DUCK_FRAME` constants entirely.

Simplify `renderPlayer`:
```ts
function renderPlayer(ctx: CanvasRenderingContext2D, player: Player, frame: number): void {
  if (player.state === 'dead') return;
  const sx = Math.round(player.x) * SCALE;
  const baseY = Math.round(player.y);
  const bitmap = WALK_FRAMES[Math.floor(frame / 8) % 3];
  const sy = (baseY - bitmap.length) * SCALE;
  drawSprite(ctx, sx, sy, bitmap, WIZARD_PALETTE);
}
```

**Step 2: Add shield aura rendering**

After `drawSprite` call in `renderPlayer`, add:
```ts
if (state.shieldActive) {
  ctx.strokeStyle = 'rgba(100,180,255,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(
    sx + 4 * SCALE,
    sy + 7 * SCALE,
    6 * SCALE,
    9 * SCALE,
    0, 0, Math.PI * 2
  );
  ctx.stroke();
}
```

Pass `state` into `renderPlayer` — update its signature and call site.

**Step 3: Render cave gates**

In the `state.obstacles.forEach` block, add:

```ts
if (obs.type === 'cave-gate') {
  const gapYAbs = obs.y + (obs.gapY ?? 0);
  const gapHPx = (obs.gapH ?? 14) * SCALE;
  const sx = 0;
  const totalH = obs.height * SCALE;
  const oy = obs.y * SCALE;

  // Top slab
  ctx.fillStyle = '#4a3728';
  ctx.fillRect(sx, oy, CANVAS_W, (obs.gapY ?? 0) * SCALE);
  // Bottom slab
  const bottomStart = gapYAbs * SCALE + gapHPx;
  ctx.fillRect(sx, bottomStart, CANVAS_W, totalH - ((obs.gapY ?? 0) * SCALE + gapHPx));

  // Gap outline (subtle so player can see the opening)
  ctx.strokeStyle = 'rgba(255,200,100,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx, gapYAbs * SCALE, CANVAS_W, gapHPx);

  // Ground shadow telegraph
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, GROUND_Y * SCALE, CANVAS_W, SCALE * 2);
}
```

**Step 4: Render typed power-ups with distinct colors**

Replace the power-up render block:

```ts
const PU_COLORS: Record<string, string> = {
  'sand-boost': '#f5c842',    // gold
  'shield':     '#42aaff',    // blue
  'sand-burst': '#ff8c00',    // orange
  'slow-scroll':'#44dd88',    // green
};

state.powerUps.forEach((pu) => {
  if (pu.collected) return;
  const sx = pu.x * SCALE;
  const sy = pu.y * SCALE;
  const color = PU_COLORS[pu.type] ?? '#00ffcc';
  // Pulsing glow
  const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3 + 0.4 * pulse;
  ctx.fillRect(sx - SCALE, sy - SCALE, 8 * SCALE, 8 * SCALE);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillRect(sx + SCALE, sy + SCALE, 4 * SCALE, 4 * SCALE);
});
```

**Step 5: Verify TypeScript + visual check**

```bash
pnpm build 2>&1 | grep -E "^.*error TS" | head -20
```

Visually confirm in browser:
- Cave gate descends, has visible gap
- Power-ups are color-coded glowing orbs
- Shield shows aura on wizard
- Wizard has no jump/duck animation

**Step 6: Commit**

```bash
git add lib/sand-wizard/renderer.ts
git commit -m "feat: render cave gates, typed power-ups, shield aura; remove jump/duck frames"
```

---

### Task 9: Final integration — HUD updates

**Files:**
- Modify: `components/sand-wizard/GameHUD.tsx`
- Modify: `components/sand-wizard/SandMeter.tsx` (if exists)

**Step 1: Read current HUD**

Read `components/sand-wizard/GameHUD.tsx` and `components/sand-wizard/SandMeter.tsx` to understand current HUD structure.

**Step 2: Update sand bar to reflect 10000 max**

The sand meter should use `sandResource / SAND_MAX * 100` for percentage. If it hardcodes `1000`, update to import `SAND_MAX` from constants.

**Step 3: Add shield and slow-scroll indicators**

Pass `shieldActive` and `slowScrollFrames` through the HUD props. Show:
- A small blue shield icon/text when shield is active
- A green "SLOW" indicator with remaining frames when slow-scroll is active

Update the HUD state in `SandWizardGame.tsx`:
```ts
const [hud, setHud] = useState({
  sand: SAND_MAX,
  score: 0,
  phase: 'title' as GameState['phase'],
  shieldActive: false,
  slowScrollFrames: 0,
});
```

And in the update block:
```ts
setHud({
  sand: state.sandResource,
  score: state.score,
  phase: state.phase,
  shieldActive: state.shieldActive,
  slowScrollFrames: state.slowScrollFrames,
});
```

**Step 4: Verify TypeScript + visual check**

```bash
pnpm build 2>&1 | grep -E "^.*error TS" | head -20
```

Full gameplay test:
- [ ] Wizard walks, can't jump or duck
- [ ] Sand fills pits, wizard walks over them
- [ ] Sand piles against walls, wizard climbs
- [ ] Falling rocks of different sizes appear and kill on contact
- [ ] Cave gate descends, contact with slab kills, passing through gap is safe
- [ ] Sand-boost power-up restores sand
- [ ] Shield absorbs one hit
- [ ] Sand burst dumps sand at feet
- [ ] Slow scroll halves speed temporarily
- [ ] Level is identical every run (same seed)
- [ ] Difficulty ramps: pits early, everything late

**Step 5: Final commit**

```bash
git add components/sand-wizard/GameHUD.tsx components/sand-wizard/SandMeter.tsx components/sand-wizard/SandWizardGame.tsx
git commit -m "feat: HUD shows shield/slow-scroll status, sand meter uses SAND_MAX=10000"
```
