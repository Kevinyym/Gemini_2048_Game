
import { Direction, Grid, Tile } from '../types';

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
 * 核心移动逻辑
 * 顺时针旋转函数 rotate 定义：new_row = old_col, new_col = 3 - old_row
 * - 0次旋转: 原图，左滑 = 左滑
 * - 1次旋转: 顺时针90度，原图底行变左列。左滑 = 下滑
 * - 2次旋转: 顺时针180度，原图右列变左列。左滑 = 右滑
 * - 3次旋转: 顺时针270度，原图顶行变左列。左滑 = 上滑
 */
export const move = (grid: Grid, direction: Direction): { grid: Grid; score: number; moved: boolean } => {
  let score = 0;
  let moved = false;
  
  // 1. 深度拷贝并重置动画状态
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

  // 2. 根据方向确定旋转次数以统一为“向左滑动”
  let rotations = 0;
  if (direction === 'UP') rotations = 3;    // 顺时针旋转270度，顶行变左列
  else if (direction === 'RIGHT') rotations = 2; // 顺时针旋转180度，右列变左列
  else if (direction === 'DOWN') rotations = 1;  // 顺时针旋转90度，底行变左列
  // LEFT 默认为 0

  for (let i = 0; i < rotations; i++) tempGrid = rotate(tempGrid);

  // 3. 执行向左滑动与合并逻辑
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

  // 4. 旋转回原始方向
  let finalGrid = newGrid;
  const reverseRotations = (4 - rotations) % 4;
  for (let i = 0; i < reverseRotations; i++) finalGrid = rotate(finalGrid);

  // 5. 关键：更新所有磁贴内部记录的坐标，用于 CSS Transform 动画渲染
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
