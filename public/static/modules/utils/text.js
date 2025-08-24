// SS Prompt Manager - Text Processing Utility Functions
// This module contains text parsing, cleaning, and formatting functions

/**
 * Advanced tag parsing with weight notation and escape character support
 * @param {string} text - Input text to parse
 * @returns {Array} Array of tag objects with text and weight
 */
export function parseComplexTags(text) {
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
        const weightedTag = parseWeightedTag(current.trim());
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
}

/**
 * Parse weighted tag notation like "tag:1.2" or just "tag"
 * @param {string} content - Tag content to parse
 * @returns {object} Tag object with text and weight
 */
export function parseWeightedTag(content) {
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
}

/**
 * Clean JSON response text by removing markdown formatting and non-JSON content
 * @param {string} text - Raw response text
 * @returns {string} Cleaned JSON text
 */
export function cleanJSONResponse(text) {
  if (!text) return '';
  
  let cleaned = text.trim();
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*\n?/gi, '');
  cleaned = cleaned.replace(/```\s*\n?/g, '');
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(Here's|Here is|The result is|Output:|Result:)\s*/i, '');
  
  // Remove trailing periods or explanations after JSON
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonEnd !== -1) {
    cleaned = cleaned.substring(0, jsonEnd + 1);
  }
  
  // Ensure we have valid JSON boundaries
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
}

/**
 * Generate formatted output string from tags
 * @param {Array} tags - Array of tag objects
 * @param {string} format - Output format ('sdxl', 'flux', 'natural')
 * @param {string} lang - Language ('en' or 'ja')
 * @returns {string} Formatted output string
 */
export function generateOutput(tags, format, lang = 'en') {
  if (!tags || tags.length === 0) return '';
  
  switch (format) {
    case 'natural':
      return generateNaturalOutput(tags, lang);
    case 'weighted':
      return generateWeightedOutput(tags, lang);
    default:
      return generateStandardOutput(tags, lang);
  }
}

/**
 * Generate natural language output
 * @param {Array} tags - Array of tag objects
 * @param {string} lang - Language
 * @returns {string} Natural language output
 */
function generateNaturalOutput(tags, lang) {
  return tags
    .map(tag => tag[lang] || tag.text)
    .join(', ');
}

/**
 * Generate weighted output with parentheses notation
 * @param {Array} tags - Array of tag objects
 * @param {string} lang - Language
 * @returns {string} Weighted output
 */
function generateWeightedOutput(tags, lang) {
  return tags
    .map(tag => {
      const text = tag[lang] || tag.text;
      if (tag.weight && tag.weight !== 1.0) {
        return `(${text}:${tag.weight})`;
      }
      return text;
    })
    .join(', ');
}

/**
 * Generate standard comma-separated output
 * @param {Array} tags - Array of tag objects
 * @param {string} lang - Language
 * @returns {string} Standard output
 */
function generateStandardOutput(tags, lang) {
  return tags
    .map(tag => tag[lang] || tag.text)
    .join(', ');
}

/**
 * Escape special characters in text for safe display
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Count words in text
 * @param {string} text - Text to count
 * @returns {number} Word count
 */
export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Validate JSON string
 * @param {string} jsonString - JSON string to validate
 * @returns {object|null} Parsed JSON or null if invalid
 */
export function validateJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}