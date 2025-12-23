# Tauri + React + Typescript

このテンプレートは、Vite 環境で Tauri、React、TypeScript を用いた開発を始めるのに役立つはずです。

## 開発サーバーの起動

```bash
pnpm tauri dev
```

## デスクトップアプリとしてビルド

### アプリの設定を変更する

`src-tauri/tauri.conf.json`

```json
{
  "productName": "マイ専用ツール", // アプリ名（タスクバーやウィンドウタイトル）
  "windows": [
    {
      "title": "マイ専用ツール v1.0",
      "width": 1000,
      "height": 700,
      "resizable": true,
      "fullscreen": false
    }
  ]
}
```

### 通常のビルドコマンド

```bash
pnpm tauri build
```

### 出力先:

```text
src-tauri/target/release/bundle/
├── msi/            ← .msi インストーラー（Windows標準インストーラー）
├── nsis/           ← .exe インストーラー（おすすめ）
└── installer/      ← 両方入ってることもある
```

## 推奨される IDE の設定

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
