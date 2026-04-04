import { cn } from '@/lib/utils';

interface ScorePanelProps {
  score: number;
  lines: number;
  level: number;
  playerName: string;
  playerId: 1 | 2;
}

export function ScorePanel({ score, lines, level, playerName, playerId }: ScorePanelProps) {
  const borderClass = playerId === 1 ? 'cute-border' : 'cute-border-purple';
  const glowClass = playerId === 1 ? 'text-glow-pink text-primary' : 'text-glow-purple text-secondary';

  return (
    <div className={cn('p-3 space-y-2 bg-white/80 backdrop-blur-sm', borderClass)}>
      <div className={cn('text-base font-bold', glowClass)}>
        {playerName}
      </div>
      
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-xs">得分 ⭐</span>
          <span className={cn('text-xl font-bold tabular-nums', glowClass)}>
            {score.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-xs">行数</span>
          <span className="text-base font-semibold text-foreground tabular-nums">
            {lines}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-xs">等级</span>
          <span className="text-base font-semibold text-foreground tabular-nums">
            Lv.{level + 1}
          </span>
        </div>
      </div>
    </div>
  );
}
