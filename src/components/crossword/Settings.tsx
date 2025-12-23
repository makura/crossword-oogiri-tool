// src/components/crossword/Settings.tsx

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GridSize, Mode } from "@/types/crossword";
import { getProjectList, Project } from "@/lib/project-storage"; // 作成したutils
import { cn } from "@/lib/utils"; // shadcnのutils
import {
  ChevronsUpDown,
  Eraser,
  Save,
  Trash2,
  Type,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SettingsProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  onSave: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
  onClear: () => void;
  size: GridSize;
  onResize: (r: number, c: number) => void;
  currentProjectName?: string; // 現在開いているプロジェクト名を表示用に追加
}

// 日付フォーマット用ヘルパー
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const Settings = ({
  mode,
  setMode,
  onSave,
  onLoad,
  onDelete,
  onClear,
  size,
  onResize,
  currentProjectName,
}: SettingsProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 gap-4">
        {/* 左側：入力モードとサイズ設定 */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {/* サイズ入力 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">サイズ:</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={3}
                max={10}
                value={size.rows}
                onChange={(e) => onResize(parseInt(e.target.value), size.cols)}
                className="w-10 p-1 border rounded text-center text-sm"
              />
              <span className="text-gray-400">×</span>
              <input
                type="number"
                min={3}
                max={10}
                value={size.cols}
                onChange={(e) => onResize(size.rows, parseInt(e.target.value))}
                className="w-10 p-1 border rounded text-center text-sm"
              />
            </div>
          </div>

          {/* モード切替 */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode("input")}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium transition-all",
                mode === "input"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Type size={14} />
              入力
            </button>
            <button
              onClick={() => setMode("edit_black")}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium transition-all",
                mode === "edit_black"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Eraser size={14} />
              黒マス
            </button>
          </div>
        </div>

        {/* 右側：保存・データ読み込み・クリア */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {/* プロジェクト名表示（あれば） */}
          {currentProjectName && (
            <span className="text-xs font-semibold text-gray-500 mr-2 border px-2 py-1 rounded bg-gray-50">
              {currentProjectName}
            </span>
          )}

          {/* 保存ボタン */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="gap-2 text-gray-700"
          >
            <Save size={16} />
            保存
          </Button>

          {/* データ選択（Combobox） */}
          <ProjectSelector onLoad={onLoad} onDelete={onDelete} />

          {/* クリアボタン */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            title="盤面をクリア"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ▼ プロジェクト選択用コンポーネント（Combobox）
function ProjectSelector({
  onLoad,
  onDelete,
}: {
  onLoad: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // ポップオーバーが開いたときにリストを再取得する
  useEffect(() => {
    if (open) {
      setLoading(true);
      getProjectList()
        .then((list: Project[]) => setProjects(list))
        .catch((err: Error) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [open]);

  // 削除ボタンクリック時の処理
  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 親の onSelect (読み込み) が発火しないようにする
    // 削除実行
    const success = await onDelete(id);
    if (success) {
      // 成功したら表示リストからも即座に削除
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className="w-[140px] justify-between text-gray-700"
        >
          <span className="truncate">データを選択...</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <Command>
          <CommandInput placeholder="プロジェクトを検索..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "読み込み中..." : "データが見つかりません"}
            </CommandEmpty>
            <CommandGroup heading="保存済みデータ">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => {
                    onLoad(project.id);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 py-2 cursor-pointer group"
                >
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-medium truncate w-full">
                      {project.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>

                  {/* ▼▼▼ 削除ボタン ▼▼▼ */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteClick(e, project.id)}
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}