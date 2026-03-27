interface EngineOpts {
  threshold?: number;
  vacancy?: number;
  cellSize?: number;
  sweepsPerFrame?: number;
  onTick?: (stats: {
    meanLike: number;
    moves: number;
    occupied: number;
    tick: number;
    unhappyRate: number;
    vacancy: number;
  }) => void;
}

type EvalStats = {
  empties: number[];
  meanLike: number;
  occupied: number;
  unhappy: number[];
  unhappyMask: Uint8Array;
};

const DARK = '#1f1f1f';
const LIGHT = '#b9ad9d';
const EMPTY = '#ebe3d7';
const PAPER = '#f7f3ec';

export function makeEngine(canvas: HTMLCanvasElement, opts: EngineOpts = {}) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const context = ctx;

  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let grid = new Uint8Array(0);
  let raf = 0;
  let running = false;
  let stableFrames = 0;
  let tick = 0;

  const p = {
    cellSize: opts.cellSize ?? 8,
    sweepsPerFrame: opts.sweepsPerFrame ?? 3,
    threshold: opts.threshold ?? 0.34,
    vacancy: opts.vacancy ?? 0.12,
  };

  function index(x: number, y: number) {
    return y * cols + x;
  }

  function inBounds(x: number, y: number) {
    return x >= 0 && x < cols && y >= 0 && y < rows;
  }

  function shuffle(values: number[]) {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
  }

  function getLikeShare(targetIndex: number, type: number) {
    const x = targetIndex % cols;
    const y = Math.floor(targetIndex / cols);
    let occupiedNeighbors = 0;
    let similarNeighbors = 0;

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) {
          continue;
        }

        const nx = x + dx;
        const ny = y + dy;

        if (!inBounds(nx, ny)) {
          continue;
        }

        const neighbor = grid[index(nx, ny)];

        if (neighbor === 0) {
          continue;
        }

        occupiedNeighbors += 1;

        if (neighbor === type) {
          similarNeighbors += 1;
        }
      }
    }

    if (occupiedNeighbors === 0) {
      return 1;
    }

    return similarNeighbors / occupiedNeighbors;
  }

  function evaluate(): EvalStats {
    const unhappyMask = new Uint8Array(grid.length);
    const unhappy: number[] = [];
    const empties: number[] = [];
    let occupied = 0;
    let meanLike = 0;

    for (let i = 0; i < grid.length; i += 1) {
      const type = grid[i];

      if (type === 0) {
        empties.push(i);
        continue;
      }

      occupied += 1;
      const likeShare = getLikeShare(i, type);
      meanLike += likeShare;

      if (likeShare < p.threshold) {
        unhappy.push(i);
        unhappyMask[i] = 1;
      }
    }

    return {
      empties,
      meanLike: occupied > 0 ? meanLike / occupied : 1,
      occupied,
      unhappy,
      unhappyMask,
    };
  }

  function bestDestination(type: number, empties: number[]) {
    if (empties.length === 0) {
      return null;
    }

    const probes = Math.min(48, empties.length);
    let bestSlot = 0;
    let bestLike = -1;

    for (let n = 0; n < probes; n += 1) {
      const slot = Math.floor(Math.random() * empties.length);
      const candidate = empties[slot];
      const likeShare = getLikeShare(candidate, type);

      if (likeShare >= p.threshold) {
        return { candidate, slot };
      }

      if (likeShare > bestLike) {
        bestLike = likeShare;
        bestSlot = slot;
      }
    }

    return { candidate: empties[bestSlot], slot: bestSlot };
  }

  function seed() {
    const total = cols * rows;
    grid = new Uint8Array(total);
    tick = 0;
    stableFrames = 0;

    for (let i = 0; i < total; i += 1) {
      if (Math.random() < p.vacancy) {
        continue;
      }

      grid[i] = Math.random() < 0.5 ? 1 : 2;
    }
  }

  function setup() {
    width = canvas.width;
    height = canvas.height;
    cols = Math.max(12, Math.floor(width / p.cellSize));
    rows = Math.max(12, Math.floor(height / p.cellSize));
    seed();
  }

  function sweep() {
    const snapshot = evaluate();

    if (snapshot.occupied === 0 || snapshot.empties.length === 0) {
      return {
        moves: 0,
        stats: snapshot,
      };
    }

    shuffle(snapshot.unhappy);

    let moves = 0;

    for (const from of snapshot.unhappy) {
      const type = grid[from];

      if (type === 0 || snapshot.empties.length === 0) {
        continue;
      }

      const destination = bestDestination(type, snapshot.empties);

      if (!destination || destination.candidate === from) {
        continue;
      }

      grid[destination.candidate] = type;
      grid[from] = 0;
      snapshot.empties[destination.slot] = from;
      moves += 1;
    }

    return {
      moves,
      stats: evaluate(),
    };
  }

  function render(stats: EvalStats) {
    context.fillStyle = PAPER;
    context.fillRect(0, 0, width, height);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const i = index(x, y);
        const type = grid[i];
        const px = x * p.cellSize;
        const py = y * p.cellSize;
        const size = Math.max(1, p.cellSize - 1);

        if (type === 0) {
          context.fillStyle = EMPTY;
          context.fillRect(px, py, size, size);
          continue;
        }

        context.fillStyle = type === 1 ? DARK : LIGHT;
        context.fillRect(px, py, size, size);

        if (stats.unhappyMask[i]) {
          context.fillStyle = type === 1 ? PAPER : DARK;
          context.fillRect(
            px + p.cellSize * 0.28,
            py + p.cellSize * 0.28,
            Math.max(1, p.cellSize * 0.32),
            Math.max(1, p.cellSize * 0.32)
          );
        }
      }
    }
  }

  function frame() {
    if (!running) {
      return;
    }

    let result = sweep();

    for (let n = 1; n < p.sweepsPerFrame; n += 1) {
      if (result.moves === 0) {
        break;
      }

      result = sweep();
    }

    tick += 1;
    render(result.stats);

    const unhappyRate =
      result.stats.occupied > 0
        ? result.stats.unhappy.length / result.stats.occupied
        : 0;

    if (tick % 6 === 0) {
      opts.onTick?.({
        meanLike: result.stats.meanLike,
        moves: result.moves,
        occupied: result.stats.occupied,
        tick,
        unhappyRate,
        vacancy: 1 - result.stats.occupied / (cols * rows),
      });
    }

    if (result.moves === 0 || unhappyRate < 0.015) {
      stableFrames += 1;
    } else {
      stableFrames = 0;
    }

    if (stableFrames > 120) {
      seed();
    }

    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running) {
      return;
    }

    setup();
    running = true;
    render(evaluate());
    raf = window.requestAnimationFrame(frame);
  }

  function reset(overrides?: Partial<typeof p>) {
    Object.assign(p, overrides);
    seed();
    render(evaluate());
  }

  function cleanup() {
    running = false;
    window.cancelAnimationFrame(raf);
  }

  return {
    cleanup,
    p,
    reset,
    start,
  };
}
