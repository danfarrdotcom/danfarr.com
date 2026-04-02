import SandMeter from './SandMeter';
import ScoreDisplay from './ScoreDisplay';
import { SAND_MAX } from '../../lib/sand-wizard/constants';

interface GameHUDProps {
  sandResource: number;
  score: number;
}

export default function GameHUD({ sandResource, score }: GameHUDProps) {
  return (
    <div className="absolute inset-0 pointer-events-none p-3 flex justify-between items-start">
      <SandMeter value={sandResource} max={SAND_MAX} />
      <ScoreDisplay metres={score} />
    </div>
  );
}
