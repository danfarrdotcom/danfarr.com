export type EmojiConfig = {
  lifetime?: number;
  angle?: number;
  decay?: number;
  spread?: number;
  startVelocity?: number;
  elementCount?: number;
  elementSize?: number;
  zIndex?: number;
  position?: string;
  emoji?: string[];
  onAnimationComplete?: () => void;
};

export type AnimateFunctionArgs = {
  root: Element;
  particles: Particles;
  decay: number;
  lifetime: number;
  updateParticle: (particle: Particle, progress: number, decay: number) => void;
  onFinish: () => void;
};

export type AnimateFunction = (config: AnimateFunctionArgs) => void;
export const animate: AnimateFunction = ({
  root,
  particles,
  decay,
  lifetime,
  updateParticle,
  onFinish,
}) => {
  const totalTicks = lifetime;
  let tick = 0;

  const update = () => {
    particles.forEach((particle: Particle) =>
      updateParticle(particle, tick / totalTicks, decay)
    );

    tick += 1;
    if (tick < totalTicks) {
      window.requestAnimationFrame(update);
    } else {
      particles.forEach((particle: Particle) => {
        if (particle.element.parentNode === root) {
          return root.removeChild(particle.element);
        }
      });
      onFinish();
    }
  };

  window.requestAnimationFrame(update);
};

export const { PI } = Math;

export const degreesToRadians = (degrees: number) => degrees * (PI / 180);

export const getRandomInt = (min: number, max: number) => {
  const minVal = Math.ceil(min);
  const maxVal = Math.floor(max);
  return Math.floor(Math.random() * (maxVal - minVal)) + minVal;
};

export const generatePhysics = (
  angle: number,
  spread: number,
  startVelocity: number,
  differentiator: number
) => {
  const radAngle = degreesToRadians(angle);
  const radSpread = degreesToRadians(spread);
  const { random } = Math;
  return {
    x: 0,
    y: 0,
    z: 0,
    height: 0,
    wobble: random() * 10,
    velocity: startVelocity * 0.5 + random() * startVelocity,
    angle2D: -radAngle + (0.5 * radSpread - random() * radSpread),
    angle3D: -(PI / 4) + random() * (PI / 2),
    tiltAngle: random() * PI,
    differentiator,
  };
};

export const getContainerById = (id: string) => {
  const container = document.getElementById(id);
  if (!container) {
    console.error(
      `Element with an ID of ${id} could not be found. Please provide a valid ID.`
    );
  }
  return container;
};
export interface AnimationTailwindClasses {
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
}

export type ParticlePhysics = {
  x: number;
  y: number;
  z: number;
  wobble: number;
  velocity: number;
  angle2D: number;
  angle3D: number;
  tiltAngle: number;
  differentiator: number;
};

export interface Particle {
  element: HTMLSpanElement;
  physics: ParticlePhysics;
}

export type Particles = Particle[];

const defaultEmoji = [
  '🤡',
  '🍦',
  '🍩',
  '🍪',
  '🍫',
  '🍬',
  '🍭',
  '🛸',
  '🐸',
  '🌈',
  '🎨',
  '🍄',
  '🧁',
];
const factors = [-0.6, -0.3, 0, 0.3, 0.6];

const createElements = (
  root: Element,
  elementCount: number,
  elementSize: number,
  zIndex: number,
  position: string,
  emojis: string[]
) =>
  Array.from({ length: elementCount }).map((_, index) => {
    const element = document.createElement('span');
    element.innerHTML = emojis[index % emojis.length];
    element.style.fontSize = `${elementSize + getRandomInt(0, 4)}px`;
    element.style.position = position;
    element.style.zIndex = `${zIndex}`;
    root.appendChild(element);
    return { element, differentiator: getRandomInt(0, factors.length) };
  });

const updateParticle = (
  particle: Particle,
  progress: number,
  decay: number
) => {
  const { x, y, tiltAngle, angle2D, velocity, differentiator, wobble } =
    particle.physics;

  particle.physics.x += Math.cos(angle2D) * velocity;
  particle.physics.y += Math.sin(angle2D) * velocity;
  particle.physics.wobble += 0;
  particle.physics.velocity *= decay;
  particle.physics.y += 5;
  particle.physics.tiltAngle += 0.05;

  const wobbleX =
    x +
    (factors[differentiator] * progress * wobble * wobble +
      20 * Math.sin(wobble / 4));

  particle.element.style.transform = `translate3d(${wobbleX}px, ${y}px, 0) rotate3d(0, 0, 1, ${
    differentiator % 2 ? tiltAngle : -1 * tiltAngle
  }rad)`;

  if (progress > 0.5) {
    particle.element.style.opacity = `${2 - 2 * progress}`;
  }
};

export const emoji = (
  root: Element,
  internalAnimatingCallback: () => void,
  config?: EmojiConfig
) => {
  const options = config || {};
  const {
    elementCount = 20,
    elementSize = 25,
    emoji: emojiArray = defaultEmoji,
    angle = 90,
    spread = 45,
    decay = 0.94,
    lifetime = 200,
    startVelocity = 35,
    zIndex = 0,
    position = 'fixed',
    onAnimationComplete,
  } = options;
  const spanElements = createElements(
    root,
    elementCount,
    elementSize,
    zIndex,
    position,
    emojiArray
  );
  const particles = spanElements.map(({ element, differentiator }) => ({
    element,
    physics: generatePhysics(angle, spread, startVelocity, differentiator),
  }));

  const onFinish = () => {
    if (typeof onAnimationComplete === 'function') {
      onAnimationComplete();
    }
    internalAnimatingCallback();
  };

  animate({
    root,
    particles,
    decay,
    lifetime,
    updateParticle,
    onFinish,
  });
};
