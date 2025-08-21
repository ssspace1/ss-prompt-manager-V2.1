// System Prompts Management Module
class SystemPrompts {
    constructor() {
        this.prompts = this.loadPrompts();
    }

    // Default System Prompts
    getDefaults() {
        return {
            sdxl: `You are an expert at optimizing prompts for SDXL image generation.
Convert the input into comma-separated tags with appropriate weights.

Rules:
1. Use comma separation between tags
2. Add weight emphasis using (tag:1.2) for important elements
3. Use [tag:0.8] for de-emphasized elements
4. Include quality tags like "masterpiece, best quality, detailed, 8k resolution" at the beginning
5. Organize tags by importance: quality → subject → appearance → clothing → pose → background → style
6. Preserve special names and unique terms exactly as provided
7. Remove redundant or conflicting tags
8. Suggest weights based on importance (1.0-1.5 for emphasis, 0.5-0.9 for de-emphasis)

Output only the optimized prompt tags, no explanations.`,

            flux: `You are an expert at optimizing prompts for Flux image generation.
Convert the input into natural language phrases that Flux understands best.

Rules:
1. Use descriptive, flowing sentences rather than tags
2. Focus on artistic and photographic descriptions
3. Maintain narrative flow and readability
4. Include atmospheric and mood descriptions
5. Preserve proper nouns and specific names
6. Use vivid adjectives and clear spatial relationships
7. Structure as: main subject description, followed by environment, then artistic style

Output only the optimized prompt description, no explanations.`,

            imagefx: `You are an expert at optimizing prompts for ImageFX.
Convert the input into clear, natural language instructions.

Rules:
1. Use complete, descriptive sentences
2. Focus on vivid imagery and specific details
3. Include artistic direction and mood
4. Specify lighting, composition, and atmosphere
5. Maintain clarity and avoid ambiguity
6. Preserve all proper nouns and specific references

Output only the optimized prompt, no explanations.`,

            translation: `You are a professional translator specializing in image generation prompts.
Translate accurately while preserving technical terms and special formatting.

Rules:
1. Maintain all weight notations like (tag:1.2) or [tag:0.8]
2. Preserve special names, brands, and proper nouns in original form
3. Keep technical terms that are commonly used in English (e.g., "masterpiece", "8k")
4. Translate descriptive terms while maintaining their intent
5. Preserve punctuation and formatting exactly

Respond with only the translation, no explanations.`,

            categorization: `You are an expert at categorizing image generation tags.
Analyze each tag and assign it to the most appropriate category.

Categories:
- person: character types, ages, genders, roles
- appearance: physical features, hair, eyes, face, body
- clothing: all clothing items, accessories, footwear
- pose: actions, positions, gestures, expressions
- background: locations, environments, settings
- quality: technical quality terms, resolution, rendering
- style: artistic styles, mediums, techniques
- other: anything that doesn't fit above categories

Respond with a JSON object mapping each tag to its category.`,

            custom: `Optimize the following prompt for image generation.
Improve clarity, add relevant details, and organize effectively.
Return only the optimized version.`
        };
    }

    // Load prompts from localStorage or use defaults
    loadPrompts() {
        const saved = localStorage.getItem('system_prompts');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load saved prompts:', e);
            }
        }
        return this.getDefaults();
    }

    // Save prompts to localStorage
    savePrompts() {
        localStorage.setItem('system_prompts', JSON.stringify(this.prompts));
    }

    // Get a specific prompt
    getPrompt(type) {
        return this.prompts[type] || this.prompts.custom;
    }

    // Update a specific prompt
    updatePrompt(type, content) {
        this.prompts[type] = content;
        this.savePrompts();
    }

    // Reset a specific prompt to default
    resetPrompt(type) {
        const defaults = this.getDefaults();
        if (defaults[type]) {
            this.prompts[type] = defaults[type];
            this.savePrompts();
        }
    }

    // Reset all prompts to defaults
    resetAll() {
        this.prompts = this.getDefaults();
        this.savePrompts();
    }

    // Export prompts as JSON
    exportPrompts() {
        return JSON.stringify(this.prompts, null, 2);
    }

    // Import prompts from JSON
    importPrompts(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            // Validate that it contains expected keys
            const defaults = this.getDefaults();
            const validKeys = Object.keys(defaults);
            
            // Merge imported with defaults to ensure all keys exist
            this.prompts = { ...defaults, ...imported };
            this.savePrompts();
            return true;
        } catch (e) {
            console.error('Failed to import prompts:', e);
            return false;
        }
    }

    // Test a prompt with sample input
    async testPrompt(type, sampleInput, apiClient) {
        const prompt = this.getPrompt(type);
        
        try {
            const result = await apiClient.chat(
                [{ role: 'user', content: sampleInput }],
                {
                    systemPrompt: prompt,
                    temperature: 0.7,
                    maxTokens: 500
                }
            );
            return result;
        } catch (error) {
            console.error('Prompt test error:', error);
            throw error;
        }
    }
}

// Export for use in other modules
window.SystemPrompts = SystemPrompts;