import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  createEmptyBoard,
  SeededRandom,
  createPiece,
  rotatePiece,
  checkCollision,
  mergePieceToBoard,
  clearLines,
  calculateScore,
  calculateLevel,
  calculateSpeed,
  generateGarbageRows,
  addGarbageRows,
  getGarbageCountForLevel,
} from './tetris';

export function useGameLogic(playerId: 1 | 2, isActive: boolean, onGameOver: () => void, garbageSeed: number, solo = false) {
  const rngRef = useRef(new SeededRandom(garbageSeed));

  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: rngRef.current.nextTetromino(),
    score: 0,
    lines: 0,
    level: 0,
    isGameOver: false,
    isPaused: false,
  }));

  const gameLoopRef = useRef<number | null>(null);
  const lastDropRef = useRef<number>(0);
  const prevLevelRef = useRef<number>(0);

  // 升级时添加垃圾行
  useEffect(() => {
    const currentLevel = gameState.level;
    if (currentLevel > prevLevelRef.current && !gameState.isGameOver) {
      const garbageCount = getGarbageCountForLevel(currentLevel);
      if (garbageCount > 0) {
        // 用 level * garbageSeed 做种子，双方相同种子 = 相同空格位置
        const seed = currentLevel * 1000 + garbageSeed;
        const garbageRows = generateGarbageRows(garbageCount, seed);
        setGameState(prev => ({
          ...prev,
          board: addGarbageRows(prev.board, garbageRows),
        }));
      }
    }
    prevLevelRef.current = currentLevel;
  }, [gameState.level, gameState.isGameOver, garbageSeed]);

  // 生成新方块（防止重入：仅当 currentPiece 为 null 时生效）
  const spawnPiece = useCallback(() => {
    setGameState(prev => {
      if (prev.currentPiece || prev.isGameOver) return prev;

      const newPiece = createPiece(prev.nextPiece);
      
      if (checkCollision(prev.board, newPiece)) {
        return { ...prev, isGameOver: true, currentPiece: null };
      }
      
      return {
        ...prev,
        currentPiece: newPiece,
        nextPiece: rngRef.current.nextTetromino(),
      };
    });
  }, []);

  // 移动方块
  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      const offset = { x: dx, y: dy };
      if (!checkCollision(prev.board, prev.currentPiece, offset)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              x: prev.currentPiece.position.x + dx,
              y: prev.currentPiece.position.y + dy,
            },
          },
        };
      }
      
      // 如果向下移动被阻挡，固定方块
      if (dy > 0) {
        const newBoard = mergePieceToBoard(prev.board, prev.currentPiece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        const newScore = prev.score + calculateScore(linesCleared, prev.level);
        const newLines = prev.lines + linesCleared;
        const newLevel = calculateLevel(newLines);
        
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: null,
          score: newScore,
          lines: newLines,
          level: newLevel,
        };
      }
      
      return prev;
    });
  }, []);

  // 旋转方块
  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      const rotated = rotatePiece(prev.currentPiece);
      
      // 尝试墙踢
      const kicks = [0, -1, 1, -2, 2];
      for (const kick of kicks) {
        const kickedPiece = { ...rotated, position: { ...rotated.position, x: rotated.position.x + kick } };
        if (!checkCollision(prev.board, kickedPiece)) {
          return { ...prev, currentPiece: kickedPiece };
        }
      }
      
      return prev;
    });
  }, []);

  // 硬降（直接落到底）
  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      let dropDistance = 0;
      while (!checkCollision(prev.board, prev.currentPiece, { x: 0, y: dropDistance + 1 })) {
        dropDistance++;
      }
      
      const droppedPiece = {
        ...prev.currentPiece,
        position: {
          ...prev.currentPiece.position,
          y: prev.currentPiece.position.y + dropDistance,
        },
      };
      
      const newBoard = mergePieceToBoard(prev.board, droppedPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      const newScore = prev.score + calculateScore(linesCleared, prev.level) + dropDistance * 2;
      const newLines = prev.lines + linesCleared;
      const newLevel = calculateLevel(newLines);
      
      return {
        ...prev,
        board: clearedBoard,
        currentPiece: null,
        score: newScore,
        lines: newLines,
        level: newLevel,
      };
    });
  }, []);

  // 重置游戏（可传入新种子以保证双方方块序列一致）
  const resetGame = useCallback((newSeed?: number) => {
    if (newSeed !== undefined) {
      rngRef.current = new SeededRandom(newSeed);
    }
    prevLevelRef.current = 0;
    setGameState({
      board: createEmptyBoard(),
      currentPiece: null,
      nextPiece: rngRef.current.nextTetromino(),
      score: 0,
      lines: 0,
      level: 0,
      isGameOver: false,
      isPaused: false,
    });
  }, []);

  // 游戏循环
  useEffect(() => {
    if (!isActive || gameState.isGameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = (timestamp: number) => {
      if (!gameState.currentPiece) {
        spawnPiece();
      } else {
        const speed = calculateSpeed(gameState.level);
        if (timestamp - lastDropRef.current >= speed) {
          movePiece(0, 1);
          lastDropRef.current = timestamp;
        }
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isActive, gameState.isGameOver, gameState.isPaused, gameState.currentPiece, gameState.level, spawnPiece, movePiece]);

  // 游戏结束回调
  useEffect(() => {
    if (gameState.isGameOver) {
      onGameOver();
    }
  }, [gameState.isGameOver, onGameOver]);

  // 键盘控制
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (playerId === 1 && !solo) {
        switch (e.key.toLowerCase()) {
          case 'a':
            movePiece(-1, 0);
            break;
          case 'd':
            movePiece(1, 0);
            break;
          case 's':
            movePiece(0, 1);
            break;
          case 'w':
            rotate();
            break;
          case ' ':
            e.preventDefault();
            hardDrop();
            break;
        }
      } else {
        switch (e.key) {
          case 'ArrowLeft':
            movePiece(-1, 0);
            break;
          case 'ArrowRight':
            movePiece(1, 0);
            break;
          case 'ArrowDown':
            movePiece(0, 1);
            break;
          case 'ArrowUp':
            rotate();
            break;
          case 'Shift':
            e.preventDefault();
            hardDrop();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, playerId, movePiece, rotate, hardDrop]);

  return {
    gameState,
    resetGame,
  };
}
