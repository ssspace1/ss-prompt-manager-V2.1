# 🎯 System Flow Tab - Complete Visual Guide

## 📋 概要
新しく追加されたSystem Flowタブは、SS Prompt Managerのシステム全体を視覚的に図解し、ユーザーが迷わずに編集すべき場所を特定できるようにします。

## 🎨 タブの特徴

### **🔍 視覚的フローダイアグラム**
- **Text to Prompt Flow**: 4つのステップでテキスト生成の流れを表示
- **Image to Prompt Flow**: 4つのステップで画像解析の流れを表示
- **System Architecture**: 3つのカテゴリでシステム構成を整理

### **⚡ インタラクティブ編集**
- 全ての部品がクリック可能
- 直接プロンプト編集画面にジャンプ
- ホバー効果で操作性を向上

## 📊 構成セクション詳細

### **1. Text to Prompt Flow (テキスト生成フロー)**

#### **ステップ1: User Input (ユーザー入力)**
- 📍 **場所**: Text to Prompt タブ
- 🎯 **機能**: テキスト入力 → AI Format選択
- 🔧 **編集対象**: なし（UI部分）

#### **ステップ2: AI Generation (AI生成)**
- 📍 **場所**: AI Format ドロップダウン選択時
- 🎯 **機能**: 選択されたフォーマットでプロンプト処理
- 🔧 **編集対象**: 
  - `sdxl` - SDXL Tags形式
  - `flux` - Flux Phrases形式
  - `imagefx` - ImageFX形式
  - `imagefx-natural` - ImageFX Natural形式

#### **ステップ3: Tag Processing (タグ処理)**
- 📍 **場所**: AI生成後の自動処理
- 🎯 **機能**: 正規化 → 分類 → 翻訳
- 🔧 **編集対象**:
  - `tag-normalizer` - タグ正規化
  - `categorizer` - カテゴリ分類
  - `translation-en-ja` - 英→日翻訳
  - `translation-ja-en` - 日→英翻訳

#### **ステップ4: Final Output (最終出力)**
- 📍 **場所**: Tag Editor
- 🎯 **機能**: 色分けされたタグ表示 → コピー
- 🔧 **編集対象**: なし（結果表示）

### **2. Image to Prompt Flow (ハイブリッド画像解析フロー) 🔄**

#### **ステップ1: Image Upload (画像アップロード)**
- 📍 **場所**: Image to Prompt タブ
- 🎯 **機能**: 画像のアップロードまたはドラッグ&ドロップ
- 🔧 **編集対象**: なし（UI部分）

#### **ステップ2: Hybrid AI Analysis (ハイブリッドAI解析) 🚀**
- 📍 **場所**: AI Generate ボタンクリック時
- 🎯 **機能**: **並列実行** - LLM解析 + WD-EVA02 Tagger解析
- 🔧 **編集対象**: 
  - `image-analysis` - LLM画像解析プロンプト
  - `tagger-model` - WD-EVA02-Large v3専用タガー設定
  - `fusion-mode` - 統合モード（Balanced/Tagger-focused/LLM-focused）

#### **ステップ3: Intelligent Fusion (インテリジェント融合) 🧠**
- 📍 **場所**: LLM + Tagger結果の自動統合
- 🎯 **機能**: 
  - **AI Analysis Result**: GPT-4o/Gemini等の詳細分析
  - **WD-EVA02 Tagger Result**: 専用タガーの高精度タグ（信頼度付き）
  - **Smart Fusion**: カテゴリ別優先度 + 重複除去 + 重み調整
- 🔧 **編集対象**: 
  - `fusion-rules` - カテゴリ別融合ルール
  - `confidence-threshold` - Tagger信頼度しきい値

#### **ステップ4: Hybrid Ready Tags (ハイブリッド完成タグ) ✨**
- 📍 **場所**: Tag Editor（Image to Prompt）
- 🎯 **機能**: 
  - **Source Badge**: 各タグにLLM/Tagger/Hybridの出典表示
  - **Confidence Display**: 信頼度パーセンテージ表示
  - **Quality Optimization**: 両方のAIの長所を活かした高品質タグ
- 🔧 **編集対象**: なし（結果表示）

### **3. System Architecture (システム構成)**

#### **Core AI Systems (コアAIシステム)**
```
🎨 Tag Categorizer (categorizer)
👁️ Image Analysis (image-analysis)  
🤖 WD-EVA02 Tagger (wd-eva02-large-tagger-v3) - NEW!
🔄 Hybrid Fusion Engine (fusion-engine) - NEW!
🔧 Tag Normalizer (tag-normalizer)
📋 Structured Tags (structured-tags)
```

#### **Generation Formats (生成フォーマット)**
```
🏷️ SDXL Tags (sdxl)
🌊 Flux Phrases (flux)
🖼️ ImageFX (imagefx)
🍃 ImageFX Natural (imagefx-natural)
```

#### **Translation & Utilities (翻訳・ユーティリティ)**
```
➡️ EN → JA (translation-en-ja)
⬅️ JA → EN (translation-ja-en)
🔧 Custom Translation (translation-custom)
🖥️ Backend Translation (backend-translation)
```

## 🎯 使用方法

### **📍 アクセス**
1. メイン画面上部のタブバーから「System Flow」をクリック
2. システム全体の視覚的図解が表示される

### **🔧 編集方法**
1. **個別編集**: 各プロンプトボタンをクリック → 直接編集画面
2. **設定画面経由**: 「Settings」ボタン → 設定画面
3. **ヘルプ確認**: 「Help」ボタン → ヘルプモーダル

### **🎨 色分けシステム**
| カテゴリ | 色 | 用途 |
|---------|-----|------|
| 🔵 Blue | 入力・基本機能 | User Input, Core Systems |
| 🟣 Purple | AI処理 | AI Generation, Vision Analysis |
| 🟢 Green | タグ処理 | Processing, Generation Formats |
| 🟡 Yellow | 翻訳・出力 | Translation, Final Output |
| 🟠 Orange | ユーティリティ | Utilities, Backend |

## 🚀 メリット

### **👁️ 視覚的理解**
- システム全体が一目でわかる
- データの流れが明確
- 編集ポイントが特定しやすい

### **⚡ 操作性向上**
- ワンクリックで編集画面にアクセス
- 迷わずに目的の設定に到達
- 関連機能がグループ化されている

### **📚 学習効果**
- 初心者でもシステムを理解しやすい
- 各プロンプトの役割が明確
- トラブルシューティングが容易

## 🔗 クイックリンク集

### **設定関連**
- 🔧 Settings → メイン設定画面
- 📋 Test → 全プロンプトテストページ
- ❓ Help → システムヘルプ

### **機能切り替え**
- 📝 Text → Text to Prompt タブ
- 🖼️ Image → Image to Prompt タブ
- ℹ️ Guide → システム全体ヘルプ

## 💡 活用シナリオ

### **🔰 初心者向け**
1. System Flowタブでシステム全体を把握
2. Text to Prompt Flowで基本的な流れを理解
3. 各ステップのボタンをクリックして実際の設定を確認

### **🎯 上級者向け**
1. System Architectureで設定が必要な部分を特定
2. 直接編集ボタンをクリックして効率的に設定
3. Quick Edit Panelで関連機能に素早くアクセス

### **🐛 トラブルシューティング**
1. 問題が発生している機能の流れを確認
2. 関連するプロンプトを特定して編集
3. テストページで動作確認

## 📈 技術的詳細

### **レスポンシブデザイン**
- モバイル〜デスクトップ対応
- グリッドレイアウトで整理
- ホバー効果とトランジション

### **アクセシビリティ**
- 明確な色分けとアイコン
- 日英バイリンガル表示
- キーボードナビゲーション対応

### **パフォーマンス**
- 軽量なCSS設計
- 効率的なJavaScript
- 必要時のみ動的ロード

この新しいSystem Flowタブにより、ユーザーは迷うことなくシステム全体を理解し、必要な編集を効率的に行うことができます。