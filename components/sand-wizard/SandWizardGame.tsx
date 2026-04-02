'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  CANVAS_W, CANVAS_H, SAND_MAX, LOGICAL_W, LOGICAL_H, WALK_SPEED,
} from '../../lib/sand-wizard/constants';
import { createInitialState, createInitialPlayer } from '../../lib/sand-wizard/state';
import { stepSand, shiftGridLeft } from '../../lib/sand-wizard/physics';
import { renderFrame } from '../../lib/sand-wizard/renderer';
import { applyBrush, regenSand } from '../../lib/sand-wizard/input';
import { updatePlayer } from '../../lib/sand-wizard/player';
import { updateObstacles } from '../../lib/sand-wizard/obstacles';
import { fillNewColumns } from '../../lib/sand-wizard/worldgen';
import { GameState, Player } from '../../lib/sand-wizard/types';
import GameHUD from './GameHUD';
import TitleScreen from './TitleScreen';
import GameOverScreen from './GameOverScreen';

export default function SandWizardGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const playerRef = useRef<Player>(createInitialPlayer());
  const mouseRef = useRef<{ x: number; y: number; action: 'place' | 'remove' | null }>({
    x: 0, y: 0, action: null,
  });
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const scrollAccRef = useRef(0);

  const [hud, setHud] = useState({
    sand: SAND_MAX,
    score: 0,
    phase: 'title' as GameState['phase'],
    shieldActive: false,
    slowScrollFrames: 0,
  });

  const startGame = useCallback(() => {
    stateRef.current = createInitialState();
    stateRef.current.phase = 'playing';
    playerRef.current = createInitialPlayer();
    frameCountRef.current = 0;
    scrollAccRef.current = 0;
    setHud({ sand: SAND_MAX, score: 0, phase: 'playing', shieldActive: false, slowScrollFrames: 0 });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (stateRef.current.phase === 'title') startGame();
        if (stateRef.current.phase === 'dead') startGame();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const getCanvasPos = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width / r.width;
      const scaleY = canvas.height / r.height;
      return { x: (clientX - r.left) * scaleX, y: (clientY - r.top) * scaleY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const pos = getCanvasPos(e.clientX, e.clientY);
      mouseRef.current.x = pos.x;
      mouseRef.current.y = pos.y;
    };
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      mouseRef.current.action = e.button === 2 ? 'remove' : 'place';
    };
    const onMouseUp = () => { mouseRef.current.action = null; };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    const onContextMenu = (e: Event) => e.preventDefault();
    canvas.addEventListener('contextmenu', onContextMenu);

    let lastHudUpdate = 0;

    const loop = (timestamp: number) => {
      const state = stateRef.current;
      const player = playerRef.current;

      if (state.phase === 'playing') {
        frameCountRef.current += 1;
        const frame = frameCountRef.current;

        applyBrush(state, mouseRef.current.x, mouseRef.current.y, mouseRef.current.action);
        stepSand(state.grid, state.gridWidth, state.gridHeight, frame);
        regenSand(state);

        const effectiveSpeed = state.slowScrollFrames > 0 ? WALK_SPEED * 0.5 : WALK_SPEED;
        if (state.slowScrollFrames > 0) state.slowScrollFrames--;
        scrollAccRef.current += effectiveSpeed;
        const colsToShift = Math.floor(scrollAccRef.current);
        if (colsToShift > 0) {
          shiftGridLeft(state.grid, state.gridWidth, state.gridHeight, colsToShift);
          scrollAccRef.current -= colsToShift;
          fillNewColumns(state, colsToShift);
        }

        updatePlayer(player, state);
        updateObstacles(state, player);

        state.cameraX += WALK_SPEED;
        state.score = Math.floor(state.cameraX / 10);

        if (player.state === 'dead') {
          state.phase = 'dead';
          setHud(h => ({ ...h, phase: 'dead' }));
        }

        if (timestamp - lastHudUpdate > 100) {
          setHud({
            sand: state.sandResource,
            score: state.score,
            phase: state.phase,
            shieldActive: state.shieldActive,
            slowScrollFrames: state.slowScrollFrames,
          });
          lastHudUpdate = timestamp;
        }
      }

      renderFrame(
        ctx,
        state,
        state.phase === 'playing' ? player : undefined,
        frameCountRef.current,
      );
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [startGame]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      {hud.phase === 'playing' && (
        <GameHUD
          sandResource={hud.sand}
          score={hud.score}
          shieldActive={hud.shieldActive}
          slowScrollFrames={hud.slowScrollFrames}
        />
      )}
      {hud.phase === 'title' && (
        <TitleScreen onStart={startGame} />
      )}
      {hud.phase === 'dead' && (
        <GameOverScreen score={hud.score} onRestart={startGame} />
      )}
    </div>
  );
}
