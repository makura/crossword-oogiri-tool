// src/types/crossword.ts

export type Mode = "input" | "edit_black";
export type Direction = "across" | "down";

export interface CellData {
  char: string;
  isBlack: boolean;
  number: number | null;
}

export interface Clue {
  number: number;
  direction: Direction;
  text: string;
}

export interface GridSize {
  rows: number;
  cols: number;
}

export interface CrosswordData {
  size: GridSize;
  grid: CellData[][];
  clues: Clue[];
}

export interface Cursor {
  r: number;
  c: number;
}
