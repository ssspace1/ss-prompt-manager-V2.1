// SS Prompt Manager - AI Translation Functions
// This module handles AI translation requests and processing

import { cleanJSONResponse } from '../utils/text.js';
import { showNotification } from '../utils/dom.js';
import { getApiKey, getSelectedModel } from '../utils/storage.js';

/**
 * Make AI translation request
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language ('ja' or 'en')
 * @param {object} options - Additional options
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, targetLang = 'ja', options = {}) {
  const {
    format = 'standard',
    customPrompt = null,
    apiKey = null,
    model = null
  } = options;

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLang,
        format,
        customPrompt,
        apiKey: apiKey || getApiKey(),
        model: model || getSelectedModel()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translation || text;
  } catch (error) {
    console.error('Translation error:', error);
    showNotification(`Translation failed: ${error.message}`, 'error');
    return text; // Return original text on error
  }
}

/**
 * Generate bilingual tags from story text using AI
 * @param {string} storyText - Input story text
 * @param {string} format - AI format to use ('sdxl', 'flux', 'imagefx')
 * @param {object} options - Additional options
 * @returns {Promise<Array>} Array of bilingual tag objects
 */
export async function generateBilingualTags(storyText, format = 'sdxl', options = {}) {
  const {
    apiKey = null,
    model = null,
    customPrompt = null
  } = options;

  try {
    const response = await fetch('/api/generate-tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: storyText.trim(),
        format,
        customPrompt,
        apiKey: apiKey || getApiKey(),
        model: model || getSelectedModel()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Try to parse the AI response
    if (data.result) {
      const cleaned = cleanJSONResponse(data.result);
      const parsed = JSON.parse(cleaned);
      
      if (parsed.pairs && Array.isArray(parsed.pairs)) {
        return parsed.pairs.map((pair, index) => ({
          id: Date.now() + index,
          ...pair,
          weight: pair.weight || 1.0,
          category: pair.category || 'other'
        }));
      }
    }

    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Tag generation error:', error);
    showNotification(`Tag generation failed: ${error.message}`, 'error');
    return [];
  }
}

/**
 * Categorize existing tags using AI
 * @param {Array} tags - Array of tag objects to categorize
 * @param {object} options - Additional options
 * @returns {Promise<Array>} Array of categorized tag objects
 */
export async function categorizeTags(tags, options = {}) {
  const {
    apiKey = null,
    model = null,
    customPrompt = null
  } = options;

  try {
    const tagTexts = tags.map(tag => tag.text || tag.en || tag.ja).filter(Boolean);
    
    if (tagTexts.length === 0) {
      return tags;
    }

    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tags: tagTexts,
        customPrompt,
        apiKey: apiKey || getApiKey(),
        model: model || getSelectedModel()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.result) {
      const cleaned = cleanJSONResponse(data.result);
      const parsed = JSON.parse(cleaned);
      
      if (parsed.tags && Array.isArray(parsed.tags)) {
        // Map categories back to original tags
        return tags.map((tag, index) => {
          const categorized = parsed.tags[index];
          return {
            ...tag,
            category: categorized?.category || tag.category || 'other'
          };
        });
      }
    }

    return tags;
  } catch (error) {
    console.error('Categorization error:', error);
    showNotification(`Categorization failed: ${error.message}`, 'error');
    return tags;
  }
}

/**
 * Process image and generate tags using AI
 * @param {string} imageUrl - URL of image to process
 * @param {object} options - Additional options
 * @returns {Promise<Array>} Array of generated tag objects
 */
export async function processImage(imageUrl, options = {}) {
  const {
    apiKey = null,
    model = null,
    analysisPrompt = null,
    tagPrompt = null
  } = options;

  try {
    // First, analyze the image
    const analysisResponse = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageUrl,
        customPrompt: analysisPrompt,
        apiKey: apiKey || getApiKey(),
        model: model || getSelectedModel()
      })
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Analysis failed: ${analysisResponse.statusText}`);
    }

    const analysisData = await analysisResponse.json();
    
    if (!analysisData.analysis) {
      throw new Error('No analysis result received');
    }

    // Then, convert analysis to tags
    const tagsResponse = await fetch('/api/analysis-to-tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        analysis: analysisData.analysis,
        customPrompt: tagPrompt,
        apiKey: apiKey || getApiKey(),
        model: model || getSelectedModel()
      })
    });

    if (!tagsResponse.ok) {
      const errorData = await tagsResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Tag generation failed: ${tagsResponse.statusText}`);
    }

    const tagsData = await tagsResponse.json();
    
    if (tagsData.result) {
      const cleaned = cleanJSONResponse(tagsData.result);
      const parsed = JSON.parse(cleaned);
      
      if (parsed.pairs && Array.isArray(parsed.pairs)) {
        return parsed.pairs.map((pair, index) => ({
          id: Date.now() + index,
          ...pair,
          weight: pair.weight || 1.0,
          category: pair.category || 'other'
        }));
      }
    }

    throw new Error('Invalid tag generation response');
  } catch (error) {
    console.error('Image processing error:', error);
    showNotification(`Image processing failed: ${error.message}`, 'error');
    return [];
  }
}

/**
 * Batch translate multiple tags
 * @param {Array} tags - Array of tag objects to translate
 * @param {string} fromLang - Source language
 * @param {string} toLang - Target language
 * @param {object} options - Additional options
 * @returns {Promise<Array>} Array of translated tag objects
 */
export async function batchTranslateTags(tags, fromLang, toLang, options = {}) {
  const {
    batchSize = 10,
    delay = 100
  } = options;

  const results = [];
  
  for (let i = 0; i < tags.length; i += batchSize) {
    const batch = tags.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (tag) => {
      const sourceText = tag[fromLang] || tag.text;
      if (!sourceText) return tag;
      
      try {
        const translated = await translateText(sourceText, toLang, options);
        return {
          ...tag,
          [toLang]: translated
        };
      } catch (error) {
        console.error(`Failed to translate: ${sourceText}`, error);
        return tag;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < tags.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * Validate AI response format
 * @param {string} response - AI response to validate
 * @param {string} expectedFormat - Expected format type
 * @returns {object|null} Parsed response or null if invalid
 */
export function validateAIResponse(response, expectedFormat = 'bilingual') {
  try {
    const cleaned = cleanJSONResponse(response);
    const parsed = JSON.parse(cleaned);
    
    switch (expectedFormat) {
      case 'bilingual':
        if (parsed.pairs && Array.isArray(parsed.pairs)) {
          return parsed;
        }
        break;
      case 'categorization':
        if (parsed.tags && Array.isArray(parsed.tags)) {
          return parsed;
        }
        break;
      case 'structured':
        if (parsed.tags && Array.isArray(parsed.tags)) {
          return parsed;
        }
        break;
      default:
        return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('AI response validation error:', error);
    return null;
  }
}