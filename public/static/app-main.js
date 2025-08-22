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

// Application state
let appState = {
  tags: [],
  currentTab: 'text',
  outputFormat: 'sdxl',
  finalOutputFormat: 'sdxl', // Separate format for Final Output
  settingsOpen: false,
  apiKey: localStorage.getItem('openrouter-api-key') || '',
  selectedModel: localStorage.getItem('selected-model') || 'openai/gpt-4o-mini',
  systemPrompts: JSON.parse(localStorage.getItem('system-prompts') || '{}'),
  editingPrompt: null // Currently editing prompt format
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
    
    ctx.tags.forEach((tag, index) => {
      const colorClass = TagEditor.categoryColors[tag.category] || TagEditor.categoryColors.other;
      
      // English tag card
      const enCard = TagEditor.createTagCard(tag, index, 'en', colorClass, context);
      enContainer.appendChild(enCard);
      
      // Japanese tag card
      const jaCard = TagEditor.createTagCard(tag, index, 'ja', colorClass, context);
      jaContainer.appendChild(jaCard);
      
      // Add drop zone after each card
      const enDropZone = TagEditor.createDropZone(index, 'en', context);
      const jaDropZone = TagEditor.createDropZone(index, 'ja', context);
      enContainer.appendChild(enDropZone);
      jaContainer.appendChild(jaDropZone);
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
    
    // Create compact content layout without drag handle
    card.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0">
          <div class="tag-text text-sm break-words" 
               ondblclick="TagEditor.makeEditable(${index}, '${lang}', '${context}')" 
               style="cursor: text; line-height: 1.3;">
            ${text}
          </div>
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

// Default system prompts - Enhanced with automatic categorization
const defaultSystemPrompts = {
  sdxl: `You are an AI tag generator for SDXL image generation with automatic categorization.

Rules:
1. Generate comprehensive, high-quality tags in proper format
2. Start with quality enhancers: masterpiece, best quality, ultra-detailed
3. Include subject description with proper categorization
4. Add composition, lighting, and style elements
5. Use weights (0.5-2.0) for emphasis: tag:1.2
6. Output ONLY JSON format as shown below

Output MUST be valid JSON:
{
  "pairs": [
    {"en": "masterpiece", "ja": "傑作", "weight": 1.0, "category": "quality"},
    {"en": "1girl", "ja": "1人の女の子", "weight": 1.1, "category": "person"},
    {"en": "beautiful face", "ja": "美しい顔", "weight": 1.0, "category": "appearance"}
  ]
}

Categories: person, appearance, clothing, pose, background, quality, style, action, object, other`,
  
  flux: `You are an AI tag generator for Flux image generation with automatic categorization.

Generate natural language descriptions with proper Japanese translations.

Output MUST be valid JSON:
{
  "pairs": [
    {"en": "A beautiful young woman with flowing hair", "ja": "流れるような髪の美しい若い女性", "weight": 1.0, "category": "person"},
    {"en": "soft natural lighting", "ja": "柔らかな自然光", "weight": 1.0, "category": "background"}
  ]
}

Categories: person, appearance, clothing, pose, background, quality, style, action, object, other`,
  
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

// Initialize system prompts with defaults if not set
if (Object.keys(appState.systemPrompts).length === 0) {
  appState.systemPrompts = {...defaultSystemPrompts};
  localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
}

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

// AI Translation function
async function translateWithAI(text, targetLang = 'ja') {
  if (!appState.apiKey) {
    return targetLang === 'ja' ? translateToJapanese(text) : translateToEnglish(text);
  }
  
  try {
    const sourceLang = targetLang === 'ja' ? 'English' : 'Japanese';
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
        model: appState.selectedModel || 'openai/gpt-4o-mini',
        apiKey: appState.apiKey
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
      const ja = await translateWithAI(parsedTag.text, 'ja');
      
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
              content: `You are an AI tag categorizer for image generation prompts. Analyze each tag and categorize it into one of these categories:

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

Respond ONLY with valid JSON format:
{
  "categories": [
    {"tag": "tag_name", "category": "category_name"},
    ...
  ]
}`
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
    const input = document.getElementById('input-text');
    if (!input || !input.value.trim()) return;
    
    if (!appState.apiKey) {
      alert('Please set your OpenRouter API key in Settings first');
      return;
    }
    
    showLoading('Generating optimized tags with AI...');
    
    try {
      // Get custom system prompt if available
      const systemPrompt = appState.systemPrompts[appState.outputFormat] || null;
      
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input.value.trim(),
          format: appState.outputFormat,
          apiKey: appState.apiKey,
          systemPrompt: systemPrompt // Send custom prompt if available
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate tags');
      }
      
      const data = await response.json();
      
      if (data.tags && data.tags.length > 0) {
        appState.tags = data.tags;
        renderTags();
        
        // Show notification
        showNotification(`Generated ${data.tags.length} tags with AI`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate tags with AI. Please check your API key and try again.');
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
  
  updateFinalOutputFormat: () => {
    const select = document.getElementById('final-output-format');
    if (select) {
      appState.finalOutputFormat = select.value;
      localStorage.setItem('final-output-format', select.value);
      updateOutput(); // Update output only when Final Output format changes
    }
  },
  
  showPromptEditor: (format) => {
    appState.editingPrompt = format || appState.outputFormat;
    const modal = document.createElement('div');
    modal.id = 'prompt-editor-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const prompt = appState.systemPrompts[appState.editingPrompt] || '';
    const isDefault = defaultSystemPrompts[appState.editingPrompt] === prompt;
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">
            <i class="fas fa-edit mr-2"></i>
            Edit System Prompt: ${appState.editingPrompt.toUpperCase()}
          </h2>
          <button onclick="App.closePromptEditor()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            System Prompt for ${appState.editingPrompt} format:
          </label>
          <textarea 
            id="prompt-editor-text" 
            class="w-full h-64 p-3 border rounded-lg font-mono text-sm"
            placeholder="Enter system prompt for AI generation...">${prompt}</textarea>
        </div>
        
        <div class="flex justify-between">
          <div>
            ${!isDefault ? `
              <button onclick="App.resetPromptToDefault()" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                <i class="fas fa-undo mr-2"></i>Reset to Default
              </button>
            ` : ''}
          </div>
          <div class="space-x-2">
            <button onclick="App.closePromptEditor()" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
              Cancel
            </button>
            <button onclick="App.savePrompt()" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
              <i class="fas fa-save mr-2"></i>Save Prompt
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
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
      appState.systemPrompts[appState.editingPrompt] = textarea.value;
      localStorage.setItem('system-prompts', JSON.stringify(appState.systemPrompts));
      showNotification(`System prompt for ${appState.editingPrompt} saved!`);
      App.closePromptEditor();
    }
  },
  
  resetPromptToDefault: () => {
    if (appState.editingPrompt && defaultSystemPrompts[appState.editingPrompt]) {
      const textarea = document.getElementById('prompt-editor-text');
      if (textarea) {
        textarea.value = defaultSystemPrompts[appState.editingPrompt];
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
      const customFormats = Object.keys(appState.systemPrompts).filter(
        key => !['sdxl', 'flux', 'imagefx', 'imagefx-natural'].includes(key)
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
    ['text', 'image', 'batch'].forEach(t => {
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
    ['api', 'formats', 'preferences', 'image-analysis'].forEach(t => {
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
  
  updateModelList: (models) => {
    const modelSelect = document.getElementById('openrouter-model');
    if (!modelSelect) return;
    
    // Clear existing options
    modelSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a model...';
    modelSelect.appendChild(defaultOption);
    
    // Filter and add text models
    const textModels = models.filter(model => 
      model.architecture?.modality === 'text->text' || 
      model.id.includes('gpt') || 
      model.id.includes('claude') || 
      model.id.includes('gemini') ||
      model.id.includes('mistral') ||
      model.id.includes('deepseek')
    );
    
    // Sort models by popularity/name
    textModels.sort((a, b) => {
      // Prioritize popular models
      const priority = ['gpt-4', 'claude-3', 'gemini', 'deepseek', 'mistral'];
      for (const p of priority) {
        if (a.id.includes(p) && !b.id.includes(p)) return -1;
        if (!a.id.includes(p) && b.id.includes(p)) return 1;
      }
      return a.name?.localeCompare(b.name) || a.id.localeCompare(b.id);
    });
    
    // Add models to dropdown
    textModels.forEach(model => {
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
      
      modelSelect.appendChild(option);
    });
    
    // Update model indicator
    const modelIndicator = document.getElementById('current-model-indicator');
    if (modelIndicator) {
      modelIndicator.textContent = textModels.length > 0 ? 'Models loaded' : 'No models';
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
  
  updateVisionModelSetting: (model) => {
    App.imageState.visionModel = model;
    localStorage.setItem('vision-model', model);
    showNotification(`Vision Modelを${model}に変更しました`, 'success');
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
  
  // Initialize output formats
  const savedOutputFormat = localStorage.getItem('output-format');
  if (savedOutputFormat) {
    const formatSelect = document.getElementById('output-format');
    if (formatSelect) {
      formatSelect.value = savedOutputFormat;
      appState.outputFormat = savedOutputFormat;
    }
  }
  
  const savedFinalFormat = localStorage.getItem('final-output-format');
  if (savedFinalFormat) {
    const finalFormatSelect = document.getElementById('final-output-format');
    if (finalFormatSelect) {
      finalFormatSelect.value = savedFinalFormat;
      appState.finalOutputFormat = savedFinalFormat;
    }
  }
  
  // Populate custom formats in dropdowns for Text to Prompt
  const customFormats = Object.keys(appState.systemPrompts).filter(
    key => !['sdxl', 'flux', 'imagefx', 'imagefx-natural'].includes(key)
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
    visionModel: 'gemini-2.0-flash-exp',
    imageOutputFormat: 'sdxl',
    imageFinalFormat: 'sdxl',  // Separate format for final output
    imageTags: [],  // Separate tags for image tab
    analysisVisible: false,
    customFormats: JSON.parse(localStorage.getItem('image-custom-formats') || '{}')  // Image-specific custom formats
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
    App.imageState.imageTags = [];
    App.imageState.analysisVisible = false;
    
    const previewContainer = document.getElementById('image-preview-container');
    const uploadPrompt = document.getElementById('image-upload-prompt');
    const fileInput = document.getElementById('image-file-input');
    const analysisResult = document.getElementById('image-analysis-result');
    const generatedPrompt = document.getElementById('image-generated-prompt');
    const generateBtn = document.getElementById('image-ai-generate-btn');
    const analysisContainer = document.getElementById('analysis-result-container');
    
    if (previewContainer) previewContainer.classList.add('hidden');
    if (uploadPrompt) uploadPrompt.classList.remove('hidden');
    if (fileInput) fileInput.value = '';
    if (analysisResult) analysisResult.innerHTML = '<p class="text-gray-500 text-sm italic">No analysis yet...</p>';
    if (generatedPrompt) generatedPrompt.value = '';
    if (generateBtn) generateBtn.disabled = true;
    if (analysisContainer) analysisContainer.classList.add('hidden');
    
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
    const container = document.getElementById('analysis-result-container');
    const toggleText = document.getElementById('toggle-analysis-text');
    const toggleIcon = document.getElementById('toggle-analysis-icon');
    
    if (!container) return;
    
    if (container.classList.contains('hidden')) {
      container.classList.remove('hidden');
      if (toggleText) toggleText.textContent = 'Hide AI Analysis';
      if (toggleIcon) {
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
      }
    } else {
      container.classList.add('hidden');
      if (toggleText) toggleText.textContent = 'Show AI Analysis';
      if (toggleIcon) {
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
      }
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
  
  // Copy functions
  copyAnalysisResult: () => {
    if (App.imageState.analysisResult) {
      navigator.clipboard.writeText(App.imageState.analysisResult);
      showNotification('Analysis copied to clipboard', 'success');
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
          
          // Remove markdown code blocks if present
          tagResponseText = tagResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
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
  
  // Toggle analysis result visibility
  toggleAnalysisResult: () => {
    const container = document.getElementById('analysis-result-container');
    const toggleBtn = document.getElementById('toggle-analysis-btn');
    const toggleText = document.getElementById('toggle-analysis-text');
    const toggleIcon = document.getElementById('toggle-analysis-icon');
    
    if (container) {
      App.imageState.analysisVisible = !App.imageState.analysisVisible;
      
      if (App.imageState.analysisVisible) {
        container.classList.remove('hidden');
        if (toggleText) toggleText.textContent = 'Hide AI Analysis';
        if (toggleIcon) toggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        if (toggleBtn) toggleBtn.classList.replace('bg-green-500', 'bg-gray-500');
        if (toggleBtn) toggleBtn.classList.replace('hover:bg-green-600', 'hover:bg-gray-600');
      } else {
        container.classList.add('hidden');
        if (toggleText) toggleText.textContent = 'Show AI Analysis';
        if (toggleIcon) toggleIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        if (toggleBtn) toggleBtn.classList.replace('bg-gray-500', 'bg-green-500');
        if (toggleBtn) toggleBtn.classList.replace('hover:bg-gray-600', 'hover:bg-green-600');
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

  // AI Generate tags with JSON schema - Complete flow for Image to Prompt
  generateImageTagsFromAI: async () => {
    // 画像がアップロードされているか確認
    if (!App.imageState.imageData) {
      showNotification('画像をアップロードしてください', 'error');
      return;
    }
    
    if (!appState.apiKey) {
      showNotification('OpenRouter APIキーを設定してください', 'error');
      return;
    }

    const generateBtn = document.getElementById('image-ai-generate-btn');
    
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>画像解析中...';
    }

    try {
      // Step 1: 画像解析（画像がまだ解析されていない場合）
      if (!App.imageState.analysisResult) {
        showLoading('画像を解析しています...');
        
        // 画像解析用のシステムプロンプト
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
                image_url: {
                  url: App.imageState.imageData
                }
              }
            ]
          }
        ];
        
        // Vision APIで画像解析
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
        App.imageState.analysisResult = analysisData.choices[0].message.content;
        
        // 解析結果を表示
        const resultDiv = document.getElementById('image-analysis-result');
        if (resultDiv) {
          resultDiv.innerHTML = `<pre class="whitespace-pre-wrap text-sm">${App.imageState.analysisResult}</pre>`;
        }
        
        // 解析結果コンテナを表示
        const analysisContainer = document.getElementById('analysis-result-container');
        if (analysisContainer) {
          analysisContainer.classList.remove('hidden');
        }
        
        hideLoading();
      }
      
      // Step 2: タグ生成
      if (generateBtn) {
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>タグ生成中...';
      }
      
      showLoading('AIタグを生成しています...');
      
      // タグ生成用のシステムプロンプト（AI Format Promptを使用）
      const tagGenerationPrompt = App.getTagGenerationSystemPrompt();

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
              content: tagGenerationPrompt
            },
            {
              role: 'user',
              content: `以下の画像解析結果から、画像生成用の英語タグとわかりやすい日本語タグを生成してください：\n\n${App.imageState.analysisResult}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'タグ生成に失敗しました');
      }

      const data = await response.json();
      let responseText = data.choices[0].message.content.trim();
      
      // マークダウンコードブロックを削除
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // JSON解析
      let tagsData;
      try {
        console.log('AI Response (before parsing):', responseText);
        tagsData = JSON.parse(responseText);
        console.log('Parsed tags data:', tagsData);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', responseText);
        throw new Error('AIからの応答が正しいJSON形式ではありません。再度お試しください。');
      }

      // スキーマ検証
      if (!tagsData.pairs || !Array.isArray(tagsData.pairs)) {
        throw new Error('応答フォーマットが正しくありません - pairs配列が見つかりません');
      }

      // 既存のタグをクリアして、AI生成タグを設定
      App.imageState.imageTags = [];
      
      // タグ処理とフォールバック翻訳
      const tagPromises = tagsData.pairs.map(async (pair, index) => {
        console.log(`Processing pair ${index}:`, pair);
        if (pair.en) {
          let jaText = pair.ja;
          
          // 日本語がない場合はフォールバック翻訳
          if (!jaText || jaText.trim() === '') {
            console.log(`Missing Japanese for "${pair.en}", using fallback translation`);
            jaText = await translateWithAI(pair.en, 'ja');
          }
          
          const newTag = {
            id: `ai-tag-${Date.now()}-${index}`,
            en: pair.en,
            ja: jaText,
            weight: pair.weight || 1.0,
            category: pair.category || categorizeTag(pair.en)
          };
          console.log('Adding tag:', newTag);
          return newTag;
        } else {
          console.warn('Skipping invalid pair (no English):', pair);
          return null;
        }
      });
      
      const processedTags = await Promise.all(tagPromises);
      App.imageState.imageTags = processedTags.filter(tag => tag !== null);

      // UIを更新
      TagEditor.renderTags('image');
      
      // 生成されたプロンプトを更新
      App.updateImagePromptOutput();
      
      hideLoading();
      showNotification(`${App.imageState.imageTags.length}個のタグを生成しました`, 'success');
      
    } catch (error) {
      console.error('Tag generation error:', error);
      hideLoading();
      showNotification(`処理に失敗しました: ${error.message}`, 'error');
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-sparkles mr-2"></i>AI Generate';
      }
    }
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

// Make App global
window.App = App;