import { cn } from '@/lib/utils';

interface GameOverOverlayProps {
  score: number;
  lines: number;
  level: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export function GameOverOverlay({ score, lines, level, onRestart, onBackToMenu }: GameOverOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
      <div className="text-center space-y-6">
        <div className="text-5xl mb-2">🌸</div>
        <h1 className="text-4xl font-black text-glow-pink text-primary">
          游戏结束
        </h1>
        <p className="text-muted-foreground text-lg">辛苦啦~ 这是你的成绩 ✨</p>

        <div className="bg-white/80 cute-border p-6 space-y-3 w-64 mx-auto">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">得分 ⭐</span>
            <span className="text-2xl font-bold text-glow-pink text-primary tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">消除行数</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">{lines}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">最终等级</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">Lv.{level + 1}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            onClick={onRestart}
            className={cn(
              'w-48 px-8 py-3 text-lg font-bold rounded-full transition-all duration-300',
              'bg-gradient-to-r from-primary to-secondary text-white',
              'hover:scale-105 hover:shadow-lg',
              'focus:outline-none focus:ring-4 focus:ring-primary/30',
            )}
          >
            再来一局 💪
          </button>
          <button
            onClick={onBackToMenu}
            className={cn(
              'w-48 px-8 py-3 text-base font-medium rounded-full transition-all duration-300',
              'bg-muted text-foreground',
              'hover:scale-105 hover:bg-muted/80',
              'focus:outline-none',
            )}
          >
            返回菜单
          </button>
        </div>
      </div>
    </div>
  );
}
