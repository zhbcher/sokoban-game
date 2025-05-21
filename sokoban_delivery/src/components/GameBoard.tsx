// src/components/GameBoard.tsx
import React, { useEffect, useState } from 'react';
import { GameState, TileType, Direction } from '../game/types';
import { getRenderMap, movePlayer, undoMove, resetLevel } from '../game/gameEngine';
import { getLevelData } from '../game/levelGenerator';
import '../styles/GameBoard.css';

interface GameBoardProps {
  initialLevel?: number;
  onLevelComplete?: (level: number, moves: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  initialLevel = 1, 
  onLevelComplete 
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [renderMap, setRenderMap] = useState<TileType[][]>([]);
  const [theme, setTheme] = useState<string>('classic');
  
  // 初始化游戏
  useEffect(() => {
    const levelData = getLevelData(currentLevel);
    const initialState = resetLevel(levelData);
    setGameState(initialState);
  }, [currentLevel]);
  
  // 更新渲染地图
  useEffect(() => {
    if (gameState) {
      const newRenderMap = getRenderMap(gameState);
      setRenderMap(newRenderMap);
      
      // 检查关卡是否完成
      if (gameState.isCompleted && onLevelComplete) {
        onLevelComplete(currentLevel, gameState.moves);
      }
    }
  }, [gameState, currentLevel, onLevelComplete]);
  
  // 处理键盘输入
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState) return;
      
      let direction: Direction | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = Direction.UP;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = Direction.RIGHT;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = Direction.DOWN;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = Direction.LEFT;
          break;
        case 'z':
        case 'Z':
          // 撤销上一步
          setGameState(undoMove(gameState));
          return;
        case 'r':
        case 'R':
          // 重置关卡
          const levelData = getLevelData(currentLevel);
          setGameState(resetLevel(levelData));
          return;
        default:
          return;
      }
      
      if (direction !== null) {
        setGameState(movePlayer(gameState, direction));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, currentLevel]);
  
  // 处理方向按钮点击
  const handleDirectionClick = (direction: Direction) => {
    if (!gameState) return;
    setGameState(movePlayer(gameState, direction));
  };
  
  // 处理撤销按钮点击
  const handleUndoClick = () => {
    if (!gameState) return;
    setGameState(undoMove(gameState));
  };
  
  // 处理重置按钮点击
  const handleResetClick = () => {
    if (!gameState) return;
    const levelData = getLevelData(currentLevel);
    setGameState(resetLevel(levelData));
  };
  
  // 处理下一关按钮点击
  const handleNextLevelClick = () => {
    setCurrentLevel(prev => prev + 1);
  };
  
  // 处理主题切换
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };
  
  // 渲染游戏瓦片
  const renderTile = (type: TileType, x: number, y: number) => {
    let tileClass = `tile ${theme}`;
    
    switch (type) {
      case TileType.WALL:
        tileClass += ' wall';
        break;
      case TileType.FLOOR:
        tileClass += ' floor';
        break;
      case TileType.TARGET:
        tileClass += ' target';
        break;
      case TileType.BOX:
        tileClass += ' box';
        break;
      case TileType.BOX_ON_TARGET:
        tileClass += ' box-on-target';
        break;
      case TileType.PLAYER:
        tileClass += ' player';
        break;
      case TileType.PLAYER_ON_TARGET:
        tileClass += ' player-on-target';
        break;
    }
    
    return (
      <div 
        key={`${x}-${y}`} 
        className={tileClass}
        style={{ gridColumn: x + 1, gridRow: y + 1 }}
      />
    );
  };
  
  if (!gameState || renderMap.length === 0) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className={`game-container ${theme}`}>
      <div className="game-info">
        <div className="level-info">Level: {currentLevel}</div>
        <div className="moves-info">Moves: {gameState.moves}</div>
        <div className="theme-selector">
          <select 
            value={theme} 
            onChange={(e) => handleThemeChange(e.target.value)}
          >
            <option value="classic">Classic</option>
            <option value="forest">Forest</option>
            <option value="space">Space</option>
            <option value="candy">Candy</option>
          </select>
        </div>
      </div>
      
      <div 
        className="game-board"
        style={{ 
          gridTemplateColumns: `repeat(${renderMap[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${renderMap.length}, 1fr)`
        }}
      >
        {renderMap.flatMap((row, y) => 
          row.map((tile, x) => renderTile(tile, x, y))
        )}
      </div>
      
      <div className="controls">
        <div className="direction-controls">
          <button onClick={() => handleDirectionClick(Direction.UP)}>↑</button>
          <div className="horizontal-controls">
            <button onClick={() => handleDirectionClick(Direction.LEFT)}>←</button>
            <button onClick={() => handleDirectionClick(Direction.RIGHT)}>→</button>
          </div>
          <button onClick={() => handleDirectionClick(Direction.DOWN)}>↓</button>
        </div>
        
        <div className="action-controls">
          <button onClick={handleUndoClick}>Undo</button>
          <button onClick={handleResetClick}>Reset</button>
          {gameState.isCompleted && (
            <button 
              className="next-level-btn"
              onClick={handleNextLevelClick}
            >
              Next Level
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
