// Main Application Core
class PromptManager {
    constructor() {
        this.openRouterAPI = new OpenRouterAPI();
        this.systemPrompts = new SystemPrompts();
        this.tags = [];
        this.currentTab = 'text';
        this.outputFormat = 'sdxl';
        this.imageHistory = [];
        this.translationCache = new Map();
        this.draggedElement = null;
        this.sortableInstances = [];
    }

    // Initialize application
    async init() {
        console.log('Initializing SS Prompt Manager...');
        
        // Load saved settings
        this.loadSettings();
        
        // Initialize UI
        this.initializeUI();
        
        // Load OpenRouter models
        await this.loadModels();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize drag and drop
        this.initializeDragDrop();
        
        // Initialize split view
        this.initializeSplitView();
        
        // Update status
        this.updateStatus('Ready', 'success');
        
        console.log('Initialization complete');
    }

    // Load saved settings
    loadSettings() {
        // Load API key
        const apiKey = this.openRouterAPI.getApiKey();
        if (apiKey) {
            document.getElementById('openrouter-api-key').value = apiKey;
        }
        
        // Load selected model
        const model = this.openRouterAPI.getModel();
        if (model) {
            this.updateModelIndicator(model);
        }
        
        // Load preferences
        const preferences = localStorage.getItem('preferences');
        if (preferences) {
            try {
                const prefs = JSON.parse(preferences);
                document.getElementById('auto-translate').checked = prefs.autoTranslate || false;
                document.getElementById('auto-categorize').checked = prefs.autoCategorize || false;
                document.getElementById('preserve-special').checked = prefs.preserveSpecial !== false;
            } catch (e) {
                console.error('Failed to load preferences:', e);
            }
        }
        
        // Load output format
        const format = localStorage.getItem('output_format') || 'sdxl';
        this.outputFormat = format;
        document.getElementById('output-format').value = format;
    }

    // Initialize UI elements
    initializeUI() {
        // Load system prompts into textareas
        document.getElementById('sp-sdxl').value = this.systemPrompts.getPrompt('sdxl');
        document.getElementById('sp-flux').value = this.systemPrompts.getPrompt('flux');
        document.getElementById('sp-translate').value = this.systemPrompts.getPrompt('translation');
    }

    // Setup event listeners
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to generate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.generateOptimized();
            }
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeSettings();
            }
        });
        
        // Auto-save on input change
        let saveTimeout;
        document.addEventListener('input', (e) => {
            if (e.target.matches('textarea, input')) {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    this.autoSave();
                }, 1000);
            }
        });
    }

    // Initialize drag and drop for tags
    initializeDragDrop() {
        // Will be called when tags are rendered
    }

    // Initialize split view
    initializeSplitView() {
        if (typeof Split !== 'undefined') {
            Split(['#left-panel', '#right-panel'], {
                sizes: [70, 30],
                minSize: [400, 300],
                gutterSize: 8,
                cursor: 'col-resize'
            });
        }
    }

    // Load OpenRouter models
    async loadModels() {
        try {
            this.updateStatus('Loading models...', 'loading');
            const models = await this.openRouterAPI.fetchModels();
            
            const select = document.getElementById('openrouter-model');
            select.innerHTML = '';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Select a model...';
            select.appendChild(emptyOption);
            
            // Add model options
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                if (model.id.includes(':free')) {
                    option.textContent += ' 🎁';
                }
                select.appendChild(option);
            });
            
            // Select saved model
            const savedModel = this.openRouterAPI.getModel();
            if (savedModel) {
                select.value = savedModel;
                this.showModelInfo(savedModel);
            }
            
            this.updateStatus('Ready', 'success');
        } catch (error) {
            console.error('Failed to load models:', error);
            this.updateStatus('Failed to load models', 'error');
        }
    }

    // Refresh model list
    async refreshModelList() {
        await this.loadModels();
        this.showNotification('Model list refreshed', 'success');
    }

    // Update OpenRouter API key
    updateOpenRouterKey(key) {
        this.openRouterAPI.setApiKey(key);
        this.showNotification('API key updated', 'success');
    }

    // Test OpenRouter API key
    async testOpenRouterKey() {
        try {
            this.updateStatus('Testing API key...', 'loading');
            await this.openRouterAPI.testApiKey();
            this.showNotification('API key is valid!', 'success');
            this.updateStatus('Ready', 'success');
            
            // Show API status
            const statusDiv = document.getElementById('api-status');
            statusDiv.className = 'p-3 rounded-lg bg-green-50 border border-green-200';
            statusDiv.innerHTML = '<i class="fas fa-check-circle text-green-600 mr-2"></i>API key validated successfully';
            statusDiv.classList.remove('hidden');
            
            // Refresh models
            await this.loadModels();
        } catch (error) {
            this.showNotification('API key test failed: ' + error.message, 'error');
            this.updateStatus('API key invalid', 'error');
            
            // Show error status
            const statusDiv = document.getElementById('api-status');
            statusDiv.className = 'p-3 rounded-lg bg-red-50 border border-red-200';
            statusDiv.innerHTML = '<i class="fas fa-exclamation-circle text-red-600 mr-2"></i>Invalid API key';
            statusDiv.classList.remove('hidden');
        }
    }

    // Update selected model
    updateOpenRouterModel(modelId) {
        this.openRouterAPI.setModel(modelId);
        this.updateModelIndicator(modelId);
        this.showModelInfo(modelId);
    }

    // Show model information
    showModelInfo(modelId) {
        const info = this.openRouterAPI.getModelInfo(modelId);
        if (!info) return;
        
        const infoDiv = document.getElementById('model-info');
        let html = `
            <div class="flex items-start justify-between">
                <div>
                    <div class="font-medium">${info.name}</div>
                    <div class="text-gray-600">${info.description || 'No description'}</div>
                    <div class="mt-1">
                        <span class="text-gray-500">Context: </span>
                        <span class="font-mono">${this.openRouterAPI.formatContextLength(info.contextLength)}</span>
                    </div>
                </div>
        `;
        
        if (info.isFree) {
            html += '<span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">FREE</span>';
        }
        
        html += '</div>';
        infoDiv.innerHTML = html;
        infoDiv.classList.remove('hidden');
    }

    // Update model indicator in main UI
    updateModelIndicator(modelId) {
        const indicator = document.getElementById('current-model-indicator');
        if (modelId) {
            const parts = modelId.split('/');
            const shortName = parts[parts.length - 1];
            indicator.textContent = shortName;
            indicator.title = modelId;
        } else {
            indicator.textContent = 'No model';
        }
    }

    // Select recommended model
    selectRecommendedModel(category) {
        const recommended = this.openRouterAPI.getRecommendedModels(category);
        const select = document.getElementById('openrouter-model');
        
        // Find first available recommended model
        for (const modelId of recommended) {
            const option = Array.from(select.options).find(opt => opt.value === modelId);
            if (option) {
                select.value = modelId;
                this.updateOpenRouterModel(modelId);
                this.showNotification(`Selected ${category} model: ${option.textContent}`, 'success');
                return;
            }
        }
        
        this.showNotification('No recommended models available', 'warning');
    }

    // Tab switching
    setTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // Update content
        document.querySelectorAll('[id^="content-"]').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`content-${tabName}`).classList.remove('hidden');
        
        this.currentTab = tabName;
    }

    // Settings modal
    showSettings() {
        document.getElementById('settings-modal').classList.add('active');
    }

    closeSettings() {
        document.getElementById('settings-modal').classList.remove('active');
    }

    setSettingsTab(tabName) {
        // Update tab buttons
        const modal = document.getElementById('settings-modal');
        modal.querySelectorAll('button[onclick^="App.setSettingsTab"]').forEach(btn => {
            btn.classList.remove('border-blue-500', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-600');
        });
        event.target.classList.remove('border-transparent', 'text-gray-600');
        event.target.classList.add('border-blue-500', 'text-blue-600');
        
        // Update content
        modal.querySelectorAll('[id^="settings-"]').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`settings-${tabName}`).classList.remove('hidden');
    }

    // Save settings
    saveSettings() {
        // Save system prompts
        this.systemPrompts.updatePrompt('sdxl', document.getElementById('sp-sdxl').value);
        this.systemPrompts.updatePrompt('flux', document.getElementById('sp-flux').value);
        this.systemPrompts.updatePrompt('translation', document.getElementById('sp-translate').value);
        
        // Save preferences
        const preferences = {
            autoTranslate: document.getElementById('auto-translate').checked,
            autoCategorize: document.getElementById('auto-categorize').checked,
            preserveSpecial: document.getElementById('preserve-special').checked
        };
        localStorage.setItem('preferences', JSON.stringify(preferences));
        
        this.showNotification('Settings saved', 'success');
        this.closeSettings();
    }

    // Reset settings
    resetSettings() {
        if (confirm('Reset all settings to defaults?')) {
            this.systemPrompts.resetAll();
            this.initializeUI();
            localStorage.removeItem('preferences');
            this.showNotification('Settings reset to defaults', 'success');
        }
    }

    // Input operations
    async pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('input-text').value = text;
            this.showNotification('Text pasted', 'success');
        } catch (error) {
            this.showNotification('Failed to paste. Use Ctrl+V in the text area.', 'error');
        }
    }

    clearInput() {
        document.getElementById('input-text').value = '';
        this.tags = [];
        this.renderTags();
        this.updateOutput();
    }

    // Split text into tags
    splitText() {
        const input = document.getElementById('input-text').value.trim();
        if (!input) {
            this.showNotification('Please enter some text first', 'warning');
            return;
        }
        
        // Split by various delimiters
        const parts = input.split(/[,，.。、\n]+/).filter(part => part.trim());
        
        // Create tag objects
        this.tags = parts.map((text, index) => ({
            id: Date.now() + index,
            en: text.trim(),
            ja: text.trim(),
            weight: 1.0,
            category: 'other',
            locked: false
        }));
        
        this.renderTags();
        this.updateOutput();
        this.showNotification(`Split into ${this.tags.length} tags`, 'success');
    }

    // Analyze and categorize tags
    async analyzeAndCategorize() {
        if (this.tags.length === 0) {
            this.showNotification('No tags to analyze', 'warning');
            return;
        }
        
        try {
            this.showLoading('Analyzing tags...');
            const categorized = await this.openRouterAPI.categorizeTags(this.tags);
            this.tags = categorized;
            this.renderTags();
            this.updateOutput();
            this.hideLoading();
            this.showNotification('Tags categorized', 'success');
        } catch (error) {
            this.hideLoading();
            this.showNotification('Categorization failed', 'error');
        }
    }

    // Generate optimized prompt
    async generateOptimized() {
        const input = document.getElementById('input-text').value.trim();
        if (!input) {
            this.showNotification('Please enter a prompt first', 'warning');
            return;
        }
        
        if (!this.openRouterAPI.getApiKey()) {
            this.showNotification('Please configure OpenRouter API key in settings', 'error');
            this.showSettings();
            return;
        }
        
        try {
            this.showLoading('Generating optimized prompt...');
            
            const format = this.outputFormat;
            const systemPrompt = this.systemPrompts.getPrompt(format);
            
            const result = await this.openRouterAPI.optimizePrompt(input, format, systemPrompt);
            
            if (result.blocks) {
                // Use the parsed blocks
                this.tags = result.blocks.map((block, index) => ({
                    id: Date.now() + index,
                    en: block.en,
                    ja: '',
                    weight: block.weight || 1.0,
                    category: block.category || 'other',
                    locked: false
                }));
                
                // Auto-categorize if enabled
                if (document.getElementById('auto-categorize').checked) {
                    this.tags = await this.openRouterAPI.categorizeTags(this.tags);
                }
                
                // Auto-translate if enabled
                if (document.getElementById('auto-translate').checked) {
                    await this.translateAllTags('en-to-ja');
                }
            } else if (result.optimized) {
                // Fallback to simple split
                const parts = result.optimized.split(/[,，]+/).filter(p => p.trim());
                this.tags = parts.map((text, index) => ({
                    id: Date.now() + index,
                    en: text.trim(),
                    ja: '',
                    weight: 1.0,
                    category: 'other',
                    locked: false
                }));
            }
            
            this.renderTags();
            this.updateOutput();
            this.hideLoading();
            this.showNotification('Prompt optimized successfully', 'success');
        } catch (error) {
            this.hideLoading();
            this.showNotification('Optimization failed: ' + error.message, 'error');
        }
    }

    // Update output format
    updateOutputFormat() {
        this.outputFormat = document.getElementById('output-format').value;
        localStorage.setItem('output_format', this.outputFormat);
        this.updateOutput();
    }

    // Render tags in UI
    renderTags() {
        const enContainer = document.getElementById('tags-en');
        const jaContainer = document.getElementById('tags-ja');
        
        enContainer.innerHTML = '';
        jaContainer.innerHTML = '';
        
        this.tags.forEach(tag => {
            enContainer.appendChild(this.createTagElement(tag, 'en'));
            jaContainer.appendChild(this.createTagElement(tag, 'ja'));
        });
        
        // Re-initialize sortable
        this.initializeTagSorting();
    }

    // Create tag element
    createTagElement(tag, lang) {
        const div = document.createElement('div');
        div.className = `tag-block p-3 border-2 rounded-lg transition-all`;
        div.dataset.category = tag.category;
        div.dataset.tagId = tag.id;
        
        const content = `
            <div class="flex items-center justify-between gap-2">
                <input type="text" 
                       value="${tag[lang]}" 
                       class="flex-1 bg-transparent outline-none"
                       onchange="App.updateTag(${tag.id}, '${lang}', this.value)"
                       onfocus="this.select()">
                <div class="flex items-center gap-1">
                    <button onclick="App.adjustWeight(${tag.id}, 0.05)" 
                            class="text-gray-600 hover:text-gray-800">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                    <span class="text-sm font-mono w-10 text-center">${tag.weight.toFixed(2)}</span>
                    <button onclick="App.adjustWeight(${tag.id}, -0.05)" 
                            class="text-gray-600 hover:text-gray-800">
                        <i class="fas fa-minus text-xs"></i>
                    </button>
                    <button onclick="App.deleteTag(${tag.id})" 
                            class="text-red-600 hover:text-red-800 ml-2">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                </div>
            </div>
        `;
        
        div.innerHTML = content;
        return div;
    }

    // Initialize tag sorting
    initializeTagSorting() {
        // Clean up existing instances
        this.sortableInstances.forEach(instance => instance.destroy());
        this.sortableInstances = [];
        
        // Create sortable for English tags
        const enContainer = document.getElementById('tags-en');
        if (enContainer && typeof Sortable !== 'undefined') {
            const enSortable = Sortable.create(enContainer, {
                group: 'tags',
                animation: 150,
                ghostClass: 'ghost',
                onEnd: (evt) => {
                    this.reorderTags(evt.oldIndex, evt.newIndex);
                }
            });
            this.sortableInstances.push(enSortable);
        }
        
        // Create sortable for Japanese tags
        const jaContainer = document.getElementById('tags-ja');
        if (jaContainer && typeof Sortable !== 'undefined') {
            const jaSortable = Sortable.create(jaContainer, {
                group: 'tags',
                animation: 150,
                ghostClass: 'ghost',
                onEnd: (evt) => {
                    this.reorderTags(evt.oldIndex, evt.newIndex);
                }
            });
            this.sortableInstances.push(jaSortable);
        }
    }

    // Reorder tags
    reorderTags(oldIndex, newIndex) {
        if (oldIndex === newIndex) return;
        
        const tag = this.tags.splice(oldIndex, 1)[0];
        this.tags.splice(newIndex, 0, tag);
        
        this.renderTags();
        this.updateOutput();
    }

    // Update tag content
    async updateTag(id, lang, value) {
        const tag = this.tags.find(t => t.id === id);
        if (!tag) return;
        
        tag[lang] = value;
        
        // Auto-translate if enabled
        if (document.getElementById('auto-translate').checked) {
            const otherLang = lang === 'en' ? 'ja' : 'en';
            const sourceLang = lang === 'en' ? 'English' : 'Japanese';
            const targetLang = lang === 'en' ? 'Japanese' : 'English';
            
            try {
                const translated = await this.openRouterAPI.translate(value, sourceLang, targetLang);
                tag[otherLang] = translated;
                
                // Update the other field
                const otherContainer = document.getElementById(`tags-${otherLang}`);
                const otherElement = otherContainer.querySelector(`[data-tag-id="${id}"] input`);
                if (otherElement) {
                    otherElement.value = translated;
                }
            } catch (error) {
                console.error('Translation failed:', error);
            }
        }
        
        this.updateOutput();
    }

    // Adjust tag weight
    adjustWeight(id, delta) {
        const tag = this.tags.find(t => t.id === id);
        if (!tag) return;
        
        tag.weight = Math.max(0.1, Math.min(2.0, tag.weight + delta));
        this.renderTags();
        this.updateOutput();
    }

    // Delete tag
    deleteTag(id) {
        this.tags = this.tags.filter(t => t.id !== id);
        this.renderTags();
        this.updateOutput();
    }

    // Add new tag
    async addNewTag(lang) {
        const input = document.getElementById(`new-tag-${lang}`);
        const value = input.value.trim();
        
        if (!value) return;
        
        const newTag = {
            id: Date.now(),
            en: lang === 'en' ? value : '',
            ja: lang === 'ja' ? value : '',
            weight: 1.0,
            category: 'other',
            locked: false
        };
        
        // Auto-translate if enabled
        if (document.getElementById('auto-translate').checked) {
            const otherLang = lang === 'en' ? 'ja' : 'en';
            const sourceLang = lang === 'en' ? 'English' : 'Japanese';
            const targetLang = lang === 'en' ? 'Japanese' : 'English';
            
            try {
                const translated = await this.openRouterAPI.translate(value, sourceLang, targetLang);
                newTag[otherLang] = translated;
            } catch (error) {
                console.error('Translation failed:', error);
                newTag[otherLang] = value;
            }
        } else {
            const otherLang = lang === 'en' ? 'ja' : 'en';
            newTag[otherLang] = value;
        }
        
        // Auto-categorize if enabled
        if (document.getElementById('auto-categorize').checked) {
            try {
                const categorized = await this.openRouterAPI.categorizeTags([newTag]);
                newTag.category = categorized[0].category;
            } catch (error) {
                console.error('Categorization failed:', error);
            }
        }
        
        this.tags.push(newTag);
        input.value = '';
        this.renderTags();
        this.updateOutput();
    }

    // Translate all tags
    async translateAll(direction) {
        if (this.tags.length === 0) {
            this.showNotification('No tags to translate', 'warning');
            return;
        }
        
        const [sourceLang, targetLang] = direction === 'en-to-ja' 
            ? ['en', 'ja'] 
            : ['ja', 'en'];
        
        const sourceLanguage = sourceLang === 'en' ? 'English' : 'Japanese';
        const targetLanguage = targetLang === 'en' ? 'English' : 'Japanese';
        
        try {
            this.showLoading('Translating...');
            
            for (const tag of this.tags) {
                if (tag[sourceLang] && !tag[targetLang]) {
                    const translated = await this.openRouterAPI.translate(
                        tag[sourceLang],
                        sourceLanguage,
                        targetLanguage
                    );
                    tag[targetLang] = translated;
                }
            }
            
            this.renderTags();
            this.updateOutput();
            this.hideLoading();
            this.showNotification('Translation complete', 'success');
        } catch (error) {
            this.hideLoading();
            this.showNotification('Translation failed', 'error');
        }
    }

    // Sort tags
    sortTags(by) {
        if (by === 'category') {
            this.tags.sort((a, b) => {
                const categoryOrder = ['quality', 'person', 'appearance', 'clothing', 'pose', 'background', 'style', 'other'];
                const aIndex = categoryOrder.indexOf(a.category);
                const bIndex = categoryOrder.indexOf(b.category);
                return aIndex - bIndex;
            });
        } else if (by === 'weight') {
            this.tags.sort((a, b) => b.weight - a.weight);
        }
        
        this.renderTags();
        this.updateOutput();
    }

    // Update output
    updateOutput() {
        const outputText = this.generateOutput();
        document.getElementById('output-text').textContent = outputText || 'No output generated yet...';
        document.getElementById('image-prompt-preview').textContent = outputText || 'No prompt available';
    }

    // Generate output based on format
    generateOutput() {
        if (this.tags.length === 0) return '';
        
        switch (this.outputFormat) {
            case 'sdxl':
                return this.tags.map(tag => {
                    const text = tag.en || tag.ja;
                    if (tag.weight !== 1.0) {
                        return `(${text}:${tag.weight.toFixed(2)})`;
                    }
                    return text;
                }).join(', ');
                
            case 'flux':
                return this.tags.map(tag => tag.en || tag.ja).join('. ') + '.';
                
            case 'imagefx':
                return this.tags.map(tag => tag.en || tag.ja).join(' ');
                
            case 'custom':
                return this.tags.map(tag => tag.en || tag.ja).join('\n');
                
            default:
                return this.tags.map(tag => tag.en || tag.ja).join(', ');
        }
    }

    // Copy output to clipboard
    async copyOutput() {
        const output = this.generateOutput();
        if (!output) {
            this.showNotification('No output to copy', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(output);
            this.showNotification('Copied to clipboard', 'success');
        } catch (error) {
            this.showNotification('Failed to copy', 'error');
        }
    }

    // Download output as text file
    downloadOutput() {
        const output = this.generateOutput();
        if (!output) {
            this.showNotification('No output to download', 'warning');
            return;
        }
        
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt_${this.outputFormat}_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Downloaded successfully', 'success');
    }

    // Generate image (mock)
    async generateImage() {
        const prompt = this.generateOutput();
        if (!prompt) {
            this.showNotification('No prompt to generate image', 'warning');
            return;
        }
        
        try {
            this.showLoading('Generating image...');
            
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    model: document.getElementById('image-model').value,
                    aspectRatio: document.getElementById('aspect-ratio').value,
                    quality: document.getElementById('image-quality').value
                })
            });
            
            const data = await response.json();
            
            if (data.image) {
                this.displayGeneratedImage(data.image);
                this.addToHistory(data.image);
            }
            
            this.hideLoading();
            this.showNotification('Image generated', 'success');
        } catch (error) {
            this.hideLoading();
            this.showNotification('Image generation failed', 'error');
        }
    }

    // Display generated image
    displayGeneratedImage(imageData) {
        const container = document.getElementById('generated-image');
        container.innerHTML = `
            <img src="${imageData.url}" alt="Generated image" class="w-full rounded-lg shadow-lg">
            <div class="mt-2 text-xs text-gray-500">
                Model: ${imageData.model} | Seed: ${imageData.seed}
            </div>
        `;
    }

    // Add image to history
    addToHistory(imageData) {
        this.imageHistory.unshift(imageData);
        if (this.imageHistory.length > 10) {
            this.imageHistory.pop();
        }
        
        this.renderHistory();
    }

    // Render image history
    renderHistory() {
        const container = document.getElementById('image-history');
        container.innerHTML = this.imageHistory.map((img, index) => `
            <div class="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                 onclick="App.loadFromHistory(${index})">
                <img src="${img.url}" alt="History ${index}" class="w-12 h-12 rounded object-cover">
                <div class="flex-1 text-xs">
                    <div class="font-medium">Image ${index + 1}</div>
                    <div class="text-gray-500">${new Date(img.timestamp).toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');
    }

    // Load image from history
    loadFromHistory(index) {
        const imageData = this.imageHistory[index];
        if (imageData) {
            this.displayGeneratedImage(imageData);
        }
    }

    // Handle image upload
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // TODO: Implement image analysis
        this.showNotification('Image analysis coming soon', 'info');
    }

    // Process batch
    async processBatch() {
        const input = document.getElementById('batch-input').value.trim();
        if (!input) {
            this.showNotification('No prompts to process', 'warning');
            return;
        }
        
        const prompts = input.split('\n').filter(line => line.trim());
        
        try {
            this.showLoading(`Processing ${prompts.length} prompts...`);
            
            const results = [];
            for (const prompt of prompts) {
                const result = await this.openRouterAPI.optimizePrompt(
                    prompt,
                    this.outputFormat,
                    this.systemPrompts.getPrompt(this.outputFormat)
                );
                results.push({
                    original: prompt,
                    optimized: result.optimized || prompt
                });
            }
            
            this.displayBatchResults(results);
            this.hideLoading();
            this.showNotification(`Processed ${results.length} prompts`, 'success');
        } catch (error) {
            this.hideLoading();
            this.showNotification('Batch processing failed', 'error');
        }
    }

    // Display batch results
    displayBatchResults(results) {
        const container = document.getElementById('batch-results');
        container.innerHTML = `
            <h3 class="text-lg font-semibold mb-3">Results</h3>
            <div class="space-y-3">
                ${results.map((result, index) => `
                    <div class="border rounded-lg p-3">
                        <div class="text-sm text-gray-600 mb-1">Original ${index + 1}:</div>
                        <div class="text-sm mb-2">${result.original}</div>
                        <div class="text-sm text-gray-600 mb-1">Optimized:</div>
                        <div class="text-sm font-mono bg-gray-50 p-2 rounded">${result.optimized}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Clear batch
    clearBatch() {
        document.getElementById('batch-input').value = '';
        document.getElementById('batch-results').innerHTML = '';
    }

    // Auto-save function
    autoSave() {
        const data = {
            input: document.getElementById('input-text').value,
            tags: this.tags,
            outputFormat: this.outputFormat
        };
        localStorage.setItem('autosave', JSON.stringify(data));
    }

    // Load auto-saved data
    loadAutoSave() {
        const saved = localStorage.getItem('autosave');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                document.getElementById('input-text').value = data.input || '';
                this.tags = data.tags || [];
                this.outputFormat = data.outputFormat || 'sdxl';
                document.getElementById('output-format').value = this.outputFormat;
                this.renderTags();
                this.updateOutput();
            } catch (e) {
                console.error('Failed to load autosave:', e);
            }
        }
    }

    // Show loading overlay
    showLoading(text = 'Processing...') {
        const overlay = document.getElementById('loading-overlay');
        document.getElementById('loading-text').textContent = text;
        overlay.classList.remove('hidden');
    }

    // Hide loading overlay
    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Update status indicator
    updateStatus(text, type = 'info') {
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            loading: 'bg-blue-500',
            info: 'bg-gray-500'
        };
        
        indicator.className = `w-2 h-2 rounded-full ${colors[type]}`;
        if (type === 'loading') {
            indicator.classList.add('animate-pulse');
        }
        
        statusText.textContent = text;
    }
}

// Make App globally available
window.App = null;