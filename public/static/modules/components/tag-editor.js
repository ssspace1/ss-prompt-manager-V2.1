// SS Prompt Manager - Tag Editor Component
// This module contains the tag editor system with drag & drop functionality

import { showLoading, hideLoading, showNotification } from '../utils/dom.js';
import { generateOutput } from '../utils/text.js';

/**
 * Tag Editor Component - Handles bilingual tag display and manipulation
 */
export const TagEditor = {
  // Drag and drop state
  draggedElement: null,
  draggedIndex: null,
  draggedContext: null,
  draggedLang: null,

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

  /**
   * Get context-specific data for tag operations
   * @param {string} context - Context ('main' or 'image')
   * @returns {object} Context data object
   */
  getContext: (context = 'main') => {
    if (context === 'image') {
      return {
        tags: window.App?.imageState?.imageTags || [],
        outputFormat: window.App?.imageState?.imageOutputFormat || 'sdxl',
        finalFormat: window.App?.imageState?.imageFinalFormat || 'sdxl',
        enContainer: 'image-tags-en',
        jaContainer: 'image-tags-ja',
        finalOutput: 'image-final-output',
        generatedOutput: 'image-generated-prompt'
      };
    }
    return {
      tags: window.appState?.tags || [],
      outputFormat: window.appState?.outputFormat || 'sdxl',
      finalFormat: window.appState?.finalOutputFormat || 'sdxl',
      enContainer: 'tags-en',
      jaContainer: 'tags-ja',
      finalOutput: 'output-text',
      generatedOutput: null
    };
  },

  /**
   * Render tags in the UI containers
   * @param {string} context - Context to render ('main' or 'image')
   */
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

  /**
   * Create a drop zone indicator
   * @param {number} index - Drop zone index
   * @param {string} lang - Language ('en' or 'ja')
   * @param {string} context - Context ('main' or 'image')
   * @returns {HTMLElement} Drop zone element
   */
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

  /**
   * Create a tag card element with drag and drop
   * @param {object} tag - Tag data object
   * @param {number} index - Tag index
   * @param {string} lang - Language ('en' or 'ja')
   * @param {string} colorClass - CSS color class
   * @param {string} context - Context ('main' or 'image')
   * @returns {HTMLElement} Tag card element
   */
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

  /**
   * Make tag text editable on double-click
   * @param {number} index - Tag index
   * @param {string} lang - Language
   * @param {string} context - Context
   */
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

  // Drag and Drop Event Handlers
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

  /**
   * Move tag to specific position for drop zones (main context)
   * @param {number} fromIndex - Source index
   * @param {number} toPosition - Target position
   */
  moveMainTagToPosition: (fromIndex, toPosition) => {
    const tags = window.appState.tags;
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

  /**
   * Move tag to specific position for drop zones (image context)
   * @param {number} fromIndex - Source index
   * @param {number} toPosition - Target position
   */
  moveImageTagToPosition: (fromIndex, toPosition) => {
    const tags = window.App.imageState.imageTags;
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

  /**
   * Update output displays
   * @param {string} context - Context to update
   */
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

  /**
   * Format output based on format type
   * @param {Array} tags - Array of tag objects
   * @param {string} format - Output format
   * @returns {string} Formatted output string
   */
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
      if (newIndex >= 0 && newIndex < window.appState.tags.length) {
        [window.appState.tags[index], window.appState.tags[newIndex]] = 
        [window.appState.tags[newIndex], window.appState.tags[index]];
        TagEditor.renderTags('main');
      }
    },
    updateText: async (index, lang, text) => {
      if (window.appState.tags[index]) {
        window.appState.tags[index][lang] = text;
        
        // Translate to the other language
        if (lang === 'en') {
          // Translate English to Japanese
          if (typeof window.translateWithAI === 'function') {
            window.appState.tags[index].ja = await window.translateWithAI(text, 'ja');
          }
        } else {
          // Translate Japanese to English
          if (window.appState.apiKey && typeof window.translateWithAI === 'function') {
            window.appState.tags[index].en = await window.translateWithAI(text, 'en');
          } else if (typeof window.translateToEnglish === 'function') {
            window.appState.tags[index].en = window.translateToEnglish(text);
          }
        }
        
        TagEditor.renderTags('main');
      }
    },
    updateWeight: (index, weight) => {
      if (window.appState.tags[index]) {
        window.appState.tags[index].weight = parseFloat(weight);
        TagEditor.renderTags('main');
      }
    },
    increaseWeight: (index) => {
      if (window.appState.tags[index]) {
        window.appState.tags[index].weight = Math.min(2.0, window.appState.tags[index].weight + 0.1);
        TagEditor.renderTags('main');
      }
    },
    decreaseWeight: (index) => {
      if (window.appState.tags[index]) {
        window.appState.tags[index].weight = Math.max(0.1, window.appState.tags[index].weight - 0.1);
        TagEditor.renderTags('main');
      }
    },
    remove: (index) => {
      window.appState.tags.splice(index, 1);
      TagEditor.renderTags('main');
    }
  },

  // Image context tag operations
  imageTag: {
    move: (index, direction) => {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < window.App.imageState.imageTags.length) {
        [window.App.imageState.imageTags[index], window.App.imageState.imageTags[newIndex]] = 
        [window.App.imageState.imageTags[newIndex], window.App.imageState.imageTags[index]];
        TagEditor.renderTags('image');
      }
    },
    updateText: async (index, lang, text) => {
      if (window.App.imageState.imageTags[index]) {
        window.App.imageState.imageTags[index][lang] = text;
        
        // Translate to the other language
        if (lang === 'en') {
          // Translate English to Japanese
          if (typeof window.translateWithAI === 'function') {
            window.App.imageState.imageTags[index].ja = await window.translateWithAI(text, 'ja');
          }
        } else {
          // Translate Japanese to English
          if (window.appState.apiKey && typeof window.translateWithAI === 'function') {
            window.App.imageState.imageTags[index].en = await window.translateWithAI(text, 'en');
          } else if (typeof window.translateToEnglish === 'function') {
            window.App.imageState.imageTags[index].en = window.translateToEnglish(text);
          }
        }
        
        TagEditor.renderTags('image');
      }
    },
    updateWeight: (index, weight) => {
      if (window.App.imageState.imageTags[index]) {
        window.App.imageState.imageTags[index].weight = parseFloat(weight);
        TagEditor.renderTags('image');
      }
    },
    increaseWeight: (index) => {
      if (window.App.imageState.imageTags[index]) {
        window.App.imageState.imageTags[index].weight = Math.min(2.0, window.App.imageState.imageTags[index].weight + 0.1);
        TagEditor.renderTags('image');
      }
    },
    decreaseWeight: (index) => {
      if (window.App.imageState.imageTags[index]) {
        window.App.imageState.imageTags[index].weight = Math.max(0.1, window.App.imageState.imageTags[index].weight - 0.1);
        TagEditor.renderTags('image');
      }
    },
    remove: (index) => {
      window.App.imageState.imageTags.splice(index, 1);
      TagEditor.renderTags('image');
    }
  }
};

// Export TagEditor to global scope for HTML onclick handlers
if (typeof window !== 'undefined') {
  window.TagEditor = TagEditor;
}