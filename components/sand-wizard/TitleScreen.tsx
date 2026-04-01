'use client';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 cursor-pointer select-none"
      onClick={onStart}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onStart()}
      tabIndex={0}
      role="button"
      aria-label="Start game"
    >
      <h1 className="font-mono text-5xl font-bold tracking-widest flex flex-col items-center mb-8">
        <span className="text-amber-400">SAND</span>
        <span className="text-amber-600">WIZARD</span>
      </h1>
      <p className="font-mono text-sm text-amber-300/70 mb-1">
        Left click → place sand
      </p>
      <p className="font-mono text-sm text-amber-300/70 mb-1">
        Right click → remove sand
      </p>
      <p className="font-mono text-sm text-amber-300/70 mb-8">
        Space → jump · Down → duck
      </p>
      <p className="font-mono text-xs text-amber-500 animate-pulse">
        PRESS SPACE OR CLICK TO START
      </p>
    </div>
  );
}
