'use client';

import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  name: string;
  score: number;
  created_at: string;
}

interface LeaderboardProps {
  currentScore: number;
  onClose: () => void;
}

export default function Leaderboard({ currentScore, onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/sand-wizard/leaderboard');
      if (res.ok) setEntries(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchScores(); }, []);

  const handleSubmit = async () => {
    if (!name.trim() || submitted) return;
    setSubmitted(true);
    try {
      await fetch('/api/sand-wizard/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), score: currentScore }),
      });
      await fetchScores();
    } catch {}
  };

  return (
    <div
      className="flex flex-col items-center gap-3 w-full max-w-xs pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Submit form */}
      {!submitted && currentScore > 0 && (
        <div className="flex gap-2 w-full">
          <input
            type="text"
            maxLength={20}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleSubmit(); }}
            className="flex-1 px-3 py-2 bg-black/60 border border-amber-500/50 rounded text-amber-200 font-mono text-sm placeholder:text-amber-500/40 outline-none focus:border-amber-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm rounded disabled:opacity-30 cursor-pointer"
          >
            SUBMIT
          </button>
        </div>
      )}
      {submitted && (
        <p className="font-mono text-xs text-amber-300">Score submitted!</p>
      )}

      {/* Leaderboard table */}
      <div className="w-full bg-black/60 rounded-lg border border-amber-500/30 overflow-hidden">
        <p className="font-mono text-xs text-amber-400 text-center py-2 border-b border-amber-500/20 tracking-widest">
          LEADERBOARD
        </p>
        {loading ? (
          <p className="font-mono text-xs text-amber-500/50 text-center py-4">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="font-mono text-xs text-amber-500/50 text-center py-4">No scores yet</p>
        ) : (
          <div className="divide-y divide-amber-500/10">
            {entries.map((e, i) => (
              <div key={i} className="flex items-center px-3 py-1.5 font-mono text-xs">
                <span className="w-6 text-amber-500/60">{i + 1}.</span>
                <span className="flex-1 text-amber-200 truncate">{e.name}</span>
                <span className="text-amber-400 font-bold">{e.score.toLocaleString()}m</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="font-mono text-xs text-amber-500/60 hover:text-amber-400 cursor-pointer"
      >
        CLOSE
      </button>
    </div>
  );
}
