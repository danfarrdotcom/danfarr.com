'use client';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-end select-none"
      style={{
        backgroundImage: 'url(/home-hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onStart()}
      tabIndex={0}
      role="button"
      aria-label="Start game"
    >
      <div className="flex flex-col items-center mb-16 gap-4">
        <div className="flex flex-col items-center gap-1 text-xs font-mono text-amber-200/80">
          <p>Tap / click → place sand</p>
          <p className="hidden sm:block">Right click → remove sand</p>
        </div>
        <button
          onClick={onStart}
          className="px-10 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-mono font-bold text-lg tracking-widest rounded transition-colors shadow-lg shadow-amber-900/50 cursor-pointer"
        >
          START
        </button>
      </div>
    </div>
  );
}
