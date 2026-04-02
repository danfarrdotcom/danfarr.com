# Wizard Sprite Redesign — White Robe + 3-Frame Walk Cycle

## Summary

Replace the current procedural wizard drawing in `renderer.ts` with bitmap sprite arrays. The wizard gets a white robe, improved pixel art detail, and a proper 3-frame walking cycle.

## Approach

Bitmap sprite arrays defined as string arrays in `renderer.ts`. Each character in the string maps to a color via a palette object. A shared `drawSprite` helper renders any frame.

## Color Palette

| Key | Hex       | Use                  |
|-----|-----------|----------------------|
| `W` | `#e8e8f0` | White robe body      |
| `w` | `#c8c8d8` | Robe shadow/fold     |
| `H` | `#d0d0e8` | Hood highlight       |
| `h` | `#a0a0c0` | Hood shadow          |
| `S` | `#c2955a` | Staff wood           |
| `s` | `#8b6347` | Staff shadow         |
| `G` | `#aaddff` | Staff gem            |
| `E` | `#ffcc88` | Eye glow             |
| `B` | `#303030` | Boot/foot            |
| `.` | —         | Transparent (skip)   |

## Sprite Dimensions

- **Standing/jump:** 8 × 14 logical pixels
- **Duck:** 8 × 8 logical pixels
- Rendered at SCALE=3, so 24×42 canvas pixels standing

## Walk Cycle (3 frames, advance every 8 game frames)

- **Frame 0** — left foot forward, right foot back, staff upright, robe hem left-shifted
- **Frame 1** — feet together (mid-stride), staff neutral, robe hem center
- **Frame 2** — right foot forward, left foot back, staff forward-tilted, robe hem right-shifted

## Poses

- `WALK_FRAMES[3]` — array of 3 string-array bitmaps
- `JUMP_FRAME` — feet tucked, robe billowed, staff raised
- `DUCK_FRAME` — crouched 8×8, robe compressed, hood bent

## Implementation

Only `lib/sand-wizard/renderer.ts` changes:

1. Add palette constant `WIZARD_PALETTE`
2. Add `drawSprite(ctx, sx, sy, bitmap, palette)` helper — nested loop, `fillRect` per non-`.` cell at SCALE
3. Define `WALK_FRAMES`, `JUMP_FRAME`, `DUCK_FRAME` bitmaps as `string[][]`
4. Replace procedural drawing in `renderPlayer` with sprite selection + `drawSprite` call
   - walk: `WALK_FRAMES[Math.floor(frame / 8) % 3]`
   - jump: `JUMP_FRAME`
   - duck: `DUCK_FRAME`
