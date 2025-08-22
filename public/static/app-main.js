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
  
  // Category colors
  categoryColors: {
    person: 'bg-yellow-50 border-yellow-300',
    appearance: 'bg-pink-50 border-pink-300',
    clothes: 'bg-purple-50 border-purple-300',
    clothing: 'bg-purple-50 border-purple-300',
    pose: 'bg-indigo-50 border-indigo-300',
    background: 'bg-green-50 border-green-300',
    quality: 'bg-blue-50 border-blue-300',
    style: 'bg-orange-50 border-orange-300',
    other: 'bg-gray-50 border-gray-300'
  },
  
  // Render tags for both contexts
  renderTags: (context = 'main') => {
    const ctx = TagEditor.getContext(context);
    const enContainer = document.getElementById(ctx.enContainer);
    const jaContainer = document.getElementById(ctx.jaContainer);
    
    if (!enContainer || !jaContainer) return;
    
    enContainer.innerHTML = '';
    jaContainer.innerHTML = '';
    
    ctx.tags.forEach((tag, index) => {
      const colorClass = TagEditor.categoryColors[tag.category] || TagEditor.categoryColors.other;
      
      // English tag card
      const enCard = TagEditor.createTagCard(tag, index, 'en', colorClass, context);
      enContainer.appendChild(enCard);
      
      // Japanese tag card
      const jaCard = TagEditor.createTagCard(tag, index, 'ja', colorClass, context);
      jaContainer.appendChild(jaCard);
    });
    
    // Update outputs
    TagEditor.updateOutput(context);
  },
  
  // Create a tag card element with drag and drop
  createTagCard: (tag, index, lang, colorClass, context) => {
    const card = document.createElement('div');
    card.className = `tag-card ${colorClass} border rounded-lg p-2 hover:shadow-md transition-all relative cursor-move`;
    card.draggable = true;
    card.dataset.index = index;
    card.dataset.context = context;
    card.dataset.lang = lang;
    
    const text = lang === 'en' ? tag.en : tag.ja;
    const funcPrefix = context === 'image' ? 'TagEditor.imageTag' : 'TagEditor.mainTag';
    
    // Add drag indicator elements positioned at the edges
    const topIndicator = document.createElement('div');
    topIndicator.className = 'drag-indicator';
    topIndicator.style.cssText = 'position: absolute; top: -2px; left: 0; right: 0;';
    card.appendChild(topIndicator);
    
    const bottomIndicator = document.createElement('div');
    bottomIndicator.className = 'drag-indicator';
    bottomIndicator.style.cssText = 'position: absolute; bottom: -2px; left: 0; right: 0;';
    card.appendChild(bottomIndicator);
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'flex items-center gap-2 relative';
    content.innerHTML = `
      <i class="fas fa-grip-vertical drag-handle text-gray-400 hover:text-gray-600 transition-colors"></i>
      <input type="text" value="${text}" 
             class="flex-1 px-2 py-1 text-sm bg-white/70 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-text"
             onchange="${funcPrefix}.updateText(${index}, '${lang}', this.value)"
             placeholder="${lang === 'en' ? 'English tag' : '日本語タグ'}">
      <div class="flex items-center gap-1">
        <button onclick="${funcPrefix}.decreaseWeight(${index})" 
                class="px-1 py-0.5 text-gray-600 hover:bg-white/50 rounded transition-colors cursor-pointer">
          <i class="fas fa-minus text-xs"></i>
        </button>
        <input type="number" value="${tag.weight.toFixed(2)}" min="0.1" max="2.0" step="0.05" 
               class="w-14 px-1 py-0.5 text-xs text-center border rounded cursor-text"
               onchange="${funcPrefix}.updateWeight(${index}, this.value)">
        <button onclick="${funcPrefix}.increaseWeight(${index})" 
                class="px-1 py-0.5 text-gray-600 hover:bg-white/50 rounded transition-colors cursor-pointer">
          <i class="fas fa-plus text-xs"></i>
        </button>
      </div>
      <button onclick="${funcPrefix}.remove(${index})" 
              class="px-1.5 py-0.5 text-red-600 hover:bg-red-100 rounded transition-colors cursor-pointer">
        <i class="fas fa-trash text-xs"></i>
      </button>
    `;
    card.appendChild(content);
    
    // Add drag event listeners
    card.addEventListener('dragstart', TagEditor.handleDragStart);
    card.addEventListener('dragend', TagEditor.handleDragEnd);
    card.addEventListener('dragover', TagEditor.handleDragOver);
    card.addEventListener('drop', TagEditor.handleDrop);
    card.addEventListener('dragenter', TagEditor.handleDragEnter);
    card.addEventListener('dragleave', TagEditor.handleDragLeave);
    
    return card;
  },
  
  // Drag and Drop handlers
  draggedElement: null,
  draggedIndex: null,
  draggedContext: null,
  draggedLang: null,
  
  handleDragStart: function(e) {
    // Only allow dragging from the drag handle
    if (!e.target.classList.contains('drag-handle') && !e.target.parentElement?.classList.contains('drag-handle')) {
      e.preventDefault();
      return false;
    }
    
    TagEditor.draggedElement = this;
    TagEditor.draggedIndex = parseInt(this.dataset.index);
    TagEditor.draggedContext = this.dataset.context;
    TagEditor.draggedLang = this.dataset.lang;
    
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Add a slight delay before adding the dragging effect for smooth animation
    setTimeout(() => {
      if (this.classList.contains('dragging')) {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      }
    }, 10);
  },
  
  handleDragEnd: function(e) {
    this.classList.remove('dragging');
    this.style.transition = '';
    
    // Remove all drag indicators with smooth animation
    document.querySelectorAll('.drag-indicator').forEach(indicator => {
      indicator.classList.remove('show-top', 'show-bottom');
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
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    // Only allow drop in the same context and language
    if (!TagEditor.draggedElement || 
        this.dataset.context !== TagEditor.draggedContext || 
        this.dataset.lang !== TagEditor.draggedLang) {
      e.dataTransfer.dropEffect = 'none';
      return false;
    }
    
    // Don't show indicator on the dragged element itself
    if (this === TagEditor.draggedElement) {
      return false;
    }
    
    const rect = this.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    // Clear all indicators first
    document.querySelectorAll('.drag-indicator').forEach(indicator => {
      indicator.classList.remove('show-top', 'show-bottom');
    });
    
    // Show indicator based on mouse position
    const indicators = this.querySelectorAll('.drag-indicator');
    if (e.clientY < midpoint) {
      indicators[0]?.classList.add('show-top');
    } else {
      indicators[1]?.classList.add('show-bottom');
    }
    
    return false;
  },
  
  handleDrop: function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    e.preventDefault();
    
    // Only allow drop in the same context and language
    if (!TagEditor.draggedElement ||
        this.dataset.context !== TagEditor.draggedContext ||
        this.dataset.lang !== TagEditor.draggedLang) {
      return false;
    }
    
    const dropIndex = parseInt(this.dataset.index);
    
    if (TagEditor.draggedElement !== this && TagEditor.draggedIndex !== null) {
      const rect = this.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const insertBefore = e.clientY < midpoint;
      
      // Perform the move with animation
      if (TagEditor.draggedContext === 'image') {
        TagEditor.moveImageTag(TagEditor.draggedIndex, dropIndex, insertBefore);
      } else {
        TagEditor.moveMainTag(TagEditor.draggedIndex, dropIndex, insertBefore);
      }
    }
    
    return false;
  },
  
  handleDragEnter: function(e) {
    if (TagEditor.draggedElement &&
        this !== TagEditor.draggedElement &&
        this.dataset.context === TagEditor.draggedContext &&
        this.dataset.lang === TagEditor.draggedLang) {
      this.classList.add('drag-over');
      this.style.transition = 'all 0.2s ease';
    }
  },
  
  handleDragLeave: function(e) {
    // Only remove if we're actually leaving the element
    const relatedTarget = e.relatedTarget;
    if (!this.contains(relatedTarget)) {
      this.classList.remove('drag-over');
      this.querySelectorAll('.drag-indicator').forEach(indicator => {
        indicator.classList.remove('show-top', 'show-bottom');
      });
    }
  },
  
  // Move tag functions for drag and drop with smooth animation
  moveMainTag: (fromIndex, toIndex, insertBefore) => {
    const tags = appState.tags;
    const [movedTag] = tags.splice(fromIndex, 1);
    
    let newIndex = toIndex;
    if (fromIndex < toIndex) {
      newIndex = insertBefore ? toIndex - 1 : toIndex;
    } else {
      newIndex = insertBefore ? toIndex : toIndex + 1;
    }
    
    // Ensure index is within bounds
    newIndex = Math.max(0, Math.min(tags.length, newIndex));
    tags.splice(newIndex, 0, movedTag);
    
    // Add a small delay for smooth visual transition
    setTimeout(() => TagEditor.renderTags('main'), 50);
  },
  
  moveImageTag: (fromIndex, toIndex, insertBefore) => {
    const tags = App.imageState.imageTags;
    const [movedTag] = tags.splice(fromIndex, 1);
    
    let newIndex = toIndex;
    if (fromIndex < toIndex) {
      newIndex = insertBefore ? toIndex - 1 : toIndex;
    } else {
      newIndex = insertBefore ? toIndex : toIndex + 1;
    }
    
    // Ensure index is within bounds
    newIndex = Math.max(0, Math.min(tags.length, newIndex));
    tags.splice(newIndex, 0, movedTag);
    
    // Add a small delay for smooth visual transition
    setTimeout(() => TagEditor.renderTags('image'), 50);
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
          return `${tag.en}:${tag.weight.toFixed(1)}`;
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
    updateText: (index, lang, text) => {
      if (appState.tags[index]) {
        appState.tags[index][lang] = text;
        if (lang === 'en') {
          appState.tags[index].ja = translationDict[text.toLowerCase()] || text + ' (翻訳)';
        }
        TagEditor.renderTags('main');
      }
    },
    updateWeight: (index, weight) => {
      if (appState.tags[index]) {
        appState.tags[index].weight = parseFloat(weight);
        TagEditor.updateOutput('main');
      }
    },
    increaseWeight: (index) => {
      if (appState.tags[index]) {
        appState.tags[index].weight = Math.min(2.0, appState.tags[index].weight + 0.05);
        TagEditor.renderTags('main');
      }
    },
    decreaseWeight: (index) => {
      if (appState.tags[index]) {
        appState.tags[index].weight = Math.max(0.1, appState.tags[index].weight - 0.05);
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
    updateText: (index, lang, text) => {
      if (App.imageState.imageTags[index]) {
        App.imageState.imageTags[index][lang] = text;
        if (lang === 'en') {
          App.imageState.imageTags[index].ja = translationDict[text.toLowerCase()] || text + ' (翻訳)';
        }
        TagEditor.renderTags('image');
      }
    },
    updateWeight: (index, weight) => {
      if (App.imageState.imageTags[index]) {
        App.imageState.imageTags[index].weight = parseFloat(weight);
        TagEditor.updateOutput('image');
      }
    },
    increaseWeight: (index) => {
      if (App.imageState.imageTags[index]) {
        App.imageState.imageTags[index].weight = Math.min(2.0, App.imageState.imageTags[index].weight + 0.05);
        TagEditor.renderTags('image');
      }
    },
    decreaseWeight: (index) => {
      if (App.imageState.imageTags[index]) {
        App.imageState.imageTags[index].weight = Math.max(0.1, App.imageState.imageTags[index].weight - 0.05);
        TagEditor.renderTags('image');
      }
    },
    remove: (index) => {
      App.imageState.imageTags.splice(index, 1);
      TagEditor.renderTags('image');
    }
  }
};

// Default system prompts
const defaultSystemPrompts = {
  sdxl: `You are an expert at generating SDXL image generation tags. Convert the user's prompt into a comprehensive set of comma-separated tags.
Rules:
1. Start with quality tags: masterpiece, best quality, ultra-detailed
2. Add subject description tags
3. Include style and composition tags
4. Add lighting and atmosphere tags
5. Output format: tag1, tag2, tag3:weight, tag4
6. Use weights (0.5-2.0) for important elements
7. Output only tags, no explanations`,
  flux: `You are an expert at generating Flux image generation prompts. Convert the user's input into natural, descriptive phrases.
Rules:
1. Use natural language descriptions
2. Be specific and detailed
3. Include artistic style if relevant
4. Describe composition and lighting
5. Output format: Natural sentences that flow well
6. Output only the prompt, no explanations`,
  imagefx: `You are an expert at generating ImageFX prompts. Convert the user's input into clear instructions.
Rules:
1. Use clear, direct language
2. Specify artistic style explicitly
3. Include mood and atmosphere
4. Be concise but comprehensive
5. Output only the prompt, no explanations`,
  'imagefx-natural': `You are an expert at generating ImageFX Natural Language prompts. Convert the user's input into flowing, descriptive prose.
Rules:
1. Write in natural, flowing sentences
2. Focus on visual storytelling
3. Include sensory details
4. Maintain coherent narrative
5. Output only the descriptive text, no explanations`
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
    return targetLang === 'ja' ? translateToJapanese(text) : text;
  }
  
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLang,
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

// Categorize tag
function categorizeTag(text) {
  const categoryKeywords = {
    person: ['girl', 'boy', 'woman', 'man', 'person', 'child', 'adult', 'teen'],
    appearance: ['hair', 'eyes', 'skin', 'beautiful', 'cute', 'handsome', 'pretty', 'smile'],
    clothing: ['dress', 'shirt', 'pants', 'skirt', 'uniform', 'clothes', 'hoodie'],
    pose: ['sitting', 'standing', 'walking', 'running', 'squatting', 'dipping'],
    background: ['background', 'scenery', 'forest', 'city', 'sky', 'room', 'spring', 'water'],
    quality: ['masterpiece', 'quality', 'resolution', 'detailed', 'realistic', 'hd', '4k', '8k'],
    style: ['anime', 'realistic', 'cartoon', 'painting', 'illustration', 'digital', 'art']
  };
  
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
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
  splitText: async () => {
    const input = document.getElementById('input-text');
    if (!input || !input.value.trim()) return;
    
    const parts = input.value.split(/[,，.。、]/).filter(p => p.trim());
    
    showLoading('Splitting and translating tags...');
    
    // Create tags with AI translation if available
    const tagPromises = parts.map(async (part, i) => {
      const trimmedPart = part.trim();
      const ja = await translateWithAI(trimmedPart, 'ja');
      
      return {
        id: Date.now() + i,
        en: trimmedPart,
        ja: ja,
        weight: 1.0,
        category: categorizeTag(trimmedPart)
      };
    });
    
    appState.tags = await Promise.all(tagPromises);
    hideLoading();
    TagEditor.renderTags('main');
  },
  
  analyzeAndCategorize: async () => {
    if (appState.tags.length === 0) {
      App.splitText();
    }
    
    // Categorize existing tags
    appState.tags = appState.tags.map(tag => ({
      ...tag,
      category: categorizeTag(tag.en)
    }));
    
    TagEditor.renderTags('main');
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
    }
  },
  
  updateCustomFormatsList: () => {
    const container = document.getElementById('custom-formats-list');
    if (!container) return;
    
    const customFormats = Object.keys(appState.systemPrompts).filter(
      key => !['sdxl', 'flux', 'imagefx', 'imagefx-natural'].includes(key)
    );
    
    if (customFormats.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-sm">No custom formats added yet.</p>';
      return;
    }
    
    container.innerHTML = customFormats.map(format => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <div class="font-medium">${format.toUpperCase()}</div>
          <div class="text-xs text-gray-500">Custom format</div>
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
    ['api', 'formats', 'preferences'].forEach(t => {
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
    localStorage.setItem('openrouter-model', model);
    
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
  
  resetSettings: () => {
    if (confirm('Reset all settings to defaults?')) {
      localStorage.clear();
      location.reload();
    }
  },
  
  saveSettings: () => {
    alert('Settings saved');
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
  
  // Populate custom formats in dropdowns
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
  
  // Load saved API key
  const savedKey = localStorage.getItem('openrouter-api-key');
  if (savedKey) {
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
          
          // Load saved model selection
          const savedModel = localStorage.getItem('openrouter-model');
          if (savedModel) {
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
    analysisVisible: false
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
  
  // Update output format
  updateImageOutputFormat: () => {
    const select = document.getElementById('image-output-format');
    if (select) {
      App.imageState.imageOutputFormat = select.value;
      localStorage.setItem('image-output-format', select.value);
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
6. Focus on visual elements that can be recreated`,
      
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
      
      const formatPrompts = App.getFormatSystemPrompts();
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
      
      // Step 3: Parse and populate tag editor
      App.parsePromptToImageTags(generatedPrompt);
      
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
    
    // Categorize tags
    const categories = App.categorizeImageTags(tags.map(t => t.text));
    
    // Create tag objects with translations and categories
    tags.forEach((tag, index) => {
      const jaTranslation = translationDict[tag.text.toLowerCase()] || App.simpleTranslate(tag.text);
      
      App.imageState.imageTags.push({
        id: `img-tag-${Date.now()}-${index}`,
        en: tag.text,
        ja: jaTranslation,
        weight: tag.weight,
        category: categories[index] || 'other'
      });
    });
    
    // Update UI
    App.renderImageTags();
  },
  
  // Categorize image tags
  categorizeImageTags: (tags) => {
    const categoryPatterns = {
      person: /girl|boy|woman|man|person|child|adult|teen|1girl|2girls|1boy/i,
      appearance: /hair|eyes|face|skin|smile|beautiful|cute|handsome|pretty|tall|short/i,
      clothes: /dress|shirt|skirt|uniform|jacket|pants|shoes|hat|hoodie|suit|costume/i,
      pose: /sitting|standing|walking|running|lying|squatting|kneeling|jumping|pose/i,
      background: /background|forest|city|room|outdoor|indoor|sky|mountain|beach|street/i,
      quality: /masterpiece|best quality|detailed|8k|4k|highres|professional|sharp|hd/i,
      style: /anime|realistic|cartoon|painting|digital|watercolor|sketch|artistic|style/i
    };
    
    return tags.map(tag => {
      for (const [category, pattern] of Object.entries(categoryPatterns)) {
        if (pattern.test(tag)) {
          return category;
        }
      }
      return 'other';
    });
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
      App.renderImageTags();
    }
  },
  
  // Decrease image weight
  decreaseImageWeight: (index) => {
    if (App.imageState.imageTags[index]) {
      const currentWeight = App.imageState.imageTags[index].weight;
      const newWeight = Math.max(0.1, currentWeight - 0.05);
      App.imageState.imageTags[index].weight = Math.round(newWeight * 100) / 100;
      App.renderImageTags();
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
      App.renderImageTags();
    }
  },
  
  // Move image tag
  moveImageTag: (index, direction) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < App.imageState.imageTags.length) {
      const temp = App.imageState.imageTags[index];
      App.imageState.imageTags[index] = App.imageState.imageTags[newIndex];
      App.imageState.imageTags[newIndex] = temp;
      App.renderImageTags();
    }
  },
  
  // Remove image tag
  removeImageTag: (index) => {
    App.imageState.imageTags.splice(index, 1);
    App.renderImageTags();
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
  
  // Add new image tag
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
      if (appState.apiKey) {
        newTag.en = await translateWithAI(text, 'en');
      } else {
        newTag.en = App.reverseTranslate(text);
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
    
    App.renderImageTags();
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
    // TODO: Implement modal for editing system prompts
    showNotification('System prompt editor coming soon', 'info');
  },
  
  // Add custom format for image
  addImageCustomFormat: () => {
    // TODO: Implement custom format addition
    showNotification('Custom format addition coming soon', 'info');
  }
});

// Initialize Image to Prompt on load
document.addEventListener('DOMContentLoaded', () => {
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