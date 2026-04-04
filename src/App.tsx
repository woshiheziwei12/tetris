import { useState, useCallback, useEffect } from 'react';
import { useGameLogic } from '@/game/useGameLogic';
import { GameBoard, NextPiece } from '@/components/GameBoard';
import { ScorePanel } from '@/components/ScorePanel';
import { ControlsHint } from '@/components/ControlsHint';
import { VictoryOverlay } from '@/components/VictoryOverlay';
import { cn } from '@/lib/utils';

type GamePhase = 'waiting' | 'playing' | 'ended';

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('waiting');
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [player1Over, setPlayer1Over] = useState(false);
  const [player2Over, setPlayer2Over] = useState(false);

  const isPlaying = gamePhase === 'playing';

  const handlePlayer1GameOver = useCallback(() => {
    setPlayer1Over(true);
  }, []);

  const handlePlayer2GameOver = useCallback(() => {
    setPlayer2Over(true);
  }, []);

  const { gameState: p1State, resetGame: resetP1 } = useGameLogic(1, isPlaying && !player1Over, handlePlayer1GameOver);
  const { gameState: p2State, resetGame: resetP2 } = useGameLogic(2, isPlaying && !player2Over, handlePlayer2GameOver);

  // 检查游戏结束 - 任意一方结束时，分数高的获胜
  useEffect(() => {
    if (gamePhase === 'playing' && (player1Over || player2Over)) {
      // 分数高的获胜
      setWinner(p1State.score >= p2State.score ? 1 : 2);
      setGamePhase('ended');
    }
  }, [player1Over, player2Over, gamePhase, p1State.score, p2State.score]);

  const startGame = useCallback(() => {
    setGamePhase('playing');
    setPlayer1Over(false);
    setPlayer2Over(false);
    setWinner(null);
    resetP1();
    resetP2();
  }, [resetP1, resetP2]);

  const handleRestart = useCallback(() => {
    startGame();
  }, [startGame]);

  return (
    <div className="min-h-screen cute-bg sparkle-bg relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 text-4xl heart-float">💖</div>
        <div className="absolute bottom-1/4 left-10 text-3xl heart-float" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-20 right-1/3 text-2xl heart-float" style={{ animationDelay: '1s' }}>🌸</div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-2">
        {/* 标题 */}
        <h1 className="text-4xl font-black mb-2 tracking-wide">
          <span className="text-glow-pink text-primary">方块</span>
          <span className="text-muted-foreground mx-2">💕</span>
          <span className="text-glow-purple text-secondary">对对碰</span>
        </h1>
        <p className="text-muted-foreground mb-4 text-sm">分数高的获胜哦~</p>

        {/* 游戏区域 */}
        <div className="flex items-start gap-8">
          {/* 玩家1 */}
          <div className="flex gap-3 items-start">
            <div className="flex flex-col gap-3 w-40">
              <ScorePanel
                score={p1State.score}
                lines={p1State.lines}
                level={p1State.level}
                playerName="小粉 🎀"
                playerId={1}
              />
              <NextPiece type={p1State.nextPiece} playerId={1} />
              <ControlsHint playerId={1} />
            </div>
            <GameBoard
              board={p1State.board}
              currentPiece={p1State.currentPiece}
              playerId={1}
              isGameOver={p1State.isGameOver}
            />
          </div>

          {/* VS 分隔 */}
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-4xl font-black text-primary/30 tracking-widest">
              VS
            </div>
            <div className="mt-4 text-center">
              <div className="text-muted-foreground text-xs mb-1">
                当前比分 ✨
              </div>
              <div className="flex items-center gap-3 text-2xl font-bold">
                <span className="text-glow-pink text-primary tabular-nums">{p1State.score}</span>
                <span className="text-muted-foreground">:</span>
                <span className="text-glow-purple text-secondary tabular-nums">{p2State.score}</span>
              </div>
            </div>
          </div>

          {/* 玩家2 */}
          <div className="flex gap-3 items-start">
            <GameBoard
              board={p2State.board}
              currentPiece={p2State.currentPiece}
              playerId={2}
              isGameOver={p2State.isGameOver}
            />
            <div className="flex flex-col gap-3 w-40">
              <ScorePanel
                score={p2State.score}
                lines={p2State.lines}
                level={p2State.level}
                playerName="小紫 🦄"
                playerId={2}
              />
              <NextPiece type={p2State.nextPiece} playerId={2} />
              <ControlsHint playerId={2} />
            </div>
          </div>
        </div>

        {/* 开始游戏按钮 */}
        {gamePhase === 'waiting' && (
          <button
            onClick={startGame}
            className={cn(
              'mt-6 px-10 py-3 text-xl font-bold rounded-full transition-all duration-300',
              'bg-gradient-to-r from-primary to-secondary text-white',
              'hover:scale-105 hover:shadow-lg',
              'focus:outline-none focus:ring-4 focus:ring-primary/30',
              'animate-pulse-cute'
            )}
          >
            开始对战 💪
          </button>
        )}

        {/* 游戏中提示 */}
        {gamePhase === 'playing' && (
          <div className="mt-6 text-muted-foreground text-base animate-float flex items-center gap-2">
            <span>对战进行中</span>
            <span className="animate-wiggle">🎮</span>
          </div>
        )}
      </div>

      {/* 胜利覆盖层 */}
      {gamePhase === 'ended' && winner && (
        <VictoryOverlay
          winner={winner}
          player1Score={p1State.score}
          player2Score={p2State.score}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
