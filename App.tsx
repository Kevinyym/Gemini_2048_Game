
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Logic from './services/gameLogic.ts';
import { GameState, Direction } from './types.ts';
import TileComponent from './components/TileComponent.tsx';
import AIHintPanel from './components/AIHintPanel.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    grid: Logic.createEmptyGrid(),
    score: 0,
    bestScore: 0,
    status: 'PLAYING',
    moveCount: 0,
  });

  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  const initGame = useCallback(() => {
    let grid = Logic.createEmptyGrid();
    grid = Logic.addRandomTile(grid);
    grid = Logic.addRandomTile(grid);
    
    setState(prev => ({
      ...prev,
      grid,
      score: 0,
      status: 'PLAYING',
      moveCount: 0,
    }));
  }, []);

  useEffect(() => {
    initGame();
    const stored = localStorage.getItem('2048-best-score');
    if (stored) {
      setState(prev => ({ ...prev, bestScore: parseInt(stored) }));
    }
  }, [initGame]);

  const handleMove = useCallback((direction: Direction) => {
    if (state.status !== 'PLAYING') return;

    const { grid: movedGrid, score: addScore, moved } = Logic.move(state.grid, direction);

    if (moved) {
      const updatedGrid = Logic.addRandomTile(movedGrid);
      const newScore = state.score + addScore;
      const isWon = Logic.checkWin(updatedGrid);
      const isLost = Logic.checkGameOver(updatedGrid);

      setState(prev => {
        const best = Math.max(prev.bestScore, newScore);
        if (best > prev.bestScore) localStorage.setItem('2048-best-score', best.toString());
        
        return {
          ...prev,
          grid: updatedGrid,
          score: newScore,
          bestScore: best,
          status: isWon ? 'WON' : (isLost ? 'LOST' : 'PLAYING'),
          moveCount: prev.moveCount + 1
        };
      });
    }
  }, [state.grid, state.score, state.status, state.bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': handleMove('UP'); break;
        case 'ArrowDown': handleMove('DOWN'); break;
        case 'ArrowLeft': handleMove('LEFT'); break;
        case 'ArrowRight': handleMove('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 20) {
      if (absX > absY) handleMove(dx > 0 ? 'RIGHT' : 'LEFT');
      else handleMove(dy > 0 ? 'DOWN' : 'UP');
    }
    touchStartRef.current = null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full max-w-md flex flex-col items-stretch gap-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-extrabold text-slate-800 tracking-tighter">2048</h1>
            <p className="text-slate-500 font-semibold mt-1">Join the numbers!</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-slate-200 px-4 py-2 rounded-xl text-center min-w-[80px]">
              <div className="text-[10px] uppercase font-bold text-slate-500">Score</div>
              <div className="text-xl font-bold text-slate-700">{state.score}</div>
            </div>
            <div className="bg-slate-200 px-4 py-2 rounded-xl text-center min-w-[80px]">
              <div className="text-[10px] uppercase font-bold text-slate-500">Best</div>
              <div className="text-xl font-bold text-slate-700">{state.bestScore}</div>
            </div>
          </div>
        </div>

        <div className="relative aspect-square w-full bg-slate-400 rounded-xl p-1.5 shadow-inner">
          <div className="absolute inset-1.5 grid grid-cols-4 grid-rows-4 gap-0">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="m-1.5 bg-slate-300 rounded-lg" />
            ))}
          </div>
          
          <div className="absolute inset-1.5">
            {state.grid.flat().map(tile => tile && (
              <TileComponent key={tile.id} tile={tile} />
            ))}
          </div>

          {state.status !== 'PLAYING' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl animate-in fade-in duration-300">
              <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                {state.status === 'WON' ? 'CONGRATS!' : 'GAME OVER'}
              </h2>
              <button 
                onClick={initGame}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        <AIHintPanel grid={state.grid} score={state.score} onApplyHint={(dir) => handleMove(dir as Direction)} />
      </div>
    </div>
  );
};

export default App;
