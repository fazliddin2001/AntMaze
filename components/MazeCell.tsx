import React from 'react';
import { CellType, Position } from '../types';
import { Apple, Cherry, Home, BrickWall } from 'lucide-react';

interface MazeCellProps {
  type: number;
  row: number;
  col: number;
  isAnt: boolean;
  isHighlight: boolean;
  isVisited: boolean;
  popupValue?: number;
  onClick: (pos: Position) => void;
}

const AntIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg filter overflow-visible">
    <style>
      {`
        @keyframes leg-wiggle-1 { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }
        @keyframes leg-wiggle-2 { 0%, 100% { transform: rotate(10deg); } 50% { transform: rotate(-10deg); } }
        @keyframes antenna-twitch { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        .ant-leg-1 { transform-origin: 12px 12px; animation: leg-wiggle-1 0.2s infinite ease-in-out; }
        .ant-leg-2 { transform-origin: 12px 12px; animation: leg-wiggle-2 0.2s infinite ease-in-out; }
        .ant-head { animation: antenna-twitch 1s infinite ease-in-out; transform-origin: 12px 12px; }
      `}
    </style>
    
    {/* Legs Group 1 */}
    <g className="ant-leg-1">
      <path d="M4 18L12 16" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 18L12 16" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 7L12 9" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 7L12 9" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Legs Group 2 */}
    <g className="ant-leg-2">
      <path d="M3 13L12 12" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 13L12 12" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Body Parts */}
    <g className="ant-body">
      {/* Abdomen */}
      <ellipse cx="12" cy="17" rx="4" ry="5" fill="#795548" />
      <ellipse cx="12" cy="17" rx="3" ry="4" fill="#5D4037" />
      
      {/* Thorax */}
      <circle cx="12" cy="11" r="3.5" fill="#795548" />
      <circle cx="12" cy="11" r="2.5" fill="#5D4037" />
      
      {/* Head Group */}
      <g className="ant-head">
        <circle cx="12" cy="6" r="3" fill="#795548" />
        <circle cx="12" cy="6" r="2" fill="#5D4037" />
        
        {/* Antennae */}
        <path d="M10 4L8 1" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 4L16 1" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Eyes */}
        <circle cx="11" cy="5" r="0.8" fill="white" />
        <circle cx="13" cy="5" r="0.8" fill="white" />
        <circle cx="11" cy="5" r="0.3" fill="black" />
        <circle cx="13" cy="5" r="0.3" fill="black" />
      </g>
    </g>
  </svg>
);

const BananaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full animate-bounce" style={{ animationDuration: '2s' }}>
    <g transform="rotate(45, 12, 12)">
      <path 
        d="M6 19C6 19 8 2 18 2C18 2 14 6 12 10C10 14 6 19 6 19Z" 
        fill="#FDE047" 
        stroke="#EAB308" 
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M17.5 2L18.5 2.5" stroke="#713F12" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 19L5.5 19.5" stroke="#713F12" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

const MazeCell: React.FC<MazeCellProps> = ({ type, row, col, isAnt, isHighlight, isVisited, popupValue, onClick }) => {
  const handleClick = () => {
    if (isHighlight) {
      onClick({ row, col });
    }
  };

  let content = null;
  let bgClass = "bg-slate-800";
  let borderClass = "border-slate-700";

  // Base styling for cell
  if (type === CellType.WALL) {
    bgClass = "bg-slate-600 shadow-inner";
    content = <BrickWall className="w-full h-full text-slate-400 p-[2px]" />;
  } else if (type === CellType.START) {
    bgClass = "bg-emerald-900/30";
    if (!isAnt) content = <div className="text-[10px] text-emerald-500 font-bold">START</div>;
  } else if (type === CellType.HOME) {
    bgClass = "bg-blue-900/30 animate-pulse";
    content = <Home className="w-full h-full text-blue-400 p-[2px]" />;
  } else if (type === CellType.APPLE) {
    content = <Apple className="w-full h-full text-red-500 fill-red-500/20 p-[3px] animate-bounce" style={{ animationDuration: '2s' }} />;
  } else if (type === CellType.BANANA) {
    content = <div className="p-0.5 w-full h-full"><BananaIcon /></div>;
  } else if (type === CellType.CHERRY) {
    content = <Cherry className="w-full h-full text-purple-500 fill-purple-500/20 p-[3px] animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.8s' }} />;
  }

  // Ant Overlay
  if (isAnt) {
    content = (
      <div className="w-full h-full p-0.5 z-10 transition-transform duration-200">
        <AntIcon />
      </div>
    );
  }

  // Highlight available moves
  if (isHighlight && !isAnt) {
    bgClass = "bg-emerald-500/20 cursor-pointer hover:bg-emerald-500/30 ring-inset ring-2 ring-emerald-500/50";
  }

  return (
    <div
      onClick={handleClick}
      className={`relative w-full aspect-square border ${borderClass} ${bgClass} flex items-center justify-center transition-colors duration-200`}
    >
      {/* Visited path indicator */}
      {isVisited && !isAnt && type !== CellType.WALL && type !== CellType.HOME && type !== CellType.START && (
        <div className="absolute w-2 h-2 bg-slate-500/40 rounded-full" />
      )}

      {content}
      {popupValue && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <span className="text-xl font-black text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-score-float whitespace-nowrap">
            +{popupValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(MazeCell);