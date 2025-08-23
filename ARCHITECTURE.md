# SS Prompt Manager V2.2 - アーキテクチャドキュメント

## 🚀 Version 2.2 重要な変更 [2025-08-23]

### 🎯 AI Generate アーキテクチャ完全再設計

#### 新しい2段階処理システム
```
【段階1】ナラティブ生成 (generateNarrativePrompt)
├─ システムプロンプト参照
├─ フォーマット別最適化
└─ 高品質プロンプト出力

【段階2】既存分解ロジック活用 (parseComplexTags + splitText方式)
├─ 実績ある解析エンジン
├─ 翻訳・カテゴリ分類
└─ UI表示・色分け
```

#### 重要な設計原則
1. **入力保護最優先**: ユーザー入力は絶対に変更しない
2. **既存機能保護**: 動作する機能（Split to Tags等）は変更しない
3. **段階的処理**: デバッグしやすい明確な処理ステップ
4. **システムプロンプト確実参照**: カスタマイズが確実に反映

### 🏗️ ファイル役割の明確化

#### ビルドシステム重要事項
- **編集対象**: `public/static/app-main.js`
- **実行対象**: `dist/static/app-main.js` (npm run buildで生成)
- **デプロイ**: `pm2 restart ss-prompt-manager`必須

#### 処理フロー
```javascript
// 実際の処理フロー例
generateOptimized() {
  const originalInput = input.value.trim(); // 保護
  const prompt = await generateNarrativePrompt(originalInput, format);
  const parsedTags = parseComplexTags(prompt); // 既存ロジック使用
  const bilingualTags = await createBilingualTags(parsedTags);
  appState.tags = bilingualTags; // UI更新
}
```

## 📁 プロジェクト構成

```
/home/user/webapp/
├── src/
│   ├── index.tsx           # メインエントリーポイント（Hono + Cloudflare Workers）
│   ├── index-simple.tsx    # シンプル版バックアップ
│   └── index-backup.tsx    # 元の複雑版バックアップ
├── public/
│   ├── index.html          # ReactアプリのHTMLラッパー
│   ├── improved.html       # 改善版HTML
│   ├── redirect.html       # リダイレクト用
│   └── static/
│       ├── app.js          # Reactアプリ（日本語翻訳機能付き）
│       ├── app-main.js     # バニラJS実装（HTMLのonclickハンドラー用）
│       ├── app-improved.js # 改善版Reactアプリ
│       └── *.backup.js     # 各種バックアップファイル
├── dist/                   # ビルド出力
├── package.json            # 依存関係
├── vite.config.ts          # Viteビルド設定
├── wrangler.jsonc          # Cloudflare Workers設定
└── ecosystem.config.cjs    # PM2設定

```

## 🔄 ルーティング構成

### バックエンド（src/index.tsx）
```typescript
// 静的ファイルのルーティング
app.use('/static/*', serveStatic({ root: './public' }))

// APIエンドポイント
app.post('/api/categorize')     // AI色分け
app.post('/api/generate-image') // 画像生成（モック）
app.get('/api/health')          // ヘルスチェック

// メインページ
app.get('/')  // HTMLをインラインで返す（長大なHTML文字列）
```

### フロントエンド構成
1. **HTML部分**（src/index.tsx内のインラインHTML）
   - 完全なUIレイアウト
   - `onclick="App.xxx"`形式のイベントハンドラー
   - `id="app"`は既にコンテンツが入っている

2. **JavaScript部分**（/static/app-main.js）
   - グローバル`App`オブジェクトを提供
   - HTMLのonclickハンドラーと連携
   - 日本語翻訳辞書（100以上の単語）
   - タグ管理、カテゴリ分類、重み調整

## 🚀 実装済み機能

### ✅ 完成機能
1. **日本語タグ自動生成**
   - 100以上の翻訳辞書
   - 英日双方向翻訳
   - リアルタイム同期

2. **プロンプト処理**
   - テキスト分解（Split to Tags）
   - AI色分け（8カテゴリ）
   - AI生成（品質タグ追加）

3. **タグ編集**
   - 重み調整（0.1〜2.0）
   - ドラッグ&ドロップ（未実装）
   - 削除・追加機能

4. **API連携**
   - OpenRouter APIキーテスト
   - モデルリスト自動取得
   - クイック選択（General/Creative/Translation/Free）

5. **出力形式**
   - SDXL形式（カンマ区切り、重み付き）
   - Flux形式（自然言語）
   - ImageFX形式（スペース区切り）

6. **その他**
   - ローカルストレージ保存
   - コピー機能
   - ダウンロード機能

### ⚠️ 未実装機能
- 画像解析（Image to Prompt）
- バッチ処理
- 実際の画像生成API連携
- ドラッグ&ドロップによる順序変更

## 📝 今回の反省点と注意点

### 🔴 問題点と原因

1. **ルーティングの混乱**
   - 原因：HTMLとJavaScriptの連携方法を途中で変更
   - 影響：ReactアプリとHTMLのonclickハンドラーが不一致

2. **ファイル参照の混乱**
   - 原因：app.js、app-improved.js、app-main.jsの役割が不明確
   - 影響：どのファイルを修正すべきか混乱

3. **アーキテクチャの不一致**
   - 原因：ReactアプリとバニラJSの混在
   - 影響：グローバルAppオブジェクトの有無で動作しない

### ✅ 解決策

1. **明確な役割分担**
   - HTML：UIレイアウトとonclickハンドラー
   - app-main.js：グローバルAppオブジェクトと機能実装
   - app.js：Reactアプリ（現在は未使用）

2. **ルーティングの統一**
   - `/static/*`で静的ファイルを提供
   - src/index.tsxでHTMLをインライン提供

3. **命名規則の統一**
   - 本番用：app-main.js
   - バックアップ：*.backup.js
   - テスト用：test-*.html

## 🎯 今後の開発指針

### DO ✅
1. **ファイル構成を維持**
   - src/index.tsx：バックエンドとHTMLテンプレート
   - public/static/app-main.js：フロントエンド機能

2. **変更前にバックアップ**
   ```bash
   cp file.js file.backup-$(date +%Y%m%d_%H%M%S).js
   ```

3. **ビルドとPM2再起動**
   ```bash
   npm run build && pm2 restart ss-prompt-manager
   ```

### DON'T ❌
1. **シンプル化しない**
   - 作った機能を削除しない
   - 複雑でも動作する状態を維持

2. **ファイル参照を変更しない**
   - app-main.jsがメイン
   - 他のファイルは触らない

3. **テストファイルを増やさない**
   - 本番環境で直接テスト
   - テストファイルは削除済み

## 📊 パフォーマンス指標

- ビルドサイズ：77.48 KB（_worker.js）
- ビルド時間：約500ms
- PM2メモリ使用：約20MB
- レスポンス時間：<100ms

## 🔗 アクセスURL

- **開発環境**: https://3000-icbwmbmktn0pgobop47sb-6532622b.e2b.dev
- **GitHub**: https://github.com/ssspace1/ss-prompt-manager-V2.1
- **ヘルスチェック**: /api/health

## 📌 重要なコマンド

```bash
# 開発サーバー起動（PM2使用）
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs

# ログ確認
pm2 logs ss-prompt-manager --nostream

# サービス再起動
pm2 restart ss-prompt-manager

# ポート解放
fuser -k 3000/tcp 2>/dev/null || true

# GitHub push
git add -A
git commit -m "message"
git push origin main
```

## 🏷️ バージョン情報

- **Version**: 2.1
- **Last Updated**: 2024-08-21
- **Author**: ssspace1
- **License**: MIT

---

このドキュメントは開発の指針として使用してください。
構成を変更する場合は、必ずこのドキュメントも更新してください。