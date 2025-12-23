// src/store/atoms.ts（修正版）
import { atomWithStorage, RESET, useResetAtom } from "jotai/utils";
import type { GridSize, CellData } from "@/types/crossword";
import { generateEmptyGrid } from "@/lib/crossword-utils";
import { tauriStore } from "@/lib/tauri-store"; // ← インポート追加

const INITIAL_SIZE: GridSize = { rows: 5, cols: 5 };
const INITIAL_GRID = generateEmptyGrid(5, 5);
const INITIAL_CLUE_TEXTS: Record<string, string> = {};

/**
 * これでTauri Storeに自動保存・復元！
 * 型安全でanyエラーなし
 */
export const sizeAtom = atomWithStorage<GridSize>(
  "cw_size",
  INITIAL_SIZE,
  tauriStore // ← カスタムストレージ適用
);

export const gridAtom = atomWithStorage<CellData[][]>(
  "cw_grid",
  INITIAL_GRID,
  tauriStore
);

export const clueTextsAtom = atomWithStorage<Record<string, string>>(
  "cw_clues",
  INITIAL_CLUE_TEXTS,
  tauriStore
);

// リセット用
export const useResetAll = () => {
  const resetSize = useResetAtom(sizeAtom);
  const resetGrid = useResetAtom(gridAtom);
  const resetClues = useResetAtom(clueTextsAtom);

  return () => {
    resetSize();
    resetGrid();
    resetClues();
  };
};

export { RESET };
