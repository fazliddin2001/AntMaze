import { CellType, Grid, Position } from '../types';

// Direction vectors for 4-directional movement
const DX = [-1, 1, 0, 0];
const DY = [0, 0, -1, 1];

class AntMazeGenerator {
  private N: number;
  private M: number;
  private moreWalls: boolean;
  private moreFood: boolean;
  private maze: Grid;
  private startPos: Position;
  private exitPos: Position;

  constructor(rows: number, cols: number, moreWalls: boolean, moreFood: boolean) {
    // Clamp dimensions to valid range [8, 32]
    this.N = Math.max(8, Math.min(32, rows));
    this.M = Math.max(8, Math.min(32, cols));
    this.moreWalls = moreWalls;
    this.moreFood = moreFood;
    this.maze = Array(this.N).fill(null).map(() => Array(this.M).fill(CellType.EMPTY));
    this.startPos = { row: 0, col: 0 };
    this.exitPos = { row: 0, col: 0 };
  }

  private isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.N && y >= 0 && y < this.M;
  }

  // BFS to check if path exists from start to exit
  private hasPath(): boolean {
    const visited: boolean[][] = Array(this.N).fill(null).map(() => Array(this.M).fill(false));
    const q: Position[] = [];

    q.push({ ...this.startPos });
    visited[this.startPos.row][this.startPos.col] = true;

    while (q.length > 0) {
      const curr = q.shift()!;

      if (curr.row === this.exitPos.row && curr.col === this.exitPos.col) {
        return true;
      }

      for (let i = 0; i < 4; i++) {
        const nx = curr.row + DX[i];
        const ny = curr.col + DY[i];

        if (this.isValid(nx, ny) && !visited[nx][ny] && this.maze[nx][ny] !== CellType.WALL) {
          visited[nx][ny] = true;
          q.push({ row: nx, col: ny });
        }
      }
    }
    return false;
  }

  private placeStartAndExit() {
    // Randomly decide if start is at top or bottom
    const startAtTop = Math.random() < 0.5;

    if (startAtTop) {
      this.startPos.row = 0;
      this.exitPos.row = this.N - 1;
    } else {
      this.startPos.row = this.N - 1;
      this.exitPos.row = 0;
    }

    this.startPos.col = Math.floor(Math.random() * this.M);
    this.exitPos.col = Math.floor(Math.random() * this.M);

    this.maze[this.startPos.row][this.startPos.col] = CellType.START;
    this.maze[this.exitPos.row][this.exitPos.col] = CellType.HOME;
  }

  private placeWalls() {
    const wallPercentage = this.moreWalls ? 0.20 : 0.10;
    const totalCells = this.N * this.M;
    const wallsToPlace = Math.floor(totalCells * wallPercentage);

    let wallsPlaced = 0;
    let attempts = 0;
    const maxAttempts = totalCells * 5;

    while (wallsPlaced < wallsToPlace && attempts < maxAttempts) {
      attempts++;
      const r = Math.floor(Math.random() * this.N);
      const c = Math.floor(Math.random() * this.M);

      if (this.maze[r][c] !== CellType.EMPTY) {
        continue;
      }

      // Temporarily place wall
      this.maze[r][c] = CellType.WALL;

      if (this.hasPath()) {
        wallsPlaced++;
      } else {
        // Backtrack
        this.maze[r][c] = CellType.EMPTY;
      }
    }
  }

  private placeFood() {
    const foodPercentage = this.moreFood ? 0.20 : 0.10;
    const totalCells = this.N * this.M;
    const foodToPlace = Math.floor(totalCells * foodPercentage);
    
    // Types: 1=Apple, 2=Banana, 3->4=Cherry
    const foodTypes = [CellType.APPLE, CellType.BANANA, CellType.CHERRY];

    let foodPlaced = 0;
    let attempts = 0;
    const maxAttempts = totalCells * 3;

    while (foodPlaced < foodToPlace && attempts < maxAttempts) {
      attempts++;
      const r = Math.floor(Math.random() * this.N);
      const c = Math.floor(Math.random() * this.M);

      if (this.maze[r][c] !== CellType.EMPTY) {
        continue;
      }

      const typeIndex = Math.floor(Math.random() * foodTypes.length);
      this.maze[r][c] = foodTypes[typeIndex];
      foodPlaced++;
    }
  }

  public generate(): { maze: Grid; start: Position; exit: Position } {
    // Reset
    this.maze = Array(this.N).fill(null).map(() => Array(this.M).fill(CellType.EMPTY));
    
    this.placeStartAndExit();
    this.placeWalls();
    this.placeFood();

    return {
      maze: this.maze,
      start: { ...this.startPos },
      exit: { ...this.exitPos }
    };
  }
}

export const generateMaze = (rows: number, cols: number, moreWalls: boolean, moreFood: boolean) => {
  const generator = new AntMazeGenerator(rows, cols, moreWalls, moreFood);
  return generator.generate();
};