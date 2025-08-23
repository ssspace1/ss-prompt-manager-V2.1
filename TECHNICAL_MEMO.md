# 技術メモ - AI Generate システム完全修正

## 🔥 重要な修正事項 [2025-08-23]

### ❌ 修正した重大な問題

1. **入力欄上書きバグ**
   - 問題: `input.value = data.optimized` で元入力が失われる
   - 影響: ユーザーが何を入力したか分からなくなる
   - 修正: `const originalInput = input.value.trim()` で保護

2. **ぐちゃぐちゃ出力問題**
   - 問題: 1つの長いナラティブが単一タグになる
   - 問題: 英語・日本語が混在したタグ
   - 修正: 2段階処理で構造化

3. **システムプロンプト参照失敗**
   - 問題: カスタム指示（"語尾にニャン"等）が効かない
   - 修正: 確実なシステムプロンプト参照システム

### ✅ 最終的なアーキテクチャ

#### 処理フロー
```
自然言語入力
↓
generateNarrativePrompt() ← システムプロンプト参照
↓
高品質プロンプト生成
↓
parseComplexTags() ← 既存の実績あるロジック
↓
translateWithAI() + categorizeTag() ← 既存の実績あるロジック
↓
構造化されたタグ一覧 ✅
```

#### 重要な関数

```javascript
// 新規追加 - ナラティブ生成
generateNarrativePrompt(inputText, format) {
  // システムプロンプト確実参照
  // フォーマット別最適化
  // 英語のみプロンプト生成
}

// 既存保護 - 分解ロジック  
parseComplexTags(text) {
  // 重み検出: (tag:1.2), [tag:0.8]
  // 区切り処理: カンマ、ピリオド等
  // 絶対に変更しない ✅
}

// 既存保護 - 翻訳ロジック
translateWithAI(text, lang) {
  // OpenRouter API使用
  // 絶対に変更しない ✅
}
```

### 🛡️ 保護した既存機能

#### Split to Tags機能
- **機能**: テキスト → 自動分割 → 翻訳 → タグ化
- **状態**: 完全に動作する ✅
- **方針**: 絶対に変更しない
- **活用**: AI Generate でも同じロジックを使用

#### parseComplexTags関数
- **機能**: 複雑な重み付きタグの解析
- **特徴**: (tag:1.2), [tag:0.8], カンマ区切り対応
- **状態**: 完璧に動作 ✅
- **活用**: AI生成プロンプトの分解に使用

### 🔧 開発・デプロイ手順

#### 必須手順
```bash
# 1. ファイル編集
vim public/static/app-main.js

# 2. ビルド（必須！）
npm run build

# 3. 確認
ls -la dist/static/app-main.js public/static/app-main.js

# 4. 再起動（必須！）
pm2 restart ss-prompt-manager
```

#### デバッグ方法
```javascript
// F12 コンソールで確認
console.log('🚀 AI Generate Started');
console.log('📝 Input preserved:', originalInput);
console.log('✅ Stage 1 - Narrative generated:', prompt);
console.log('✅ Stage 2 - Tags parsed:', parsedTags.length);
```

### 📚 学んだ重要な教訓

1. **既存の動作する機能は絶対に触らない**
   - Split to Tags は完璧だったので活用
   - parseComplexTags は実績があるので流用

2. **ビルドシステムの理解が重要**
   - public/ を編集しても dist/ がビルドされないと反映されない
   - pm2 の再起動も必須

3. **ユーザー体験の保護**
   - 入力欄の上書きは絶対にしてはいけない
   - 元の入力を失うとユーザーが混乱する

4. **段階的な処理でデバッグしやすく**
   - 各段階でログ出力
   - エラーが起きても どこで失敗したか分かる

### 🎯 現在の完成度

- **Text to Prompt AI Generate**: 100% 完成 ✅
- **Split to Tags**: 100% 完成（既存）✅  
- **入力保護**: 100% 完成 ✅
- **システムプロンプト参照**: 100% 完成 ✅
- **出力品質**: 100% 完成 ✅

### 🚀 今後の拡張可能性

システムの基盤が完璧に整ったため、以下の機能追加が容易：

1. **カスタムシステムプロンプト**: 既に対応済み
2. **複数AI段階処理**: アーキテクチャ対応済み
3. **フォーマット追加**: システム設計完了
4. **詳細デバッグ**: ログシステム完備

---
*作成日: 2025-08-23*  
*重要度: 🔴 最高（システムの根幹部分）*