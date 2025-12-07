import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CellType, MazeConfig, Position, FOOD_VALUES, Grid, MazeHistoryItem, ScorePopup } from './types';
import { generateMaze } from './utils/mazeGenerator';
import { calculateScores, getShortestPath, calculateTotalFoodValue, getStorageKey } from './utils/gameLogic';
import MazeCell from './components/MazeCell';
import Controls from './components/Controls';
import { RefreshCw, Star, X, RotateCcw, ArrowRight } from 'lucide-react';

const INITIAL_CONFIG: MazeConfig = {
  rows: 12,
  cols: 12,
  moreWalls: false,
  moreFood: true,
};

const App: React.FC = () => {
  const [config, setConfig] = useState<MazeConfig>(INITIAL_CONFIG);
  
  // Game State
  const [maze, setMaze] = useState<Grid>([]);
  const [antPos, setAntPos] = useState<Position>({ row: 0, col: 0 });
  const [homePos, setHomePos] = useState<Position>({ row: 0, col: 0 });
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  
  // Track visited cells for path visualization. Key: "row,col"
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  
  const [steps, setSteps] = useState(0);
  const [collectedFood, setCollectedFood] = useState(0);
  
  // Current Maze Metadata (for scoring)
  const [maxFood, setMaxFood] = useState(0);
  const [minSteps, setMinSteps] = useState(0);
  const [totalCells, setTotalCells] = useState(0);
  
  // History & Identity
  const [history, setHistory] = useState<MazeHistoryItem[]>([]);
  const [currentMazeId, setCurrentMazeId] = useState<string | null>(null);

  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [result, setResult] = useState<{ efficiency: number; food: number; total: number; stepsTaken: number } | null>(null);
  
  // Best score for the current maze ID
  const [bestScore, setBestScore] = useState<number | null>(null);

  const mazeRef = useRef<HTMLDivElement>(null);

  // Load a game (New or Replay)
  const loadGame = useCallback((item: MazeHistoryItem) => {
    // Deep copy maze to ensure fresh state (food reset)
    // NOTE: item.maze is the INITIAL state of that maze
    const freshMaze = item.maze.map(row => [...row]);
    
    setMaze(freshMaze);
    setAntPos({ ...item.start });
    setHomePos({ ...item.exit });
    
    setSteps(0);
    setCollectedFood(0);
    setMaxFood(item.maxFood);
    setMinSteps(item.minSteps);
    setTotalCells(item.totalCells);
    setPopups([]); // Clear old popups on load
    setVisitedCells(new Set([`${item.start.row},${item.start.col}`]));
    
    setCurrentMazeId(item.id);
    setBestScore(item.bestScore);
    
    setGameState('playing');
    setResult(null);
  }, []);

  // Generate a brand new maze
  const generateAndStartGame = useCallback(() => {
    const { maze: newMaze, start, exit } = generateMaze(
      config.rows, 
      config.cols, 
      config.moreWalls, 
      config.moreFood
    );

    const calculatedMinSteps = getShortestPath(newMaze, start, exit);
    const calculatedMaxFood = calculateTotalFoodValue(newMaze);
    const calculatedTotalCells = config.rows * config.cols;

    const newItem: MazeHistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      config: { ...config },
      maze: newMaze, // Store original state
      start,
      exit,
      minSteps: calculatedMinSteps,
      maxFood: calculatedMaxFood,
      totalCells: calculatedTotalCells,
      bestScore: null
    };

    setHistory(prev => [newItem, ...prev]);
    loadGame(newItem);
  }, [config, loadGame]);

  // Initial load
  useEffect(() => {
    generateAndStartGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Movement Logic
  const handleMove = useCallback((target: Position) => {
    if (gameState !== 'playing') return;

    const { row, col } = target;
    
    // Boundary check
    if (row < 0 || row >= maze.length || col < 0 || col >= maze[0].length) return;
    
    // Check adjacency (Manhattan distance === 1)
    const dRow = Math.abs(row - antPos.row);
    const dCol = Math.abs(col - antPos.col);
    if (dRow + dCol !== 1) return;

    // Wall check
    const cellContent = maze[row][col];
    if (cellContent === CellType.WALL) return;

    // Update Steps
    const newSteps = steps + 1;
    setSteps(newSteps);

    // Process Cell Content
    let newCollectedFood = collectedFood;
    const newMaze = [...maze.map(r => [...r])]; // Deep copy

    // Handle Food
    if (FOOD_VALUES[cellContent as keyof typeof FOOD_VALUES]) {
      const foodValue = FOOD_VALUES[cellContent as keyof typeof FOOD_VALUES];
      newCollectedFood += foodValue;
      newMaze[row][col] = CellType.EMPTY; // Eat food
      setCollectedFood(newCollectedFood);
      setMaze(newMaze);

      // Trigger Score Popup
      const popupId = Date.now();
      setPopups(prev => [...prev, { id: popupId, row, col, value: foodValue }]);
      
      // Auto remove popup after animation
      setTimeout(() => {
        setPopups(prev => prev.filter(p => p.id !== popupId));
      }, 800);
    }

    // Move Ant and update visited
    setAntPos(target);
    setVisitedCells(prev => {
      const next = new Set(prev);
      next.add(`${target.row},${target.col}`);
      return next;
    });

    // Handle Win
    if (row === homePos.row && col === homePos.col) {
      const scores = calculateScores(minSteps, newSteps, newCollectedFood, maxFood, totalCells);
      setResult({ 
        efficiency: scores.efficiencyPercent, 
        food: scores.foodPercent, 
        total: scores.finalScore,
        stepsTaken: newSteps
      });

      // Update High Score for this specific maze
      if (currentMazeId) {
        setHistory(prevHistory => {
          return prevHistory.map(item => {
            if (item.id === currentMazeId) {
              // Update best score if current is better or null
              const newBest = !item.bestScore || scores.finalScore > item.bestScore 
                ? scores.finalScore 
                : item.bestScore;
              
              if (newBest !== item.bestScore) {
                 setBestScore(newBest);
              }
              return { ...item, bestScore: newBest };
            }
            return item;
          });
        });

        // RESTART GAME IN BACKGROUND
        const currentItem = history.find(h => h.id === currentMazeId);
        if (currentItem) {
          // Reset to initial state
          const freshMaze = currentItem.maze.map(r => [...r]);
          setMaze(freshMaze);
          setAntPos({ ...currentItem.start });
          setSteps(0);
          setCollectedFood(0);
          setPopups([]);
          setVisitedCells(new Set([`${currentItem.start.row},${currentItem.start.col}`]));
        }
      }
      
      setGameState('won');
    }

  }, [gameState, antPos, maze, steps, collectedFood, homePos, maxFood, minSteps, totalCells, currentMazeId, history]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      let target = { ...antPos };
      const key = e.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') target.row--;
      else if (key === 'arrowdown' || key === 's') target.row++;
      else if (key === 'arrowleft' || key === 'a') target.col--;
      else if (key === 'arrowright' || key === 'd') target.col++;
      else return;

      handleMove(target);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [antPos, gameState, handleMove]);


  // Helper to determine if a cell is reachable (for highlighting)
  const isAdjacent = (r: number, c: number) => {
    if (maze[r][c] === CellType.WALL) return false;
    const dRow = Math.abs(r - antPos.row);
    const dCol = Math.abs(c - antPos.col);
    return dRow + dCol === 1;
  };

  const handleReplayCurrent = () => {
    const currentItem = history.find(h => h.id === currentMazeId);
    if (currentItem) {
      loadGame(currentItem);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white overflow-hidden">
      
      {/* Controls Drawer */}
      <Controls 
        config={config} 
        onChange={setConfig} 
        onGenerate={generateAndStartGame}
        onReplay={loadGame}
        history={history}
        currentMazeId={currentMazeId}
        stats={{ steps, food: collectedFood, maxFood }} 
        bestScore={bestScore}
      />

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        
        {/* Maze Container */}
        <div 
          ref={mazeRef}
          className="relative bg-slate-800 p-2 rounded-xl shadow-2xl border border-slate-700 aspect-square transition-all duration-300"
          style={{
             display: 'grid',
             gridTemplateColumns: `repeat(${maze[0]?.length || 1}, minmax(0, 1fr))`,
             width: 'min(90vw, 85vh)', 
             height: 'min(90vw, 85vh)',
          }}
        >
          {maze.map((row, rIndex) => (
            row.map((cell, cIndex) => {
              // Check for popup at this position
              const popup = popups.find(p => p.row === rIndex && p.col === cIndex);
              
              return (
                <MazeCell
                  key={`${rIndex}-${cIndex}`}
                  type={cell}
                  row={rIndex}
                  col={cIndex}
                  isAnt={antPos.row === rIndex && antPos.col === cIndex}
                  isHighlight={gameState === 'playing' && isAdjacent(rIndex, cIndex)}
                  isVisited={visitedCells.has(`${rIndex},${cIndex}`)}
                  popupValue={popup?.value}
                  onClick={handleMove}
                />
              );
            })
          ))}
        </div>

        {/* Win Overlay */}
        {gameState === 'won' && result && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Level Complete!
                </h2>
                <button onClick={() => setGameState('playing')} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center py-4">
                  <div className="relative">
                    <Star size={80} className="text-yellow-500 fill-yellow-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                      {result.total}%
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-300">Efficiency</span>
                    <span className="font-mono font-bold text-emerald-400">{result.efficiency}%</span>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-300">Food Collection</span>
                    <span className="font-mono font-bold text-emerald-400">{result.food}%</span>
                  </div>
                  <div className="text-xs text-slate-500 text-center px-4">
                     Minimum steps were {minSteps}. You took {result.stepsTaken} steps.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleReplayCurrent}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-2 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
                  >
                    <RotateCcw size={18} />
                    Replay Level
                  </button>
                  <button 
                    onClick={generateAndStartGame}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-2 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-emerald-900/30"
                  >
                    <ArrowRight size={18} />
                    Next Maze
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;