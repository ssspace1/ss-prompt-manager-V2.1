# SS Prompt Manager

## プロジェクト概要
- **名称**: SS Prompt Manager
- **目標**: 自然言語やキーワードから、各画像生成モデル（SDXL/Flux/ImageFX）に最適化されたプロンプトを生成し、英日バイリンガル編集UIで調整できるWebアプリ
- **主要機能**: 
  - OpenRouter.ai APIによる最新AIモデルの利用
  - 英日バイリンガルタグ編集（リアルタイム同期・翻訳）
  - AI駆動のプロンプト最適化と自動カテゴリ分類
  - 複数出力形式対応（SDXL、Flux、ImageFX、カスタム）
  - ドラッグ＆ドロップによるタグ順序変更
  - 重み調整機能（0.1〜2.0）
  - バッチ処理機能

## URL
- **開発環境**: https://3000-icbwmbmktn0pgobop47sb-6532622b.e2b.dev
- **GitHub**: https://github.com/ssspace1/ss-prompt-manager-V2.1
- **本番環境**: 未デプロイ（Cloudflare Pages予定）
- **ヘルスチェック**: https://3000-icbwmbmktn0pgobop47sb-6532622b.e2b.dev/api/health

## 現在完成している機能

### ✅ 実装済み機能
1. **OpenRouter.ai API統合**
   - 最新モデル一覧の自動取得と表示
   - モデル選択UI（推奨モデルのクイック選択機能付き）
   - APIキーの検証機能
   - 無料モデルの識別表示

2. **プロンプト処理機能**
   - テキスト分解（カンマ、句読点、改行での分割）
   - AI駆動の自動カテゴリ分類（8カテゴリ）
   - AI最適化（SDXL/Flux/ImageFX形式別）
   - カスタムシステムプロンプト編集

3. **バイリンガル編集UI** 🆕 **2024/08/21 完全実装！**
   - **英日2カラム表示で完全同期**
   - **リアルタイム双方向翻訳** - 英語を編集→日本語自動更新、日本語を編集→英語自動更新
   - **包括的な翻訳辞書** - 100以上の画像生成関連単語・フレーズを網羅
   - **インテリジェント翻訳** - 辞書ベースの高速翻訳とフレーズ認識
   - **翻訳キャッシュ** - 一度翻訳した内容は即座に表示
   - **日本語入力対応** - 日本語でタグを追加すると自動で英語に翻訳
   - **分解時自動翻訳** - プロンプト分解時に全タグを自動翻訳
   - **AI生成時自動翻訳** - AI生成されたタグも自動的に日本語化

4. **タグ管理機能**
   - ドラッグ＆ドロップによる順序変更
   - 重み調整（0.1〜2.0、0.05刻み）
   - カテゴリ別色分け表示
   - カテゴリ/重み別ソート

5. **出力機能**
   - 4種類の出力形式（SDXL、Flux、ImageFX、カスタム）
   - ワンクリックコピー
   - テキストファイルダウンロード
   - リアルタイムプレビュー

6. **設定管理**
   - システムプロンプトのカスタマイズ
   - 自動翻訳・自動カテゴリ分類の切り替え
   - 設定の永続化（LocalStorage）

### ⚠️ 部分実装
- **画像生成プレビュー**: モックAPI実装（実際のAPIは未接続）
- **画像解析タブ**: UIのみ（機能未実装）
- **バッチ処理**: 基本機能のみ実装

## 未実装機能
1. **実際の画像生成API接続**（DALL-E、Midjourney、Stable Diffusion等）
2. **画像からのプロンプト抽出**（画像解析機能）
3. **プロンプト履歴管理**
4. **A/B比較機能**
5. **エクスポート/インポート機能（JSON形式）**
6. **ダークテーマ**
7. **多言語UI対応**

## 推奨される次のステップ

### 優先度：高
1. **OpenRouter APIキーの設定**
   - 設定画面でAPIキーを入力
   - https://openrouter.ai/keys でキーを取得

2. **本番環境へのデプロイ**
   - Cloudflare Pagesへのデプロイ
   - 環境変数の設定

3. **実際の画像生成API統合**
   - 優先候補：OpenAI DALL-E 3、Stability AI、Replicate

### 優先度：中
1. **画像解析機能の実装**
   - Vision APIによる画像分析
   - タグ抽出とプロンプト生成

2. **履歴管理システム**
   - IndexedDBによる永続化
   - 検索・フィルタ機能

3. **共有機能**
   - URL共有
   - エクスポート/インポート

### 優先度：低
1. **UI/UXの改善**
   - ダークモード
   - モバイル最適化
   - アニメーション強化

2. **高度な機能**
   - プロンプトテンプレート
   - ユーザープリセット
   - コラボレーション機能

## データアーキテクチャ

### データモデル
```javascript
// Tag Model
{
  id: number,
  en: string,        // 英語テキスト
  ja: string,        // 日本語テキスト
  weight: number,    // 重み (0.1-2.0)
  category: string,  // カテゴリ
  locked: boolean    // ロック状態
}

// Categories
- person: 人物・キャラクター
- appearance: 外見・特徴
- clothing: 服装・衣装
- pose: ポーズ・動作
- background: 背景・環境
- quality: 品質・解像度
- style: スタイル・画風
- other: その他
```

### ストレージ
- **LocalStorage**: 設定、APIキー、最近の作業
- **SessionStorage**: 一時的なキャッシュ
- **将来**: IndexedDB（履歴管理用）

## 使い方ガイド

### 初期設定
1. アプリケーションにアクセス
2. 右上の設定ボタンをクリック
3. OpenRouter APIキーを入力（https://openrouter.ai/keys で取得）
4. 「Test」ボタンでAPIキーを検証
5. AIモデルを選択（推奨：GPT-4o、Claude 3.5 Sonnet）

### 基本的な使い方
1. **入力**: テキストエリアにプロンプトやアイデアを入力
2. **処理方法を選択**:
   - 「Split to Tags」: シンプルな分割
   - 「AI Generate」: AI最適化（推奨）
3. **編集**: 生成されたタグを調整
   - ドラッグで順序変更
   - クリックして編集
   - +/- で重み調整
4. **出力**: 
   - 形式を選択（SDXL/Flux/ImageFX）
   - 「Copy」でクリップボードにコピー

### 高度な使い方
- **バッチ処理**: Batch Processingタブで複数プロンプトを一括処理
- **システムプロンプト編集**: 設定でAIの動作をカスタマイズ
- **自動機能**: 自動翻訳・自動カテゴリ分類を有効化

## 技術スタック
- **フロントエンド**: Vanilla JavaScript + TailwindCSS
- **バックエンド**: Hono Framework (TypeScript)
- **プラットフォーム**: Cloudflare Workers/Pages
- **外部API**: OpenRouter.ai
- **ライブラリ**: 
  - Sortable.js（ドラッグ＆ドロップ）
  - Split.js（分割ビュー）
  - Font Awesome（アイコン）

## デプロイメント
- **プラットフォーム**: Cloudflare Pages（予定）
- **ステータス**: 開発環境のみ稼働中
- **最終更新**: 2025-08-21

## 開発コマンド
```bash
# 開発サーバー起動
npm run build && pm2 start ecosystem.config.cjs

# ビルド
npm run build

# PM2管理
pm2 list
pm2 logs ss-prompt-manager --nostream
pm2 restart ss-prompt-manager

# Cloudflareデプロイ（準備中）
npm run deploy
```

## 環境変数
```bash
# .dev.vars (開発環境)
OPENROUTER_API_KEY=your_key_here
IMAGE_API_KEY=optional_key_here

# 本番環境（Cloudflare）
npx wrangler pages secret put OPENROUTER_API_KEY
```

## ライセンス
MIT

## 作者
SS Prompt Manager Development Team

---
*このアプリケーションは、画像生成AIのプロンプト作成を効率化することを目的として開発されています。*