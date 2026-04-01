interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export default function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 cursor-pointer select-none"
      onClick={onRestart}
      onKeyDown={(e) => e.key === ' ' && onRestart()}
      tabIndex={0}
    >
      <p className="font-mono text-2xl text-red-500 mb-4 tracking-widest">
        YOU PERISHED
      </p>
      <p className="font-mono text-4xl text-amber-400 font-bold mb-2">
        {score.toLocaleString()}
        <span className="text-amber-600 text-2xl ml-2">m</span>
      </p>
      <p className="font-mono text-xs text-amber-500/70 mt-8 animate-pulse">
        PRESS SPACE OR CLICK TO TRY AGAIN
      </p>
    </div>
  );
}
