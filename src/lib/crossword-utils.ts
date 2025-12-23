// src/lib/crossword-utils.ts
import type { CellData, GridSize } from "@/types/crossword";

export const generateEmptyGrid = (rows: number, cols: number): CellData[][] => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      char: "",
      isBlack: false,
      number: null,
    }))
  );
};

export const calculateGridNumbers = (grid: CellData[][], size: GridSize) => {
  let currentNum = 1;

  // ▼▼▼ 修正箇所: : CellData[][] を追加 ▼▼▼
  const newGrid: CellData[][] = grid.map((row) =>
    row.map((cell) => ({ ...cell, number: null }))
  );
  // ▲▲▲ 修正箇所終わり ▲▲▲

  const activeClueKeys = new Set<string>();

  for (let r = 0; r < size.rows; r++) {
    for (let c = 0; c < size.cols; c++) {
      if (newGrid[r][c].isBlack) continue;

      let needsNumber = false;
      const startAcross = c === 0 || newGrid[r][c - 1].isBlack;
      const startDown = r === 0 || newGrid[r - 1][c].isBlack;

      const hasNextAcross = c + 1 < size.cols && !newGrid[r][c + 1].isBlack;
      const hasNextDown = r + 1 < size.rows && !newGrid[r + 1][c].isBlack;

      if ((startAcross && hasNextAcross) || (startDown && hasNextDown)) {
        needsNumber = true;
      }

      if (needsNumber) {
        // これでエラーが消えます
        newGrid[r][c].number = currentNum;
        if (startAcross && hasNextAcross)
          activeClueKeys.add(`${currentNum}-across`);
        if (startDown && hasNextDown) activeClueKeys.add(`${currentNum}-down`);
        currentNum++;
      }
    }
  }

  return { gridWithNumbers: newGrid, activeClueKeys };
};
