interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 cursor-pointer select-none"
      onClick={onStart}
      onKeyDown={(e) => e.key === ' ' && onStart()}
      tabIndex={0}
    >
      <h1 className="font-mono text-5xl font-bold text-amber-400 tracking-widest mb-2">
        SAND
      </h1>
      <h1 className="font-mono text-5xl font-bold text-amber-600 tracking-widest mb-8">
        WIZARD
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
