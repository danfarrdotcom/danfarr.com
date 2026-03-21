const TWO_PI = Math.PI * 2;

interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  hue: number;
  turnRate: number; // per-bird jitter for visual diversity
}

interface Predator {
  x: number;
  y: number;
  vx: number;
  vy: number;
  target: Bird | null;
}

interface EngineOpts {
  birdCount?: number;
  maxSpeed?: number;
  minSpeed?: number;
  separation?: number;
  alignment?: number;
  cohesion?: number;
  visualRange?: number;
  separationRange?: number;
  edgeMargin?: number;
  edgeTurn?: number;
  trailLen?: number;
  showTrails?: boolean;
  showBirds?: boolean;
  colorMode?: 'heading' | 'speed' | 'density' | 'mono';
  predator?: boolean;
  predatorSpeed?: number;
  predatorAvoid?: number;
  predatorRange?: number;
  wavePulse?: boolean;
  setup?: (args: any) => void;
  onTick?: (args: any) => void;
}

export function makeEngine(canvas: HTMLCanvasElement, opts: EngineOpts = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let W: number, H: number;
  let birds: Bird[] = [];
  let predators: Predator[] = [];
  let tick = 0;
  let globalOrder = 0;
  let avgSpeed = 0;
  let avgDensity = 0;

  const p: any = {
    birdCount: opts.birdCount ?? 300,
    maxSpeed: opts.maxSpeed ?? 4,
    minSpeed: opts.minSpeed ?? 2,
    separation: opts.separation ?? 2.5,
    alignment: opts.alignment ?? 0.06,
    cohesion: opts.cohesion ?? 0.005,
    visualRange: opts.visualRange ?? 60,
    separationRange: opts.separationRange ?? 20,
    edgeMargin: opts.edgeMargin ?? 80,
    edgeTurn: opts.edgeTurn ?? 0.35,
    trailLen: opts.trailLen ?? 8,
    showTrails: opts.showTrails ?? true,
    showBirds: opts.showBirds ?? true,
    colorMode: opts.colorMode ?? 'heading',
    predator: opts.predator ?? false,
    predatorSpeed: opts.predatorSpeed ?? 4.5,
    predatorAvoid: opts.predatorAvoid ?? 12,
    predatorRange: opts.predatorRange ?? 120,
    wavePulse: opts.wavePulse ?? false,
  };

  function setup() {
    W = canvas.width;
    H = canvas.height;
    birds = [];
    predators = [];
    tick = 0;

    if (opts.setup) {
      opts.setup({ p, W, H, spawnFlock, spawnPredator });
    } else {
      spawnFlock(p.birdCount, W / 2, H / 2, Math.min(W, H) * 0.3);
    }

    if (p.predator && predators.length === 0) {
      spawnPredator(W * 0.1, H * 0.1);
    }
  }

  function spawnFlock(count: number, cx: number, cy: number, radius: number) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TWO_PI;
      const r = Math.random() * radius;
      const speed = p.minSpeed + Math.random() * (p.maxSpeed - p.minSpeed);
      const dir = Math.random() * TWO_PI;
      birds.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        vx: Math.cos(dir) * speed,
        vy: Math.sin(dir) * speed,
        trail: [],
        hue: 200 + Math.random() * 40, // blue-ish base
        turnRate: 0.8 + Math.random() * 0.4,
      });
    }
  }

  function spawnPredator(x: number, y: number) {
    predators.push({
      x,
      y,
      vx: (Math.random() - 0.5) * p.predatorSpeed,
      vy: (Math.random() - 0.5) * p.predatorSpeed,
      target: null,
    });
  }

  function limitSpeed(vx: number, vy: number, max: number, min: number) {
    const s = Math.sqrt(vx * vx + vy * vy);
    if (s === 0) return { vx: Math.random() - 0.5, vy: Math.random() - 0.5 };
    if (s > max) return { vx: (vx / s) * max, vy: (vy / s) * max };
    if (s < min) return { vx: (vx / s) * min, vy: (vy / s) * min };
    return { vx, vy };
  }

  // Spatial hash for O(n) neighbor queries
  let grid: Map<string, Bird[]>;
  const cellSize = 70; // slightly larger than visualRange

  function buildGrid() {
    grid = new Map();
    for (const b of birds) {
      const key = `${Math.floor(b.x / cellSize)},${Math.floor(b.y / cellSize)}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key)!.push(b);
    }
  }

  function getNeighbors(bird: Bird, range: number): Bird[] {
    const cx = Math.floor(bird.x / cellSize);
    const cy = Math.floor(bird.y / cellSize);
    const r2 = range * range;
    const result: Bird[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cell = grid.get(`${cx + dx},${cy + dy}`);
        if (!cell) continue;
        for (const other of cell) {
          if (other === bird) continue;
          const ddx = other.x - bird.x;
          const ddy = other.y - bird.y;
          if (ddx * ddx + ddy * ddy < r2) result.push(other);
        }
      }
    }
    return result;
  }

  function updateBird(bird: Bird) {
    const neighbors = getNeighbors(bird, p.visualRange);
    const closeNeighbors = neighbors.filter((n) => {
      const dx = n.x - bird.x;
      const dy = n.y - bird.y;
      return dx * dx + dy * dy < p.separationRange * p.separationRange;
    });

    // Separation: steer away from close neighbors
    let sepX = 0,
      sepY = 0;
    for (const n of closeNeighbors) {
      sepX -= n.x - bird.x;
      sepY -= n.y - bird.y;
    }

    // Alignment: match velocity of visible neighbors
    let alignX = 0,
      alignY = 0;
    if (neighbors.length > 0) {
      for (const n of neighbors) {
        alignX += n.vx;
        alignY += n.vy;
      }
      alignX = alignX / neighbors.length - bird.vx;
      alignY = alignY / neighbors.length - bird.vy;
    }

    // Cohesion: steer toward center of visible neighbors
    let cohX = 0,
      cohY = 0;
    if (neighbors.length > 0) {
      let cx = 0,
        cy = 0;
      for (const n of neighbors) {
        cx += n.x;
        cy += n.y;
      }
      cx /= neighbors.length;
      cy /= neighbors.length;
      cohX = cx - bird.x;
      cohY = cy - bird.y;
    }

    // Predator avoidance
    let predX = 0,
      predY = 0;
    for (const pred of predators) {
      const dx = pred.x - bird.x;
      const dy = pred.y - bird.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < p.predatorRange * p.predatorRange && d2 > 0) {
        const d = Math.sqrt(d2);
        predX -= (dx / d) * p.predatorAvoid * (1 - d / p.predatorRange);
        predY -= (dy / d) * p.predatorAvoid * (1 - d / p.predatorRange);
      }
    }

    // Apply forces
    bird.vx +=
      sepX * p.separation + alignX * p.alignment + cohX * p.cohesion + predX;
    bird.vy +=
      sepY * p.separation + alignY * p.alignment + cohY * p.cohesion + predY;

    // Edge avoidance (soft boundary)
    const m = p.edgeMargin;
    const t = p.edgeTurn;
    if (bird.x < m) bird.vx += t;
    if (bird.x > W - m) bird.vx -= t;
    if (bird.y < m) bird.vy += t;
    if (bird.y > H - m) bird.vy -= t;

    // Speed limits
    const lim = limitSpeed(bird.vx, bird.vy, p.maxSpeed, p.minSpeed);
    bird.vx = lim.vx;
    bird.vy = lim.vy;

    // Update position
    bird.x += bird.vx;
    bird.y += bird.vy;

    // Trail
    if (p.showTrails) {
      bird.trail.push({ x: bird.x, y: bird.y });
      if (bird.trail.length > p.trailLen) bird.trail.shift();
    }
  }

  function updatePredator(pred: Predator) {
    // Chase nearest bird
    let nearDist = Infinity;
    let nearBird: Bird | null = null;
    for (const b of birds) {
      const dx = b.x - pred.x;
      const dy = b.y - pred.y;
      const d = dx * dx + dy * dy;
      if (d < nearDist) {
        nearDist = d;
        nearBird = b;
      }
    }

    if (nearBird) {
      const dx = nearBird.x - pred.x;
      const dy = nearBird.y - pred.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0) {
        pred.vx += (dx / d) * 0.3;
        pred.vy += (dy / d) * 0.3;
      }
    }

    // Speed limit
    const lim = limitSpeed(
      pred.vx,
      pred.vy,
      p.predatorSpeed,
      p.predatorSpeed * 0.5
    );
    pred.vx = lim.vx;
    pred.vy = lim.vy;

    // Edge wrapping for predator
    const m = p.edgeMargin * 0.5;
    const t = p.edgeTurn * 1.5;
    if (pred.x < m) pred.vx += t;
    if (pred.x > W - m) pred.vx -= t;
    if (pred.y < m) pred.vy += t;
    if (pred.y > H - m) pred.vy -= t;

    pred.x += pred.vx;
    pred.y += pred.vy;
  }

  function computeOrder(): number {
    if (birds.length === 0) return 0;
    let svx = 0,
      svy = 0,
      totalSpeed = 0;
    for (const b of birds) {
      svx += b.vx;
      svy += b.vy;
      totalSpeed += Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    }
    if (totalSpeed === 0) return 0;
    const magnitude = Math.sqrt(svx * svx + svy * svy);
    return magnitude / totalSpeed; // 0 = random headings, 1 = perfect alignment
  }

  function computeAvgSpeed(): number {
    if (birds.length === 0) return 0;
    let total = 0;
    for (const b of birds) total += Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    return total / birds.length;
  }

  function computeDensity(): number {
    if (birds.length === 0) return 0;
    let totalNeighbors = 0;
    for (const b of birds) {
      totalNeighbors += getNeighbors(b, p.visualRange).length;
    }
    return totalNeighbors / birds.length;
  }

  function render() {
    if (!ctx) return;
    // Semi-transparent black for motion blur / trail fade
    ctx.fillStyle = p.showTrails ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, W, H);

    // Draw trails
    if (p.showTrails) {
      for (const bird of birds) {
        if (bird.trail.length < 2) continue;
        const heading = Math.atan2(bird.vy, bird.vx);
        const hue = getHue(bird, heading);
        ctx.beginPath();
        ctx.moveTo(bird.trail[0].x, bird.trail[0].y);
        for (let i = 1; i < bird.trail.length; i++) {
          ctx.lineTo(bird.trail[i].x, bird.trail[i].y);
        }
        ctx.strokeStyle = `hsla(${hue}, 55%, 60%, 0.3)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Draw birds
    if (p.showBirds) {
      for (const bird of birds) {
        const heading = Math.atan2(bird.vy, bird.vx);
        const speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
        const hue = getHue(bird, heading);
        const size = 2.5 + speed * 0.2;

        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(heading);

        // Bird as a tiny wedge
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.5, size * 0.45);
        ctx.lineTo(-size * 0.3, 0);
        ctx.lineTo(-size * 0.5, -size * 0.45);
        ctx.closePath();
        ctx.fillStyle = `hsl(${hue}, 50%, 70%)`;
        ctx.fill();

        ctx.restore();
      }
    }

    // Draw predators
    for (const pred of predators) {
      ctx.save();
      ctx.translate(pred.x, pred.y);
      const heading = Math.atan2(pred.vy, pred.vx);
      ctx.rotate(heading);

      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-5, 4);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-5, -4);
      ctx.closePath();
      ctx.fillStyle = '#e55';
      ctx.fill();

      // Danger ring
      ctx.beginPath();
      ctx.arc(0, 0, p.predatorRange, 0, TWO_PI);
      ctx.strokeStyle = 'rgba(255,80,80,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  function getHue(bird: Bird, heading: number): number {
    switch (p.colorMode) {
      case 'heading':
        return ((heading / TWO_PI) * 360 + 360) % 360;
      case 'speed': {
        const speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
        const t = (speed - p.minSpeed) / (p.maxSpeed - p.minSpeed);
        return 200 + t * 60; // blue to purple
      }
      case 'density': {
        const neighbors = getNeighbors(bird, p.visualRange);
        const t = Math.min(1, neighbors.length / 15);
        return 200 - t * 160; // blue to warm
      }
      case 'mono':
      default:
        return bird.hue;
    }
  }

  let running = false;
  let rafId: number;

  function loop() {
    if (!running) return;
    tick++;

    buildGrid();

    // Maintain bird count
    while (birds.length < p.birdCount)
      spawnFlock(1, W / 2, H / 2, Math.min(W, H) * 0.2);
    while (birds.length > p.birdCount) birds.pop();

    for (const bird of birds) updateBird(bird);
    for (const pred of predators) updatePredator(pred);

    render();

    if (tick % 15 === 0) {
      globalOrder = computeOrder();
      avgSpeed = computeAvgSpeed();
      avgDensity = computeDensity();
    }

    if (opts.onTick)
      opts.onTick({
        tick,
        birds,
        predators,
        order: globalOrder,
        avgSpeed,
        avgDensity,
        birdCount: birds.length,
      });

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;

    // Set canvas dimensions from parent if available
    const parent = canvas.parentElement;
    if (parent && canvas.width < 10) {
      canvas.width = parent.clientWidth;
    }

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

  // Click adds a burst that scatters nearby birds (like a predator flash)
  const clickHandler = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    const sx = W / r.width;
    const sy = H / r.height;
    const mx = (e.clientX - r.left) * sx;
    const my = (e.clientY - r.top) * sy;
    // Scatter birds near click
    const scatterR = 100;
    for (const bird of birds) {
      const dx = bird.x - mx;
      const dy = bird.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < scatterR * scatterR && d2 > 0) {
        const d = Math.sqrt(d2);
        bird.vx += (dx / d) * 6;
        bird.vy += (dy / d) * 6;
      }
    }
  };

  canvas.addEventListener('click', clickHandler);

  return {
    start,
    stop,
    reset,
    p,
    get stats() {
      return {
        tick,
        birdCount: birds.length,
        order: globalOrder,
        avgSpeed,
        avgDensity,
      };
    },
    addPredator: () => {
      spawnPredator(
        Math.random() * W * 0.3 + W * 0.1,
        Math.random() * H * 0.3 + H * 0.1
      );
    },
    removePredators: () => {
      predators.length = 0;
    },
    scatter: () => {
      for (const bird of birds) {
        bird.vx += (Math.random() - 0.5) * 8;
        bird.vy += (Math.random() - 0.5) * 8;
      }
    },
    cleanup: () => {
      stop();
      canvas.removeEventListener('click', clickHandler);
    },
  };
}
