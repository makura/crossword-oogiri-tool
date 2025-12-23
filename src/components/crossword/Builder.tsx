// src/components/crossword/Builder.tsx

import { useCrossword } from "@/hooks/useCrossword";
import { Check } from "lucide-react";
import { Board } from "./Board";
import { ClueList } from "./ClueList";
import { CurrentStatus } from "./CurrentStatus";
import { Settings } from "./Settings";
import { SideIndicator } from "./SideIndicator";

export default function CrosswordBuilder() {
  const {
    size,
    grid,
    mode,
    direction,
    cursor,
    clueTexts,
    inputRefs,
    message,
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
  } = useCrossword();

  // ボード外をクリックした時の処理
  const handleBoardClickOutside = () => {
    setCursor(null); // カーソルをnullにして選択解除
    // 必要であれば、directionなども初期値に戻すことができます
    // setDirection("across");
  };

  return (
    // 1. ルート要素: 画面の高さを固定(h-dvh)し、スクロール禁止(overflow-hidden)
    // パディングは内側の要素で調整するため、ここでは削除または最小限にします
    <div className="h-dvh w-full font-sans text-gray-800 bg-gray-50 overflow-hidden flex flex-col">
      {/* 通知エリア: fixedなのでレイアウトフローの外側でOK */}
      {message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-white font-medium animate-fade-in-down ${
            message.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" && <Check size={18} />}
            {message.text}
          </div>
        </div>
      )}

      {/* コンテンツ幅を制限するラッパー: ここも縦並び(flex-col)にし、高さを親に合わせる(h-full) */}
      <div className="w-full max-w-6xl mx-auto h-full flex flex-col">
        {/* === Aの要素 (Board area) === */}
        {/* shrink-0: 画面が狭くてもここは縮めない */}
        <div className="shrink-0 p-4 pb-2">
          <div className="grid grid-cols-2 justify-center items-center  p-4 bg-white border border-gray-200 shadow-md rounded-xl min-h-[275px]">
            {/* PC画面でのみ左側にインジケーターを表示 */}
            <div className="h-full flex justify-center items-end">
              <SideIndicator info={activeWordInfo} />
            </div>
            <div className="flex justify-center">
              <Board
                size={size}
                grid={grid}
                cursor={cursor}
                direction={direction}
                mode={mode}
                inputRefs={inputRefs}
                onCellClick={handleCellClick}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onClickOutside={handleBoardClickOutside}
              />
            </div>
          </div>
          <div className="mt-1">
            <CurrentStatus info={activeWordInfo} />
          </div>
        </div>

        {/* === Bの要素 (Settings / Controls) === */}
        {/* shrink-0: ここも固定高さ */}
        <div className="shrink-0 px-4 py-2">
          <Settings
            mode={mode}
            setMode={setMode}
            onSave={handleSave}
            onLoad={handleLoad}
            onDelete={handleDelete}
            onClear={handleClear}
            size={size}
            onResize={handleResize}
          />
        </div>

        {/* === Cの要素 (ClueList) === */}
        {/* flex-1: 残りの高さを全て埋める */}
        {/* overflow-y-auto: 中身が溢れたらここだけスクロール */}
        {/* min-h-0: Flexアイテムの縮小挙動を安定させるために重要 */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
          <ClueList
            grid={grid}
            size={size}
            clueTexts={clueTexts}
            setClueTexts={setClueTexts}
          />
        </div>
      </div>
    </div>
  );
}
