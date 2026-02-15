
import { Direction, Grid, Tile } from '../types.ts';

let tileCounter = 0;

export const createEmptyGrid = (): Grid => 
  Array(4).fill(null).map(() => Array(4).fill(null));

export const getEmptyPositions = (grid: Grid): [number, number][] => {
  const positions: [number, number][] = [];
  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) positions.push([r, c]);
    });
  });
  return positions;
};

export const addRandomTile = (grid: Grid): Grid => {
  const empty = getEmptyPositions(grid);
  if (empty.length === 0) return grid;
  
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = {
    id: tileCounter++,
    value: Math.random() < 0.9 ? 2 : 4,
    row: r,
    col: c,
    isNew: true
  };
  return newGrid;
};

/**
 * Core Move Logic
 * Rotation Function rotate: new_row = old_col, new_col = 3 - old_row
 * - 0 rot: Original, Left Slide = Left Slide
 * - 1 rot: 90deg CW, Bottom Row becomes Left Column. Left Slide = Slide Down
 * - 2 rot: 180deg CW, Right Column becomes Left Column. Left Slide = Slide Right
 * - 3 rot: 270deg CW, Top Row becomes Left Column. Left Slide = Slide Up
 */
export const move = (grid: Grid, direction: Direction): { grid: Grid; score: number; moved: boolean } => {
  let score = 0;
  let moved = false;
  
  let tempGrid: Grid = grid.map(row => row.map(tile => 
    tile ? { ...tile, isNew: false, isMerged: false } : null
  ));

  const rotate = (g: Grid): Grid => {
    const size = 4;
    const res = createEmptyGrid();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        res[c][size - 1 - r] = g[r][c];
      }
    }
    return res;
  };

  let rotations = 0;
  if (direction === 'UP') rotations = 3;    // 270deg CW, Top becomes Left
  else if (direction === 'RIGHT') rotations = 2; // 180deg CW, Right becomes Left
  else if (direction === 'DOWN') rotations = 1;  // 90deg CW, Bottom becomes Left

  for (let i = 0; i < rotations; i++) tempGrid = rotate(tempGrid);

  const newGrid = tempGrid.map((row) => {
    const originalRowValues = row.map(t => t?.value);
    let filteredRow = row.filter(t => t !== null) as Tile[];
    let mergedRow: (Tile | null)[] = [];
    
    for (let i = 0; i < filteredRow.length; i++) {
      if (i + 1 < filteredRow.length && filteredRow[i].value === filteredRow[i + 1].value) {
        const newVal = filteredRow[i].value * 2;
        mergedRow.push({
          ...filteredRow[i],
          value: newVal,
          isMerged: true
        });
        score += newVal;
        i++; 
      } else {
        mergedRow.push({ ...filteredRow[i] });
      }
    }

    while (mergedRow.length < 4) mergedRow.push(null);
    
    if (JSON.stringify(mergedRow.map(t => t?.value)) !== JSON.stringify(originalRowValues)) {
      moved = true;
    }
    return mergedRow;
  });

  let finalGrid = newGrid;
  const reverseRotations = (4 - rotations) % 4;
  for (let i = 0; i < reverseRotations; i++) finalGrid = rotate(finalGrid);

  finalGrid = finalGrid.map((row, r) => 
    row.map((tile, c) => 
      tile ? { ...tile, row: r, col: c } : null
    )
  );

  return { grid: finalGrid, score, moved };
};

export const checkGameOver = (grid: Grid): boolean => {
  if (getEmptyPositions(grid).length > 0) return false;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[r][c]?.value === grid[r][c + 1]?.value) return false;
    }
  }
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (grid[r][c]?.value === grid[r + 1][c]?.value) return false;
    }
  }
  return true;
};

export const checkWin = (grid: Grid): boolean => {
  return grid.some(row => row.some(tile => tile && tile.value >= 2048));
};
