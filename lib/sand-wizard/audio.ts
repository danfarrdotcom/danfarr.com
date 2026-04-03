let ctx: AudioContext | null = null;

export function initAudio(): void {
  if (!ctx) ctx = new AudioContext();
}

function noise(duration: number, freq: number, type: OscillatorType = 'sine', gain = 0.3): void {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + duration);
}

export function playPlaceSand(): void { noise(0.05, 800 + Math.random() * 400, 'triangle', 0.08); }
export function playRemoveSand(): void { noise(0.05, 400, 'sine', 0.06); }
export function playDeath(): void { noise(0.4, 80, 'sawtooth', 0.3); }
export function playNearMiss(): void { noise(0.1, 1200, 'sine', 0.15); }
export function playBoulderRumble(): void { noise(0.2, 60, 'square', 0.15); }

export function playPowerUp(): void {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(600, ctx.currentTime);
  o.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
  g.gain.setValueAtTime(0.2, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.2);
}
