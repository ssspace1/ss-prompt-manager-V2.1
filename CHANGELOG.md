# Changelog

## [2025-08-23] システムプロンプト強化 - 5ブロック階層モデル統合

### 🎯 高品質プロンプト生成システムの導入
- **複数カット書き出し用システムプロンプトの統合**: 高度な構造化思考プロセスを適用
- **5ブロック階層モデル**: 関係性配置 → メインキャラ → サブキャラ → 環境 → 場所文脈
- **厳格なルール体系**: 表情と視線の厳密化、禁止事項、具体的描写ルール

### 📝 フォーマット別最適化強化

#### SDXL Master Tag Generator v15.0
- **短いタグ・フレーズ特化**: crouching, looking_up, seiza等の具体的ポジション
- **物理的配置優先**: sitting_on_floor, standing_behind等の詳細な位置関係
- **品質タグ制限**: masterpiece等の抽象的タグを最小限に抑制
- **固有名詞回避**: 有名人名ではなく1girl, 1boy等の一般的記述を強制

#### Flux Narrative Master v14.0  
- **長いフレーズ・文章特化**: "1girl and 1boy in a natural hot spring deep within a lush forest"
- **感情・雰囲気重視**: "sense of discovery mixed with gentle vulnerability"
- **映画的表現**: "golden sunlight filtering through dense forest canopy creating dappled patterns"
- **環境没入感**: "steaming mineral water surrounded by moss-covered rocks and ancient trees"

### 🔧 技術的改善
- **思考プロセス統合**: ユーザー入力から5段階の構造化分析を実行
- **カテゴリ自動分類**: person, appearance, clothing, pose, background, quality等
- **重み付け最適化**: 主要要素1.2-1.3, 詳細1.1, 標準1.0, 背景0.9

---

## [2025-08-23] AI Generate機能の完全再設計

### 🚨 重大な問題の修正
- **❌ 問題**: AI Generateが入力欄を上書きしていた（ユーザーの元入力が失われる重大なバグ）
- **❌ 問題**: 出力がぐちゃぐちゃ（長いナラティブが1つのタグになる、英語・日本語混在）
- **❌ 問題**: システムプロンプトが参照されていない（カスタム指示が効かない）
- **✅ 解決**: 完全な2段階処理システムを構築

### 🎯 新しいワークフロー設計

#### 理想的な処理フロー
```
【入力】"なんかかっこいい女でエモい感じでタバコ吸ってる感じ。服装もいいもの選んで"
↓
【段階1】AIがシステムプロンプト参照して高品質プロンプト生成
├─ システムプロンプト: フォーマット別最適化
├─ 結果例: "1girl in a dimly lit back alley at night. The wet asphalt reflects..."
└─ 入力欄: 絶対に変更されない ✅
↓
【段階2】既存の実績ある分解ロジック適用
├─ parseComplexTags(): 重み検出、区切り処理
├─ translateWithAI(): 日本語翻訳
├─ categorizeTag(): カテゴリー自動分類
└─ TagEditor.renderTags(): UI表示・色分け
↓
【結果】構造化された綺麗なタグ一覧 ✅
```

### ✨ 技術的改善点

#### 1. **入力保護システム**
```javascript
const originalInput = input.value.trim(); // PRESERVE original input
// 処理中は絶対に input.value を変更しない
```

#### 2. **2段階AI処理**
```javascript
// Stage 1: Narrative prompt generation
const generatedPrompt = await App.generateNarrativePrompt(originalInput, currentFormat);

// Stage 2: Use existing proven split logic
const parsedTags = App.parseComplexTags(generatedPrompt);
```

#### 3. **システムプロンプト統合**
- フォーマット別システムプロンプトの確実な参照
- ナラティブ生成用専用プロンプト
- カスタム指示（"語尾にニャン"等）の確実な反映

#### 4. **堅牢性向上**
- 詳細なデバッグログ（console.log）
- エラーハンドリング強化
- 既存の実績ある機能の保護

### 🛡️ 既存機能の保護

#### Split to Tags機能
- **保護対象**: parseComplexTags, translateWithAI, categorizeTag
- **理由**: この機能は正常に動作しているため、絶対に変更しない
- **活用**: AI Generate でも同じロジックを使用

### 📝 修正されたファイル

#### public/static/app-main.js
- `generateOptimized()`: 完全再設計（2段階処理）
- `generateNarrativePrompt()`: 新規追加（システムプロンプト参照）
- `JsonProcessor`: 堅牢なJSON処理クラス追加
- デバッグ機能強化

#### システムプロンプト更新
- Flux: STRUCTURED TAG GENERATOR v13.0（複数タグ生成）
- 長いナラティブ生成の回避
- 英語のみ出力の徹底

### 🔧 ビルド・デプロイ

#### 重要な教訓
- **問題**: `dist/`ディレクトリが古いファイルを使用していた
- **解決**: `npm run build` 後に `pm2 restart` が必要
- **確認**: ファイルタイムスタンプの確認が重要

```bash
# 正しいデプロイ手順
npm run build
pm2 restart ss-prompt-manager
```

### 🎯 動作テスト例

**入力**: "なんかかっこいい女でエモい感じでタバコ吸ってる感じ。服装もいいもの選んで"
**期待結果**:
- 入力欄: 元の文章が保持される
- タグ: 構造化された複数タグ（英語・日本語分離、カテゴリー色分け）
- 処理: コンソールで段階的処理が確認可能

## [2025-08-21] 形式切り替え機能の改善

### 🎯 解決した問題
- **問題**: 形式を切り替えると Final Output が変わってしまう
- **解決**: Final Output と AI生成形式を完全に分離

### ✨ 新機能

#### 1. **独立した形式選択**
- **AI Format**: AI生成時に使用する形式（プロンプト生成方法を決定）
- **Final Output Format**: タグエディターの内容を表示する形式（表示のみ）
- 両者は独立して動作し、相互に影響しない

#### 2. **システムプロンプト編集機能**
- 各形式の横に歯車アイコン（⚙）を配置
- クリックでシステムプロンプト編集モーダルを表示
- ユーザーが独自のタグ生成ルールを定義可能
- デフォルトにリセット機能付き

#### 3. **カスタム形式の追加**
- プラスアイコン（+）でカスタム形式を追加
- ユーザー定義の形式名とプロンプトを設定
- 追加した形式は両方のドロップダウンで選択可能

### 📝 技術的な変更点

#### フロントエンド（app-main.js）
```javascript
// 状態の分離
appState = {
  outputFormat: 'sdxl',        // AI生成用
  finalOutputFormat: 'sdxl',   // 表示用
  systemPrompts: {},           // カスタムプロンプト
  editingPrompt: null         // 編集中のプロンプト
}
```

#### バックエンド（index.tsx）
- `/api/generate-tags` エンドポイントがカスタムシステムプロンプトを受け付けるように拡張
- デフォルトプロンプトとカスタムプロンプトの優先順位を実装

### 🔧 使い方

1. **AI生成形式の選択**
   - 上部の「AI Format」ドロップダウンで選択
   - 歯車アイコンでシステムプロンプトを編集

2. **Final Output形式の選択**
   - Final Outputセクションの「Format」ドロップダウンで選択
   - タグエディターの内容がこの形式で表示される

3. **カスタム形式の追加**
   - プラスアイコンをクリック
   - 形式名を入力（英小文字とハイフンのみ）
   - システムプロンプトを編集

### 📌 デフォルト形式
- **SDXL Tags**: カンマ区切り、重み付き（tag:1.2）
- **Flux Phrases**: 文章形式（. で区切り）
- **ImageFX**: 簡潔な指示形式
- **ImageFX Natural**: 自然な文章形式

### 🚀 今後の拡張予定
- [ ] システムプロンプトのインポート/エクスポート
- [ ] プロンプトテンプレートライブラリ
- [ ] 形式ごとの生成履歴保存