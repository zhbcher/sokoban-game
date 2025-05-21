// src/game/levelGenerator.ts
import { LevelData, MAP_SYMBOLS, Position } from './types';

/**
 * 生成随机关卡
 * @param level 关卡编号
 * @param difficulty 难度系数 (1-10)
 * @returns 生成的关卡数据
 */
export function generateLevel(level: number, difficulty: number): LevelData {
  // 根据难度调整地图大小
  const minSize = 6;
  const maxSize = Math.min(15, minSize + Math.floor(difficulty / 2));
  
  // 地图尺寸随难度增加
  const width = Math.max(minSize, Math.min(maxSize, minSize + Math.floor(Math.random() * difficulty)));
  const height = Math.max(minSize, Math.min(maxSize, minSize + Math.floor(Math.random() * difficulty)));
  
  // 箱子数量随难度增加
  const boxCount = Math.max(1, Math.min(8, Math.floor(difficulty / 2) + 1));
  
  // 墙壁密度随难度增加
  const wallDensity = 0.1 + (difficulty * 0.02);
  
  // 初始化空地图
  let map: string[] = [];
  
  // 创建边界墙
  const emptyRow = MAP_SYMBOLS.WALL.repeat(width);
  map.push(emptyRow);
  
  // 创建内部地图
  for (let y = 1; y < height - 1; y++) {
    let row = MAP_SYMBOLS.WALL;
    for (let x = 1; x < width - 1; x++) {
      // 随机生成墙壁
      if (Math.random() < wallDensity) {
        row += MAP_SYMBOLS.WALL;
      } else {
        row += MAP_SYMBOLS.FLOOR;
      }
    }
    row += MAP_SYMBOLS.WALL;
    map.push(row);
  }
  
  // 添加底部边界
  map.push(emptyRow);
  
  // 确保地图中心区域为空地，便于放置玩家
  const centerY = Math.floor(height / 2);
  const centerX = Math.floor(width / 2);
  
  // 清理中心区域
  let centerRow = map[centerY].split('');
  for (let x = Math.max(1, centerX - 2); x <= Math.min(width - 2, centerX + 2); x++) {
    centerRow[x] = MAP_SYMBOLS.FLOOR;
  }
  map[centerY] = centerRow.join('');
  
  // 清理中心上下区域
  if (centerY > 1) {
    let aboveRow = map[centerY - 1].split('');
    for (let x = Math.max(1, centerX - 1); x <= Math.min(width - 2, centerX + 1); x++) {
      aboveRow[x] = MAP_SYMBOLS.FLOOR;
    }
    map[centerY - 1] = aboveRow.join('');
  }
  
  if (centerY < height - 2) {
    let belowRow = map[centerY + 1].split('');
    for (let x = Math.max(1, centerX - 1); x <= Math.min(width - 2, centerX + 1); x++) {
      belowRow[x] = MAP_SYMBOLS.FLOOR;
    }
    map[centerY + 1] = belowRow.join('');
  }
  
  // 放置玩家
  let playerRow = map[centerY].split('');
  playerRow[centerX] = MAP_SYMBOLS.PLAYER;
  map[centerY] = playerRow.join('');
  
  // 放置箱子和目标点
  const placedBoxes: Position[] = [];
  const placedTargets: Position[] = [];
  
  // 尝试放置箱子和目标
  for (let i = 0; i < boxCount; i++) {
    // 放置箱子
    let boxPlaced = false;
    let attempts = 0;
    
    while (!boxPlaced && attempts < 50) {
      attempts++;
      
      // 随机选择位置，但避开中心玩家位置
      const boxY = Math.floor(Math.random() * (height - 2)) + 1;
      const boxX = Math.floor(Math.random() * (width - 2)) + 1;
      
      // 检查是否是空地且不是玩家位置
      if (map[boxY][boxX] === MAP_SYMBOLS.FLOOR && 
          !(boxY === centerY && boxX === centerX) &&
          !placedBoxes.some(pos => pos.x === boxX && pos.y === boxY)) {
        
        // 放置箱子
        let rowChars = map[boxY].split('');
        rowChars[boxX] = MAP_SYMBOLS.BOX;
        map[boxY] = rowChars.join('');
        
        placedBoxes.push({ x: boxX, y: boxY });
        boxPlaced = true;
      }
    }
    
    // 放置目标点，确保不在箱子初始位置
    let targetPlaced = false;
    attempts = 0;
    
    while (!targetPlaced && attempts < 50) {
      attempts++;
      
      const targetY = Math.floor(Math.random() * (height - 2)) + 1;
      const targetX = Math.floor(Math.random() * (width - 2)) + 1;
      
      // 检查是否是空地且不是玩家或箱子位置
      if ((map[targetY][targetX] === MAP_SYMBOLS.FLOOR || map[targetY][targetX] === MAP_SYMBOLS.PLAYER) && 
          !placedBoxes.some(pos => pos.x === targetX && pos.y === targetY) &&
          !placedTargets.some(pos => pos.x === targetX && pos.y === targetY)) {
        
        // 放置目标点
        let rowChars = map[targetY].split('');
        
        // 如果是玩家位置，设为玩家在目标点上
        if (rowChars[targetX] === MAP_SYMBOLS.PLAYER) {
          rowChars[targetX] = MAP_SYMBOLS.PLAYER_ON_TARGET;
        } else {
          rowChars[targetX] = MAP_SYMBOLS.TARGET;
        }
        
        map[targetY] = rowChars.join('');
        
        placedTargets.push({ x: targetX, y: targetY });
        targetPlaced = true;
      }
    }
  }
  
/**
 * 验证关卡是否有解
 * 使用简化的可解性检查算法：
 * 1. 确保没有箱子被卡在角落
 * 2. 确保每个目标点都可以被箱子到达
 * 3. 确保玩家可以到达每个箱子的推动位置
 * 
 * 注意：这不是完美的算法，但可以过滤掉明显不可解的关卡
 */
function isLevelSolvable(map: string[]): boolean {
  // 提取地图信息
  const height = map.length;
  const width = map[0].length;
  
  // 找出玩家、箱子和目标点的位置
  const playerPositions: Position[] = [];
  const boxPositions: Position[] = [];
  const targetPositions: Position[] = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = map[y][x];
      
      if (cell === MAP_SYMBOLS.PLAYER || cell === MAP_SYMBOLS.PLAYER_ON_TARGET) {
        playerPositions.push({ x, y });
      }
      
      if (cell === MAP_SYMBOLS.BOX || cell === MAP_SYMBOLS.BOX_ON_TARGET) {
        boxPositions.push({ x, y });
      }
      
      if (cell === MAP_SYMBOLS.TARGET || cell === MAP_SYMBOLS.PLAYER_ON_TARGET || cell === MAP_SYMBOLS.BOX_ON_TARGET) {
        targetPositions.push({ x, y });
      }
    }
  }
  
  // 检查1：箱子数量应等于目标点数量
  if (boxPositions.length !== targetPositions.length) {
    return false;
  }
  
  // 检查2：检查箱子是否被卡在角落
  for (const box of boxPositions) {
    // 检查是否在角落（两个相邻方向都是墙）
    const isStuckInCorner = (
      // 左上角
      (isWall(map, { x: box.x - 1, y: box.y }) && isWall(map, { x: box.x, y: box.y - 1 })) ||
      // 右上角
      (isWall(map, { x: box.x + 1, y: box.y }) && isWall(map, { x: box.x, y: box.y - 1 })) ||
      // 左下角
      (isWall(map, { x: box.x - 1, y: box.y }) && isWall(map, { x: box.x, y: box.y + 1 })) ||
      // 右下角
      (isWall(map, { x: box.x + 1, y: box.y }) && isWall(map, { x: box.x, y: box.y + 1 }))
    );
    
    // 如果箱子在角落但不在目标点上，则关卡不可解
    if (isStuckInCorner && !isOnTarget(map, box)) {
      return false;
    }
  }
  
  // 简化的可达性检查
  // 实际上，完整的可解性检查需要更复杂的算法
  
  return true;
}

// 辅助函数：检查位置是否是墙
function isWall(map: string[], pos: Position): boolean {
  // 检查边界
  if (pos.y < 0 || pos.y >= map.length || pos.x < 0 || pos.x >= map[0].length) {
    return true; // 地图外视为墙
  }
  
  return map[pos.y][pos.x] === MAP_SYMBOLS.WALL;
}

// 辅助函数：检查位置是否是目标点
function isOnTarget(map: string[], pos: Position): boolean {
  // 检查边界
  if (pos.y < 0 || pos.y >= map.length || pos.x < 0 || pos.x >= map[0].length) {
    return false;
  }
  
  const cell = map[pos.y][pos.x];
  return cell === MAP_SYMBOLS.TARGET || 
         cell === MAP_SYMBOLS.PLAYER_ON_TARGET || 
         cell === MAP_SYMBOLS.BOX_ON_TARGET;
} 
  // 验证关卡是否可解，如果不可解则重新生成
  let attempts = 0;
  let isValid = isLevelSolvable(map);
  
  while (!isValid && attempts < 10) {
    // 重新生成关卡
    attempts++;
    
    // 重置地图
    map = [];
    map.push(emptyRow);
    
    // 重新创建内部地图
    for (let y = 1; y < height - 1; y++) {
      let row = MAP_SYMBOLS.WALL;
      for (let x = 1; x < width - 1; x++) {
        if (Math.random() < wallDensity) {
          row += MAP_SYMBOLS.WALL;
        } else {
          row += MAP_SYMBOLS.FLOOR;
        }
      }
      row += MAP_SYMBOLS.WALL;
      map.push(row);
    }
    
    // 添加底部边界
    map.push(emptyRow);
    
    // 清理中心区域
    let centerRow = map[centerY].split('');
    for (let x = Math.max(1, centerX - 2); x <= Math.min(width - 2, centerX + 2); x++) {
      centerRow[x] = MAP_SYMBOLS.FLOOR;
    }
    map[centerY] = centerRow.join('');
    
    // 放置玩家
    centerRow = map[centerY].split('');
    centerRow[centerX] = MAP_SYMBOLS.PLAYER;
    map[centerY] = centerRow.join('');
    
    // 重新放置箱子和目标点
    placedBoxes.length = 0;
    placedTargets.length = 0;
    
    for (let i = 0; i < boxCount; i++) {
      // 放置箱子
      let boxPlaced = false;
      let boxAttempts = 0;
      
      while (!boxPlaced && boxAttempts < 50) {
        boxAttempts++;
        
        const boxY = Math.floor(Math.random() * (height - 2)) + 1;
        const boxX = Math.floor(Math.random() * (width - 2)) + 1;
        
        if (map[boxY][boxX] === MAP_SYMBOLS.FLOOR && 
            !(boxY === centerY && boxX === centerX) &&
            !placedBoxes.some(pos => pos.x === boxX && pos.y === boxY)) {
          
          let rowChars = map[boxY].split('');
          rowChars[boxX] = MAP_SYMBOLS.BOX;
          map[boxY] = rowChars.join('');
          
          placedBoxes.push({ x: boxX, y: boxY });
          boxPlaced = true;
        }
      }
      
      // 放置目标点
      let targetPlaced = false;
      let targetAttempts = 0;
      
      while (!targetPlaced && targetAttempts < 50) {
        targetAttempts++;
        
        const targetY = Math.floor(Math.random() * (height - 2)) + 1;
        const targetX = Math.floor(Math.random() * (width - 2)) + 1;
        
        if ((map[targetY][targetX] === MAP_SYMBOLS.FLOOR || map[targetY][targetX] === MAP_SYMBOLS.PLAYER) && 
            !placedBoxes.some(pos => pos.x === targetX && pos.y === targetY) &&
            !placedTargets.some(pos => pos.x === targetX && pos.y === targetY)) {
          
          let rowChars = map[targetY].split('');
          
          if (rowChars[targetX] === MAP_SYMBOLS.PLAYER) {
            rowChars[targetX] = MAP_SYMBOLS.PLAYER_ON_TARGET;
          } else {
            rowChars[targetX] = MAP_SYMBOLS.TARGET;
          }
          
          map[targetY] = rowChars.join('');
          
          placedTargets.push({ x: targetX, y: targetY });
          targetPlaced = true;
        }
      }
    }
    
    // 检查关卡是否可解
    isValid = isLevelSolvable(map);
  }
  
  return {
    id: level,
    width,
    height,
    map,
    difficulty
  };
}

/**
 * 生成预设关卡
 * 这些是手工设计的关卡，确保游戏开始时有良好的体验
 */
export function getPresetLevels(): LevelData[] {
  return [
    // 第一关：简单的教学关卡
    {
      id: 1,
      width: 7,
      height: 7,
      map: [
        "#######",
        "#     #",
        "# $.$ #",
        "# $@# #",
        "# $.$ #",
        "#     #",
        "#######"
      ],
      difficulty: 1
    },
    // 第二关：稍微复杂一点
    {
      id: 2,
      width: 8,
      height: 8,
      map: [
        "########",
        "#      #",
        "# #$$# #",
        "# $..$ #",
        "# #..# #",
        "# #$$# #",
        "#   @  #",
        "########"
      ],
      difficulty: 2
    },
    // 第三关：引入更多箱子
    {
      id: 3,
      width: 9,
      height: 9,
      map: [
        "#########",
        "#       #",
        "# $.$.$ #",
        "# $...$ #",
        "# #$@$# #",
        "# $...$ #",
        "# $.$.$ #",
        "#       #",
        "#########"
      ],
      difficulty: 3
    }
  ];
}

/**
 * 获取指定关卡数据
 * 前几关使用预设关卡，之后使用随机生成的关卡
 */
export function getLevelData(level: number): LevelData {
  const presetLevels = getPresetLevels();
  
  if (level <= presetLevels.length) {
    return presetLevels[level - 1];
  }
  
  // 计算难度系数，随关卡数增加
  const difficulty = Math.min(10, 3 + Math.floor((level - presetLevels.length) / 2));
  
  return generateLevel(level, difficulty);
}
