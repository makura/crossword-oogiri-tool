// src/components/crossword/CurrentStatus.tsx

import type { Direction } from "@/types/crossword";
import { HelpCircle } from "lucide-react";

// cells は表示に使わなくなりましたが、受け取るデータ構造として定義に残しておいても問題ありません
interface ActiveWordInfo {
  number: number;
  direction: Direction;
  clueText: string;
  cells: { char: string; isActive: boolean }[];
}

interface CurrentStatusProps {
  info: ActiveWordInfo | null;
}

export const CurrentStatus = ({ info }: CurrentStatusProps) => {
  // 選択されていない時の表示
  if (!info) {
    return (
      <div className="grid py-2 min-h-[120px]">
        <div className="bg-blue-50 border-l-4 border-blue-300 p-4 rounded-r shadow-sm flex items-center gap-3 text-gray-500">
          <HelpCircle size={24} className="text-blue-300" />
          <span className="text-lg font-medium">
            マスを選択するとここにお題が表示されます
          </span>
        </div>
      </div>
    );
  }

  // 選択されている時の表示（問題文のみ）
  return (
    <div className="grid py-1 min-h-[100px]">
      <div className="bg-white border border-blue-100 p-4 rounded-xl shadow-sm relative overflow-hidden min-h-[100px] flex flex-col justify-center">
        {/* 背景装飾（薄い矢印） */}
        {/* <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          {info.direction === "across" ? (
            <ArrowRight size={100} />
          ) : (
            <ArrowDown size={100} />
          )}
        </div> */}

        <div className="flex justify-center">
          {/* ラベル: タテのカギ: 1 */}
          {/* <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
            {info.direction === "across" ? (
              <ArrowRight size={14} />
            ) : (
              <ArrowDown size={14} />
            )}
            <span>
              {info.direction === "across" ? "ヨコ" : "タテ"}のカギ :{" "}
              {info.number}
            </span>
          </div> */}

          {/* 問題文テキスト */}
          <div className="text-2xl font-bold text-gray-800 break-words leading-relaxed">
            {info.clueText || (
              <span className="text-gray-300 italic font-normal">
                問題文が入力されていません
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
