let _seed = 42;

export function resetRng(): void {
  _seed = 42;
}

/** Returns a pseudo-random float in [0, 1) — same sequence each game */
export function rng(): number {
  _seed = (Math.imul(_seed, 1664525) + 1013904223) | 0;
  return (_seed >>> 0) / 0x100000000;
}
