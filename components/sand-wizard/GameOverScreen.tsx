'use client';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export default function GameOverScreen({ score, highScore, onRestart }: GameOverScreenProps) {
  const isNewRecord = score >= highScore && score > 0;

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
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 select-none"
      onClick={onRestart}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onRestart()}
      tabIndex={0}
      role="button"
      aria-label="Restart game"
    >
      <p className="font-mono text-2xl text-red-500 mb-4 tracking-widest">
        YOU PERISHED
      </p>
      <p className="font-mono text-4xl text-amber-400 font-bold mb-1">
        {score.toLocaleString()}
        <span className="text-amber-600 text-2xl ml-2">m</span>
      </p>
      {isNewRecord && (
        <p className="font-mono text-sm text-yellow-300 animate-pulse mb-2">🏆 NEW RECORD!</p>
      )}
      {highScore > 0 && !isNewRecord && (
        <p className="font-mono text-xs text-amber-600 mb-2">Best: {highScore.toLocaleString()}m</p>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); handleShare(); }}
        className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-mono font-bold text-sm tracking-wider rounded transition-colors pointer-events-auto cursor-pointer"
      >
        SHARE SCORE
      </button>
      <p className="font-mono text-xs text-amber-500/70 mt-6 animate-pulse">
        TAP OR PRESS SPACE TO TRY AGAIN
      </p>
    </div>
  );
}
