'use client';

import { useState } from 'react';
import Leaderboard from './Leaderboard';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export default function GameOverScreen({ score, highScore, onRestart }: GameOverScreenProps) {
  const isNewRecord = score >= highScore && score > 0;
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  const handleShare = async () => {
    const text = `🧙‍♂️ I survived ${score.toLocaleString()}m in Sand Wizard!${isNewRecord ? ' 🏆 New record!' : ''}\n\nCan you beat my score?`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try { await navigator.share({ title: 'Sand Wizard', text, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(`${text}\n${url}`); } catch {}
    }
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-end select-none animate-fade-in"
      style={{
        backgroundImage: 'url(/sand-wizard-death.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={onRestart}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onRestart()}
      tabIndex={0}
      role="button"
      aria-label="Restart game"
    >
      <div className="flex flex-col items-center mb-8 gap-2 bg-black/50 rounded-xl px-6 py-4 backdrop-blur-sm max-w-sm w-full mx-4">
        <p className="font-mono text-3xl text-amber-400 font-bold">
          {score.toLocaleString()}
          <span className="text-amber-600 text-xl ml-2">m</span>
        </p>
        {isNewRecord && (
          <p className="font-mono text-sm text-yellow-300 animate-pulse">🏆 NEW RECORD!</p>
        )}
        {highScore > 0 && !isNewRecord && (
          <p className="font-mono text-xs text-amber-400/70">Best: {highScore.toLocaleString()}m</p>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-mono font-bold text-xs tracking-wider rounded transition-colors pointer-events-auto cursor-pointer"
          >
            SHARE
          </button>
          {!showLeaderboard && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowLeaderboard(true); }}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 font-mono font-bold text-xs tracking-wider rounded transition-colors pointer-events-auto cursor-pointer"
            >
              LEADERBOARD
            </button>
          )}
        </div>

        {showLeaderboard && (
          <Leaderboard currentScore={score} onClose={() => setShowLeaderboard(false)} />
        )}

        <p className="font-mono text-xs text-amber-300/60 mt-2 animate-pulse">
          TAP OR PRESS SPACE TO TRY AGAIN
        </p>
      </div>
    </div>
  );
}
