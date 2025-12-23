// src/store/tauri-store.ts
import { load } from "@tauri-apps/plugin-store";

// Storeはanyで受けておく（型定義が厳しすぎるため）
let storePromise: Promise<any> | null = null;

const getStore = async () => {
  if (!storePromise) {
    storePromise = load("crossword-data.json", {
      defaults: {}, // 必須
      autoSave: true, // 変更ごとに自動保存
    });
  }
  return storePromise;
};

/**
 * Jotai用カスタムストレージ（型安全 + エラー完全回避）
 */
export const tauriStore = {
  // getItem: ジェネリックを明示的に渡すために as unknown as T でキャスト
  async getItem<T>(key: string, initialValue: T): Promise<T> {
    const store = await getStore();
    const value = await store.get(key); // ここは<T>を書かない！
    // value が null/undefined なら initialValue を返す
    return (value ?? initialValue) as T;
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    const store = await getStore();
    await store.set(key, value);
    // autoSave: true でも念のため明示保存（安定性向上）
    await store.save();
  },

  async removeItem(key: string): Promise<void> {
    const store = await getStore();
    await store.delete(key);
    await store.save();
  },

  // 超重要：初回レンダリング時にStore読み込みでブロックしない
  delayInit: true,
};
