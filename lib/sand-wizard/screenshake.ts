let shakeFrames = 0;
let shakeIntensity = 0;
let shakeMax = 0;
let sx = 0, sy = 0;

export function triggerShake(intensity: number, frames: number): void {
  shakeIntensity = intensity;
  shakeFrames = frames;
  shakeMax = frames;
}

export function updateShake(): { x: number; y: number } {
  if (shakeFrames <= 0) { sx = 0; sy = 0; return { x: 0, y: 0 }; }
  const t = shakeFrames / shakeMax;
  sx = (Math.random() - 0.5) * 2 * shakeIntensity * t;
  sy = (Math.random() - 0.5) * 2 * shakeIntensity * t;
  shakeFrames--;
  return { x: sx, y: sy };
}

export function getShake(): { x: number; y: number } { return { x: sx, y: sy }; }
