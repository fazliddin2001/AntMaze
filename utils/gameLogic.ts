import { CellType, Grid, Position, FOOD_VALUES } from '../types';

export const getShortestPath = (maze: Grid, start: Position, exit: Position): number => {
  const rows = maze.length;
  const cols = maze[0].length;
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const q: { pos: Position; dist: number }[] = [];
  
  // Directions: Up, Down, Left, Right
  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];

  q.push({ pos: start, dist: 0 });
  visited[start.row][start.col] = true;

  while (q.length > 0) {
    const { pos, dist } = q.shift()!;

    if (pos.row === exit.row && pos.col === exit.col) {
      return dist;
    }

    for (let i = 0; i < 4; i++) {
      const nr = pos.row + dr[i];
      const nc = pos.col + dc[i];

      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        !visited[nr][nc] &&
        maze[nr][nc] !== CellType.WALL
      ) {
        visited[nr][nc] = true;
        q.push({ pos: { row: nr, col: nc }, dist: dist + 1 });
      }
    }
  }
  return -1; // Should not happen given generation logic
};

export const calculateTotalFoodValue = (maze: Grid): number => {
  let total = 0;
  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[0].length; c++) {
      const cell = maze[r][c];
      if (FOOD_VALUES[cell as keyof typeof FOOD_VALUES]) {
        total += FOOD_VALUES[cell as keyof typeof FOOD_VALUES];
      }
    }
  }
  return total;
};

export const calculateScores = (
  minSteps: number,
  actualSteps: number,
  collectedFood: number,
  totalFood: number,
  totalCells: number
) => {
  // Efficiency Score Calculation
  // 100% = minSteps. 
  // 0% = Visiting all cells + revisiting (heuristic: 2 * totalCells)
  
  // Ensure we don't divide by zero or get negative range
  const maxReasonableSteps = Math.max(minSteps * 2, totalCells * 2); 
  
  let efficiencyRaw = 0;
  if (actualSteps <= minSteps) {
    efficiencyRaw = 1;
  } else if (actualSteps >= maxReasonableSteps) {
    efficiencyRaw = 0;
  } else {
    // Linear interpolation
    efficiencyRaw = 1 - ((actualSteps - minSteps) / (maxReasonableSteps - minSteps));
  }
  
  const efficiencyPercent = Math.max(0, Math.min(100, Math.round(efficiencyRaw * 100)));

  // Food Score Calculation
  let foodPercent = 0;
  if (totalFood > 0) {
    foodPercent = Math.round((collectedFood / totalFood) * 100);
  } else {
    foodPercent = 100; // If no food generated, free 100%
  }

  const finalScore = Math.round((efficiencyPercent + foodPercent) / 2);

  return { efficiencyPercent, foodPercent, finalScore };
};

export const getStorageKey = (rows: number, cols: number, moreWalls: boolean, moreFood: boolean) => {
  return `antmaze_high_${rows}x${cols}_${moreWalls ? 'w' : 'nw'}_${moreFood ? 'f' : 'nf'}`;
};