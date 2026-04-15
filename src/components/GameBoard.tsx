import { CellColor, TETROMINOS, TetrominoType, Piece } from '@/game/tetris';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  board: CellColor[][];
  currentPiece: Piece | null;
  playerId: 1 | 2;
  isGameOver: boolean;
}

const colorMap: Record<string, string> = {
  cyan: 'bg-cute-mint',
  yellow: 'bg-cute-yellow',
  purple: 'bg-cute-purple',
  green: 'bg-cute-mint',
  red: 'bg-cute-coral',
  pink: 'bg-cute-pink',
  orange: 'bg-cute-peach',
};

export function GameBoard({ board, currentPiece, playerId, isGameOver }: GameBoardProps) {
  const displayBoard = board.map(row => [...row]);
  
  if (currentPiece) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = currentPiece.position.y + y;
          const boardX = currentPiece.position.x + x;
          if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
            displayBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
  }

  const borderClass = playerId === 1 ? 'cute-border' : 'cute-border-purple';

  return (
    <div className={cn(
      'relative p-1 bg-white/90 backdrop-blur-sm',
      borderClass,
      isGameOver && 'opacity-60'
    )}>
      <div className="grid grid-cols-10">
        {displayBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={cn(
                'w-[30px] h-[30px] border border-white/60 rounded-[4px]',
                cell ? colorMap[cell] : 'bg-muted/25'
              )}
            />
          ))
        )}
      </div>
      
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <span className={cn(
            'text-xl font-bold',
            playerId === 1 ? 'text-glow-pink text-primary' : 'text-glow-purple text-secondary'
          )}>
            游戏结束
          </span>
        </div>
      )}
    </div>
  );
}

interface NextPieceProps {
  type: TetrominoType;
  playerId: 1 | 2;
}

export function NextPiece({ type, playerId }: NextPieceProps) {
  const tetromino = TETROMINOS[type];
  const borderClass = playerId === 1 ? 'cute-border' : 'cute-border-purple';

  return (
    <div className={cn('p-3 bg-white/80 backdrop-blur-sm', borderClass)}>
      <div className="text-xs text-muted-foreground mb-1 font-medium">下一个 ✨</div>
      <div className="flex flex-col items-center justify-center min-h-[70px]">
        {tetromino.shape.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={x}
                className={cn(
                  'w-5 h-5 rounded-[3px]',
                  cell ? colorMap[tetromino.color] : 'bg-transparent'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
