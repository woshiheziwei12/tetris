import { cn } from '@/lib/utils';

interface ControlsHintProps {
  playerId: 1 | 2;
  solo?: boolean;
}

export function ControlsHint({ playerId, solo = false }: ControlsHintProps) {
  const borderClass = playerId === 1 ? 'cute-border' : 'cute-border-purple';
  
  const useArrows = playerId === 2 || solo;

  const controls = useArrows
    ? [
        { key: '↑', action: '旋转' },
        { key: '←/→', action: '移动' },
        { key: '↓', action: '下落' },
        { key: 'Shift', action: '硬降' },
      ]
    : [
        { key: 'W', action: '旋转' },
        { key: 'A/D', action: '移动' },
        { key: 'S', action: '下落' },
        { key: 'Space', action: '硬降' },
      ];

  return (
    <div className={cn('p-2 bg-white/80 backdrop-blur-sm', borderClass)}>
      <div className="text-xs text-muted-foreground mb-1 font-medium">操作 🎮</div>
      <div className="space-y-1">
        {controls.map(({ key, action }) => (
          <div key={key} className="flex justify-between text-xs">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-medium text-[10px]">
              {key}
            </kbd>
            <span className="text-muted-foreground text-[11px]">{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
