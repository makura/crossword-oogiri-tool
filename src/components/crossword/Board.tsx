// src/components/crossword/Board.tsx

import React, { useMemo, useEffect, useRef } from "react";
import type {
  GridSize,
  CellData,
  Direction,
  Mode,
  Cursor,
} from "@/types/crossword";
import { Cell } from "./Cell";

interface BoardProps {
  size: GridSize;
  grid: CellData[][];
  cursor: Cursor | null;
  direction: Direction;
  mode: Mode;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[][]>;
  onCellClick: (r: number, c: number, e?: React.MouseEvent) => void;
  onInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    r: number,
    c: number
  ) => void;
  onKeyDown: (e: React.KeyboardEvent, r: number, c: number) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (
    e: React.CompositionEvent<HTMLInputElement>,
    r: number,
    c: number
  ) => void;
  // ボード外クリック時のコールバック
  onClickOutside: () => void;
}

export const Board = ({
  size,
  grid,
  cursor,
  direction,
  mode,
  inputRefs,
  onCellClick,
  onInput,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  onClickOutside, // 追加
}: BoardProps) => {
  // ボードのDOM要素を参照するためのRef
  const boardRef = useRef<HTMLDivElement>(null);

  // 範囲外クリックを検知するエフェクト
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // カーソルがない（初期状態）なら何もしない
      if (!cursor) return;

      // クリックされた要素がボードの内側にあるか確認
      if (
        boardRef.current &&
        !boardRef.current.contains(event.target as Node)
      ) {
        // ボードの外側ならリセット処理を実行
        onClickOutside();
      }
    };

    // ドキュメント全体にイベントリスナーを追加
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // クリーンアップ
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cursor, onClickOutside]);

  // 現在アクティブな単語の範囲を計算する
  const activeWordRange = useMemo(() => {
    if (!cursor) return null;
    const { r, c } = cursor;

    if (grid[r][c].isBlack) return null;

    if (direction === "across") {
      let startC = c;
      let endC = c;
      while (startC > 0 && !grid[r][startC - 1].isBlack) startC--;
      while (endC < size.cols - 1 && !grid[r][endC + 1].isBlack) endC++;
      return { type: "across", r, start: startC, end: endC };
    } else {
      let startR = r;
      let endR = r;
      while (startR > 0 && !grid[startR - 1][c].isBlack) startR--;
      while (endR < size.rows - 1 && !grid[endR + 1][c].isBlack) endR++;
      return { type: "down", c, start: startR, end: endR };
    }
  }, [cursor, direction, grid, size]);

  return (
    <div
      ref={boardRef} // ここにRefを紐付け
      className="grid gap-0 border-2 border-gray-800 bg-gray-800 select-none"
      style={{
        gridTemplateColumns: `repeat(${size.cols}, minmax(0, 1fr))`,
        width: `min(100%, ${size.cols * 48}px)`,
      }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isActive = cursor?.r === r && cursor?.c === c;

          let isInActiveWord = false;

          if (cursor === null) {
            isInActiveWord = true;
          } else if (activeWordRange) {
            if (activeWordRange.type === "across") {
              isInActiveWord =
                r === activeWordRange.r &&
                c >= activeWordRange.start &&
                c <= activeWordRange.end;
            } else {
              isInActiveWord =
                c === activeWordRange.c &&
                r >= activeWordRange.start &&
                r <= activeWordRange.end;
            }
          }

          return (
            <Cell
              key={`${r}-${c}`}
              r={r}
              c={c}
              data={cell}
              isActive={isActive}
              isRelated={false}
              isInActiveWord={isInActiveWord}
              direction={direction}
              mode={mode}
              inputRef={(el) => {
                if (inputRefs.current[r]) {
                  inputRefs.current[r][c] = el;
                }
              }}
              onClick={(e) => onCellClick(r, c, e)}
              onInput={(e) => onInput(e, r, c)}
              onKeyDown={(e) => onKeyDown(e, r, c)}
              onCompositionStart={onCompositionStart}
              onCompositionEnd={(e) => onCompositionEnd(e, r, c)}
            />
          );
        })
      )}
    </div>
  );
};
