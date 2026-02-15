
import React from 'react';
import { Tile } from '../types.ts';

interface TileProps {
  tile: Tile;
}

const getTileColors = (value: number): string => {
  switch (value) {
    case 2: return 'bg-slate-50 text-slate-700 shadow-sm';
    case 4: return 'bg-slate-100 text-slate-700 shadow-sm';
    case 8: return 'bg-orange-100 text-orange-700 shadow-sm';
    case 16: return 'bg-orange-200 text-orange-800';
    case 32: return 'bg-orange-400 text-white';
    case 64: return 'bg-orange-500 text-white';
    case 128: return 'bg-yellow-200 text-slate-800 text-2xl';
    case 256: return 'bg-yellow-300 text-slate-800 text-2xl';
    case 512: return 'bg-yellow-400 text-white text-2xl';
    case 1024: return 'bg-yellow-500 text-white text-xl';
    case 2048: return 'bg-yellow-600 text-white text-xl';
    default: return 'bg-slate-800 text-white text-lg';
  }
};

const TileComponent: React.FC<TileProps> = ({ tile }) => {
  const { value, row, col, isNew, isMerged } = tile;
  
  const style: React.CSSProperties = {
    transform: `translate(${col * 100}%, ${row * 100}%)`,
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: isMerged ? 10 : 1,
  };

  return (
    <div
      className="absolute w-1/4 h-1/4 p-1.5 pointer-events-none"
      style={style}
    >
      <div className={`w-full h-full flex items-center justify-center rounded-lg font-extrabold text-3xl select-none leading-none
        ${getTileColors(value)} 
        ${isNew ? 'tile-pop' : ''} 
        ${isMerged ? 'tile-merge' : ''}
      `}>
        {value}
      </div>
    </div>
  );
};

export default TileComponent;
