let ctx: AudioContext | null = null;
let musicPlaying = false;
let musicGain: GainNode | null = null;

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

// --- Creepy Arabian soundtrack ---
// Hijaz scale in low D: darker, one octave lower
const HIJAZ = [146.83, 155.56, 185.00, 196.00, 220.00, 233.08, 277.18, 293.66];
const HIJAZ_SUB = HIJAZ.map(f => f / 2); // sub-bass

// Sparse, haunting phrases — lots of rests (null = silence)
const PHRASES: (number | null)[][] = [
  [0, null, 1, 2, null, null, 1, 0],
  [null, 3, null, 2, 1, null, 0, null],
  [5, null, 4, null, 3, 2, null, 1],
  [0, null, null, 2, 3, null, 2, null],
  [null, null, 7, 5, null, 4, 3, null],
  [1, 0, null, null, 1, 2, 1, null],
];

function scheduleNote(
  freq: number, startTime: number, dur: number,
  type: OscillatorType, vol: number, dest: AudioNode,
  vibrato = 0,
): void {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  // Vibrato for that eerie wavering quality
  if (vibrato > 0) {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 5 + Math.random() * 2;
    lfoGain.gain.value = vibrato;
    lfo.connect(lfoGain).connect(o.frequency);
    lfo.start(startTime);
    lfo.stop(startTime + dur + 0.01);
  }
  // Slow fade in, long fade out — breathy
  g.gain.setValueAtTime(0.001, startTime);
  g.gain.linearRampToValueAtTime(vol, startTime + dur * 0.15);
  g.gain.setValueAtTime(vol * 0.8, startTime + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
  o.connect(g).connect(dest);
  o.start(startTime);
  o.stop(startTime + dur + 0.02);
}

function scheduleDrone(startTime: number, dur: number, dest: AudioNode): void {
  if (!ctx) return;
  scheduleNote(HIJAZ_SUB[0], startTime, dur, 'sine', 0.12, dest, 0.3);
  scheduleNote(HIJAZ_SUB[1], startTime + 1, dur - 1, 'sine', 0.05, dest, 0.5);
  scheduleNote(HIJAZ_SUB[4], startTime + 0.5, dur - 0.5, 'triangle', 0.07, dest, 0.4);
}

function schedulePhrase(startTime: number, dest: AudioNode): void {
  if (!ctx) return;
  const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  const noteLen = 0.55 + Math.random() * 0.2; // slower, more deliberate
  let t = startTime;
  for (const idx of phrase) {
    if (idx !== null) {
      const freq = HIJAZ[idx % HIJAZ.length];
      const dur = noteLen * (0.7 + Math.random() * 0.5);
      scheduleNote(freq, t, dur, 'sine', 0.10, dest, 1.5 + Math.random());
      // Echo/delay — quiet repeat
      scheduleNote(freq, t + 0.3, dur * 0.6, 'sine', 0.04, dest, 2);
    }
    t += noteLen;
  }
}

function schedulePercussion(startTime: number, dur: number, dest: AudioNode): void {
  if (!ctx) return;
  const beatLen = dur / 16; // 16 subdivisions for sparse hits
  // Sparse tabla-like: soft dum on 1, ghost tek, dum on 9, tek-ka
  const hits = [
    { t: 0, freq: 55, d: 0.15, vol: 0.10 },
    { t: 4, freq: 220, d: 0.03, vol: 0.05 },
    { t: 8, freq: 55, d: 0.12, vol: 0.09 },
    { t: 12, freq: 240, d: 0.03, vol: 0.06 },
    { t: 14, freq: 260, d: 0.02, vol: 0.04 },
  ];
  for (const h of hits) {
    scheduleNote(h.freq, startTime + h.t * beatLen, h.d, 'triangle', h.vol, dest);
  }
}

// Occasional eerie wind sound
function scheduleWind(startTime: number, dur: number, dest: AudioNode): void {
  if (!ctx || Math.random() > 0.4) return; // only sometimes
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter();
  o.type = 'sawtooth';
  o.frequency.value = 80 + Math.random() * 40;
  f.type = 'bandpass';
  f.frequency.value = 300 + Math.random() * 200;
  f.Q.value = 8;
  g.gain.setValueAtTime(0.001, startTime);
  g.gain.linearRampToValueAtTime(0.05, startTime + dur * 0.4);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
  o.connect(f).connect(g).connect(dest);
  o.start(startTime);
  o.stop(startTime + dur + 0.01);
}

function scheduleLoop(): void {
  if (!ctx || !musicGain || !musicPlaying) return;
  const now = ctx.currentTime + 0.1;
  const loopDur = 7.2; // longer, more spacious loops

  scheduleDrone(now, loopDur, musicGain);
  schedulePhrase(now + 0.3, musicGain);
  schedulePercussion(now, loopDur, musicGain);
  scheduleWind(now + 1, loopDur - 1, musicGain);

  setTimeout(() => scheduleLoop(), (loopDur - 0.5) * 1000);
}

export function startMusic(): void {
  if (!ctx || musicPlaying) return;
  musicPlaying = true;
  musicGain = ctx.createGain();
  musicGain.gain.value = 1.0;
  musicGain.connect(ctx.destination);
  scheduleLoop();
}

export function stopMusic(): void {
  musicPlaying = false;
  if (musicGain) {
    musicGain.gain.linearRampToValueAtTime(0.001, (ctx?.currentTime ?? 0) + 0.5);
    musicGain = null;
  }
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
