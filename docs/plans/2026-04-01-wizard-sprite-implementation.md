# Wizard Sprite Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the procedural wizard drawing in `renderer.ts` with bitmap sprite arrays — white robe, proper pixel art, 3-frame walk cycle.

**Architecture:** Define sprite bitmaps as `string[]` arrays (each string = one row, each char = one palette entry). A `drawSprite` helper iterates rows/cols and calls `fillRect` per non-transparent cell. `renderPlayer` selects the correct frame by state and frame counter.

**Tech Stack:** TypeScript, HTML5 Canvas 2D API, no new dependencies.

---

### Task 1: Add palette and `drawSprite` helper

**Files:**

- Modify: `lib/sand-wizard/renderer.ts`

**Step 1: Add the palette constant** after the imports block (around line 8):

```typescript
const WIZARD_PALETTE: Record<string, string> = {
  W: '#e8e8f0', // white robe body
  w: '#c8c8d8', // robe shadow/fold
  H: '#d0d0e8', // hood highlight
  h: '#a0a0c0', // hood shadow
  S: '#c2955a', // staff wood
  s: '#8b6347', // staff shadow
  G: '#aaddff', // staff gem
  E: '#ffcc88', // eye glow
  B: '#303030', // boot/foot
};
```

**Step 2: Add the `drawSprite` helper** at the bottom of `renderer.ts`:

```typescript
function drawSprite(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  bitmap: string[],
  palette: Record<string, string>
): void {
  const S = SCALE;
  for (let row = 0; row < bitmap.length; row++) {
    const line = bitmap[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(sx + col * S, sy + row * S, S, S);
    }
  }
}
```

**Step 3: Verify TypeScript compiles** (no test needed for pure data/helper):

```bash
cd /Users/drfarr/code/danfarr.com/.claude/worktrees/nostalgic-neumann
npx tsc --noEmit
```

Expected: no errors

**Step 4: Commit**

```bash
git add lib/sand-wizard/renderer.ts
git commit -m "feat: add WIZARD_PALETTE and drawSprite helper"
```

---

### Task 2: Define walk-cycle bitmap frames

**Files:**

- Modify: `lib/sand-wizard/renderer.ts`

**Step 1: Add the 3 walk frames** after the palette constant. Each frame is 8 chars wide × 14 rows tall. `.` = transparent.

```typescript
// Walk cycle — 3 frames, advance every 8 game frames
// 8 cols × 14 rows. Column 0 is leftmost (staff side).
const WALK_FRAMES: string[][] = [
  // Frame 0 — left foot forward
  [
    '..hHHh..',
    '.hHHHHh.',
    '.hHEHHh.',
    '.hHHHHh.',
    'SsWWWWw.',
    'SsWWWWw.',
    '.sWwWWw.',
    '..WWWWw.',
    '.sWWwWw.',
    '..WWWWw.',
    '.sWwWww.',
    '..WwWww.',
    '.B...w..',
    'BB....B.',
  ],
  // Frame 1 — mid-stride (feet together)
  [
    '..hHHh..',
    '.hHHHHh.',
    '.hHEHHh.',
    '.hHHHHh.',
    'SsWWWWw.',
    'SsWWWWw.',
    '.sWwWWw.',
    '..WWWWw.',
    '.sWWwWw.',
    '..WWWWw.',
    '.sWwWww.',
    '..WWWww.',
    '.BB.ww..',
    '........',
  ],
  // Frame 2 — right foot forward
  [
    '..hHHh..',
    '.hHHHHh.',
    '.hHEHHh.',
    '.hHHHHh.',
    '.sWWWWwS',
    '.sWWWWwS',
    '.sWWwWws',
    '..WWWWw.',
    '.sWWwWw.',
    '..WWWWw.',
    '.sWwWww.',
    '..WwWww.',
    '..w...BB',
    '.B......',
  ],
];
```

**Step 2: Verify TypeScript compiles:**

```bash
npx tsc --noEmit
```

Expected: no errors

**Step 3: Commit**

```bash
git add lib/sand-wizard/renderer.ts
git commit -m "feat: add 3-frame walk cycle bitmaps"
```

---

### Task 3: Define jump and duck bitmaps

**Files:**

- Modify: `lib/sand-wizard/renderer.ts`

**Step 1: Add jump frame** (8×14, feet tucked, staff raised):

```typescript
const JUMP_FRAME: string[] = [
  '..hHHh..',
  '.hHHHHh.',
  '.hHEHHh.',
  '.hHHHHh.',
  'GsWWWWw.',
  'SsWWWWw.',
  'SsWwWWw.',
  '.sWWWWw.',
  '.BWWwBw.',
  '.BBWwBw.',
  '..WWww..',
  '..Wwww..',
  '........',
  '........',
];
```

**Step 2: Add duck frame** (8×8, crouched):

```typescript
const DUCK_FRAME: string[] = [
  '..hHhh..',
  '.hHHHHh.',
  '.hHEHhh.',
  'SsWWWWw.',
  'SsWwWWw.',
  '.BWWWwB.',
  '.BBWwBB.',
  '........',
];
```

**Step 3: Verify TypeScript compiles:**

```bash
npx tsc --noEmit
```

Expected: no errors

**Step 4: Commit**

```bash
git add lib/sand-wizard/renderer.ts
git commit -m "feat: add jump and duck sprite bitmaps"
```

---

### Task 4: Replace renderPlayer with sprite-based drawing

**Files:**

- Modify: `lib/sand-wizard/renderer.ts:104-144`

**Step 1: Replace the entire `renderPlayer` function** with:

```typescript
function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  frame: number
): void {
  if (player.state === 'dead') return;

  const S = SCALE;
  const sx = Math.round(player.x) * S;
  const baseY = Math.round(player.y);

  let bitmap: string[];
  let spriteH: number;

  if (player.state === 'duck') {
    bitmap = DUCK_FRAME;
    spriteH = DUCK_FRAME.length;
  } else if (player.state === 'jump') {
    bitmap = JUMP_FRAME;
    spriteH = JUMP_FRAME.length;
  } else {
    bitmap = WALK_FRAMES[Math.floor(frame / 8) % 3];
    spriteH = bitmap.length;
  }

  const sy = (baseY - spriteH) * S;
  drawSprite(ctx, sx, sy, bitmap, WIZARD_PALETTE);
}
```

**Step 2: Verify TypeScript compiles:**

```bash
npx tsc --noEmit
```

Expected: no errors

**Step 3: Run the dev server and visually verify:**

```bash
npm run dev
```

Open the game, check:

- [ ] Wizard appears with white robe
- [ ] Walk cycle animates through 3 frames
- [ ] Jump pose shows on space/up arrow
- [ ] Duck pose shows on down arrow
- [ ] Wizard disappears on title screen (already handled by `renderFrame` guard)

**Step 4: Commit**

```bash
git add lib/sand-wizard/renderer.ts
git commit -m "feat: pixel art wizard — white robe, 3-frame walk cycle, jump+duck poses"
```

---

## Sprite Tuning Notes

If the sprite looks off during visual review, the bitmaps in Tasks 2 & 3 are the place to edit. Each row is a string — add/remove/change characters to reshape the wizard. The palette in Task 1 controls all colors.

Common fixes:

- Feet too high/low → adjust the boot rows (`B`) in walk frames
- Staff position → move the `S`/`s` column left or right
- Hood too small → extend the `H`/`h` rows at the top
