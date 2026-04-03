const STORAGE_KEY = 'sand-wizard-high-score';

export function getHighScore(): number {
  try { return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10) || 0; }
  catch { return 0; }
}

export function saveHighScore(score: number): number {
  const hi = Math.max(getHighScore(), score);
  try { localStorage.setItem(STORAGE_KEY, String(hi)); } catch {}
  return hi;
}

export function checkNearMiss(
  px: number, py: number,
  obstacles: Array<{ x: number; y: number; width: number; height: number; type: string }>,
): boolean {
  const margin = 12;
  for (const o of obstacles) {
    if (o.type !== 'boulder' && o.type !== 'falling-rock') continue;
    const dx = Math.abs(px - (o.x + o.width / 2));
    const dy = Math.abs(py - (o.y + o.height / 2));
    const closeX = dx < o.width / 2 + margin;
    const closeY = dy < o.height / 2 + margin;
    const hitX = dx < o.width / 2 + 4;
    const hitY = dy < o.height / 2 + 14;
    if (closeX && closeY && !(hitX && hitY)) return true;
  }
  return false;
}
