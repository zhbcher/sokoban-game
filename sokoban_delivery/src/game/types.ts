// src/game/types.ts
export interface Position {
  x: number;
  y: number;
}

export enum TileType {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  TARGET = 'TARGET',
  BOX = 'BOX',
  BOX_ON_TARGET = 'BOX_ON_TARGET',
  PLAYER = 'PLAYER',
  PLAYER_ON_TARGET = 'PLAYER_ON_TARGET'
}

export interface GameState {
  level: number;
  map: TileType[][];
  playerPosition: Position;
  boxPositions: Position[];
  targetPositions: Position[];
  moves: number;
  history: GameHistoryItem[];
  isCompleted: boolean;
}

export interface GameHistoryItem {
  playerPosition: Position;
  boxPositions: Position[];
  action: string;
}

export enum Direction {
  UP = 'UP',
  RIGHT = 'RIGHT',
  DOWN = 'DOWN',
  LEFT = 'LEFT'
}

export interface LevelData {
  id: number;
  width: number;
  height: number;
  map: string[];
  difficulty: number;
}

// Map symbols for level data
export const MAP_SYMBOLS = {
  WALL: '#',
  FLOOR: ' ',
  PLAYER: '@',
  PLAYER_ON_TARGET: '+',
  BOX: '$',
  BOX_ON_TARGET: '*',
  TARGET: '.'
};
