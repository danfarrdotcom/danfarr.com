export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

let particles: Particle[] = [];

export function spawnBurst(x: number, y: number, count: number, color: string): void {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 3,
      vy: -Math.random() * 2 - 0.5,
      life: 30 + Math.random() * 30,
      maxLife: 60,
      color, size: 1 + Math.random(),
    });
  }
}

export function spawnSparkle(x: number, y: number): void {
  const colors = ['#ffe066', '#ffffff', '#ffcc44'];
  for (let i = 0; i < 6; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 1,
      life: 20 + Math.random() * 20,
      maxLife: 40,
      color: colors[i % colors.length], size: 1.5,
    });
  }
}

export function updateParticles(): void {
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.05;
    p.life--;
  }
  particles = particles.filter(p => p.life > 0);
}

export function getParticles(): Particle[] { return particles; }

export function clearParticles(): void { particles = []; }
