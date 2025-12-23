// src/components/crossword/Cell.tsx

import React from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import type { CellData, Direction, Mode } from "@/types/crossword";

interface CellProps {
  r: number;
  c: number;
  data: CellData;
  isActive: boolean;
  isRelated: boolean;
  isInActiveWord: boolean;
  direction: Direction;
  mode: Mode;
  inputRef: (el: HTMLInputElement | null) => void;
  onClick: (e?: React.MouseEvent) => void;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void;
}

export const Cell = ({
  data,
  isActive,
  isRelated,
  isInActiveWord,
  direction,
  mode,
  inputRef,
  onClick,
  onInput,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
}: CellProps) => {
  return (
    <div
      className={`
        relative aspect-square border border-gray-600 flex items-center justify-center
          ${
            data.isBlack
              ? "bg-gray-900" // 黒マスは黒
              : isInActiveWord
              ? "bg-white" // アクティブな単語内は白
              : "bg-gray-200" // それ以外は薄いグレー
          }
        ${isActive ? "ring-2 ring-blue-500 z-10" : ""}
        ${isRelated ? "bg-blue-50" : ""}
        cursor-pointer transition-colors duration-75
      `}
      onClick={onClick}
      onContextMenu={onClick}
    >
      {isActive && !data.isBlack && (
        <>
          {/* ヨコ（Across）の場合：左端を赤く太く表示 */}
          {direction === "across" && (
            <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-red-300 pointer-events-none z-20" />
          )}

          {/* タテ（Down）の場合：上端を赤く太く表示 */}
          {direction === "down" && (
            <div className="absolute top-0 left-0 right-0 h-[5px] bg-red-300 pointer-events-none z-20" />
          )}
        </>
      )}
      {data.number && !data.isBlack && (
        <span
          className={`
            absolute font-semibold text-gray-500 leading-none pointer-events-none transition-all
            ${
              // ▼ ここで条件分岐
              !data.char
                ? "text-lg sm:text-xl top-1 left-1 opacity-60" // 文字がない時：大きく、少し透明度を下げる
                : "text-[10px] sm:text-xs top-0.5 left-1" // 文字がある時：小さく（元のスタイル）
            }
          `}
        >
          {data.number}
        </span>
      )}

      {!data.isBlack && (
        <input
          ref={inputRef}
          type="text"
          value={data.char}
          onChange={onInput}
          onKeyDown={onKeyDown}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          className={`
            w-full h-full text-center text-2xl sm:text-3xl font-bold bg-transparent outline-none p-0
            text-gray-900 caret-blue-500
            ${isActive ? "placeholder-blue-200" : ""}
          `}
          readOnly={mode === "edit_black"}
        />
      )}

      {isActive && !data.isBlack && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 text-blue-600">
          {direction === "across" ? (
            <ArrowRight size={32} />
          ) : (
            <ArrowDown size={32} />
          )}
        </div>
      )}
    </div>
  );
};
