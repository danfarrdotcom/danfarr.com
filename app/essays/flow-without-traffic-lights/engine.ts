const TWO_PI = Math.PI * 2;

type Direction = 1 | -1;

interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dir: Direction;
  trail: { x: number; y: number }[];
}

interface EngineOpts {
  pedestrianCount?: number;
  speed?: number;
  separation?: number;
  alignment?: number;
  goalForce?: number;
  noise?: number;
  visualRange?: number;
  separationRange?: number;
  wallMargin?: number;
  wallForce?: number;
  trailLen?: number;
  showTrails?: boolean;
  showAgents?: boolean;
  colorMode?: 'direction' | 'density' | 'mono';
  obstacle?: boolean;
  obstacleRadius?: number;
  setup?: (args: {
    height: number;
    p: Record<string, number | boolean | string>;
    resetAgent: (agent: Agent, dir?: Direction) => void;
    spawnCrowd: (count: number) => void;
    width: number;
  }) => void;
  onTick?: (stats: {
    avgSpeed: number;
    count: number;
    encounterRate: number;
    laneStrength: number;
    tick: number;
  }) => void;
}

export function makeEngine(canvas: HTMLCanvasElement, opts: EngineOpts = {}) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const context = ctx;

  let width = 0;
  let height = 0;
  let agents: Agent[] = [];
  let tick = 0;
  let avgSpeed = 0;
  let encounterRate = 0;
  let laneStrength = 0;
  let raf = 0;

  const p: Record<string, number | boolean | string> = {
    alignment: opts.alignment ?? 0.09,
    colorMode: opts.colorMode ?? 'direction',
    goalForce: opts.goalForce ?? 0.055,
    noise: opts.noise ?? 0.015,
    obstacle: opts.obstacle ?? false,
    obstacleRadius: opts.obstacleRadius ?? 34,
    pedestrianCount: opts.pedestrianCount ?? 180,
    separation: opts.separation ?? 0.24,
    separationRange: opts.separationRange ?? 16,
    showAgents: opts.showAgents ?? true,
    showTrails: opts.showTrails ?? true,
    speed: opts.speed ?? 1.35,
    trailLen: opts.trailLen ?? 18,
    visualRange: opts.visualRange ?? 52,
    wallForce: opts.wallForce ?? 0.12,
    wallMargin: opts.wallMargin ?? 22,
  };

  let grid = new Map<string, Agent[]>();
  const cellSize = 48;

  function limitSpeed(vx: number, vy: number) {
    const maxSpeed = Number(p.speed) * 1.9;
    const minSpeed = Number(p.speed) * 0.55;
    const speed = Math.sqrt(vx * vx + vy * vy);

    if (speed === 0) {
      return {
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      };
    }

    if (speed > maxSpeed) {
      return {
        vx: (vx / speed) * maxSpeed,
        vy: (vy / speed) * maxSpeed,
      };
    }

    if (speed < minSpeed) {
      return {
        vx: (vx / speed) * minSpeed,
        vy: (vy / speed) * minSpeed,
      };
    }

    return { vx, vy };
  }

  function resetAgent(agent: Agent, dir?: Direction) {
    const nextDir = dir ?? agent.dir;
    agent.dir = nextDir;
    agent.x =
      nextDir === 1
        ? -20 - Math.random() * 80
        : width + 20 + Math.random() * 80;
    agent.y = Number(p.wallMargin) + Math.random() * (height - Number(p.wallMargin) * 2);
    agent.vx = nextDir * Number(p.speed);
    agent.vy = (Math.random() - 0.5) * 0.25;
    agent.trail = [];
  }

  function spawnCrowd(count: number) {
    agents = [];

    for (let i = 0; i < count; i += 1) {
      const dir: Direction = i % 2 === 0 ? 1 : -1;
      const agent: Agent = {
        dir,
        trail: [],
        vx: 0,
        vy: 0,
        x: 0,
        y: 0,
      };

      resetAgent(agent, dir);
      agent.x += dir === 1 ? Math.random() * (width * 0.3) : -Math.random() * (width * 0.3);
      agents.push(agent);
    }
  }

  function buildGrid() {
    grid = new Map();

    for (const agent of agents) {
      const key = `${Math.floor(agent.x / cellSize)},${Math.floor(agent.y / cellSize)}`;
      const bucket = grid.get(key);

      if (bucket) {
        bucket.push(agent);
      } else {
        grid.set(key, [agent]);
      }
    }
  }

  function getNeighbors(agent: Agent, range: number) {
    const cx = Math.floor(agent.x / cellSize);
    const cy = Math.floor(agent.y / cellSize);
    const rangeSquared = range * range;
    const result: Agent[] = [];

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const bucket = grid.get(`${cx + dx},${cy + dy}`);

        if (!bucket) {
          continue;
        }

        for (const other of bucket) {
          if (other === agent) {
            continue;
          }

          const ox = other.x - agent.x;
          const oy = other.y - agent.y;

          if (ox * ox + oy * oy < rangeSquared) {
            result.push(other);
          }
        }
      }
    }

    return result;
  }

  function setup() {
    width = canvas.width;
    height = canvas.height;
    tick = 0;

    if (opts.setup) {
      opts.setup({
        height,
        p,
        resetAgent,
        spawnCrowd,
        width,
      });
    } else {
      spawnCrowd(Number(p.pedestrianCount));
    }
  }

  function updateAgent(agent: Agent) {
    const neighbors = getNeighbors(agent, Number(p.visualRange));
    const closeNeighbors = neighbors.filter((other) => {
      const dx = other.x - agent.x;
      const dy = other.y - agent.y;

      return dx * dx + dy * dy < Number(p.separationRange) * Number(p.separationRange);
    });

    let sepX = 0;
    let sepY = 0;

    for (const other of closeNeighbors) {
      const dx = other.x - agent.x;
      const dy = other.y - agent.y;
      const distSquared = dx * dx + dy * dy || 1;
      sepX -= dx / distSquared;
      sepY -= dy / distSquared;
    }

    let alignX = 0;
    let alignY = 0;
    let sameDirCount = 0;

    for (const other of neighbors) {
      if (other.dir !== agent.dir) {
        continue;
      }

      alignX += other.vx;
      alignY += other.vy;
      sameDirCount += 1;
    }

    if (sameDirCount > 0) {
      alignX = alignX / sameDirCount - agent.vx;
      alignY = alignY / sameDirCount - agent.vy;
    }

    let obstacleX = 0;
    let obstacleY = 0;

    if (p.obstacle) {
      const cx = width * 0.5;
      const cy = height * 0.5;
      const dx = agent.x - cx;
      const dy = agent.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const reach = Number(p.obstacleRadius) + 26;

      if (dist < reach) {
        const push = (reach - dist) / reach;
        obstacleX += (dx / dist) * push * 0.65;
        obstacleY += (dy / dist) * push * 0.65;
      }
    }

    const goalX = agent.dir * Number(p.speed) - agent.vx;
    const goalY = -agent.vy * 0.22;
    const noiseAngle = Math.random() * TWO_PI;
    const noiseAmp = Number(p.noise);
    const wallMargin = Number(p.wallMargin);
    const wallForce = Number(p.wallForce);

    let wallY = 0;

    if (agent.y < wallMargin) {
      wallY += wallForce;
    }

    if (agent.y > height - wallMargin) {
      wallY -= wallForce;
    }

    agent.vx +=
      sepX * Number(p.separation) +
      alignX * Number(p.alignment) +
      goalX * Number(p.goalForce) +
      obstacleX +
      Math.cos(noiseAngle) * noiseAmp;
    agent.vy +=
      sepY * Number(p.separation) +
      alignY * Number(p.alignment) +
      goalY * Number(p.goalForce) +
      obstacleY +
      wallY +
      Math.sin(noiseAngle) * noiseAmp;

    const limited = limitSpeed(agent.vx, agent.vy);
    agent.vx = limited.vx;
    agent.vy = limited.vy;

    if (agent.dir === 1 && agent.vx < Number(p.speed) * 0.2) {
      agent.vx += 0.08;
    }

    if (agent.dir === -1 && agent.vx > -Number(p.speed) * 0.2) {
      agent.vx -= 0.08;
    }

    agent.x += agent.vx;
    agent.y += agent.vy;

    if (p.showTrails) {
      agent.trail.push({ x: agent.x, y: agent.y });

      if (agent.trail.length > Number(p.trailLen)) {
        agent.trail.shift();
      }
    }

    if (agent.dir === 1 && agent.x > width + 24) {
      resetAgent(agent, 1);
    } else if (agent.dir === -1 && agent.x < -24) {
      resetAgent(agent, -1);
    }

    if (agent.y < 6 || agent.y > height - 6) {
      agent.y = Math.max(6, Math.min(height - 6, agent.y));
      agent.vy *= -0.35;
    }
  }

  function computeStats() {
    let speedSum = 0;
    let encounters = 0;
    const bands = 12;
    const posCounts = new Array<number>(bands).fill(0);
    const negCounts = new Array<number>(bands).fill(0);

    for (const agent of agents) {
      speedSum += Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);

      const band = Math.max(0, Math.min(bands - 1, Math.floor((agent.y / height) * bands)));

      if (agent.dir === 1) {
        posCounts[band] += 1;
      } else {
        negCounts[band] += 1;
      }

      const nearby = getNeighbors(agent, Number(p.separationRange) * 1.35);
      const oppositeNearby = nearby.some((other) => other.dir !== agent.dir);

      if (oppositeNearby) {
        encounters += 1;
      }
    }

    let laneScore = 0;
    let laneWeight = 0;

    for (let i = 0; i < bands; i += 1) {
      const total = posCounts[i] + negCounts[i];

      if (total === 0) {
        continue;
      }

      laneScore += (Math.abs(posCounts[i] - negCounts[i]) / total) * total;
      laneWeight += total;
    }

    avgSpeed = agents.length > 0 ? speedSum / agents.length : 0;
    encounterRate = agents.length > 0 ? encounters / agents.length : 0;
    laneStrength = laneWeight > 0 ? laneScore / laneWeight : 0;
  }

  function densityAt(agent: Agent) {
    return Math.min(1, getNeighbors(agent, Number(p.visualRange) * 0.7).length / 10);
  }

  function render() {
    context.fillStyle = '#f7f3ec';
    context.fillRect(0, 0, width, height);

    context.fillStyle = '#e8dfd0';
    context.fillRect(0, 0, width, 4);
    context.fillRect(0, height - 4, width, 4);

    if (p.obstacle) {
      context.fillStyle = '#d8cec0';
      context.beginPath();
      context.arc(width * 0.5, height * 0.5, Number(p.obstacleRadius), 0, TWO_PI);
      context.fill();
    }

    if (p.showTrails) {
      for (const agent of agents) {
        if (agent.trail.length < 2) {
          continue;
        }

        context.strokeStyle =
          agent.dir === 1 ? 'rgba(34, 77, 125, 0.12)' : 'rgba(145, 77, 42, 0.12)';
        context.lineWidth = 1.2;
        context.beginPath();
        context.moveTo(agent.trail[0].x, agent.trail[0].y);

        for (let i = 1; i < agent.trail.length; i += 1) {
          context.lineTo(agent.trail[i].x, agent.trail[i].y);
        }

        context.stroke();
      }
    }

    if (!p.showAgents) {
      return;
    }

    for (const agent of agents) {
      if (p.colorMode === 'density') {
        const density = densityAt(agent);
        const tone = Math.round(245 - density * 150);
        context.fillStyle = `rgb(${tone}, ${tone - 12}, ${tone - 20})`;
      } else if (p.colorMode === 'mono') {
        context.fillStyle = '#222222';
      } else {
        context.fillStyle = agent.dir === 1 ? '#1e4c80' : '#8c532e';
      }

      context.beginPath();
      context.arc(agent.x, agent.y, 2.8, 0, TWO_PI);
      context.fill();
    }
  }

  function step() {
    buildGrid();

    for (const agent of agents) {
      updateAgent(agent);
    }

    buildGrid();
    computeStats();
  }

  function frame() {
    step();
    tick += 1;
    render();

    if (tick % 6 === 0) {
      opts.onTick?.({
        avgSpeed,
        count: agents.length,
        encounterRate,
        laneStrength,
        tick,
      });
    }

    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    setup();
    render();
    raf = window.requestAnimationFrame(frame);
  }

  function reset(overrides?: Partial<typeof p>) {
    Object.assign(p, overrides);
    spawnCrowd(Number(p.pedestrianCount));
    render();
  }

  function cleanup() {
    window.cancelAnimationFrame(raf);
  }

  return {
    cleanup,
    p,
    reset,
    start,
  };
}
