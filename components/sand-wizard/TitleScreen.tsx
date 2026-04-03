'use client';

import { useState } from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  const [fading, setFading] = useState(false);

  const handleStart = () => {
    setFading(true);
    setTimeout(onStart, 3000);
  };

  return (
    <div
      className="absolute inset-0 select-none"
      onKeyDown={(e) =>
        (e.key === ' ' || e.key === 'Enter') && !fading && handleStart()
      }
      tabIndex={0}
      role="button"
      aria-label="Start game"
    >
      {/* Title screen */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-end transition-opacity duration-1000"
        style={{
          backgroundImage: 'url(/home-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: fading ? 0 : 1,
        }}
      >
        <div className="flex flex-col items-center mb-16 gap-4">
          <div className="flex flex-col items-center gap-1 text-xs font-mono text-amber-200/80">
            <p>Tap / click → place sand</p>
            <p className="hidden sm:block">Right click → remove sand</p>
          </div>
          <button
            onClick={handleStart}
            disabled={fading}
            className="px-10 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-mono font-bold text-lg tracking-widest rounded transition-colors shadow-lg shadow-amber-900/50 cursor-pointer disabled:opacity-50"
          >
            START
          </button>
        </div>
      </div>

      {/* Intro image fades in */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/sand-wizard-intro.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: fading ? 1 : 0,
          transition: 'opacity 1s ease-in',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
