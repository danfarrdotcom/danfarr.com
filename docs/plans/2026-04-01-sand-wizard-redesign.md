# Sand Wizard Redesign

**Date:** 2026-04-01
**Status:** Approved

## Overview

Redesign the Sand Wizard game to make sand-dropping the wizard's only mechanic. Remove jump and duck. Add deterministic level progression via seeded RNG, varied sky obstacles including cave gates, and four power-up types.

## Section 1: Player & Controls

- Remove `jump` state and all jump logic (`JUMP_VY` constant gone, Space/Up key binding removed)
- Remove `duck` state and duck collision shape (ArrowDown key binding removed)
- Wizard has two states only: `walk` and `dead`
- Wall collision always kills
- Pit detection: no ground below → wizard dies (unless sand has filled the pit)
- Player sprite: only walk and dead frames needed

## Section 2: Sand Mechanics

- `SAND_MAX` = 10000 (up from 1000)
- Regen rate scales inversely with sand spent: the more sand used, the slower regeneration
- Sand placement: mouse left-click places, right-click removes (unchanged)
- Pits: sand falls in and fills naturally via cellular automaton — wizard walks over safely when filled
- Walls: sand stacks against wall face letting wizard walk over
- No other interaction changes

### Regen formula

```
sandSpent = SAND_MAX - state.sandResource
regenRate = BASE_REGEN / (1 + sandSpent / SAND_MAX)
```

## Section 3: Sky Obstacles

### Falling rocks (reworked)
- Three sizes: small (4×4), medium (8×8), large (12×12)
- Kill on contact while falling
- Embed in ground on landing (become solid wall — wizard must sand over)

### Cave gates (new)
- Wide solid bar descends from sky
- Gap cut in bar, sized ~14px tall (just larger than wizard's 8px)
- Gap position varies: low / mid / high
- Cave walls kill on contact
- Wizard must be at correct floor height (adjusted with sand) to pass through gap

### Boulders (existing, kept)
- Roll left along ground, kill on contact

### Scaling
- Early (0–25% difficulty): small rocks + wide cave gaps only
- Mid (25–50%): adds boulders, medium rocks, medium gaps
- Late (50–75%): narrow gaps, dust devils, multi-rock volleys
- Max (75–100%+): large rocks, tight gaps, boulders speed up, simultaneous spawns

## Section 4: Power-ups

Four types, color-coded glowing orbs, collected by walking into them:

| Type | Color | Effect | Frequency |
|------|-------|---------|-----------|
| Sand boost | Gold | +3000 sand | Most common |
| Shield | Blue | Absorb one hit | Uncommon |
| Sand burst | Orange | Instantly dump 2000 sand at wizard's feet | Uncommon |
| Slow scroll | Green | Halve walk speed for 5 seconds | Rare |

Spawned every ~600 world units. Type weighted toward what's most useful at current difficulty.

## Section 5: Level Progression

- Fixed seed `42` via simple LCG (no external library)
- Spawn interval: ~400 units → ~150 units as score climbs
- Difficulty = `Math.min(state.score / 2000, 1)`
- Power-up spawn every ~600 units regardless of difficulty

### LCG implementation

```ts
let seed = 42;
function seededRandom(): number {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
}
```

Seed resets to 42 on each new game start.

## Files to Change

| File | Change |
|------|--------|
| `lib/sand-wizard/constants.ts` | SAND_MAX→10000, remove JUMP_VY, add regen constants |
| `lib/sand-wizard/types.ts` | Remove jump/duck states, add new obstacle/powerup types |
| `lib/sand-wizard/player.ts` | Remove jump+duck logic |
| `lib/sand-wizard/input.ts` | Update regen formula |
| `lib/sand-wizard/obstacles.ts` | Add cave gate type, seeded RNG, rework spawner, multi-size rocks |
| `lib/sand-wizard/renderer.ts` | Render cave gates, power-up types, shield aura |
| `lib/sand-wizard/state.ts` | Add seeded RNG reset on game start |
| `components/sand-wizard/SandWizardGame.tsx` | Remove key bindings for jump/duck |
