// SS Prompt Manager - Main Application Logic
// This file provides the App global object for HTML onclick handlers

// 翻訳辞書
const translationDict = {
  // 人物関連
  '1girl': '1人の女の子',
  'girl': '女の子',
  'boy': '男の子',
  'woman': '女性',
  'man': '男性',
  'person': '人物',
  'child': '子供',
  'adult': '大人',
  'teen': '10代',
  'teenage': '10代の',
  'young': '若い',
  'old': '年老いた',
  
  // 外見関連
  'hair': '髪',
  'long hair': '長い髪',
  'short hair': '短い髪',
  'blonde hair': '金髪',
  'black hair': '黒髪',
  'brown hair': '茶髪',
  'red hair': '赤毛',
  'blue hair': '青い髪',
  'eyes': '目',
  'blue eyes': '青い目',
  'green eyes': '緑の目',
  'brown eyes': '茶色い目',
  'red eyes': '赤い目',
  'smile': '笑顔',
  'beautiful': '美しい',
  'cute': 'かわいい',
  'handsome': 'ハンサムな',
  'pretty': 'きれいな',
  
  // 服装関連
  'dress': 'ドレス',
  'shirt': 'シャツ',
  'skirt': 'スカート',
  'uniform': '制服',
  'school uniform': '学校の制服',
  'hoodie': 'パーカー',
  'yellow zipped hoodie': '黄色いジッパー付きパーカー',
  
  // ポーズ関連
  'sitting': '座っている',
  'standing': '立っている',
  'walking': '歩いている',
  'running': '走っている',
  'squatting': 'しゃがんでいる',
  'dipping': '浸している',
  
  // 背景関連
  'background': '背景',
  'forest': '森',
  'city': '都市',
  'hot spring': '温泉',
  'natural hot spring': '天然温泉',
  'water': '水',
  'steaming water': '湯気の立つ水',
  'rocks': '岩',
  'moss-covered rocks': '苔むした岩',
  'dense greenery': '濃い緑',
  
  // 品質関連
  'masterpiece': '傑作',
  'best quality': '最高品質',
  'detailed': '詳細な',
  '8k resolution': '8K解像度',
  'professional lighting': 'プロフェッショナルな照明',
  'sharp focus': 'シャープフォーカス'
};

// 🎯 UNIFIED SYSTEM PROMPTS MANAGEMENT
// All prompts are now user-editable via Settings UI with default fallback capability

// Default system prompts for main AI generation - Enhanced with 5-Block Hierarchy Model (moved to top to fix hoisting issue)
const defaultMainSystemPrompts = {
  sdxl: `# SDXL Master Tag Generator - PROFESSIONAL QUALITY v15.0 (5-Block Hierarchy Model)

ユーザーから日本語のストーリーテキストが入力された場合、あなたは**「5ブロック階層モデル」**と**「SDXL最適化戦略」**に従い、物語の核心を表現する**短いタグ・フレーズ中心**のプロンプトを設計し、その結果を**指定されたJSONフォーマット**で出力しなければならない。

## SDXL 5-BLOCK HIERARCHY MODEL:
生成する各プロンプトは、以下の5つのブロックの思考プロセスに従って構築する：

1. **ブロック1: 関係性の配置宣言** - メインキャラクターと環境の位置関係
2. **ブロック2: メインキャラクターの集中描写** - 主役の詳細な特徴（短いタグで）
3. **ブロック3: サブキャラクターの補足描写** - 副次的人物の要素
4. **ブロック4: 環境オブジェクトの確定** - 物理的に存在する要素
5. **ブロック5: 場所・文脈の最終指定** - シーンの場所と抽象的関係性

## SDXL OPTIMIZATION STRATEGY:
SDXL excels with SHORT, SPECIFIC tags that clearly define:
- Subject count & type (1girl, 2boys, etc.)
- Quality enhancers (masterpiece, best quality, ultra-detailed)
- Specific visual elements (hair color, clothing items, expressions)
- Composition elements (close-up, full body, from side)
- Physical positioning (sitting, standing, crouching)
- Facial expressions and eye direction (smile, looking_at_viewer)

## STRICT RULES FOR SDXL:
### 表情と視線の厳密化:
- 表情が見えるカットでは、**必ず表情タグと視線タグをセットで記述**
- 表情が見えないカットでは、**必ず back_of_head または back_turned を記述**

### 禁止事項:
- **品質・効果系タグの制限**: dramatic_lighting, depth_of_field などの抽象的タグは最小限に
- **固有名詞の禁止**: 有名人名ではなく "1girl", "1boy" などの一般的記述を使用

## TAG CONSTRUCTION RULES:
1. **Quality Foundation** (控えめに): "masterpiece, best quality" 程度に留める
2. **Subject Definition** (Be specific): "1girl" not just "girl"
3. **Visual Hierarchy** (Use weights strategically):
   - Main subject: 1.2-1.3
   - Important details: 1.1-1.2
   - Standard elements: 1.0
   - Background/subtle: 0.9

4. **Physical Positioning Priority**:
   - ✅ "crouching", "seiza", "hands_on_lap"
   - ✅ "looking_up_at_him", "looking_down_at_table"
   - ✅ "sitting_on_floor", "standing_behind"

## OUTPUT FORMAT - JSON with 10-15 optimized tags:
{
  "pairs": [
    {"en": "1girl", "ja": "1人の女の子", "weight": 1.2, "category": "person"},
    {"en": "crouching", "ja": "しゃがんでいる", "weight": 1.1, "category": "pose"},
    {"en": "looking_up", "ja": "見上げている", "weight": 1.1, "category": "pose"},
    {"en": "smile", "ja": "笑顔", "weight": 1.0, "category": "appearance"},
    {"en": "natural_hot_spring", "ja": "天然温泉", "weight": 1.0, "category": "background"}
  ]
}

## CATEGORIES: 
person, appearance, clothing, pose, background, quality, style, action, object, other

## CRITICAL OUTPUT REQUIREMENTS:
- **ONLY OUTPUT VALID JSON** - No explanations, no markdown, no additional text
- **NO CONTAMINATION** - Final output must be pure JSON format only
- Use **短い、具体的なタグ** for SDXL optimization
- Apply **5ブロック階層思考** to capture story essence

CRITICAL: 必ずJSON形式のみで出力し、説明文や追加テキストは一切含めないこと！`,
  
  flux: `# Flux Narrative Master - CINEMATIC STORYTELLING v14.0 (5-Block Hierarchy Model)

ユーザーから日本語のストーリーテキストが入力された場合、あなたは**「5ブロック階層モデル」**と**「Flux長文最適化戦略」**に従い、物語の感情と雰囲気を表現する**長いフレーズ・文章中心**のプロンプトを設計し、その結果を**指定されたJSONフォーマット**で出力しなければならない。

## FLUX 5-BLOCK HIERARCHY MODEL:
生成する各プロンプトは、以下の5つのブロックの思考プロセスに従って構築する：

1. **ブロック1: 関係性の配置宣言** - シーン全体の構図と人物配置
2. **ブロック2: メインキャラクターの集中描写** - 主役の感情・行動・状況（長文で）
3. **ブロック3: サブキャラクターの補足描写** - 副次的人物の状況と感情
4. **ブロック4: 環境オブジェクトの確定** - 雰囲気を作る環境要素
5. **ブロック5: 場所・文脈の最終指定** - 総合的な場面設定と物語的文脈

## FLUX OPTIMIZATION STRATEGY:
Flux excels with DESCRIPTIVE PHRASES and EMOTIONAL CONTEXT:
- Character relationships: "1girl and 1boy in a tender moment"
- Environmental atmosphere: "deep within a lush forest where ancient trees create natural privacy"
- Emotional states: "sense of discovery mixed with gentle vulnerability"
- Physical interactions: "carefully dipping her hand into the steaming mineral-rich water"
- Cinematic quality: "captured in the soft golden light filtering through the forest canopy"

## STRICT RULES FOR FLUX:
### 長文フレーズの推奨:
- ✅ "1girl and 1boy sharing an intimate moment in a secluded natural hot spring"
- ✅ "steaming mineral water surrounded by moss-covered rocks and ancient forest"
- ✅ "golden sunlight filtering through dense canopy creating dappled light patterns"

### 感情・雰囲気の重視:
- **感情表現**: "sense of wonder", "peaceful tranquility", "intimate connection"
- **雰囲気描写**: "serene natural environment", "hidden sanctuary feeling"
- **物語的文脈**: "moment of discovery", "shared experience", "natural intimacy"

### 禁止事項:
- **過度な短縮**: 単語レベルのタグは避け、必ずフレーズで表現
- **技術的タグ**: masterpiece, best quality などの品質タグは不要

## TAG CREATION RULES - LONG PHRASES PRIORITY:
1. **Character Dynamics** (長文で): "1girl and 1boy experiencing a moment of natural intimacy"
2. **Environmental Immersion**: "deep within a lush forest where natural hot springs emerge from moss-covered rocks"
3. **Emotional Atmosphere**: "sense of peaceful discovery mixed with gentle vulnerability"
4. **Physical Details**: "steam rising from mineral-rich water creating an ethereal atmosphere"
5. **Cinematic Quality**: "soft natural lighting filtering through ancient forest canopy"

## OUTPUT FORMAT - JSON with 8-12 descriptive phrases:
{
  "pairs": [
    {"en": "1girl and 1boy in a natural hot spring deep within a lush forest", "ja": "深い森の奥の天然温泉にいる1人の女の子と1人の男の子", "weight": 1.3, "category": "person"},
    {"en": "steaming mineral water surrounded by moss-covered rocks and ancient trees", "ja": "苔に覆われた岩と古い木々に囲まれた湯けむりの温泉水", "weight": 1.2, "category": "background"},
    {"en": "golden sunlight filtering through dense forest canopy creating dappled patterns", "ja": "密な森の天蓋を通して差し込む金色の日光が作る斑模様", "weight": 1.1, "category": "background"},
    {"en": "moment of peaceful discovery and natural intimacy", "ja": "平和な発見と自然な親密さの瞬間", "weight": 1.0, "category": "action"}
  ]
}

## CATEGORIES: 
person, appearance, clothing, pose, background, quality, style, action, object, other

## CRITICAL OUTPUT REQUIREMENTS:
- **ONLY OUTPUT VALID JSON** - No explanations, no markdown, no additional text
- **NO CONTAMINATION** - Final output must be pure JSON format only
- Use **長い、描写的なフレーズ** for Flux optimization
- Apply **5ブロック階層思考** to capture story emotion and atmosphere

CRITICAL: 必ずJSON形式のみで出力し、説明文や追加テキストは一切含めないこと！`,
  
  imagefx: `You are an AI tag generator for ImageFX with automatic categorization.

Generate clear, direct prompts with proper Japanese translations.

Output MUST be valid JSON:
{
  "pairs": [
    {"en": "portrait of young woman", "ja": "若い女性のポートレート", "weight": 1.0, "category": "person"},
    {"en": "professional photography", "ja": "プロフェッショナル写真", "weight": 1.0, "category": "quality"}
  ]
}

Categories: person, appearance, clothing, pose, background, quality, style, action, object, other`,
  
  'imagefx-natural': `You are an AI tag generator for ImageFX Natural Language with automatic categorization.

Generate flowing, descriptive prose with proper Japanese translations.

Output MUST be valid JSON:
{
  "pairs": [
    {"en": "A serene moment captured in golden light", "ja": "金色の光の中で捉えられた静寂の瞬間", "weight": 1.0, "category": "background"},
    {"en": "gentle expression with thoughtful eyes", "ja": "思慮深い眼差しの優しい表情", "weight": 1.0, "category": "appearance"}
  ]
}

Categories: person, appearance, clothing, pose, background, quality, style, action, object, other`
};

// 🔧 DEFAULT UTILITY PROMPTS - All user-editable via Settings
// These prompts handle translation, categorization, and image processing
const defaultUtilityPrompts = {
  // Translation prompts
  'translation-en-ja': `You are a professional translator for image generation prompts.
Translate the given English image generation tag to Japanese while keeping it natural and appropriate for image generation contexts.

Output only the translation, no explanations.`,
  
  'translation-ja-en': `You are a professional translator for image generation prompts.
Translate the given Japanese image generation tag to English while keeping it natural and appropriate for image generation contexts.

Output only the translation, no explanations.`,
  
  'translation-custom': `You are a professional translator for custom image generation prompts.
Translate the given text while preserving any special formatting or custom instructions.

IMPORTANT: If the original text has special suffixes, patterns, or custom formatting (like "nyan", "nyaa", special characters, etc.), maintain them in the translation.

Examples:
- "1girl nyan" → "1人の女の子 nyan"
- "hot spring nyan" → "温泉 nyan"
- "ultra-detailed 8K nyan" → "超詳細 8K nyan"

Output only the translation, no explanations.`,
  
  // Categorization prompt
  'categorizer': `You are an AI tag categorizer for image generation prompts. Analyze each tag and categorize it into one of these categories:

- person: Characters, people, gender, age (1girl, boy, woman, etc.)
- appearance: Physical features, hair, eyes, facial expressions, beauty
- clothing: Outfits, uniforms, accessories, fashion items
- action: Poses, movements, activities, gestures
- background: Environments, scenery, lighting, settings, weather
- quality: Image quality enhancers, resolution, detail level
- style: Art styles, techniques, artist names, aesthetic choices
- composition: Camera angles, views, shots, framing, perspectives (full body, close-up, low angle, etc.)
- object: Items, props, tools, decorative elements
- other: Anything that doesn't fit the above categories

Output format:
{
  "tags": [
    {"text": "tag content", "category": "category_name"}
  ]
}

Output only JSON, no explanations.`,
  
  // Image analysis prompt
  'image-analysis': `You are an expert image analyst. Analyze the provided image and describe:
1. Main subjects and their appearance
2. Background and environment details
3. Colors, lighting, and atmosphere
4. Composition and style
5. Any text or symbols visible
6. Overall mood and artistic qualities

Be detailed and specific in your description.`,
  
  // Tag processing prompts
  'tag-normalizer': `You are a tag normalizer & bilingual mapper for image prompts.

Input: Image analysis text
Output ONLY JSON in this exact format:
{
  "pairs": [
    {
      "en": "...",
      "ja": "...",
      "weight": number,
      "category": "person|appearance|clothes|pose|background|quality|style|other"
    }
  ]
}

必ず完全なJSONフォーマット厳守で出力してください。`,
  
  'structured-tags': `You are a professional image prompt optimizer.
Convert the user's input into clean, structured English tags for image generation.

CRITICAL: Output ONLY valid JSON with multiple separate tags:
{
  "tags": [
    {"text": "1girl", "weight": 1.2},
    {"text": "natural hot spring", "weight": 1.1},
    {"text": "forest setting", "weight": 1.0}
  ]
}

Output only JSON, no explanations.`,
  
  // Backend translation prompt (used by API)
  'backend-translation': `You are a professional translator for image generation prompts.
Translate between English and Japanese while maintaining context and meaning appropriate for AI image generation.

For custom formats: Preserve any special formatting, suffixes, or custom instructions.
For standard formats: Focus on natural, clear translation.

Output only the translation, no explanations.`
};

// 🔄 COMBINED DEFAULT PROMPTS - Union of main and utility prompts
const defaultSystemPrompts = {
  ...defaultMainSystemPrompts,
  ...defaultUtilityPrompts
};

// STRICT JSON FORMAT for AI outputs
const AI_OUTPUT_SCHEMAS = {
  BILINGUAL_TAGS: {
    description: 'For Tag Editor - Bilingual tag pairs with metadata',
    structure: {
      pairs: [
        {
          en: 'string (English tag text)',
          ja: 'string (Japanese translation)', 
          weight: 'number (0.1-2.0)',
          category: 'string (person|appearance|clothing|pose|background|quality|style|action|object|other)'
        }
      ]
    },
    example: {
      "pairs": [
        {"en": "beautiful girl", "ja": "美しい女の子", "weight": 1.0, "category": "person"},
        {"en": "natural lighting", "ja": "自然な照明", "weight": 1.1, "category": "background"}
      ]
    }
  },
  
  TEXT_TO_PROMPT: {
    description: 'For Text to Prompt generation - English-only structured output',
    structure: {
      optimized: 'string (complete optimized prompt)',
      tags: [
        {
          text: 'string (tag text)',
          weight: 'number (0.1-2.0)'
        }
      ]
    },
    example: {
      "optimized": "Beautiful young woman with flowing hair, standing under cherry blossoms, soft natural lighting",
      "tags": [
        {"text": "beautiful young woman", "weight": 1.0},
        {"text": "flowing hair", "weight": 1.1},
        {"text": "cherry blossoms", "weight": 1.0}
      ]
    }
  }
};

// Application state
let appState = {
  tags: [],
  currentTab: 'text',
  outputFormat: 'sdxl',
  finalOutputFormat: 'sdxl', // Separate format for Final Output
  settingsOpen: false,
  apiKey: localStorage.getItem('openrouter-api-key') || '',
  selectedModel: localStorage.getItem('selected-model') || 'openai/gpt-4o-mini',
  systemPrompts: (() => {
    const saved = JSON.parse(localStorage.getItem('system-prompts') || '{}');
    // Remove test format from saved prompts (cleanup)
    delete saved.test;
    // Use the enhanced defaultSystemPrompts (defined above) instead of hardcoded old versions
    // This ensures consistency between UI and backend APIs
    const merged = { ...defaultSystemPrompts, ...saved };
    // Ensure test format is not in merged result
    delete merged.test;
    return merged;
  })(),
  editingPrompt: null, // Currently editing prompt format
  // Tag filtering state
  categoryFilters: {
    active: JSON.parse(localStorage.getItem('main-category-filters') || 'null') || {
      person: true, appearance: true, clothing: true, action: true,
      background: true, quality: true, style: true, composition: true,
      object: true, other: true
    },
    visible: false
  },
  // History system
  history: {
    sessions: JSON.parse(localStorage.getItem('prompt-history') || '[]'),
    favorites: JSON.parse(localStorage.getItem('favorite-sessions') || '[]'),
    maxSessions: 100, // Maximum number of sessions to keep
    visible: false // History panel visibility
  },
  // Replicate API for specialized taggers
  replicateApiKey: localStorage.getItem('replicate-api-key') || '',
  taggerModel: localStorage.getItem('tagger-model') || '',
  fusionMode: localStorage.getItem('fusion-mode') || 'balanced',
  taggerThreshold: parseFloat(localStorage.getItem('tagger-threshold') || '0.35'),
  sourceAttribution: localStorage.getItem('source-attribution') === 'true' || true,
  
  // Multi-Engine Analysis Settings (New System)
  selectedAnalysisEngines: JSON.parse(localStorage.getItem('selected-analysis-engines') || '[]'), // Default: no engines
  selectedTaggingEngine: localStorage.getItem('selected-tagging-engine') || 'deepseek', // Default: DeepSeek
  analysisResults: {}, // Store results from different engines
  analysisPrompt: localStorage.getItem('analysis-prompt') || 'Analyze this image in detail, describing objects, people, settings, colors, artistic style, and any notable features.',
  
  // Legacy compatibility (will be removed later)
  selectedEngines: JSON.parse(localStorage.getItem('selected-engines') || '["llm"]') // For backward compatibility
};



// Common Tag Editor System
const TagEditor = {
  // Get context-specific data
  getContext: (context = 'main') => {
    if (context === 'image') {
      return {
        tags: App.imageState.imageTags,
        outputFormat: App.imageState.imageOutputFormat,
        finalFormat: App.imageState.imageFinalFormat,
        enContainer: 'image-tags-en',
        jaContainer: 'image-tags-ja',
        finalOutput: 'image-final-output',
        generatedOutput: 'image-generated-prompt'
      };
    }
    return {
      tags: appState.tags,
      outputFormat: appState.outputFormat,
      finalFormat: appState.finalOutputFormat,
      enContainer: 'tags-en',
      jaContainer: 'tags-ja',
      finalOutput: 'output-text',
      generatedOutput: null
    };
  },
  
  // Category colors - Use data-category CSS styling
  categoryColors: {
    person: 'border-2',
    appearance: 'border-2', 
    clothing: 'border-2',
    action: 'border-2',
    background: 'border-2',
    quality: 'border-2',
    style: 'border-2',
    composition: 'border-2',
    object: 'border-2',
    other: 'border-2'
  },
  
  // Render tags for both contexts
  renderTags: (context = 'main') => {
    const ctx = TagEditor.getContext(context);
    const enContainer = document.getElementById(ctx.enContainer);
    const jaContainer = document.getElementById(ctx.jaContainer);
    
    if (!enContainer || !jaContainer) return;
    
    enContainer.innerHTML = '';
    jaContainer.innerHTML = '';
    
    // Add drop zone at the beginning
    const enDropZoneFirst = TagEditor.createDropZone(-1, 'en', context);
    const jaDropZoneFirst = TagEditor.createDropZone(-1, 'ja', context);
    enContainer.appendChild(enDropZoneFirst);
    jaContainer.appendChild(jaDropZoneFirst);
    
    // Get filtering state
    const filterState = context === 'image' ? App.imageState.categoryFilters : appState.categoryFilters;
    
    ctx.tags.forEach((tag, index) => {
      const colorClass = TagEditor.categoryColors[tag.category] || TagEditor.categoryColors.other;
      
      // Check if tag should be visible based on category filters
      const isVisible = filterState.active[tag.category] !== false;
      
      // English tag card
      const enCard = TagEditor.createTagCard(tag, index, 'en', colorClass, context);
      if (!isVisible) {
        enCard.classList.add('filtered-hidden');
      }
      enContainer.appendChild(enCard);
      
      // Japanese tag card
      const jaCard = TagEditor.createTagCard(tag, index, 'ja', colorClass, context);
      if (!isVisible) {
        jaCard.classList.add('filtered-hidden');
      }
      jaContainer.appendChild(jaCard);
      
      // Add drop zone after each card (only if tag is visible)
      if (isVisible) {
        const enDropZone = TagEditor.createDropZone(index, 'en', context);
        const jaDropZone = TagEditor.createDropZone(index, 'ja', context);
        enContainer.appendChild(enDropZone);
        jaContainer.appendChild(jaDropZone);
      }
    });
    
    // Update outputs
    TagEditor.updateOutput(context);
  },
  
  // Create a drop zone indicator
  createDropZone: (index, lang, context) => {
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.dataset.index = index;
    dropZone.dataset.context = context;
    dropZone.dataset.lang = lang;
    
    dropZone.addEventListener('dragover', TagEditor.handleDropZoneDragOver);
    dropZone.addEventListener('drop', TagEditor.handleDropZoneDrop);
    dropZone.addEventListener('dragleave', TagEditor.handleDropZoneDragLeave);
    
    return dropZone;
  },
  
  // Create a tag card element with drag and drop
  createTagCard: (tag, index, lang, colorClass, context) => {
    const card = document.createElement('div');
    card.className = `tag-card tag-block ${colorClass} rounded-md p-2 hover:shadow-md transition-all relative cursor-move`;
    card.draggable = true;
    card.dataset.index = index;
    card.dataset.context = context;
    card.dataset.lang = lang;
    card.dataset.category = tag.category || 'other'; // Set data-category for CSS styling
    
    const text = lang === 'en' ? tag.en : tag.ja;
    const funcPrefix = context === 'image' ? 'TagEditor.imageTag' : 'TagEditor.mainTag';
    
    // Escape text for HTML attributes
    const escapedText = text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    // Source attribution badge (only for image context with hybrid tags)
    const sourceAttribution = appState.sourceAttribution && context === 'image' && tag.source;
    const sourceBadge = sourceAttribution ? TagEditor.createSourceBadge(tag) : '';
    
    // Create compact content layout without drag handle
    card.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0">
          <div class="tag-text text-sm break-words" 
               ondblclick="TagEditor.makeEditable(${index}, '${lang}', '${context}')" 
               style="cursor: text; line-height: 1.3;">
            ${text}
          </div>
          ${sourceBadge}
        </div>
        <div class="flex items-center gap-1 flex-shrink-0">
          <span class="text-xs font-mono text-gray-600 w-8 text-center">${tag.weight.toFixed(1)}</span>
          <div class="flex flex-col -my-1">
            <button onclick="${funcPrefix}.increaseWeight(${index})" 
                    class="px-0.5 py-0 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-sm transition-colors leading-none"
                    title="Increase weight"
                    style="height: 14px;">
              <i class="fas fa-caret-up text-xs"></i>
            </button>
            <button onclick="${funcPrefix}.decreaseWeight(${index})" 
                    class="px-0.5 py-0 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-sm transition-colors leading-none"
                    title="Decrease weight"
                    style="height: 14px;">
              <i class="fas fa-caret-down text-xs"></i>
            </button>
          </div>
          <button onclick="${funcPrefix}.remove(${index})" 
                  class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
                  title="Delete tag">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>
    `;
    
    // Add drag event listeners
    card.addEventListener('dragstart', TagEditor.handleDragStart);
    card.addEventListener('dragend', TagEditor.handleDragEnd);
    card.addEventListener('dragover', TagEditor.handleDragOver);
    card.addEventListener('drop', TagEditor.handleDrop);
    card.addEventListener('dragenter', TagEditor.handleDragEnter);
    card.addEventListener('dragleave', TagEditor.handleDragLeave);
    
    return card;
  },
  
  // Make tag text editable on double-click
  makeEditable: (index, lang, context) => {
    const ctx = TagEditor.getContext(context);
    const card = event.target.closest('.tag-card');
    const textDiv = event.target;
    
    if (!textDiv.classList.contains('tag-text')) return;
    
    const tag = ctx.tags[index];
    if (!tag) return;
    
    const currentText = lang === 'en' ? tag.en : tag.ja;
    
    // Create input for inline editing
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'w-full px-1 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400';
    
    // Replace text div with input
    textDiv.style.display = 'none';
    textDiv.parentElement.appendChild(input);
    input.focus();
    input.select();
    
    // Save function
    const saveEdit = async () => {
      const newText = input.value.trim();
      if (newText && newText !== currentText) {
        showLoading('翻訳中...');
        if (context === 'image') {
          await TagEditor.imageTag.updateText(index, lang, newText);
        } else {
          await TagEditor.mainTag.updateText(index, lang, newText);
        }
        hideLoading();
      }
      input.remove();
      textDiv.style.display = 'block';
      TagEditor.renderTags(context);
    };
    
    // Cancel function
    const cancelEdit = () => {
      input.remove();
      textDiv.style.display = 'block';
    };
    
    // Event listeners
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    });
  },
  
  // Drag and Drop handlers
  draggedElement: null,
  draggedIndex: null,
  draggedContext: null,
  draggedLang: null,
  
  handleDragStart: function(e) {
    // Allow dragging from anywhere on the card
    TagEditor.draggedElement = this;
    TagEditor.draggedIndex = parseInt(this.dataset.index);
    TagEditor.draggedContext = this.dataset.context;
    TagEditor.draggedLang = this.dataset.lang;
    
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Show all drop zones
    setTimeout(() => {
      const zones = document.querySelectorAll('.drop-zone');
      zones.forEach(zone => {
        if (zone.dataset.context === TagEditor.draggedContext && 
            zone.dataset.lang === TagEditor.draggedLang) {
          zone.classList.add('drop-zone-active');
        }
      });
    }, 10);
  },
  
  handleDragEnd: function(e) {
    this.classList.remove('dragging');
    this.style.transition = '';
    
    // Hide all drop zones
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.classList.remove('drop-zone-active', 'drop-zone-hover');
    });
    
    document.querySelectorAll('.tag-card').forEach(card => {
      card.classList.remove('drag-over');
      card.style.transition = '';
    });
    
    TagEditor.draggedElement = null;
    TagEditor.draggedIndex = null;
    TagEditor.draggedContext = null;
    TagEditor.draggedLang = null;
  },
  
  handleDragOver: function(e) {
    // Allow dropping on cards for better hit detection
    if (e.preventDefault) {
      e.preventDefault();
    }
    
    // Check if valid drop target
    if (!TagEditor.draggedElement ||
        this.dataset.context !== TagEditor.draggedContext ||
        this.dataset.lang !== TagEditor.draggedLang ||
        this === TagEditor.draggedElement) {
      return false;
    }
    
    // Determine if dropping above or below based on mouse position
    const rect = this.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const dropAbove = e.clientY < midpoint;
    
    // Find the appropriate drop zone (before or after this card)
    const cardIndex = parseInt(this.dataset.index);
    const targetZoneIndex = dropAbove ? cardIndex - 1 : cardIndex;
    
    // Activate the nearest drop zone
    const zones = this.parentElement.querySelectorAll('.drop-zone');
    zones.forEach(zone => {
      const zoneIndex = parseInt(zone.dataset.index);
      if (zoneIndex === targetZoneIndex) {
        zone.classList.add('drop-zone-hover');
      } else {
        zone.classList.remove('drop-zone-hover');
      }
    });
    
    e.dataTransfer.dropEffect = 'move';
    return false;
  },
  
  handleDrop: function(e) {
    // Handle drop on cards
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    e.preventDefault();
    
    if (!TagEditor.draggedElement ||
        this.dataset.context !== TagEditor.draggedContext ||
        this.dataset.lang !== TagEditor.draggedLang ||
        this === TagEditor.draggedElement) {
      return false;
    }
    
    // Determine drop position
    const rect = this.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const dropAbove = e.clientY < midpoint;
    
    const cardIndex = parseInt(this.dataset.index);
    const dropIndex = dropAbove ? cardIndex - 1 : cardIndex;
    
    if (TagEditor.draggedIndex !== null) {
      // Perform the move
      if (TagEditor.draggedContext === 'image') {
        TagEditor.moveImageTagToPosition(TagEditor.draggedIndex, dropIndex);
      } else {
        TagEditor.moveMainTagToPosition(TagEditor.draggedIndex, dropIndex);
      }
    }
    
    return false;
  },
  
  handleDragEnter: function(e) {
    // Prevent default to allow drop
    e.preventDefault();
  },
  
  handleDragLeave: function(e) {
    // Clean up hover states when leaving
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !this.contains(relatedTarget)) {
      // Clear nearby drop zone hovers
      const zones = this.parentElement?.querySelectorAll('.drop-zone-hover');
      if (zones) {
        zones.forEach(zone => zone.classList.remove('drop-zone-hover'));
      }
    }
  },
  
  // Drop zone event handlers - improved sensitivity
  handleDropZoneDragOver: function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    
    // Check if this is a valid drop target
    if (!TagEditor.draggedElement ||
        this.dataset.context !== TagEditor.draggedContext ||
        this.dataset.lang !== TagEditor.draggedLang) {
      return false;
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    // Add hover class immediately for better responsiveness
    if (!this.classList.contains('drop-zone-hover')) {
      // Remove hover from other zones first
      document.querySelectorAll('.drop-zone-hover').forEach(zone => {
        if (zone !== this) {
          zone.classList.remove('drop-zone-hover');
        }
      });
      this.classList.add('drop-zone-hover');
    }
    
    return false;
  },
  
  handleDropZoneDrop: function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    e.preventDefault();
    
    // Check if this is a valid drop
    if (!TagEditor.draggedElement ||
        this.dataset.context !== TagEditor.draggedContext ||
        this.dataset.lang !== TagEditor.draggedLang) {
      return false;
    }
    
    const dropIndex = parseInt(this.dataset.index);
    
    if (TagEditor.draggedIndex !== null) {
      // Perform the move
      if (TagEditor.draggedContext === 'image') {
        TagEditor.moveImageTagToPosition(TagEditor.draggedIndex, dropIndex);
      } else {
        TagEditor.moveMainTagToPosition(TagEditor.draggedIndex, dropIndex);
      }
    }
    
    return false;
  },
  
  handleDropZoneDragLeave: function(e) {
    this.classList.remove('drop-zone-hover');
  },
  
  // Move tag to specific position for drop zones
  moveMainTagToPosition: (fromIndex, toPosition) => {
    const tags = appState.tags;
    const [movedTag] = tags.splice(fromIndex, 1);
    
    // toPosition is -1 for the first position, otherwise it's the index after which to insert
    let newIndex = toPosition + 1;
    if (fromIndex <= toPosition) {
      newIndex = toPosition;
    }
    
    // Ensure index is within bounds
    newIndex = Math.max(0, Math.min(tags.length, newIndex));
    tags.splice(newIndex, 0, movedTag);
    
    TagEditor.renderTags('main');
  },
  
  moveImageTagToPosition: (fromIndex, toPosition) => {
    const tags = App.imageState.imageTags;
    const [movedTag] = tags.splice(fromIndex, 1);
    
    // toPosition is -1 for the first position, otherwise it's the index after which to insert
    let newIndex = toPosition + 1;
    if (fromIndex <= toPosition) {
      newIndex = toPosition;
    }
    
    // Ensure index is within bounds
    newIndex = Math.max(0, Math.min(tags.length, newIndex));
    tags.splice(newIndex, 0, movedTag);
    
    TagEditor.renderTags('image');
  },
  
  // Update output for both contexts
  updateOutput: (context = 'main') => {
    const ctx = TagEditor.getContext(context);
    
    // Update generated output (for image tab)
    if (ctx.generatedOutput) {
      const generatedTextarea = document.getElementById(ctx.generatedOutput);
      if (generatedTextarea) {
        generatedTextarea.value = TagEditor.formatOutput(ctx.tags, ctx.outputFormat);
      }
    }
    
    // Update final output
    const finalTextarea = document.getElementById(ctx.finalOutput);
    if (finalTextarea) {
      const output = TagEditor.formatOutput(ctx.tags, ctx.finalFormat);
      if (context === 'main') {
        finalTextarea.textContent = output;
      } else {
        finalTextarea.value = output;
      }
    }
  },
  
  // Format output based on format type
  formatOutput: (tags, format) => {
    if (tags.length === 0) return '';
    
    let output = '';
    
    if (format === 'sdxl') {
      output = tags.map(tag => {
        if (tag.weight !== 1.0) {
          // Use proper SDXL weight notation with parentheses
          if (tag.weight > 1.0) {
            return `(${tag.en}:${tag.weight.toFixed(2)})`;
          } else {
            return `[${tag.en}:${tag.weight.toFixed(2)}]`;
          }
        }
        return tag.en;
      }).join(', ');
    } else if (format === 'flux') {
      output = tags.map(tag => {
        const weightedText = tag.weight > 1.2 ? `highly ${tag.en}` : 
                            tag.weight < 0.8 ? `slightly ${tag.en}` : tag.en;
        return weightedText;
      }).join(', ');
      if (output) {
        output = output.charAt(0).toUpperCase() + output.slice(1) + '.';
      }
    } else if (format === 'imagefx') {
      output = tags.map(tag => tag.en).join(' ');
    } else if (format === 'imagefx-natural') {
      output = tags.map(tag => tag.en).join(', ');
      if (output) {
        output = `Create an image of ${output}`;
      }
    } else {
      // Custom or default format
      output = tags.map(tag => tag.en).join(', ');
    }
    
    return output;
  },
  
  // Main context tag operations
  mainTag: {
    move: (index, direction) => {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < appState.tags.length) {
        [appState.tags[index], appState.tags[newIndex]] = [appState.tags[newIndex], appState.tags[index]];
        TagEditor.renderTags('main');
      }
    },
    updateText: async (index, lang, text) => {
      if (appState.tags[index]) {
        appState.tags[index][lang] = text;
        
        // Translate to the other language
        if (lang === 'en') {
          // Translate English to Japanese
          appState.tags[index].ja = await translateWithAI(text, 'ja');
        } else {
          // Translate Japanese to English
          if (appState.apiKey) {
            appState.tags[index].en = await translateWithAI(text, 'en');
          } else {
            appState.tags[index].en = translateToEnglish(text);
          }
        }
        
        TagEditor.renderTags('main');
      }
    },
    updateWeight: (index, weight) => {
      if (appState.tags[index]) {
        appState.tags[index].weight = parseFloat(weight);
        TagEditor.renderTags('main');
      }
    },
    increaseWeight: (index) => {
      if (appState.tags[index]) {
        appState.tags[index].weight = Math.min(2.0, appState.tags[index].weight + 0.1);
        TagEditor.renderTags('main');
      }
    },
    decreaseWeight: (index) => {
      if (appState.tags[index]) {
        appState.tags[index].weight = Math.max(0.1, appState.tags[index].weight - 0.1);
        TagEditor.renderTags('main');
      }
    },
    remove: (index) => {
      appState.tags.splice(index, 1);
      TagEditor.renderTags('main');
    }
  },
  
  // Image context tag operations
  imageTag: {
    move: (index, direction) => {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < App.imageState.imageTags.length) {
        [App.imageState.imageTags[index], App.imageState.imageTags[newIndex]] = 
        [App.imageState.imageTags[newIndex], App.imageState.imageTags[index]];
        TagEditor.renderTags('image');
      }
    },
    updateText: async (index, lang, text) => {
      if (App.imageState.imageTags[index]) {
        App.imageState.imageTags[index][lang] = text;
        
        // Translate to the other language
        if (lang === 'en') {
          // Translate English to Japanese
          App.imageState.imageTags[index].ja = await translateWithAI(text, 'ja');
        } else {
          // Translate Japanese to English
          if (appState.apiKey) {
            App.imageState.imageTags[index].en = await translateWithAI(text, 'en');
          } else {
            App.imageState.imageTags[index].en = translateToEnglish(text);
          }
        }
        
        TagEditor.renderTags('image');
      }
    },
    updateWeight: (index, weight) => {
      if (App.imageState.imageTags[index]) {
        App.imageState.imageTags[index].weight = parseFloat(weight);
        TagEditor.renderTags('image');
      }
    },
    increaseWeight: (index) => {
      if (App.imageState.imageTags[index]) {
        App.imageState.imageTags[index].weight = Math.min(2.0, App.imageState.imageTags[index].weight + 0.1);
        TagEditor.renderTags('image');
      }
    },
    decreaseWeight: (index) => {
      if (App.imageState.imageTags[index]) {
        App.imageState.imageTags[index].weight = Math.max(0.1, App.imageState.imageTags[index].weight - 0.1);
        TagEditor.renderTags('image');
      }
    },
    remove: (index) => {
      App.imageState.imageTags.splice(index, 1);
      TagEditor.renderTags('image');
    }
  }
};

// JSON Processing Functions - Clean and validate AI outputs
const JsonProcessor = {
  
  // Clean and parse JSON from AI response (remove markdown, etc.)
  cleanAndParse: (rawText) => {
    try {
      // Remove markdown code blocks
      let cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove leading/trailing whitespace
      cleaned = cleaned.trim();
      
      // Find JSON content between first { and last }
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No valid JSON found in response');
      }
      
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      
      // Parse JSON
      const parsed = JSON.parse(cleaned);
      return { success: true, data: parsed };
      
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return { success: false, error: error.message, raw: rawText };
    }
  },
  
  // Validate bilingual tags structure
  validateBilingualTags: (data) => {
    if (!data.pairs || !Array.isArray(data.pairs)) {
      return { valid: false, error: 'Missing or invalid "pairs" array' };
    }
    
    const validatedPairs = [];
    
    for (let i = 0; i < data.pairs.length; i++) {
      const pair = data.pairs[i];
      
      // Validate required fields
      if (!pair.en || typeof pair.en !== 'string') {
        console.warn(`Skipping pair ${i}: Invalid English text`);
        continue;
      }
      
      // Create clean validated pair with robust weight parsing
      let weight = 1.0;
      if (pair.weight !== undefined) {
        const parsedWeight = parseFloat(String(pair.weight).replace(/[^0-9.]/g, ''));
        weight = isNaN(parsedWeight) ? 1.0 : parsedWeight;
      }
      
      const validatedPair = {
        id: pair.id || `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        en: pair.en.trim(),
        ja: pair.ja && typeof pair.ja === 'string' ? pair.ja.trim() : '',
        weight: Math.max(0.1, Math.min(2.0, weight)),
        category: pair.category || 'other'
      };
      
      // Post-processing: Split overly long narrative tags
      if (validatedPair.en.length > 100) {
        console.warn(`Long tag detected (${validatedPair.en.length} chars), attempting to split...`);
        const splitTags = JsonProcessor.splitLongNarrative(validatedPair.en, validatedPair.ja, validatedPair.weight);
        validatedPairs.push(...splitTags);
      } else {
        validatedPairs.push(validatedPair);
      }
    }
    
    return { valid: true, pairs: validatedPairs };
  },
  
  // Split long narrative into meaningful tags
  splitLongNarrative: (enText, jaText, weight) => {
    const sentences = enText.split(/[.。]+/).filter(s => s.trim());
    const tags = [];
    
    sentences.forEach((sentence, i) => {
      const cleanSentence = sentence.trim();
      if (cleanSentence.length > 10) { // Only meaningful sentences
        tags.push({
          id: `split-${Date.now()}-${i}`,
          en: cleanSentence,
          ja: '', // Will be translated later
          weight: weight || 1.0,
          category: 'other'
        });
      }
    });
    
    return tags.length > 0 ? tags : [{
      id: `fallback-${Date.now()}`,
      en: enText.substring(0, 100) + '...',
      ja: jaText ? jaText.substring(0, 100) + '...' : '',
      weight: weight || 1.0,
      category: 'other'
    }];
  },
  
  // Process AI response for Text to Prompt
  processTextToPrompt: (data) => {
    // If we have structured response with tags, use it
    if (data.tags && Array.isArray(data.tags)) {
      return data.tags.map(tag => ({
        text: tag.text || tag.en || '',
        weight: parseFloat(tag.weight) || 1.0
      })).filter(tag => tag.text.trim());
    }
    
    // If we only have optimized text, parse it using existing logic
    if (data.optimized && typeof data.optimized === 'string') {
      return App.parseComplexTags(data.optimized);
    }
    
    // Fallback: treat entire response as text
    if (typeof data === 'string') {
      return App.parseComplexTags(data);
    }
    
    return [];
  }
};

// 🔧 Ensure latest system prompts are loaded and updated (main formats only)
// Utility prompts are managed separately to avoid overriding user customizations
const mainFormats = Object.keys(defaultMainSystemPrompts);
for (const [format, defaultPrompt] of Object.entries(defaultMainSystemPrompts)) {
  if (!appState.systemPrompts[format] || 
      (format === 'sdxl' && !appState.systemPrompts[format].includes('PROFESSIONAL QUALITY v15.0')) ||
      (format === 'flux' && !appState.systemPrompts[format].includes('CINEMATIC STORYTELLING v14.0'))) {
    console.log(`Force updating ${format} system prompt to latest version`);
    appState.systemPrompts[format] = defaultPrompt;
  }
}

// 🎯 Initialize utility prompts if they don't exist (preserve user customizations)
for (const [promptKey, defaultPrompt] of Object.entries(defaultUtilityPrompts)) {
  if (!appState.systemPrompts[promptKey]) {
    console.log(`Adding missing utility prompt: ${promptKey}`);
    appState.systemPrompts[promptKey] = defaultPrompt;
  }
}

// Save merged prompts
localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));

// Translation function - Dictionary fallback
function translateToJapanese(text) {
  const lower = text.toLowerCase().trim();
  
  // Check exact match first
  if (translationDict[lower]) {
    return translationDict[lower];
  }
  
  // Check partial matches
  for (const [eng, jpn] of Object.entries(translationDict)) {
    if (lower.includes(eng)) {
      return text.toLowerCase().replace(eng, jpn);
    }
  }
  
  return text;
}

// AI Translation function - Now supports custom prompts from UI settings
async function translateWithAI(text, targetLang = 'ja', sourceLang = 'en', format = null) {
  if (!appState.apiKey) {
    return targetLang === 'ja' ? translateToJapanese(text) : translateToEnglish(text);
  }
  
  try {
    // 🎯 Get custom translation prompt from UI settings
    // UI設定からカスタム翻訳プロンプトを取得
    let customPrompt = null;
    if (targetLang === 'ja') {
      customPrompt = appState.systemPrompts['translation-en-ja'];
    } else {
      customPrompt = appState.systemPrompts['translation-ja-en'];
    }
    
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLang: sourceLang === 'en' ? 'English' : 'Japanese',
        targetLang,
        model: appState.selectedModel || 'openai/gpt-4o-mini',
        apiKey: appState.apiKey,
        format: format, // カスタムフォーマット情報を送信
        customPrompt: customPrompt // 🆕 UI設定からのカスタムプロンプト
      })
    });
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const data = await response.json();
    return data.translated || text;
  } catch (error) {
    console.error('AI translation error:', error);
    return targetLang === 'ja' ? translateToJapanese(text) : text;
  }
}

// Translate from Japanese to English
function translateToEnglish(text) {
  // Reverse lookup in dictionary
  for (const [eng, jpn] of Object.entries(translationDict)) {
    if (jpn === text) {
      return eng;
    }
  }
  return text;
}

// Create tag element
function createTagElement(tag, language) {
  const div = document.createElement('div');
  const categoryColors = {
    person: 'bg-yellow-100 border-yellow-400',
    appearance: 'bg-blue-100 border-blue-400',
    clothing: 'bg-pink-100 border-pink-400',
    pose: 'bg-purple-100 border-purple-400',
    background: 'bg-green-100 border-green-400',
    quality: 'bg-orange-100 border-orange-400',
    style: 'bg-yellow-100 border-yellow-500',
    other: 'bg-gray-100 border-gray-400'
  };
  
  div.className = `p-2 mb-2 border-2 rounded-lg ${categoryColors[tag.category] || categoryColors.other} transition-all`;
  div.innerHTML = `
    <div class="flex items-center justify-between">
      <span id="tag-${language}-${tag.id}" 
            class="flex-1 cursor-pointer hover:bg-white hover:bg-opacity-50 px-1 rounded"
            onclick="App.makeEditable(${tag.id}, '${language}')"
            title="Click to edit">
        ${language === 'en' ? tag.en : tag.ja}
      </span>
      <div class="flex items-center gap-1">
        <button onclick="App.changeWeight(${tag.id}, -0.1)" class="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded text-xs">
          <i class="fas fa-minus"></i>
        </button>
        <span class="text-sm font-mono w-10 text-center">${tag.weight.toFixed(1)}</span>
        <button onclick="App.changeWeight(${tag.id}, 0.1)" class="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded text-xs">
          <i class="fas fa-plus"></i>
        </button>
        <button onclick="App.deleteTag(${tag.id})" class="px-1 py-0.5 bg-red-100 hover:bg-red-200 rounded text-xs text-red-600 ml-2">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
  return div;
}

// Render tags (redirect to new system)
function renderTags() {
  TagEditor.renderTags('main');
}

// Update output (redirect to new system)
function updateOutput() {
  TagEditor.updateOutput('main');
}

// Enhanced categorize tag with comprehensive keywords - Updated for better color coding
function categorizeTag(text) {
  const lower = text.toLowerCase();
  
  // Priority order for categorization
  const categoryKeywords = {
    // Composition and camera angles - FIRST PRIORITY
    composition: [
      'angle', 'view', 'shot', 'camera', 'perspective', 'composition', 'framing',
      'full body', 'half body', 'upper body', 'close-up', 'closeup', 'portrait',
      'wide shot', 'medium shot', 'long shot', 'extreme close-up',
      'bird\'s eye view', 'worm\'s eye view', 'overhead view', 'top view',
      'side view', 'front view', 'back view', 'three-quarter view',
      'low angle', 'high angle', 'dutch angle', 'tilted angle',
      'diagonal', 'from above', 'from below', 'from side', 'from behind',
      'panoramic', 'wide angle', 'telephoto', 'macro', 'fisheye',
      'depth of field', 'bokeh', 'focus', 'blur', 'shallow focus',
      'rule of thirds', 'symmetry', 'asymmetry', 'leading lines',
      'viewpoint', 'vantage point', 'looking up', 'looking down'
    ],
    
    // Quality and enhancement tags
    quality: [
      'masterpiece', 'best quality', 'amazing quality', 'high quality', 'ultra detailed',
      'detailed', 'sharp focus', 'professional', 'high resolution', '8k', '4k', 'hd',
      'absurdres', 'newest', 'very aesthetic', 'refined details', 'masterwork',
      'good anatomy', 'good shading', 'photorealistic', 'realistic', 'intricate',
      'fine details', 'crisp', 'clear', 'vivid', 'stunning'
    ],
    
    // Male person/character tags
    person: [
      // General person identifiers
      'person', 'people', 'human', 'character', 'figure',
      // Male specific
      '1boy', 'boy', 'man', 'male', 'guy', 'gentleman', 'youth', 'teen boy',
      'young man', 'adult male', 'masculine', 'handsome man',
      // Female specific  
      '1girl', 'girl', 'woman', 'female', 'lady', 'maiden', 'teen girl',
      'young woman', 'adult female', 'feminine', 'beautiful woman',
      // Age-related
      'child', 'kid', 'adult', 'teen', 'teenager', 'young', 'elderly', 'old',
      // General descriptors
      'cute', 'beautiful', 'handsome', 'pretty', 'attractive', 'charming'
    ],
    
    // Female-specific clothing/accessories
    clothing: [
      // Female clothing
      'dress', 'skirt', 'blouse', 'kimono', 'gown', 'sundress', 'mini skirt',
      'long dress', 'short dress', 'evening dress', 'wedding dress',
      'school uniform', 'maid outfit', 'swimsuit', 'bikini', 'lingerie',
      // Male clothing  
      'suit', 'tuxedo', 'shirt', 'tie', 'pants', 'trousers', 'jacket',
      'blazer', 'vest', 'formal wear',
      // Unisex clothing
      'hoodie', 'sweater', 'coat', 'uniform', 'costume', 'outfit',
      'clothes', 'clothing', 'garment', 'attire', 'fabric',
      'wearing', 'dressed', 'fashion'
    ],
    
    // Appearance and physical features
    appearance: [
      // Hair
      'hair', 'long hair', 'short hair', 'blonde hair', 'black hair', 'brown hair',
      'red hair', 'blue hair', 'silver hair', 'white hair', 'curly hair',
      'straight hair', 'wavy hair', 'braided hair', 'ponytail', 'twintails',
      'bangs', 'hair ornament', 'hair clip', 'headband',
      // Eyes and face
      'eyes', 'blue eyes', 'green eyes', 'brown eyes', 'red eyes', 'golden eyes',
      'heterochromia', 'detailed eyes', 'beautiful eyes', 'expressive eyes',
      'face', 'smile', 'smiling', 'expression', 'facial features',
      'beautiful face', 'cute face', 'serious expression', 'happy expression',
      // Body features
      'skin', 'pale skin', 'tan skin', 'fair skin', 'smooth skin',
      'body', 'figure', 'physique', 'build'
    ],
    
    // Situations and environments
    background: [
      // Natural environments
      'forest', 'mountain', 'beach', 'ocean', 'lake', 'river', 'field',
      'meadow', 'garden', 'park', 'nature', 'outdoor', 'landscape',
      'hot spring', 'onsen', 'natural hot spring', 'water', 'steam',
      'rocks', 'stones', 'moss', 'trees', 'flowers', 'grass',
      // Urban environments
      'city', 'street', 'building', 'room', 'house', 'school', 'classroom',
      'library', 'cafe', 'restaurant', 'shop', 'office', 'indoor',
      // Atmospheric elements
      'sky', 'clouds', 'sunset', 'sunrise', 'night', 'moon', 'stars',
      'lighting', 'sunlight', 'moonlight', 'soft light', 'dramatic lighting',
      'background', 'scenery', 'environment', 'setting', 'atmosphere'
    ],
    
    // Actions and poses
    action: [
      // Basic poses
      'sitting', 'standing', 'lying', 'kneeling', 'crouching', 'squatting',
      'walking', 'running', 'dancing', 'jumping', 'flying', 'floating',
      // Interactive actions
      'holding', 'carrying', 'touching', 'reaching', 'pointing', 'waving',
      'reading', 'writing', 'eating', 'drinking', 'sleeping', 'resting',
      'looking', 'gazing', 'staring', 'glancing', 'watching', 'observing',
      // Specific actions
      'dipping', 'bathing', 'swimming', 'relaxing', 'meditating',
      'pose', 'posing', 'action', 'movement', 'gesture', 'activity'
    ],
    
    // Art style and technique
    style: [
      // Art styles
      'anime', 'manga', 'cartoon', 'digital art', 'painting', 'illustration',
      'sketch', 'watercolor', 'oil painting', 'pencil drawing', 'ink drawing',
      'concept art', 'fantasy art', 'sci-fi art', 'portrait', 'landscape art',
      // Artists (moved from person to style)
      'artist:', 'by artist', 'makoto shinkai', 'miyazaki', 'studio ghibli',
      'pixiv', 'artstation', 'deviantart',
      // Techniques
      'cell shading', 'soft shading', 'hard shading', 'gradient',
      'photorealistic', 'stylized', 'minimalist', 'detailed', 'artistic',
      'style', 'art style', 'rendering', 'technique'
    ],
    
    // Objects and items
    object: [
      // Accessories
      'jewelry', 'necklace', 'earrings', 'bracelet', 'ring', 'watch',
      'glasses', 'sunglasses', 'hat', 'cap', 'bow', 'ribbon',
      // Items
      'bag', 'backpack', 'purse', 'book', 'phone', 'camera', 'umbrella',
      'flower', 'rose', 'cherry blossom', 'weapon', 'sword', 'staff',
      'food', 'drink', 'cup', 'bottle', 'plate', 'table', 'chair',
      'signboard', 'sign', 'text', 'logo', 'symbol', 'emblem',
      'object', 'item', 'prop', 'accessory', 'decoration', 'ornament'
    ]
  };
  
  // Check categories in priority order
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  // Special character/franchise detection
  if (lower.includes('_\\') || lower.includes('\\(') || lower.includes('fate/') || 
      lower.includes('one_piece') || lower.includes('\(') || lower.includes('\)')) {
    return 'other';
  }
  
  return 'other';
}

// Helper functions
function showLoading(message = 'Loading...') {
  let loader = document.getElementById('loading-indicator');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loading-indicator';
    loader.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);color:white;padding:20px 40px;border-radius:10px;z-index:10000;display:flex;align-items:center;';
    document.body.appendChild(loader);
  }
  loader.innerHTML = `<i class="fas fa-spinner fa-spin mr-3"></i><span>${message}</span>`;
  loader.style.display = 'flex';
}

function hideLoading() {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.style.display = 'none';
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `position:fixed;top:20px;right:20px;padding:15px 20px;border-radius:5px;z-index:9999;display:flex;align-items:center;animation:slideIn 0.3s ease;`;
  
  const colors = {
    success: 'background:#10b981;color:white;',
    error: 'background:#ef4444;color:white;',
    info: 'background:#3b82f6;color:white;'
  };
  
  notification.style.cssText += colors[type] || colors.info;
  notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>${message}`;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Global App object
window.App = {
  // Advanced tag parsing with weight notation and escape character support
  parseComplexTags: (text) => {
    const tags = [];
    let current = '';
    let depth = 0;
    let inParens = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = i < text.length - 1 ? text[i + 1] : '';
      const prevChar = i > 0 ? text[i - 1] : '';
      
      // Handle escaped characters (backslash followed by parenthesis)
      if (char === '\\' && (nextChar === '(' || nextChar === ')')) {
        current += char + nextChar; // Add both \ and the parenthesis
        i++; // Skip next character since we processed it
        continue;
      }
      
      // Check if this is a real parenthesis (not escaped)
      const isEscapedParen = prevChar === '\\';
      
      if (char === '(' && !isEscapedParen && !inParens) {
        // Start of weighted tag (only if not escaped)
        if (current.trim()) {
          // Add previous simple tag
          tags.push({ text: current.trim(), weight: 1.0 });
          current = '';
        }
        inParens = true;
        depth = 1;
      } else if (char === '(' && !isEscapedParen && inParens) {
        depth++;
        current += char;
      } else if (char === ')' && !isEscapedParen && inParens) {
        depth--;
        if (depth === 0) {
          // End of weighted tag
          const weightedTag = App.parseWeightedTag(current.trim());
          if (weightedTag) {
            tags.push(weightedTag);
          }
          current = '';
          inParens = false;
        } else {
          current += char;
        }
      } else if ((char === ',' || char === '，' || char === '.' || char === '。' || char === '、') && !inParens) {
        // Tag separator (only when not inside parentheses)
        if (current.trim()) {
          tags.push({ text: current.trim(), weight: 1.0 });
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    // Add final tag
    if (current.trim()) {
      if (inParens) {
        // Unclosed parenthesis - treat as simple tag
        tags.push({ text: current.trim(), weight: 1.0 });
      } else {
        tags.push({ text: current.trim(), weight: 1.0 });
      }
    }
    
    return tags.filter(tag => tag.text.length > 0);
  },
  
  // Parse weighted tag notation like "tag:1.2" or just "tag"
  parseWeightedTag: (content) => {
    const colonIndex = content.lastIndexOf(':');
    
    if (colonIndex === -1) {
      // No weight specified
      return { text: content, weight: 1.2 }; // Default weight for parentheses
    }
    
    const tagPart = content.substring(0, colonIndex).trim();
    const weightPart = content.substring(colonIndex + 1).trim();
    
    const weight = parseFloat(weightPart);
    if (isNaN(weight)) {
      // Invalid weight, treat as part of tag name
      return { text: content, weight: 1.2 };
    }
    
    return { text: tagPart, weight: Math.max(0.1, Math.min(2.0, weight)) };
  },

  splitText: async () => {
    const input = document.getElementById('input-text');
    if (!input || !input.value.trim()) return;
    
    showLoading('Splitting and translating tags...');
    
    // Advanced tag parsing with weight support
    const parsedTags = App.parseComplexTags(input.value.trim());
    
    // Create tags with AI translation if available
    const tagPromises = parsedTags.map(async (parsedTag, i) => {
      const ja = await translateWithAI(parsedTag.text, 'ja', 'en', appState.outputFormat);
      
      return {
        id: Date.now() + i,
        en: parsedTag.text,
        ja: ja,
        weight: parsedTag.weight,
        category: categorizeTag(parsedTag.text)
      };
    });
    
    appState.tags = await Promise.all(tagPromises);
    
    // Auto-apply AI categorization if API key is available
    if (appState.apiKey && appState.tags.length > 0) {
      try {
        // Apply AI categorization silently
        const tagTexts = appState.tags.map(tag => tag.en).join(', ');
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appState.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
            'X-Title': 'SS Prompt Manager'
          },
          body: JSON.stringify({
            model: appState.selectedModel || 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `Categorize image generation tags into: person, appearance, clothing, action, background, quality, style, composition, object, or other. Respond with JSON only: {"categories": [{"tag": "tag_name", "category": "category_name"}]}`
              },
              {
                role: 'user',
                content: `Categorize: ${tagTexts}`
              }
            ],
            temperature: 0.3,
            max_tokens: 500
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          let result;
          
          try {
            const content = data.choices[0].message.content.trim();
            result = JSON.parse(content);
          } catch (parseError) {
            const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
            if (jsonMatch) {
              result = JSON.parse(jsonMatch[1]);
            }
          }
          
          // Apply AI categorization
          if (result?.categories) {
            result.categories.forEach(item => {
              const tag = appState.tags.find(t => t.en.toLowerCase() === item.tag.toLowerCase());
              if (tag && item.category) {
                tag.category = item.category;
              }
            });
          }
        }
      } catch (error) {
        // Silently fall back to keyword-based categorization
        console.log('AI categorization failed, using keyword-based fallback');
      }
    }
    
    hideLoading();
    TagEditor.renderTags('main');
  },
  
  // Auto-categorize function (called automatically after split or generate)
  autoCategorizeTags: () => {
    // Categorize existing tags automatically
    appState.tags = appState.tags.map(tag => ({
      ...tag,
      category: tag.category || categorizeTag(tag.en) // Preserve manual category if exists
    }));
    
    TagEditor.renderTags('main');
  },
  
  // AI-based categorization for all tags
  aiCategorizeAllTags: async () => {
    if (appState.tags.length === 0) {
      showNotification('タグがありません', 'error');
      return;
    }
    
    if (!appState.apiKey) {
      showNotification('OpenRouter APIキーを設定してください', 'error');
      return;
    }
    
    showLoading('AI でタグを分類中...');
    
    try {
      // Prepare tags for AI categorization
      const tagTexts = appState.tags.map(tag => tag.en).join(', ');
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
          'X-Title': 'SS Prompt Manager'
        },
        body: JSON.stringify({
          model: appState.selectedModel || 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: App.getAICategorizerPrompt()
            },
            {
              role: 'user',
              content: `Categorize these tags: ${tagTexts}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error('AI categorization failed');
      }
      
      const data = await response.json();
      let result;
      
      try {
        // Try to parse the JSON response
        const content = data.choices[0].message.content.trim();
        result = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from markdown
        const content = data.choices[0].message.content.trim();
        const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Invalid JSON response from AI');
        }
      }
      
      // Apply AI categorization to tags
      if (result.categories && Array.isArray(result.categories)) {
        result.categories.forEach(item => {
          const tag = appState.tags.find(t => t.en.toLowerCase() === item.tag.toLowerCase());
          if (tag && item.category) {
            tag.category = item.category;
          }
        });
        
        TagEditor.renderTags('main');
        showNotification(`${result.categories.length}個のタグを AI で分類しました`, 'success');
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('AI categorization error:', error);
      showNotification('AI分類に失敗しました。キーワードベース分類を使用します。', 'warning');
      
      // Fallback to keyword-based categorization
      appState.tags = appState.tags.map(tag => ({
        ...tag,
        category: categorizeTag(tag.en)
      }));
      TagEditor.renderTags('main');
    }
    
    hideLoading();
  },
  
  generateOptimized: async () => {
    console.log('🚀 AI Generate Started - Direct JSON to Tags Processing');
    
    // STEP 0: Validation
    console.log('🔑 Checking API key:', appState.apiKey ? 'API key exists' : 'No API key found');
    console.log('🔑 API key from localStorage:', localStorage.getItem('openrouter-api-key') ? 'Key found in localStorage' : 'No key in localStorage');
    console.log('🤖 Selected model:', appState.selectedModel || 'No model selected, will use default');
    
    if (!appState.apiKey) {
      alert('❌ OpenRouter APIキーが設定されていません。\n\n設定方法:\n1. 右上の⚙️設定ボタンをクリック\n2. "API Keys"タブを選択\n3. OpenRouter APIキーを入力\n4. "Test"ボタンで確認\n\nAPIキーの取得: https://openrouter.ai/keys');
      return;
    }
    
    const input = document.getElementById('input-text');
    if (!input || !input.value.trim()) {
      alert('Please enter some text to generate a prompt');
      return;
    }
    
    const originalInput = input.value.trim(); // PRESERVE original input
    const currentFormat = appState.outputFormat || 'sdxl';
    
    console.log('📝 Original input preserved:', originalInput);
    console.log('🎯 Target format:', currentFormat);
    
    showLoading(`Generating ${currentFormat.toUpperCase()} tags with AI...`);
    
    try {
      // STEP 1: Generate bilingual tags directly using JSON system prompts
      const bilingualTags = await App.generateBilingualTags(originalInput, currentFormat);
      console.log('✅ Stage 1 - Bilingual tags generated:', bilingualTags.length, 'tags');
      
      // STEP 2: Convert to appState format
      appState.tags = bilingualTags.map((tag, i) => ({
        id: tag.id || `ai-${Date.now()}-${i}`,
        en: tag.en,
        ja: tag.ja,
        weight: tag.weight,
        category: tag.category || categorizeTag(tag.en)
      }));
      
      console.log('✅ Stage 2 - Tags converted to app format:', appState.tags.length, 'tags');
      
      // STEP 3: Render tags to UI
      TagEditor.renderTags('main');
      
      // STEP 4: Save to history
      HistoryManager.addSession('text', {
        input: originalInput,
        tags: appState.tags,
        format: currentFormat,
        model: appState.selectedModel
      });
      
      // STEP 5: Success notification
      showNotification(`Generated ${appState.tags.length} tags from: "${originalInput.substring(0, 30)}..." via AI`, 'success');
      console.log('🎉 AI Generate completed successfully with direct JSON processing');
      
    } catch (error) {
      console.error('❌ AI Generate failed:', error);
      alert(`AI Generation failed: ${error.message}`);
    } finally {
      hideLoading();
    }
  },
  
  // STAGE 1: Generate bilingual tags using JSON-based system prompts
  generateBilingualTags: async (inputText, format) => {
    // Get format-specific system prompt - RESPECT CUSTOM PROMPTS
    let systemPrompt = appState.systemPrompts[format];
    
    // Only update if using default formats and they're outdated
    if (!systemPrompt || 
        (format === 'sdxl' && systemPrompt === defaultSystemPrompts.sdxl && !systemPrompt.includes('PROFESSIONAL QUALITY v15.0')) ||
        (format === 'flux' && systemPrompt === defaultSystemPrompts.flux && !systemPrompt.includes('CINEMATIC STORYTELLING v14.0'))) {
      systemPrompt = defaultSystemPrompts[format];
      appState.systemPrompts[format] = systemPrompt;
      localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
    }
    
    // If no system prompt exists, use default
    if (!systemPrompt) {
      systemPrompt = defaultSystemPrompts[format] || defaultSystemPrompts.sdxl;
    }
    
    console.log(`🎯 Using system prompt for format "${format}":`, systemPrompt.substring(0, 200) + '...');
    console.log(`🔍 Full system prompt length: ${systemPrompt.length} characters`);
    
    // Use the format-specific system prompt to generate JSON
    const response = await fetch('/api/openrouter/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: inputText }],
        model: appState.selectedModel || 'openai/gpt-4o-mini',
        systemPrompt: systemPrompt,
        apiKey: appState.apiKey,
        temperature: 0.7,
        maxTokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Tag generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.content || '';
    
    if (!generatedContent.trim()) {
      throw new Error('AI returned empty response');
    }

    console.log('🔍 Raw AI response:', generatedContent);
    
    // Parse the JSON response
    const parseResult = JsonProcessor.cleanAndParse(generatedContent);
    console.log('🔍 Parse result:', parseResult);
    
    if (!parseResult.success) {
      console.error('❌ JSON parsing failed:', parseResult.error);
      console.error('❌ Raw content was:', generatedContent);
      throw new Error(`Failed to parse AI response: ${parseResult.error}. Raw response: ${generatedContent.substring(0, 200)}...`);
    }

    // Validate the bilingual tags structure
    const validation = JsonProcessor.validateBilingualTags(parseResult.data);
    console.log('🔍 Validation result:', validation);
    
    if (!validation.valid) {
      console.error('❌ Tag structure validation failed:', validation.error);
      console.error('❌ Parsed data was:', parseResult.data);
      throw new Error(`Invalid tag structure: ${validation.error}. Parsed data: ${JSON.stringify(parseResult.data).substring(0, 200)}...`);
    }

    return validation.pairs;
  },

  // STAGE 1: Generate structured English tags using clean system prompts
  generateStructuredEnglishTags: async (inputText, format) => {
    const baseSystemPrompt = `You are a professional image prompt optimizer.
Convert the user's input into clean, structured English tags for ${format.toUpperCase()} image generation.

CRITICAL: Output ONLY valid JSON with multiple separate tags:
{
  "tags": [
    {"text": "1girl", "weight": 1.2},
    {"text": "natural hot spring", "weight": 1.1},
    {"text": "forest setting", "weight": 1.0}
  ]
}

RULES:
1. Break input into 6-12 meaningful tags
2. Each tag should be a clear, specific concept
3. Use ${format}-appropriate language (natural phrases for Flux, tags for SDXL)
4. Include appropriate weights (0.9-1.3)
5. NO long narratives - separate meaningful concepts

Output ONLY the JSON, no explanations.`;

    const response = await fetch('/api/openrouter/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: inputText }],
        model: appState.selectedModel || 'openai/gpt-4o-mini',
        systemPrompt: baseSystemPrompt,
        apiKey: appState.apiKey,
        temperature: 0.7,
        maxTokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Tag generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content || '';
    
    // Parse JSON response
    const parseResult = JsonProcessor.cleanAndParse(content);
    if (!parseResult.success) {
      throw new Error(`Failed to parse AI response: ${parseResult.error}`);
    }

    if (!parseResult.data.tags || !Array.isArray(parseResult.data.tags)) {
      throw new Error('AI response missing tags array');
    }

    return parseResult.data.tags.map(tag => ({
      text: tag.text || tag.en || '',
      weight: parseFloat(tag.weight) || 1.0
    })).filter(tag => tag.text.trim());
  },

  // STAGE 2: Create bilingual tags with translation and categorization
  createBilingualTags: async (englishTags) => {
    const bilingualTags = [];
    
    for (let i = 0; i < englishTags.length; i++) {
      const englishTag = englishTags[i];
      
      try {
        // Translate to Japanese
        const japanese = await translateWithAI(englishTag.text, 'ja');
        
        // Create structured tag
        const bilingualTag = {
          id: `ai-gen-${Date.now()}-${i}`,
          en: englishTag.text,
          ja: japanese || '',
          weight: Math.max(0.1, Math.min(2.0, englishTag.weight)),
          category: categorizeTag(englishTag.text)
        };
        
        bilingualTags.push(bilingualTag);
        
        // Small delay to avoid API rate limiting
        if (i < englishTags.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (error) {
        console.warn(`Translation failed for "${englishTag.text}":`, error);
        // Add English-only tag as fallback
        bilingualTags.push({
          id: `ai-gen-fallback-${Date.now()}-${i}`,
          en: englishTag.text,
          ja: englishTag.text, // Fallback to English
          weight: Math.max(0.1, Math.min(2.0, englishTag.weight)),
          category: categorizeTag(englishTag.text)
        });
      }
    }
    
    return bilingualTags;
  },
  
  // Helper function to process parsed tags (similar to splitText logic)
  processParsedTags: async (parsedTags, originalInput) => {
    try {
      showLoading('Processing and translating tags...');
      
      // NEVER overwrite user's original input!
      // Clear existing tags
      appState.tags = [];
      
      // Create bilingual tags structure using proven splitText logic
      const tagPromises = parsedTags.map(async (parsedTag, i) => {
        const ja = await translateWithAI(parsedTag.text, 'ja');
        
        return {
          id: Date.now() + i,
          en: parsedTag.text,
          ja: ja,
          weight: parsedTag.weight || 1.0,
          category: categorizeTag(parsedTag.text)
        };
      });
      
      // Wait for all translations (same as splitText)
      appState.tags = await Promise.all(tagPromises);
      
      // Render tags
      TagEditor.renderTags('main');
      
      // Show notification with preserved input reference
      showNotification(`Generated ${appState.tags.length} tags from "${originalInput.substring(0, 30)}..." with AI`, 'success');
      
    } catch (error) {
      console.error('Tag processing failed:', error);
      throw error;
    } finally {
      hideLoading();
    }
  },
  
  pasteFromClipboard: async () => {
    try {
      const text = await navigator.clipboard.readText();
      const input = document.getElementById('input-text');
      if (input) {
        input.value = text;
      }
    } catch (err) {
      alert('Please use Ctrl+V to paste');
    }
  },
  
  clearInput: () => {
    const input = document.getElementById('input-text');
    if (input) {
      input.value = '';
    }
    appState.tags = [];
    renderTags();
  },
  
  updateOutputFormat: () => {
    const select = document.getElementById('output-format');
    if (select) {
      appState.outputFormat = select.value;
      localStorage.setItem('output-format', select.value);
      // Do NOT update output here - format is only for AI generation
    }
  },
  
  updateSelectedModel: () => {
    const select = document.getElementById('model-selector');
    if (select) {
      appState.selectedModel = select.value;
      localStorage.setItem('selected-model', select.value);
      
      const modelName = select.options[select.selectedIndex].text;
      showNotification(`モデルを ${modelName} に変更しました`, 'success');
    }
  },
  
  updateFinalOutputFormat: () => {
    const select = document.getElementById('final-output-format');
    if (select) {
      appState.finalOutputFormat = select.value;
      localStorage.setItem('final-output-format', select.value);
      updateOutput(); // Update output only when Final Output format changes
    }
  },
  
  showPromptEditor: (format) => {
    console.log('Opening prompt editor for format:', format);
    appState.editingPrompt = format || appState.outputFormat;
    
    // Check if modal already exists and remove it
    const existingModal = document.getElementById('prompt-editor-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'prompt-editor-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center';
    modal.style.zIndex = '9999';  // Use inline style to ensure it takes precedence
    
    // Force refresh to latest default prompts if outdated
    const formatKey = appState.editingPrompt;
    if (!appState.systemPrompts[formatKey] || 
        (formatKey === 'sdxl' && !appState.systemPrompts[formatKey].includes('PROFESSIONAL QUALITY v15.0')) ||
        (formatKey === 'flux' && !appState.systemPrompts[formatKey].includes('CINEMATIC STORYTELLING v14.0'))) {
      console.log(`Updating outdated system prompt for ${formatKey}`);
      appState.systemPrompts[formatKey] = defaultSystemPrompts[formatKey];
      localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
    }
    
    const prompt = appState.systemPrompts[appState.editingPrompt] || defaultSystemPrompts[appState.editingPrompt] || '';
    const isDefault = defaultSystemPrompts[appState.editingPrompt] === prompt;
    
    modal.innerHTML = `
      <div class="bg-gray-900 text-white rounded-xl shadow-2xl p-6 max-w-3xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col animate-slideIn">
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
          <h2 class="text-xl font-bold flex items-center">
            <i class="fas fa-edit mr-3 text-blue-400"></i>
            Edit System Prompt: <span class="ml-2 text-blue-400">${appState.editingPrompt.toUpperCase()}</span>
          </h2>
          <button onclick="App.closePromptEditor()" class="text-gray-400 hover:text-white transition-colors p-1">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="flex-1 mb-4 overflow-hidden flex flex-col">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            System Prompt for <span class="text-blue-400">${appState.editingPrompt}</span> format:
          </label>
          <textarea 
            id="prompt-editor-text" 
            class="flex-1 w-full p-4 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 transition-all"
            placeholder="Enter system prompt for AI generation..."
            style="min-height: 300px;">${prompt}</textarea>
        </div>
        
        <div class="flex justify-between items-center pt-4 border-t border-gray-700">
          <div>
            ${!isDefault ? `
              <button onclick="App.resetPromptToDefault()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all hover:shadow-lg flex items-center">
                <i class="fas fa-undo mr-2"></i>Reset to Default
              </button>
            ` : '<span class="text-gray-500 text-sm italic">Using default prompt</span>'}
          </div>
          <div class="flex gap-3">
            <button onclick="App.closePromptEditor()" class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all hover:shadow-lg">
              Cancel
            </button>
            <button onclick="App.savePrompt()" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:shadow-lg flex items-center">
              <i class="fas fa-save mr-2"></i>Save Prompt
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add click handler to close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        App.closePromptEditor();
      }
    });
    
    // Add escape key handler
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        App.closePromptEditor();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    document.body.appendChild(modal);
    
    // Focus the textarea after modal is rendered
    setTimeout(() => {
      const textarea = document.getElementById('prompt-editor-text');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(0, 0); // Move cursor to beginning
      }
    }, 100);
  },
  
  // Force refresh all system prompts to latest defaults
  refreshAllSystemPrompts: () => {
    if (confirm('This will reset ALL system prompts to the latest default versions. Continue?')) {
      console.log('Force refreshing all system prompts to latest versions');
      
      // Override with latest defaults
      Object.keys(defaultSystemPrompts).forEach(format => {
        appState.systemPrompts[format] = defaultSystemPrompts[format];
        console.log(`Updated ${format} prompt`);
      });
      
      // Save to localStorage
      localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
      
      alert('All system prompts have been updated to the latest versions. Please refresh the page.');
      
      // Reload page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  },
  
  closePromptEditor: () => {
    const modal = document.getElementById('prompt-editor-modal');
    if (modal) {
      modal.remove();
    }
    appState.editingPrompt = null;
    
    // Update the custom formats list if settings modal is open
    if (document.getElementById('settings-modal')?.classList.contains('active')) {
      App.updateCustomFormatsList();
    }
  },
  
  savePrompt: () => {
    const textarea = document.getElementById('prompt-editor-text');
    if (textarea && appState.editingPrompt) {
      const newPrompt = textarea.value.trim();
      
      // Validate prompt is not empty
      if (!newPrompt) {
        showNotification('System prompt cannot be empty!', 'error');
        return;
      }
      
      appState.systemPrompts[appState.editingPrompt] = newPrompt;
      
      // Save through system prompts manager if available
      if (window.systemPromptsManager) {
        window.systemPromptsManager.setPrompt(appState.editingPrompt, newPrompt);
      } else {
        localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
      }
      
      // Show success notification with format name
      showNotification(`✅ System prompt for ${appState.editingPrompt.toUpperCase()} saved successfully!`, 'success');
      
      // Close modal with slight delay for visual feedback
      setTimeout(() => {
        App.closePromptEditor();
      }, 200);
    }
  },
  
  resetPromptToDefault: () => {
    if (appState.editingPrompt) {
      const defaultPrompt = window.systemPromptsManager 
        ? window.systemPromptsManager.getPrompt(appState.editingPrompt) 
        : defaultSystemPrompts[appState.editingPrompt];
        
      if (defaultPrompt) {
        const textarea = document.getElementById('prompt-editor-text');
        if (textarea) {
          textarea.value = defaultPrompt;
          showNotification('Reset to default prompt', 'info');
          
          // Add visual feedback
          textarea.style.transition = 'background-color 0.3s';
          textarea.style.backgroundColor = '#1f2937';
          setTimeout(() => {
            textarea.style.backgroundColor = '';
          }, 300);
        }
      }
    }
  },
  
  addCustomFormat: () => {
    const name = prompt('Enter a name for the new format (lowercase, no spaces):');
    if (!name || !name.match(/^[a-z0-9-]+$/)) {
      alert('Invalid format name. Use only lowercase letters, numbers, and hyphens.');
      return;
    }
    
    if (appState.systemPrompts[name]) {
      alert('Format already exists!');
      return;
    }
    
    // Add new format with default prompt
    appState.systemPrompts[name] = `You are an expert at generating ${name} prompts.\nConvert the user's input into the ${name} format.\n\nOutput only the formatted prompt, no explanations.`;
    localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
    
    // Add to both select dropdowns
    const formatSelect = document.getElementById('output-format');
    const finalFormatSelect = document.getElementById('final-output-format');
    
    if (formatSelect) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name.toUpperCase();
      formatSelect.appendChild(option);
      formatSelect.value = name;
      appState.outputFormat = name;
    }
    
    if (finalFormatSelect) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name.toUpperCase();
      finalFormatSelect.appendChild(option);
    }
    
    // Update the custom formats list if settings modal is open
    if (document.getElementById('settings-modal')?.classList.contains('active')) {
      App.updateCustomFormatsList();
    }
    
    showNotification(`Custom format '${name}' added!`);
    App.showPromptEditor(name);
  },
  
  sortTags: (type) => {
    if (type === 'category') {
      appState.tags.sort((a, b) => a.category.localeCompare(b.category));
    } else if (type === 'weight') {
      appState.tags.sort((a, b) => b.weight - a.weight);
    }
    TagEditor.renderTags('main');
  },
  
  translateAll: (direction) => {
    // Already translated
    TagEditor.renderTags('main');
  },
  
  addNewTag: async (lang) => {
    const input = document.getElementById(`new-tag-${lang}`);
    if (!input || !input.value.trim()) return;
    
    const text = input.value.trim();
    showLoading('Adding and translating tag...');
    
    const newTag = {
      id: Date.now(),
      en: '',
      ja: '',
      weight: 1.0,
      category: 'other'
    };
    
    if (lang === 'en') {
      newTag.en = text;
      newTag.ja = await translateWithAI(text, 'ja');
      newTag.category = categorizeTag(text);
    } else {
      newTag.ja = text;
      // Try AI translation from Japanese to English
      if (appState.apiKey) {
        newTag.en = await translateWithAI(text, 'en');
      } else {
        newTag.en = translateToEnglish(text);
      }
      newTag.category = categorizeTag(newTag.en);
    }
    
    appState.tags.push(newTag);
    input.value = '';
    hideLoading();
    TagEditor.renderTags('main');
  },
  
  changeWeight: (id, delta) => {
    const tag = appState.tags.find(t => t.id === id);
    if (tag) {
      tag.weight = Math.max(0.1, Math.min(2.0, tag.weight + delta));
      renderTags();
    }
  },
  
  updateTagText: async (id, lang, newText) => {
    const tag = appState.tags.find(t => t.id === id);
    if (!tag) return;
    
    // Update the text for the specific language
    tag[lang] = newText;
    
    // Translate to the other language
    if (lang === 'en') {
      tag.ja = await translateWithAI(newText, 'ja');
      tag.category = categorizeTag(newText);
    } else {
      tag.en = await translateWithAI(newText, 'en');
      tag.category = categorizeTag(tag.en);
    }
    
    renderTags();
  },
  
  makeEditable: (id, lang) => {
    const element = document.getElementById(`tag-${lang}-${id}`);
    if (!element) return;
    
    const tag = appState.tags.find(t => t.id === id);
    if (!tag) return;
    
    const originalText = tag[lang];
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.className = 'w-full px-2 py-1 border rounded';
    
    // Replace span with input
    element.innerHTML = '';
    element.appendChild(input);
    input.focus();
    input.select();
    
    // Handle save on blur or enter
    const saveEdit = async () => {
      const newText = input.value.trim();
      if (newText && newText !== originalText) {
        await App.updateTagText(id, lang, newText);
      } else {
        renderTags(); // Restore original if empty or unchanged
      }
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        renderTags();
      }
    });
  },
  
  deleteTag: (id) => {
    appState.tags = appState.tags.filter(t => t.id !== id);
    renderTags();
  },
  
  copyOutput: async () => {
    const output = document.getElementById('output-text');
    if (output) {
      try {
        await navigator.clipboard.writeText(output.textContent);
        // Show notification
        const notification = document.createElement('div');
        notification.textContent = 'Copied!';
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:10px 20px;border-radius:5px;z-index:9999;';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
      } catch (err) {
        alert('Failed to copy');
      }
    }
  },
  
  downloadOutput: () => {
    const output = document.getElementById('output-text');
    if (output) {
      const blob = new Blob([output.textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'prompt.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  },
  
  generateImage: async () => {
    const output = document.getElementById('output-text');
    if (!output || !output.textContent || output.textContent === 'No output generated yet...') {
      alert('Please generate a prompt first');
      return;
    }
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: output.textContent,
          model: document.getElementById('image-model')?.value || 'sdxl',
          parameters: {
            width: 512,
            height: 512,
            steps: 30
          }
        })
      });
      
      const data = await response.json();
      if (data.image) {
        const container = document.getElementById('generated-image');
        if (container) {
          container.innerHTML = `<img src="${data.image.url}" alt="Generated" class="w-full rounded-lg shadow-lg">`;
        }
      }
    } catch (err) {
      console.error('Image generation error:', err);
      alert('Failed to generate image');
    }
  },
  
  handleImageUpload: (event) => {
    console.log('Image upload not implemented yet');
  },
  
  processBatch: () => {
    console.log('Batch processing not implemented yet');
  },
  
  clearBatch: () => {
    const input = document.getElementById('batch-input');
    if (input) {
      input.value = '';
    }
  },
  
  showSystemHelp: () => {
    // Create a general help overview modal
    const modal = document.createElement('div');
    modal.id = 'system-help-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center';
    modal.style.zIndex = '10000';
    
    modal.innerHTML = `
      <div class="bg-gray-900 text-white rounded-xl shadow-2xl p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
          <h2 class="text-2xl font-bold flex items-center">
            <i class="fas fa-info-circle mr-3 text-blue-400"></i>
            SS Prompt Manager ヘルプガイド
          </h2>
          <button onclick="document.getElementById('system-help-modal').remove()" class="text-gray-400 hover:text-white">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="space-y-6">
          <!-- Overview -->
          <div>
            <h3 class="text-lg font-semibold text-blue-400 mb-2">📋 概要</h3>
            <p class="text-gray-300">
              SS Prompt Managerは、画像生成AI用のプロンプトを管理・最適化するツールです。
              テキストや画像から各種フォーマット（SDXL、Flux、ImageFX等）のプロンプトを生成できます。
            </p>
          </div>
          
          <!-- Main Features -->
          <div>
            <h3 class="text-lg font-semibold text-green-400 mb-2">🎯 主要機能</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-800 p-4 rounded-lg">
                <h4 class="font-semibold text-yellow-300 mb-2">
                  <i class="fas fa-file-text mr-1"></i> Text to Prompt
                </h4>
                <ul class="text-sm text-gray-300 space-y-1">
                  <li>• テキストからAIプロンプトを生成</li>
                  <li>• 複数のフォーマットに対応</li>
                  <li>• タグの編集・重み付け機能</li>
                  <li>• 日英翻訳機能付き</li>
                </ul>
              </div>
              
              <div class="bg-gray-800 p-4 rounded-lg">
                <h4 class="font-semibold text-purple-300 mb-2">
                  <i class="fas fa-image mr-1"></i> Image to Prompt
                </h4>
                <ul class="text-sm text-gray-300 space-y-1">
                  <li>• 画像を解析してプロンプト生成</li>
                  <li>• Vision AI (GPT-4o、Gemini等)使用</li>
                  <li>• 詳細な画像分析機能</li>
                  <li>• 複数フォーマットへの変換</li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- System Prompts -->
          <div>
            <h3 class="text-lg font-semibold text-orange-400 mb-2">🔧 システムプロンプト</h3>
            <p class="text-gray-300 mb-3">
              各フォーマットには編集可能なシステムプロンプトがあります。詳細なヘルプを見るには：
            </p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              ${['sdxl', 'flux', 'imagefx', 'imagefx-natural'].map(format => `
                <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('${format}')" 
                        class="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg transition-colors">
                  <i class="fas fa-tag mr-1 text-blue-400"></i>
                  ${format.toUpperCase().replace('-', ' ')}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Workflow -->
          <div>
            <h3 class="text-lg font-semibold text-pink-400 mb-2">🔄 基本的なワークフロー</h3>
            <ol class="list-decimal list-inside text-gray-300 space-y-2">
              <li><strong>入力:</strong> テキストまたは画像を入力</li>
              <li><strong>AI生成:</strong> AIフォーマットを選択して生成</li>
              <li><strong>編集:</strong> Tag Editorでタグを調整</li>
              <li><strong>変換:</strong> Final Outputで最終フォーマットに変換</li>
              <li><strong>コピー:</strong> 結果をコピーして使用</li>
            </ol>
          </div>
          
          <!-- Tips -->
          <div>
            <h3 class="text-lg font-semibold text-cyan-400 mb-2">💡 ヒント</h3>
            <ul class="list-disc list-inside text-gray-300 space-y-1">
              <li>OpenRouter APIキーを設定すると、より多くのAIモデルが使用可能</li>
              <li>タグはドラッグ&ドロップで並べ替え可能</li>
              <li>重み付け: (tag:1.2) で強調、[tag:0.8] で抑制</li>
              <li>カスタムフォーマットを作成して独自のプロンプトスタイルを定義</li>
              <li>設定は自動的にブラウザに保存されます</li>
            </ul>
          </div>
          
          <!-- Shortcuts -->
          <div>
            <h3 class="text-lg font-semibold text-indigo-400 mb-2">⌨️ ショートカット</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="bg-gray-800 p-2 rounded">
                <kbd class="bg-gray-700 px-2 py-1 rounded">ESC</kbd> モーダルを閉じる
              </div>
              <div class="bg-gray-800 p-2 rounded">
                <kbd class="bg-gray-700 px-2 py-1 rounded">Ctrl+S</kbd> プロンプトを保存
              </div>
              <div class="bg-gray-800 p-2 rounded">
                <kbd class="bg-gray-700 px-2 py-1 rounded">Tab</kbd> 次の入力フィールド
              </div>
              <div class="bg-gray-800 p-2 rounded">
                <kbd class="bg-gray-700 px-2 py-1 rounded">Shift+Tab</kbd> 前の入力フィールド
              </div>
            </div>
          </div>
          
          <!-- Support -->
          <div>
            <h3 class="text-lg font-semibold text-red-400 mb-2">🆘 サポート</h3>
            <p class="text-gray-300">
              問題が発生した場合は、ブラウザのコンソールでエラーを確認してください。
              設定のリセットが必要な場合は、設定画面の「Reset to Defaults」ボタンを使用してください。
            </p>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
          <span class="text-xs text-gray-500">Version 2.1 - Enhanced System Prompts</span>
          <button onclick="document.getElementById('system-help-modal').remove()" 
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
            閉じる
          </button>
        </div>
      </div>
    `;
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // ESC key to close
    document.addEventListener('keydown', function closeOnEsc(e) {
      if (e.key === 'Escape' && document.getElementById('system-help-modal')) {
        document.getElementById('system-help-modal').remove();
        document.removeEventListener('keydown', closeOnEsc);
      }
    });
    
    document.body.appendChild(modal);
  },

  showSettings: () => {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.classList.add('active');
      // Load saved API key
      const keyInput = document.getElementById('openrouter-api-key');
      if (keyInput) {
        keyInput.value = appState.apiKey;
      }
      // Populate custom formats list
      App.updateCustomFormatsList();
      
      // Load Image Analysis prompts
      App.loadImageAnalysisPrompt();
      App.loadImageTagPrompt('sdxl'); // Load default format
      
      // Set current vision model
      const visionModelSelect = document.getElementById('settings-vision-model');
      if (visionModelSelect) {
        visionModelSelect.value = App.imageState.visionModel || 'gemini-2.0-flash-exp';
      }
    }
  },
  
  updateCustomFormatsList: () => {
    // Update Text to Prompt custom formats
    const container = document.getElementById('custom-formats-list');
    if (container) {
      // Only show TRUE custom formats - exclude default formats and utility prompts
      const utilityPrompts = [
        'categorizer', 'image-analysis', 'tag-normalizer', 'structured-tags', 
        'backend-translation', 'translation-en-ja', 'translation-ja-en', 'translation-custom'
      ];
      const defaultFormats = ['sdxl', 'flux', 'imagefx', 'imagefx-natural', 'test'];
      const excludedKeys = [...defaultFormats, ...utilityPrompts];
      
      const customFormats = Object.keys(appState.systemPrompts).filter(
        key => !excludedKeys.includes(key)
      );
      
      if (customFormats.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No custom formats added yet.</p>';
      } else {
        container.innerHTML = customFormats.map(format => `
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex-1">
              <div class="font-medium">${format.toUpperCase()}</div>
              <div class="text-xs text-gray-500">Text to Prompt format</div>
            </div>
            <div class="flex gap-2">
              <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('${format}')" 
                      class="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                      title="Show help for this format">
                <i class="fas fa-question-circle mr-1"></i>Help
              </button>
              <button onclick="App.showPromptEditor('${format}')" 
                      class="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">
                <i class="fas fa-edit mr-1"></i>Edit
              </button>
              <button onclick="App.deleteCustomFormat('${format}')" 
                      class="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors">
                <i class="fas fa-trash mr-1"></i>Delete
              </button>
            </div>
          </div>
        `).join('');
      }
    }
    
    // Update Image to Prompt custom formats
    App.updateImageCustomFormatsList();
  },

  // Update Image custom formats list
  updateImageCustomFormatsList: () => {
    const container = document.getElementById('image-custom-formats-list');
    if (!container) return;
    
    const imageCustomFormats = Object.keys(App.imageState.customFormats);
    
    if (imageCustomFormats.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-sm">No custom formats added yet.</p>';
      return;
    }
    
    container.innerHTML = imageCustomFormats.map(format => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <div class="font-medium">${format.toUpperCase()}</div>
          <div class="text-xs text-gray-500">Image to Prompt format</div>
        </div>
        <div class="flex gap-2">
          <button onclick="App.showImageCustomFormatEditor('${format}')" 
                  class="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors">
            <i class="fas fa-edit mr-1"></i>Edit
          </button>
          <button onclick="App.deleteImageCustomFormatFromSettings('${format}')" 
                  class="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors">
            <i class="fas fa-trash mr-1"></i>Delete
          </button>
        </div>
      </div>
    `).join('');
  },

  // Show image custom format editor from settings
  showImageCustomFormatEditor: (formatName) => {
    const currentPrompt = App.imageState.customFormats[formatName];
    
    if (!currentPrompt) {
      showNotification('Format not found', 'error');
      return;
    }
    
    // Create modal HTML
    const modalHTML = `
      <div id="prompt-editor-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-800">
              <i class="fas fa-image mr-2 text-purple-500"></i>
              Edit Image Format: ${formatName}
            </h2>
            <button onclick="App.closePromptEditor()" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
            <textarea id="prompt-editor-textarea" 
                      class="w-full h-64 p-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter system prompt...">${currentPrompt}</textarea>
          </div>
          
          <div class="flex justify-between">
            <div>
              <button onclick="App.deleteImageCustomFormatFromModal('${formatName}')" 
                      class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2">
                Delete Format
              </button>
            </div>
            <div>
              <button onclick="App.closePromptEditor()" 
                      class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mr-2">
                Cancel
              </button>
              <button onclick="App.saveImageCustomFormatFromModal('${formatName}')" 
                      class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Save image custom format from modal
  saveImageCustomFormatFromModal: (formatName) => {
    const textarea = document.getElementById('prompt-editor-textarea');
    
    if (!textarea || !textarea.value.trim()) {
      showNotification('Please enter a system prompt', 'error');
      return;
    }
    
    const newPrompt = textarea.value.trim();
    
    // Update custom format
    App.imageState.customFormats[formatName] = newPrompt;
    localStorage.setItem('image-custom-formats', JSON.stringify(App.imageState.customFormats));
    
    App.updateImageFormatDropdowns();
    App.updateImageCustomFormatsList();
    App.closePromptEditor();
    
    showNotification(`Image format "${formatName}" updated`, 'success');
  },

  // Delete image custom format from modal
  deleteImageCustomFormatFromModal: (formatName) => {
    if (confirm(`Are you sure you want to delete the image format "${formatName}"?`)) {
      delete App.imageState.customFormats[formatName];
      localStorage.setItem('image-custom-formats', JSON.stringify(App.imageState.customFormats));
      
      // If currently selected format is deleted, switch to SDXL
      if (App.imageState.imageOutputFormat === formatName) {
        App.imageState.imageOutputFormat = 'sdxl';
        App.imageState.imageFinalFormat = 'sdxl';
        App.updateImageFormatDropdowns();
      }
      
      App.updateImageCustomFormatsList();
      App.closePromptEditor();
      
      showNotification(`Image format "${formatName}" deleted`, 'success');
    }
  },

  // Delete image custom format from settings list
  deleteImageCustomFormatFromSettings: (formatName) => {
    if (confirm(`Are you sure you want to delete the image format "${formatName}"?`)) {
      delete App.imageState.customFormats[formatName];
      localStorage.setItem('image-custom-formats', JSON.stringify(App.imageState.customFormats));
      
      // If currently selected format is deleted, switch to SDXL
      if (App.imageState.imageOutputFormat === formatName) {
        App.imageState.imageOutputFormat = 'sdxl';
        App.imageState.imageFinalFormat = 'sdxl';
        App.updateImageFormatDropdowns();
      }
      
      App.updateImageCustomFormatsList();
      
      showNotification(`Image format "${formatName}" deleted`, 'success');
    }
  },
  
  deleteCustomFormat: (format) => {
    // Don't allow deletion of default formats
    if (['sdxl', 'flux', 'imagefx', 'imagefx-natural'].includes(format)) {
      alert('Cannot delete default formats!');
      return;
    }
    
    if (!confirm(`Delete custom format '${format}'? This cannot be undone.`)) {
      return;
    }
    
    // Remove from system prompts
    delete appState.systemPrompts[format];
    localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
    
    // Remove from select dropdowns
    const formatSelect = document.getElementById('output-format');
    const finalFormatSelect = document.getElementById('final-output-format');
    
    if (formatSelect) {
      const option = Array.from(formatSelect.options).find(opt => opt.value === format);
      if (option) option.remove();
      
      // Reset to default if this was selected
      if (appState.outputFormat === format) {
        formatSelect.value = 'sdxl';
        appState.outputFormat = 'sdxl';
        localStorage.setItem('output-format', 'sdxl');
      }
    }
    
    if (finalFormatSelect) {
      const option = Array.from(finalFormatSelect.options).find(opt => opt.value === format);
      if (option) option.remove();
      
      // Reset to default if this was selected
      if (appState.finalOutputFormat === format) {
        finalFormatSelect.value = 'sdxl';
        appState.finalOutputFormat = 'sdxl';
        localStorage.setItem('final-output-format', 'sdxl');
        updateOutput();
      }
    }
    
    // Update the list
    App.updateCustomFormatsList();
    
    showNotification(`Custom format '${format}' deleted`);
  },
  
  closeSettings: () => {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  },
  
  setTab: (tab) => {
    // Hide all tabs
    ['text', 'image', 'batch', 'system-flow'].forEach(t => {
      const content = document.getElementById(`content-${t}`);
      const tabBtn = document.getElementById(`tab-${t}`);
      if (content) content.classList.add('hidden');
      if (tabBtn) tabBtn.classList.remove('active');
    });
    
    // Show selected tab
    const content = document.getElementById(`content-${tab}`);
    const tabBtn = document.getElementById(`tab-${tab}`);
    if (content) content.classList.remove('hidden');
    if (tabBtn) tabBtn.classList.add('active');
    
    appState.currentTab = tab;
  },
  
  setSettingsTab: (tab) => {
    // Hide all tabs
    ['api', 'formats', 'preferences', 'ai-instructions'].forEach(t => {
      const content = document.getElementById(`settings-${t}`);
      const tabBtn = document.querySelector(`[data-settings-tab="${t}"]`);
      if (content) {
        content.style.display = t === tab ? 'block' : 'none';
      }
      if (tabBtn) {
        if (t === tab) {
          tabBtn.classList.add('border-blue-500', 'text-blue-600');
          tabBtn.classList.remove('border-transparent', 'text-gray-600');
        } else {
          tabBtn.classList.add('border-transparent', 'text-gray-600');
          tabBtn.classList.remove('border-blue-500', 'text-blue-600');
        }
      }
    });
  },
  
  updateOpenRouterKey: (key) => {
    appState.apiKey = key;
    localStorage.setItem('openrouter-api-key', key);
  },
  
  testOpenRouterKey: async () => {
    const keyInput = document.getElementById('openrouter-api-key');
    if (!keyInput || !keyInput.value) {
      alert('Please enter an API key first');
      return;
    }
    
    const statusDiv = document.getElementById('api-status');
    if (statusDiv) {
      statusDiv.classList.remove('hidden');
      statusDiv.className = 'p-3 rounded-lg bg-blue-50 border border-blue-200';
      statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Testing API key...';
    }
    
    try {
      // Test the API key by fetching models
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${keyInput.value}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (statusDiv) {
          statusDiv.className = 'p-3 rounded-lg bg-green-50 border border-green-200';
          statusDiv.innerHTML = `
            <div class="flex items-center">
              <i class="fas fa-check-circle text-green-600 mr-2"></i>
              <div>
                <div class="font-semibold text-green-800">API Key Valid</div>
                <div class="text-sm text-green-600">Found ${data.data ? data.data.length : 0} available models</div>
              </div>
            </div>
          `;
        }
        
        // Save the key
        localStorage.setItem('openrouter-api-key', keyInput.value);
        appState.apiKey = keyInput.value; // Update app state
        
        // Load models into dropdown
        if (data.data) {
          App.updateModelList(data.data);
        }
      } else {
        const errorText = await response.text();
        if (statusDiv) {
          statusDiv.className = 'p-3 rounded-lg bg-red-50 border border-red-200';
          statusDiv.innerHTML = `
            <div class="flex items-center">
              <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
              <div>
                <div class="font-semibold text-red-800">Invalid API Key</div>
                <div class="text-sm text-red-600">${response.status === 401 ? 'Authentication failed' : 'Failed to validate key'}</div>
              </div>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error('API test error:', error);
      if (statusDiv) {
        statusDiv.className = 'p-3 rounded-lg bg-red-50 border border-red-200';
        statusDiv.innerHTML = `
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
            <div>
              <div class="font-semibold text-red-800">Connection Error</div>
              <div class="text-sm text-red-600">Failed to connect to OpenRouter API</div>
            </div>
          </div>
        `;
      }
    }
  },
  
  // Replicate API Key Management
  updateReplicateKey: (key) => {
    const trimmedKey = key.trim();
    
    // Validate API key format
    if (trimmedKey && !trimmedKey.startsWith('r8_')) {
      showNotification('⚠️ Replicate API keys should start with "r8_"', 'warning');
    }
    
    appState.replicateApiKey = trimmedKey;
    localStorage.setItem('replicate-api-key', trimmedKey);
    console.log('💾 Replicate API key updated:', trimmedKey ? 'Set' : 'Cleared');
  },
  
  testReplicateKey: async () => {
    const keyInput = document.getElementById('replicate-api-key');
    if (!keyInput || !keyInput.value) {
      showNotification('Please enter a Replicate API key first', 'error');
      return;
    }
    
    const apiKey = keyInput.value.trim();
    console.log('🔑 Testing Replicate API key:', apiKey.substring(0, 10) + '...');
    
    showLoading('Testing Replicate API key...');
    
    try {
      // Test API key through backend to avoid CORS issues
      console.log('📡 Testing Replicate API key through backend...');
      const response = await fetch('/api/test-replicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: apiKey })
      });
      
      console.log('📊 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (data.success) {
        console.log('✅ API test successful');
        
        // Save the key
        localStorage.setItem('replicate-api-key', apiKey);
        appState.replicateApiKey = apiKey;
        
        hideLoading();
        showNotification(`✅ Replicate API Key Valid! Found ${data.modelCount || 0} models available.`, 'success');
      } else {
        console.error('❌ API test failed:', data.error);
        
        hideLoading();
        showNotification(`❌ ${data.error || 'Invalid Replicate API Key'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Network/Connection error:', error);
      hideLoading();
      
      let errorMessage = '❌ Failed to connect to backend';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += ' - Network connection failed';
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      showNotification(errorMessage, 'error');
    }
  },
  
  // Multi-Engine Analysis Management 🚀
  updateAnalysisEngines: () => {
    const engines = [];
    
    // Check each engine checkbox
    if (document.getElementById('engine-llm')?.checked) engines.push('llm');
    if (document.getElementById('engine-wd-eva02')?.checked) engines.push('wd-eva02-large-tagger-v3');
    if (document.getElementById('engine-janus')?.checked) engines.push('janus-pro-7b');
    if (document.getElementById('engine-wd-swinv2')?.checked) engines.push('wd-swinv2-tagger-v3');
    if (document.getElementById('engine-wd-vit')?.checked) engines.push('wd-vit-tagger-v3');
    
    appState.selectedEngines = engines;
    localStorage.setItem('selected-engines', JSON.stringify(engines));
    
    console.log('🔧 Analysis engines updated:', engines);
    showNotification(`${engines.length} analysis engines selected`, 'info');
  },
  
  initializeEngineSelections: () => {
    // Load saved engine selections
    const savedEngines = appState.selectedEngines || ['llm'];
    
    // Set checkboxes based on saved selections
    const engineMap = {
      'llm': 'engine-llm',
      'wd-eva02-large-tagger-v3': 'engine-wd-eva02',
      'janus-pro-7b': 'engine-janus',
      'wd-swinv2-tagger-v3': 'engine-wd-swinv2',
      'wd-vit-tagger-v3': 'engine-wd-vit'
    };
    
    savedEngines.forEach(engine => {
      const checkboxId = engineMap[engine];
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
    
    console.log('✅ Engine selections initialized:', savedEngines);
  },

  // Legacy compatibility  
  updateTaggerModel: (model) => {
    appState.taggerModel = model;
    localStorage.setItem('tagger-model', model);
    console.log('🤖 Tagger model updated:', model);
  },
  
  updateFusionMode: (mode) => {
    appState.fusionMode = mode;
    localStorage.setItem('fusion-mode', mode);
    console.log('🔀 Fusion mode updated:', mode);
  },
  
  updateTaggerThreshold: (threshold) => {
    appState.taggerThreshold = parseFloat(threshold);
    localStorage.setItem('tagger-threshold', threshold);
    document.getElementById('tagger-threshold-value').textContent = threshold;
    console.log('📊 Tagger threshold updated:', threshold);
  },
  
  updateSourceAttribution: (enabled) => {
    appState.sourceAttribution = enabled;
    localStorage.setItem('source-attribution', enabled ? 'true' : 'false');
    console.log('🏷️ Source attribution:', enabled ? 'enabled' : 'disabled');
  },
  
  updateModelList: (models) => {
    // Update both Text and Image model selects in Settings
    const textModelSelect = document.getElementById('settings-text-model');
    const imageModelSelect = document.getElementById('settings-image-model');
    
    // Function to populate a model select
    const populateModelSelect = (selectElement, isVisionModel = false) => {
      if (!selectElement) return;
      
      // Clear existing options
      selectElement.innerHTML = '';
      
      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select a model...';
      selectElement.appendChild(defaultOption);
    
      // Filter models based on type
      const filteredModels = models.filter(model => {
        if (isVisionModel) {
          // Vision models for Image to Prompt
          return model.architecture?.modality === 'image->text' ||
                 model.architecture?.modality === 'text+image->text' ||
                 model.id.includes('vision') ||
                 model.id.includes('gpt-4o') ||
                 model.id.includes('claude-3') ||
                 model.id.includes('gemini');
        } else {
          // Text models for Text to Prompt
          return model.architecture?.modality === 'text->text' || 
                 model.id.includes('gpt') || 
                 model.id.includes('claude') || 
                 model.id.includes('gemini') ||
                 model.id.includes('mistral') ||
                 model.id.includes('deepseek');
        }
      });
      
      // Sort models by popularity/name
      filteredModels.sort((a, b) => {
        // Prioritize popular models
        const priority = ['gpt-4', 'claude-3', 'gemini', 'deepseek', 'mistral'];
        for (const p of priority) {
          if (a.id.includes(p) && !b.id.includes(p)) return -1;
          if (!a.id.includes(p) && b.id.includes(p)) return 1;
        }
        return a.name?.localeCompare(b.name) || a.id.localeCompare(b.id);
      });
      
      // Add models to dropdown
      filteredModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name || model.id;
        
        // Add pricing info if available
        if (model.pricing?.prompt) {
          const price = parseFloat(model.pricing.prompt);
          if (price === 0) {
            option.textContent += ' (Free)';
          } else {
            option.textContent += ` ($${(price * 1000000).toFixed(2)}/M tokens)`;
          }
        }
        
        selectElement.appendChild(option);
      });
    };
    
    // Populate Settings dropdowns
    populateModelSelect(textModelSelect, false);
    populateModelSelect(imageModelSelect, true);
    
    // Also populate tab dropdowns
    const textTabSelect = document.getElementById('text-model-selector');
    const imageTabSelect = document.getElementById('image-model-selector');
    populateModelSelect(textTabSelect, false);
    populateModelSelect(imageTabSelect, true);
    
    // Set currently selected models
    if (textModelSelect && appState.selectedModel) {
      textModelSelect.value = appState.selectedModel;
    }
    if (textTabSelect && appState.selectedModel) {
      textTabSelect.value = appState.selectedModel;
    }
    if (imageModelSelect && App.imageState.visionModel) {
      imageModelSelect.value = App.imageState.visionModel;
    }
    if (imageTabSelect && App.imageState.visionModel) {
      imageTabSelect.value = App.imageState.visionModel;
    }
    
    // Update model indicator
    const modelIndicator = document.getElementById('current-model-indicator');
    if (modelIndicator) {
      modelIndicator.textContent = models.length > 0 ? 'Models loaded' : 'No models';
    }
  },
  
  refreshModelList: async () => {
    const keyInput = document.getElementById('openrouter-api-key');
    const apiKey = keyInput?.value || localStorage.getItem('openrouter-api-key');
    
    if (!apiKey) {
      alert('Please enter an API key first');
      return;
    }
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          App.updateModelList(data.data);
          
          // Show success notification
          const notification = document.createElement('div');
          notification.textContent = 'Models refreshed!';
          notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:10px 20px;border-radius:5px;z-index:9999;';
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 2000);
        }
      } else {
        alert('Failed to fetch models. Please check your API key.');
      }
    } catch (error) {
      console.error('Fetch models error:', error);
      alert('Failed to connect to OpenRouter API');
    }
  },
  
  updateOpenRouterModel: (model) => {
    appState.selectedModel = model;
    localStorage.setItem('openrouter-model', model);
    localStorage.setItem('selected-model', model);
    
    // Update model indicator
    const modelIndicator = document.getElementById('current-model-indicator');
    const modelSelect = document.getElementById('openrouter-model');
  },

  // Update text model from settings panel
  updateTextModelFromSettings: (model) => {
    console.log('🔄 Updating text model from settings:', model);
    appState.selectedModel = model;
    localStorage.setItem('selected-model', model);
    localStorage.setItem('openrouter-model', model);
    
    // Update tab selectors as well
    const textModelTab = document.getElementById('text-model-selector');
    if (textModelTab) {
      textModelTab.value = model;
    }
    
    showNotification(`Text model updated to: ${model}`, 'success');
  },
  
  // Update image model from settings panel  
  updateImageModelFromSettings: (model) => {
    console.log('🔄 Updating image model from settings:', model);
    App.imageState.visionModel = model;
    localStorage.setItem('image-vision-model', model);
    
    // Update tab selectors as well
    const imageModelTab = document.getElementById('image-model-selector');
    if (imageModelTab) {
      imageModelTab.value = model;
    }
    
    showNotification(`Image model updated to: ${model}`, 'success');
  },
  
  // Update model from Text to Prompt tab selector
  updateTextModelFromTab: () => {
    const selector = document.getElementById('text-model-selector');
    if (selector && selector.value) {
      const model = selector.value;
      console.log('🔄 Updating text model from tab:', model);
      appState.selectedModel = model;
      localStorage.setItem('selected-model', model);
      localStorage.setItem('openrouter-model', model);
      
      // Sync with settings panel
      const settingsSelector = document.getElementById('settings-text-model');
      if (settingsSelector) {
        settingsSelector.value = model;
      }
      
      showNotification(`Model changed to: ${model.split('/').pop()}`, 'info');
    }
  },
  
  // Update model from Image to Prompt tab selector
  updateImageModelFromTab: () => {
    const selector = document.getElementById('image-model-selector');
    if (selector && selector.value) {
      const model = selector.value;
      console.log('🔄 Updating image model from tab:', model);
      App.imageState.visionModel = model;
      localStorage.setItem('image-vision-model', model);
      
      // Sync with settings panel
      const settingsSelector = document.getElementById('settings-image-model');
      if (settingsSelector) {
        settingsSelector.value = model;
      }
      
      showNotification(`Image model changed to: ${model.split('/').pop()}`, 'info');
    }
    
    if (modelIndicator && modelSelect) {
      const selectedOption = modelSelect.options[modelSelect.selectedIndex];
      if (selectedOption) {
        modelIndicator.textContent = selectedOption.textContent.split(' (')[0];
      }
    }
    
    // Show model info
    const modelInfo = document.getElementById('model-info');
    if (modelInfo && model) {
      modelInfo.classList.remove('hidden');
      const selectedOption = modelSelect?.options[modelSelect.selectedIndex];
      if (selectedOption) {
        const isFree = selectedOption.textContent.includes('Free');
        modelInfo.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs">${model}</span>
            ${isFree ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Free</span>' : ''}
          </div>
        `;
      }
    }
  },
  
  selectRecommendedModel: (type) => {
    const modelSelect = document.getElementById('openrouter-model');
    if (!modelSelect) return;
    
    const recommendations = {
      general: ['openai/gpt-4o', 'openai/gpt-4-turbo', 'anthropic/claude-3-opus'],
      creative: ['anthropic/claude-3-opus', 'openai/gpt-4', 'google/gemini-pro-1.5'],
      translation: ['openai/gpt-4o-mini', 'google/gemini-pro', 'deepseek/deepseek-chat'],
      free: ['google/gemini-pro', 'mistralai/mistral-7b', 'huggingface/zephyr-7b']
    };
    
    const recommended = recommendations[type] || [];
    
    // Find and select the first available recommended model
    for (const modelId of recommended) {
      const option = Array.from(modelSelect.options).find(opt => 
        opt.value === modelId || opt.value.includes(modelId.split('/')[1])
      );
      if (option) {
        modelSelect.value = option.value;
        App.updateOpenRouterModel(option.value);
        
        // Update model info
        const modelInfo = document.getElementById('model-info');
        if (modelInfo) {
          modelInfo.classList.remove('hidden');
          modelInfo.innerHTML = `
            <div class="flex items-center justify-between">
              <span class="font-semibold">${option.textContent}</span>
              <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">${type}</span>
            </div>
          `;
        }
        
        // Update model indicator
        const modelIndicator = document.getElementById('current-model-indicator');
        if (modelIndicator) {
          modelIndicator.textContent = option.textContent.split(' (')[0];
        }
        
        break;
      }
    }
  },
  
  // Image Analysis Prompt Management
  loadImageAnalysisPrompt: () => {
    const textarea = document.getElementById('image-analysis-prompt');
    if (!textarea) return;
    
    const savedPrompt = localStorage.getItem('image-analysis-prompt');
    if (savedPrompt) {
      textarea.value = savedPrompt;
    } else {
      textarea.value = App.getImageAnalysisSystemPrompt();
    }
  },
  
  resetImageAnalysisPrompt: () => {
    const textarea = document.getElementById('image-analysis-prompt');
    if (!textarea) return;
    
    const defaultPrompt = `あなたは画像分析の専門家です。提供された画像を詳細に分析し、以下の要素を抽出してください：

1. 主要な被写体（人物、動物、オブジェクト）
   - 外見的特徴（髪色、目の色、表情など）
   - 服装やアクセサリー
   - ポーズや動作

2. 背景と環境
   - 場所（屋内/屋外、具体的な場所）
   - 時間帯や天候
   - 雰囲気や照明

3. 構図とスタイル
   - カメラアングル
   - 色彩やトーン
   - アートスタイル（写実的、アニメ調など）

4. 品質関連の特徴
   - 画像の精細さ
   - 特筆すべき技術的要素

各要素を具体的かつ簡潔に記述してください。`;
    
    textarea.value = defaultPrompt;
    localStorage.setItem('image-analysis-prompt', defaultPrompt);
    showNotification('画像解析プロンプトをデフォルトに戻しました', 'success');
  },
  
  testImageAnalysisPrompt: async () => {
    showNotification('テスト実行機能は準備中です', 'info');
  },
  
  // Tag Generation Prompt Management
  loadImageTagPrompt: (format) => {
    const textarea = document.getElementById('image-tag-generation-prompt');
    if (!textarea) return;
    
    const savedPrompt = localStorage.getItem(`image-tag-prompt-${format}`);
    if (savedPrompt) {
      textarea.value = savedPrompt;
    } else {
      // Get default prompt for the format
      const defaultPrompts = {
        sdxl: App.getTagGenerationSystemPrompt(),
        flux: `あなたはFlux形式のプロンプト生成の専門家です。
画像分析から自然な英語フレーズと日本語訳を生成してください。

JSON形式で出力:
{"pairs": [{"en": "phrase", "ja": "フレーズ", "weight": 1.0, "category": "type"}]}`,
        imagefx: `あなたはImageFX形式のコマンド生成の専門家です。
画像分析から命令形の英語コマンドと日本語訳を生成してください。

JSON形式で出力:
{"pairs": [{"en": "command", "ja": "コマンド", "weight": 1.0, "category": "type"}]}`,
        'imagefx-natural': `あなたはImageFX Natural形式のプロンプト生成の専門家です。
画像分析から詳細な説明文と日本語訳を生成してください。

JSON形式で出力:
{"pairs": [{"en": "description", "ja": "説明", "weight": 1.0, "category": "type"}]}`
      };
      textarea.value = defaultPrompts[format] || defaultPrompts.sdxl;
    }
  },
  
  saveImageTagPrompt: () => {
    const formatSelect = document.getElementById('image-tag-format-select');
    const textarea = document.getElementById('image-tag-generation-prompt');
    
    if (!formatSelect || !textarea) return;
    
    const format = formatSelect.value;
    const prompt = textarea.value;
    
    localStorage.setItem(`image-tag-prompt-${format}`, prompt);
    localStorage.setItem(`sp-image-format-${format}`, prompt); // Also save for runtime use
    
    showNotification(`${format.toUpperCase()}形式のタグ生成プロンプトを保存しました`, 'success');
  },
  
  resetImageTagPrompt: () => {
    const formatSelect = document.getElementById('image-tag-format-select');
    if (!formatSelect) return;
    
    const format = formatSelect.value;
    App.loadImageTagPrompt(format);
    showNotification(`${format.toUpperCase()}形式をデフォルトに戻しました`, 'success');
  },
  
  // Backward compatibility - redirect to image model settings
  updateVisionModelSetting: (model) => {
    App.updateImageModelFromSettings(model);
  },
  
  resetSettings: () => {
    if (confirm('Reset all settings to defaults?')) {
      localStorage.clear();
      location.reload();
    }
  },
  
  saveSettings: () => {
    // Save Image Analysis Prompt
    const imageAnalysisTextarea = document.getElementById('image-analysis-prompt');
    if (imageAnalysisTextarea) {
      localStorage.setItem('image-analysis-prompt', imageAnalysisTextarea.value);
    }
    
    // Save Tag Generation Prompt
    const formatSelect = document.getElementById('image-tag-format-select');
    const tagGenTextarea = document.getElementById('image-tag-generation-prompt');
    if (formatSelect && tagGenTextarea) {
      const format = formatSelect.value;
      localStorage.setItem(`image-tag-prompt-${format}`, tagGenTextarea.value);
      localStorage.setItem(`sp-image-format-${format}`, tagGenTextarea.value);
    }
    
    showNotification('設定を保存しました', 'success');
    App.closeSettings();
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('SS Prompt Manager initialized');
  
  // Cleanup: Remove test format from localStorage if it exists
  if (appState.systemPrompts.test) {
    delete appState.systemPrompts.test;
    localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
    console.log('Cleaned up test format from localStorage');
  }
  
  // Initialize output formats
  const savedOutputFormat = localStorage.getItem('output-format');
  if (savedOutputFormat) {
    const formatSelect = document.getElementById('output-format');
    if (formatSelect) {
      // Reset to sdxl if test format was selected
      if (savedOutputFormat === 'test') {
        formatSelect.value = 'sdxl';
        appState.outputFormat = 'sdxl';
        localStorage.setItem('output-format', 'sdxl');
        console.log('Reset test format selection to sdxl');
      } else {
        formatSelect.value = savedOutputFormat;
        appState.outputFormat = savedOutputFormat;
      }
    }
  }
  
  // Initialize Text to Prompt model selector
  const savedTextModel = localStorage.getItem('text-model') || localStorage.getItem('selected-model') || 'openai/gpt-4o-mini';
  const textModelSelect = document.getElementById('text-model-selector');
  const settingsTextModel = document.getElementById('settings-text-model');
  
  // Default options for text models before API loads
  const defaultTextOptions = [
    { value: 'openai/gpt-4o-mini', text: 'GPT-4o Mini' },
    { value: 'openai/gpt-4o', text: 'GPT-4o' },
    { value: 'anthropic/claude-3.5-sonnet', text: 'Claude 3.5 Sonnet' },
    { value: 'google/gemini-pro-1.5', text: 'Gemini Pro 1.5' },
    { value: 'deepseek/deepseek-r1', text: 'DeepSeek R1' },
    { value: 'deepseek/deepseek-v3', text: 'DeepSeek V3' }
  ];
  
  // Populate default options for text model
  if (textModelSelect && textModelSelect.options.length <= 1) {
    defaultTextOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      textModelSelect.appendChild(option);
    });
  }
  
  if (textModelSelect) {
    textModelSelect.value = savedTextModel;
    appState.selectedModel = savedTextModel;
  }
  if (settingsTextModel) {
    // Add default options to settings too
    if (settingsTextModel.options.length <= 1) {
      defaultTextOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        settingsTextModel.appendChild(option);
      });
    }
    settingsTextModel.value = savedTextModel;
  }
  
  // Initialize Image to Prompt model selector
  const savedImageModel = localStorage.getItem('image-model') || localStorage.getItem('vision-model') || 'gemini-2.0-flash-exp';
  const imageModelSelect = document.getElementById('image-model-selector');
  const settingsImageModel = document.getElementById('settings-image-model');
  
  // Default options for vision models
  const defaultVisionOptions = [
    { value: 'gemini-2.0-flash-exp', text: 'Gemini 2.0 Flash Exp' },
    { value: 'openai/gpt-4o-mini', text: 'GPT-4o Mini' },
    { value: 'openai/gpt-4o', text: 'GPT-4o' },
    { value: 'anthropic/claude-3-haiku', text: 'Claude 3 Haiku' },
    { value: 'anthropic/claude-3.5-sonnet', text: 'Claude 3.5 Sonnet' }
  ];
  
  // Populate default options for image model
  if (imageModelSelect && imageModelSelect.options.length <= 1) {
    defaultVisionOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      imageModelSelect.appendChild(option);
    });
  }
  
  if (imageModelSelect) {
    imageModelSelect.value = savedImageModel;
    App.imageState.visionModel = savedImageModel;
  }
  if (settingsImageModel) {
    // Add default options to settings too
    if (settingsImageModel.options.length <= 1) {
      defaultVisionOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        settingsImageModel.appendChild(option);
      });
    }
    settingsImageModel.value = savedImageModel;
  }
  
  const savedFinalFormat = localStorage.getItem('final-output-format');
  if (savedFinalFormat) {
    const finalFormatSelect = document.getElementById('final-output-format');
    if (finalFormatSelect) {
      // Reset to sdxl if test format was selected
      if (savedFinalFormat === 'test') {
        finalFormatSelect.value = 'sdxl';
        appState.finalOutputFormat = 'sdxl';
        localStorage.setItem('final-output-format', 'sdxl');
        console.log('Reset test final format selection to sdxl');
      } else {
        finalFormatSelect.value = savedFinalFormat;
        appState.finalOutputFormat = savedFinalFormat;
      }
    }
  }
  
  // Populate custom formats in dropdowns for Text to Prompt
  const customFormats = Object.keys(appState.systemPrompts).filter(
    key => !['sdxl', 'flux', 'imagefx', 'imagefx-natural', 'test'].includes(key)
  );
  
  customFormats.forEach(format => {
    const formatSelect = document.getElementById('output-format');
    const finalFormatSelect = document.getElementById('final-output-format');
    
    if (formatSelect) {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      formatSelect.appendChild(option);
    }
    
    if (finalFormatSelect) {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      finalFormatSelect.appendChild(option);
    }
  });

  // Initialize Image to Prompt formats
  const savedImageOutputFormat = localStorage.getItem('image-output-format');
  if (savedImageOutputFormat) {
    App.imageState.imageOutputFormat = savedImageOutputFormat;
  }
  
  const savedImageFinalFormat = localStorage.getItem('image-final-output-format');
  if (savedImageFinalFormat) {
    App.imageState.imageFinalFormat = savedImageFinalFormat;
  }
  
  // Update image format dropdowns with custom formats
  App.updateImageFormatDropdowns();
  
  // Update custom formats lists in settings
  App.updateCustomFormatsList();
  
  // Load saved API key
  const savedKey = localStorage.getItem('openrouter-api-key');
  if (savedKey) {
    appState.apiKey = savedKey; // Ensure apiKey is set in appState
    const keyInput = document.getElementById('openrouter-api-key');
    if (keyInput) {
      keyInput.value = savedKey;
    }
    
    // Auto-load models
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${savedKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          App.updateModelList(data.data);
          
          // Load saved model selection (check both keys for compatibility)
          const savedModel = localStorage.getItem('selected-model') || localStorage.getItem('openrouter-model');
          if (savedModel) {
            appState.selectedModel = savedModel; // Update appState
            const modelSelect = document.getElementById('openrouter-model');
            if (modelSelect) {
              modelSelect.value = savedModel;
              App.updateOpenRouterModel(savedModel);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  } else {
    // No API key saved
    const modelIndicator = document.getElementById('current-model-indicator');
    if (modelIndicator) {
      modelIndicator.textContent = 'No API key';
    }
  }
  
  // Initialize Multi-Engine Analysis settings
  console.log('🚀 Initializing multi-engine analysis settings...');
  
  // Load saved Replicate API key
  const savedReplicateKey = localStorage.getItem('replicate-api-key');
  if (savedReplicateKey) {
    appState.replicateApiKey = savedReplicateKey;
    const replicateKeyInput = document.getElementById('replicate-api-key');
    if (replicateKeyInput) {
      replicateKeyInput.value = savedReplicateKey;
    }
    console.log('✅ Replicate API key loaded');
  }
  
  // Initialize engine selections
  App.initializeEngineSelections();
  
  // Load saved tagger model selection
  const savedTaggerModel = localStorage.getItem('tagger-model');
  if (savedTaggerModel) {
    appState.taggerModel = savedTaggerModel;
    const taggerModelSelect = document.getElementById('tagger-model-selector');
    if (taggerModelSelect) {
      taggerModelSelect.value = savedTaggerModel;
    }
    console.log('🤖 Tagger model loaded:', savedTaggerModel);
  }
  
  // Load saved fusion mode
  const savedFusionMode = localStorage.getItem('fusion-mode');
  if (savedFusionMode) {
    appState.fusionMode = savedFusionMode;
    const fusionModeSelect = document.getElementById('fusion-mode-selector');
    if (fusionModeSelect) {
      fusionModeSelect.value = savedFusionMode;
    }
    console.log('🔀 Fusion mode loaded:', savedFusionMode);
  }
  
  // Load saved tagger threshold
  const savedThreshold = localStorage.getItem('tagger-threshold');
  if (savedThreshold) {
    appState.taggerThreshold = parseFloat(savedThreshold);
    const thresholdSlider = document.getElementById('tagger-threshold');
    const thresholdValue = document.getElementById('tagger-threshold-value');
    if (thresholdSlider) {
      thresholdSlider.value = savedThreshold;
    }
    if (thresholdValue) {
      thresholdValue.textContent = savedThreshold;
    }
    console.log('📊 Tagger threshold loaded:', savedThreshold);
  }
  
  // Load saved source attribution setting
  const savedSourceAttribution = localStorage.getItem('source-attribution');
  if (savedSourceAttribution !== null) {
    appState.sourceAttribution = savedSourceAttribution === 'true';
    const sourceAttributionCheckbox = document.getElementById('enable-source-attribution');
    if (sourceAttributionCheckbox) {
      sourceAttributionCheckbox.checked = appState.sourceAttribution;
    }
    console.log('🏷️ Source attribution loaded:', appState.sourceAttribution);
  }
  
  // Load saved output format
  const savedFormat = localStorage.getItem('output-format');
  if (savedFormat) {
    const formatSelect = document.getElementById('output-format');
    if (formatSelect) {
      formatSelect.value = savedFormat;
      appState.outputFormat = savedFormat;
    }
  }
});

// Image to Prompt functionality extensions
Object.assign(App, {
  // Image handling state
  imageState: {
    imageData: null,
    analysisResult: null,
    taggerResult: null,  // WD-EVA02 tagger result (legacy)
    multiAnalysisResults: {}, // Results from multiple engines: {engine: {success, output, ...}}
    visionModel: localStorage.getItem('image-vision-model') || 'gemini-2.0-flash-exp',
    imageOutputFormat: 'sdxl',
    imageFinalFormat: 'sdxl',  // Separate format for final output
    imageTags: [],  // Separate tags for image tab
    analysisVisible: false,
    customFormats: JSON.parse(localStorage.getItem('image-custom-formats') || '{}'),  // Image-specific custom formats
    // Tag filtering state for image tab
    categoryFilters: {
      active: JSON.parse(localStorage.getItem('image-category-filters') || 'null') || {
        person: true, appearance: true, clothing: true, action: true,
        background: true, quality: true, style: true, composition: true,
        object: true, other: true
      },
      visible: false
    }
  },
  
  // Handle image upload
  handleImageUpload: (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        showNotification('Image size must be less than 10MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        App.imageState.imageData = e.target.result;
        App.displayImagePreview(e.target.result);
        
        // Enable generate button
        const generateBtn = document.getElementById('image-ai-generate-btn');
        if (generateBtn) generateBtn.disabled = false;
        
        showNotification('Image uploaded successfully', 'success');
      };
      reader.readAsDataURL(file);
    }
  },
  
  // Handle drag and drop
  handleImageDrop: (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const dropZone = document.getElementById('image-drop-zone');
    if (dropZone) dropZone.classList.remove('border-blue-400');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const fileInput = document.getElementById('image-file-input');
        fileInput.files = files;
        App.handleImageUpload({ target: fileInput });
      }
    }
  },
  
  handleDragOver: (event) => {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('image-drop-zone');
    if (dropZone) dropZone.classList.add('border-blue-400');
  },
  
  handleDragLeave: (event) => {
    event.preventDefault();
    const dropZone = document.getElementById('image-drop-zone');
    if (dropZone) dropZone.classList.remove('border-blue-400');
  },
  
  // Display image preview
  displayImagePreview: (imageSrc) => {
    const previewContainer = document.getElementById('image-preview-container');
    const uploadPrompt = document.getElementById('image-upload-prompt');
    const preview = document.getElementById('image-preview');
    
    if (previewContainer && uploadPrompt && preview) {
      preview.src = imageSrc;
      previewContainer.classList.remove('hidden');
      uploadPrompt.classList.add('hidden');
    }
  },
  
  // Clear image
  clearImage: () => {
    App.imageState.imageData = null;
    App.imageState.analysisResult = null;
    App.imageState.taggerResult = null;
    App.imageState.imageTags = [];
    App.imageState.analysisVisible = false;
    
    const previewContainer = document.getElementById('image-preview-container');
    const uploadPrompt = document.getElementById('image-upload-prompt');
    const fileInput = document.getElementById('image-file-input');
    const analysisResult = document.getElementById('image-analysis-result');
    const taggerResult = document.getElementById('image-tagger-result');
    const generatedPrompt = document.getElementById('image-generated-prompt');
    const generateBtn = document.getElementById('image-ai-generate-btn');
    const analysisContainer = document.getElementById('analysis-result-container');
    const taggerContainer = document.getElementById('tagger-result-container');
    
    if (previewContainer) previewContainer.classList.add('hidden');
    if (uploadPrompt) uploadPrompt.classList.remove('hidden');
    if (fileInput) fileInput.value = '';
    if (analysisResult) analysisResult.innerHTML = '<p class="text-gray-500 text-sm italic">No analysis yet...</p>';
    if (taggerResult) taggerResult.innerHTML = '<p class="text-gray-500 text-xs italic">Tagger disabled or no result yet...</p>';
    if (generatedPrompt) generatedPrompt.value = '';
    if (generateBtn) generateBtn.disabled = true;
    if (analysisContainer) analysisContainer.classList.add('hidden');
    if (taggerContainer) taggerContainer.classList.add('hidden');
    
    // Clear image tag editor
    const enTagsContainer = document.getElementById('image-tags-en');
    const jaTagsContainer = document.getElementById('image-tags-ja');
    if (enTagsContainer) enTagsContainer.innerHTML = '';
    if (jaTagsContainer) jaTagsContainer.innerHTML = '';
    
    showNotification('Image cleared', 'info');
  },
  
  // Update vision model
  updateVisionModel: () => {
    const select = document.getElementById('vision-model-select');
    if (select) {
      App.imageState.visionModel = select.value;
      localStorage.setItem('vision-model', select.value);
    }
  },
  
  // Analyze image using selected vision model
  analyzeImage: async () => {
    if (!App.imageState.imageData) {
      showNotification('Please upload an image first', 'error');
      return;
    }
    
    if (!appState.apiKey) {
      showNotification('Please configure your OpenRouter API key in settings', 'error');
      return;
    }
    
    const analyzeBtn = document.getElementById('analyze-image-btn');
    const resultDiv = document.getElementById('image-analysis-result');
    
    if (analyzeBtn) {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing...';
    }
    
    if (resultDiv) {
      resultDiv.innerHTML = '<div class="flex items-center"><i class="fas fa-spinner fa-spin mr-2"></i>Analyzing image...</div>';
    }
    
    try {
      // Get system prompt
      const systemPromptTextarea = document.getElementById('sp-image-analysis');
      const systemPrompt = systemPromptTextarea?.value || App.getDefaultImageAnalysisPrompt();
      
      // Prepare the message with image
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and describe what you see.'
            },
            {
              type: 'image_url',
              image_url: {
                url: App.imageState.imageData
              }
            }
          ]
        }
      ];
      
      // Call OpenRouter API with vision model
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'SS Prompt Manager'
        },
        body: JSON.stringify({
          model: App.imageState.visionModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to analyze image');
      }
      
      const data = await response.json();
      const analysis = data.choices[0].message.content;
      
      App.imageState.analysisResult = analysis;
      
      if (resultDiv) {
        resultDiv.innerHTML = `<pre class="whitespace-pre-wrap text-sm">${analysis}</pre>`;
      }
      
      // Enable generation button
      const generateBtn = document.getElementById('generate-image-prompt-btn');
      if (generateBtn) generateBtn.disabled = false;
      
      showNotification('Image analyzed successfully', 'success');
      
    } catch (error) {
      console.error('Image analysis error:', error);
      showNotification(`Analysis failed: ${error.message}`, 'error');
      
      if (resultDiv) {
        resultDiv.innerHTML = `<p class="text-red-500 text-sm">Error: ${error.message}</p>`;
      }
    } finally {
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles mr-2"></i>Analyze Image';
      }
    }
  },
  
  // Generate optimized prompt from analysis
  generateImagePrompt: async () => {
    if (!App.imageState.analysisResult) {
      showNotification('Please analyze the image first', 'error');
      return;
    }
    
    const generateBtn = document.getElementById('generate-image-prompt-btn');
    const promptTextarea = document.getElementById('image-generated-prompt');
    
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
    }
    
    try {
      // Get system prompt for generation
      const systemPromptTextarea = document.getElementById('sp-image-to-prompt');
      const formatPrompts = App.getFormatSystemPrompts();
      const systemPrompt = systemPromptTextarea?.value || formatPrompts[App.imageState.imageOutputFormat];
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'SS Prompt Manager'
        },
        body: JSON.stringify({
          model: appState.selectedModel || 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Based on this image analysis, generate an optimized prompt:\n\n${App.imageState.analysisResult}`
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate prompt');
      }
      
      const data = await response.json();
      const generatedPrompt = data.choices[0].message.content;
      
      if (promptTextarea) {
        promptTextarea.value = generatedPrompt;
      }
      
      // Enable send button
      const sendBtn = document.getElementById('send-to-editor-btn');
      if (sendBtn) sendBtn.disabled = false;
      
      showNotification('Prompt generated successfully', 'success');
      
    } catch (error) {
      console.error('Prompt generation error:', error);
      showNotification(`Generation failed: ${error.message}`, 'error');
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-sparkles mr-2"></i>Generate Optimized Prompt';
      }
    }
  },
  
  // Send generated prompt to tag editor
  sendToTagEditor: () => {
    const promptTextarea = document.getElementById('image-generated-prompt');
    if (!promptTextarea || !promptTextarea.value) {
      showNotification('No prompt to send', 'error');
      return;
    }
    
    // Switch to Text tab
    App.setTab('text');
    
    // Put prompt in input textarea
    const inputTextarea = document.getElementById('input-text');
    if (inputTextarea) {
      inputTextarea.value = promptTextarea.value;
      
      // Automatically split to tags
      setTimeout(() => {
        App.splitText();
        showNotification('Prompt sent to Tag Editor', 'success');
      }, 100);
    }
  },
  
  // Generate from image - main entry point for AI Generate button
  generateFromImage: async () => {
    // Call the comprehensive tag generation function
    await App.generateImageTagsFromAI();
  },
  
  // Toggle AI Analysis Result visibility
  toggleAnalysisResult: () => {
    // Toggle both legacy and multi-engine analysis containers
    const legacyContainer = document.getElementById('analysis-result-container');
    const multiContainer = document.getElementById('multi-analysis-container');
    const toggleBtn = document.getElementById('toggle-analysis-btn');
    const toggleText = document.getElementById('toggle-analysis-text');
    const toggleIcon = document.getElementById('toggle-analysis-icon');
    
    App.imageState.analysisVisible = !App.imageState.analysisVisible;
    
    if (App.imageState.analysisVisible) {
      // Show all available analysis containers
      if (legacyContainer) legacyContainer.classList.remove('hidden');
      if (multiContainer) multiContainer.classList.remove('hidden');
      
      if (toggleText) toggleText.textContent = 'Hide Analysis';
      if (toggleIcon) toggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
      if (toggleBtn) toggleBtn.classList.replace('bg-green-500', 'bg-gray-500');
      if (toggleBtn) toggleBtn.classList.replace('hover:bg-green-600', 'hover:bg-gray-600');
    } else {
      // Hide all analysis containers
      if (legacyContainer) legacyContainer.classList.add('hidden');
      if (multiContainer) multiContainer.classList.add('hidden');
      
      if (toggleText) toggleText.textContent = 'Show Analysis';
      if (toggleIcon) toggleIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
      if (toggleBtn) toggleBtn.classList.replace('bg-gray-500', 'bg-green-500');
      if (toggleBtn) toggleBtn.classList.replace('hover:bg-gray-600', 'hover:bg-green-600');
    }
    
    // Force visibility of multi-analysis-container when toggling
    if (App.imageState.analysisVisible && multiContainer) {
      console.log('🔍 Ensuring multi-analysis-container is visible');
      multiContainer.style.display = 'block';
    }
  },
  
  // Translate all image tags
  translateImageTags: async (direction) => {
    if (App.imageState.imageTags.length === 0) {
      showNotification('翻訳するタグがありません', 'error');
      return;
    }
    
    showLoading('タグを翻訳中...');
    
    try {
      const promises = App.imageState.imageTags.map(async (tag) => {
        if (direction === 'en-to-ja') {
          // Translate English to Japanese
          if (tag.en && !tag.ja) {
            tag.ja = await translateWithAI(tag.en, 'ja');
          }
        } else if (direction === 'ja-to-en') {
          // Translate Japanese to English
          if (tag.ja && !tag.en) {
            if (appState.apiKey) {
              tag.en = await translateWithAI(tag.ja, 'en');
            } else {
              tag.en = translateToEnglish(tag.ja);
            }
          }
        }
        return tag;
      });
      
      await Promise.all(promises);
      TagEditor.renderTags('image');
      App.updateImagePromptOutput();
      hideLoading();
      showNotification('タグを翻訳しました', 'success');
    } catch (error) {
      hideLoading();
      showNotification('翻訳に失敗しました', 'error');
    }
  },
  
  // Add new tag for image editor
  addNewImageTag: async (lang) => {
    const input = document.getElementById(`image-new-tag-${lang}`);
    if (!input || !input.value.trim()) return;
    
    const text = input.value.trim();
    showLoading('タグを追加しています...');
    
    const newTag = {
      id: `manual-tag-${Date.now()}`,
      en: '',
      ja: '',
      weight: 1.0,
      category: 'other'
    };
    
    if (lang === 'en') {
      newTag.en = text;
      newTag.ja = await translateWithAI(text, 'ja');
      newTag.category = categorizeTag(text);
    } else {
      newTag.ja = text;
      // Try AI translation from Japanese to English
      if (appState.apiKey) {
        newTag.en = await translateWithAI(text, 'en');
      } else {
        newTag.en = translateToEnglish(text);
      }
      newTag.category = categorizeTag(newTag.en);
    }
    
    App.imageState.imageTags.push(newTag);
    input.value = '';
    hideLoading();
    TagEditor.renderTags('image');
    App.updateImagePromptOutput();
  },
  
  // Sort image tags
  sortImageTags: (type) => {
    if (type === 'category') {
      App.imageState.imageTags.sort((a, b) => a.category.localeCompare(b.category));
    } else if (type === 'weight') {
      App.imageState.imageTags.sort((a, b) => b.weight - a.weight);
    }
    TagEditor.renderTags('image');
  },
  
  // AI categorize image tags
  aiCategorizeImageTags: async () => {
    if (App.imageState.imageTags.length === 0) {
      showNotification('イメージタグがありません', 'error');
      return;
    }
    
    if (!appState.apiKey) {
      showNotification('OpenRouter APIキーを設定してください', 'error');
      return;
    }
    
    showLoading('AI でイメージタグを分類中...');
    
    try {
      const tagTexts = App.imageState.imageTags.map(tag => tag.en).join(', ');
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
          'X-Title': 'SS Prompt Manager'
        },
        body: JSON.stringify({
          model: appState.selectedModel || 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Categorize image generation tags into: person, appearance, clothing, action, background, quality, style, composition, object, or other. Respond ONLY with valid JSON: {"categories": [{"tag": "tag_name", "category": "category_name"}]}`
            },
            {
              role: 'user',
              content: `Categorize these tags: ${tagTexts}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error('AI categorization failed');
      }
      
      const data = await response.json();
      let result;
      
      try {
        const content = data.choices[0].message.content.trim();
        result = JSON.parse(content);
      } catch (parseError) {
        const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Invalid JSON response');
        }
      }
      
      if (result.categories && Array.isArray(result.categories)) {
        result.categories.forEach(item => {
          const tag = App.imageState.imageTags.find(t => t.en.toLowerCase() === item.tag.toLowerCase());
          if (tag && item.category) {
            tag.category = item.category;
          }
        });
        
        TagEditor.renderTags('image');
        showNotification(`${result.categories.length}個のイメージタグを AI で分類しました`, 'success');
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('AI categorization error:', error);
      showNotification('AI分類に失敗しました。キーワードベース分類を使用します。', 'warning');
      
      // Fallback to keyword-based categorization
      App.imageState.imageTags = App.imageState.imageTags.map(tag => ({
        ...tag,
        category: categorizeTag(tag.en)
      }));
      TagEditor.renderTags('image');
    }
    
    hideLoading();
  },
  
  // Split image prompt to tags (advanced parsing + AI translation)
  splitImagePrompt: async () => {
    const promptTextarea = document.getElementById('image-generated-prompt');
    if (!promptTextarea || !promptTextarea.value.trim()) {
      showNotification('生成されたプロンプトがありません', 'error');
      return;
    }
    
    const text = promptTextarea.value.trim();
    
    showLoading('Splitting and translating tags...');
    
    // Clear existing tags
    App.imageState.imageTags = [];
    
    // Advanced tag parsing with weight support
    const parsedTags = App.parseComplexTags(text);
    
    // Create tags with AI translation if available
    const tagPromises = parsedTags.map(async (parsedTag, index) => {
      const ja = await translateWithAI(parsedTag.text, 'ja');
      return {
        id: `split-tag-${Date.now()}-${index}`,
        en: parsedTag.text,
        ja: ja,
        weight: parsedTag.weight,
        category: categorizeTag(parsedTag.text)
      };
    });
    
    App.imageState.imageTags = await Promise.all(tagPromises);
    
    // Auto-apply AI categorization if API key is available
    if (appState.apiKey && App.imageState.imageTags.length > 0) {
      try {
        const tagTexts = App.imageState.imageTags.map(tag => tag.en).join(', ');
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appState.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
            'X-Title': 'SS Prompt Manager'
          },
          body: JSON.stringify({
            model: appState.selectedModel || 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `Categorize image generation tags into: person, appearance, clothing, action, background, quality, style, composition, object, or other. Respond with JSON only: {"categories": [{"tag": "tag_name", "category": "category_name"}]}`
              },
              {
                role: 'user',
                content: `Categorize: ${tagTexts}`
              }
            ],
            temperature: 0.3,
            max_tokens: 500
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          let result;
          
          try {
            const content = data.choices[0].message.content.trim();
            result = JSON.parse(content);
          } catch (parseError) {
            const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
            if (jsonMatch) {
              result = JSON.parse(jsonMatch[1]);
            }
          }
          
          // Apply AI categorization
          if (result?.categories) {
            result.categories.forEach(item => {
              const tag = App.imageState.imageTags.find(t => t.en.toLowerCase() === item.tag.toLowerCase());
              if (tag && item.category) {
                tag.category = item.category;
              }
            });
          }
        }
      } catch (error) {
        console.log('AI categorization failed for image tags, using keyword-based fallback');
      }
    }
    
    hideLoading();
    TagEditor.renderTags('image');
    showNotification(`${App.imageState.imageTags.length}個のタグに分割しました（AI分類済み）`, 'success');
  },
  
  // 🚀 Multi-Engine Helper Functions
  callMultiEngineAnalysis: async (engines) => {
    if (!appState.replicateApiKey) {
      throw new Error('Replicate API key is required for multi-engine analysis');
    }
    
    console.log('🔄 Calling multi-engine API:', engines);
    
    const response = await fetch('/api/multi-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: appState.replicateApiKey,
        engines: engines,
        imageData: App.imageState.imageData,
        analysisPrompt: appState.analysisPrompt,
        threshold: appState.taggerThreshold
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  },
  
  mapEngineNameToKey: (engineName) => {
    const mappings = {
      'wd-eva02-large-tagger-v3': 'wd-eva02',
      'janus-pro-7b': 'janus',
      'wd-swinv2-tagger-v3': 'wd-swinv2',
      'wd-vit-tagger-v3': 'wd-vit'
    };
    return mappings[engineName] || engineName;
  },
  
  processEngineOutput: (engineName, output) => {
    if (engineName.startsWith('wd-')) {
      // WD Tagger output processing
      return App.processTaggerOutput(output);
    } else if (engineName === 'janus-pro-7b') {
      // Janus Pro 7B output processing
      return App.processJanusOutput(output);
    }
    return [];
  },
  
  processJanusOutput: (output) => {
    // Process Janus Pro 7B output into tags
    if (typeof output === 'string') {
      // Convert analysis text to structured tags
      const words = output.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      const relevantWords = words.filter(word => 
        !['the', 'and', 'with', 'this', 'that', 'from', 'they', 'have', 'been', 'were', 'are', 'was'].includes(word)
      );
      
      return relevantWords.slice(0, 20).map((word, index) => ({
        id: `janus-tag-${Date.now()}-${index}`,
        en: word,
        ja: translationDict[word.toLowerCase()] || App.simpleTranslate(word),
        weight: 1.0,
        category: categorizeTag(word),
        source: 'janus',
        confidence: 0.8
      }));
    }
    return [];
  },
  
  displayEngineResult: (engineKey, result, success) => {
    // Map engine keys to UI section IDs
    const engineMapping = {
      'wd-eva02-large-tagger-v3': 'wd-eva02',
      'janus-pro-7b': 'janus'
    };
    
    const uiEngineKey = engineMapping[engineKey] || engineKey;
    const sectionId = `${uiEngineKey}-result-section`;
    const contentId = `${uiEngineKey}-analysis-result`;
    const badgeId = `${uiEngineKey}-status-badge`;
    
    const section = document.getElementById(sectionId);
    const content = document.getElementById(contentId);
    const badge = document.getElementById(badgeId);
    
    if (section) {
      section.classList.remove('hidden');
    }
    
    if (badge) {
      if (success === 'success' || success === true) {
        badge.textContent = '✅';
        badge.className = 'text-xs px-1 py-0.5 bg-green-200 text-green-800 rounded';
      } else {
        badge.textContent = '❌';
        badge.className = 'text-xs px-1 py-0.5 bg-red-200 text-red-800 rounded';
      }
    }
    
    if (content) {
      if (typeof result === 'object') {
        content.innerHTML = `<pre class="whitespace-pre-wrap text-xs">${JSON.stringify(result, null, 2)}</pre>`;
      } else {
        content.innerHTML = `<pre class="whitespace-pre-wrap text-xs">${result}</pre>`;
      }
    }
  },
  
  toggleResultSection: (engineKey) => {
    const contentId = `${engineKey}-result-content`;
    const chevronId = `${engineKey}-chevron`;
    
    const content = document.getElementById(contentId);
    const chevron = document.getElementById(chevronId);
    
    if (content && chevron) {
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        chevron.classList.add('rotate-180');
      } else {
        content.classList.add('hidden');
        chevron.classList.remove('rotate-180');
      }
    }
  },
  
  toggleAllAnalysisResults: () => {
    const button = document.getElementById('toggle-all-results-btn');
    const allContents = document.querySelectorAll('[id$="-result-content"]');
    const allChevrons = document.querySelectorAll('[id$="-chevron"]');
    
    if (button && allContents.length > 0) {
      const isExpanding = button.textContent.includes('Expand');
      
      allContents.forEach(content => {
        if (isExpanding) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
      
      allChevrons.forEach(chevron => {
        if (isExpanding) {
          chevron.classList.add('rotate-180');
        } else {
          chevron.classList.remove('rotate-180');
        }
      });
      
      if (isExpanding) {
        button.innerHTML = '<i class="fas fa-compress mr-1"></i>Collapse';
      } else {
        button.innerHTML = '<i class="fas fa-expand mr-1"></i>Expand';
      }
    }
  },
  
  fuseMultiEngineResults: (allTags, fusionMode) => {
    // Enhanced fusion for multiple engines
    console.log(`🔀 Fusing ${allTags.length} tags from multiple engines (mode: ${fusionMode})`);
    
    if (allTags.length === 0) return [];
    
    // Group tags by similar content
    const tagGroups = {};
    allTags.forEach(tag => {
      const key = tag.en.toLowerCase().replace(/[-_\s]/g, '');
      if (!tagGroups[key]) {
        tagGroups[key] = [];
      }
      tagGroups[key].push(tag);
    });
    
    // Merge similar tags
    const fusedTags = Object.values(tagGroups).map(group => {
      if (group.length === 1) {
        return { ...group[0], fusion_method: 'single' };
      }
      
      // Multiple tags with same content - merge them
      const merged = { ...group[0] };
      merged.confidence = Math.max(...group.map(t => t.confidence || 0.5));
      merged.weight = Math.min(2.0, group.reduce((sum, t) => sum + (t.weight || 1.0), 0) / group.length);
      merged.source = 'hybrid';
      merged.fusion_method = 'merged';
      merged.sourceEngines = [...new Set(group.map(t => t.source).filter(Boolean))];
      
      return merged;
    });
    
    // Apply fusion mode filtering
    return App.applyFusionModeFiltering(fusedTags, fusionMode);
  },
  
  // Copy functions - Enhanced for multi-engine
  copyAnalysisResult: (engineKey = 'llm') => {
    let textToCopy = '';
    
    if (engineKey && App.imageState.multiAnalysisResults[engineKey]) {
      const result = App.imageState.multiAnalysisResults[engineKey];
      if (typeof result.output === 'object') {
        textToCopy = JSON.stringify(result.output, null, 2);
      } else {
        textToCopy = result.output;
      }
    } else if (App.imageState.analysisResult) {
      textToCopy = App.imageState.analysisResult;
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      showNotification(`${engineKey.toUpperCase()} analysis copied to clipboard`, 'success');
    }
  },
  
  copyAllAnalysisResults: () => {
    const results = Object.entries(App.imageState.multiAnalysisResults || {})
      .map(([engine, result]) => {
        const output = typeof result.output === 'object' 
          ? JSON.stringify(result.output, null, 2) 
          : result.output;
        return `=== ${engine.toUpperCase()} Analysis ===\n${output}\n`;
      })
      .join('\n');
    
    if (results) {
      navigator.clipboard.writeText(results);
      showNotification('All analysis results copied to clipboard', 'success');
    }
  },
  
  // 🎯 Tag from specific engine result
  tagFromEngineResult: async (engineKey) => {
    console.log(`🎯 Tagging from ${engineKey} result only`);
    
    if (!App.imageState.multiAnalysisResults || !App.imageState.multiAnalysisResults[engineKey]) {
      showNotification(`❌ ${engineKey} result not available`, 'error');
      return;
    }
    
    const engineResult = App.imageState.multiAnalysisResults[engineKey];
    
    if (!engineResult.success) {
      showNotification(`❌ ${engineKey} analysis failed: ${engineResult.error}`, 'error');
      return;
    }
    
    showLoading(`🏷️ ${engineKey} 結果をタグ化中...`);
    
    try {
      let tags = [];
      
      if (engineKey === 'llm') {
        // LLM result: Convert analysis text to tags using AI
        if (!appState.apiKey) {
          showNotification('OpenRouter APIキーが必要です', 'error');
          return;
        }
        
        const tagGenerationPrompt = App.getTagGenerationSystemPrompt();
        const response = await fetch('/api/openrouter/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: tagGenerationPrompt },
              { role: 'user', content: `Convert this image analysis to structured tags: ${engineResult.output}` }
            ],
            model: appState.selectedModel || 'openai/gpt-4o-mini',
            apiKey: appState.apiKey,
            temperature: 0.7,
            maxTokens: 500
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const parsedResult = JsonProcessor.cleanAndParse(data.content);
          if (parsedResult && parsedResult.pairs) {
            tags = parsedResult.pairs.map((pair, index) => ({
              id: `${engineKey}-tag-${Date.now()}-${index}`,
              en: pair.en,
              ja: pair.ja,
              weight: pair.weight || 1.0,
              category: pair.category || categorizeTag(pair.en),
              source: engineKey,
              confidence: 0.8
            }));
          }
        }
        
      } else if (engineKey.startsWith('wd-') || engineKey === 'wd-eva02') {
        // WD Tagger result: Process tags with confidence
        tags = App.processTaggerOutput(engineResult.output);
        
      } else if (engineKey === 'janus') {
        // Janus Pro 7B result: Process vision analysis
        tags = App.processJanusOutput(engineResult.output);
      }
      
      if (tags.length === 0) {
        showNotification(`⚠️ ${engineKey} からタグを生成できませんでした`, 'warning');
        return;
      }
      
      // Replace current tags with engine-specific tags
      App.imageState.imageTags = tags;
      
      // Update UI
      TagEditor.renderTags('image');
      App.updateImagePromptOutput();
      
      hideLoading();
      showNotification(`✅ ${engineKey} から ${tags.length}個のタグを生成しました`, 'success');
      
    } catch (error) {
      console.error(`❌ Error tagging from ${engineKey}:`, error);
      hideLoading();
      showNotification(`❌ ${engineKey} タグ化に失敗: ${error.message}`, 'error');
    }
  },
  
  // Engine Selector Modal Functions
  showEngineSelector: () => {
    const modal = document.getElementById('engine-selector-modal');
    if (modal) {
      // Pre-select engines that have successful results
      const availableEngines = Object.keys(App.imageState.multiAnalysisResults || {});
      availableEngines.forEach(engine => {
        const checkbox = document.getElementById(`tag-engine-${engine}`);
        if (checkbox && App.imageState.multiAnalysisResults[engine]?.success) {
          checkbox.checked = true;
          checkbox.disabled = false;
        } else if (checkbox) {
          checkbox.checked = false;
          checkbox.disabled = true;
        }
      });
      
      modal.classList.remove('hidden');
    }
  },
  
  hideEngineSelector: () => {
    const modal = document.getElementById('engine-selector-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  },
  
  tagFromSelectedEngines: async () => {
    const selectedEngines = [];
    
    // Get selected engines
    ['llm', 'wd-eva02', 'janus', 'wd-swinv2', 'wd-vit'].forEach(engine => {
      const checkbox = document.getElementById(`tag-engine-${engine}`);
      if (checkbox && checkbox.checked && !checkbox.disabled) {
        selectedEngines.push(engine);
      }
    });
    
    if (selectedEngines.length === 0) {
      showNotification('❌ 少なくとも1つのエンジンを選択してください', 'error');
      return;
    }
    
    App.hideEngineSelector();
    showLoading(`🏷️ ${selectedEngines.length}個のエンジンからタグを統合中...`);
    
    try {
      let allTags = [];
      
      // Process each selected engine
      for (const engineKey of selectedEngines) {
        const engineResult = App.imageState.multiAnalysisResults[engineKey];
        if (engineResult && engineResult.success) {
          let engineTags = [];
          
          if (engineKey === 'llm') {
            // Process LLM result
            if (appState.apiKey) {
              const tagGenerationPrompt = App.getTagGenerationSystemPrompt();
              const response = await fetch('/api/openrouter/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messages: [
                    { role: 'system', content: tagGenerationPrompt },
                    { role: 'user', content: `Convert this image analysis to structured tags: ${engineResult.output}` }
                  ],
                  model: appState.selectedModel || 'openai/gpt-4o-mini',
                  apiKey: appState.apiKey,
                  temperature: 0.7,
                  maxTokens: 500
                })
              });
              
              if (response.ok) {
                const data = await response.json();
                const parsedResult = JsonProcessor.cleanAndParse(data.content);
                if (parsedResult && parsedResult.pairs) {
                  engineTags = parsedResult.pairs.map((pair, index) => ({
                    id: `${engineKey}-tag-${Date.now()}-${index}`,
                    en: pair.en,
                    ja: pair.ja,
                    weight: pair.weight || 1.0,
                    category: pair.category || categorizeTag(pair.en),
                    source: engineKey,
                    confidence: 0.8
                  }));
                }
              }
            }
          } else if (engineKey.startsWith('wd-') || engineKey === 'wd-eva02') {
            engineTags = App.processTaggerOutput(engineResult.output);
          } else if (engineKey === 'janus') {
            engineTags = App.processJanusOutput(engineResult.output);
          }
          
          allTags = allTags.concat(engineTags);
        }
      }
      
      if (allTags.length === 0) {
        hideLoading();
        showNotification('⚠️ 選択されたエンジンからタグを生成できませんでした', 'warning');
        return;
      }
      
      // Apply fusion to combine tags from multiple engines
      const fusedTags = App.fuseMultiEngineResults(allTags, appState.fusionMode);
      
      // Update tags
      App.imageState.imageTags = fusedTags;
      TagEditor.renderTags('image');
      App.updateImagePromptOutput();
      
      hideLoading();
      showNotification(`✅ ${selectedEngines.length}個のエンジンから ${fusedTags.length}個のタグを統合しました`, 'success');
      
    } catch (error) {
      console.error('❌ Error in multi-engine tagging:', error);
      hideLoading();
      showNotification(`❌ タグ統合に失敗: ${error.message}`, 'error');
    }
  },
  
  copyTaggerResult: () => {
    if (App.imageState.taggerResult) {
      // Format tagger result for copying
      let formattedResult = '';
      if (typeof App.imageState.taggerResult === 'object') {
        formattedResult = JSON.stringify(App.imageState.taggerResult, null, 2);
      } else {
        formattedResult = App.imageState.taggerResult;
      }
      navigator.clipboard.writeText(formattedResult);
      showNotification('Tagger result copied to clipboard', 'success');
    }
  },
  
  copyImagePrompt: () => {
    const promptTextarea = document.getElementById('image-generated-prompt');
    if (promptTextarea && promptTextarea.value) {
      navigator.clipboard.writeText(promptTextarea.value);
      showNotification('Prompt copied to clipboard', 'success');
    }
  },
  
  // Copy image final output
  copyImageFinalOutput: () => {
    const finalOutput = document.getElementById('image-final-output');
    if (finalOutput && finalOutput.value) {
      navigator.clipboard.writeText(finalOutput.value);
      showNotification('ファイナル出力をコピーしました', 'success');
    } else {
      showNotification('コピーするコンテンツがありません', 'error');
    }
  },
  
  // Update output format
  updateImageOutputFormat: () => {
    const select = document.getElementById('image-output-format');
    if (select) {
      App.imageState.imageOutputFormat = select.value;
      localStorage.setItem('image-output-format', select.value);
    }
  },
  
  // Update final output format for image tab
  updateImageFinalFormat: () => {
    const select = document.getElementById('image-final-output-format');
    if (select) {
      App.imageState.imageFinalFormat = select.value;
      localStorage.setItem('image-final-output-format', select.value);
      // Update the output display
      TagEditor.updateOutput('image');
      App.updateImagePromptOutput();
    }
  },
  
  // System prompt management
  getDefaultImageAnalysisPrompt: () => {
    return `You are an expert image analyst. Analyze the provided image and describe:
1. Main subjects and their appearance
2. Background and environment details
3. Colors, lighting, and atmosphere
4. Composition and style
5. Any text or symbols visible
6. Overall mood and artistic qualities

Be detailed and specific in your description.`;
  },
  
  getFormatSystemPrompts: () => {
    return {
      sdxl: `Convert the image analysis into SDXL format tags. Rules:
1. Start with quality tags: masterpiece, best quality, ultra-detailed
2. List subject tags with descriptive attributes
3. Include background and environment tags
4. Add style, lighting and atmosphere tags
5. Format: comma-separated tags with optional weights (tag:1.2)
6. Focus on visual elements that can be recreated
7. Keep each tag concise and specific
8. Use standard booru-style tags when applicable
9. Important elements should have higher weights (1.2-1.5)
10. Output ONLY the tags, no explanations or descriptions`,
      
      flux: `Convert the image analysis into Flux natural language phrases. Rules:
1. Write flowing, descriptive sentences
2. Focus on the overall scene and atmosphere
3. Include artistic style and mood descriptions
4. Use natural, coherent language
5. Avoid technical jargon or tags`,
      
      imagefx: `Convert the image analysis into ImageFX command format. Rules:
1. Use clear, imperative commands
2. Start with the main subject
3. Add style and atmosphere commands
4. Include technical parameters
5. Format: Short command phrases`,
      
      natural: `Convert the image analysis into a natural language description suitable for image generation. Be descriptive but concise, focusing on the key visual elements that should be recreated.`
    };
  },
  
  resetImageAnalysisPrompt: () => {
    const textarea = document.getElementById('sp-image-analysis');
    if (textarea) {
      textarea.value = App.getDefaultImageAnalysisPrompt();
      showNotification('Reset to default analysis prompt', 'info');
    }
  },
  
  resetImageToPromptSystem: () => {
    const textarea = document.getElementById('sp-image-to-prompt');
    const format = App.imageState.imageOutputFormat;
    const prompts = App.getFormatSystemPrompts();
    
    if (textarea) {
      textarea.value = prompts[format];
      showNotification('Reset to default generation prompt', 'info');
    }
  },
  
  saveImageSystemPrompts: () => {
    const analysisPrompt = document.getElementById('sp-image-analysis');
    const generationPrompt = document.getElementById('sp-image-to-prompt');
    
    const imagePrompts = {
      analysis: analysisPrompt?.value || App.getDefaultImageAnalysisPrompt(),
      generation: generationPrompt?.value || App.getFormatSystemPrompts()[App.imageState.imageOutputFormat]
    };
    
    localStorage.setItem('image-system-prompts', JSON.stringify(imagePrompts));
    showNotification('System prompts saved', 'success');
  },
  
  // Apply templates
  applyImageTemplate: (template) => {
    const templates = {
      artistic: `Analyze this image with focus on artistic elements:
- Art style and technique
- Color palette and harmony
- Composition and balance
- Emotional impact and mood
- Artistic influences or movements
- Visual metaphors or symbolism`,
      
      technical: `Provide technical analysis of this image:
- Image quality and resolution
- Lighting setup and direction
- Camera angle and perspective
- Depth of field and focus
- Post-processing effects
- Technical execution quality`,
      
      character: `Focus on character details in this image:
- Physical appearance and features
- Clothing and accessories
- Pose and expression
- Personality traits suggested
- Age and demographics
- Distinctive characteristics`,
      
      environment: `Analyze the environment and setting:
- Location and setting type
- Time of day and weather
- Architectural or natural features
- Props and objects present
- Spatial relationships
- Atmosphere and ambiance`
    };
    
    const textarea = document.getElementById('sp-image-analysis');
    if (textarea && templates[template]) {
      textarea.value = templates[template];
      showNotification(`Applied ${template} template`, 'success');
    }
  },
  
  // Edit system prompt for image
  editImagePromptSystem: () => {
    const textarea = document.getElementById('sp-image-to-prompt');
    if (textarea) {
      textarea.focus();
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },
  
  // New unified generate function for image
  generateFromImage: async () => {
    if (!App.imageState.imageData) {
      showNotification('Please upload an image first', 'error');
      return;
    }
    
    if (!appState.apiKey) {
      showNotification('Please configure your OpenRouter API key in settings', 'error');
      return;
    }
    
    const generateBtn = document.getElementById('image-ai-generate-btn');
    const resultDiv = document.getElementById('image-analysis-result');
    const promptTextarea = document.getElementById('image-generated-prompt');
    
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    }
    
    try {
      // Step 1: Analyze image
      if (resultDiv) {
        resultDiv.innerHTML = '<div class="flex items-center"><i class="fas fa-spinner fa-spin mr-2"></i>Analyzing image...</div>';
      }
      
      const systemPromptAnalysis = App.getDefaultImageAnalysisPrompt();
      
      const analysisResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'SS Prompt Manager'
        },
        body: JSON.stringify({
          model: App.imageState.visionModel,
          messages: [
            {
              role: 'system',
              content: systemPromptAnalysis
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and describe what you see.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: App.imageState.imageData
                  }
                }
              ]
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!analysisResponse.ok) {
        const error = await analysisResponse.json();
        throw new Error(error.error?.message || 'Failed to analyze image');
      }
      
      const analysisData = await analysisResponse.json();
      const analysis = analysisData.choices[0].message.content;
      App.imageState.analysisResult = analysis;
      
      if (resultDiv) {
        resultDiv.innerHTML = `<pre class="whitespace-pre-wrap text-sm">${analysis}</pre>`;
      }
      
      // Step 2: Generate prompt from analysis
      if (promptTextarea) {
        promptTextarea.value = 'Generating prompt...';
      }
      
      const formatPrompts = App.getImageFormatSystemPrompts();
      const systemPromptGeneration = formatPrompts[App.imageState.imageOutputFormat];
      
      const promptResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'SS Prompt Manager'
        },
        body: JSON.stringify({
          model: appState.selectedModel || 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPromptGeneration
            },
            {
              role: 'user',
              content: `Based on this image analysis, generate an optimized prompt:\n\n${analysis}`
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });
      
      if (!promptResponse.ok) {
        const error = await promptResponse.json();
        throw new Error(error.error?.message || 'Failed to generate prompt');
      }
      
      const promptData = await promptResponse.json();
      const generatedPrompt = promptData.choices[0].message.content;
      
      if (promptTextarea) {
        promptTextarea.value = generatedPrompt;
      }
      
      // Step 3: Generate structured tags using JSON schema approach
      try {
        // Enhanced system prompt for JSON tag generation
        const tagSystemPrompt = `You are a tag normalizer & bilingual mapper for image prompts.

Input: Image analysis text
Output ONLY JSON in this exact format:
{
  "pairs": [
    {
      "en": "...",
      "ja": "...",
      "weight": number,
      "category": "person|appearance|clothes|pose|background|quality|style|other"
    }
  ]
}

Rules:
- Produce short, natural Japanese tags that creators actually write
- Keep one-to-one meaning with the English tag; avoid free paraphrasing
- Weight: 1.0 for normal, 1.2-1.5 for important elements, 0.8-0.9 for less important
- Category mapping:
  * person: 1girl, woman, child, etc.
  * appearance: eyes, hair, smile, beautiful, etc.
  * clothes: dress, uniform, hoodie, etc.
  * pose: sitting, standing, running, etc.
  * background: forest, city, outdoor, etc.
  * quality: masterpiece, detailed, 8k, etc.
  * style: anime, realistic, painting, etc.
  * other: everything else
- No markdown, no explanations, ONLY the JSON object`;

        const tagResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appState.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.href,
            'X-Title': 'SS Prompt Manager'
          },
          body: JSON.stringify({
            model: appState.selectedModel || 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: tagSystemPrompt
              },
              {
                role: 'user',
                content: `Based on this image analysis, generate optimized English tags with natural Japanese translations:\n\n${analysis}`
              }
            ],
            temperature: 0.3,
            max_tokens: 800
          })
        });

        if (tagResponse.ok) {
          const tagData = await tagResponse.json();
          let tagResponseText = tagData.choices[0].message.content.trim();
          
          // Enhanced cleanup for JSON response
          tagResponseText = App.cleanAIResponse(tagResponseText);
          
          try {
            const tagsData = JSON.parse(tagResponseText);
            
            if (tagsData.pairs && Array.isArray(tagsData.pairs)) {
              // Clear existing tags and populate with AI-generated ones
              App.imageState.imageTags = [];
              
              tagsData.pairs.forEach((pair, index) => {
                if (pair.en && pair.ja) {
                  App.imageState.imageTags.push({
                    id: `ai-tag-${Date.now()}-${index}`,
                    en: pair.en,
                    ja: pair.ja,
                    weight: pair.weight || 1.0,
                    category: pair.category || 'other'
                  });
                }
              });

              // Update UI
              TagEditor.renderTags('image');
              
              // Update generated prompt textarea
              App.updateImagePromptOutput();
            } else {
              throw new Error('Invalid response format');
            }
          } catch (parseError) {
            console.error('JSON parse error, falling back to text parsing:', parseError);
            // Fallback to old parsing method
            App.parsePromptToImageTags(generatedPrompt);
          }
        } else {
          // Fallback to old parsing method
          App.parsePromptToImageTags(generatedPrompt);
        }
      } catch (tagError) {
        console.error('Tag generation failed, falling back to prompt parsing:', tagError);
        // Fallback to old parsing method
        App.parsePromptToImageTags(generatedPrompt);
      }
      
      showNotification('Analysis and generation complete', 'success');
      
    } catch (error) {
      console.error('Generation error:', error);
      showNotification(`Generation failed: ${error.message}`, 'error');
      
      if (resultDiv) {
        resultDiv.innerHTML = `<p class="text-red-500 text-sm">Error: ${error.message}</p>`;
      }
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-sparkles mr-2"></i>AI Generate';
      }
    }
  },
  

  
  // Parse prompt to image tags
  parsePromptToImageTags: (prompt) => {
    // Clear existing tags
    App.imageState.imageTags = [];
    
    // Parse based on format
    let tags = [];
    if (App.imageState.imageOutputFormat === 'sdxl' || App.imageState.imageOutputFormat === 'imagefx') {
      // Split by comma for SDXL and ImageFX
      tags = prompt.split(',').map(tag => {
        // Handle weighted tags (e.g., "tag:1.5")
        const parts = tag.trim().split(':');
        return {
          text: parts[0].trim(),
          weight: parts[1] ? parseFloat(parts[1]) : 1.0
        };
      }).filter(tag => tag.text);
    } else {
      // For flux and natural, split by sentences or periods
      tags = prompt.split(/[.!?]/).map(tag => ({
        text: tag.trim(),
        weight: 1.0
      })).filter(tag => tag.text);
    }
    
    // Create tag objects with translations and categories
    tags.forEach((tag, index) => {
      const jaTranslation = translationDict[tag.text.toLowerCase()] || App.simpleTranslate(tag.text);
      const category = App.categorizeTag(tag.text);  // Use common categorize function
      
      App.imageState.imageTags.push({
        id: `img-tag-${Date.now()}-${index}`,
        en: tag.text,
        ja: jaTranslation,
        weight: tag.weight,
        category: category
      });
    });
    
    // Update UI
    TagEditor.renderTags('image');
  },

  // Specialized Tagger API Call (via Backend)
  callSpecializedTagger: async (imageData) => {
    if (!appState.replicateApiKey || !appState.taggerModel) {
      console.log('🚫 Specialized tagger disabled: Missing API key or model selection');
      return null;
    }

    console.log('🤖 Calling specialized tagger via backend:', appState.taggerModel);
    
    try {
      const response = await fetch('/api/replicate-tagger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: appState.replicateApiKey,
          model: appState.taggerModel,
          imageData: imageData,
          threshold: appState.taggerThreshold
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Backend error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Tagger analysis complete (${data.processingTime}s):`, data.output);
        return data.output;
      } else {
        throw new Error(data.error || 'Tagger analysis failed');
      }

    } catch (error) {
      console.error('❌ Specialized tagger error:', error);
      return null;
    }
  },

  // LLM Analysis (separated for parallel execution)
  performLLMAnalysis: async (imageData) => {
    console.log('🧠 Starting LLM analysis...');
    
    try {
      // Step 1: Image Analysis
      const imageAnalysisPrompt = App.getImageAnalysisSystemPrompt();
      
      const analysisMessages = [
        {
          role: 'system',
          content: imageAnalysisPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'この画像を詳細に分析して、画像生成プロンプトのための要素を抽出してください。'
            },
            {
              type: 'image_url',
              image_url: { url: imageData }
            }
          ]
        }
      ];
      
      const analysisResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'SS Prompt Manager'
        },
        body: JSON.stringify({
          model: App.imageState.visionModel || 'gemini-2.0-flash-exp',
          messages: analysisMessages,
          temperature: 0.7,
          max_tokens: 800
        })
      });
      
      if (!analysisResponse.ok) {
        const error = await analysisResponse.json();
        throw new Error(error.error?.message || '画像解析に失敗しました');
      }
      
      const analysisData = await analysisResponse.json();
      const analysisResult = analysisData.choices[0].message.content;
      
      // Step 2: Tag Generation from Analysis
      const tagGenerationPrompt = App.getTagGenerationSystemPrompt();
      
      const tagResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'SS Prompt Manager'
        },
        body: JSON.stringify({
          model: appState.selectedModel || 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: tagGenerationPrompt
            },
            {
              role: 'user',
              content: `以下の画像解析結果から、画像生成用の英語タグとわかりやすい日本語タグを生成してください：\n\n${analysisResult}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      
      if (!tagResponse.ok) {
        const error = await tagResponse.json();
        throw new Error(error.error?.message || 'タグ生成に失敗しました');
      }
      
      const tagData = await tagResponse.json();
      let responseText = tagData.choices[0].message.content.trim();
      responseText = App.cleanAIResponse(responseText);
      
      const tagsData = JSON.parse(responseText);
      if (!tagsData.pairs || !Array.isArray(tagsData.pairs)) {
        throw new Error('Invalid LLM response format');
      }
      
      // Process tags with source attribution
      const processedTags = await Promise.all(
        tagsData.pairs.map(async (pair, index) => {
          if (!pair.en) return null;
          
          let jaText = pair.ja || await translateWithAI(pair.en, 'ja');
          
          return {
            id: `llm-tag-${Date.now()}-${index}`,
            en: pair.en,
            ja: jaText,
            weight: pair.weight || 1.0,
            category: pair.category || categorizeTag(pair.en),
            source: 'llm',
            confidence: 0.8, // Default LLM confidence
            llm_confidence: 0.8
          };
        })
      );
      
      const validTags = processedTags.filter(tag => tag !== null);
      console.log(`✅ LLM generated ${validTags.length} tags`);
      
      return {
        analysis: analysisResult,
        tags: validTags
      };
      
    } catch (error) {
      console.error('❌ LLM analysis failed:', error);
      throw error;
    }
  },

  // Process Tagger Output into standardized format
  processTaggerOutput: (taggerOutput) => {
    if (!taggerOutput || typeof taggerOutput !== 'object') {
      console.warn('⚠️ Invalid tagger output');
      return [];
    }
    
    console.log('🏷️ Processing tagger output:', taggerOutput);
    
    const processedTags = [];
    let tagIndex = 0;
    
    // Handle different tagger output formats
    if (taggerOutput.tags && Array.isArray(taggerOutput.tags)) {
      // Format: { tags: [{ tag: "1girl", confidence: 0.95 }] }
      taggerOutput.tags.forEach(item => {
        if (item.confidence >= appState.taggerThreshold) {
          processedTags.push({
            id: `tagger-tag-${Date.now()}-${tagIndex++}`,
            en: item.tag,
            ja: translationDict[item.tag.toLowerCase()] || App.simpleTranslate(item.tag),
            weight: Math.min(item.confidence * 1.5, 2.0), // Scale confidence to weight
            category: categorizeTag(item.tag),
            source: 'tagger',
            confidence: item.confidence,
            tagger_confidence: item.confidence,
            original_tagger_tag: item.tag
          });
        }
      });
    } else if (typeof taggerOutput === 'object') {
      // Format: { "1girl": 0.95, "long_hair": 0.87, ... }
      Object.entries(taggerOutput).forEach(([tag, confidence]) => {
        if (confidence >= appState.taggerThreshold) {
          processedTags.push({
            id: `tagger-tag-${Date.now()}-${tagIndex++}`,
            en: tag,
            ja: translationDict[tag.toLowerCase()] || App.simpleTranslate(tag),
            weight: Math.min(confidence * 1.5, 2.0),
            category: categorizeTag(tag),
            source: 'tagger',
            confidence: confidence,
            tagger_confidence: confidence,
            original_tagger_tag: tag
          });
        }
      });
    }
    
    console.log(`✅ Processed ${processedTags.length} tagger tags`);
    return processedTags;
  },

  // Intelligent Tag Fusion Engine
  fuseTagResults: (llmTags, taggerTags, fusionMode = 'balanced') => {
    console.log(`🔀 Fusing results: ${llmTags.length} LLM + ${taggerTags.length} Tagger (mode: ${fusionMode})`);
    
    if (llmTags.length === 0 && taggerTags.length === 0) {
      return [];
    }
    
    if (llmTags.length === 0) {
      return taggerTags.map(tag => ({ ...tag, fusion_method: 'tagger_only' }));
    }
    
    if (taggerTags.length === 0) {
      return llmTags.map(tag => ({ ...tag, fusion_method: 'llm_only' }));
    }
    
    // Category-specific fusion rules
    const categoryRules = {
      person: { priority: 'tagger', merge_strategy: 'max_confidence' },
      appearance: { priority: 'hybrid', merge_strategy: 'averaged' },
      clothing: { priority: 'tagger', merge_strategy: 'max_confidence' },
      action: { priority: 'llm', merge_strategy: 'llm_refined' },
      background: { priority: 'llm', merge_strategy: 'direct' },
      quality: { priority: 'llm', merge_strategy: 'direct' },
      style: { priority: 'llm', merge_strategy: 'direct' },
      composition: { priority: 'llm', merge_strategy: 'direct' },
      object: { priority: 'hybrid', merge_strategy: 'averaged' },
      other: { priority: 'hybrid', merge_strategy: 'averaged' }
    };
    
    const fusedTags = [];
    const processedTags = new Set();
    
    // Step 1: Find semantic duplicates and merge
    llmTags.forEach(llmTag => {
      const semanticDuplicates = taggerTags.filter(taggerTag => 
        App.areTagsSemanticallyEqual(llmTag.en, taggerTag.en)
      );
      
      if (semanticDuplicates.length > 0) {
        // Merge duplicates
        const taggerTag = semanticDuplicates[0];
        const rule = categoryRules[llmTag.category] || categoryRules.other;
        
        let mergedTag;
        switch (rule.merge_strategy) {
          case 'max_confidence':
            mergedTag = llmTag.confidence > taggerTag.confidence ? llmTag : taggerTag;
            mergedTag.source = 'hybrid';
            mergedTag.fusion_method = 'max_confidence';
            break;
            
          case 'averaged':
            mergedTag = {
              ...llmTag,
              weight: (llmTag.weight + taggerTag.weight) / 2,
              confidence: (llmTag.confidence + taggerTag.confidence) / 2,
              source: 'hybrid',
              fusion_method: 'averaged',
              llm_confidence: llmTag.confidence,
              tagger_confidence: taggerTag.confidence
            };
            break;
            
          case 'llm_refined':
            mergedTag = {
              ...llmTag,
              confidence: Math.max(llmTag.confidence, taggerTag.confidence),
              source: 'hybrid',
              fusion_method: 'llm_refined',
              tagger_confidence: taggerTag.confidence
            };
            break;
            
          default: // 'direct'
            mergedTag = llmTag;
            mergedTag.fusion_method = 'direct';
        }
        
        fusedTags.push(mergedTag);
        processedTags.add(llmTag.en.toLowerCase());
        processedTags.add(taggerTag.en.toLowerCase());
      } else {
        // No duplicate, add LLM tag directly
        fusedTags.push({ ...llmTag, fusion_method: 'llm_only' });
        processedTags.add(llmTag.en.toLowerCase());
      }
    });
    
    // Step 2: Add remaining tagger tags
    taggerTags.forEach(taggerTag => {
      if (!processedTags.has(taggerTag.en.toLowerCase())) {
        fusedTags.push({ ...taggerTag, fusion_method: 'tagger_only' });
      }
    });
    
    // Step 3: Apply fusion mode preferences
    const finalTags = App.applyFusionModeFiltering(fusedTags, fusionMode);
    
    console.log(`✅ Fusion complete: ${finalTags.length} final tags`);
    return finalTags;
  },

  // Helper: Check if two tags are semantically equal
  areTagsSemanticallyEqual: (tag1, tag2) => {
    const normalize = (tag) => tag.toLowerCase().replace(/[-_\s]/g, '');
    const norm1 = normalize(tag1);
    const norm2 = normalize(tag2);
    
    // Direct match
    if (norm1 === norm2) return true;
    
    // Common variations
    const variations = {
      '1girl': ['one_girl', 'single_girl', 'girl'],
      'longhair': ['long_hair'],
      'blueeyes': ['blue_eyes'],
      'whitehair': ['white_hair', 'silver_hair'],
      // Add more semantic mappings as needed
    };
    
    for (const [canonical, variants] of Object.entries(variations)) {
      if ((norm1 === canonical && variants.includes(norm2)) ||
          (norm2 === canonical && variants.includes(norm1))) {
        return true;
      }
    }
    
    return false;
  },

  // Apply fusion mode specific filtering and weighting
  applyFusionModeFiltering: (tags, fusionMode) => {
    switch (fusionMode) {
      case 'tagger_focused':
        return tags
          .map(tag => {
            if (tag.source === 'tagger' || tag.tagger_confidence) {
              tag.weight = tag.weight * 1.3; // Boost tagger tags
            }
            return tag;
          })
          .sort((a, b) => (b.tagger_confidence || 0) - (a.tagger_confidence || 0));
          
      case 'llm_focused':
        return tags
          .map(tag => {
            if (tag.source === 'llm' || tag.llm_confidence) {
              tag.weight = tag.weight * 1.3; // Boost LLM tags
            }
            return tag;
          })
          .sort((a, b) => (b.llm_confidence || 0) - (a.llm_confidence || 0));
          
      case 'maximum_coverage':
        return tags; // Keep all tags
        
      default: // 'balanced'
        return tags
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 50); // Limit to top 50 tags for balanced mode
    }
  },

  // Enhanced Multi-Engine Analysis: Image Analysis → Tag Generation
  generateImageTagsFromAI: async () => {
    // 画像がアップロードされているか確認
    if (!App.imageState.imageData) {
      showNotification('画像をアップロードしてください', 'error');
      return;
    }
    
    console.log('🎯 Starting Multi-Engine Analysis...');
    console.log('📊 System status:');
    console.log('  - OpenRouter:', appState.apiKey ? '✅' : '❌');
    console.log('  - Replicate:', appState.replicateApiKey ? '✅' : '❌');
    console.log('🤖 Selected analysis engines:', appState.selectedAnalysisEngines);
    console.log('🏷️ Selected tagging engine:', appState.selectedTaggingEngine);
    
    if (!appState.selectedAnalysisEngines || appState.selectedAnalysisEngines.length === 0) {
      showNotification('❌ 少なくとも1つの画像解析エンジンを選択してください。', 'error');
      return;
    }

    if (!appState.selectedTaggingEngine) {
      showNotification('❌ タグ生成エンジンを選択してください。', 'error');
      return;
    }

    const generateBtn = document.getElementById('image-ai-generate-btn');
    
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>マルチエンジン解析中...';
    }

    try {
      const startTime = performance.now();
      
      // 🔍 STEP 1: Image Analysis with selected engines
      showLoading('🔬 画像解析を開始しています...');
      
      console.log('🔄 Starting multi-engine image analysis...');
      
      const analysisResults = {};
      const analysisPromises = [];
      
      // Execute analysis engines in parallel
      for (const engine of appState.selectedAnalysisEngines) {
        console.log(`🚀 Starting ${engine} analysis...`);
        analysisPromises.push(
          App.runAnalysisEngine(engine, App.imageState.imageData)
            .then(result => ({ engine, result }))
            .catch(error => ({ engine, error }))
        );
      }
      
      // Wait for all analysis engines to complete
      const analysisResultsArray = await Promise.allSettled(analysisPromises);
      
      // Process analysis results
      for (const promiseResult of analysisResultsArray) {
        if (promiseResult.status === 'fulfilled' && promiseResult.value.result) {
          const { engine, result } = promiseResult.value;
          analysisResults[engine] = result;
          console.log(`✅ ${engine} analysis completed:`, typeof result === 'string' ? result.slice(0, 100) + '...' : result);
          
          // Display individual analysis result
          App.displayEngineResult(engine, result, 'success');
        } else if (promiseResult.status === 'fulfilled' && promiseResult.value.error) {
          const { engine, error } = promiseResult.value;
          console.error(`❌ ${engine} analysis failed:`, error);
          App.displayEngineResult(engine, `Error: ${error.message || error}`, 'error');
        }
      }
      
      // Check if we have any successful analysis results
      const successfulAnalyses = Object.keys(analysisResults);
      if (successfulAnalyses.length === 0) {
        throw new Error('すべての解析エンジンが失敗しました');
      }
      
      console.log(`✅ Analysis completed with ${successfulAnalyses.length} successful results`);
      
      // 🏷️ STEP 2: Tag Generation using selected tagging engine
      showLoading('🏷️ タグ生成中...');
      
      // Combine all analysis results into a comprehensive description
      const combinedAnalysis = successfulAnalyses
        .map(engine => `${engine.toUpperCase()} Analysis:\n${analysisResults[engine]}`)
        .join('\n\n');
      
      console.log('🔄 Starting tag generation with combined analysis...');
      const generatedTags = await App.runTaggingEngine(appState.selectedTaggingEngine, combinedAnalysis);
      
      if (generatedTags && generatedTags.length > 0) {
        console.log('✅ Tag generation completed:', generatedTags);
        
        // Add generated tags to the current tag set
        for (const tag of generatedTags) {
          App.addImageTag(tag);
        }
        
        // Update displays
        App.renderImageTags();
        App.updateImagePromptOutput();
        
        const endTime = performance.now();
        const totalTime = Math.round(endTime - startTime);
        
        showNotification(`🎉 マルチエンジン解析完了！解析: ${successfulAnalyses.length}エンジン, タグ: ${generatedTags.length}個 (${totalTime}ms)`, 'success');
      } else {
        throw new Error('タグ生成に失敗しました');
      }
    } catch (error) {
      console.error('🚨 Multi-engine analysis error:', error);
      showNotification(`❌ 解析エラー: ${error.message}`, 'error');
    } finally {
      // Always restore the generate button
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-sparkles mr-2"></i>AI Generate';
      }
      hideLoading();
    }
  },

  // 🚀 New Multi-Engine Helper Functions

  // Initialize analysis and tagging engine settings
  initializeEngineSettings: () => {
    // Initialize analysis engines (for image analysis)
    if (!appState.selectedAnalysisEngines || !Array.isArray(appState.selectedAnalysisEngines)) {
      appState.selectedAnalysisEngines = []; // Default: no engines selected
    }
    
    // Initialize tagging engine (for converting analysis to tags)
    if (!appState.selectedTaggingEngine) {
      appState.selectedTaggingEngine = 'deepseek'; // Default: DeepSeek
    }
    
    // Initialize multi-analysis results storage
    if (!App.imageState.multiAnalysisResults) {
      App.imageState.multiAnalysisResults = {};
    }
    
    // Set up UI checkboxes based on saved settings
    setTimeout(() => {
      const wdCheckbox = document.getElementById('analysis-engine-wd-eva02');
      const janusCheckbox = document.getElementById('analysis-engine-janus');
      const deepseekRadio = document.getElementById('tagging-engine-deepseek');
      const llmRadio = document.getElementById('tagging-engine-llm');
      
      if (wdCheckbox) {
        wdCheckbox.checked = appState.selectedAnalysisEngines.includes('wd-eva02-large-tagger-v3');
      }
      if (janusCheckbox) {
        janusCheckbox.checked = appState.selectedAnalysisEngines.includes('janus-pro-7b');
      }
      if (deepseekRadio) {
        deepseekRadio.checked = appState.selectedTaggingEngine === 'deepseek';
      }
      if (llmRadio) {
        llmRadio.checked = appState.selectedTaggingEngine === 'llm';
      }
      
      // Update counter
      const counter = document.getElementById('analysis-engine-count');
      if (counter) {
        counter.textContent = `(${appState.selectedAnalysisEngines.length} selected)`;
      }
    }, 100);
    
    console.log('🚀 Engine settings initialized:', {
      analysis: appState.selectedAnalysisEngines,
      tagging: appState.selectedTaggingEngine
    });
  },

  // Update analysis engines selection
  updateAnalysisEngines: () => {
    const engines = [];
    
    // Check WD-EVA02
    if (document.getElementById('analysis-engine-wd-eva02')?.checked) {
      engines.push('wd-eva02-large-tagger-v3');
    }
    
    // Check Janus Pro 7B
    if (document.getElementById('analysis-engine-janus')?.checked) {
      engines.push('janus-pro-7b');
    }
    
    appState.selectedAnalysisEngines = engines;
    
    // Save to localStorage
    localStorage.setItem('selected-analysis-engines', JSON.stringify(engines));
    
    // Update UI counter
    const counter = document.getElementById('analysis-engine-count');
    if (counter) {
      counter.textContent = `(${engines.length} selected)`;
    }
    
    console.log('🔄 Updated analysis engines:', engines);
  },

  // Update tagging engine selection
  updateTaggingEngine: () => {
    const deepseek = document.getElementById('tagging-engine-deepseek');
    const llm = document.getElementById('tagging-engine-llm');
    
    if (deepseek?.checked) {
      appState.selectedTaggingEngine = 'deepseek';
    } else if (llm?.checked) {
      appState.selectedTaggingEngine = 'llm';
    }
    
    // Save to localStorage
    localStorage.setItem('selected-tagging-engine', appState.selectedTaggingEngine);
    
    console.log('🔄 Updated tagging engine:', appState.selectedTaggingEngine);
  },

  // Run individual analysis engine
  runAnalysisEngine: async (engine, imageData) => {
    console.log(`🚀 Running ${engine} analysis...`);
    
    switch (engine) {
      case 'wd-eva02':
        return await App.runWDEVA02Analysis(imageData);
      
      case 'janus':
        return await App.runJanusAnalysis(imageData);
      
      default:
        throw new Error(`Unknown analysis engine: ${engine}`);
    }
  },

  // Run WD-EVA02 analysis
  runWDEVA02Analysis: async (imageData) => {
    if (!appState.replicateApiKey) {
      throw new Error('Replicate API key is required for WD-EVA02 analysis');
    }
    
    const response = await fetch('/api/multi-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: appState.replicateApiKey,
        engines: ['wd-eva02-large-tagger-v3'],
        imageData: imageData,
        threshold: appState.taggerThreshold || 0.35
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `WD-EVA02 API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.results['wd-eva02-large-tagger-v3']) {
      const wdResult = result.results['wd-eva02-large-tagger-v3'];
      if (wdResult.success) {
        return wdResult.output || 'No WD-EVA02 result available';
      } else {
        throw new Error(wdResult.error || 'WD-EVA02 analysis failed');
      }
    } else {
      throw new Error('No WD-EVA02 result in response');
    }
  },

  // Run Janus Pro 7B analysis  
  runJanusAnalysis: async (imageData) => {
    if (!appState.replicateApiKey) {
      throw new Error('Replicate API key is required for Janus analysis');
    }
    
    const response = await fetch('/api/multi-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: appState.replicateApiKey,
        engines: ['janus-pro-7b'],
        imageData: imageData,
        analysisPrompt: appState.analysisPrompt || 'Analyze this image and describe what you see in detail, including objects, people, settings, colors, and artistic style.'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Janus API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.results['janus-pro-7b']) {
      const janusResult = result.results['janus-pro-7b'];
      if (janusResult.success) {
        return janusResult.output || 'No Janus result available';
      } else {
        throw new Error(janusResult.error || 'Janus analysis failed');
      }
    } else {
      throw new Error('No Janus result in response');
    }
  },

  // Run tagging engine to convert analysis results to tags
  runTaggingEngine: async (engine, analysisText) => {
    console.log(`🏷️ Running ${engine} tagging engine...`);
    
    switch (engine) {
      case 'deepseek':
        return await App.runDeepSeekTagging(analysisText);
      
      case 'llm':
        return await App.runLLMTagging(analysisText);
      
      default:
        throw new Error(`Unknown tagging engine: ${engine}`);
    }
  },

  // Run DeepSeek tagging (convert analysis to tags)
  runDeepSeekTagging: async (analysisText) => {
    if (!appState.apiKey) {
      throw new Error('OpenRouter API key is required for DeepSeek tagging');
    }
    
    const taggingPrompt = `以下の画像解析結果を読んで、適切なタグを生成してください。
    
解析結果:
${analysisText}

以下の形式でタグを生成してください：
- 1つのタグは1-3単語
- 具体的で有用なタグ
- 15-25個のタグ
- カンマ区切り
- 例: "anime girl, blue hair, school uniform, outdoor, cherry blossoms"

タグ:`;
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: appState.apiKey,
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'user', content: taggingPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `DeepSeek tagging error: ${response.status}`);
    }
    
    const result = await response.json();
    const tagsText = result.content || '';
    
    // Parse tags from response
    const tags = tagsText
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 25); // Limit to 25 tags
    
    return tags;
  },

  // Run LLM tagging (direct image to tags)
  runLLMTagging: async (analysisText) => {
    if (!appState.apiKey) {
      throw new Error('OpenRouter API key is required for LLM tagging');
    }
    
    const taggingPrompt = `Convert the following image analysis into concise tags suitable for image generation:

Analysis:
${analysisText}

Generate 15-25 specific, useful tags in this format:
- One tag per concept (1-3 words each)
- Focus on visual elements
- Include style, subjects, environment, mood
- Comma separated
- Example: "anime style, blonde hair, school uniform, happy expression, cherry blossoms, outdoor"

Tags:`;
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: appState.apiKey,
        model: appState.chatModel,
        messages: [
          { role: 'user', content: taggingPrompt }
        ],
        temperature: 0.3,
        max_tokens: 400
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `LLM tagging error: ${response.status}`);
    }
    
    const result = await response.json();
    const tagsText = result.content || '';
    
    // Parse tags from response
    const tags = tagsText
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 25); // Limit to 25 tags
    
    return tags;
  },
  
  // 画像解析用システムプロンプトを取得
  getImageAnalysisSystemPrompt: () => {
    // ローカルストレージから取得するか、デフォルトを使用
    const savedPrompt = localStorage.getItem('image-analysis-prompt');
    if (savedPrompt) return savedPrompt;
    
    return `あなたは画像分析の専門家です。提供された画像を詳細に分析し、以下の要素を抽出してください：

1. 主要な被写体（人物、動物、オブジェクト）
   - 外見的特徴（髪色、目の色、表情など）
   - 服装やアクセサリー
   - ポーズや動作

2. 背景と環境
   - 場所（屋内/屋外、具体的な場所）
   - 時間帯や天候
   - 雰囲気や照明

3. 構図とスタイル
   - カメラアングル
   - 色彩やトーン
   - アートスタイル（写実的、アニメ調など）

4. 品質関連の特徴
   - 画像の精細さ
   - 特筆すべき技術的要素

各要素を具体的かつ簡潔に記述してください。`;
  },
  
  // タグ生成用システムプロンプトを取得
  getTagGenerationSystemPrompt: () => {
    // AI Format用のシステムプロンプトを取得（カスタマイズ可能）
    const formatName = App.imageState.imageOutputFormat || 'sdxl';
    const savedPrompt = localStorage.getItem(`sp-image-format-${formatName}`);
    
    if (savedPrompt) return savedPrompt;
    
    // デフォルトのタグ生成プロンプト
    return `あなたはタグ正規化と日英対訳の専門家です。

入力: 画像分析のテキスト
出力: 以下の正確なJSON形式のみ返してください。必ず英語タグと日本語タグの両方を含めてください：

{
  "pairs": [
    {
      "en": "masterpiece",
      "ja": "傑作",
      "weight": 1.2,
      "category": "quality"
    },
    {
      "en": "1girl",
      "ja": "1人の女の子",
      "weight": 1.0,
      "category": "person"
    },
    {
      "en": "long hair",
      "ja": "長い髪",
      "weight": 1.0,
      "category": "appearance"
    }
  ]
}

重要：
- 必ずenとjaの両方のフィールドを含めること
- 日本語タグは自然でわかりやすい表現にすること
- weightは0.1-2.0の範囲で設定
- categoryは person, appearance, clothing, pose, background, quality, style, other から選択
- JSON形式以外は一切出力しないこと

ルール:
- 英語タグ: snake_case または単語の組み合わせ
- 日本語タグ: クリエイターが実際に使う自然な表現
- 英日は1対1の意味対応を保つ（自由な意訳は避ける）
- weight: 通常1.0、重要な要素1.2-1.5、補助的要素0.8-0.9
- カテゴリマッピング:
  * person: 1girl, woman, child など人物
  * appearance: eyes, hair, smile など外見
  * clothes: dress, uniform, hoodie など服装
  * pose: sitting, standing, running などポーズ
  * background: forest, city, outdoor など背景
  * quality: masterpiece, detailed, 8k など品質
  * style: anime, realistic, painting などスタイル
  * other: その他
- マークダウンや説明文は含めない、JSONオブジェクトのみ出力`;
  },

  // Update image prompt output based on current tags
  updateImagePromptOutput: () => {
    const promptTextarea = document.getElementById('image-generated-prompt');
    const finalOutput = document.getElementById('image-final-output');
    
    if (!promptTextarea && !finalOutput) return;
    
    // Format tags based on current format selection
    const format = App.imageState.imageFinalFormat || 'sdxl';
    let output = '';
    
    if (App.imageState.imageTags.length > 0) {
      if (format === 'sdxl') {
        output = App.imageState.imageTags.map(tag => {
          if (tag.weight !== 1.0) {
            return `${tag.en}:${tag.weight.toFixed(1)}`;
          }
          return tag.en;
        }).join(', ');
      } else if (format === 'flux') {
        output = App.imageState.imageTags.map(tag => {
          const weightedText = tag.weight > 1.2 ? `highly ${tag.en}` : 
                              tag.weight < 0.8 ? `slightly ${tag.en}` : tag.en;
          return weightedText;
        }).join(', ');
        if (output) {
          output = output.charAt(0).toUpperCase() + output.slice(1) + '.';
        }
      } else {
        // Custom or other formats
        output = App.imageState.imageTags.map(tag => tag.en).join(', ');
      }
    }
    
    if (promptTextarea) {
      promptTextarea.value = output;
    }
    if (finalOutput) {
      finalOutput.value = output;
    }
  },
  
  // Render image tags (use common system)
  renderImageTags: () => {
    TagEditor.renderTags('image');
    return; // Old code below is replaced by TagEditor system
    const enContainer = document.getElementById('image-tags-en');
    const jaContainer = document.getElementById('image-tags-ja');
    
    if (!enContainer || !jaContainer) return;
    
    enContainer.innerHTML = '';
    jaContainer.innerHTML = '';
    
    // Category colors (same as main editor)
    const categoryColors = {
      person: 'bg-yellow-50 border-yellow-300',
      appearance: 'bg-pink-50 border-pink-300',
      clothes: 'bg-purple-50 border-purple-300',
      pose: 'bg-indigo-50 border-indigo-300',
      background: 'bg-green-50 border-green-300',
      quality: 'bg-blue-50 border-blue-300',
      style: 'bg-orange-50 border-orange-300',
      other: 'bg-gray-50 border-gray-300'
    };
    
    App.imageState.imageTags.forEach((tag, index) => {
      const colorClass = categoryColors[tag.category] || categoryColors.other;
      
      // Create tag card for English
      const enTagCard = document.createElement('div');
      enTagCard.className = `tag-card ${colorClass} border rounded-lg p-2 hover:shadow-md transition-all`;
      enTagCard.innerHTML = `
        <div class="flex items-center gap-2">
          <button onclick="App.moveImageTag(${index}, -1)" 
                  class="px-1 py-0.5 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded transition-colors"
                  title="Move up">
            <i class="fas fa-chevron-up text-xs"></i>
          </button>
          <button onclick="App.moveImageTag(${index}, 1)" 
                  class="px-1 py-0.5 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded transition-colors"
                  title="Move down">
            <i class="fas fa-chevron-down text-xs"></i>
          </button>
          <input type="text" value="${tag.en}" 
                 class="flex-1 px-2 py-1 text-sm bg-white/70 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                 onchange="App.updateImageTagText(${index}, 'en', this.value)"
                 placeholder="English tag">
          <div class="flex items-center gap-1">
            <button onclick="App.decreaseImageWeight(${index})" 
                    class="px-1 py-0.5 text-gray-600 hover:bg-white/50 rounded transition-colors">
              <i class="fas fa-minus text-xs"></i>
            </button>
            <input type="number" value="${tag.weight}" min="0.1" max="2.0" step="0.05" 
                   class="w-14 px-1 py-0.5 text-xs text-center border rounded"
                   onchange="App.updateImageTagWeight(${index}, this.value)">
            <button onclick="App.increaseImageWeight(${index})" 
                    class="px-1 py-0.5 text-gray-600 hover:bg-white/50 rounded transition-colors">
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
          <button onclick="App.removeImageTag(${index})" 
                  class="px-1.5 py-0.5 text-red-600 hover:bg-red-100 rounded transition-colors">
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>
      `;
      enContainer.appendChild(enTagCard);
      
      // Create tag card for Japanese
      const jaTagCard = document.createElement('div');
      jaTagCard.className = `tag-card ${colorClass} border rounded-lg p-2 hover:shadow-md transition-all`;
      jaTagCard.innerHTML = `
        <div class="flex items-center gap-2">
          <button onclick="App.moveImageTag(${index}, -1)" 
                  class="px-1 py-0.5 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded transition-colors"
                  title="上へ移動">
            <i class="fas fa-chevron-up text-xs"></i>
          </button>
          <button onclick="App.moveImageTag(${index}, 1)" 
                  class="px-1 py-0.5 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded transition-colors"
                  title="下へ移動">
            <i class="fas fa-chevron-down text-xs"></i>
          </button>
          <input type="text" value="${tag.ja}" 
                 class="flex-1 px-2 py-1 text-sm bg-white/70 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                 onchange="App.updateImageTagText(${index}, 'ja', this.value)"
                 placeholder="日本語タグ">
          <div class="flex items-center gap-1">
            <button onclick="App.decreaseImageWeight(${index})" 
                    class="px-1 py-0.5 text-gray-600 hover:bg-white/50 rounded transition-colors">
              <i class="fas fa-minus text-xs"></i>
            </button>
            <input type="number" value="${tag.weight}" min="0.1" max="2.0" step="0.05" 
                   class="w-14 px-1 py-0.5 text-xs text-center border rounded"
                   onchange="App.updateImageTagWeight(${index}, this.value)">
            <button onclick="App.increaseImageWeight(${index})" 
                    class="px-1 py-0.5 text-gray-600 hover:bg-white/50 rounded transition-colors">
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
          <button onclick="App.removeImageTag(${index})" 
                  class="px-1.5 py-0.5 text-red-600 hover:bg-red-100 rounded transition-colors">
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>
      `;
      jaContainer.appendChild(jaTagCard);
    });
    
    // Update final output
    App.updateImageFinalOutput();
  },
  
  // Update image tag weight
  updateImageTagWeight: (index, weight) => {
    if (App.imageState.imageTags[index]) {
      App.imageState.imageTags[index].weight = parseFloat(weight);
      App.updateImagePromptOutput();
      App.updateImageFinalOutput();
    }
  },
  
  // Increase image weight
  increaseImageWeight: (index) => {
    if (App.imageState.imageTags[index]) {
      const currentWeight = App.imageState.imageTags[index].weight;
      const newWeight = Math.min(2.0, currentWeight + 0.05);
      App.imageState.imageTags[index].weight = Math.round(newWeight * 100) / 100;
      TagEditor.renderTags('image')();
    }
  },
  
  // Decrease image weight
  decreaseImageWeight: (index) => {
    if (App.imageState.imageTags[index]) {
      const currentWeight = App.imageState.imageTags[index].weight;
      const newWeight = Math.max(0.1, currentWeight - 0.05);
      App.imageState.imageTags[index].weight = Math.round(newWeight * 100) / 100;
      TagEditor.renderTags('image')();
    }
  },
  
  // Update image tag text
  updateImageTagText: (index, lang, text) => {
    if (App.imageState.imageTags[index]) {
      App.imageState.imageTags[index][lang] = text;
      // Auto-translate if needed
      if (lang === 'en') {
        App.imageState.imageTags[index].ja = translationDict[text.toLowerCase()] || App.simpleTranslate(text);
      } else {
        App.imageState.imageTags[index].en = App.reverseTranslate(text);
      }
      TagEditor.renderTags('image')();
    }
  },
  
  // Move image tag
  moveImageTag: (index, direction) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < App.imageState.imageTags.length) {
      const temp = App.imageState.imageTags[index];
      App.imageState.imageTags[index] = App.imageState.imageTags[newIndex];
      App.imageState.imageTags[newIndex] = temp;
      TagEditor.renderTags('image');
    }
  },
  
  // Remove image tag
  removeImageTag: (index) => {
    App.imageState.imageTags.splice(index, 1);
    TagEditor.renderTags('image');
  },
  
  // Sort image tags
  sortImageTags: (by) => {
    if (by === 'category') {
      App.imageState.imageTags.sort((a, b) => {
        const categoryOrder = ['person', 'appearance', 'clothes', 'clothing', 'pose', 'background', 'quality', 'style', 'other'];
        return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      });
    } else if (by === 'weight') {
      App.imageState.imageTags.sort((a, b) => b.weight - a.weight);
    }
    TagEditor.renderTags('image');
  },
  
  // Add new image tag (same mechanism as Text to Prompt)
  addNewImageTag: async (lang) => {
    const input = document.getElementById(`new-image-tag-${lang}`);
    if (!input || !input.value.trim()) return;
    
    const text = input.value.trim();
    showLoading('Adding and translating tag...');
    
    const newTag = {
      id: `img-tag-${Date.now()}`,
      en: '',
      ja: '',
      weight: 1.0,
      category: 'other'
    };
    
    if (lang === 'en') {
      newTag.en = text;
      newTag.ja = await translateWithAI(text, 'ja');
      newTag.category = categorizeTag(text);
    } else {
      newTag.ja = text;
      // Same translation mechanism as Text to Prompt
      if (appState.apiKey) {
        newTag.en = await translateWithAI(text, 'en');
      } else {
        newTag.en = translateToEnglish(text);
      }
      newTag.category = categorizeTag(newTag.en);
    }
    
    App.imageState.imageTags.push(newTag);
    input.value = '';
    hideLoading();
    TagEditor.renderTags('image');
  },
  
  // Update image prompt output (AI Format Prompt area)
  updateImagePromptOutput: () => {
    const promptTextarea = document.getElementById('image-generated-prompt');
    if (!promptTextarea) return;
    
    let output = '';
    
    if (App.imageState.imageOutputFormat === 'sdxl') {
      // SDXL format with weights
      output = App.imageState.imageTags.map(tag => {
        if (tag.weight !== 1.0) {
          return `${tag.en}:${tag.weight}`;
        }
        return tag.en;
      }).join(', ');
    } else if (App.imageState.imageOutputFormat === 'flux' || App.imageState.imageOutputFormat === 'natural') {
      // Natural language format
      output = App.imageState.imageTags.map(tag => tag.en).join('. ');
      if (output && !output.endsWith('.')) output += '.';
    } else {
      // ImageFX or other formats
      output = App.imageState.imageTags.map(tag => tag.en).join(', ');
    }
    
    promptTextarea.value = output;
    
    // Also update final output
    App.updateImageFinalOutput();
  },
  
  // Update image final output
  updateImageFinalOutput: () => {
    const finalTextarea = document.getElementById('image-final-output');
    if (!finalTextarea) return;
    
    const formatSelect = document.getElementById('image-final-output-format');
    const format = formatSelect ? formatSelect.value : 'sdxl';
    
    let output = '';
    
    if (format === 'sdxl') {
      // SDXL format with weights
      output = App.imageState.imageTags.map(tag => {
        if (tag.weight !== 1.0) {
          return `${tag.en}:${tag.weight}`;
        }
        return tag.en;
      }).join(', ');
    } else if (format === 'flux') {
      // Flux natural language format
      output = App.imageState.imageTags.map(tag => {
        const weightedText = tag.weight > 1.2 ? `highly ${tag.en}` : 
                            tag.weight < 0.8 ? `slightly ${tag.en}` : tag.en;
        return weightedText;
      }).join(', ');
      output = output.charAt(0).toUpperCase() + output.slice(1) + '.';
    } else if (format === 'imagefx') {
      // ImageFX command format
      output = App.imageState.imageTags.map(tag => tag.en).join(' ');
    } else if (format === 'imagefx-natural') {
      // ImageFX natural language
      output = App.imageState.imageTags.map(tag => tag.en).join(', ');
      output = `Create an image of ${output}`;
    }
    
    finalTextarea.value = output;
  },
  
  // Update image final format
  updateImageFinalFormat: () => {
    const select = document.getElementById('image-final-output-format');
    if (select) {
      App.imageState.imageFinalFormat = select.value;
      localStorage.setItem('image-final-output-format', select.value);
      TagEditor.updateOutput('image');
    }
  },
  
  // Copy image final output
  copyImageFinalOutput: () => {
    const textarea = document.getElementById('image-final-output');
    if (textarea && textarea.value) {
      navigator.clipboard.writeText(textarea.value);
      showNotification('Final output copied to clipboard', 'success');
    }
  },
  
  // Download image output
  downloadImageOutput: () => {
    const textarea = document.getElementById('image-final-output');
    if (!textarea || !textarea.value) {
      showNotification('No output to download', 'error');
      return;
    }
    
    const blob = new Blob([textarea.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-prompt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Output downloaded', 'success');
  },
  
  // Send image prompt to main editor
  sendImageToMainEditor: () => {
    const promptTextarea = document.getElementById('image-generated-prompt');
    if (!promptTextarea || !promptTextarea.value) {
      showNotification('No prompt to send', 'error');
      return;
    }
    
    // Switch to Text tab
    App.setTab('text');
    
    // Put prompt in input textarea
    const inputTextarea = document.getElementById('input-text');
    if (inputTextarea) {
      inputTextarea.value = promptTextarea.value;
      
      // Copy tags to main editor
      appState.tags = App.imageState.imageTags.map(tag => ({...tag}));
      
      // Update main tag editor
      App.updateTagDisplay();
      App.updateOutput();
      
      showNotification('Prompt sent to Main Editor', 'success');
    }
  },
  
  // Translate image tags
  translateImageTags: async (direction) => {
    // Similar to main translateAll but for image tags
    showNotification('Translating tags...', 'info');
    
    App.imageState.imageTags.forEach(tag => {
      if (direction === 'en-to-ja') {
        tag.ja = translationDict[tag.en.toLowerCase()] || App.simpleTranslate(tag.en);
      } else {
        tag.en = App.reverseTranslate(tag.ja);
      }
    });
    
    TagEditor.renderTags('image');
    showNotification('Translation complete', 'success');
  },
  
  // Simple translate helper
  simpleTranslate: (text) => {
    // Basic translation or return original
    const translated = translationDict[text.toLowerCase()];
    return translated || text + ' (翻訳)';
  },
  
  // Reverse translate helper
  reverseTranslate: (text) => {
    // Find English equivalent
    for (const [en, ja] of Object.entries(translationDict)) {
      if (ja === text) return en;
    }
    return text.replace(' (翻訳)', '');
  },
  
  // Show image prompt editor modal
  showImagePromptEditor: () => {
    const currentFormat = App.imageState.imageOutputFormat;
    const systemPrompts = App.getImageFormatSystemPrompts();
    const currentPrompt = systemPrompts[currentFormat];
    
    if (!currentPrompt) {
      showNotification('No system prompt found for current format', 'error');
      return;
    }
    
    const isCustomFormat = currentFormat in App.imageState.customFormats;
    const title = isCustomFormat ? 
      `Edit Custom Format: ${currentFormat}` : 
      `Edit System Prompt: ${currentFormat.toUpperCase()}`;
    
    // Create modal HTML
    const modalHTML = `
      <div id="prompt-editor-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-800">${title}</h2>
            <button onclick="App.closePromptEditor()" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
            <textarea id="prompt-editor-textarea" 
                      class="w-full h-64 p-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter system prompt...">${currentPrompt}</textarea>
          </div>
          
          <div class="flex justify-between">
            <div>
              ${!isCustomFormat ? `
                <button onclick="App.resetImagePromptToDefault()" 
                        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2">
                  Reset to Default
                </button>
              ` : `
                <button onclick="App.deleteImageCustomFormat('${currentFormat}')" 
                        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2">
                  Delete Format
                </button>
              `}
            </div>
            <div>
              <button onclick="App.closePromptEditor()" 
                      class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mr-2">
                Cancel
              </button>
              <button onclick="App.saveImagePromptEdit()" 
                      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Close prompt editor modal
  closePromptEditor: () => {
    const modal = document.getElementById('prompt-editor-modal');
    if (modal) {
      modal.remove();
    }
  },

  // Save image prompt edit
  saveImagePromptEdit: () => {
    const textarea = document.getElementById('prompt-editor-textarea');
    const currentFormat = App.imageState.imageOutputFormat;
    
    if (!textarea || !textarea.value.trim()) {
      showNotification('Please enter a system prompt', 'error');
      return;
    }
    
    const newPrompt = textarea.value.trim();
    
    // Save to appropriate storage
    if (currentFormat in App.imageState.customFormats) {
      // Update custom format
      App.imageState.customFormats[currentFormat] = newPrompt;
      localStorage.setItem('image-custom-formats', JSON.stringify(App.imageState.customFormats));
      showNotification(`Custom format "${currentFormat}" updated`, 'success');
    } else {
      // Save default format override (could be implemented later)
      showNotification('Default format prompts cannot be permanently modified', 'info');
    }
    
    App.closePromptEditor();
  },

  // Reset image prompt to default
  resetImagePromptToDefault: () => {
    const currentFormat = App.imageState.imageOutputFormat;
    const defaultPrompts = App.getFormatSystemPrompts();
    const defaultPrompt = defaultPrompts[currentFormat];
    
    if (defaultPrompt) {
      const textarea = document.getElementById('prompt-editor-textarea');
      if (textarea) {
        textarea.value = defaultPrompt;
        showNotification('Reset to default prompt', 'info');
      }
    }
  },

  // Delete image custom format
  deleteImageCustomFormat: (formatName) => {
    if (confirm(`Are you sure you want to delete the custom format "${formatName}"?`)) {
      delete App.imageState.customFormats[formatName];
      localStorage.setItem('image-custom-formats', JSON.stringify(App.imageState.customFormats));
      
      // If currently selected format is deleted, switch to SDXL
      if (App.imageState.imageOutputFormat === formatName) {
        App.imageState.imageOutputFormat = 'sdxl';
        App.imageState.imageFinalFormat = 'sdxl';
      }
      
      App.updateImageFormatDropdowns();
      App.closePromptEditor();
      
      showNotification(`Custom format "${formatName}" deleted`, 'success');
    }
  },
  
  // Add custom format for image
  addImageCustomFormat: () => {
    const formatName = prompt('Enter custom format name (lowercase letters and hyphens only):');
    if (!formatName) return;
    
    const validName = /^[a-z-]+$/.test(formatName);
    if (!validName) {
      showNotification('Format name must contain only lowercase letters and hyphens', 'error');
      return;
    }
    
    if (formatName in App.getImageFormatSystemPrompts() || formatName in App.imageState.customFormats) {
      showNotification('Format name already exists', 'error');
      return;
    }
    
    const systemPrompt = prompt('Enter system prompt for this format:', 
      'Convert the image analysis into your custom format. Rules:\n1. Add your specific formatting rules\n2. Output only the formatted result, no explanations');
    
    if (!systemPrompt) return;
    
    App.imageState.customFormats[formatName] = systemPrompt;
    localStorage.setItem('image-custom-formats', JSON.stringify(App.imageState.customFormats));
    
    // Update format dropdowns
    App.updateImageFormatDropdowns();
    
    showNotification(`Custom format "${formatName}" added for Image to Prompt`, 'success');
  },

  // Get image format system prompts (default + custom)
  getImageFormatSystemPrompts: () => {
    const defaultPrompts = App.getFormatSystemPrompts();
    return { ...defaultPrompts, ...App.imageState.customFormats };
  },

  // Update image format dropdowns
  updateImageFormatDropdowns: () => {
    const outputFormatSelect = document.getElementById('image-output-format');
    const finalFormatSelect = document.getElementById('image-final-output-format');
    
    if (outputFormatSelect) {
      // Clear existing options
      outputFormatSelect.innerHTML = '';
      
      // Add default formats
      const defaultFormats = [
        { value: 'sdxl', label: 'SDXL Tags' },
        { value: 'flux', label: 'Flux Phrases' },
        { value: 'imagefx', label: 'ImageFX Commands' },
        { value: 'natural', label: 'Natural Language' }
      ];
      
      defaultFormats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.value;
        option.textContent = format.label;
        outputFormatSelect.appendChild(option);
      });
      
      // Add custom formats
      Object.keys(App.imageState.customFormats).forEach(formatName => {
        const option = document.createElement('option');
        option.value = formatName;
        option.textContent = formatName.charAt(0).toUpperCase() + formatName.slice(1).replace(/-/g, ' ');
        outputFormatSelect.appendChild(option);
      });
      
      // Restore selected value
      outputFormatSelect.value = App.imageState.imageOutputFormat;
    }
    
    if (finalFormatSelect) {
      // Update final format dropdown similarly
      finalFormatSelect.innerHTML = '';
      
      const defaultFormats = [
        { value: 'sdxl', label: 'SDXL Tags' },
        { value: 'flux', label: 'Flux Phrases' },
        { value: 'imagefx', label: 'ImageFX' },
        { value: 'imagefx-natural', label: 'ImageFX Natural' }
      ];
      
      defaultFormats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.value;
        option.textContent = format.label;
        finalFormatSelect.appendChild(option);
      });
      
      Object.keys(App.imageState.customFormats).forEach(formatName => {
        const option = document.createElement('option');
        option.value = formatName;
        option.textContent = formatName.charAt(0).toUpperCase() + formatName.slice(1).replace(/-/g, ' ');
        finalFormatSelect.appendChild(option);
      });
      
      finalFormatSelect.value = App.imageState.imageFinalFormat;
    }
  },
  
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
    segments.forEach((segment, index) => {
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
      
      // Categorize using common function
      const category = App.categorizeTag(text);
      
      // Add tag
      App.imageState.imageTags.push({
        id: `img-tag-${Date.now()}-${index}`,
        en: text,
        ja: jaText,
        weight: weight,
        category: category
      });
    });
    
    // Render tags using TagEditor
    TagEditor.renderTags('image');
    showNotification(`Split into ${App.imageState.imageTags.length} tags`, 'success');
  },
  
  // Clear image tags
  clearImageTags: () => {
    App.imageState.imageTags = [];
    TagEditor.renderTags('image');
    showNotification('Tags cleared', 'info');
  },
  
  // Common categorize tag function
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
});

// Initialize Image to Prompt on load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize with sample tags for demonstration
  if (appState.tags.length === 0) {
    appState.tags = [
      { id: 1, en: 'masterpiece', ja: '傑作', weight: 1.2, category: 'quality' },
      { id: 2, en: 'best quality', ja: '最高品質', weight: 1.1, category: 'quality' },
      { id: 3, en: '1girl', ja: '1人の女の子', weight: 1.0, category: 'person' },
      { id: 4, en: 'long hair', ja: '長い髪', weight: 1.0, category: 'appearance' },
      { id: 5, en: 'school uniform', ja: '学生服', weight: 1.0, category: 'clothing' }
    ];
    TagEditor.renderTags('main');
  }
  
  if (App.imageState.imageTags.length === 0) {
    App.imageState.imageTags = [
      { id: 'img-1', en: 'sunset', ja: '夕日', weight: 1.0, category: 'background' },
      { id: 'img-2', en: 'landscape', ja: '風景', weight: 1.0, category: 'style' },
      { id: 'img-3', en: 'mountains', ja: '山', weight: 1.0, category: 'background' }
    ];
    TagEditor.renderTags('image');
  }
  
  // Initialize multi-engine analysis settings
  console.log('🚀 Initializing multi-engine analysis settings...');
  App.initializeEngineSettings();
  
  // Set up UI checkboxes based on saved settings - improved mapping
  const savedAnalysisEngines = appState.selectedAnalysisEngines || [];
  
  // Map full engine names to UI checkbox IDs
  const engineUIMapping = {
    'wd-eva02-large-tagger-v3': 'analysis-engine-wd-eva02',
    'janus-pro-7b': 'analysis-engine-janus'
  };
  
  savedAnalysisEngines.forEach(engine => {
    const checkboxId = engineUIMapping[engine];
    if (checkboxId) {
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.checked = true;
        console.log(`✅ Restored ${engine} selection`);
      }
    }
  });
  
  // Set up tagging engine radio button
  const savedTaggingEngine = appState.selectedTaggingEngine || 'deepseek';
  const taggingRadio = document.getElementById(`tagging-engine-${savedTaggingEngine}`);
  if (taggingRadio) {
    taggingRadio.checked = true;
    console.log(`✅ Restored ${savedTaggingEngine} tagging engine`);
  }
  

  
  // Update UI counters
  App.updateAnalysisEngines();
  console.log('✅ Engine selections initialized:', savedAnalysisEngines);
  
  // Load saved vision model
  const savedVisionModel = localStorage.getItem('vision-model');
  if (savedVisionModel) {
    const select = document.getElementById('vision-model-select');
    if (select) {
      select.value = savedVisionModel;
      App.imageState.visionModel = savedVisionModel;
    }
  }
  
  // Load saved output format
  const savedImageFormat = localStorage.getItem('image-output-format');
  if (savedImageFormat) {
    const select = document.getElementById('image-output-format');
    if (select) {
      select.value = savedImageFormat;
      App.imageState.imageOutputFormat = savedImageFormat;
    }
  }
  
  // Load saved system prompts
  const savedImagePrompts = localStorage.getItem('image-system-prompts');
  if (savedImagePrompts) {
    try {
      const prompts = JSON.parse(savedImagePrompts);
      const analysisTextarea = document.getElementById('sp-image-analysis');
      const generationTextarea = document.getElementById('sp-image-to-prompt');
      
      if (analysisTextarea && prompts.analysis) {
        analysisTextarea.value = prompts.analysis;
      }
      if (generationTextarea && prompts.generation) {
        generationTextarea.value = prompts.generation;
      }
    } catch (e) {
      console.error('Failed to load saved prompts:', e);
    }
  } else {
    // Set default prompts
    const analysisTextarea = document.getElementById('sp-image-analysis');
    const generationTextarea = document.getElementById('sp-image-to-prompt');
    
    if (analysisTextarea) {
      analysisTextarea.value = App.getDefaultImageAnalysisPrompt();
    }
    if (generationTextarea) {
      const prompts = App.getFormatSystemPrompts();
      generationTextarea.value = prompts[App.imageState.imageOutputFormat];
    }
  }
});

// Tag Filtering Functionality
Object.assign(App, {
  // Toggle tag filter visibility
  toggleTagFilters: (context) => {
    const filterContainer = document.getElementById(`tag-filters-${context}`);
    const toggleButton = document.getElementById(`filter-toggle-${context}`);
    
    if (!filterContainer) return;
    
    const filterState = context === 'image' ? App.imageState.categoryFilters : appState.categoryFilters;
    filterState.visible = !filterState.visible;
    
    if (filterState.visible) {
      filterContainer.classList.remove('hidden');
      if (toggleButton) toggleButton.classList.add('bg-blue-200');
      App.renderCategoryFilters(context);
    } else {
      filterContainer.classList.add('hidden');
      if (toggleButton) toggleButton.classList.remove('bg-blue-200');
    }
  },
  
  // Render category filter buttons
  renderCategoryFilters: (context) => {
    const container = document.getElementById(`category-filters-${context}`);
    if (!container) return;
    
    const filterState = context === 'image' ? App.imageState.categoryFilters : appState.categoryFilters;
    const categories = ['person', 'appearance', 'clothing', 'action', 'background', 'quality', 'style', 'composition', 'object', 'other'];
    
    container.innerHTML = '';
    
    categories.forEach(category => {
      const isActive = filterState.active[category] !== false;
      const button = document.createElement('button');
      button.className = `category-filter-btn ${isActive ? 'active' : 'inactive'}`;
      button.dataset.category = category;
      button.innerHTML = `
        <i class="fas fa-${App.getCategoryIcon(category)}"></i>
        <span>${category}</span>
      `;
      
      button.onclick = () => App.toggleCategoryFilter(context, category);
      container.appendChild(button);
    });
  },
  
  // Get icon for category
  getCategoryIcon: (category) => {
    const icons = {
      person: 'user',
      appearance: 'eye', 
      clothing: 'tshirt',
      action: 'running',
      background: 'mountain',
      quality: 'star',
      style: 'palette',
      composition: 'camera',
      object: 'cube',
      other: 'question-circle'
    };
    return icons[category] || 'tag';
  },
  
  // Toggle individual category filter
  toggleCategoryFilter: (context, category) => {
    const filterState = context === 'image' ? App.imageState.categoryFilters : appState.categoryFilters;
    filterState.active[category] = !filterState.active[category];
    
    // Save to localStorage
    const storageKey = context === 'image' ? 'image-category-filters' : 'main-category-filters';
    localStorage.setItem(storageKey, JSON.stringify(filterState.active));
    
    // Re-render filters and tags
    App.renderCategoryFilters(context);
    TagEditor.renderTags(context);
  },
  
  // Select all categories
  selectAllCategories: (context) => {
    const filterState = context === 'image' ? App.imageState.categoryFilters : appState.categoryFilters;
    const categories = ['person', 'appearance', 'clothing', 'action', 'background', 'quality', 'style', 'composition', 'object', 'other'];
    
    categories.forEach(category => {
      filterState.active[category] = true;
    });
    
    // Save to localStorage
    const storageKey = context === 'image' ? 'image-category-filters' : 'main-category-filters';
    localStorage.setItem(storageKey, JSON.stringify(filterState.active));
    
    // Re-render filters and tags
    App.renderCategoryFilters(context);
    TagEditor.renderTags(context);
  },
  
  // Deselect all categories
  deselectAllCategories: (context) => {
    const filterState = context === 'image' ? App.imageState.categoryFilters : appState.categoryFilters;
    const categories = ['person', 'appearance', 'clothing', 'action', 'background', 'quality', 'style', 'composition', 'object', 'other'];
    
    categories.forEach(category => {
      filterState.active[category] = false;
    });
    
    // Save to localStorage
    const storageKey = context === 'image' ? 'image-category-filters' : 'main-category-filters';
    localStorage.setItem(storageKey, JSON.stringify(filterState.active));
    
    // Re-render filters and tags
    App.renderCategoryFilters(context);
    TagEditor.renderTags(context);
  }
});

// Translation Functions (unified version above at line 1082)

// Enhanced Tag Editor Methods for Bilingual Sync
TagEditor.mainTag = {
  // Update text with translation sync
  updateText: async (index, lang, newText) => {
    const tag = appState.tags[index];
    if (!tag) return;
    
    // Update the edited side
    tag[lang] = newText;
    
    // Translate to other language
    const otherLang = lang === 'en' ? 'ja' : 'en';
    const sourceLang = lang;
    const targetLang = otherLang;
    
    showLoading('翻訳中...');
    try {
      const translated = await translateWithAI(newText, targetLang, sourceLang);
      tag[otherLang] = translated;
      
      // Re-categorize if English was changed
      if (lang === 'en') {
        tag.category = App.categorizeTag(newText);
      }
      
      TagEditor.renderTags('main');
      showNotification('翻訳が完了しました', 'success');
    } catch (error) {
      showNotification('翻訳に失敗しました', 'error');
    } finally {
      hideLoading();
    }
  },
  
  // Increase weight
  increaseWeight: (index) => {
    const tag = appState.tags[index];
    if (tag) {
      tag.weight = Math.min(2.0, tag.weight + 0.1);
      TagEditor.renderTags('main');
    }
  },
  
  // Decrease weight
  decreaseWeight: (index) => {
    const tag = appState.tags[index];
    if (tag) {
      tag.weight = Math.max(0.1, tag.weight - 0.1);
      TagEditor.renderTags('main');
    }
  },
  
  // Remove tag
  remove: (index) => {
    appState.tags.splice(index, 1);
    TagEditor.renderTags('main');
  },
  
  // Create source attribution badge for hybrid analysis
  createSourceBadge: (tag) => {
    if (!tag.source) return '';
    
    const sourceLabels = {
      'llm': { letter: 'L', title: 'Generated by LLM', color: 'bg-blue-500' },
      'tagger': { letter: 'T', title: 'Generated by Specialized Tagger', color: 'bg-green-500' },
      'hybrid': { letter: 'H', title: 'Hybrid (LLM + Tagger)', color: 'bg-purple-500' }
    };
    
    const source = sourceLabels[tag.source] || sourceLabels.hybrid;
    const confidenceInfo = tag.confidence ? ` (${(tag.confidence * 100).toFixed(0)}%)` : '';
    
    let detailsText = `${source.title}${confidenceInfo}`;
    if (tag.fusion_method) {
      detailsText += `\nFusion: ${tag.fusion_method}`;
    }
    if (tag.llm_confidence && tag.tagger_confidence) {
      detailsText += `\nLLM: ${(tag.llm_confidence * 100).toFixed(0)}% | Tagger: ${(tag.tagger_confidence * 100).toFixed(0)}%`;
    }
    
    return `
      <div class="flex items-center gap-1 mt-1">
        <span class="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white rounded-full ${source.color} cursor-help" 
              title="${detailsText}">
          ${source.letter}
        </span>
        ${tag.confidence ? `<span class="text-xs text-gray-500">${(tag.confidence * 100).toFixed(0)}%</span>` : ''}
      </div>
    `;
  }
};

TagEditor.imageTag = {
  // Update text with translation sync
  updateText: async (index, lang, newText) => {
    const tag = App.imageState.imageTags[index];
    if (!tag) return;
    
    // Update the edited side
    tag[lang] = newText;
    
    // Translate to other language
    const otherLang = lang === 'en' ? 'ja' : 'en';
    const sourceLang = lang;
    const targetLang = otherLang;
    
    showLoading('翻訳中...');
    try {
      const translated = await translateWithAI(newText, targetLang, sourceLang);
      tag[otherLang] = translated;
      
      // Re-categorize if English was changed
      if (lang === 'en') {
        tag.category = App.categorizeTag(newText);
      }
      
      TagEditor.renderTags('image');
      showNotification('翻訳が完了しました', 'success');
    } catch (error) {
      showNotification('翻訳に失敗しました', 'error');
    } finally {
      hideLoading();
    }
  },
  
  // Increase weight
  increaseWeight: (index) => {
    const tag = App.imageState.imageTags[index];
    if (tag) {
      tag.weight = Math.min(2.0, tag.weight + 0.1);
      TagEditor.renderTags('image');
    }
  },
  
  // Decrease weight
  decreaseWeight: (index) => {
    const tag = App.imageState.imageTags[index];
    if (tag) {
      tag.weight = Math.max(0.1, tag.weight - 0.1);
      TagEditor.renderTags('image');
    }
  },
  
  // Remove tag
  remove: (index) => {
    App.imageState.imageTags.splice(index, 1);
    TagEditor.renderTags('image');
  }
};

// Translate All Functions
App.translateAll = async (direction) => {
  const isImageTab = appState.currentTab === 'image';
  const tags = isImageTab ? App.imageState.imageTags : appState.tags;
  
  if (tags.length === 0) {
    showNotification('翻訳するタグがありません', 'info');
    return;
  }
  
  const isEnToJa = direction === 'en-to-ja';
  const sourceLang = isEnToJa ? 'en' : 'ja';
  const targetLang = isEnToJa ? 'ja' : 'en';
  
  showLoading(`${tags.length}個のタグを翻訳中...`);
  
  try {
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      const sourceText = tag[sourceLang];
      
      if (sourceText && sourceText.trim()) {
        const translated = await translateWithAI(sourceText, targetLang, sourceLang);
        tag[targetLang] = translated;
        
        // Progress update
        if (i % 5 === 0) {
          showLoading(`翻訳中... ${i + 1}/${tags.length}`);
        }
      }
    }
    
    TagEditor.renderTags(isImageTab ? 'image' : 'main');
    showNotification(`${tags.length}個のタグの翻訳が完了しました`, 'success');
  } catch (error) {
    console.error('Translate all error:', error);
    showNotification('一括翻訳に失敗しました', 'error');
  } finally {
    hideLoading();
  }
};

// For Image Tab
App.translateImageTags = App.translateAll;

// Add New Tag Functions
App.addNewTag = async (lang) => {
  const inputId = `new-tag-${lang}`;
  const input = document.getElementById(inputId);
  
  if (!input || !input.value.trim()) return;
  
  const newText = input.value.trim();
  const otherLang = lang === 'en' ? 'ja' : 'en';
  
  showLoading('タグを追加中...');
  
  try {
    // Translate to other language
    const translated = await translateWithAI(newText, otherLang, lang);
    
    // Create new tag
    const newTag = {
      id: Date.now(),
      weight: 1.0,
      category: lang === 'en' ? App.categorizeTag(newText) : 'other'
    };
    
    newTag[lang] = newText;
    newTag[otherLang] = translated;
    
    // Add to tags array
    appState.tags.push(newTag);
    
    // Clear input
    input.value = '';
    
    // Re-render
    TagEditor.renderTags('main');
    
    showNotification('新しいタグを追加しました', 'success');
  } catch (error) {
    console.error('Add tag error:', error);
    showNotification('タグの追加に失敗しました', 'error');
  } finally {
    hideLoading();
  }
};

App.addNewImageTag = async (lang) => {
  const inputId = `new-image-tag-${lang}`;
  const input = document.getElementById(inputId);
  
  if (!input || !input.value.trim()) return;
  
  const newText = input.value.trim();
  const otherLang = lang === 'en' ? 'ja' : 'en';
  
  showLoading('タグを追加中...');
  
  try {
    // Translate to other language
    const translated = await translateWithAI(newText, otherLang, lang);
    
    // Create new tag
    const newTag = {
      id: `img-tag-${Date.now()}`,
      weight: 1.0,
      category: lang === 'en' ? App.categorizeTag(newText) : 'other'
    };
    
    newTag[lang] = newText;
    newTag[otherLang] = translated;
    
    // Add to image tags array
    App.imageState.imageTags.push(newTag);
    
    // Clear input
    input.value = '';
    
    // Re-render
    TagEditor.renderTags('image');
    
    showNotification('新しいタグを追加しました', 'success');
  } catch (error) {
    console.error('Add image tag error:', error);
    showNotification('タグの追加に失敗しました', 'error');
  } finally {
    hideLoading();
  }
};

// Final Output Update Functions (using existing TagEditor.formatOutput)

// App is already defined as window.App object literal above

// Debug functions for system prompt management
window.debugSystemPrompts = () => {
  console.log('Current system prompts:', appState.systemPrompts);
  console.log('Default system prompts:', defaultSystemPrompts);
  console.log('Flux prompt includes v12.0:', appState.systemPrompts.flux?.includes('CINEMATIC NARRATIVE STYLE v12.0'));
};

window.forceRefreshPrompts = () => {
  App.refreshAllSystemPrompts();
};

// =============================================================================
// AI INSTRUCTIONS MANAGEMENT SYSTEM
// =============================================================================

// Extended App object with AI Instructions management
Object.assign(App, {
  
  // Enhanced AI response cleanup function
  cleanAIResponse: (rawResponse) => {
    if (!rawResponse || typeof rawResponse !== 'string') {
      return rawResponse;
    }
    
    let cleaned = rawResponse.trim();
    
    // Remove markdown code blocks - various formats
    cleaned = cleaned.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```javascript\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/g, '');
    
    // Remove leading text before JSON
    cleaned = cleaned.replace(/^[^{]*(?={)/s, '');
    
    // Remove trailing text after JSON
    cleaned = cleaned.replace(/}[^}]*$/s, '}');
    
    // Remove common AI response prefixes
    cleaned = cleaned.replace(/^(Here's|Here is|The following is|Below is).*?:/gi, '');
    cleaned = cleaned.replace(/^(Response|Output|Result):\s*/gi, '');
    
    // Clean up whitespace
    cleaned = cleaned.trim();
    
    // Ensure we have valid JSON boundaries
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return cleaned;
  },
  
  // Current AI Instructions tab
  currentAIInstructionsTab: 'text-generation',
  
  // AI Instructions management
  setAIInstructionsTab: (tab) => {
    App.currentAIInstructionsTab = tab;
    
    // Hide all AI instruction panels
    const panels = ['text-generation', 'image-processing', 'translation', 'advanced'];
    panels.forEach(panel => {
      const panelEl = document.getElementById(`ai-instructions-${panel}`);
      const tabEl = document.querySelector(`[data-ai-tab="${panel}"]`);
      if (panelEl && tabEl) {
        if (panel === tab) {
          panelEl.classList.remove('hidden');
          tabEl.classList.add('border-purple-500', 'text-purple-600');
          tabEl.classList.remove('border-transparent', 'text-gray-600');
        } else {
          panelEl.classList.add('hidden');
          tabEl.classList.remove('border-purple-500', 'text-purple-600');
          tabEl.classList.add('border-transparent', 'text-gray-600');
        }
      }
    });
    
    // Load prompts for the selected tab
    App.loadAIPromptsForTab(tab);
  },
  
  // Load AI prompts for specific tab
  loadAIPromptsForTab: (tab) => {
    const prompts = JSON.parse(localStorage.getItem('ai-instructions-prompts') || '{}');
    
    switch (tab) {
      case 'text-generation':
        App.loadPromptToTextarea('ai-sdxl-prompt', prompts.sdxl || appState.systemPrompts.sdxl);
        App.loadPromptToTextarea('ai-flux-prompt', prompts.flux || appState.systemPrompts.flux);
        App.loadPromptToTextarea('ai-imagefx-prompt', prompts.imagefx || appState.systemPrompts.imagefx);
        App.loadPromptToTextarea('ai-imagefx-natural-prompt', prompts['imagefx-natural'] || appState.systemPrompts['imagefx-natural']);
        break;
        
      case 'image-processing':
        App.loadPromptToTextarea('ai-image-analysis-prompt', prompts['image-analysis'] || App.getDefaultImageAnalysisPrompt());
        App.loadPromptToTextarea('ai-image-tag-generation-prompt', prompts['image-tag-generation'] || App.getDefaultImageTagGenerationPrompt());
        break;
        
      case 'translation':
        App.loadPromptToTextarea('ai-translation-en-ja-prompt', prompts['translation-en-ja'] || App.getDefaultTranslationPrompt('en-ja'));
        App.loadPromptToTextarea('ai-translation-ja-en-prompt', prompts['translation-ja-en'] || App.getDefaultTranslationPrompt('ja-en'));
        App.loadPromptToTextarea('ai-custom-translation-prompt', prompts['custom-translation'] || App.getDefaultCustomTranslationPrompt());
        break;
        
      case 'advanced':
        App.loadPromptToTextarea('ai-categorizer-prompt', prompts['categorizer'] || App.getDefaultCategorizerPrompt());
        App.loadPromptToTextarea('ai-json-schema-prompt', prompts['json-schema'] || App.getDefaultJSONSchemaPrompt());
        App.loadPromptToTextarea('ai-error-handling-prompt', prompts['error-handling'] || App.getDefaultErrorHandlingPrompt());
        App.loadAIParameters();
        break;
    }
  },
  
  // Load prompt content to textarea
  loadPromptToTextarea: (textareaId, content) => {
    const textarea = document.getElementById(textareaId);
    if (textarea) {
      textarea.value = content || '';
    }
  },
  
  // Save specific AI prompt
  saveAIPrompt: (promptType) => {
    const prompts = JSON.parse(localStorage.getItem('ai-instructions-prompts') || '{}');
    const textareaMapping = {
      'sdxl': 'ai-sdxl-prompt',
      'flux': 'ai-flux-prompt', 
      'imagefx': 'ai-imagefx-prompt',
      'imagefx-natural': 'ai-imagefx-natural-prompt',
      'image-analysis': 'ai-image-analysis-prompt',
      'image-tag-generation': 'ai-image-tag-generation-prompt',
      'translation-en-ja': 'ai-translation-en-ja-prompt',
      'translation-ja-en': 'ai-translation-ja-en-prompt',
      'custom-translation': 'ai-custom-translation-prompt',
      'categorizer': 'ai-categorizer-prompt',
      'json-schema': 'ai-json-schema-prompt',
      'error-handling': 'ai-error-handling-prompt'
    };
    
    const textareaId = textareaMapping[promptType];
    const textarea = document.getElementById(textareaId);
    
    if (textarea) {
      prompts[promptType] = textarea.value.trim();
      localStorage.setItem('ai-instructions-prompts', JSON.stringify(prompts));
      
      // Also update system prompts for backward compatibility
      if (['sdxl', 'flux', 'imagefx', 'imagefx-natural'].includes(promptType)) {
        appState.systemPrompts[promptType] = textarea.value.trim();
        localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
      }
      
      showNotification(`${promptType} プロンプトを保存しました`, 'success');
    } else {
      showNotification(`プロンプトの保存に失敗しました: ${promptType}`, 'error');
    }
  },
  
  // Reset specific AI prompt to default
  resetAIPrompt: (promptType) => {
    const defaults = {
      'sdxl': appState.systemPrompts.sdxl,
      'flux': appState.systemPrompts.flux,
      'imagefx': appState.systemPrompts.imagefx,
      'imagefx-natural': appState.systemPrompts['imagefx-natural'],
      'image-analysis': App.getDefaultImageAnalysisPrompt(),
      'image-tag-generation': App.getDefaultImageTagGenerationPrompt(),
      'translation-en-ja': App.getDefaultTranslationPrompt('en-ja'),
      'translation-ja-en': App.getDefaultTranslationPrompt('ja-en'),
      'custom-translation': App.getDefaultCustomTranslationPrompt(),
      'categorizer': App.getDefaultCategorizerPrompt(),
      'json-schema': App.getDefaultJSONSchemaPrompt(),
      'error-handling': App.getDefaultErrorHandlingPrompt()
    };
    
    const textareaMapping = {
      'sdxl': 'ai-sdxl-prompt',
      'flux': 'ai-flux-prompt',
      'imagefx': 'ai-imagefx-prompt',
      'imagefx-natural': 'ai-imagefx-natural-prompt',
      'image-analysis': 'ai-image-analysis-prompt',
      'image-tag-generation': 'ai-image-tag-generation-prompt',
      'translation-en-ja': 'ai-translation-en-ja-prompt',
      'translation-ja-en': 'ai-translation-ja-en-prompt',
      'custom-translation': 'ai-custom-translation-prompt',
      'json-schema': 'ai-json-schema-prompt',
      'error-handling': 'ai-error-handling-prompt'
    };
    
    const textareaId = textareaMapping[promptType];
    const textarea = document.getElementById(textareaId);
    
    if (textarea && defaults[promptType]) {
      textarea.value = defaults[promptType];
      showNotification(`${promptType} プロンプトをデフォルトに戻しました`, 'success');
    }
  },
  
  // Load AI parameters
  loadAIParameters: () => {
    const params = JSON.parse(localStorage.getItem('ai-global-parameters') || '{}');
    
    const temperatureSlider = document.getElementById('ai-temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const maxTokensInput = document.getElementById('ai-max-tokens');
    
    if (temperatureSlider) {
      temperatureSlider.value = params.temperature || 0.3;
      if (temperatureValue) temperatureValue.textContent = temperatureSlider.value;
    }
    
    if (maxTokensInput) {
      maxTokensInput.value = params.maxTokens || 1000;
    }
  },
  
  // Update AI parameter
  updateAIParameter: (paramName, value) => {
    const params = JSON.parse(localStorage.getItem('ai-global-parameters') || '{}');
    params[paramName] = parseFloat(value) || value;
    localStorage.setItem('ai-global-parameters', JSON.stringify(params));
    
    if (paramName === 'temperature') {
      const valueSpan = document.getElementById('temperature-value');
      if (valueSpan) valueSpan.textContent = value;
    }
    
    showNotification(`${paramName} パラメータを更新しました`, 'success');
  },
  
  // Reset all AI prompts
  resetAllAIPrompts: () => {
    if (confirm('全てのAI指示をデフォルトに戻しますか？この操作は取り消せません。')) {
      localStorage.removeItem('ai-instructions-prompts');
      localStorage.removeItem('ai-global-parameters');
      localStorage.removeItem('system-prompts');
      
      // Restore default system prompts
      appState.systemPrompts = { ...defaultSystemPrompts };
      
      // Reload current tab
      App.loadAIPromptsForTab(App.currentAIInstructionsTab);
      
      showNotification('全てのAI指示をリセットしました', 'success');
    }
  },
  
  // Export AI prompts
  exportAIPrompts: () => {
    const allPrompts = {
      aiInstructions: JSON.parse(localStorage.getItem('ai-instructions-prompts') || '{}'),
      systemPrompts: appState.systemPrompts,
      globalParameters: JSON.parse(localStorage.getItem('ai-global-parameters') || '{}'),
      exportDate: new Date().toISOString(),
      version: '2.1'
    };
    
    const blob = new Blob([JSON.stringify(allPrompts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ss-prompt-manager-ai-instructions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('AI指示をエクスポートしました', 'success');
  },
  
  // Import AI prompts
  importAIPrompts: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            
            if (data.aiInstructions) {
              localStorage.setItem('ai-instructions-prompts', JSON.stringify(data.aiInstructions));
            }
            
            if (data.systemPrompts) {
              appState.systemPrompts = { ...appState.systemPrompts, ...data.systemPrompts };
              localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
            }
            
            if (data.globalParameters) {
              localStorage.setItem('ai-global-parameters', JSON.stringify(data.globalParameters));
            }
            
            // Reload current tab
            App.loadAIPromptsForTab(App.currentAIInstructionsTab);
            
            showNotification('AI指示をインポートしました', 'success');
          } catch (error) {
            showNotification('ファイルの読み込みに失敗しました', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  },
  
  // Default prompt getters
  getDefaultImageAnalysisPrompt: () => {
    return `# 画像解析プロフェッショナル - 画像生成プロンプト抽出特化

あなたは画像を詳細に分析し、画像生成AI用のプロンプト要素を抽出する専門家です。

## 解析指示:
1. **人物要素**: 人数、性別、年齢層、表情、髪色、服装、ポーズ、動作
2. **背景・環境**: 場所、雰囲気、照明、時間帯、天候、オブジェクト
3. **構図・スタイル**: アングル、距離感、アートスタイル、色調
4. **特徴的要素**: 目立つ特徴、象徴的なアイテム、感情表現

## 出力要求:
- 簡潔で具体的な記述
- 画像生成AIが理解しやすい表現
- 主要要素から詳細要素の順で記述
- 不要な推測や解釈は避ける

画像を詳細に分析し、画像生成プロンプト作成に必要な要素を抽出してください。`;
  },
  
  getDefaultImageTagGenerationPrompt: () => {
    return `# Image to Prompt Tag Generator - JSON Schema専用

画像解析結果から、画像生成用の英語タグとわかりやすい日本語タグを生成してください。

## 出力要求:
**必ずJSON形式で出力してください:**

{
  "pairs": [
    {"en": "1girl", "ja": "1人の女の子", "weight": 1.2, "category": "person"},
    {"en": "sitting", "ja": "座っている", "weight": 1.0, "category": "pose"},
    {"en": "natural lighting", "ja": "自然な照明", "weight": 1.1, "category": "background"}
  ]
}

## 重要なルール:
- 英語タグは画像生成AIに最適化された表現を使用
- 日本語タグはわかりやすく親しみやすい表現
- weight: 重要度（0.8-1.3の範囲）
- category: person, appearance, clothing, pose, background, quality, style, action, object, otherのいずれか
- 10-15個のタグを生成

JSONフォーマット厳守で出力してください。`;
  },
  
  getDefaultTranslationPrompt: (direction) => {
    if (direction === 'en-ja') {
      return `You are a professional translator for image generation prompts.
Translate the given English image generation tag to Japanese while keeping it natural and appropriate for image generation contexts.

Output only the translation, no explanations.`;
    } else {
      return `You are a professional translator for image generation prompts.
Translate the given Japanese image generation tag to English while keeping it natural and appropriate for image generation contexts.

Output only the translation, no explanations.`;
    }
  },
  
  getDefaultCustomTranslationPrompt: () => {
    return `You are a professional translator for custom image generation prompts.
Translate the given text while preserving any special formatting or custom instructions.

IMPORTANT: If the original text has special suffixes, patterns, or custom formatting (like "nyan", "nyaa", special characters, etc.), maintain them in the translation.

Examples:
- "1girl nyan" → "1人の女の子 nyan"
- "hot spring nyan" → "温泉 nyan"
- "ultra-detailed 8K nyan" → "超詳細 8K nyan"

Output only the translation, no explanations.`;
  },
  
  getCategorizerPrompt: () => {
    return appState.systemPrompts['categorizer'] || defaultUtilityPrompts['categorizer'];
  },
  
  getDefaultCategorizerPrompt: () => {
    return defaultUtilityPrompts['categorizer'];
  },
  
  // Get AI categorizer prompt from settings (with fallback to default)
  // 🎯 UNIFIED UTILITY PROMPTS MANAGEMENT
  // Get utility prompts from unified system (with fallback to default)
  getUtilityPrompt: (promptKey) => {
    return appState.systemPrompts[promptKey] || defaultUtilityPrompts[promptKey];
  },
  
  getAICategorizerPrompt: () => {
    return App.getUtilityPrompt('categorizer');
  },
  
  getDefaultJSONSchemaPrompt: () => {
    return `# JSON出力スキーマ定義

すべてのAI応答は以下のJSON構造に従って出力してください:

## Tag Editor用スキーマ:
{
  "pairs": [
    {
      "en": "string (英語タグ)",
      "ja": "string (日本語翻訳)", 
      "weight": "number (0.1-2.0)",
      "category": "string (カテゴリ)"
    }
  ]
}

## カテゴリ一覧:
person, appearance, clothing, pose, background, quality, style, action, object, other

## 重要:
- 必ず有効なJSONで出力
- マークダウンコードブロックは使用しない
- 説明テキストは含めない
- 構造を厳密に守る`;
  },
  
  getDefaultErrorHandlingPrompt: () => {
    return `# AI応答エラー処理指示

## エラー発生時の処理:
1. **JSON解析エラー**: 応答を再フォーマットして再試行
2. **スキーマ不一致**: デフォルト値で補完
3. **API制限エラー**: 辞書ベース翻訳にフォールバック
4. **ネットワークエラー**: ローカル処理で継続

## 最大再試行回数: 2回
## フォールバック方法: 既存の翻訳辞書を使用
## ユーザー通知: エラー内容をわかりやすく表示`;
  },

  // 🆕 AI指示管理機能 - UIで不足していた関数を実装
  
  // AI指示を保存
  saveAIPrompt: (promptType) => {
    const textarea = document.getElementById(`ai-${promptType}-prompt`);
    if (textarea) {
      const content = textarea.value.trim();
      if (content) {
        appState.systemPrompts[promptType] = content;
        localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
        showNotification(`${promptType}のAI指示を保存しました`, 'success');
      }
    }
  },

  // AI指示をデフォルトに復元
  resetAIPrompt: (promptType) => {
    if (confirm(`${promptType}のAI指示をデフォルトに戻しますか？`)) {
      const defaultPrompt = defaultMainSystemPrompts[promptType];
      if (defaultPrompt) {
        appState.systemPrompts[promptType] = defaultPrompt;
        localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
        
        const textarea = document.getElementById(`ai-${promptType}-prompt`);
        if (textarea) {
          textarea.value = defaultPrompt;
        }
        
        showNotification(`${promptType}のAI指示をデフォルトに復元しました`, 'success');
      }
    }
  },

  // ユーティリティプロンプトを保存
  saveUtilityPrompt: (promptType) => {
    const textarea = document.getElementById(`ai-${promptType}-prompt`);
    if (textarea) {
      const content = textarea.value.trim();
      if (content) {
        appState.systemPrompts[promptType] = content;
        localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
        showNotification(`${promptType}のユーティリティプロンプトを保存しました`, 'success');
      }
    }
  },

  // ユーティリティプロンプトをデフォルトに復元
  resetUtilityPrompt: (promptType) => {
    if (confirm(`${promptType}のプロンプトをデフォルトに戻しますか？`)) {
      const defaultPrompt = defaultUtilityPrompts[promptType];
      if (defaultPrompt) {
        appState.systemPrompts[promptType] = defaultPrompt;
        localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
        
        const textarea = document.getElementById(`ai-${promptType}-prompt`);
        if (textarea) {
          textarea.value = defaultPrompt;
        }
        
        showNotification(`${promptType}のプロンプトをデフォルトに復元しました`, 'success');
      }
    }
  },

  // AI指示タブを切り替え
  setAIInstructionsTab: (tabName) => {
    // タブボタンの状態更新
    document.querySelectorAll('[data-ai-tab]').forEach(btn => {
      btn.classList.remove('border-purple-500', 'text-purple-600');
      btn.classList.add('border-transparent', 'text-gray-600');
    });
    
    const activeBtn = document.querySelector(`[data-ai-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('border-purple-500', 'text-purple-600');
      activeBtn.classList.remove('border-transparent', 'text-gray-600');
    }

    // パネルの表示切り替え
    document.querySelectorAll('[id^="ai-instructions-"]').forEach(panel => {
      panel.classList.add('hidden');
    });
    
    const activePanel = document.getElementById(`ai-instructions-${tabName}`);
    if (activePanel) {
      activePanel.classList.remove('hidden');
    }

    // テキストエリアに現在の設定を読み込み
    App.loadAIPromptsForTab(tabName);
  },

  // AI指示タブの内容を読み込み
  loadAIPromptsForTab: (tabName) => {
    if (tabName === 'text-generation') {
      // Text generation prompts
      ['sdxl', 'flux', 'imagefx', 'imagefx-natural'].forEach(format => {
        const textarea = document.getElementById(`ai-${format}-prompt`);
        if (textarea) {
          textarea.value = appState.systemPrompts[format] || defaultMainSystemPrompts[format] || '';
        }
      });
    } else if (tabName === 'image-processing') {
      // Image processing prompts
      ['image-analysis', 'image-tag-generation'].forEach(promptType => {
        const textarea = document.getElementById(`ai-${promptType}-prompt`);
        if (textarea) {
          textarea.value = appState.systemPrompts[promptType] || defaultUtilityPrompts[promptType] || '';
        }
      });
    } else if (tabName === 'translation') {
      // Translation prompts
      ['translation-en-ja', 'translation-ja-en', 'translation-custom'].forEach(promptType => {
        const textarea = document.getElementById(`ai-${promptType}-prompt`);
        if (textarea) {
          textarea.value = appState.systemPrompts[promptType] || defaultUtilityPrompts[promptType] || '';
        }
      });
    } else if (tabName === 'advanced') {
      // Advanced prompts
      ['categorizer', 'json-schema', 'error-handling'].forEach(promptType => {
        const textarea = document.getElementById(`ai-${promptType}-prompt`);
        if (textarea) {
          textarea.value = appState.systemPrompts[promptType] || defaultUtilityPrompts[promptType] || '';
        }
      });
    }
  }
});

// Initialize AI Instructions tab when settings is opened
const originalShowSettings = App.showSettings;
App.showSettings = () => {
  originalShowSettings();
  // Initialize AI Instructions tab content
  setTimeout(() => {
    App.setAIInstructionsTab('text-generation');
  }, 100);
};

// 🕒 HISTORY MANAGEMENT SYSTEM
// Advanced history system with visual UI and smart features

const HistoryManager = {
  
  // Generate auto title from tags or input
  generateAutoTitle: (session) => {
    if (session.type === 'text') {
      const input = session.input.substring(0, 50);
      return input.length > 50 ? input + '...' : input;
    } else if (session.type === 'image') {
      const tagCount = session.tags ? session.tags.length : 0;
      return `Image Analysis (${tagCount} tags)`;
    }
    return 'Untitled Session';
  },

  // Create session data structure
  createSession: (type, data) => {
    const session = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: type, // 'text' or 'image'
      timestamp: Date.now(),
      title: data.title || HistoryManager.generateAutoTitle({ type, ...data }),
      input: data.input || '',
      tags: data.tags || [],
      format: data.format || 'sdxl',
      isFavorite: false,
      metadata: {
        model: data.model || appState.selectedModel,
        version: '2.0'
      }
    };

    // Add type-specific data
    if (type === 'image') {
      session.imageUrl = data.imageUrl || null;
      session.analysisResult = data.analysisResult || '';
    }

    return session;
  },

  // Add session to history
  addSession: (type, data) => {
    const session = HistoryManager.createSession(type, data);
    
    // Add to beginning of array (most recent first)
    appState.history.sessions.unshift(session);
    
    // Maintain max session limit
    if (appState.history.sessions.length > appState.history.maxSessions) {
      appState.history.sessions = appState.history.sessions.slice(0, appState.history.maxSessions);
    }
    
    // Save to localStorage
    HistoryManager.saveHistory();
    
    // Update UI if history panel is visible
    if (appState.history.visible) {
      HistoryManager.renderHistoryUI();
    }
    
    return session;
  },

  // Save history to localStorage
  saveHistory: () => {
    localStorage.setItem('prompt-history', JSON.stringify(appState.history.sessions));
    localStorage.setItem('favorite-sessions', JSON.stringify(appState.history.favorites));
  },

  // Toggle favorite status
  toggleFavorite: (sessionId) => {
    const session = appState.history.sessions.find(s => s.id === sessionId);
    if (session) {
      session.isFavorite = !session.isFavorite;
      
      if (session.isFavorite) {
        // Add to favorites if not already there
        if (!appState.history.favorites.find(f => f.id === sessionId)) {
          appState.history.favorites.push({ ...session });
        }
      } else {
        // Remove from favorites
        appState.history.favorites = appState.history.favorites.filter(f => f.id !== sessionId);
      }
      
      HistoryManager.saveHistory();
      if (appState.history.visible) {
        HistoryManager.renderHistoryUI();
      }
    }
  },

  // Delete session
  deleteSession: (sessionId) => {
    if (confirm('この履歴を削除しますか？')) {
      appState.history.sessions = appState.history.sessions.filter(s => s.id !== sessionId);
      appState.history.favorites = appState.history.favorites.filter(f => f.id !== sessionId);
      
      HistoryManager.saveHistory();
      if (appState.history.visible) {
        HistoryManager.renderHistoryUI();
      }
      
      showNotification('履歴を削除しました', 'success');
    }
  },

  // Restore session to current editor
  restoreSession: (sessionId) => {
    const session = appState.history.sessions.find(s => s.id === sessionId);
    if (!session) return;

    if (session.type === 'text') {
      // Switch to text tab
      App.setTab('text');
      
      // Set input text
      const inputElement = document.getElementById('input-text');
      if (inputElement) {
        inputElement.value = session.input;
      }
      
      // Set format
      const formatSelect = document.getElementById('output-format');
      if (formatSelect) {
        formatSelect.value = session.format;
        appState.outputFormat = session.format;
      }
      
      // Restore tags
      appState.tags = [...session.tags];
      TagEditor.renderTags('main');
      
    } else if (session.type === 'image') {
      // Switch to image tab
      App.setTab('image');
      
      // Restore image if available
      if (session.imageUrl) {
        const imagePreview = document.getElementById('image-preview');
        const previewContainer = document.getElementById('image-preview-container');
        const uploadPrompt = document.getElementById('image-upload-prompt');
        
        if (imagePreview && previewContainer && uploadPrompt) {
          imagePreview.src = session.imageUrl;
          previewContainer.classList.remove('hidden');
          uploadPrompt.style.display = 'none';
        }
      }
      
      // Set analysis result
      if (session.analysisResult) {
        const analysisElement = document.getElementById('image-analysis-result');
        if (analysisElement) {
          analysisElement.innerHTML = session.analysisResult;
        }
      }
      
      // Restore image tags
      App.imageState.imageTags = [...session.tags];
      TagEditor.renderTags('image');
    }
    
    // Update output
    App.updateOutput();
    
    showNotification('履歴を復元しました', 'success');
    
    // Close history panel
    HistoryManager.toggleHistoryPanel();
  },

  // Copy session tags to clipboard
  copySessionTags: (sessionId) => {
    const session = appState.history.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const tags = session.tags.map(tag => tag.en).join(', ');
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tags).then(() => {
        showNotification('タグをクリップボードにコピーしました', 'success');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = tags;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification('タグをクリップボードにコピーしました', 'success');
    }
  },

  // Format timestamp for display
  formatTimestamp: (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return 'たった今';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}分前`;
    } else if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours}時間前`;
    } else {
      const date = new Date(timestamp);
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },

  // Get category color for tag
  getCategoryColor: (category) => {
    const colorMap = {
      person: 'orange', appearance: 'blue', clothing: 'pink', action: 'purple',
      background: 'green', quality: 'yellow', style: 'indigo', composition: 'gray',
      object: 'cyan', other: 'gray'
    };
    return colorMap[category] || 'gray';
  },

  // Search sessions
  searchSessions: (query) => {
    if (!query.trim()) return appState.history.sessions;
    
    const searchTerm = query.toLowerCase();
    
    return appState.history.sessions.filter(session => {
      // Search in title
      if (session.title.toLowerCase().includes(searchTerm)) return true;
      
      // Search in input
      if (session.input.toLowerCase().includes(searchTerm)) return true;
      
      // Search in tags
      if (session.tags.some(tag => 
        tag.en.toLowerCase().includes(searchTerm) || 
        tag.ja.toLowerCase().includes(searchTerm)
      )) return true;
      
      return false;
    });
  },

  // Filter sessions by type
  filterSessions: (type) => {
    if (type === 'all') return appState.history.sessions;
    if (type === 'favorites') return appState.history.favorites;
    return appState.history.sessions.filter(session => session.type === type);
  },

  // Clear all history
  clearAllHistory: () => {
    if (confirm('すべての履歴を削除しますか？この操作は取り消せません。')) {
      appState.history.sessions = [];
      appState.history.favorites = [];
      HistoryManager.saveHistory();
      
      if (appState.history.visible) {
        HistoryManager.renderHistoryUI();
      }
      
      showNotification('すべての履歴を削除しました', 'success');
    }
  },

  // Toggle history panel visibility
  toggleHistoryPanel: () => {
    appState.history.visible = !appState.history.visible;
    
    if (appState.history.visible) {
      HistoryManager.showHistoryPanel();
    } else {
      HistoryManager.hideHistoryPanel();
    }
  },

  // Show history panel
  showHistoryPanel: () => {
    let historyPanel = document.getElementById('history-panel');
    
    if (!historyPanel) {
      HistoryManager.createHistoryPanel();
      historyPanel = document.getElementById('history-panel');
    }
    
    historyPanel.classList.remove('hidden');
    HistoryManager.renderHistoryUI();
    appState.history.visible = true;
  },

  // Hide history panel
  hideHistoryPanel: () => {
    const historyPanel = document.getElementById('history-panel');
    if (historyPanel) {
      historyPanel.classList.add('hidden');
    }
    appState.history.visible = false;
  },

  // Create history panel HTML structure
  createHistoryPanel: () => {
    const historyHTML = `
      <div id="history-panel" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col m-4">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-purple-100 rounded-lg">
                <i class="fas fa-history text-purple-600 text-xl"></i>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-800">履歴</h2>
                <p class="text-sm text-gray-600">プロンプト生成履歴</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <!-- Search -->
              <div class="relative">
                <input type="text" id="history-search" placeholder="履歴を検索..." 
                       class="pl-8 pr-3 py-2 border rounded-lg text-sm w-64">
                <i class="fas fa-search absolute left-2.5 top-2.5 text-gray-400 text-sm"></i>
              </div>
              
              <!-- Filter -->
              <select id="history-filter" class="px-3 py-2 border rounded-lg text-sm">
                <option value="all">すべて</option>
                <option value="text">テキスト</option>
                <option value="image">画像</option>
                <option value="favorites">お気に入り</option>
              </select>
              
              <!-- Close button -->
              <button onclick="HistoryManager.toggleHistoryPanel()" 
                      class="p-2 hover:bg-gray-100 rounded-lg">
                <i class="fas fa-times text-gray-500"></i>
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1 overflow-hidden">
            <div id="history-content" class="h-full overflow-y-auto p-4">
              <!-- History items will be rendered here -->
            </div>
          </div>
          
          <!-- Footer -->
          <div class="flex items-center justify-between p-4 border-t bg-gray-50">
            <div class="text-sm text-gray-600">
              <span id="history-count">0</span> 件の履歴
            </div>
            <div class="flex gap-2">
              <button onclick="HistoryManager.clearAllHistory()" 
                      class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <i class="fas fa-trash mr-1"></i>すべて削除
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', historyHTML);
    
    // Add event listeners
    const searchInput = document.getElementById('history-search');
    const filterSelect = document.getElementById('history-filter');
    
    if (searchInput) {
      searchInput.addEventListener('input', HistoryManager.handleSearch);
    }
    
    if (filterSelect) {
      filterSelect.addEventListener('change', HistoryManager.handleFilter);
    }
  },

  // Handle search input
  handleSearch: (event) => {
    const query = event.target.value;
    HistoryManager.renderHistoryUI(null, query);
  },

  // Handle filter change
  handleFilter: (event) => {
    const filter = event.target.value;
    HistoryManager.renderHistoryUI(filter);
  },

  // Render history UI
  renderHistoryUI: (filter = 'all', searchQuery = '') => {
    const content = document.getElementById('history-content');
    const countElement = document.getElementById('history-count');
    
    if (!content) return;
    
    // Get sessions based on filter and search
    let sessions = HistoryManager.filterSessions(filter);
    if (searchQuery) {
      sessions = HistoryManager.searchSessions(searchQuery);
      if (filter !== 'all') {
        sessions = sessions.filter(session => {
          if (filter === 'favorites') return session.isFavorite;
          return session.type === filter;
        });
      }
    }
    
    // Update count
    if (countElement) {
      countElement.textContent = sessions.length;
    }
    
    if (sessions.length === 0) {
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-gray-500">
          <i class="fas fa-history text-6xl mb-4 opacity-50"></i>
          <h3 class="text-xl font-semibold mb-2">履歴がありません</h3>
          <p class="text-sm text-center">プロンプトを生成すると、ここに履歴が表示されます</p>
        </div>
      `;
      return;
    }
    
    // Render sessions
    content.innerHTML = sessions.map(session => HistoryManager.renderSessionCard(session)).join('');
  },

  // Render individual session card
  renderSessionCard: (session) => {
    const typeIcon = session.type === 'text' ? 'fa-file-text' : 'fa-image';
    const typeColor = session.type === 'text' ? 'blue' : 'purple';
    const favoriteClass = session.isFavorite ? 'text-yellow-500' : 'text-gray-400';
    
    // Render tags with colors
    const tagElements = session.tags.slice(0, 6).map(tag => {
      const color = HistoryManager.getCategoryColor(tag.category);
      return `<span class="inline-block px-2 py-1 text-xs bg-${color}-100 text-${color}-800 rounded border border-${color}-200 mr-1 mb-1">${tag.en}</span>`;
    }).join('');
    
    const moreTagsText = session.tags.length > 6 ? `<span class="text-xs text-gray-500">+${session.tags.length - 6} more</span>` : '';
    
    return `
      <div class="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow mb-3 p-4">
        <div class="flex items-start gap-3">
          <!-- Type Icon -->
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-${typeColor}-100 rounded-lg flex items-center justify-center">
              <i class="fas ${typeIcon} text-${typeColor}-600"></i>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <!-- Header -->
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-800 truncate pr-2">${session.title}</h3>
              <div class="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                <i class="fas fa-clock"></i>
                <span>${HistoryManager.formatTimestamp(session.timestamp)}</span>
              </div>
            </div>
            
            <!-- Input/Image preview -->
            ${session.type === 'text' ? `
              <p class="text-sm text-gray-600 mb-3 line-clamp-2">${session.input.substring(0, 120)}${session.input.length > 120 ? '...' : ''}</p>
            ` : `
              <div class="flex items-center gap-3 mb-3">
                ${session.imageUrl ? `
                  <img src="${session.imageUrl}" alt="Preview" class="w-16 h-16 object-cover rounded border">
                ` : `
                  <div class="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                    <i class="fas fa-image text-gray-400"></i>
                  </div>
                `}
                <div class="flex-1">
                  <p class="text-sm text-gray-600">${session.tags.length} タグを生成</p>
                  <p class="text-xs text-gray-500">Format: ${session.format}</p>
                </div>
              </div>
            `}
            
            <!-- Tags -->
            <div class="mb-3">
              <div class="flex flex-wrap">
                ${tagElements}
                ${moreTagsText}
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1">
                <button onclick="HistoryManager.restoreSession('${session.id}')" 
                        class="px-3 py-1 text-xs bg-${typeColor}-100 hover:bg-${typeColor}-200 text-${typeColor}-700 rounded transition-colors">
                  <i class="fas fa-undo mr-1"></i>復元
                </button>
                <button onclick="HistoryManager.copySessionTags('${session.id}')" 
                        class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors">
                  <i class="fas fa-copy mr-1"></i>コピー
                </button>
              </div>
              
              <div class="flex items-center gap-1">
                <button onclick="HistoryManager.toggleFavorite('${session.id}')" 
                        class="p-1 hover:bg-gray-100 rounded transition-colors">
                  <i class="fas fa-star ${favoriteClass}"></i>
                </button>
                <button onclick="HistoryManager.deleteSession('${session.id}')" 
                        class="p-1 hover:bg-red-100 text-red-600 rounded transition-colors">
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};