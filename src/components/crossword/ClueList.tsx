// src/components/crossword/ClueList.tsx

import { useMemo } from "react";
import { ArrowRight, ArrowDown, Type, type LucideIcon } from "lucide-react";
import type { CellData, GridSize } from "@/types/crossword";
import { calculateGridNumbers } from "@/lib/crossword-utils";

interface ClueGroupProps {
  title: string;
  icon: LucideIcon;
  items: { number: number; key: string }[];
  clueTexts: Record<string, string>;
  setClueTexts: (texts: Record<string, string>) => void;
}

const ClueGroup = ({
  title,
  icon: Icon,
  items,
  clueTexts,
  setClueTexts,
}: ClueGroupProps) => (
  <div>
    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1">
      <Icon size={14} /> {title}
    </h3>
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-gray-400 italic">該当なし</p>
      )}
      {items.map((item) => (
        <div key={item.key} className="flex gap-2 items-start">
          <span className="font-mono font-bold text-gray-400 w-6 pt-1.5 text-right">
            {item.number}.
          </span>
          <textarea
            rows={1}
            placeholder="問題文を入力..."
            value={clueTexts[item.key] || ""}
            onChange={(e) =>
              setClueTexts({ ...clueTexts, [item.key]: e.target.value })
            }
            className="flex-1 text-sm p-2 border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:border-blue-400 outline-none transition-all resize-none overflow-hidden min-h-[38px]"
            // 入力に合わせて高さを自動調整
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height =
                e.currentTarget.scrollHeight + "px";
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

interface ClueListProps {
  grid: CellData[][];
  size: GridSize;
  clueTexts: Record<string, string>;
  setClueTexts: (texts: Record<string, string>) => void;
}

export const ClueList = ({
  grid,
  size,
  clueTexts,
  setClueTexts,
}: ClueListProps) => {
  const generatedClues = useMemo(() => {
    const across: { number: number; key: string }[] = [];
    const down: { number: number; key: string }[] = [];
    const { activeClueKeys } = calculateGridNumbers(grid, size);

    activeClueKeys.forEach((key) => {
      const [numStr, dir] = key.split("-");
      const num = parseInt(numStr);
      if (dir === "across") across.push({ number: num, key });
      else down.push({ number: num, key });
    });

    return {
      across: across.sort((a, b) => a.number - b.number),
      down: down.sort((a, b) => a.number - b.number),
    };
  }, [grid, size]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="flex gap-5 p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
          <Type size={18} /> お題
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          自動生成された番号に対するお題を入力してください
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Across は「ヨコ」 */}
        <ClueGroup
          title="ヨコ (Across)"
          icon={ArrowRight}
          items={generatedClues.across}
          clueTexts={clueTexts}
          setClueTexts={setClueTexts}
        />

        {/* Down は「タテ」 */}
        <ClueGroup
          title="タテ (Down)"
          icon={ArrowDown}
          items={generatedClues.down}
          clueTexts={clueTexts}
          setClueTexts={setClueTexts}
        />
      </div>
    </div>
  );
};
