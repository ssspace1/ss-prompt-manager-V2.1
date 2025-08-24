// SS Prompt Manager - Storage Utility Functions
// This module handles localStorage operations and data persistence

/**
 * Get item from localStorage with JSON parsing
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Parsed value or default
 */
export function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage item ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage with JSON stringification
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
  }
}

/**
 * Get string item from localStorage (without JSON parsing)
 * @param {string} key - Storage key
 * @param {string} defaultValue - Default value if key doesn't exist
 * @returns {string} Storage value or default
 */
export function getStorageString(key, defaultValue = '') {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage string ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Set string item in localStorage (without JSON stringification)
 * @param {string} key - Storage key
 * @param {string} value - String value to store
 */
export function setStorageString(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting localStorage string ${key}:`, error);
  }
}

/**
 * Clear all localStorage data for the app
 * @param {string[]} keysToKeep - Array of keys to preserve
 */
export function clearAppStorage(keysToKeep = []) {
  const appKeys = [
    'openrouter-api-key',
    'selected-model', 
    'system-prompts',
    'ai-instructions-prompts',
    'ai-global-parameters',
    'app-settings'
  ];
  
  appKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      removeStorageItem(key);
    }
  });
}

/**
 * Get API key from storage
 * @returns {string} API key or empty string
 */
export function getApiKey() {
  return getStorageString('openrouter-api-key', '');
}

/**
 * Set API key in storage
 * @param {string} apiKey - API key to store
 */
export function setApiKey(apiKey) {
  setStorageString('openrouter-api-key', apiKey);
}

/**
 * Get selected model from storage
 * @returns {string} Selected model or default
 */
export function getSelectedModel() {
  return getStorageString('selected-model', 'openai/gpt-4o-mini');
}

/**
 * Set selected model in storage
 * @param {string} model - Model to store
 */
export function setSelectedModel(model) {
  setStorageString('selected-model', model);
}

/**
 * Get system prompts from storage
 * @param {object} defaultPrompts - Default prompts to merge with
 * @returns {object} System prompts object
 */
export function getSystemPrompts(defaultPrompts = {}) {
  const saved = getStorageItem('system-prompts', {});
  // Remove test format from saved prompts (cleanup)
  delete saved.test;
  const merged = { ...defaultPrompts, ...saved };
  // Ensure test format is not in merged result
  delete merged.test;
  return merged;
}

/**
 * Set system prompts in storage
 * @param {object} prompts - Prompts object to store
 */
export function setSystemPrompts(prompts) {
  // Remove test format before saving
  const cleanPrompts = { ...prompts };
  delete cleanPrompts.test;
  setStorageItem('system-prompts', cleanPrompts);
}

/**
 * Get AI instructions prompts from storage
 * @returns {object} AI instructions prompts
 */
export function getAIInstructionsPrompts() {
  return getStorageItem('ai-instructions-prompts', {});
}

/**
 * Set AI instructions prompts in storage
 * @param {object} prompts - AI instructions prompts to store
 */
export function setAIInstructionsPrompts(prompts) {
  setStorageItem('ai-instructions-prompts', prompts);
}

/**
 * Get AI global parameters from storage
 * @returns {object} AI global parameters
 */
export function getAIGlobalParameters() {
  return getStorageItem('ai-global-parameters', {});
}

/**
 * Set AI global parameters in storage
 * @param {object} params - AI global parameters to store
 */
export function setAIGlobalParameters(params) {
  setStorageItem('ai-global-parameters', params);
}

/**
 * Export all app data for backup
 * @returns {object} All app data
 */
export function exportAppData() {
  return {
    apiKey: getApiKey(),
    selectedModel: getSelectedModel(),
    systemPrompts: getStorageItem('system-prompts', {}),
    aiInstructionsPrompts: getAIInstructionsPrompts(),
    aiGlobalParameters: getAIGlobalParameters(),
    exportDate: new Date().toISOString()
  };
}

/**
 * Import app data from backup
 * @param {object} data - App data to import
 * @returns {boolean} Success status
 */
export function importAppData(data) {
  try {
    if (data.apiKey) setApiKey(data.apiKey);
    if (data.selectedModel) setSelectedModel(data.selectedModel);
    if (data.systemPrompts) setStorageItem('system-prompts', data.systemPrompts);
    if (data.aiInstructionsPrompts) setAIInstructionsPrompts(data.aiInstructionsPrompts);
    if (data.aiGlobalParameters) setAIGlobalParameters(data.aiGlobalParameters);
    
    return true;
  } catch (error) {
    console.error('Error importing app data:', error);
    return false;
  }
}