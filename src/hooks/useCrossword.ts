// src/hooks/useCrossword.ts

import { calculateGridNumbers, generateEmptyGrid } from "@/lib/crossword-utils";
import { clueTextsAtom, gridAtom, sizeAtom, useResetAll } from "@/store/atoms";
import type { CrosswordData, Direction, Mode } from "@/types/crossword";
// ▼ projectStorage から関数と型をインポート
import {
  saveProject,
  loadProject,
  type Project,
  deleteProject,
} from "@/lib/project-storage";
import { useAtom } from "jotai";
import { useCallback, useMemo, useRef, useState } from "react";

// ▼ 新規プロジェクト用のID生成に標準APIを使用 (Crypto API)
const generateId = () => crypto.randomUUID();

export const useCrossword = () => {
  const [size, setSize] = useAtom(sizeAtom);
  const [grid, setGrid] = useAtom(gridAtom);
  const [clueTexts, setClueTexts] = useAtom(clueTextsAtom);
  const [mode, setMode] = useState<Mode>("input");
  const [direction, setDirection] = useState<Direction>("across");
  const [cursor, setCursor] = useState<{ r: number; c: number } | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // ▼ 現在開いているプロジェクトのメタ情報（IDや名前）を管理
  const [projectMeta, setProjectMeta] = useState<{
    id: string;
    name: string;
    createdAt: string;
  } | null>(null);

  const resetAll = useResetAll();

  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const isComposing = useRef(false);

  // refs初期化
  if (
    inputRefs.current.length !== size.rows ||
    (inputRefs.current[0] && inputRefs.current[0].length !== size.cols)
  ) {
    inputRefs.current = Array.from({ length: size.rows }, () =>
      Array(size.cols).fill(null)
    );
  }

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const activeWordInfo = useMemo(() => {
    if (!cursor) return null;
    const { r, c } = cursor;
    let startR = r;
    let startC = c;

    if (direction === "across") {
      while (startC > 0 && !grid[startR][startC - 1].isBlack) startC--;
    } else {
      while (startR > 0 && !grid[startR - 1][startC].isBlack) startR--;
    }

    const number = grid[startR][startC].number;
    if (number === null) return null;

    const clueKey = `${number}-${direction}`;
    const clueText = clueTexts[clueKey] || "";

    const cells: { char: string; isActive: boolean }[] = [];
    let currR = startR;
    let currC = startC;

    while (
      currR < size.rows &&
      currC < size.cols &&
      !grid[currR][currC].isBlack
    ) {
      cells.push({
        char: grid[currR][currC].char,
        isActive: currR === r && currC === c,
      });

      if (direction === "across") currC++;
      else currR++;
    }

    return { number, direction, clueText, cells };
  }, [grid, cursor, direction, size, clueTexts]);

  const fillGridWithSequence = useCallback(
    (startR: number, startC: number, text: string) => {
      if (!text) return;
      const chars = Array.from(text); // 文字列を配列に変換
      const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

      let currR = startR;
      let currC = startC;
      let lastR = startR;
      let lastC = startC;

      for (let i = 0; i < chars.length; i++) {
        if (currR >= size.rows || currC >= size.cols) break;
        if (newGrid[currR][currC].isBlack) break;

        newGrid[currR][currC].char = chars[i];
        lastR = currR;
        lastC = currC;

        if (direction === "across") currC++;
        else currR++;
      }

      setGrid(newGrid);

      let nextR = lastR;
      let nextC = lastC;
      if (direction === "across") nextC++;
      else nextR++;

      if (
        nextR < size.rows &&
        nextC < size.cols &&
        !newGrid[nextR][nextC].isBlack
      ) {
        setCursor({ r: nextR, c: nextC });
        setTimeout(() => inputRefs.current[nextR][nextC]?.focus(), 0);
      } else {
        setCursor({ r: lastR, c: lastC });
        setTimeout(() => inputRefs.current[lastR][lastC]?.focus(), 0);
      }
    },
    [grid, size, direction, setGrid]
  );

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>,
    r: number,
    c: number
  ) => {
    isComposing.current = false;
    const val = e.currentTarget.value;
    fillGridWithSequence(r, c, val);
  };

  const handleResize = (newRows: number, newCols: number) => {
    const r = Math.max(3, Math.min(10, newRows));
    const c = Math.max(3, Math.min(10, newCols));
    const newGrid = generateEmptyGrid(r, c);

    for (let i = 0; i < Math.min(size.rows, r); i++) {
      for (let j = 0; j < Math.min(size.cols, c); j++) {
        newGrid[i][j] = grid[i][j];
      }
    }

    const { gridWithNumbers } = calculateGridNumbers(newGrid, {
      rows: r,
      cols: c,
    });

    setSize({ rows: r, cols: c });
    setGrid(gridWithNumbers);
    setCursor(null);
  };

  const toggleBlackSquare = (r: number, c: number) => {
    const newGrid = [...grid];
    newGrid[r] = [...newGrid[r]];
    newGrid[r][c].isBlack = !newGrid[r][c].isBlack;
    if (newGrid[r][c].isBlack) {
      newGrid[r][c].char = "";
    }
    const { gridWithNumbers } = calculateGridNumbers(newGrid, size);
    setGrid(gridWithNumbers);
  };

  const moveCursor = (
    r: number,
    c: number,
    dir: Direction,
    forward: boolean = true
  ) => {
    let nextR = r;
    let nextC = c;
    let steps = 0;
    while (steps < Math.max(size.rows, size.cols)) {
      if (dir === "across") {
        nextC = forward ? nextC + 1 : nextC - 1;
      } else {
        nextR = forward ? nextR + 1 : nextR - 1;
      }

      if (nextR < 0 || nextR >= size.rows || nextC < 0 || nextC >= size.cols)
        return;

      if (!grid[nextR][nextC].isBlack) {
        setCursor({ r: nextR, c: nextC });
        inputRefs.current[nextR][nextC]?.focus();
        return;
      }
      steps++;
    }
  };

  const handleCellClick = (r: number, c: number, e?: React.MouseEvent) => {
    if (mode === "edit_black" || (e && e.type === "contextmenu")) {
      e?.preventDefault();
      toggleBlackSquare(r, c);
      return;
    }
    if (grid[r][c].isBlack) return;

    if (cursor?.r === r && cursor?.c === c) {
      setDirection((prev) => (prev === "across" ? "down" : "across"));
    } else {
      setCursor({ r, c });
    }
    inputRefs.current[r][c]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (mode === "edit_black") return;

    if (e.key === " ") {
      e.preventDefault();
      setDirection((prev) => (prev === "across" ? "down" : "across"));
      return;
    }

    if (e.key === "Backspace") {
      if (grid[r][c].char === "") {
        moveCursor(r, c, direction, false);
      } else {
        const newGrid = [...grid];
        newGrid[r][c].char = "";
        setGrid(newGrid);
      }
      return;
    }

    const keyMap: Record<string, () => void> = {
      ArrowUp: () => moveCursor(r, c, "down", false),
      ArrowDown: () => moveCursor(r, c, "down", true),
      ArrowLeft: () => moveCursor(r, c, "across", false),
      ArrowRight: () => moveCursor(r, c, "across", true),
    };

    if (keyMap[e.key]) keyMap[e.key]();
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    r: number,
    c: number
  ) => {
    const val = e.target.value;
    if (isComposing.current) {
      const newGrid = [...grid];
      newGrid[r][c].char = val;
      setGrid(newGrid);
      return;
    }
    fillGridWithSequence(r, c, val);
  };

  // ▼▼▼ 保存処理 (旧 handleExport) ▼▼▼
  const handleSave = async () => {
    // 1. 保存するデータの作成
    const { activeClueKeys } = calculateGridNumbers(grid, size);
    const cluesExport = Array.from(activeClueKeys).map((key) => {
      const [num, dir] = key.split("-");
      return {
        number: parseInt(num),
        direction: dir as Direction,
        text: clueTexts[key] || "",
      };
    });

    const crosswordData: CrosswordData = { size, grid, clues: cluesExport };

    // 2. IDと名前の決定
    let saveId = projectMeta?.id;
    let saveName = projectMeta?.name;
    let createdAt = projectMeta?.createdAt;

    // 新規保存の場合（IDがない場合）
    if (!saveId) {
      const inputName = prompt(
        "プロジェクト名を入力してください",
        "無題のクロスワード"
      );
      if (inputName === null) return; // キャンセル

      saveName = inputName || "無題のクロスワード";
      saveId = generateId();
      createdAt = new Date().toISOString();
    }

    // 3. Projectオブジェクトの構築
    const project: Project = {
      id: saveId,
      name: saveName!,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: crosswordData,
    };

    // 4. ストレージへ保存
    try {
      await saveProject(project);

      // 保存成功したらメタ情報を更新（これで次回から「上書き保存」になる）
      setProjectMeta({
        id: saveId,
        name: saveName!,
        createdAt: project.createdAt,
      });

      showMessage(`"${saveName}" を保存しました`);
    } catch (e) {
      console.error(e);
      showMessage("保存に失敗しました", "error");
    }
  };

  // ▼▼▼ 読み込み処理 (旧 handleImport) ▼▼▼
  // IDを指定してファイルを読み込む関数に変更
  const handleLoad = async (projectId: string) => {
    try {
      const project = await loadProject(projectId);
      if (!project) {
        showMessage("プロジェクトが見つかりませんでした", "error");
        return;
      }

      const data = project.data as CrosswordData;
      if (!data.size || !data.grid) throw new Error("Invalid data");

      // 番号の再計算
      const { gridWithNumbers } = calculateGridNumbers(data.grid, data.size);

      // 状態の復元
      setSize(data.size);
      setGrid(gridWithNumbers);

      const newClueTexts: Record<string, string> = {};
      data.clues?.forEach((clue) => {
        newClueTexts[`${clue.number}-${clue.direction}`] = clue.text;
      });
      setClueTexts(newClueTexts);

      // プロジェクト情報の更新
      setProjectMeta({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
      });

      showMessage(`"${project.name}" を読み込みました`);
    } catch (e) {
      console.error(e);
      showMessage("データの読み込みに失敗しました", "error");
    }
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    if (
      !confirm(
        "本当にこのプロジェクトを削除しますか？\n削除すると元に戻せません。"
      )
    ) {
      return false;
    }

    try {
      await deleteProject(id);

      // もし現在開いているプロジェクトを削除した場合、紐付けを解除する（次回は新規保存になる）
      if (projectMeta?.id === id) {
        setProjectMeta(null);
        showMessage(
          "開いていたプロジェクトが削除されました。次回は新規保存となります。"
        );
      } else {
        showMessage("プロジェクトを削除しました");
      }
      return true; // 成功
    } catch (e) {
      console.error(e);
      showMessage("削除に失敗しました", "error");
      return false; // 失敗
    }
  };

  const handleClear = () => {
    if (
      confirm(
        "盤面をすべてクリアしますか？\n（現在編集中の内容は保存されません）"
      )
    ) {
      resetAll();
      setCursor(null);
      setProjectMeta(null); // プロジェクト紐付けも解除（次回は新規保存扱い）
      console.log("リセットしました");
    }
  };

  return {
    size,
    grid,
    mode,
    direction,
    cursor,
    clueTexts,
    inputRefs,
    message,
    projectMeta, // 現在のプロジェクト情報をUIで表示したい場合に便利
    setMode,
    setClueTexts,
    setCursor,
    handleResize,
    handleCellClick,
    handleKeyDown,
    handleInput,
    handleSave,
    handleLoad,
    handleDelete,
    handleClear,
    handleCompositionStart,
    handleCompositionEnd,
    activeWordInfo,
  };
};
