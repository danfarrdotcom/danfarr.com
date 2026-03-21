export type ConnectionSign = 'excitatory' | 'inhibitory';
export type MotorId = 'left' | 'right' | 'single';

export type BraitenbergSource = {
  id: string;
  x: number;
  y: number;
  strength: number;
  spread: number;
};

export type BraitenbergSensor = {
  id: string;
  angleOffset: number;
  distance: number;
  gain: number;
};

export type BraitenbergMotor = {
  id: MotorId;
  gain: number;
  min: number;
  max: number;
};

export type BraitenbergConnection = {
  sensorId: string;
  motorId: MotorId;
  sign: ConnectionSign;
  weight: number;
};

export type BraitenbergVehicleConfig = {
  startX: number;
  startY: number;
  startHeading: number;
  radius: number;
  baseSpeed: number;
  speedScale: number;
  turnRate: number;
  friction: number;
  noise: number;
  sensors: BraitenbergSensor[];
  motors: BraitenbergMotor[];
  connections: BraitenbergConnection[];
};

export type BraitenbergWorldConfig = {
  width: number;
  height: number;
  ambient: number;
  fieldScale: number;
  trailLength: number;
  sources: BraitenbergSource[];
};

export type BraitenbergEngineConfig = {
  vehicle: BraitenbergVehicleConfig;
  world: BraitenbergWorldConfig;
  showSensors?: boolean;
  showTrail?: boolean;
};

type RuntimeVehicle = {
  x: number;
  y: number;
  heading: number;
  speed: number;
};

type TrailPoint = {
  x: number;
  y: number;
};

const TAU = Math.PI * 2;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function cloneSources(sources: BraitenbergSource[]) {
  return sources.map((source) => ({ ...source }));
}

function createDefaultVehicle(config: BraitenbergVehicleConfig): RuntimeVehicle {
  return {
    x: config.startX,
    y: config.startY,
    heading: config.startHeading,
    speed: 0,
  };
}

function drawSourceGlyph(ctx: CanvasRenderingContext2D, source: BraitenbergSource) {
  ctx.save();
  ctx.translate(source.x, source.y);
  ctx.strokeStyle = 'rgba(24, 24, 24, 0.9)';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 0.95;

  if (source.strength >= 0) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 5.6, Math.sin(angle) * 5.6);
      ctx.lineTo(Math.cos(angle) * 9.5, Math.sin(angle) * 9.5);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 4.1, 0, TAU);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, 5.2, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3.5, 0);
    ctx.lineTo(3.5, 0);
    ctx.stroke();
  }

  ctx.restore();
}

function drawVehicleGlyph(
  ctx: CanvasRenderingContext2D,
  vehicle: RuntimeVehicle,
  radius: number
) {
  ctx.save();
  ctx.translate(vehicle.x, vehicle.y);
  ctx.rotate(vehicle.heading);
  ctx.strokeStyle = 'rgba(24, 24, 24, 0.92)';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 0.95;

  ctx.strokeRect(-radius * 0.84, -radius * 0.54, radius * 1.68, radius * 1.08);

  ctx.beginPath();
  ctx.arc(-radius * 0.55, -radius * 0.78, radius * 0.18, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(radius * 0.55, -radius * 0.78, radius * 0.18, 0, TAU);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(radius * 0.84, 0);
  ctx.lineTo(radius * 1.44, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(radius * 1.58, 0, radius * 0.12, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

export class BraitenbergEngine {
  private readonly config: BraitenbergEngineConfig;
  private readonly vehicle: RuntimeVehicle;
  private trail: TrailPoint[] = [];
  private sensorReadings: Record<string, number> = {};
  private motorOutputs: Record<string, number> = {};

  constructor(config: BraitenbergEngineConfig) {
    this.config = {
      ...config,
      vehicle: {
        ...config.vehicle,
        sensors: config.vehicle.sensors.map((sensor) => ({ ...sensor })),
        motors: config.vehicle.motors.map((motor) => ({ ...motor })),
        connections: config.vehicle.connections.map((connection) => ({
          ...connection,
        })),
      },
      world: {
        ...config.world,
        sources: cloneSources(config.world.sources),
      },
      showSensors: config.showSensors ?? true,
      showTrail: config.showTrail ?? true,
    };
    this.vehicle = createDefaultVehicle(this.config.vehicle);
    this.reset();
  }

  reset() {
    this.vehicle.x = this.config.vehicle.startX;
    this.vehicle.y = this.config.vehicle.startY;
    this.vehicle.heading = this.config.vehicle.startHeading;
    this.vehicle.speed = 0;
    this.trail = [{ x: this.vehicle.x, y: this.vehicle.y }];
    this.sensorReadings = {};
    this.motorOutputs = {};
  }

  setShowTrail(value: boolean) {
    this.config.showTrail = value;
  }

  setNoise(value: number) {
    this.config.vehicle.noise = value;
  }

  setFriction(value: number) {
    this.config.vehicle.friction = value;
  }

  setFieldScale(value: number) {
    this.config.world.fieldScale = value;
  }

  setSensorGain(sensorId: string, value: number) {
    const sensor = this.config.vehicle.sensors.find(
      (candidate) => candidate.id === sensorId
    );

    if (sensor) {
      sensor.gain = value;
    }
  }

  setMotorGain(motorId: MotorId, value: number) {
    const motor = this.config.vehicle.motors.find(
      (candidate) => candidate.id === motorId
    );

    if (motor) {
      motor.gain = value;
    }
  }

  setSources(sources: BraitenbergSource[]) {
    this.config.world.sources = cloneSources(sources);
  }

  getSources() {
    return cloneSources(this.config.world.sources);
  }

  movePrimaryWarmSource(x: number, y: number) {
    const existing = this.config.world.sources.find(
      (source) => source.strength > 0
    );

    if (existing) {
      existing.x = clamp(x, 24, this.config.world.width - 24);
      existing.y = clamp(y, 24, this.config.world.height - 24);
      return;
    }

    this.addSource({
      id: `source-${Date.now()}`,
      x,
      y,
      strength: 0.88,
      spread: 120,
    });
  }

  addSource(source: BraitenbergSource) {
    this.config.world.sources.push({
      ...source,
      x: clamp(source.x, 24, this.config.world.width - 24),
      y: clamp(source.y, 24, this.config.world.height - 24),
    });
  }

  removeNearestSource(x: number, y: number, threshold = 48) {
    let bestIndex = -1;
    let bestDistance = threshold;

    this.config.world.sources.forEach((source, index) => {
      const distance = Math.hypot(source.x - x, source.y - y);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    if (bestIndex >= 0) {
      this.config.world.sources.splice(bestIndex, 1);
    }
  }

  sampleField(x: number, y: number) {
    const { ambient, fieldScale, sources } = this.config.world;
    let value = ambient;

    for (const source of sources) {
      const distanceSquared = (x - source.x) ** 2 + (y - source.y) ** 2;
      const spreadSquared = source.spread ** 2;
      value +=
        source.strength *
        fieldScale *
        Math.exp(-distanceSquared / (2 * spreadSquared));
    }

    return clamp(value, 0, 1);
  }

  step(delta = 1) {
    for (const sensor of this.config.vehicle.sensors) {
      const sensorHeading = this.vehicle.heading + sensor.angleOffset;
      const sensorX = this.vehicle.x + Math.cos(sensorHeading) * sensor.distance;
      const sensorY = this.vehicle.y + Math.sin(sensorHeading) * sensor.distance;
      const reading = clamp(
        this.sampleField(sensorX, sensorY) * sensor.gain,
        0,
        1.6
      );

      this.sensorReadings[sensor.id] = reading;
    }

    for (const motor of this.config.vehicle.motors) {
      let drive = this.config.vehicle.baseSpeed;

      for (const connection of this.config.vehicle.connections) {
        if (connection.motorId !== motor.id) {
          continue;
        }

        const reading = this.sensorReadings[connection.sensorId] ?? 0;
        const signed =
          connection.sign === 'excitatory' ? reading : -reading;
        drive += signed * connection.weight;
      }

      this.motorOutputs[motor.id] = clamp(
        drive * motor.gain,
        motor.min,
        motor.max
      );
    }

    const noiseTerm =
      (Math.random() - 0.5) * this.config.vehicle.noise * 0.32 * delta;

    if (this.config.vehicle.motors.length === 1) {
      const output = this.motorOutputs.single ?? 0;
      const targetSpeed = output * this.config.vehicle.speedScale;

      this.vehicle.speed += (targetSpeed - this.vehicle.speed) * 0.14 * delta;
      this.vehicle.speed *= 1 - this.config.vehicle.friction * 0.18 * delta;
      this.vehicle.heading += noiseTerm;
    } else {
      const left = this.motorOutputs.left ?? 0;
      const right = this.motorOutputs.right ?? 0;
      const targetSpeed =
        ((left + right) / 2) * this.config.vehicle.speedScale;
      const turn =
        (right - left) * this.config.vehicle.turnRate * 0.08 * delta;

      this.vehicle.speed += (targetSpeed - this.vehicle.speed) * 0.16 * delta;
      this.vehicle.speed *= 1 - this.config.vehicle.friction * 0.14 * delta;
      this.vehicle.heading += turn + noiseTerm;
    }

    let nextX =
      this.vehicle.x + Math.cos(this.vehicle.heading) * this.vehicle.speed * delta;
    let nextY =
      this.vehicle.y + Math.sin(this.vehicle.heading) * this.vehicle.speed * delta;
    const padding = this.config.vehicle.radius + 6;

    if (nextX <= padding || nextX >= this.config.world.width - padding) {
      this.vehicle.heading = Math.PI - this.vehicle.heading;
      nextX = clamp(nextX, padding, this.config.world.width - padding);
    }

    if (nextY <= padding || nextY >= this.config.world.height - padding) {
      this.vehicle.heading = -this.vehicle.heading;
      nextY = clamp(nextY, padding, this.config.world.height - padding);
    }

    this.vehicle.heading %= TAU;
    this.vehicle.x = nextX;
    this.vehicle.y = nextY;
    this.trail.push({ x: this.vehicle.x, y: this.vehicle.y });

    if (this.trail.length > this.config.world.trailLength) {
      this.trail.shift();
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const { width, height, sources } = this.config.world;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    for (const source of sources) {
      drawSourceGlyph(ctx, source);
    }

    if (this.config.showTrail && this.trail.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);

      for (let index = 1; index < this.trail.length - 1; index++) {
        const current = this.trail[index];
        const next = this.trail[index + 1];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, midX, midY);
      }

      const last = this.trail[this.trail.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.setLineDash([2.6, 3.2]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(24, 24, 24, 0.72)';
      ctx.lineWidth = 0.95;
      ctx.stroke();
      ctx.restore();
    }

    if (this.config.showSensors) {
      ctx.save();
      ctx.setLineDash([1.5, 4]);
      ctx.strokeStyle = 'rgba(28, 25, 23, 0.34)';
      ctx.lineWidth = 0.8;

      for (const sensor of this.config.vehicle.sensors) {
        const sensorHeading = this.vehicle.heading + sensor.angleOffset;
        const sensorX = this.vehicle.x + Math.cos(sensorHeading) * sensor.distance;
        const sensorY = this.vehicle.y + Math.sin(sensorHeading) * sensor.distance;

        ctx.beginPath();
        ctx.moveTo(this.vehicle.x, this.vehicle.y);
        ctx.lineTo(sensorX, sensorY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sensorX, sensorY, 3.5, 0, TAU);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    drawVehicleGlyph(ctx, this.vehicle, this.config.vehicle.radius);
  }

  getTelemetry() {
    return {
      speed: this.vehicle.speed,
      field: this.sampleField(this.vehicle.x, this.vehicle.y),
      sensorReadings: { ...this.sensorReadings },
      motorOutputs: { ...this.motorOutputs },
      sourceCount: this.config.world.sources.length,
    };
  }
}

export function createVehicleOneConfig(
  width = 720,
  height = 320
): BraitenbergEngineConfig {
  return {
    showSensors: false,
    showTrail: true,
    vehicle: {
      startX: width * 0.18,
      startY: height * 0.58,
      startHeading: -0.2,
      radius: 10,
      baseSpeed: 0.08,
      speedScale: 5.8,
      turnRate: 1.8,
      friction: 0.08,
      noise: 0.12,
      sensors: [
        {
          id: 'front',
          angleOffset: 0,
          distance: 18,
          gain: 1,
        },
      ],
      motors: [
        {
          id: 'single',
          gain: 1,
          min: 0.02,
          max: 1.2,
        },
      ],
      connections: [
        {
          sensorId: 'front',
          motorId: 'single',
          sign: 'excitatory',
          weight: 0.72,
        },
      ],
    },
    world: {
      width,
      height,
      ambient: 0.18,
      fieldScale: 1,
      trailLength: 420,
      sources: [
        {
          id: 'warm-1',
          x: width * 0.72,
          y: height * 0.34,
          strength: 0.85,
          spread: 110,
        },
      ],
    },
  };
}

export function createSource(
  id: string,
  x: number,
  y: number,
  strength: number,
  spread: number
) {
  return { id, x, y, strength, spread };
}
