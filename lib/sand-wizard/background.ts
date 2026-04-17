import { LOGICAL_W, LOGICAL_H, SCALE, GROUND_Y } from './constants';

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function setPixel(data: Uint8ClampedArray, px: number, py: number, canvasW: number, canvasH: number, r: number, g: number, b: number): void {
  if (px < 0 || px >= canvasW || py < 0 || py >= canvasH) return;
  const idx = (py * canvasW + px) * 4;
  data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
}

function fillBlock(data: Uint8ClampedArray, lx: number, ly: number, canvasW: number, canvasH: number, r: number, g: number, b: number): void {
  for (let sy = 0; sy < SCALE; sy++) {
    for (let sx = 0; sx < SCALE; sx++) {
      setPixel(data, lx * SCALE + sx, ly * SCALE + sy, canvasW, canvasH, r, g, b);
    }
  }
}

function hash(n: number): number {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Night palette
const NIGHT_SKY_TOP = hexToRgb('#0a0a2e');
const NIGHT_SKY_BOT = hexToRgb('#1a1040');
const NIGHT_DUNES: Array<{ top: [number, number, number]; yBase: number; factor: number; amp: number; freq: number }> = [
  { top: hexToRgb('#1a1030'), yBase: 140, factor: 0.1, amp: 8, freq: 0.02 },
  { top: hexToRgb('#2a1838'), yBase: 155, factor: 0.3, amp: 10, freq: 0.035 },
  { top: hexToRgb('#3a2040'), yBase: 168, factor: 0.6, amp: 6, freq: 0.06 },
];
const NIGHT_SPIRE = hexToRgb('#12082a');

// Day palette
const DAY_SKY_TOP = hexToRgb('#8b3a0f');
const DAY_SKY_BOT = hexToRgb('#d47a3a');
const DAY_DUNES: Array<{ top: [number, number, number]; yBase: number; factor: number; amp: number; freq: number }> = [
  { top: hexToRgb('#7a3a18'), yBase: 140, factor: 0.1, amp: 8, freq: 0.02 },
  { top: hexToRgb('#a05a28'), yBase: 155, factor: 0.3, amp: 10, freq: 0.035 },
  { top: hexToRgb('#b8742a'), yBase: 168, factor: 0.6, amp: 6, freq: 0.06 },
];
const DAY_SPIRE = hexToRgb('#5a2810');
const DAY_SUN = hexToRgb('#ffcc44');
const NIGHT_MOON = hexToRgb('#e8e8ff');

export function fillBackground(
  data: Uint8ClampedArray,
  canvasW: number,
  canvasH: number,
  cameraX: number,
  score: number = 0,
  obstacleCount: number = 0,
  frame: number = 0,
): void {
  const dayT = Math.min(1, score / 500);

  const skyTop = lerpColor(NIGHT_SKY_TOP, DAY_SKY_TOP, dayT);
  const skyBot = lerpColor(NIGHT_SKY_BOT, DAY_SKY_BOT, dayT);
  const groundH = (LOGICAL_H - GROUND_Y) * SCALE;
  const skyH = canvasH - groundH;

  // Sky gradient
  for (let py = 0; py < canvasH; py++) {
    const t = Math.min(1, py / skyH);
    const r = Math.round(skyTop[0] + (skyBot[0] - skyTop[0]) * t);
    const g = Math.round(skyTop[1] + (skyBot[1] - skyTop[1]) * t);
    const b = Math.round(skyTop[2] + (skyBot[2] - skyTop[2]) * t);
    for (let px = 0; px < canvasW; px++) {
      const idx = (py * canvasW + px) * 4;
      data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
    }
  }

  // Stars
  if (dayT < 1) {
    const starAlpha = 1 - dayT;
    for (let i = 0; i < 60; i++) {
      const sx = Math.floor(hash(i * 3) * LOGICAL_W);
      const sy = Math.floor(hash(i * 3 + 1) * (GROUND_Y - 20));
      const brightness = Math.floor((150 + hash(i * 3 + 2) * 105) * starAlpha);
      fillBlock(data, sx, sy, canvasW, canvasH, brightness, brightness, brightness);
    }
  }

  // ---- MAJORA'S MASK MOON ----
  drawMajoraMoon(data, canvasW, canvasH, dayT, obstacleCount, frame);

  // Circling bird flocks
  drawBirdFlocks(data, canvasW, canvasH, cameraX, dayT, frame);

  // Distant rock spires
  const spireColor = lerpColor(NIGHT_SPIRE, DAY_SPIRE, dayT);
  const spireOffset = cameraX * 0.04;
  for (let lx = 0; lx < LOGICAL_W; lx++) {
    const wx = lx + spireOffset;
    const spireVal = Math.sin(wx * 0.008) + Math.sin(wx * 0.023 + 1.4) * 0.5;
    if (spireVal > 0.8) {
      const spireH = Math.round((spireVal - 0.8) * 150);
      const baseY = 155;
      for (let ly = baseY - spireH; ly < baseY; ly++) {
        const t = (baseY - ly) / spireH;
        const halfW = Math.max(1, Math.round((1 - t * 0.7) * 3));
        for (let dx = -halfW; dx <= halfW; dx++) {
          const px2 = lx + dx;
          if (px2 >= 0 && px2 < LOGICAL_W) fillBlock(data, px2, ly, canvasW, canvasH, spireColor[0], spireColor[1], spireColor[2]);
        }
      }
    }
  }

  // Parallax dune layers with palm trees and camels
  for (let li = 0; li < 3; li++) {
    const nightL = NIGHT_DUNES[li];
    const dayL = DAY_DUNES[li];
    const col = lerpColor(nightL.top, dayL.top, dayT);
    const offsetX = cameraX * dayL.factor;

    for (let lx = 0; lx < LOGICAL_W; lx++) {
      const worldX = lx + offsetX;
      const duneY = Math.round(dayL.yBase + Math.sin(worldX * dayL.freq) * dayL.amp);
      for (let ly = duneY; ly < GROUND_Y; ly++) {
        fillBlock(data, lx, ly, canvasW, canvasH, col[0], col[1], col[2]);
      }
    }

    // Palm trees on middle dune layer
    if (li === 1) {
      const trunkCol = lerpColor(hexToRgb('#1a1020'), hexToRgb('#5a3a1a'), dayT);
      const leafCol = lerpColor(hexToRgb('#0a2010'), hexToRgb('#1a6020'), dayT);
      for (let pi = 0; pi < 5; pi++) {
        const pwx = hash(pi * 11 + 100) * LOGICAL_W;
        const plx = Math.floor(pwx);
        if (plx < 0 || plx >= LOGICAL_W) continue;
        const pBaseY = Math.round(dayL.yBase + Math.sin(plx * dayL.freq) * dayL.amp);
        const pH = 12 + Math.floor(hash(pi * 11 + 101) * 6);
        // Trunk — slight curve
        for (let dy = 0; dy < pH; dy++) {
          const curve = Math.round(Math.sin(dy / pH * 1.2) * 2);
          fillBlock(data, plx + curve, pBaseY - dy, canvasW, canvasH, trunkCol[0], trunkCol[1], trunkCol[2]);
        }
        // Fronds — drooping leaves from top
        const topY = pBaseY - pH;
        const topX = plx + Math.round(Math.sin(1.2) * 2);
        for (let fi = 0; fi < 5; fi++) {
          const angle = (fi / 5) * Math.PI * 2 + hash(pi * 11 + fi) * 0.5;
          for (let d = 1; d <= 5; d++) {
            const fx = topX + Math.round(Math.cos(angle) * d);
            const fy = topY + Math.round(d * 0.5);
            fillBlock(data, fx, fy, canvasW, canvasH, leafCol[0], leafCol[1], leafCol[2]);
          }
        }
      }
    }

    // Camels on far dune layer
    if (li === 0) {
      const camelOffset = cameraX * nightL.factor;
      const camelCol = lerpColor(hexToRgb('#1a1020'), hexToRgb('#6b4a30'), dayT);
      for (let ci = 0; ci < 3; ci++) {
        const cwx = (hash(ci * 17 + 200) * 900 + camelOffset) % (LOGICAL_W + 100) - 50;
        const clx = Math.floor(cwx);
        if (clx < 0 || clx >= LOGICAL_W - 8) continue;
        const cBaseY = Math.round(nightL.yBase + Math.sin((clx + camelOffset) * nightL.freq) * nightL.amp);
        // Body
        for (let dx = 0; dx < 5; dx++) {
          for (let dy = 0; dy < 3; dy++) {
            fillBlock(data, clx + dx, cBaseY - 3 + dy, canvasW, canvasH, camelCol[0], camelCol[1], camelCol[2]);
          }
        }
        // Hump
        fillBlock(data, clx + 2, cBaseY - 4, canvasW, canvasH, camelCol[0], camelCol[1], camelCol[2]);
        fillBlock(data, clx + 3, cBaseY - 4, canvasW, canvasH, camelCol[0], camelCol[1], camelCol[2]);
        // Neck + head
        fillBlock(data, clx + 5, cBaseY - 4, canvasW, canvasH, camelCol[0], camelCol[1], camelCol[2]);
        fillBlock(data, clx + 5, cBaseY - 5, canvasW, canvasH, camelCol[0], camelCol[1], camelCol[2]);
        fillBlock(data, clx + 6, cBaseY - 5, canvasW, canvasH, camelCol[0], camelCol[1], camelCol[2]);
        // Legs
        fillBlock(data, clx, cBaseY, canvasW, canvasH, camelCol[0], camelCol[1], camelCol[2]);
        fillBlock(data, clx + 4, cBaseY, canvasW, canvasH, camelCol[0], camelCol[1], camelCol[2]);
      }
    }
  }
}

// ---- Majora's Mask style moon face ----
function drawMajoraMoon(
  data: Uint8ClampedArray, canvasW: number, canvasH: number,
  dayT: number, obstacleCount: number, frame: number,
): void {
  const cx = Math.round(LOGICAL_W * 0.78);
  const cy = 25;
  const R = 10;
  const baseColor = lerpColor(NIGHT_MOON, DAY_SUN, dayT);
  const evil = obstacleCount > 3;

  // Shaded sphere — lighter on top-left, darker bottom-right
  const shadowColor = lerpColor(hexToRgb('#a0a0c8'), hexToRgb('#aa8800'), dayT);
  for (let ly = cy - R; ly <= cy + R; ly++) {
    for (let lx = cx - R; lx <= cx + R; lx++) {
      const dx = lx - cx;
      const dy = ly - cy;
      if (dx * dx + dy * dy > R * R) continue;
      const shade = Math.max(0, Math.min(1, (dx + dy) / (R * 1.5) + 0.5));
      const c = lerpColor(baseColor, shadowColor, shade);
      fillBlock(data, lx, ly, canvasW, canvasH, c[0], c[1], c[2]);
    }
  }

  const faceDark = lerpColor(hexToRgb('#303050'), hexToRgb('#664400'), dayT);
  const eyeYellow = lerpColor(hexToRgb('#cccc44'), hexToRgb('#ffaa00'), dayT);

  // ---- Eyes: large, triangular, Majora-style ----
  const eyeY = cy - 2;
  const leX = cx - 4;
  const reX = cx + 2;

  if (evil) {
    // Angry narrowed triangular eyes — glowing
    const pulse = Math.sin(frame * 0.12) * 0.3 + 0.7;
    const glowR = Math.round(eyeYellow[0] * pulse);
    const glowG = Math.round(eyeYellow[1] * pulse * 0.5);
    // Left eye — triangle pointing right: 3 rows
    fillBlock(data, leX, eyeY, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, leX + 1, eyeY, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, leX + 2, eyeY, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, leX, eyeY + 1, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, leX + 1, eyeY + 1, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, leX + 1, eyeY - 1, canvasW, canvasH, glowR, glowG, 0);
    // Right eye — mirror
    fillBlock(data, reX, eyeY, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, reX + 1, eyeY, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, reX + 2, eyeY, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, reX + 1, eyeY + 1, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, reX + 2, eyeY + 1, canvasW, canvasH, glowR, glowG, 0);
    fillBlock(data, reX + 1, eyeY - 1, canvasW, canvasH, glowR, glowG, 0);
    // Dark pupils
    fillBlock(data, leX + 1, eyeY, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
    fillBlock(data, reX + 1, eyeY, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
  } else {
    // Normal: small round eyes
    fillBlock(data, leX + 1, eyeY, canvasW, canvasH, eyeYellow[0], eyeYellow[1], eyeYellow[2]);
    fillBlock(data, leX + 2, eyeY, canvasW, canvasH, eyeYellow[0], eyeYellow[1], eyeYellow[2]);
    fillBlock(data, reX + 1, eyeY, canvasW, canvasH, eyeYellow[0], eyeYellow[1], eyeYellow[2]);
    fillBlock(data, reX + 2, eyeY, canvasW, canvasH, eyeYellow[0], eyeYellow[1], eyeYellow[2]);
    fillBlock(data, leX + 1, eyeY + 1, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
    fillBlock(data, reX + 1, eyeY + 1, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
  }

  // ---- Nose: long pointed Majora nose ----
  fillBlock(data, cx, cy, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
  fillBlock(data, cx, cy + 1, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
  fillBlock(data, cx, cy + 2, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
  fillBlock(data, cx - 1, cy + 2, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);

  // ---- Brow ridges ----
  const browColor = lerpColor(hexToRgb('#404060'), hexToRgb('#886600'), dayT);
  if (evil) {
    // Deep angry V-brows
    fillBlock(data, cx - 6, cy - 5, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx - 5, cy - 4, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx - 4, cy - 4, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx - 3, cy - 3, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx + 3, cy - 3, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx + 4, cy - 4, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx + 5, cy - 4, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx + 6, cy - 5, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
  } else {
    fillBlock(data, cx - 5, cy - 4, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx - 4, cy - 4, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx + 4, cy - 4, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx + 5, cy - 4, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
  }

  // ---- Mouth ----
  const mY = cy + 4;
  const mouthDark = lerpColor(hexToRgb('#0a0a1a'), hexToRgb('#221100'), dayT);
  const teethColor = lerpColor(hexToRgb('#d0d0e0'), hexToRgb('#ffffcc'), dayT);

  if (evil) {
    // Wide Majora grin — ear to ear, jagged teeth
    // Grin curves up at edges
    fillBlock(data, cx - 7, mY - 2, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
    fillBlock(data, cx - 6, mY - 1, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
    fillBlock(data, cx + 6, mY - 1, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
    fillBlock(data, cx + 7, mY - 2, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
    // Dark mouth cavity
    for (let dx = -5; dx <= 5; dx++) {
      fillBlock(data, cx + dx, mY + 1, canvasW, canvasH, mouthDark[0], mouthDark[1], mouthDark[2]);
      fillBlock(data, cx + dx, mY + 2, canvasW, canvasH, mouthDark[0], mouthDark[1], mouthDark[2]);
    }
    // Jagged teeth — alternating tall/short
    for (let dx = -5; dx <= 5; dx++) {
      fillBlock(data, cx + dx, mY, canvasW, canvasH, teethColor[0], teethColor[1], teethColor[2]);
      if (dx % 2 === 0) {
        fillBlock(data, cx + dx, mY + 1, canvasW, canvasH, teethColor[0], teethColor[1], teethColor[2]);
      }
    }
    // Wrinkle lines radiating from mouth
    fillBlock(data, cx - 7, mY, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx - 8, mY + 1, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx + 7, mY, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
    fillBlock(data, cx + 8, mY + 1, canvasW, canvasH, browColor[0], browColor[1], browColor[2]);
  } else {
    // Neutral thin line mouth
    for (let dx = -3; dx <= 3; dx++) {
      fillBlock(data, cx + dx, mY + 1, canvasW, canvasH, faceDark[0], faceDark[1], faceDark[2]);
    }
  }

  // ---- Cheek markings (Majora-style tribal lines) ----
  const markColor = lerpColor(hexToRgb('#6060a0'), hexToRgb('#cc8800'), dayT);
  // Left cheek — two diagonal lines
  fillBlock(data, cx - 6, cy, canvasW, canvasH, markColor[0], markColor[1], markColor[2]);
  fillBlock(data, cx - 7, cy + 1, canvasW, canvasH, markColor[0], markColor[1], markColor[2]);
  fillBlock(data, cx - 5, cy + 1, canvasW, canvasH, markColor[0], markColor[1], markColor[2]);
  fillBlock(data, cx - 6, cy + 2, canvasW, canvasH, markColor[0], markColor[1], markColor[2]);
  // Right cheek — mirror
  fillBlock(data, cx + 6, cy, canvasW, canvasH, markColor[0], markColor[1], markColor[2]);
  fillBlock(data, cx + 7, cy + 1, canvasW, canvasH, markColor[0], markColor[1], markColor[2]);
  fillBlock(data, cx + 5, cy + 1, canvasW, canvasH, markColor[0], markColor[1], markColor[2]);
  fillBlock(data, cx + 6, cy + 2, canvasW, canvasH, markColor[0], markColor[1], markColor[2]);
}

// ---- Circling bird flocks ----
function drawBirdFlocks(
  data: Uint8ClampedArray, canvasW: number, canvasH: number,
  cameraX: number, dayT: number, frame: number,
): void {
  const birdColor = lerpColor(hexToRgb('#101020'), hexToRgb('#2a1a0a'), dayT);
  // 3 flocks, each circling at different positions
  for (let fi = 0; fi < 3; fi++) {
    const centerX = (hash(fi * 31) * LOGICAL_W * 0.6 + 50 + cameraX * (0.02 + fi * 0.01)) % LOGICAL_W;
    const centerY = 40 + fi * 25;
    const flockR = 12 + fi * 4;
    const birdCount = 4 + fi * 2;
    for (let bi = 0; bi < birdCount; bi++) {
      const angle = (frame * 0.02 + bi * (Math.PI * 2 / birdCount)) + fi * 1.5;
      const bx = Math.round(centerX + Math.cos(angle) * flockR);
      const by = Math.round(centerY + Math.sin(angle) * flockR * 0.4);
      if (bx < 0 || bx >= LOGICAL_W - 2 || by < 0 || by >= GROUND_Y) continue;
      // V-shape bird: 3px wide
      const wingUp = Math.sin(frame * 0.3 + bi * 2) > 0;
      fillBlock(data, bx, by, canvasW, canvasH, birdColor[0], birdColor[1], birdColor[2]);
      fillBlock(data, bx - 1, by + (wingUp ? -1 : 0), canvasW, canvasH, birdColor[0], birdColor[1], birdColor[2]);
      fillBlock(data, bx + 1, by + (wingUp ? -1 : 0), canvasW, canvasH, birdColor[0], birdColor[1], birdColor[2]);
    }
  }
}
