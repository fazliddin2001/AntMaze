import React, { useState } from 'react';
import { MazeConfig, MazeHistoryItem } from '../types';
import { Settings2, Play, Trophy, Menu, X, History } from 'lucide-react';

interface ControlsProps {
  config: MazeConfig;
  onChange: (config: MazeConfig) => void;
  onGenerate: () => void;
  onReplay: (item: MazeHistoryItem) => void;
  history: MazeHistoryItem[];
  currentMazeId: string | null;
  stats: { steps: number; food: number; maxFood: number };
  bestScore: number | null;
}

const Controls: React.FC<ControlsProps> = ({ 
  config, 
  onChange, 
  onGenerate, 
  onReplay,
  history, 
  currentMazeId,
  stats, 
  bestScore 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  const handleChange = (key: keyof MazeConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleGenerate = () => {
    onGenerate();
    setIsOpen(false);
  };

  const handleReplay = (item: MazeHistoryItem) => {
    onReplay(item);
    setIsOpen(false);
  };

  return (
    <>
      {/* Closed State HUD & Toggle */}
      <div className="fixed top-4 left-4 z-40 flex gap-3">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg border border-slate-600 transition-transform hover:scale-105"
        >
          <Menu size={24} />
        </button>
        
        {/* Mini HUD */}
        <div className="bg-slate-800/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg border border-slate-600 flex items-center gap-4">
           <div className="flex flex-col leading-none">
             <span className="text-[10px] text-slate-400 uppercase font-bold">Steps</span>
             <span className="text-lg font-mono">{stats.steps}</span>
           </div>
           <div className="w-px h-6 bg-slate-600"></div>
           <div className="flex flex-col leading-none">
             <span className="text-[10px] text-slate-400 uppercase font-bold">Food</span>
             <span className="text-lg font-mono text-emerald-400">{stats.food}<span className="text-xs text-slate-500">/{stats.maxFood}</span></span>
           </div>
        </div>
      </div>

      {/* Overlay/Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          {/* Drawer Panel */}
          <div className="relative bg-slate-900 w-full max-w-sm h-full shadow-2xl border-r border-slate-800 flex flex-col transform transition-transform animate-[slideRight_0.3s_ease-out]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                AntMaze
              </h1>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>

            {/* Current Game Stats */}
            <div className="p-6 bg-slate-800/30 border-b border-slate-800">
              <h2 className="text-slate-200 font-semibold flex items-center gap-2 mb-3">
                <Trophy size={18} className="text-yellow-500" />
                Current Run
              </h2>
              <div className="flex justify-between items-end">
                 <div>
                   <div className="text-sm text-slate-400">Best Score (This Maze)</div>
                   <div className="text-xl text-yellow-500 font-bold">{bestScore !== null ? `${bestScore}%` : '-'}</div>
                 </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'new' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Settings2 size={16} /> New Game
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <History size={16} /> History
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {activeTab === 'new' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Rows: {config.rows}</label>
                      <input 
                        type="range" min="8" max="32" 
                        value={config.rows} 
                        onChange={(e) => handleChange('rows', parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Cols: {config.cols}</label>
                      <input 
                        type="range" min="8" max="32" 
                        value={config.cols} 
                        onChange={(e) => handleChange('cols', parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition">
                      <label htmlFor="walls" className="text-sm text-slate-300 cursor-pointer select-none">More Walls (20%)</label>
                      <input 
                        id="walls"
                        type="checkbox" 
                        checked={config.moreWalls} 
                        onChange={(e) => handleChange('moreWalls', e.target.checked)}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition">
                      <label htmlFor="food" className="text-sm text-slate-300 cursor-pointer select-none">More Food (20%)</label>
                      <input 
                        id="food"
                        type="checkbox" 
                        checked={config.moreFood} 
                        onChange={(e) => handleChange('moreFood', e.target.checked)}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Play size={20} fill="currentColor" />
                    Generate New Maze
                  </button>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  {history.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      No games played yet.
                    </div>
                  ) : (
                    history.map((item, index) => (
                      <div 
                        key={item.id}
                        onClick={() => handleReplay(item)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${item.id === currentMazeId ? 'bg-blue-900/20 border-blue-500/50 ring-1 ring-blue-500/30' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-500 block mb-1">
                              {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <div className="text-slate-200 font-semibold text-sm">
                              {item.config.rows}x{item.config.cols} Maze
                            </div>
                          </div>
                          {item.bestScore !== null && (
                            <div className="bg-yellow-900/30 text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">
                              Best: {item.bestScore}%
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 text-[10px] text-slate-400">
                          <span className={`px-1.5 py-0.5 rounded ${item.config.moreWalls ? 'bg-red-900/30 text-red-400' : 'bg-slate-700'}`}>
                            {item.config.moreWalls ? '+Walls' : 'Normal Walls'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded ${item.config.moreFood ? 'bg-green-900/30 text-green-400' : 'bg-slate-700'}`}>
                            {item.config.moreFood ? '+Food' : 'Normal Food'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 text-xs text-slate-600 text-center bg-slate-900">
              AntMaze v1.1
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Controls;