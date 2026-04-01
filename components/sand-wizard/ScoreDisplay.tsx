interface ScoreDisplayProps {
  metres: number;
}

export default function ScoreDisplay({ metres }: ScoreDisplayProps) {
  return (
    <div className="font-mono text-xs text-amber-300 select-none">
      {metres.toLocaleString()}
      <span className="text-amber-600 ml-1">m →</span>
    </div>
  );
}
