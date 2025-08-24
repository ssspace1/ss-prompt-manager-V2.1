# SS Prompt Manager - 包括的再設計計画

## 🚨 現在の問題分析

### 発見された重大な問題
1. **AI指示システムの機能不全**
   - index.tsx にプロンプトがハードコーディング
   - app-main.js (6,403行, 225KB) が巨大すぎて管理不可能
   - UI設定からAI指示を編集する機能が未実装
   - システムプロンプトの統合管理が存在しない

2. **ファイル構造の混乱**
   - 重複ファイル: public/static/ と dist/static/
   - 不要なテンプレートファイルが3つ存在
   - 役割不明なファイルが多数
   - アーキテクチャが理解困難

3. **機能実装の不完全性**
   - システムプロンプトモーダルが機能していない
   - デフォルト復元機能が未実装
   - バックエンド・フロントエンド統合が不完全

## 🎯 新しい清潔なアーキテクチャ設計

### 推奨ファイル構造
```
src/
├── core/
│   ├── config/
│   │   ├── systemPrompts.ts      # 🆕 統合AI指示管理
│   │   ├── defaultPrompts.ts     # 🆕 デフォルト設定
│   │   └── settings.ts           # 🆕 アプリ設定
│   ├── api/
│   │   ├── translation.ts        # 🆕 翻訳API管理
│   │   ├── openrouter.ts         # 🆕 OpenRouter統合
│   │   └── prompts.ts            # 🆕 プロンプト取得API
│   └── utils/
│       ├── storage.ts            # 🆕 LocalStorage管理
│       └── validation.ts         # 🆕 設定検証
├── components/
│   ├── ui/
│   │   ├── SystemPromptsModal.ts # 🆕 AI指示編集UI
│   │   ├── SettingsPanel.ts      # 🆕 設定パネル
│   │   └── TranslationPanel.ts   # 🆕 翻訳パネル
│   └── app/
│       ├── mainApp.ts            # 🆕 分割されたメインロジック
│       └── eventHandlers.ts      # 🆕 イベント処理
├── templates/
│   └── main.html                 # ✅ 単一HTMLテンプレート
└── index.tsx                     # ✅ 簡潔なエントリーポイント

public/
├── static/
│   └── index.html               # ✅ 静的HTML
└── assets/                      # 🆕 静的リソース
```

### 核心機能の実装方針

#### 1. 統合AI指示管理システム
```typescript
// src/core/config/systemPrompts.ts
export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  category: 'translation' | 'enhancement' | 'custom';
}

export class SystemPromptsManager {
  // UI設定から編集可能
  // デフォルト復元機能
  // バックエンド・フロントエンド統合
}
```

#### 2. 清潔なAPI層
```typescript
// src/core/api/translation.ts
export class TranslationAPI {
  // システムプロンプトを動的取得
  // 設定に基づいてプロンプト選択
  // エラーハンドリング統合
}
```

#### 3. UI統合設定システム
```typescript
// src/components/ui/SystemPromptsModal.ts
export class SystemPromptsModal {
  // リアルタイム編集
  // プレビュー機能
  // デフォルト復元ボタン
  // 変更内容の保存・適用
}
```

## 🚀 実装ステップ

### Phase 1: 基盤構築
1. 新しいファイル構造作成
2. 統合AI指示管理システム実装
3. 設定システム構築

### Phase 2: UI統合
1. システムプロンプト編集モーダル実装
2. 設定パネル統合
3. リアルタイム更新機能

### Phase 3: 統合テスト
1. 全機能動作確認
2. AI指示変更の即座反映確認
3. デフォルト復元機能テスト

### Phase 4: 清掃・最適化
1. 古いファイル完全除去
2. 重複コード削除
3. パフォーマンス最適化

## 🎯 期待される結果

### ✅ 解決される問題
- AI指示がUI設定から簡単に編集可能
- デフォルト復元機能で安全な設定管理
- 理解しやすい清潔なコード構造
- 開発・保守が容易なアーキテクチャ
- バックエンド・フロントエンド完全統合

### 📊 品質指標
- ファイルサイズ: 225KB → 50KB以下 (80%削減)
- ファイル数: 理解困難 → 役割明確化
- 機能: 部分的 → 完全統合
- 保守性: 困難 → 容易

この計画に基づいて段階的に実装を進めます。