# Image to Prompt 統一化実装計画

## 🎯 実装方針

### 基本方針
1. **TagEditorシステムの完全共通化**
   - 現在部分的に使用されているTagEditorを完全活用
   - 重複コード（renderImageTags等）を削除
   - コンテキスト切り替え（'main' vs 'image'）で動作制御

2. **HTMLテンプレート構造の維持**
   - 現在のレイアウトは良好なので基本構造は維持
   - スクロール対応のCSS追加のみ

3. **機能追加の優先順位**
   - 最優先: Split to Tags（画像解析結果の分割）
   - 高優先: AI Generateのタグ解析改善
   - 中優先: ドラッグ&ドロップ

## 📝 実装タスクリスト

### Task 1: Split to Tags機能の追加（最優先）
**場所**: `app-main.js`
**追加コード位置**: generateFromImage関数の後

```javascript
// Split image prompt to tags
splitImagePrompt: () => {
  const promptTextarea = document.getElementById('image-generated-prompt');
  if (!promptTextarea || !promptTextarea.value) {
    showNotification('No prompt to split', 'error');
    return;
  }
  
  const prompt = promptTextarea.value;
  const format = App.imageState.imageOutputFormat;
  
  // Clear existing tags
  App.imageState.imageTags = [];
  
  // Split based on format
  let segments = [];
  if (format === 'sdxl' || format === 'imagefx') {
    // Split by comma
    segments = prompt.split(/[,、]/);
  } else if (format === 'flux' || format === 'imagefx-natural') {
    // Split by sentence
    segments = prompt.split(/[.!?。！？]/);
  } else {
    // Default: split by comma and period
    segments = prompt.split(/[,、.。]/);
  }
  
  // Process each segment
  segments.forEach(segment => {
    const cleaned = segment.trim();
    if (!cleaned) return;
    
    // Extract weight if present (e.g., "tag:1.5")
    let weight = 1.0;
    let text = cleaned;
    
    const weightMatch = cleaned.match(/^(.+):(\d+\.?\d*)$/);
    if (weightMatch) {
      text = weightMatch[1].trim();
      weight = parseFloat(weightMatch[2]);
    }
    
    // Auto-translate
    const jaText = translationDict[text.toLowerCase()] || App.simpleTranslate(text);
    
    // Categorize
    const category = App.categorizeTag(text);
    
    // Add tag
    App.imageState.imageTags.push({
      id: `img-tag-${Date.now()}-${Math.random()}`,
      en: text,
      ja: jaText,
      weight: weight,
      category: category
    });
  });
  
  // Render tags using TagEditor
  TagEditor.renderTags('image');
  showNotification(`Split into ${App.imageState.imageTags.length} tags`, 'success');
}
```

### Task 2: HTMLボタンの追加
**場所**: `src/index.tsx` line 1000付近

```html
<!-- AI Format Prompt内に追加 -->
<div class="flex gap-2 mt-3">
  <button onclick="App.splitImagePrompt()" 
          class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
      <i class="fas fa-cut mr-2"></i>Split to Tags
  </button>
  <button onclick="App.clearImageTags()" 
          class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
      <i class="fas fa-trash mr-2"></i>Clear Tags
  </button>
</div>
```

### Task 3: AI Generate改善
**場所**: `app-main.js` generateFromImage関数

```javascript
// 改善版: タグ形式で生成するようシステムプロンプトを修正
const improvedSystemPrompt = `Based on this image analysis, generate optimized tags for image generation.
Rules:
1. Output comma-separated tags
2. Include quality tags first (masterpiece, best quality, etc.)
3. Add descriptive tags for subjects
4. Include style and atmosphere tags
5. Use weight notation where emphasis is needed (tag:1.2)
6. Keep tags concise and specific
Format: tag1, tag2, tag3:1.2, tag4`;
```

### Task 4: スクロール対応CSS追加
**場所**: `src/index.tsx` CSSセクション

```css
/* Tag containers scrolling */
#image-tags-en, #image-tags-ja {
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
}

#image-tags-en::-webkit-scrollbar,
#image-tags-ja::-webkit-scrollbar {
  height: 6px;
}

.tag-card {
  flex-shrink: 0;
  white-space: nowrap;
}
```

### Task 5: カテゴリ分類の共通化
**場所**: `app-main.js`

```javascript
// 共通のcategorizeTag関数を使用
categorizeTag: (text) => {
  const categoryPatterns = {
    person: /girl|boy|woman|man|person|child|adult|teen|1girl|2girls|1boy/i,
    appearance: /hair|eyes|face|skin|smile|beautiful|cute|handsome|pretty|tall|short/i,
    clothes: /dress|shirt|skirt|uniform|jacket|pants|shoes|hat|hoodie|suit|costume/i,
    clothing: /dress|shirt|skirt|uniform|jacket|pants|shoes|hat|hoodie|suit|costume/i,
    pose: /sitting|standing|walking|running|lying|squatting|kneeling|jumping|pose/i,
    background: /background|forest|city|room|outdoor|indoor|sky|mountain|beach|street/i,
    quality: /masterpiece|best quality|detailed|8k|4k|highres|professional|sharp|hd/i,
    style: /anime|realistic|cartoon|painting|digital|watercolor|sketch|artistic|style/i
  };
  
  for (const [category, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(text)) {
      return category;
    }
  }
  return 'other';
}
```

### Task 6: renderImageTags削除
**場所**: `app-main.js` line 2511-2621

```javascript
// 削除: renderImageTags関数全体
// 置換: TagEditor.renderTags('image')を使用
```

### Task 7: TagEditorのimageTag統合
**場所**: `app-main.js` TagEditorオブジェクト内

```javascript
// imageTag関数群を追加
imageTag: {
  increaseWeight: (index) => {
    if (App.imageState.imageTags[index]) {
      const tag = App.imageState.imageTags[index];
      tag.weight = Math.min(2.0, Math.round((tag.weight + 0.05) * 100) / 100);
      TagEditor.renderTags('image');
    }
  },
  
  decreaseWeight: (index) => {
    if (App.imageState.imageTags[index]) {
      const tag = App.imageState.imageTags[index];
      tag.weight = Math.max(0.1, Math.round((tag.weight - 0.05) * 100) / 100);
      TagEditor.renderTags('image');
    }
  },
  
  remove: (index) => {
    App.imageState.imageTags.splice(index, 1);
    TagEditor.renderTags('image');
  },
  
  updateText: (index, lang, text) => {
    if (App.imageState.imageTags[index]) {
      const tag = App.imageState.imageTags[index];
      tag[lang] = text;
      
      // Auto-translate
      if (lang === 'en') {
        tag.ja = translationDict[text.toLowerCase()] || App.simpleTranslate(text);
      } else {
        tag.en = App.reverseTranslate(text);
      }
      
      // Re-categorize
      tag.category = App.categorizeTag(tag.en);
    }
  }
}
```

## 📋 テストチェックリスト

### 機能テスト
- [ ] Split to Tagsボタンでプロンプトがタグに分割される
- [ ] タグのダブルクリックでインライン編集可能
- [ ] 英⇔日の双方向編集が即座に反映
- [ ] 重み調整が上下矢印で可能
- [ ] カテゴリ色分けが自動適用
- [ ] タグがスクロール可能
- [ ] ドラッグ&ドロップで順序変更（Phase 2）

### 統合テスト
- [ ] AI Generateでタグ形式で生成
- [ ] Final Output形式切り替えが正常動作
- [ ] Send to Mainで本体タブへ転送
- [ ] コピー/ダウンロード機能が動作

## 🚀 実装順序

1. **Phase 1（即座）**: 
   - Split to Tags機能追加
   - スクロールCSS追加
   - clearImageTags関数追加

2. **Phase 2（30分）**:
   - renderImageTags削除
   - TagEditor.imageTag実装
   - カテゴリ分類共通化

3. **Phase 3（1時間）**:
   - AI Generateプロンプト改善
   - ドラッグ&ドロップ実装

4. **Phase 4（テスト）**:
   - 全機能テスト
   - バグ修正
   - パフォーマンス最適化

## 📊 成功基準

1. **UI統一**: Image to PromptとText to Promptが同じ見た目
2. **機能パリティ**: 同じ機能が両方で使える
3. **コード共通化**: 重複コードゼロ
4. **ユーザビリティ**: スムーズな操作感

---
*実装開始: 2025-08-22*