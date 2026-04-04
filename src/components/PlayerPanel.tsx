import { useGameLogic } from '@/game/useGameLogic';
import { GameBoard, NextPiece } from './GameBoard';
import { ScorePanel } from './ScorePanel';
import { ControlsHint } from './ControlsHint';
import { cn } from '@/lib/utils';

interface PlayerPanelProps {
  playerId: 1 | 2;
  playerName: string;
  isActive: boolean;
  onGameOver: () => void;
  gameKey: number;
}

export function PlayerPanel({ playerId, playerName, isActive, onGameOver, gameKey }: PlayerPanelProps) {
  const { gameState } = useGameLogic(playerId, isActive, onGameOver);

  // 使用 gameKey 来重置游戏
  const key = `player-${playerId}-${gameKey}`;

  return (
    <div 
      key={key}
      className={cn(
        'flex gap-4 items-start transition-all duration-300',
        playerId === 1 ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {/* 游戏棋盘 */}
      <GameBoard
        board={gameState.board}
        currentPiece={gameState.currentPiece}
        playerId={playerId}
        isGameOver={gameState.isGameOver}
      />

      {/* 侧边栏 */}
      <div className="flex flex-col gap-4 w-40">
        <ScorePanel
          score={gameState.score}
          lines={gameState.lines}
          level={gameState.level}
          playerName={playerName}
          playerId={playerId}
        />
        <NextPiece
          type={gameState.nextPiece}
          playerId={playerId}
        />
        <ControlsHint playerId={playerId} />
      </div>
    </div>
  );
}

// 导出用于获取分数的独立 hook
export function usePlayerGame(playerId: 1 | 2, isActive: boolean, onGameOver: () => void) {
  return useGameLogic(playerId, isActive, onGameOver);
}
