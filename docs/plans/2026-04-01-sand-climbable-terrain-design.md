# Sand as Climbable Terrain

**Date:** 2026-04-01
**Status:** Approved

## Problem

Sand dropped by the mouse does not change the player's Y position. Two bugs prevent it:

1. `findSurface` scans downward from `player.y`, so it never detects sand piles that have grown above the player's current feet level.
2. The wall kill check fires on any non-empty cell (`!== 0`), so sand at chest height kills the player instead of elevating them.

## Design

Two targeted changes to `lib/sand-wizard/player.ts`:

### 1. `findSurface` — scan from top of grid

Change scan start from `Math.ceil(player.y)` to `0`. This returns the topmost occupied cell in the player's column, so sand piles of any height are treated as the ground surface.

### 2. Wall kill — rock only

Change the wall check condition from `!== 0` to `=== 2`. Only solid rock (cell type 2) kills the player. Sand (cell type 1) does not — the surface scan handles elevation instead.

## Expected Behaviour

- Player walks toward a sand pile; as it scrolls into the player's column the surface scan detects it and snaps the player's Y to the top.
- Works for piles of any height.
- Rock walls still kill the player as before.
