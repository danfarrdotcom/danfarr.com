import { LOGICAL_W, LOGICAL_H, SCALE, GROUND_Y } from './constants';

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Fill the sky portion of the ImageData buffer with a gradient + parallax dunes.
 * This replaces the flat gradient pass in renderer.ts.
 */
export function fillBackground(
  data: Uint8ClampedArray,
  canvasW: number,
  canvasH: number,
  cameraX: number,
): void {
  const skyTop = hexToRgb('#8b3a0f');
  const skyBot = hexToRgb('#d47a3a');
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

  // Parallax dune layers (drawn as horizontal scanlines in the lower sky)
  const duneLayers = [
    { colour: '#7a3a18', yBase: 140, factor: 0.1, amp: 8, freq: 0.02 },
    { colour: '#a05a28', yBase: 155, factor: 0.3, amp: 10, freq: 0.035 },
    { colour: '#b8742a', yBase: 168, factor: 0.6, amp: 6, freq: 0.06 },
  ];

  duneLayers.forEach((layer) => {
    const [lr, lg, lb] = hexToRgb(layer.colour);
    const offsetX = cameraX * layer.factor;

    for (let lx = 0; lx < LOGICAL_W; lx++) {
      const worldX = lx + offsetX;
      const duneY = Math.round(layer.yBase + Math.sin(worldX * layer.freq) * layer.amp);

      for (let ly = duneY; ly < GROUND_Y; ly++) {
        for (let sx = 0; sx < SCALE; sx++) {
          for (let sy = 0; sy < SCALE; sy++) {
            const py = ly * SCALE + sy;
            const px = lx * SCALE + sx;
            if (py >= canvasH || px >= canvasW) continue;
            const idx = (py * canvasW + px) * 4;
            data[idx] = lr; data[idx + 1] = lg; data[idx + 2] = lb; data[idx + 3] = 255;
          }
        }
      }
    }
  });

  // Sun (simple filled circle in pixel blocks)
  const sunLx = Math.round(LOGICAL_W * 0.78);
  const sunLy = 25;
  const sunR = 10;
  const [sr, sg, sb] = hexToRgb('#ffcc44');
  for (let ly = sunLy - sunR; ly <= sunLy + sunR; ly++) {
    for (let lx = sunLx - sunR; lx <= sunLx + sunR; lx++) {
      if ((lx - sunLx) ** 2 + (ly - sunLy) ** 2 > sunR * sunR) continue;
      for (let sx = 0; sx < SCALE; sx++) {
        for (let sy = 0; sy < SCALE; sy++) {
          const py = ly * SCALE + sy;
          const px = lx * SCALE + sx;
          if (py < 0 || py >= canvasH || px < 0 || px >= canvasW) continue;
          const idx = (py * canvasW + px) * 4;
          data[idx] = sr; data[idx + 1] = sg; data[idx + 2] = sb; data[idx + 3] = 255;
        }
      }
    }
  }
}
