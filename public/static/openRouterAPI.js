// OpenRouter API Integration Module
class OpenRouterAPI {
    constructor() {
        this.apiKey = localStorage.getItem('openrouter_api_key') || '';
        this.selectedModel = localStorage.getItem('openrouter_model') || '';
        this.models = [];
        this.modelCache = null;
        this.cacheExpiry = 3600000; // 1 hour
        this.lastCacheTime = 0;
    }

    // Set API Key
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('openrouter_api_key', key);
    }

    // Get API Key
    getApiKey() {
        return this.apiKey;
    }

    // Set Selected Model
    setModel(modelId) {
        this.selectedModel = modelId;
        localStorage.setItem('openrouter_model', modelId);
    }

    // Get Selected Model
    getModel() {
        return this.selectedModel;
    }

    // Test API Key
    async testApiKey() {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        try {
            const response = await fetch('/api/openrouter/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: 'openai/gpt-4o-mini',
                    maxTokens: 10,
                    apiKey: this.apiKey
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API key test failed');
            }

            return true;
        } catch (error) {
            console.error('API key test error:', error);
            throw error;
        }
    }

    // Fetch Available Models
    async fetchModels(forceRefresh = false) {
        // Check cache
        if (!forceRefresh && this.modelCache && (Date.now() - this.lastCacheTime) < this.cacheExpiry) {
            return this.modelCache;
        }

        try {
            const response = await fetch('/api/openrouter/models');
            if (!response.ok) {
                throw new Error('Failed to fetch models');
            }

            const data = await response.json();
            this.models = data.models || [];
            this.modelCache = this.models;
            this.lastCacheTime = Date.now();

            // Store in localStorage for offline access
            localStorage.setItem('openrouter_models_cache', JSON.stringify({
                models: this.models,
                timestamp: this.lastCacheTime
            }));

            return this.models;
        } catch (error) {
            console.error('Error fetching models:', error);
            
            // Try to load from localStorage cache
            const cached = localStorage.getItem('openrouter_models_cache');
            if (cached) {
                const data = JSON.parse(cached);
                this.models = data.models;
                return this.models;
            }

            // Return default models if everything fails
            return this.getDefaultModels();
        }
    }

    // Get Default Models (fallback)
    getDefaultModels() {
        return [
            // OpenAI Models
            { id: 'openai/gpt-4o', name: 'GPT-4o (Latest)', description: 'Most capable GPT-4 model', contextLength: 128000 },
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable', contextLength: 128000 },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'GPT-4 with vision', contextLength: 128000 },
            { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', contextLength: 16385 },
            
            // Anthropic Models
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Most intelligent Claude model', contextLength: 200000 },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Powerful reasoning', contextLength: 200000 },
            { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance', contextLength: 200000 },
            { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and light', contextLength: 200000 },
            
            // Google Models
            { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', description: 'Free experimental model', contextLength: 1048576 },
            { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Advanced multimodal model', contextLength: 2097152 },
            { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', description: 'Fast multimodal model', contextLength: 1048576 },
            
            // DeepSeek Models
            { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: 'Latest reasoning model', contextLength: 65536 },
            { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', description: 'Advanced chat model', contextLength: 65536 },
            
            // Meta Models
            { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', description: 'Open source powerhouse', contextLength: 131072 },
            { id: 'meta-llama/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', description: 'Multimodal Llama', contextLength: 131072 },
            
            // Mistral Models
            { id: 'mistralai/mistral-large', name: 'Mistral Large', description: 'Flagship model', contextLength: 128000 },
            { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', description: 'MoE architecture', contextLength: 65536 },
            
            // Free Models
            { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B (Free)', description: 'Free fine-tuned Llama', contextLength: 131072 },
            { id: 'liquid/lfm-40b:free', name: 'Liquid LFM 40B (Free)', description: 'Free liquid model', contextLength: 32768 },
            { id: 'openchat/openchat-7b:free', name: 'OpenChat 7B (Free)', description: 'Free chat model', contextLength: 8192 }
        ];
    }

    // Get Recommended Models by Category
    getRecommendedModels(category) {
        const recommendations = {
            general: [
                'openai/gpt-4o',
                'anthropic/claude-3.5-sonnet',
                'google/gemini-pro-1.5'
            ],
            creative: [
                'anthropic/claude-3.5-sonnet',
                'openai/gpt-4o',
                'mistralai/mistral-large'
            ],
            translation: [
                'openai/gpt-4o-mini',
                'anthropic/claude-3-haiku',
                'google/gemini-flash-1.5'
            ],
            free: [
                'google/gemini-2.0-flash-exp:free',
                'nousresearch/hermes-3-llama-3.1-405b:free',
                'liquid/lfm-40b:free',
                'openchat/openchat-7b:free'
            ]
        };

        return recommendations[category] || recommendations.general;
    }

    // Chat Completion
    async chat(messages, options = {}) {
        if (!this.apiKey) {
            throw new Error('OpenRouter API key not configured');
        }

        const model = options.model || this.selectedModel || 'openai/gpt-4o-mini';
        
        const requestBody = {
            messages,
            model,
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 2000,
            systemPrompt: options.systemPrompt,
            apiKey: this.apiKey
        };

        try {
            const response = await fetch('/api/openrouter/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Chat request failed');
            }

            const data = await response.json();
            return data.content;
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }

    // Optimize Prompt
    async optimizePrompt(prompt, format, systemPromptOverride = null) {
        if (!this.apiKey) {
            throw new Error('OpenRouter API key not configured');
        }

        const model = this.selectedModel || 'openai/gpt-4o';

        try {
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    format,
                    model,
                    systemPromptOverride,
                    apiKey: this.apiKey
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Optimization failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Optimization error:', error);
            throw error;
        }
    }

    // Translate Text
    async translate(text, sourceLang = 'auto', targetLang = 'en') {
        if (!this.apiKey) {
            // Return original text if no API key
            return text;
        }

        const model = this.selectedModel || 'openai/gpt-4o-mini';

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    sourceLang,
                    targetLang,
                    model,
                    apiKey: this.apiKey
                })
            });

            if (!response.ok) {
                return text; // Fallback to original text
            }

            const data = await response.json();
            return data.translated || text;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Fallback to original text
        }
    }

    // Categorize Tags
    async categorizeTags(blocks) {
        try {
            const response = await fetch('/api/categorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ blocks })
            });

            if (!response.ok) {
                throw new Error('Categorization failed');
            }

            const data = await response.json();
            return data.blocks;
        } catch (error) {
            console.error('Categorization error:', error);
            // Return original blocks with default category
            return blocks.map(block => ({ ...block, category: block.category || 'other' }));
        }
    }

    // Get Model Info
    getModelInfo(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) return null;

        return {
            name: model.name,
            description: model.description,
            contextLength: model.contextLength,
            pricing: model.pricing,
            isFree: modelId.includes(':free'),
            provider: modelId.split('/')[0]
        };
    }

    // Format Context Length
    formatContextLength(length) {
        if (!length) return 'Unknown';
        if (length >= 1000000) {
            return `${(length / 1000000).toFixed(1)}M tokens`;
        } else if (length >= 1000) {
            return `${(length / 1000).toFixed(0)}K tokens`;
        }
        return `${length} tokens`;
    }
}

// Export for use in other modules
window.OpenRouterAPI = OpenRouterAPI;