// src/components/crossword/SideIndicator.tsx

import type { Direction } from "@/types/crossword";

interface ActiveWordInfo {
  number: number;
  direction: Direction;
  clueText: string;
}

interface SideIndicatorProps {
  info: ActiveWordInfo | null;
}

export const SideIndicator = ({ info }: SideIndicatorProps) => {
  // 選択されていない時（グレーアウト表示）
  if (!info) {
    return (
      <div className="w-62 h-22 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 gap-2 select-none">
        <span className="text-xs font-bold">-</span>
      </div>
    );
  }

  const isAcross = info.direction === "across";

  return (
    <div className="w-62 h-22 bg-white rounded-lg border-4 border-gray-500 shadow-sm flex flex-col items-center justify-center gap-1 select-none transition-all animate-in fade-in zoom-in-95 duration-200 px-4">
      {/* 方向アイコンとテキスト */}
      {/* <div
        className={`
        flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full
        ${isAcross ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}
      `}
      >
        {isAcross ? <ArrowRight size={14} /> : <ArrowDown size={14} />}
        <span>{isAcross ? "ヨコ" : "タテ"}</span>
      </div> */}

      {/* 番号（大きく表示） */}
      <div className="text-4xl font-black text-gray-600 leading-tight">
        {info.number}
        <span className="ml-2 text-2xl">の</span>
        <span
          className={`ml-1 text-3xl  ${
            isAcross ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isAcross ? "ヨコ" : "タテ"}
        </span>
        <span className="ml-1 text-2xl">のお題</span>
      </div>
    </div>
  );
};
