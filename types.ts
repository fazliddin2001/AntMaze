export enum CellType {
  EMPTY = 0,
  APPLE = 1,
  BANANA = 2,
  START = 3,
  CHERRY = 4,
  WALL = 7,
  HOME = 9,
}

export const FOOD_VALUES = {
  [CellType.APPLE]: 100,
  [CellType.BANANA]: 200,
  [CellType.CHERRY]: 300,
};

export interface Position {
  row: number;
  col: number;
}

export interface MazeConfig {
  rows: number;
  cols: number;
  moreWalls: boolean;
  moreFood: boolean;
}

export interface GameStats {
  stepsTaken: number;
  foodCollected: number;
  totalFoodAvailable: number;
  minSteps: number; // Shortest path distance
  maxReasonableSteps: number; // Used for percentage calc
}

export interface HighScore {
  efficiencyScore: number;
  foodScore: number;
  totalScore: number;
  date: string;
}

export interface MazeHistoryItem {
  id: string;
  timestamp: number;
  config: MazeConfig;
  maze: Grid;
  start: Position;
  exit: Position;
  minSteps: number;
  maxFood: number;
  totalCells: number;
  bestScore: number | null;
}

export interface ScorePopup {
  id: number;
  row: number;
  col: number;
  value: number;
}

export type Grid = number[][];