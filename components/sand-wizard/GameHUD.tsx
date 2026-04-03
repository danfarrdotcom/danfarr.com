import SandMeter from './SandMeter';
import ScoreDisplay from './ScoreDisplay';
import { SAND_MAX } from '../../lib/sand-wizard/constants';

interface GameHUDProps {
  sandResource: number;
  score: number;
  shieldActive: boolean;
  slowScrollFrames: number;
  nearMiss?: boolean;
}

export default function GameHUD({ sandResource, score, shieldActive, slowScrollFrames, nearMiss }: GameHUDProps) {
  return (
    <div className="absolute inset-0 pointer-events-none p-3 flex justify-between items-start">
      <div className="flex flex-col gap-1">
        <SandMeter value={sandResource} max={SAND_MAX} />
        {shieldActive && (
          <div style={{ color: '#42aaff', fontWeight: 'bold', fontSize: '0.8em' }}>🛡 SHIELD</div>
        )}
        {slowScrollFrames > 0 && (
          <div style={{ color: '#44dd88', fontWeight: 'bold', fontSize: '0.8em' }}>⏱ SLOW ({Math.ceil(slowScrollFrames / 60)}s)</div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <ScoreDisplay metres={score} />
        {nearMiss && (
          <div className="font-mono text-xs text-yellow-300 animate-pulse">NEAR MISS +50</div>
        )}
      </div>
    </div>
  );
}
