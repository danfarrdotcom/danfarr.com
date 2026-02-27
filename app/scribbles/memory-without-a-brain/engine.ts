const TWO_PI = Math.PI * 2;
const CELL = 5;

// We need to type the options loosely or properly. For now, loose typing.
interface EngineOpts {
  antCount?: number;
  speed?: number;
  evap?: number;
  deposit?: number;
  senseD?: number;
  senseSpread?: number;
  randomness?: number;
  retRandom?: number;
  trailBright?: number;
  showAnts?: boolean;
  dualColor?: boolean;
  followPhero?: boolean;
  nest?: number[];
  setup?: (args: any) => void;
  onTick?: (args: any) => void;
  anneal?: boolean; // added
}

export function makeEngine(canvas: HTMLCanvasElement, opts: EngineOpts = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let W: number, H: number, COLS: number, ROWS: number;
  let pheroHome: Float32Array, pheroFood: Float32Array, walls: Uint8Array;
  let ants: any[] = [],
    foods: any[] = [],
    nest: { cx: number; cy: number };
  let collected = 0,
    tick = 0,
    imgData: ImageData;

  const p: any = {
    antCount: opts.antCount ?? 120,
    speed: opts.speed ?? 1.5,
    evap: opts.evap ?? 0.994,
    deposit: opts.deposit ?? 65,
    senseD: opts.senseD ?? 4,
    senseSpread: opts.senseSpread ?? 0.55,
    randomness: opts.randomness ?? 0.45,
    retRandom: opts.retRandom ?? 0.18,
    trailBright: opts.trailBright ?? 1.6,
    showAnts: opts.showAnts ?? true,
    dualColor: opts.dualColor ?? false,
    followPhero: opts.followPhero ?? true,
    anneal: opts.anneal ?? false,
    annealRate: 0.0,
  };

  function setup() {
    const el = canvas;
    // Use offsetWidth/Height as clientWidth/Height might be 0 if hidden or standard layout quirks
    W = Math.round(canvas.width / CELL) * CELL;
    H = canvas.height;

    // We expect canvas width/height to be set by the caller before setup,
    // or we can try to derive it. In the original code it did derived from parent.
    // Here we assume canvas.width is set correctly.

    COLS = Math.floor(W / CELL);
    ROWS = Math.floor(H / CELL);
    pheroHome = new Float32Array(COLS * ROWS);
    pheroFood = new Float32Array(COLS * ROWS);
    walls = new Uint8Array(COLS * ROWS);
    ants = [];
    foods = [];
    collected = 0;
    tick = 0;
    nest = opts.nest
      ? {
          cx: Math.floor(COLS * opts.nest[0]),
          cy: Math.floor(ROWS * opts.nest[1]),
        }
      : { cx: Math.floor(COLS * 0.14), cy: Math.floor(ROWS * 0.5) };

    if (opts.setup) {
      opts.setup({ placeFood, placeWallRect, COLS, ROWS, nest });
    } else {
      placeFood(Math.floor(COLS * 0.76), Math.floor(ROWS * 0.28), 35);
      placeFood(Math.floor(COLS * 0.8), Math.floor(ROWS * 0.72), 35);
    }
    for (let i = 0; i < p.antCount; i++) spawnAnt();
  }

  function placeFood(cx: number, cy: number, n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TWO_PI,
        r = Math.random() * 3.5;
      const gx = Math.round(cx + Math.cos(a) * r),
        gy = Math.round(cy + Math.sin(a) * r);
      if (inBounds(gx, gy)) foods.push({ gx, gy });
    }
  }

  function placeWallRect(gx: number, gy: number, gw: number, gh: number) {
    for (let y = gy; y < gy + gh; y++)
      for (let x = gx; x < gx + gw; x++)
        if (inBounds(x, y)) walls[idx(x, y)] = 1;
  }

  function spawnAnt() {
    ants.push({
      x: nest.cx * CELL,
      y: nest.cy * CELL,
      angle: Math.random() * TWO_PI,
      hasFood: false,
    });
  }

  const idx = (gx: number, gy: number) => gy * COLS + gx;
  const inBounds = (gx: number, gy: number) =>
    gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS;

  function sense(ant: any, angle: number) {
    const nx = ant.x + Math.cos(angle) * p.senseD * CELL;
    const ny = ant.y + Math.sin(angle) * p.senseD * CELL;
    const gx = Math.floor(nx / CELL),
      gy = Math.floor(ny / CELL);
    if (!inBounds(gx, gy) || walls[idx(gx, gy)]) return -1;
    const i = idx(gx, gy);
    return ant.hasFood ? pheroHome[i] : pheroFood[i];
  }

  function updateAnt(ant: any) {
    const gx = Math.floor(ant.x / CELL),
      gy = Math.floor(ant.y / CELL);
    if (!inBounds(gx, gy)) {
      ant.x = nest.cx * CELL;
      ant.y = nest.cy * CELL;
      ant.hasFood = false;
      return;
    }
    const i = idx(gx, gy);
    if (ant.hasFood) pheroFood[i] = Math.min(255, pheroFood[i] + p.deposit);
    else pheroHome[i] = Math.min(255, pheroHome[i] + p.deposit * 0.85);

    if (!ant.hasFood) {
      for (let f = foods.length - 1; f >= 0; f--) {
        if (
          Math.abs(foods[f].gx - gx) <= 1 &&
          Math.abs(foods[f].gy - gy) <= 1
        ) {
          ant.hasFood = true;
          foods.splice(f, 1);
          break;
        }
      }
    }
    if (ant.hasFood) {
      const dx = nest.cx * CELL - ant.x,
        dy = nest.cy * CELL - ant.y;
      if (dx * dx + dy * dy < (CELL * 2.5) ** 2) {
        ant.hasFood = false;
        collected++;
        ant.angle = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * Math.PI;
      }
    }

    if (p.followPhero) {
      const sp = p.senseSpread;
      const fwd = sense(ant, ant.angle),
        l = sense(ant, ant.angle - sp),
        r = sense(ant, ant.angle + sp);
      const rand = ant.hasFood ? p.retRandom : p.randomness;
      let steer = (Math.random() - 0.5) * rand;
      if (l > fwd && l > r) steer -= sp * 0.45;
      else if (r > fwd && r > l) steer += sp * 0.45;
      ant.angle += steer;
    } else {
      ant.angle += (Math.random() - 0.5) * 0.75;
    }

    const ax = ant.x + Math.cos(ant.angle) * CELL * 2,
      ay = ant.y + Math.sin(ant.angle) * CELL * 2;
    const agx = Math.floor(ax / CELL),
      agy = Math.floor(ay / CELL);
    if (inBounds(agx, agy) && walls[idx(agx, agy)])
      ant.angle += Math.PI * 0.6 + (Math.random() - 0.5);
    if (ant.x < CELL) ant.angle = (Math.random() - 0.5) * Math.PI * 0.5;
    if (ant.x > W - CELL)
      ant.angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.5;
    if (ant.y < CELL)
      ant.angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.5;
    if (ant.y > H - CELL)
      ant.angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.5;
    ant.x += Math.cos(ant.angle) * p.speed;
    ant.y += Math.sin(ant.angle) * p.speed;
  }

  function memLoad() {
    let sum = 0;
    const N = COLS * ROWS;
    for (let i = 0; i < N; i++) sum += pheroHome[i] + pheroFood[i];
    return Math.min(1, sum / (N * 255 * 0.08));
  }

  function render() {
    if (!ctx) return 0;
    if (!imgData || imgData.width !== W || imgData.height !== H)
      imgData = ctx.createImageData(W, H);
    const d = imgData.data;
    const b = p.trailBright;

    for (let gy = 0; gy < ROWS; gy++) {
      for (let gx = 0; gx < COLS; gx++) {
        const ci = idx(gx, gy);
        const ph = pheroHome[ci] / 255,
          pf = pheroFood[ci] / 255;
        for (let dy = 0; dy < CELL; dy++) {
          for (let dx = 0; dx < CELL; dx++) {
            const pi = ((gy * CELL + dy) * W + (gx * CELL + dx)) * 4;
            if (walls[ci]) {
              d[pi] = 28;
              d[pi + 1] = 28;
              d[pi + 2] = 32;
              d[pi + 3] = 255;
            } else if (p.dualColor) {
              d[pi] = Math.min(255, (12 + ph * b * 160 + pf * b * 30) | 0);
              d[pi + 1] = Math.min(255, (12 + ph * b * 80 + pf * b * 80) | 0);
              d[pi + 2] = Math.min(255, (14 + ph * b * 20 + pf * b * 170) | 0);
              d[pi + 3] = 255;
            } else {
              const t = Math.min(1, (ph + pf) * b * 0.65);
              d[pi] = (12 + t * 160) | 0;
              d[pi + 1] = (12 + t * 130) | 0;
              d[pi + 2] = (14 + t * 90) | 0;
              d[pi + 3] = 255;
            }
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // food
    ctx.fillStyle = '#a8d890';
    for (const f of foods) {
      ctx.beginPath();
      ctx.arc(f.gx * CELL + CELL / 2, f.gy * CELL + CELL / 2, 2, 0, TWO_PI);
      ctx.fill();
    }

    // nest
    ctx.strokeStyle = 'rgba(200,169,110,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(nest.cx * CELL, nest.cy * CELL, 10, 0, TWO_PI);
    ctx.stroke();

    if (p.showAnts) {
      for (const ant of ants) {
        ctx.fillStyle = ant.hasFood ? '#5a9e6e' : 'rgba(200,169,110,0.7)';
        ctx.beginPath();
        ctx.arc(ant.x, ant.y, 1.2, 0, TWO_PI);
        ctx.fill();
      }
    }

    return memLoad();
  }

  let running = false;
  let rafId: number;

  function loop() {
    if (!running) return;
    tick++;

    // annealing
    if (p.anneal) {
      p.randomness = Math.max(0.05, p.randomness - p.annealRate);
    }

    while (ants.length < p.antCount) spawnAnt();
    while (ants.length > p.antCount) ants.pop();

    for (const ant of ants) updateAnt(ant);

    if (tick % 2 === 0) {
      for (let i = 0; i < COLS * ROWS; i++) {
        pheroHome[i] *= p.evap;
        pheroFood[i] *= p.evap;
        if (pheroHome[i] < 0.1) pheroHome[i] = 0;
        if (pheroFood[i] < 0.1) pheroFood[i] = 0;
      }
    }

    const ml = render();
    if (opts.onTick) opts.onTick({ tick, foods, ants, collected, memLoad: ml });
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    setup();
    loop();
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }
  function reset() {
    stop();
    start();
  }

  // interaction listeners - these need to be attached by the caller or we attach them to canvas here
  const clickHandler = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    const sx = W / r.width,
      sy = H / r.height;
    placeFood(
      Math.floor(((e.clientX - r.left) * sx) / CELL),
      Math.floor(((e.clientY - r.top) * sy) / CELL),
      25
    );
  };

  const contextMenuHandler = (e: MouseEvent) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const sx = W / r.width,
      sy = H / r.height;
    const gx = Math.floor(((e.clientX - r.left) * sx) / CELL),
      gy = Math.floor(((e.clientY - r.top) * sy) / CELL);
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const wx = gx + dx,
          wy = gy + dy;
        if (inBounds(wx, wy)) walls[idx(wx, wy)] ^= 1;
      }
  };

  canvas.addEventListener('click', clickHandler);
  canvas.addEventListener('contextmenu', contextMenuHandler);

  return {
    start,
    stop,
    reset,
    p,
    get stats() {
      return {
        tick,
        foodCount: foods.length,
        antCount: ants.length,
        collected,
        memLoad: memLoad(),
      };
    },
    clearWalls: () => walls.fill(0),
    clearPhero: () => {
      pheroHome.fill(0);
      pheroFood.fill(0);
    },
    addFood: (n: number) =>
      placeFood(
        Math.floor(Math.random() * COLS * 0.5 + COLS * 0.3),
        Math.floor(Math.random() * ROWS * 0.7 + ROWS * 0.15),
        n || 30
      ),
    loadMaze: () => {
      walls.fill(0);
      placeWallRect(
        Math.floor(COLS * 0.28),
        Math.floor(ROWS * 0.15),
        Math.floor(COLS * 0.28),
        2
      );
      placeWallRect(
        Math.floor(COLS * 0.28),
        Math.floor(ROWS * 0.45),
        Math.floor(COLS * 0.22),
        2
      );
      placeWallRect(
        Math.floor(COLS * 0.28),
        Math.floor(ROWS * 0.75),
        Math.floor(COLS * 0.28),
        2
      );
      placeWallRect(
        Math.floor(COLS * 0.5),
        Math.floor(ROWS * 0.3),
        Math.floor(COLS * 0.18),
        2
      );
      placeWallRect(
        Math.floor(COLS * 0.5),
        Math.floor(ROWS * 0.62),
        Math.floor(COLS * 0.18),
        2
      );
    },
    loadTwoPath: () => {
      walls.fill(0);
      pheroHome.fill(0);
      pheroFood.fill(0);
      const midX = Math.floor(COLS * 0.48);
      const g1s = Math.floor(ROWS * 0.22),
        g1e = g1s + 5;
      const g2s = Math.floor(ROWS * 0.58),
        g2e = g2s + 5;
      for (let y = 0; y < ROWS; y++) {
        if (y < g1s || (y > g1e && y < g2s) || y > g2e)
          if (inBounds(midX, y)) walls[idx(midX, y)] = 1;
      }
      foods.length = 0;
      placeFood(Math.floor(COLS * 0.78), Math.floor(ROWS * 0.5), 60);
    },
    cleanup: () => {
      stop();
      canvas.removeEventListener('click', clickHandler);
      canvas.removeEventListener('contextmenu', contextMenuHandler);
    },
  };
}
