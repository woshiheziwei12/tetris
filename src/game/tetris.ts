// 俄罗斯方块核心类型和常量

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// 方块形状定义 (I, O, T, S, Z, J, L)
export const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: 'cyan',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'yellow',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'purple',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: 'green',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: 'red',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'pink',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'orange',
  },
};

export type TetrominoType = keyof typeof TETROMINOS;
export type CellColor = 'cyan' | 'yellow' | 'purple' | 'green' | 'red' | 'pink' | 'orange' | null;

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: TetrominoType;
  position: Position;
  shape: number[][];
  color: CellColor;
}

export interface GameState {
  board: CellColor[][];
  currentPiece: Piece | null;
  nextPiece: TetrominoType;
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
}

// 创建空棋盘
export function createEmptyBoard(): CellColor[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
}

// 随机获取方块类型
export function getRandomTetromino(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

// 创建新方块
export function createPiece(type: TetrominoType): Piece {
  const tetromino = TETROMINOS[type];
  return {
    type,
    position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2), y: 0 },
    shape: tetromino.shape.map(row => [...row]),
    color: tetromino.color as CellColor,
  };
}

// 旋转方块
export function rotatePiece(piece: Piece): Piece {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const rotated: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rotated[x][rows - 1 - y] = piece.shape[y][x];
    }
  }
  
  return { ...piece, shape: rotated };
}

// 检查碰撞
export function checkCollision(board: CellColor[][], piece: Piece, offset: Position = { x: 0, y: 0 }): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.position.x + x + offset.x;
        const newY = piece.position.y + y + offset.y;
        
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return true;
        }
        
        if (newY >= 0 && board[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

// 将方块固定到棋盘
export function mergePieceToBoard(board: CellColor[][], piece: Piece): CellColor[][] {
  const newBoard = board.map(row => [...row]);
  
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }
  
  return newBoard;
}

// 清除完整行
export function clearLines(board: CellColor[][]): { newBoard: CellColor[][], linesCleared: number } {
  const newBoard = board.filter(row => row.some(cell => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }
  
  return { newBoard, linesCleared };
}

// 计算分数
export function calculateScore(lines: number, level: number): number {
  const lineScores = [0, 100, 300, 500, 800];
  return lineScores[lines] * (level + 1);
}

// 计算等级
export function calculateLevel(totalLines: number): number {
  return Math.floor(totalLines / 10);
}

// 计算下落速度 (毫秒)
export function calculateSpeed(level: number): number {
  return Math.max(100, 1000 - level * 100);
}

// 生成垃圾行（带一个随机空格），使用种子确保双方公平
export function generateGarbageRows(count: number, seed: number): CellColor[][] {
  const garbageColor: CellColor = 'purple';
  const rows: CellColor[][] = [];
  let s = seed;

  for (let i = 0; i < count; i++) {
    // 简易伪随机，确保同种子产生相同结果
    s = (s * 16807 + 0) % 2147483647;
    const gapIndex = s % BOARD_WIDTH;
    const row: CellColor[] = Array(BOARD_WIDTH).fill(garbageColor);
    row[gapIndex] = null;
    rows.push(row);
  }

  return rows;
}

// 将垃圾行插入棋盘底部
export function addGarbageRows(board: CellColor[][], garbageRows: CellColor[][]): CellColor[][] {
  const newBoard = [...board.slice(garbageRows.length), ...garbageRows];
  return newBoard;
}

// 根据等级计算垃圾行数
export function getGarbageCountForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  return 3;
}

// 嘲讽文字
export const TAUNT_MESSAGES = [
  "你太菜了！",
  "就这？就这？",
  "回去练练再来吧！",
  "送你一血！",
  "菜得抠脚！",
  "你是来搞笑的吗？",
  "躺赢真舒服！",
  "这也能输？",
  "下次记得带脑子！",
  "你确定你玩过方块？",
];

export function getRandomTaunt(): string {
  return TAUNT_MESSAGES[Math.floor(Math.random() * TAUNT_MESSAGES.length)];
}
