# 🎨 SS Prompt Manager - カテゴリ分類システム解説

## 📋 概要
SS Prompt Managerには**2つのカテゴリ分類システム**が存在します：

1. **キーワードベース分類** (JavaScript関数) - 高速・オフライン動作
2. **AIベース分類** (CATEGORIZER プロンプト) - より正確・コンテキスト理解

## 🔍 現在の仕組み

### 1. Text to Prompt での色分け

```javascript
// タグ生成時の流れ
1. AIがプロンプトを生成
2. categorizeTag() 関数で初期分類（キーワードベース）
3. APIキーがある場合、AI分類で上書き（オプション）
```

### 2. Image to Prompt での色分け

```javascript
// 画像解析時の流れ
1. 画像解析実行
2. タグ生成時にAIが直接カテゴリを付与
   - "category": "person|appearance|clothes|pose|background|quality|style|other"
3. キーワードベース分類はフォールバックとして使用
```

## 🎯 カテゴリと色の対応

| カテゴリ | 色 | 説明 | キーワード例 |
|---------|-----|------|------------|
| **composition** | 🟣 紫 | 構図・カメラアングル | angle, view, shot, close-up |
| **quality** | 🟡 黄 | 品質・解像度 | masterpiece, best quality, 8k |
| **person** | 🟠 オレンジ | 人物・キャラクター | 1girl, boy, woman, man |
| **clothing** | 🩷 ピンク | 服装・衣類 | dress, suit, uniform |
| **appearance** | 🔵 青 | 外見・容姿 | hair, eyes, smile |
| **action** | 🟣 紫 | 動作・ポーズ | sitting, running, pose |
| **background** | 🟢 緑 | 背景・環境 | forest, city, outdoor |
| **style** | 🟣 紫 | アートスタイル | anime, realistic |
| **object** | 🟤 茶 | オブジェクト・小物 | flower, book, weapon |
| **other** | ⚫ グレー | その他 | 上記に当てはまらないもの |

## ⚙️ カテゴリ分類の編集方法

### 方法1: キーワードベース分類を編集（JavaScript）

**場所**: `/public/static/app-main.js` の `categorizeTag()` 関数

```javascript
function categorizeTag(text) {
  const categoryKeywords = {
    composition: [
      // ここにキーワードを追加
      'angle', 'view', 'shot', ...
    ],
    quality: [
      // 品質関連のキーワード
      'masterpiece', 'best quality', ...
    ],
    // 他のカテゴリ...
  };
}
```

### 方法2: AI分類プロンプトを編集（推奨）

**手順**:
1. アプリを開く
2. 設定（⚙️）→ AI Instructions タブ
3. "Categorizer Prompt" セクションを探す
4. プロンプトを編集

**または直接編集**:
```javascript
// defaultSystemPrompts内の 'categorizer' プロンプトを編集
'categorizer': `You are an AI tag categorizer...
- person: Characters, people...
- appearance: Physical features...
// カテゴリ定義をここで変更
`
```

## 🔄 Text to Prompt と Image to Prompt の違い

### Text to Prompt
```
テキスト入力
    ↓
AI生成（フォーマット別プロンプト使用）
    ↓
タグ分割
    ↓
categorizeTag() でキーワード分類
    ↓
（オプション）AI再分類
```

### Image to Prompt
```
画像アップロード
    ↓
画像解析（Vision AI）
    ↓
タグ生成（AIが直接カテゴリ付与）
    ↓
フォールバック時のみ categorizeTag() 使用
```

## 📝 カスタマイズ例

### 新しいカテゴリを追加したい場合

1. **キーワードベースに追加**:
```javascript
const categoryKeywords = {
  // 新カテゴリを追加
  emotion: [
    'happy', 'sad', 'angry', 'surprised', 
    'smile', 'crying', 'laughing'
  ],
  // 既存のカテゴリ...
};
```

2. **AI プロンプトに追加**:
```
- emotion: Emotional expressions and moods (happy, sad, crying, smiling)
```

3. **色を設定**（TagEditor内）:
```javascript
const categoryColors = {
  emotion: 'bg-red-100 text-red-800', // 新しい色
  // 既存の色...
};
```

## 🚀 最適化のヒント

1. **高速化が必要な場合**: キーワードベース分類のみ使用
2. **正確性が必要な場合**: AI分類を有効化（APIキー必須）
3. **カスタムカテゴリ**: 両方のシステムに追加して一貫性確保

## 🔧 トラブルシューティング

### カテゴリが正しく付かない
- キーワードのスペルを確認
- AI プロンプトの形式を確認
- コンソールでエラーをチェック

### 色が表示されない
- TagEditor.renderTags() 内の categoryColors を確認
- カテゴリ名の一致を確認

## 📊 現在の処理優先順位

1. **Image to Prompt**: AI直接分類 → キーワード分類（フォールバック）
2. **Text to Prompt**: キーワード分類 → AI分類（オプション上書き）

この優先順位により、Image to Promptの方がより正確な分類が可能です。