// src/game/gameEngine.ts
import { GameState, Position, TileType, Direction, LevelData, MAP_SYMBOLS } from './types';

/**
 * 创建初始游戏状态
 */
export function createInitialGameState(levelData: LevelData): GameState {
  const { map, width, height } = levelData;
  
  // 初始化游戏地图
  const gameMap: TileType[][] = Array(height).fill(null).map(() => 
    Array(width).fill(TileType.FLOOR)
  );
  
  let playerPosition: Position = { x: 0, y: 0 };
  const boxPositions: Position[] = [];
  const targetPositions: Position[] = [];
  
  // 解析地图数据
  for (let y = 0; y < map.length; y++) {
    const row = map[y];
    for (let x = 0; x < row.length; x++) {
      const cell = row[x];
      
      switch (cell) {
        case MAP_SYMBOLS.WALL:
          gameMap[y][x] = TileType.WALL;
          break;
        case MAP_SYMBOLS.PLAYER:
          playerPosition = { x, y };
          gameMap[y][x] = TileType.FLOOR;
          break;
        case MAP_SYMBOLS.PLAYER_ON_TARGET:
          playerPosition = { x, y };
          targetPositions.push({ x, y });
          gameMap[y][x] = TileType.TARGET;
          break;
        case MAP_SYMBOLS.BOX:
          boxPositions.push({ x, y });
          gameMap[y][x] = TileType.FLOOR;
          break;
        case MAP_SYMBOLS.BOX_ON_TARGET:
          boxPositions.push({ x, y });
          targetPositions.push({ x, y });
          gameMap[y][x] = TileType.TARGET;
          break;
        case MAP_SYMBOLS.TARGET:
          targetPositions.push({ x, y });
          gameMap[y][x] = TileType.TARGET;
          break;
        default:
          gameMap[y][x] = TileType.FLOOR;
      }
    }
  }
  
  return {
    level: levelData.id,
    map: gameMap,
    playerPosition,
    boxPositions,
    targetPositions,
    moves: 0,
    history: [],
    isCompleted: false
  };
}

/**
 * 获取指定方向上的下一个位置
 */
export function getNextPosition(position: Position, direction: Direction): Position {
  const { x, y } = position;
  
  switch (direction) {
    case Direction.UP:
      return { x, y: y - 1 };
    case Direction.RIGHT:
      return { x: x + 1, y };
    case Direction.DOWN:
      return { x, y: y + 1 };
    case Direction.LEFT:
      return { x: x - 1, y };
  }
}

/**
 * 检查两个位置是否相同
 */
export function isSamePosition(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * 检查指定位置是否有箱子
 */
export function hasBox(position: Position, boxPositions: Position[]): boolean {
  return boxPositions.some(box => isSamePosition(box, position));
}

/**
 * 检查指定位置是否是目标点
 */
export function isTarget(position: Position, targetPositions: Position[]): boolean {
  return targetPositions.some(target => isSamePosition(target, position));
}

/**
 * 检查指定位置是否是墙壁
 */
export function isWall(position: Position, map: TileType[][]): boolean {
  return map[position.y][position.x] === TileType.WALL;
}

/**
 * 检查游戏是否完成（所有箱子都在目标点上）
 */
export function checkGameCompletion(boxPositions: Position[], targetPositions: Position[]): boolean {
  if (boxPositions.length !== targetPositions.length) {
    return false;
  }
  
  return boxPositions.every(box => 
    targetPositions.some(target => isSamePosition(box, target))
  );
}

/**
 * 移动玩家
 */
export function movePlayer(gameState: GameState, direction: Direction): GameState {
  const { playerPosition, boxPositions, map, history, moves } = gameState;
  
  // 计算下一个位置
  const nextPosition = getNextPosition(playerPosition, direction);
  
  // 检查是否可以移动到下一个位置
  if (isWall(nextPosition, map)) {
    return gameState; // 撞墙，不能移动
  }
  
  // 检查下一个位置是否有箱子
  const boxIndex = boxPositions.findIndex(box => isSamePosition(box, nextPosition));
  
  if (boxIndex >= 0) {
    // 计算箱子的下一个位置
    const nextBoxPosition = getNextPosition(nextPosition, direction);
    
    // 检查箱子是否可以移动
    if (isWall(nextBoxPosition, map) || hasBox(nextBoxPosition, boxPositions)) {
      return gameState; // 箱子不能移动，玩家也不能移动
    }
    
    // 移动箱子
    const newBoxPositions = [...boxPositions];
    newBoxPositions[boxIndex] = nextBoxPosition;
    
    // 记录历史
    const historyItem = {
      playerPosition,
      boxPositions: [...boxPositions],
      action: `Move ${direction} and push box`
    };
    
    // 检查游戏是否完成
    const isCompleted = checkGameCompletion(newBoxPositions, gameState.targetPositions);
    
    return {
      ...gameState,
      playerPosition: nextPosition,
      boxPositions: newBoxPositions,
      moves: moves + 1,
      history: [...history, historyItem],
      isCompleted
    };
  }
  
  // 没有箱子，直接移动玩家
  const historyItem = {
    playerPosition,
    boxPositions: [...boxPositions],
    action: `Move ${direction}`
  };
  
  return {
    ...gameState,
    playerPosition: nextPosition,
    moves: moves + 1,
    history: [...history, historyItem]
  };
}

/**
 * 撤销上一步操作
 */
export function undoMove(gameState: GameState): GameState {
  const { history, moves } = gameState;
  
  if (history.length === 0) {
    return gameState; // 没有历史记录，无法撤销
  }
  
  const lastMove = history[history.length - 1];
  
  return {
    ...gameState,
    playerPosition: lastMove.playerPosition,
    boxPositions: lastMove.boxPositions,
    moves: Math.max(0, moves - 1),
    history: history.slice(0, -1),
    isCompleted: false
  };
}

/**
 * 重置当前关卡
 */
export function resetLevel(levelData: LevelData): GameState {
  return createInitialGameState(levelData);
}

/**
 * 获取渲染地图（包含玩家和箱子位置）
 */
export function getRenderMap(gameState: GameState): TileType[][] {
  const { map, playerPosition, boxPositions, targetPositions } = gameState;
  
  // 创建地图副本
  const renderMap: TileType[][] = map.map(row => [...row]);
  
  // 放置目标点
  targetPositions.forEach(target => {
    renderMap[target.y][target.x] = TileType.TARGET;
  });
  
  // 放置箱子
  boxPositions.forEach(box => {
    renderMap[box.y][box.x] = isTarget(box, targetPositions) 
      ? TileType.BOX_ON_TARGET 
      : TileType.BOX;
  });
  
  // 放置玩家
  renderMap[playerPosition.y][playerPosition.x] = isTarget(playerPosition, targetPositions)
    ? TileType.PLAYER_ON_TARGET
    : TileType.PLAYER;
  
  return renderMap;
}
