import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VictoryOverlayProps {
  winner: 1 | 2;
  player1Score: number;
  player2Score: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  size: number;
  emoji: string;
}

// 可爱版嘲讽文字
const CUTE_TAUNTS = [
  "哎呀，技不如人呢~",
  "再练练吧，加油哦！",
  "这次只是运气不好啦~",
  "呜呜呜，被打败了...",
  "下次一定能赢的！",
  "手速跟不上脑子呀~",
  "是不是眼花了呢？",
  "要不要我让你一点？",
  "太可爱了所以输了~",
  "没关系，重在参与！",
];

function getRandomTaunt(): string {
  return CUTE_TAUNTS[Math.floor(Math.random() * CUTE_TAUNTS.length)];
}

export function VictoryOverlay({ winner, player1Score, player2Score, onRestart, onBackToMenu }: VictoryOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [taunt, setTaunt] = useState('');

  const colors = [
    'hsl(340, 75%, 72%)',
    'hsl(270, 55%, 72%)',
    'hsl(45, 85%, 72%)',
    'hsl(165, 50%, 65%)',
    'hsl(20, 75%, 75%)',
  ];

  const emojis = ['💖', '✨', '🌸', '⭐', '🎀', '💕', '🦄', '🍬'];

  const createFirework = useCallback((originX: number, originY: number) => {
    const newParticles: Particle[] = [];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: originX,
        y: originY,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: (360 / particleCount) * i,
        size: 8 + Math.random() * 6,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1200);
  }, []);

  useEffect(() => {
    setTaunt(getRandomTaunt());

    const createRandomFirework = () => {
      const x = 150 + Math.random() * (window.innerWidth - 300);
      const y = 150 + Math.random() * (window.innerHeight - 350);
      createFirework(x, y);
    };

    createRandomFirework();
    setTimeout(createRandomFirework, 400);
    setTimeout(createRandomFirework, 800);

    const interval = setInterval(createRandomFirework, 1000);

    return () => clearInterval(interval);
  }, [createFirework]);

  const winnerColor = winner === 1 ? 'text-primary text-glow-pink' : 'text-secondary text-glow-purple';
  const loserColor = winner === 1 ? 'text-secondary' : 'text-primary';
  const winnerName = winner === 1 ? '小粉 🎀' : '小紫 🦄';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
      {/* 烟花粒子 */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="firework-particle flex items-center justify-center"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size * 2,
            height: particle.size * 2,
            fontSize: particle.size,
            transform: `translate(${Math.cos(particle.angle * Math.PI / 180) * 80}px, ${Math.sin(particle.angle * Math.PI / 180) * 80}px)`,
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* 胜利信息 */}
      <div className="text-center space-y-6 animate-victory-bounce">
        {/* 胜利标题 */}
        <div className="space-y-3">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className={cn('text-5xl font-black tracking-wide', winnerColor)}>
            {winnerName} 获胜!
          </h1>
          <div className="text-xl text-muted-foreground">
            恭喜恭喜~ 🎊
          </div>
        </div>

        {/* 比分 */}
        <div className="flex items-center justify-center gap-8 text-3xl font-bold py-4">
          <div className={cn('text-center', winner === 1 ? winnerColor : loserColor)}>
            <div className="text-sm text-muted-foreground mb-1">小粉 🎀</div>
            <div className="tabular-nums">{player1Score.toLocaleString()}</div>
          </div>
          <div className="text-muted-foreground text-xl">VS</div>
          <div className={cn('text-center', winner === 2 ? winnerColor : loserColor)}>
            <div className="text-sm text-muted-foreground mb-1">小紫 🦄</div>
            <div className="tabular-nums">{player2Score.toLocaleString()}</div>
          </div>
        </div>

        {/* 嘲讽文字 */}
        <div className={cn(
          'text-2xl font-bold animate-float py-2',
          'text-cute-peach'
        )}>
          "{taunt}" 😝
        </div>

        {/* 按钮 */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onRestart}
            className={cn(
              'w-48 px-10 py-4 text-xl font-bold rounded-full transition-all duration-300',
              'bg-gradient-to-r from-primary to-secondary text-white',
              'hover:scale-105 hover:shadow-lg',
              'focus:outline-none focus:ring-4 focus:ring-primary/30'
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
