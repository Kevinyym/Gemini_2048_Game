
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export type Grid = (Tile | null)[][];

export interface GameState {
  grid: Grid;
  score: number;
  bestScore: number;
  status: 'PLAYING' | 'WON' | 'LOST';
  moveCount: number;
}

export interface AIResponse {
  recommendedMove: Direction;
  reasoning: string;
}
