/**
 * Hollaback Girl–inspired marching band soundtrack for ScrumBananas
 * Stomp-clap drum line, cheerleader chant melody, B-A-N-A-N-A-S hook
 * Uses Web Audio API oscillators — no external files needed
 */

type NoteEvent = [number, number, number]; // [frequency, startBeat, durationBeats]

// Notes
const Bb2 = 116.54,
  F3 = 174.61,
  G3 = 196.0,
  Bb3 = 233.08,
  C4 = 261.63,
  D4 = 293.66,
  Eb4 = 311.13,
  F4 = 349.23,
  G4 = 392.0,
  A4 = 440.0,
  Bb4 = 466.16,
  C5 = 523.25,
  D5 = 587.33,
  Eb5 = 622.25,
  F5 = 698.46,
  G5 = 783.99,
  Bb5 = 932.33;

const REST = 0;

// ~110 BPM — that swagger tempo
const BPM = 110;
const BEAT = 60 / BPM;
const LOOP_BEATS = 32; // 8 bars

// =====================================================
// MELODY — cheerleader chant, monotone with attitude
// =====================================================
const MELODY: NoteEvent[] = [
  // Bars 1-2: monotone chant on Bb
  [Bb4, 0, 0.25],
  [REST, 0.25, 0.25],
  [Bb4, 0.5, 0.25],
  [Bb4, 1, 0.5],
  [Bb4, 1.5, 0.25],
  [Bb4, 2, 0.5],
  [G4, 2.5, 0.5],
  [Bb4, 3, 0.5],
  [REST, 3.5, 0.5],
  // repeat pattern up
  [Bb4, 4, 0.25],
  [REST, 4.25, 0.25],
  [Bb4, 4.5, 0.25],
  [C5, 5, 0.5],
  [Bb4, 5.5, 0.25],
  [G4, 6, 0.5],
  [F4, 6.5, 0.5],
  [G4, 7, 0.75],
  [REST, 7.75, 0.25],

  // Bars 3-4: drops down
  [Bb4, 8, 0.25],
  [Bb4, 8.5, 0.25],
  [Bb4, 9, 0.5],
  [C5, 9.5, 0.25],
  [Bb4, 10, 0.5],
  [G4, 10.5, 0.5],
  [F4, 11, 0.5],
  [REST, 11.5, 0.5],
  [G4, 12, 0.25],
  [Bb4, 12.5, 0.5],
  [Bb4, 13, 0.25],
  [C5, 13.5, 0.25],
  [Bb4, 14, 0.5],
  [G4, 14.5, 0.5],
  [F4, 15, 0.5],
  [REST, 15.5, 0.5],

  // Bars 5-6: descending woo-hoo hook
  [D5, 16, 0.75],
  [C5, 16.75, 0.25],
  [Bb4, 17, 1],
  [REST, 18, 0.5],
  [D5, 18.5, 0.75],
  [C5, 19.25, 0.25],
  [Bb4, 19.5, 0.5],
  [G4, 20, 1],
  [REST, 21, 0.5],
  [D5, 21.5, 0.75],
  [C5, 22.25, 0.25],
  [Bb4, 22.5, 0.5],
  [REST, 23, 1],

  // Bars 7-8: B-A-N-A-N-A-S spelling chant
  [Bb4, 24, 0.35],
  [REST, 24.5, 0.15],
  [G4, 24.75, 0.35],
  [REST, 25.15, 0.1],
  [Bb4, 25.5, 0.35],
  [REST, 25.9, 0.1],
  [G4, 26, 0.35],
  [REST, 26.4, 0.1],
  [Bb4, 26.75, 0.35],
  [REST, 27.15, 0.1],
  [G4, 27.5, 0.35],
  [REST, 27.9, 0.1],
  [D5, 28, 0.75],
  [C5, 28.75, 0.25],
  [Bb4, 29, 1],
  [REST, 30, 1],
  [G4, 31, 0.5],
  [Bb4, 31.5, 0.5],
];

// =====================================================
// STOMP-CLAP — BOOM . . CLAP | BOOM BOOM . CLAP
// =====================================================
const STOMP_BEATS: number[] = [];
const CLAP_BEATS: number[] = [];
for (let bar = 0; bar < 8; bar++) {
  const b = bar * 4;
  STOMP_BEATS.push(b);
  CLAP_BEATS.push(b + 1.5);
  STOMP_BEATS.push(b + 2);
  STOMP_BEATS.push(b + 2.5);
  CLAP_BEATS.push(b + 3.5);
}

// Snare rolls on bars 4 and 8
const SNARE_ROLL_BEATS: number[] = [];
for (let i = 0; i < 8; i++) SNARE_ROLL_BEATS.push(14 + i * 0.25);
for (let i = 0; i < 8; i++) SNARE_ROLL_BEATS.push(30 + i * 0.25);

// =====================================================
// BASS — minimal, heavy, locks with the stomp
// =====================================================
const BASS_LINE: NoteEvent[] = [];
const BASS_ROOTS: [number, number][] = [
  [Bb2, 0],
  [Bb2, 4],
  [Bb2, 8],
  [Bb2, 12],
  [G3, 16],
  [G3, 20],
  [F3, 24],
  [F3, 28],
];
for (const [root, start] of BASS_ROOTS) {
  BASS_LINE.push(
    [root, start, 0.5],
    [REST, start + 0.5, 1],
    [root, start + 1.5, 0.3],
    [root, start + 2, 0.5],
    [root * 1.5, start + 2.5, 0.3],
    [REST, start + 2.8, 0.7],
    [root, start + 3.5, 0.3]
  );
}

// =====================================================
// MARCHING BRASS — staccato horn stabs
// =====================================================
const BRASS: NoteEvent[] = [
  // Bars 1-2
  [Bb4, 0, 0.2],
  [D5, 0, 0.2],
  [F5, 0, 0.2],
  [REST, 0.2, 1.3],
  [Bb4, 2, 0.2],
  [D5, 2, 0.2],
  [F5, 2, 0.2],
  [Bb4, 2.5, 0.2],
  [D5, 2.5, 0.2],
  [REST, 2.7, 1.3],
  [Bb4, 4, 0.2],
  [D5, 4, 0.2],
  [F5, 4, 0.2],
  [REST, 4.2, 1.3],
  [Bb4, 6, 0.2],
  [D5, 6, 0.2],
  [F5, 6, 0.2],
  [Bb4, 6.5, 0.2],
  [D5, 6.5, 0.2],
  [REST, 6.7, 1.3],
  // Bars 3-4
  [G4, 8, 0.2],
  [Bb4, 8, 0.2],
  [D5, 8, 0.2],
  [REST, 8.2, 1.3],
  [G4, 10, 0.2],
  [Bb4, 10, 0.2],
  [D5, 10, 0.2],
  [G4, 10.5, 0.2],
  [Bb4, 10.5, 0.2],
  [REST, 10.7, 1.3],
  [F4, 12, 0.2],
  [A4, 12, 0.2],
  [C5, 12, 0.2],
  [REST, 12.2, 1.3],
  [F4, 14, 0.2],
  [A4, 14, 0.2],
  [C5, 14, 0.2],
  [REST, 14.2, 1.8],
  // Bars 5-6: sustained for woo-hoo
  [Bb4, 16, 1.5],
  [D5, 16, 1.5],
  [REST, 17.5, 0.5],
  [Bb4, 18.5, 1.5],
  [D5, 18.5, 1.5],
  [REST, 20, 0.5],
  [Bb4, 21.5, 1.5],
  [D5, 21.5, 1.5],
  [REST, 23, 1],
  // Bars 7-8: spelling stabs
  [Bb4, 24, 0.2],
  [D5, 24, 0.2],
  [F5, 24, 0.2],
  [G4, 24.75, 0.2],
  [Bb4, 24.75, 0.2],
  [Bb4, 25.5, 0.2],
  [D5, 25.5, 0.2],
  [F5, 25.5, 0.2],
  [G4, 26, 0.2],
  [Bb4, 26, 0.2],
  [Bb4, 26.75, 0.2],
  [D5, 26.75, 0.2],
  [F5, 26.75, 0.2],
  [G4, 27.5, 0.2],
  [Bb4, 27.5, 0.2],
  [Bb4, 28, 1.5],
  [D5, 28, 1.5],
  [F5, 28, 1.5],
  [Bb5, 28, 1.5],
  [REST, 29.5, 2.5],
];

// =====================================================

function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export class BananaSoundtrack {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private running = false;
  private nextLoopTime = 0;
  private timerId: number | null = null;
  private _volume = 0.25;
  private noiseBuffer: AudioBuffer | null = null;

  get volume() {
    return this._volume;
  }

  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx!.currentTime);
    }
  }

  start() {
    if (this.running) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this._volume;
    this.masterGain.connect(this.ctx.destination);
    this.noiseBuffer = createNoiseBuffer(this.ctx, 0.2);
    this.running = true;
    this.nextLoopTime = this.ctx.currentTime + 0.05;
    this.scheduleLoop();
  }

  stop() {
    this.running = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.masterGain = null;
    this.noiseBuffer = null;
  }

  private scheduleLoop() {
    if (!this.running || !this.ctx || !this.masterGain) return;

    const t0 = this.nextLoopTime;

    // Cheerleader melody
    for (const [freq, beat, dur] of MELODY) {
      if (freq === REST) continue;
      this.playMelody(freq, t0 + beat * BEAT, dur * BEAT * 0.85);
    }

    // Marching brass
    for (const [freq, beat, dur] of BRASS) {
      if (freq === REST) continue;
      this.playBrass(freq, t0 + beat * BEAT, dur * BEAT);
    }

    // Bass
    for (const [freq, beat, dur] of BASS_LINE) {
      if (freq === REST) continue;
      this.playBass(freq, t0 + beat * BEAT, dur * BEAT * 0.9);
    }

    // STOMP
    for (const b of STOMP_BEATS) {
      this.playStomp(t0 + b * BEAT);
    }

    // CLAP
    for (const b of CLAP_BEATS) {
      this.playClap(t0 + b * BEAT);
    }

    // Snare rolls
    for (const b of SNARE_ROLL_BEATS) {
      this.playSnareHit(t0 + b * BEAT);
    }

    this.nextLoopTime = t0 + LOOP_BEATS * BEAT;

    const scheduleAhead =
      (this.nextLoopTime - this.ctx.currentTime - 0.5) * 1000;
    this.timerId = window.setTimeout(
      () => this.scheduleLoop(),
      Math.max(100, scheduleAhead)
    );
  }

  /** Cheerleader chant — nasal square wave with megaphone filter */
  private playMelody(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1200;
    bp.Q.value = 1.5;

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq * 0.95, time);
    osc.frequency.linearRampToValueAtTime(freq, time + 0.03);

    gain.gain.setValueAtTime(0.1, time);
    gain.gain.setValueAtTime(0.1, time + dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, time + dur);

    osc.connect(bp);
    bp.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  /** Marching brass — fat detuned sawtooths */
  private playBrass(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    for (const detune of [-10, 0, 10]) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(detune, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.06, time + 0.01);
      gain.gain.setValueAtTime(0.06, time + dur * 0.6);
      gain.gain.linearRampToValueAtTime(0, time + dur);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + dur + 0.01);
    }
  }

  /** Heavy sub bass */
  private playBass(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.22, time);
    gain.gain.setValueAtTime(0.22, time + dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, time + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  /** STOMP — gym-floor boom */
  private playStomp(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.25);

    if (!this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 200;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.15, time);
    nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    src.connect(lp);
    lp.connect(nGain);
    nGain.connect(this.masterGain);
    src.start(time);
    src.stop(time + 0.08);
  }

  /** CLAP — layered arena clap */
  private playClap(time: number) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    for (let i = 0; i < 3; i++) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1500 + i * 500;
      bp.Q.value = 0.8;
      const gain = this.ctx.createGain();
      const offset = i * 0.008;
      gain.gain.setValueAtTime(0, time + offset);
      gain.gain.linearRampToValueAtTime(0.18, time + offset + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + 0.1);
      src.connect(bp);
      bp.connect(gain);
      gain.connect(this.masterGain);
      src.start(time + offset);
      src.stop(time + offset + 0.1);
    }
  }

  /** Marching snare hit */
  private playSnareHit(time: number) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3500;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    src.connect(hp);
    hp.connect(gain);
    gain.connect(this.masterGain);
    src.start(time);
    src.stop(time + 0.06);

    const osc = this.ctx.createOscillator();
    const oGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 220;
    oGain.gain.setValueAtTime(0.06, time);
    oGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(oGain);
    oGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.04);
  }
}
