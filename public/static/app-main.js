// SS Prompt Manager - Main Application Logic (Modular Version)
// This file provides the App global object for HTML onclick handlers

// Import modules
import { translationDict } from './modules/config/dictionary.js';
import { defaultSystemPrompts, defaultMainSystemPrompts, defaultUtilityPrompts, AI_OUTPUT_SCHEMAS } from './modules/config/prompts.js';
import { showLoading, hideLoading, showNotification, loadPromptToTextarea, getElementValue, setElementValue } from './modules/utils/dom.js';
import { getStorageItem, setStorageItem, getApiKey, getSelectedModel, getSystemPrompts, setSystemPrompts, getAIInstructionsPrompts, setAIInstructionsPrompts } from './modules/utils/storage.js';
import { parseComplexTags, parseWeightedTag, cleanJSONResponse, generateOutput, validateJSON } from './modules/utils/text.js';
import { translateText, generateBilingualTags, categorizeTags, processImage, batchTranslateTags, validateAIResponse } from './modules/ai/translator.js';
import { TagEditor } from './modules/components/tag-editor.js';

// 🎯 APPLICATION STATE
// Global application state with user-editable AI prompts
const appState = {
  tags: [],
  currentTab: 'text',
  outputFormat: 'sdxl',
  finalOutputFormat: 'sdxl', // Separate format for Final Output
  settingsOpen: false,
  apiKey: getApiKey(),
  selectedModel: getSelectedModel(),
  systemPrompts: getSystemPrompts(defaultSystemPrompts),
  editingPrompt: null // Currently editing prompt format
};

// 🔧 LEGACY TRANSLATION SUPPORT
// Dictionary-based translation fallback when AI is not available
function translateToEnglish(japaneseText) {
  // Find translation in dictionary
  for (const [en, ja] of Object.entries(translationDict)) {
    if (ja === japaneseText) {
      return en;
    }
  }
  
  // If not found in dictionary, return as-is
  return japaneseText;
}

// AI-powered translation using backend API
async function translateWithAI(text, targetLang = 'ja', format = 'standard') {
  return await translateText(text, targetLang, { format, apiKey: appState.apiKey, model: appState.selectedModel });
}

// JSON Processing Functions - Clean and validate AI outputs
const JsonProcessor = {
  
  // Clean and parse JSON from AI response (remove markdown, etc.)
  cleanAndParse: (rawText) => {
    try {
      const cleaned = cleanJSONResponse(rawText);
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
  
  // Split long narrative tags into smaller components
  splitLongNarrative: (enText, jaText, weight) => {
    const enParts = enText.split(/,\s+/).filter(part => part.length > 0);
    const jaParts = jaText ? jaText.split(/[、,]\s*/).filter(part => part.length > 0) : [];
    
    const splitTags = [];
    
    for (let i = 0; i < enParts.length; i++) {
      splitTags.push({
        id: `split-${Date.now()}-${i}`,
        en: enParts[i].trim(),
        ja: jaParts[i] || '',
        weight: weight,
        category: 'other'
      });
    }
    
    return splitTags.length > 0 ? splitTags : [{
      id: `fallback-${Date.now()}`,
      en: enText,
      ja: jaText,
      weight: weight,
      category: 'other'
    }];
  }
};

// 🚀 MAIN APPLICATION OBJECT
// Global App object accessible from HTML onclick handlers
window.App = {
  // Advanced tag parsing with weight notation and escape character support
  parseComplexTags: parseComplexTags,
  parseWeightedTag: parseWeightedTag,

  splitText: async () => {
    const input = document.getElementById('input-text');
    if (!input || !input.value.trim()) return;
    
    showLoading('Splitting and translating tags...');
    
    try {
      // Advanced tag parsing with weight support
      const parsedTags = parseComplexTags(input.value);
      
      // Convert to bilingual format with translation
      const bilingualTags = [];
      for (let tag of parsedTags) {
        let englishText = tag.text;
        let japaneseText = '';
        
        // Detect if input is Japanese and translate
        if (/[ひらがなカタカナ漢字]/.test(tag.text)) {
          // Input is Japanese
          japaneseText = tag.text;
          if (appState.apiKey) {
            englishText = await translateWithAI(tag.text, 'en');
          } else {
            englishText = translateToEnglish(tag.text);
          }
        } else {
          // Input is English - translate to Japanese
          englishText = tag.text;
          if (appState.apiKey) {
            japaneseText = await translateWithAI(tag.text, 'ja');
          } else {
            japaneseText = translationDict[tag.text] || tag.text;
          }
        }
        
        bilingualTags.push({
          id: Date.now() + Math.random(),
          en: englishText,
          ja: japaneseText,
          weight: tag.weight,
          category: 'other' // Will be categorized later if needed
        });
      }
      
      // Add to existing tags
      appState.tags.push(...bilingualTags);
      
      // Render updated tags
      TagEditor.renderTags('main');
      
      // Clear input
      input.value = '';
      
      hideLoading();
      showNotification(`Added ${bilingualTags.length} tags`, 'success');
    } catch (error) {
      hideLoading();
      showNotification(`Error: ${error.message}`, 'error');
    }
  },

  generateFromStory: async () => {
    const input = document.getElementById('input-text');
    if (!input || !input.value.trim()) {
      showNotification('Please enter story text', 'error');
      return;
    }
    
    if (!appState.apiKey) {
      showNotification('API key required for story generation', 'error');
      return;
    }
    
    showLoading('Generating tags from story...');
    
    try {
      const storyText = input.value.trim();
      const format = appState.outputFormat;
      
      const generatedTags = await generateBilingualTags(storyText, format, {
        apiKey: appState.apiKey,
        model: appState.selectedModel,
        customPrompt: appState.systemPrompts[format]
      });
      
      if (generatedTags.length > 0) {
        // Replace existing tags with generated ones
        appState.tags = generatedTags;
        TagEditor.renderTags('main');
        input.value = '';
        showNotification(`Generated ${generatedTags.length} tags from story`, 'success');
      } else {
        showNotification('No tags generated from story', 'warning');
      }
    } catch (error) {
      showNotification(`Story generation failed: ${error.message}`, 'error');
    } finally {
      hideLoading();
    }
  },

  clearTags: () => {
    appState.tags = [];
    TagEditor.renderTags('main');
    showNotification('Tags cleared', 'success');
  },

  categorize: async () => {
    if (!appState.apiKey) {
      showNotification('API key required for categorization', 'error');
      return;
    }
    
    if (appState.tags.length === 0) {
      showNotification('No tags to categorize', 'warning');
      return;
    }
    
    showLoading('Categorizing tags...');
    
    try {
      const categorizedTags = await categorizeTags(appState.tags, {
        apiKey: appState.apiKey,
        model: appState.selectedModel
      });
      
      appState.tags = categorizedTags;
      TagEditor.renderTags('main');
      showNotification('Tags categorized successfully', 'success');
    } catch (error) {
      showNotification(`Categorization failed: ${error.message}`, 'error');
    } finally {
      hideLoading();
    }
  },

  switchTab: (tabName) => {
    appState.currentTab = tabName;
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.add('hidden');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
      selectedTab.classList.remove('hidden');
    }
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('bg-purple-600', 'text-white');
      button.classList.add('bg-white', 'text-purple-600');
    });
    
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
      activeButton.classList.remove('bg-white', 'text-purple-600');
      activeButton.classList.add('bg-purple-600', 'text-white');
    }
  },

  switchFormat: (format, type = 'output') => {
    if (type === 'final') {
      appState.finalOutputFormat = format;
    } else {
      appState.outputFormat = format;
    }
    
    TagEditor.updateOutput('main');
    
    // Update UI buttons
    const buttonGroup = type === 'final' ? 'final-format-buttons' : 'format-buttons';
    const buttons = document.querySelectorAll(`#${buttonGroup} button`);
    buttons.forEach(btn => {
      btn.classList.remove('bg-purple-600', 'text-white');
      btn.classList.add('bg-white', 'text-purple-600', 'border-purple-600');
    });
    
    const activeButton = document.querySelector(`#${buttonGroup} [data-format="${format}"]`);
    if (activeButton) {
      activeButton.classList.remove('bg-white', 'text-purple-600', 'border-purple-600');
      activeButton.classList.add('bg-purple-600', 'text-white');
    }
  },

  toggleSettings: () => {
    appState.settingsOpen = !appState.settingsOpen;
    const settings = document.getElementById('settings');
    if (settings) {
      if (appState.settingsOpen) {
        settings.classList.remove('hidden');
        // Load current settings
        App.loadSettings();
      } else {
        settings.classList.add('hidden');
      }
    }
  },

  loadSettings: () => {
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    
    if (apiKeyInput) {
      apiKeyInput.value = appState.apiKey;
    }
    
    if (modelSelect) {
      modelSelect.value = appState.selectedModel;
    }
  },

  saveSettings: () => {
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    
    if (apiKeyInput) {
      appState.apiKey = apiKeyInput.value.trim();
      setStorageItem('openrouter-api-key', appState.apiKey);
    }
    
    if (modelSelect) {
      appState.selectedModel = modelSelect.value;
      setStorageItem('selected-model', appState.selectedModel);
    }
    
    showNotification('Settings saved', 'success');
  },

  // Image Analysis State and Functions
  imageState: {
    imageTags: [],
    imageOutputFormat: 'sdxl',
    imageFinalFormat: 'sdxl',
    currentImageUrl: null
  },

  uploadImage: async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }
    
    showLoading('Processing image...');
    
    try {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      App.imageState.currentImageUrl = imageUrl;
      
      // Show preview
      const preview = document.getElementById('image-preview');
      if (preview) {
        preview.src = imageUrl;
        preview.classList.remove('hidden');
      }
      
      // For demo purposes, we'll process the image locally
      // In a real implementation, you'd upload to a server first
      const generatedTags = await processImage(imageUrl, {
        apiKey: appState.apiKey,
        model: appState.selectedModel
      });
      
      App.imageState.imageTags = generatedTags;
      TagEditor.renderTags('image');
      
      showNotification(`Generated ${generatedTags.length} tags from image`, 'success');
    } catch (error) {
      showNotification(`Image processing failed: ${error.message}`, 'error');
    } finally {
      hideLoading();
    }
  },

  switchImageFormat: (format, type = 'output') => {
    if (type === 'final') {
      App.imageState.imageFinalFormat = format;
    } else {
      App.imageState.imageOutputFormat = format;
    }
    
    TagEditor.updateOutput('image');
    
    // Update UI buttons
    const buttonGroup = type === 'final' ? 'image-final-format-buttons' : 'image-format-buttons';
    const buttons = document.querySelectorAll(`#${buttonGroup} button`);
    buttons.forEach(btn => {
      btn.classList.remove('bg-purple-600', 'text-white');
      btn.classList.add('bg-white', 'text-purple-600', 'border-purple-600');
    });
    
    const activeButton = document.querySelector(`#${buttonGroup} [data-format="${format}"]`);
    if (activeButton) {
      activeButton.classList.remove('bg-white', 'text-purple-600', 'border-purple-600');
      activeButton.classList.add('bg-purple-600', 'text-white');
    }
  },

  copyImageOutput: () => {
    const output = document.getElementById('image-final-output');
    if (output && output.value) {
      navigator.clipboard.writeText(output.value).then(() => {
        showNotification('Output copied to clipboard', 'success');
      }).catch(() => {
        showNotification('Failed to copy to clipboard', 'error');
      });
    }
  },

  clearImageTags: () => {
    App.imageState.imageTags = [];
    TagEditor.renderTags('image');
    showNotification('Image tags cleared', 'success');
  },

  // JSON response cleaning and validation
  cleanJSONResponse: cleanJSONResponse,
  
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
    const prompts = getAIInstructionsPrompts();
    
    switch (tab) {
      case 'text-generation':
        loadPromptToTextarea('ai-sdxl-prompt', prompts.sdxl || appState.systemPrompts.sdxl);
        loadPromptToTextarea('ai-flux-prompt', prompts.flux || appState.systemPrompts.flux);
        loadPromptToTextarea('ai-imagefx-prompt', prompts.imagefx || appState.systemPrompts.imagefx);
        loadPromptToTextarea('ai-imagefx-natural-prompt', prompts['imagefx-natural'] || appState.systemPrompts['imagefx-natural']);
        break;
        
      case 'image-processing':
        loadPromptToTextarea('ai-image-analysis-prompt', prompts['image-analysis'] || App.getDefaultImageAnalysisPrompt());
        loadPromptToTextarea('ai-image-tag-generation-prompt', prompts['image-tag-generation'] || App.getDefaultImageTagGenerationPrompt());
        break;
        
      case 'translation':
        loadPromptToTextarea('ai-translation-en-ja-prompt', prompts['translation-en-ja'] || App.getDefaultTranslationPrompt('en-ja'));
        loadPromptToTextarea('ai-translation-ja-en-prompt', prompts['translation-ja-en'] || App.getDefaultTranslationPrompt('ja-en'));
        loadPromptToTextarea('ai-custom-translation-prompt', prompts['custom-translation'] || App.getDefaultCustomTranslationPrompt());
        break;
        
      case 'advanced':
        loadPromptToTextarea('ai-categorizer-prompt', prompts['categorizer'] || App.getDefaultCategorizerPrompt());
        loadPromptToTextarea('ai-json-schema-prompt', prompts['json-schema'] || App.getDefaultJSONSchemaPrompt());
        loadPromptToTextarea('ai-error-handling-prompt', prompts['error-handling'] || App.getDefaultErrorHandlingPrompt());
        App.loadAIParameters();
        break;
    }
  },
  
  // Save specific AI prompt
  saveAIPrompt: (promptType) => {
    const prompts = getAIInstructionsPrompts();
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
      setAIInstructionsPrompts(prompts);
      
      // Also update system prompts for backward compatibility
      if (['sdxl', 'flux', 'imagefx', 'imagefx-natural'].includes(promptType)) {
        appState.systemPrompts[promptType] = textarea.value.trim();
        setSystemPrompts(appState.systemPrompts);
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
    const params = getStorageItem('ai-global-parameters', {});
    
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
    const params = getStorageItem('ai-global-parameters', {});
    params[paramName] = parseFloat(value) || value;
    setStorageItem('ai-global-parameters', params);
    
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
      
      // Reload current prompts in UI
      App.loadAIPromptsForTab(App.currentAIInstructionsTab);
      App.loadAIParameters();
      
      showNotification('全てのAI指示をデフォルトに戻しました', 'success');
    }
  },

  // Utility prompt getters (for backward compatibility)
  getDefaultTranslationPrompt: (direction) => {
    return defaultUtilityPrompts[`translation-${direction}`] || defaultUtilityPrompts['translation-en-ja'];
  },
  
  getDefaultCustomTranslationPrompt: () => {
    return defaultUtilityPrompts['translation-custom'];
  },
  
  getDefaultCategorizerPrompt: () => {
    return defaultUtilityPrompts['categorizer'];
  },
  
  getDefaultImageAnalysisPrompt: () => {
    return defaultUtilityPrompts['image-analysis'];
  },
  
  getDefaultImageTagGenerationPrompt: () => {
    return defaultUtilityPrompts['tag-normalizer'];
  },
  
  getDefaultJSONSchemaPrompt: () => {
    return 'Ensure all AI responses follow the specified JSON schema format with proper validation.';
  },
  
  getDefaultErrorHandlingPrompt: () => {
    return 'Handle errors gracefully and provide meaningful feedback to users when AI operations fail.';
  }
};

// Make necessary functions globally available for backward compatibility
window.translateWithAI = translateWithAI;
window.translateToEnglish = translateToEnglish;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showNotification = showNotification;
window.appState = appState;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize default tab
  App.switchTab('text');
  
  // Load settings
  App.loadSettings();
  
  // Initialize AI instructions
  App.setAIInstructionsTab('text-generation');
  
  console.log('SS Prompt Manager - Modular version loaded successfully');
});