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

// Render tags
function renderTags() {
  const enContainer = document.getElementById('tags-en');
  const jaContainer = document.getElementById('tags-ja');
  
  if (!enContainer || !jaContainer) return;
  
  enContainer.innerHTML = '';
  jaContainer.innerHTML = '';
  
  appState.tags.forEach(tag => {
    enContainer.appendChild(createTagElement(tag, 'en'));
    jaContainer.appendChild(createTagElement(tag, 'ja'));
  });
  
  updateOutput();
}

// Update output
function updateOutput() {
  const outputElement = document.getElementById('output-text');
  if (!outputElement) return;
  
  if (appState.tags.length === 0) {
    outputElement.textContent = 'No output generated yet...';
    return;
  }
  
  // Use finalOutputFormat for display, not the generation format
  const format = appState.finalOutputFormat || 'sdxl';
  let output = '';
  
  if (format === 'sdxl') {
    output = appState.tags.map(tag => {
      if (tag.weight !== 1.0) {
        return `(${tag.en}:${tag.weight.toFixed(2)})`;
      }
      return tag.en;
    }).join(', ');
  } else if (format === 'flux') {
    output = appState.tags.map(tag => tag.en).join('. ') + '.';
  } else if (format === 'imagefx' || format === 'imagefx-natural') {
    // Natural language format
    output = appState.tags.map(tag => tag.en).join(', ') + '.';
  } else {
    // Custom formats - default to comma-separated
    output = appState.tags.map(tag => tag.en).join(', ');
  }
  
  outputElement.textContent = output;
  
  // Update image prompt preview
  const previewElement = document.getElementById('image-prompt-preview');
  if (previewElement) {
    previewElement.textContent = output || 'No prompt available';
  }
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
    renderTags();
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
    
    renderTags();
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
    renderTags();
  },
  
  translateAll: (direction) => {
    // Already translated
    renderTags();
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
    renderTags();
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