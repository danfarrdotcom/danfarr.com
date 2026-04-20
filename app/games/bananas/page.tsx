'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { BananaSoundtrack } from '@/lib/bananas/soundtrack';

interface Vec {
  x: number;
  y: number;
}
interface Person {
  x: number;
  y: number;
  vx: number;
  dir: 1 | -1;
  hit: boolean;
  fallAngle: number;
  fallVy: number;
  skin: number;
  frame: number;
  frameTimer: number;
  sheltering: boolean;
  shelterX: number;
  shelterTimer: number;
  movingTicket: boolean;
  ticketTimer: number;
  ticketX: number;
  bubble: string;
  bubbleTimer: number;
  seekingLaptop: boolean;
  hasFile: boolean;
  escaping: boolean;
}
interface Banana {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  active: boolean;
}
interface Drag {
  start: Vec;
  current: Vec;
}
interface Splat {
  x: number;
  y: number;
  timer: number;
}
interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}
interface Obstacle {
  x: number;
  w: number;
  h: number;
  type: string;
}
interface Ticket {
  x: number;
  y: number;
  col: string;
  moving: boolean;
}

const SPEECH = [
  "Let's sync up",
  'Per my last email',
  'Circle back',
  'Quick standup',
  'Move the needle',
  'Low-hanging fruit',
  'Action items?',
  'Blocked!',
  'Ping me',
  'Are there any quick wins?',
  'Where can I find the requirements?',
  'Can we get this in the backlog?',
  'Does this meet the definition of ready?',
  'Can we put a pin in this?',
  "Let's not reinvent the wheel",
  'Story points?',
  'Sprint review',
  'Can you see my screen?',
  "Let's table this",
  "Let's take this offline",
  'Sounds like we need a deep dive',
  'Bandwidth?',
  'Pivot!',
  'Ship it!',
  'LGTM',
  "Let's move retro to next week",
  'Velocity check',
  'Scope creep!',
  'EOD pls',
];

const W = 1920,
  H = 1200;
const FLOOR = H - 450;
const GRAVITY = 0.32;
const POWER_MULT = 0.18;
const MAX_POWER = 350;
const COOLDOWN_MS = 280;
const SPAWN_INTERVAL = 3200;
const PX = 8;

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

// --- SPRITES ---
const WALK_A = [
  '......HHHH......',
  '....HHHHHHHH....',
  '....HSSESESSH....',
  '....SSSSSSSS.....',
  '.....SSMMSS.....',
  '......SSSS......',
  '....CCCTCCCC....',
  '...CCCCCCCCCC...',
  '..SCCCCCCCCCCS..',
  '..S.CCCCCCCC.S..',
  '..S..BBBBBB..S..',
  '.SS..PPPPPP..SS.',
  '.S...PPPPPP...S.',
  '.....PP..PP.....',
  '....PP....PP....',
  '....PP.....PP...',
  '...OO......OO...',
  '...OOO....OOO...',
  '...OOOO..OOOO...',
];
const WALK_B = [
  '......HHHH......',
  '....HHHHHHHH....',
  '....HSSESESSH....',
  '....SSSSSSSS....',
  '.....SSMMSS.....',
  '......SSSS......',
  '....CCCTCCCC....',
  '...CCCCCCCCCC...',
  '.SCCCCCCCCCCCCS.',
  '.S..CCCCCCCC..S.',
  '..S..BBBBBB..S..',
  '.....PPPPPP.....',
  '.....PPPPPP.....',
  '......PP.PP.....',
  '....PP...PP.....',
  '...PP.....PP....',
  '...OO.....OO....',
  '...OOO...OOO....',
  '...OOOO..OOOO...',
];
const HIT_SPRITE = [
  '......HHHH......',
  '....HHHHHHHH....',
  '....HXXSSXXH....',
  '....SSSSSSSS....',
  '.....SOOOOSS....',
  '......SSSS......',
  '....CCCTCCCC....',
  '...CCCCCCCCCC...',
  '..SCCCCCCCCCCS..',
  '..S.CCCCCCCC.S..',
  '..S..BBBBBB..S..',
  '.SS..PPPPPP..SS.',
  '.S...PPPPPP...S.',
  '.....PPPPPP.....',
  '....PP....PP....',
  '...OOO...OOO....',
  '...OOOO..OOOO...',
];
const CROUCH = [
  '......HHHH......',
  '....HHHHHHHH....',
  '....HSSEESSH....',
  '....SSSSSSSS....',
  '.....SSMMSS.....',
  '....CCCTCCCC....',
  '...CCCCCCCCCC...',
  '..SCCCCCCCCCCS..',
  '..S..BBBBBB..S..',
  '.SS..PPPPPP..SS.',
  '.....PPPPPP.....',
  '....OOOO.OOOO...',
];
// Carrying a ticket — arm raised
const CARRY = [
  '..........YYYY..',
  '......HHHH..YY..',
  '....HHHHHHHH....',
  '....HSSEESSH....',
  '....SSSSSSSS.....',
  '.....SSMMSS.....',
  '......SSSS......',
  '....CCCTCCCCS...',
  '...CCCCCCCCCC.S.',
  '..SCCCCCCCCC..S.',
  '..S.CCCCCCCC....',
  '..S..BBBBBB.....',
  '.SS..PPPPPP..SS.',
  '.S...PP..PP...S.',
  '.....PP..PP.....',
  '....PP....PP....',
  '...OO......OO...',
  '...OOO....OOO...',
  '...OOOO..OOOO...',
];

const SKINS = [
  {
    H: '#3a2518',
    S: '#fdbcb4',
    C: '#2563eb',
    T: '#dc2626',
    P: '#1e293b',
    O: '#111',
    E: '#111',
    B: '#4a3728',
    M: '#c0392b',
    X: '#ff0',
    Y: '#fbbf24',
  },
  {
    H: '#111',
    S: '#d4a574',
    C: '#dc2626',
    T: '#fbbf24',
    P: '#374151',
    O: '#222',
    E: '#111',
    B: '#333',
    M: '#a93226',
    X: '#ff0',
    Y: '#fb923c',
  },
  {
    H: '#8B4513',
    S: '#fdbcb4',
    C: '#16a34a',
    T: '#111',
    P: '#1e3a5f',
    O: '#1a1a1a',
    E: '#111',
    B: '#5a4a3a',
    M: '#c0392b',
    X: '#ff0',
    Y: '#4ade80',
  },
  {
    H: '#c0392b',
    S: '#f5cba7',
    C: '#7c3aed',
    T: '#e5e7eb',
    P: '#1f2937',
    O: '#222',
    E: '#111',
    B: '#444',
    M: '#a93226',
    X: '#ff0',
    Y: '#c084fc',
  },
  {
    H: '#f59e0b',
    S: '#fdbcb4',
    C: '#ea580c',
    T: '#1e40af',
    P: '#292524',
    O: '#111',
    E: '#111',
    B: '#3a3028',
    M: '#c0392b',
    X: '#ff0',
    Y: '#38bdf8',
  },
  {
    H: '#1a1a1a',
    S: '#d4a574',
    C: '#0d9488',
    T: '#fbbf24',
    P: '#1c1917',
    O: '#333',
    E: '#111',
    B: '#333',
    M: '#a93226',
    X: '#ff0',
    Y: '#f472b6',
  },
];
const CHAR_MAP: Record<string, string> = {
  H: 'H',
  S: 'S',
  C: 'C',
  T: 'T',
  P: 'P',
  O: 'O',
  E: 'E',
  B: 'B',
  M: 'M',
  X: 'X',
  Y: 'Y',
};
const BANANA_SPRITE = [
  '..........BB....',
  '.........BYY....',
  '........YYYY....',
  '.......YYYYY....',
  '......YYYYY.....',
  '.....YYYYY......',
  '....YYYYY.......',
  '...YYYYY........',
  '...YYYY.........',
  '....YYY.........',
  '.....YY.........',
];

const SPRITE_H = WALK_A.length * PX;
const SPRITE_W = 16 * PX;
const CROUCH_H = CROUCH.length * PX;

const OBSTACLES: Obstacle[] = [
  { x: 180, w: 100, h: 120, type: 'copier' },
  { x: 480, w: 90, h: 100, type: 'plant' },
  { x: 780, w: 110, h: 110, type: 'cabinet' },
  { x: 1080, w: 90, h: 100, type: 'bin' },
  { x: 1380, w: 100, h: 120, type: 'copier' },
  { x: 1650, w: 90, h: 100, type: 'plant' },
];

// Central desk config
const DESK_X = W / 2 - 100,
  DESK_Y = FLOOR - 80,
  DESK_W = 200,
  DESK_H = 80;

// Kanban board config
const BOARD_X = 120,
  BOARD_Y = 200,
  BOARD_W = 1680,
  BOARD_H = 260;
const COLS = ['TO DO', 'DOING', 'REVIEW', 'DONE'];
const COL_W = BOARD_W / COLS.length;
const TICKET_COLORS = [
  '#ffe135',
  '#ffb700',
  '#ff8c00',
  '#4ade80',
  '#22c55e',
  '#fb923c',
  '#fbbf24',
];

function initTickets(): Ticket[] {
  const t: Ticket[] = [];
  for (let i = 0; i < 12; i++) {
    const ci = Math.floor(Math.random() * COLS.length);
    t.push({
      x: BOARD_X + ci * COL_W + 10 + Math.random() * (COL_W - 40),
      y: BOARD_Y + 30 + Math.random() * (BOARD_H - 55),
      col: TICKET_COLORS[Math.floor(Math.random() * TICKET_COLORS.length)],
      moving: false,
    });
  }
  return t;
}

const excuses = [
  'Yesterday I mass-updated Jira tickets so it looks like I did something. Today: same. No blockers.',
  "I investigated why tests pass locally but not in CI. Today I'll investigate again. Blocked by the concept of time.",
  "I attended a 3-hour 'quick sync'. Today I'll attend another one. Blocked by meetings about meetings.",
  "I refactored the refactor of the refactor. Today I'll refactor it again. No blockers, just regret.",
  "I attended 6 meetings about why we're not shipping. Today: 7 meetings. Blocked by meetings.",
  'I stared at a PR review until it approved itself. Today: same strategy. No blockers, just denial.',
  "I moved tickets from 'To Do' to 'Doing' and back. Today I'll add a third column. Blocked by indecision.",
  'I Googled the same Stack Overflow answer for the 4th time. Today will be the 5th. No blockers.',
  "I pretended to understand the architecture diagram. Today I'll nod more confidently. Blocked by the architecture.",
  "I wrote a Confluence doc nobody will read. Today I'll write another. No blockers, just futility.",
  "I estimated a 2-point story at 13 points for padding. Today I'll estimate lunch. No blockers, just strategy.",
  'I debugged CSS for 6 hours. Today: hour 7. Blocked by CSS.',
  "I asked 'can everyone see my screen?' 14 times. Today I'll aim for 15. No blockers.",
];

function ExcuseGenerator() {
  const [excuse, setExcuse] = useState('');
  return (
    <div className="max-w-2xl mx-auto p-8 bg-[#1a1a2e] rounded-2xl border-2 border-[#1a1a2e] text-yellow-400">
      <h2 className="text-3xl font-bold text-center">
        🎰 Standup Excuse Generator
      </h2>
      <p className="text-center text-yellow-400/60 mt-1">
        For when you forgot what you did yesterday
      </p>
      <p className="text-center text-lg mt-4 min-h-[3rem] text-white">
        {excuse}
      </p>
      <button
        onClick={() =>
          setExcuse(excuses[Math.floor(Math.random() * excuses.length)])
        }
        className="block mx-auto mt-4 px-8 py-3 bg-yellow-400 text-[#1a1a2e] rounded-lg text-xl font-bold cursor-pointer hover:scale-105 transition-transform"
      >
        🍌 Generate Excuse
      </button>
    </div>
  );
}

function Game() {
  const [showIntro, setShowIntro] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const soundtrack = useRef<BananaSoundtrack | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const people = useRef<Person[]>([]);
  const bananas = useRef<Banana[]>([]);
  const splats = useRef<Splat[]>([]);
  const tickets = useRef<Ticket[]>(initTickets());
  const drag = useRef<Drag | null>(null);
  const score = useRef(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const lastSpawn = useRef(0);
  const animRef = useRef(0);
  const deadline = useRef(90); // seconds
  const deadlineTimer = useRef(Date.now());
  const [gameOver, setGameOver] = useState(false);
  const shakeOffset = useRef<Vec>({ x: 0, y: 0 });
  const shakeIntensity = useRef(0);
  const fireParticles = useRef<FireParticle[]>([]);
  const lastFireTime = useRef(0);

  const DEADLINE_LABELS = [
    { at: 90, msg: 'CYCLE KICKED OFF' },
    { at: 60, msg: 'STANDUP IN 60s' },
    { at: 30, msg: 'DEADLINE APPROACHING' },
    { at: 15, msg: 'PM TYPING...' },
    { at: 10, msg: 'JIRA BOARD LOADING' },
    { at: 5, msg: 'WAITING FOR PO APPROVAL' },
    { at: 0, msg: 'SPRINT OVER 💀' },
  ];

  const spawnPerson = useCallback(() => {
    const fromLeft = Math.random() > 0.5;
    people.current.push({
      x: fromLeft ? -SPRITE_W : W + 20,
      y: FLOOR - SPRITE_H + 6,
      vx: rand(0.5, 1.6) * (fromLeft ? 1 : -1),
      dir: fromLeft ? 1 : -1,
      hit: false,
      fallAngle: 0,
      fallVy: 0,
      skin: Math.floor(Math.random() * SKINS.length),
      frame: 0,
      frameTimer: 0,
      sheltering: false,
      shelterX: 0,
      shelterTimer: 0,
      movingTicket: false,
      ticketTimer: 0,
      ticketX: 0,
      bubble: '',
      bubbleTimer: 0,
      seekingLaptop: Math.random() > 0.3,
      hasFile: false,
      escaping: false,
    });
  }, []);

  const getCanvasPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent): Vec => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const cx =
        'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const cy =
        'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      return {
        x: (cx - rect.left) * (W / rect.width),
        y: (cy - rect.top) * (H / rect.height),
      };
    },
    []
  );
  const mouseX = useRef(W / 2);
  const mouseY = useRef(H - 180);
  const throwing = useRef(false);
  const throwAnim = useRef(0);
  const lastThrowAngle = useRef(0);

  const onDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (gameOver) {
        // Reset
        score.current = 0;
        setScoreDisplay(0);
        setGameOver(false);
        people.current = [];
        bananas.current = [];
        splats.current = [];
        fireParticles.current = [];
        shakeIntensity.current = 0;
        lastFireTime.current = 0;
        deadlineTimer.current = Date.now();
        return;
      }
      const pos = getCanvasPos(e);
      if (!drag.current) {
        mouseX.current = pos.x;
      }
      drag.current = { start: pos, current: pos };
    },
    [getCanvasPos, gameOver]
  );
  const onMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const pos = getCanvasPos(e);
      if (!drag.current) {
        mouseX.current = pos.x;
        mouseY.current = pos.y;
      } else {
        drag.current.current = pos;
      }
    },
    [getCanvasPos]
  );
  const onUp = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (!drag.current) return;
    const now = Date.now();
    if (now - lastFireTime.current < COOLDOWN_MS) {
      drag.current = null;
      return;
    }
    const d = drag.current;
    const dx = d.start.x - d.current.x,
      dy = d.start.y - d.current.y;
    const power = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_POWER);
    if (power > 15) {
      const a = Math.atan2(dy, dx);
      const vx = Math.cos(a) * power * POWER_MULT;
      const vy = Math.sin(a) * power * POWER_MULT;
      const spawnX = mouseX.current;
      const spawnY = H - 180 - 30;
      bananas.current.push({
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        angle: 0,
        active: true,
      });
      throwing.current = true;
      throwAnim.current = 12;
      lastThrowAngle.current = a;
      lastFireTime.current = now;
      // Spawn fire particles
      for (let i = 0; i < 8; i++) {
        const spread = (Math.random() - 0.5) * 0.8;
        fireParticles.current.push({
          x: spawnX,
          y: spawnY,
          vx: Math.cos(a + spread) * power * 0.04 + (Math.random() - 0.5) * 3,
          vy: Math.sin(a + spread) * power * 0.04 + (Math.random() - 0.5) * 3,
          life: 15 + Math.random() * 10,
          size: 3 + Math.random() * 5,
        });
      }
      // Recoil shake
      shakeIntensity.current = Math.min(power * 0.02, 4);
    }
    drag.current = null;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (soundtrack.current) {
        soundtrack.current.volume = m ? 0.25 : 0;
      }
      return !m;
    });
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setShowIntro(false);
    // Start soundtrack
    if (!soundtrack.current) {
      soundtrack.current = new BananaSoundtrack();
    }
    soundtrack.current.volume = 0.25;
    soundtrack.current.start();
    // Reset game state when starting
    score.current = 0;
    setScoreDisplay(0);
    deadline.current = 90;
    deadlineTimer.current = Date.now();
    setGameOver(false);
    people.current = [];
    bananas.current = [];
    splats.current = [];
    fireParticles.current = [];
    shakeIntensity.current = 0;
    lastFireTime.current = 0;
    tickets.current = initTickets();
    lastSpawn.current = 0;
  }, []);

  const proceedToGame = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    if (!gameStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    function px(
      sprite: string[],
      skin: (typeof SKINS)[0],
      x: number,
      y: number,
      flip: boolean
    ) {
      for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
          const ch = sprite[r][c];
          if (ch === '.') continue;
          const k = CHAR_MAP[ch];
          if (!k) continue;
          const col = skin[k as keyof typeof skin];
          if (!col) continue;
          ctx!.fillStyle = col;
          ctx!.fillRect(
            flip ? x + (sprite[r].length - 1 - c) * PX : x + c * PX,
            y + r * PX,
            PX,
            PX
          );
        }
      }
    }

    function drawDesk() {
      // Desk surface
      ctx!.fillStyle = '#8B4513';
      ctx!.fillRect(DESK_X, DESK_Y, DESK_W, DESK_H);
      ctx!.strokeStyle = '#222';
      ctx!.lineWidth = 3;
      ctx!.strokeRect(DESK_X, DESK_Y, DESK_W, DESK_H);

      // Desk legs
      ctx!.fillStyle = '#654321';
      ctx!.fillRect(DESK_X + 10, DESK_Y + DESK_H, 15, 40);
      ctx!.fillRect(DESK_X + DESK_W - 25, DESK_Y + DESK_H, 15, 40);

      // Laptop
      const laptopX = DESK_X + 50;
      const laptopY = DESK_Y - 15;

      // Laptop base
      ctx!.fillStyle = '#333';
      ctx!.fillRect(laptopX, laptopY + 10, 100, 60);
      ctx!.strokeStyle = '#222';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(laptopX, laptopY + 10, 100, 60);

      // Laptop screen
      ctx!.fillStyle = '#444';
      ctx!.fillRect(laptopX + 5, laptopY - 40, 90, 50);
      ctx!.strokeStyle = '#222';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(laptopX + 5, laptopY - 40, 90, 50);

      // Screen content
      ctx!.fillStyle = '#1e40af';
      ctx!.fillRect(laptopX + 10, laptopY - 35, 80, 40);
      ctx!.fillStyle = '#fff';
      ctx!.font = '8px monospace';
      ctx!.fillText('CONFIDENTIAL', laptopX + 20, laptopY - 20);
      ctx!.fillText('FILES', laptopX + 30, laptopY - 10);

      // Some papers scattered on desk
      ctx!.fillStyle = '#fff';
      ctx!.fillRect(DESK_X + 20, DESK_Y + 10, 25, 15);
      ctx!.fillRect(DESK_X + 160, DESK_Y + 20, 25, 15);
      ctx!.strokeStyle = '#ddd';
      ctx!.lineWidth = 1;
      ctx!.strokeRect(DESK_X + 20, DESK_Y + 10, 25, 15);
      ctx!.strokeRect(DESK_X + 160, DESK_Y + 20, 25, 15);

      // Bananas on desk
      const bananaPositions = [
        { x: 15, y: 35 },
        { x: 170, y: 45 },
        { x: 85, y: 50 },
      ];

      for (const pos of bananaPositions) {
        const bx = DESK_X + pos.x;
        const by = DESK_Y + pos.y;

        // Draw banana
        ctx!.save();
        ctx!.translate(bx, by);
        const bs = 2;
        for (let r = 0; r < BANANA_SPRITE.length; r++) {
          for (let c = 0; c < BANANA_SPRITE[r].length; c++) {
            const ch = BANANA_SPRITE[r][c];
            if (ch === '.') continue;
            ctx!.fillStyle = ch === 'Y' ? '#ffe135' : '#8B6914';
            ctx!.fillRect(c * bs, r * bs, bs, bs);
          }
        }
        ctx!.restore();
      }
    }

    function drawBoard() {
      // Board — bold black outline like the mascot sticker
      ctx!.fillStyle = '#fff';
      ctx!.fillRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H);
      ctx!.strokeStyle = '#222';
      ctx!.lineWidth = 5;
      ctx!.strokeRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H);
      for (let i = 0; i < COLS.length; i++) {
        const cx = BOARD_X + i * COL_W;
        if (i > 0) {
          ctx!.fillStyle = '#222';
          ctx!.fillRect(cx, BOARD_Y, 3, BOARD_H);
        }
        // Bold header bg
        ctx!.fillStyle = '#ffe135';
        ctx!.fillRect(
          cx + (i > 0 ? 3 : 0),
          BOARD_Y,
          COL_W - (i > 0 ? 3 : 0),
          28
        );
        ctx!.fillStyle = '#222';
        ctx!.font = 'bold 20px monospace';
        ctx!.fillText(COLS[i], cx + 14, BOARD_Y + 21);
        ctx!.fillStyle = '#222';
        ctx!.fillRect(cx, BOARD_Y + 28, COL_W, 2);
      }
      for (const t of tickets.current) {
        // Bold outlined tickets like the mascot's board
        ctx!.fillStyle = t.col;
        ctx!.fillRect(t.x, t.y, 32, 20);
        ctx!.strokeStyle = '#222';
        ctx!.lineWidth = 2;
        ctx!.strokeRect(t.x, t.y, 32, 20);
        ctx!.fillStyle = 'rgba(0,0,0,0.25)';
        ctx!.fillRect(t.x + 4, t.y + 5, 20, 3);
        ctx!.fillRect(t.x + 4, t.y + 12, 14, 3);
      }
    }

    function drawObstacle(o: Obstacle) {
      const y = FLOOR - o.h;
      if (o.type === 'copier') {
        ctx.fillStyle = '#e5e5e5';
        ctx.fillRect(o.x, y, o.w, o.h);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.strokeRect(o.x, y, o.w, o.h);
        ctx.fillStyle = '#bbb';
        ctx.fillRect(o.x + 8, y + 14, o.w - 16, 30);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(o.x + o.w - 18, y + 18, 6, 6);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(o.x + 12, y + 55, o.w - 24, 12);
      } else if (o.type === 'plant') {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(o.x + 16, FLOOR - 50, 58, 50);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.strokeRect(o.x + 16, FLOOR - 50, 58, 50);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(o.x + 4, FLOOR - 80, 82, 35);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(o.x + 14, FLOOR - 100, 62, 28);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.strokeRect(o.x + 4, FLOOR - 80, 82, 35);
      } else if (o.type === 'cabinet') {
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(o.x, y, o.w, o.h);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.strokeRect(o.x, y, o.w, o.h);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(o.x + 6, y + 10, o.w - 12, 30);
        ctx.fillRect(o.x + 6, y + 48, o.w - 12, 30);
        ctx.fillStyle = '#ffe135';
        ctx.fillRect(o.x + o.w / 2 - 6, y + 20, 12, 6);
        ctx.fillRect(o.x + o.w / 2 - 6, y + 58, 12, 6);
      } else if (o.type === 'bin') {
        ctx.fillStyle = '#555';
        ctx.fillRect(o.x + 12, FLOOR - 70, 66, 70);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.strokeRect(o.x + 12, FLOOR - 70, 66, 70);
        ctx.fillStyle = '#444';
        ctx.fillRect(o.x + 8, FLOOR - 76, 74, 10);
      }
    }

    function drawOffice() {
      // Warm yellow-toned wall like the mascot's palette
      ctx.fillStyle = '#fff8dc';
      ctx.fillRect(0, 0, W, FLOOR);
      // Bold black baseboard
      ctx.fillStyle = '#222';
      ctx.fillRect(0, FLOOR - 10, W, 10);
      // Warm wood floor
      ctx.fillStyle = '#d4a24e';
      ctx.fillRect(0, FLOOR, W, H - FLOOR);
      for (let x = 0; x < W; x += 64) {
        ctx.fillStyle = x % 128 === 0 ? '#c4923e' : '#d4a24e';
        ctx.fillRect(x, FLOOR, 64, H - FLOOR);
        // Plank lines
        ctx.strokeStyle = '#b8862e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, FLOOR);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      // Ceiling lights with warm glow
      for (let i = 0; i < 6; i++) {
        const lx = 80 + i * 310;
        ctx.fillStyle = '#333';
        ctx.fillRect(lx, 0, 90, 8);
        ctx.fillStyle = '#ffe135';
        ctx.fillRect(lx + 5, 8, 80, 5);
        // Glow
        ctx.fillStyle = 'rgba(255,225,53,0.08)';
        ctx.beginPath();
        ctx.moveTo(lx - 30, 0);
        ctx.lineTo(lx + 120, 0);
        ctx.lineTo(lx + 80, 120);
        ctx.lineTo(lx + 10, 120);
        ctx.fill();
      }
    }

    function loop() {
      const now = Date.now();

      // Screen shake decay
      if (shakeIntensity.current > 0.1) {
        shakeOffset.current = {
          x: (Math.random() - 0.5) * shakeIntensity.current * 2,
          y: (Math.random() - 0.5) * shakeIntensity.current * 2,
        };
        shakeIntensity.current *= 0.85;
      } else {
        shakeOffset.current = { x: 0, y: 0 };
        shakeIntensity.current = 0;
      }

      ctx.save();
      ctx.translate(shakeOffset.current.x, shakeOffset.current.y);

      ctx.clearRect(-10, -10, W + 20, H + 20);
      drawOffice();
      drawDesk();
      drawBoard();

      // Randomly move a ticket
      if (Math.random() < 0.003) {
        const t =
          tickets.current[Math.floor(Math.random() * tickets.current.length)];
        if (!t.moving) {
          t.moving = true;
          const newCol = Math.floor(Math.random() * COLS.length);
          t.x = BOARD_X + newCol * COL_W + 10 + Math.random() * (COL_W - 40);
          t.y = BOARD_Y + 30 + Math.random() * (BOARD_H - 55);
          setTimeout(() => {
            t.moving = false;
          }, 500);
        }
      }

      if (!gameOver && now - lastSpawn.current > SPAWN_INTERVAL) {
        spawnPerson();
        lastSpawn.current = now;
      }

      // Splats
      splats.current = splats.current.filter((s) => {
        s.timer--;
        ctx.globalAlpha = s.timer / 40;
        ctx.fillStyle = '#ffe135';
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + s.timer * 0.05;
          ctx.fillRect(s.x + Math.cos(a) * 15, s.y + Math.sin(a) * 12, 6, 6);
        }
        ctx.globalAlpha = 1;
        return s.timer > 0;
      });

      // People
      people.current = people.current.filter((p) => {
        if (p.hit) {
          p.fallAngle = Math.min(p.fallAngle + 5, 90);
          p.fallVy += 0.3;
          p.y += p.fallVy;
          if (p.y > H + 50) return false;
        } else {
          // Random speech bubbles
          if (p.bubbleTimer > 0) p.bubbleTimer--;
          if (p.bubbleTimer <= 0 && Math.random() < 0.005) {
            p.bubble = SPEECH[Math.floor(Math.random() * SPEECH.length)];
            p.bubbleTimer = 120;
          }

          // Behavior logic
          const deskCenter = DESK_X + DESK_W / 2;
          const distanceToDesk = Math.abs(p.x + SPRITE_W / 2 - deskCenter);

          // Laptop seeking behavior (some people)
          if (p.seekingLaptop && !p.hasFile) {
            // Move towards the desk
            const dx = deskCenter - (p.x + SPRITE_W / 2);
            if (Math.abs(dx) > 5) {
              p.x += Math.sign(dx) * 1.2;
              p.dir = dx > 0 ? 1 : -1;
              p.vx = Math.sign(dx) * 1.2;
            } else if (distanceToDesk < 50) {
              // Reached the desk - grab a file!
              p.hasFile = true;
              p.escaping = true;
              p.seekingLaptop = false;
              p.bubble = 'Scrum banana!';
              p.bubbleTimer = 60;
            }
          } else if (p.escaping && p.hasFile) {
            // Try to escape to either side
            const escapeLeft = p.x < deskCenter;
            const escapeDirection = escapeLeft ? -1 : 1;
            p.x += escapeDirection * 1.5;
            p.dir = escapeDirection;
            p.vx = escapeDirection * 1.5;

            // If they escape far enough, they win (reduce score)
            if (
              (escapeLeft && p.x < -SPRITE_W) ||
              (!escapeLeft && p.x > W + SPRITE_W)
            ) {
              score.current = Math.max(0, score.current - 50);
              setScoreDisplay(score.current);
              return false; // Remove person
            }
          } else {
            // Ticket moving behavior
            if (!p.sheltering && !p.movingTicket && Math.random() < 0.004) {
              const boardCenter = BOARD_X + BOARD_W / 2;
              if (Math.abs(p.x - boardCenter) < 300) {
                p.movingTicket = true;
                p.ticketTimer = Math.floor(rand(60, 140));
                p.ticketX = BOARD_X + Math.random() * (BOARD_W - 60) + 30;
              }
            }
            if (p.movingTicket) {
              const dx = p.ticketX - (p.x + SPRITE_W / 2);
              if (Math.abs(dx) > 3) {
                p.x += Math.sign(dx) * 1;
                p.dir = dx > 0 ? 1 : -1;
              }
              p.ticketTimer--;
              if (p.ticketTimer <= 0) {
                p.movingTicket = false;
              }
            } else if (!p.sheltering) {
              for (const o of OBSTACLES) {
                if (
                  Math.abs(p.x + SPRITE_W / 2 - (o.x + o.w / 2)) < 80 &&
                  Math.random() < 0.08
                ) {
                  p.sheltering = true;
                  p.shelterX = o.x + o.w / 2 - SPRITE_W / 2;
                  p.shelterTimer = Math.floor(rand(120, 300));
                  p.bubble = 'Are you blocked?';
                  p.bubbleTimer = 40;
                  break;
                }
              }
            }
            if (p.sheltering) {
              const dx = p.shelterX - p.x;
              if (Math.abs(dx) > 2) {
                p.x += Math.sign(dx) * 1.2;
                p.dir = dx > 0 ? 1 : -1;
              }
              p.shelterTimer--;
              if (p.shelterTimer <= 0) {
                p.sheltering = false;
                // p.bubble = 'Back to work!';
                p.bubbleTimer = 30;
              }
            } else if (!p.movingTicket) {
              p.x += p.vx;
            }
          }

          // Animation frame updates
          p.frameTimer++;
          if (p.frameTimer > 12) {
            p.frame = 1 - p.frame;
            p.frameTimer = 0;
          }
          if (p.x < -SPRITE_W - 20 || p.x > W + 40) return false;
        }
        ctx.save();
        if (p.hit) {
          const cx = p.x + SPRITE_W / 2,
            cy = p.y + SPRITE_H;
          ctx.translate(cx, cy);
          ctx.rotate((p.fallAngle * p.dir * Math.PI) / 180);
          ctx.translate(-cx, -cy);
          px(HIT_SPRITE, SKINS[p.skin], p.x, p.y, p.dir < 0);
          if (p.fallAngle < 50) {
            ctx.fillStyle = '#ffe135';
            ctx.font = 'bold 36px monospace';
            ctx.fillText('✦', p.x - 10, p.y - 10);
            ctx.fillText('✦', p.x + SPRITE_W - 12, p.y - 16);
          }
        } else if (p.sheltering) {
          px(CROUCH, SKINS[p.skin], p.x, FLOOR - CROUCH_H + 6, p.dir < 0);
          // Add a subtle shield effect while crouching
          ctx.strokeStyle = 'rgba(0,150,255,0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x + SPRITE_W / 2, FLOOR - CROUCH_H / 2, 45, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.hasFile) {
          // Carrying a file - use the CARRY sprite
          px(CARRY, SKINS[p.skin], p.x, p.y, p.dir < 0);

          // Draw file in hand
          ctx.fillStyle = '#fff';
          ctx.fillRect(
            p.x + (p.dir < 0 ? 20 : SPRITE_W - 35),
            p.y - 15,
            15,
            20
          );
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            p.x + (p.dir < 0 ? 20 : SPRITE_W - 35),
            p.y - 15,
            15,
            20
          );
        } else if (p.movingTicket) {
          px(CARRY, SKINS[p.skin], p.x, p.y, p.dir < 0);
        } else {
          px(
            p.frame === 0 ? WALK_A : WALK_B,
            SKINS[p.skin],
            p.x,
            p.y,
            p.dir < 0
          );
        }
        // Speech bubble
        if (!p.hit && p.bubbleTimer > 0 && p.bubble) {
          const bx = p.x + SPRITE_W / 2;
          const by = p.y - 14;
          ctx.font = 'bold 18px monospace';
          const tw = ctx.measureText(p.bubble).width;
          const pw = tw + 20,
            ph = 30;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.roundRect(bx - pw / 2, by - ph, pw, ph, 6);
          ctx.fill();
          ctx.strokeStyle = '#999';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(bx - pw / 2, by - ph, pw, ph, 6);
          ctx.stroke();
          // Tail
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.moveTo(bx - 4, by);
          ctx.lineTo(bx + 4, by);
          ctx.lineTo(bx, by + 6);
          ctx.fill();
          // Text
          ctx.fillStyle = '#333';
          ctx.fillText(p.bubble, bx - tw / 2, by - 9);
        }
        ctx.restore();
        return true;
      });

      // Draw obstacles in front of people
      OBSTACLES.forEach(drawObstacle);

      // Bananas
      bananas.current = bananas.current.filter((b) => {
        if (!b.active) return false;
        b.x += b.vx;
        b.y += b.vy;
        b.vy += GRAVITY;
        b.angle += 0.14;
        if (b.y > H || b.x < -30 || b.x > W + 30) return false;
        for (const o of OBSTACLES) {
          if (
            b.x > o.x &&
            b.x < o.x + o.w &&
            b.y > FLOOR - o.h &&
            b.y < FLOOR
          ) {
            splats.current.push({ x: b.x, y: b.y, timer: 25 });
            return false;
          }
        }
        for (const p of people.current) {
          if (p.hit) continue;
          const ph = p.sheltering ? CROUCH_H : SPRITE_H;
          const py = p.sheltering ? FLOOR - CROUCH_H + 6 : p.y;
          if (b.x > p.x && b.x < p.x + SPRITE_W && b.y > py && b.y < py + ph) {
            // Crouched people have 40% chance to dodge
            if (p.sheltering && Math.random() < 0.4) {
              p.bubble = "I'm blocked!";
              p.bubbleTimer = 60;
              splats.current.push({ x: b.x, y: b.y, timer: 20 });
              return false; // Banana hits but person dodges
            }

            p.hit = true;
            p.fallVy = -3;
            p.sheltering = false;
            p.movingTicket = false;
            p.y = py;
            shakeIntensity.current = 8;

            // Different scoring based on whether they had a file
            if (p.hasFile) {
              score.current += 200; // Bonus for stopping a data thief!
              p.bubble = "I'm blocked!";
            } else {
              score.current += 100; // Regular hit
            }
            setScoreDisplay(score.current);
            splats.current.push({ x: b.x, y: b.y, timer: 40 });
            return false;
          }
        }
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        const bp = 3;
        for (let r = 0; r < BANANA_SPRITE.length; r++) {
          for (let c = 0; c < BANANA_SPRITE[r].length; c++) {
            const ch = BANANA_SPRITE[r][c];
            if (ch === '.') continue;
            ctx.fillStyle = ch === 'Y' ? '#ffe135' : '#8B6914';
            ctx.fillRect(-18 + c * bp, -15 + r * bp, bp, bp);
          }
        }
        ctx.restore();
        return true;
      });

      // Floating hand — follows mouse X, fixed Y
      const handX = mouseX.current;
      const handY = H - 140;

      // Throw animation
      if (throwing.current) {
        throwAnim.current--;
        if (throwAnim.current <= 0) throwing.current = false;
      }

      // Compute aim angle for hand tilt
      let aimAngle = 0;
      if (drag.current) {
        const d = drag.current;
        const adx = d.start.x - d.current.x;
        const ady = d.start.y - d.current.y;
        if (Math.sqrt(adx * adx + ady * ady) > 10) {
          aimAngle = Math.atan2(ady, adx);
        }
      }

      // Throw: wind-up then snap forward
      let armTilt = 0;
      let armOffsetY = 0;
      let armScale = 1;
      if (throwing.current) {
        const t = throwAnim.current / 12; // 1 → 0
        if (t > 0.5) {
          // Wind-up phase: pull back
          const wt = (t - 0.5) / 0.5;
          armTilt = lastThrowAngle.current * 0.3 + wt * 0.4;
          armOffsetY = -wt * 30;
          armScale = 1 + wt * 0.08;
        } else {
          // Snap forward phase
          const st = t / 0.5;
          armTilt = lastThrowAngle.current * 0.2 * st - (1 - st) * 0.3;
          armOffsetY = (1 - st) * 15;
          armScale = 1 - (1 - st) * 0.05;
        }
      } else if (drag.current) {
        // Tilt toward aim while dragging
        armTilt = aimAngle * 0.15;
        const d = drag.current;
        const pull = Math.min(
          Math.sqrt(
            (d.start.x - d.current.x) ** 2 + (d.start.y - d.current.y) ** 2
          ) / MAX_POWER,
          1
        );
        armOffsetY = -pull * 12;
        armScale = 1 + pull * 0.06;
      }

      const tipY = handY + armOffsetY;

      ctx.save();
      ctx.translate(handX, tipY);
      ctx.rotate(armTilt);
      ctx.scale(armScale, armScale);

      // Arm / forearm emerging from below
      ctx.fillStyle = '#fdbcb4';
      ctx.beginPath();
      ctx.roundRect(-18, 10, 36, 55, 14);
      ctx.fill();
      // Arm outline
      ctx.strokeStyle = '#d4937e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-18, 10, 36, 55, 14);
      ctx.stroke();

      // Wristband / cuff
      ctx.fillStyle = '#ffe135';
      ctx.beginPath();
      ctx.roundRect(-20, 4, 40, 14, 5);
      ctx.fill();
      ctx.strokeStyle = '#c4a000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-20, 4, 40, 14, 5);
      ctx.stroke();
      // Cuff detail line
      ctx.strokeStyle = '#b89600';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-14, 11);
      ctx.lineTo(14, 11);
      ctx.stroke();

      // Fist — chunky rounded shape
      ctx.fillStyle = '#fdbcb4';
      ctx.beginPath();
      ctx.roundRect(-24, -28, 48, 38, 12);
      ctx.fill();
      // Fist outline
      ctx.strokeStyle = '#d4937e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-24, -28, 48, 38, 12);
      ctx.stroke();

      // Thumb — on the side
      ctx.fillStyle = '#f0a8a0';
      ctx.beginPath();
      ctx.roundRect(-29, -14, 13, 24, 6);
      ctx.fill();
      ctx.strokeStyle = '#d4937e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-29, -14, 13, 24, 6);
      ctx.stroke();

      // Finger segments (three knuckle bumps on top)
      ctx.fillStyle = '#fdbcb4';
      for (let i = 0; i < 3; i++) {
        const fx = -14 + i * 14;
        ctx.beginPath();
        ctx.arc(fx, -28, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#d4937e';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const fx = -14 + i * 14;
        ctx.beginPath();
        ctx.arc(fx, -28, 7, Math.PI, Math.PI * 2);
        ctx.stroke();
      }

      // Knuckle creases
      ctx.strokeStyle = '#e0998c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, -12);
      ctx.lineTo(16, -12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14, -5);
      ctx.lineTo(14, -5);
      ctx.stroke();

      // Highlight on fist
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.roundRect(-18, -26, 20, 10, 5);
      ctx.fill();

      ctx.restore();

      // Hand shadow on floor
      const shadowAlpha = throwing.current ? 0.08 : 0.15;
      ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(handX, handY + 50, 30 * armScale, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Banana in hand (hide during snap-forward of throw)
      const showBanana = !throwing.current || throwAnim.current > 6;
      if (showBanana) {
        ctx.save();
        ctx.translate(handX, tipY);
        ctx.rotate(armTilt);
        ctx.scale(armScale, armScale);
        ctx.translate(0, -42);
        const bs = 4;
        for (let r = 0; r < BANANA_SPRITE.length; r++) {
          for (let c = 0; c < BANANA_SPRITE[r].length; c++) {
            const ch = BANANA_SPRITE[r][c];
            if (ch === '.') continue;
            ctx.fillStyle = ch === 'Y' ? '#ffe135' : '#8B6914';
            ctx.fillRect(-32 + c * bs, -22 + r * bs, bs, bs);
          }
        }
        ctx.restore();
      }

      // Drag aim — trajectory preview
      if (drag.current) {
        const d = drag.current;
        const dx = d.start.x - d.current.x,
          dy = d.start.y - d.current.y;
        const power = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_POWER);
        const a = Math.atan2(dy, dx);
        const simVx = Math.cos(a) * power * POWER_MULT;
        const simVy = Math.sin(a) * power * POWER_MULT;

        // Trajectory dots
        if (power > 15) {
          let sx = handX,
            sy = tipY - 30,
            svy = simVy;
          const steps = 30;
          for (let i = 0; i < steps; i++) {
            sx += simVx;
            sy += svy;
            svy += GRAVITY;
            if (sy > H || sx < 0 || sx > W) break;
            const t = 1 - i / steps;
            ctx.globalAlpha = t * 0.6;
            ctx.fillStyle = '#ffe135';
            const dotSize = 4 + t * 4;
            ctx.beginPath();
            ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }

        // Power meter bar (left of hand)
        const meterX = handX - 50;
        const meterY = handY - 80;
        const meterH = 60;
        const meterW = 10;
        const pct = power / MAX_POWER;
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(meterX, meterY, meterW, meterH);
        // Fill
        const fillH = meterH * pct;
        const meterColor =
          pct < 0.4 ? '#4ade80' : pct < 0.75 ? '#fbbf24' : '#ef4444';
        ctx.fillStyle = meterColor;
        ctx.fillRect(meterX, meterY + meterH - fillH, meterW, fillH);
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(meterX, meterY, meterW, meterH);
      }

      // Fire particles
      fireParticles.current = fireParticles.current.filter((fp) => {
        fp.x += fp.vx;
        fp.y += fp.vy;
        fp.vy += 0.15;
        fp.life--;
        if (fp.life <= 0) return false;
        const t = fp.life / 25;
        ctx.globalAlpha = t;
        ctx.fillStyle = Math.random() > 0.5 ? '#ffe135' : '#ffb700';
        ctx.fillRect(
          fp.x - fp.size / 2,
          fp.y - fp.size / 2,
          fp.size * t,
          fp.size * t
        );
        ctx.globalAlpha = 1;
        return true;
      });

      // Cooldown indicator (ring around hand)
      const cooldownElapsed = now - lastFireTime.current;
      if (cooldownElapsed < COOLDOWN_MS && lastFireTime.current > 0) {
        const cdPct = cooldownElapsed / COOLDOWN_MS;
        ctx.strokeStyle = 'rgba(255,225,53,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          handX,
          handY,
          36,
          -Math.PI / 2,
          -Math.PI / 2 + cdPct * Math.PI * 2
        );
        ctx.stroke();
      }

      // HUD
      // Deadline timer
      const elapsed = (now - deadlineTimer.current) / 1000;
      const remaining = Math.max(0, 90 - elapsed);
      deadline.current = remaining;
      const secs = Math.ceil(remaining);
      const label =
        DEADLINE_LABELS.find((l) => secs >= l.at) ||
        DEADLINE_LABELS[DEADLINE_LABELS.length - 1];
      const urgent = secs <= 15;
      const critical = secs <= 5;

      // Timer bar across top — bold black bar like mascot outline
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, W, 56);
      // Progress bar
      const barW = (remaining / 90) * (W - 40);
      ctx.fillStyle = critical ? '#ef4444' : urgent ? '#ff8c00' : '#ffe135';
      ctx.fillRect(20, 42, barW, 10);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 42, W - 40, 10);
      // Timer text
      ctx.fillStyle = critical ? '#ef4444' : urgent ? '#f59e0b' : '#ffe135';
      ctx.font = 'bold 28px monospace';
      if (critical && Math.floor(now / 300) % 2 === 0) ctx.fillStyle = '#fff'; // flash
      ctx.fillText(`⏰ DEADLINE: ${secs}s`, 20, 30);
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(label.msg, W / 2 - ctx.measureText(label.msg).width / 2, 30);
      // Score
      ctx.fillStyle = '#ffe135';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`🍌 ${score.current}`, W - 220, 30);

      // Game over
      if (remaining <= 0 && !gameOver) setGameOver(true);

      ctx.restore(); // end screen shake transform

      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, W, H);
        // Yellow banner
        ctx.fillStyle = '#ffe135';
        ctx.fillRect(W / 2 - 400, H / 2 - 120, 800, 280);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 6;
        ctx.strokeRect(W / 2 - 400, H / 2 - 120, 800, 280);
        ctx.fillStyle = '#222';
        ctx.font = 'bold 64px monospace';
        const t1 = 'You have gone over estimated story points!';
        ctx.fillText(t1, W / 2 - ctx.measureText(t1).width / 2, H / 2 - 40);
        ctx.font = 'bold 36px monospace';
        const t2 = `SCORE: ${score.current}`;
        ctx.fillText(t2, W / 2 - ctx.measureText(t2).width / 2, H / 2 + 20);
        ctx.font = '22px monospace';
        const t3 = 'Lets figure out what went wrong next retro';
        ctx.fillText(t3, W / 2 - ctx.measureText(t3).width / 2, H / 2 + 70);
        ctx.fillStyle = '#222';
        ctx.fillRect(W / 2 - 120, H / 2 + 100, 240, 50);
        ctx.fillStyle = '#ffe135';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('RETRY', W / 2 - 40, H / 2 + 133);
      }

      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      if (soundtrack.current) {
        soundtrack.current.stop();
        soundtrack.current = null;
      }
    };
  }, [spawnPerson, gameOver, gameStarted]);

  // Keyboard handling for intro screen
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showIntro) {
        proceedToGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showIntro, proceedToGame]);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen bg-[#222] flex items-center justify-center relative"
      >
        {showIntro && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-30">
            <div className="bg-[#ffe135] p-8 border-[6px] border-[#222] text-center max-w-2xl">
              <h1 className="text-6xl font-bold text-[#222] mb-6 font-mono">
                🍌 ScrumBananas 🍌{' '}
              </h1>

              <div className="bg-[#222] border-2 border-[#222] inline-block mx-auto">
                <button
                  onClick={proceedToGame}
                  className="bg-[#ffe135] text-[#222] px-8 py-3 font-bold font-mono text-2xl hover:bg-[#ffd700] transition-colors"
                >
                  Play
                </button>
              </div>
            </div>
          </div>
        )}

        {!gameStarted && !showIntro && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-20">
            <div className="bg-[#ffe135] p-8 border-[6px] border-[#222] text-center max-w-2xl">
              <h1 className="text-5xl font-bold text-[#222] mb-4 font-mono">
                ScrumBananas
              </h1>
              <p className="text-[#222] mb-6 font-mono text-xl">
                Help your team from going bananas by throwing bananas at them!
              </p>
              <p className="text-[#222] mb-8 font-mono text-base">
                Drag to aim • Release to fire
              </p>
              <div className="bg-[#222] border-2 border-[#222] inline-block mx-auto">
                <button
                  onClick={startGame}
                  className="bg-[#ffe135] text-[#222] px-8 py-3 font-bold font-mono text-2xl hover:bg-[#ffd700] transition-colors"
                >
                  START GAME
                </button>
              </div>
            </div>
          </div>
        )}
        {gameStarted && (
          <button
            onClick={toggleMute}
            className="absolute bottom-3 left-3 z-10 px-4 py-2 bg-[#ffe135] text-[#222] font-bold font-mono rounded cursor-pointer hover:scale-105 transition-transform text-lg border-2 border-[#222]"
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
        <button
          onClick={() => containerRef.current?.requestFullscreen?.()}
          className="absolute bottom-3 right-3 z-10 px-4 py-2 bg-[#ffe135] text-[#222] font-bold font-mono rounded cursor-pointer hover:scale-105 transition-transform text-lg border-2 border-[#222]"
        >
          ⛶ FULLSCREEN
        </button>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="cursor-crosshair w-full h-full max-h-screen object-contain"
          style={{ imageRendering: 'pixelated' }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        />
      </div>
    </>
  );
}

// export const metadata = { title: 'ScrumBanana 🍌 Banana Launcher' };

export default function Page() {
  return <Game />;
}
