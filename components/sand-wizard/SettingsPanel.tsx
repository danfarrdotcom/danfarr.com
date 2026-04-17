'use client';

import { useState } from 'react';
import { isSfxMuted, isMusicMuted, setSfxMuted, setMusicMuted } from '../../lib/sand-wizard/audio';

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [sfxOff, setSfxOff] = useState(isSfxMuted());
  const [musicOff, setMusicOff] = useState(isMusicMuted());

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/70 z-50"
      onClick={onClose}
    >
      <div
        className="bg-black/80 border border-amber-500/40 rounded-xl px-6 py-5 flex flex-col gap-4 min-w-[220px]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-amber-400 text-sm tracking-widest text-center">SETTINGS</p>

        <label className="flex items-center justify-between gap-4 font-mono text-xs text-amber-200 cursor-pointer">
          Sound Effects
          <button
            onClick={() => { const v = !sfxOff; setSfxOff(v); setSfxMuted(v); }}
            className={`px-3 py-1 rounded font-bold text-xs ${sfxOff ? 'bg-red-800 text-red-200' : 'bg-green-800 text-green-200'}`}
          >
            {sfxOff ? 'OFF' : 'ON'}
          </button>
        </label>

        <label className="flex items-center justify-between gap-4 font-mono text-xs text-amber-200 cursor-pointer">
          Music
          <button
            onClick={() => { const v = !musicOff; setMusicOff(v); setMusicMuted(v); }}
            className={`px-3 py-1 rounded font-bold text-xs ${musicOff ? 'bg-red-800 text-red-200' : 'bg-green-800 text-green-200'}`}
          >
            {musicOff ? 'OFF' : 'ON'}
          </button>
        </label>

        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded cursor-pointer"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
