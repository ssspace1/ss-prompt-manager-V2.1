# SS Prompt Manager - System Architecture Documentation

## Overview
SS Prompt Manager is a comprehensive AI-powered tool for generating, managing, and optimizing prompts for various AI image generation systems (SDXL, Flux, ImageFX).

## Core Components & Reference Map

### 1. Frontend Structure
```
src/index.tsx (Main HTML Template)
├── Header & Navigation
├── Settings Modal (4 tabs)
│   ├── General Settings
│   ├── AI Instructions (System Prompts)
│   ├── Image Analysis
│   └── Advanced Settings
├── Main Interface
│   ├── Input Section
│   ├── Tag Editor (Bilingual)
│   └── Output Section
└── Image Analysis Tab
```

### 2. Backend Logic
```
public/static/app-main.js (Main Application Logic)
├── App Object (Main Functions)
├── TagEditor (Tag Management)
├── JsonProcessor (AI Response Processing)
├── Translation System
└── Utility Functions
```

### 3. Data Flow & References

#### A. System Prompts Management
```
defaultSystemPrompts (app-main.js:79-280)
    ├── sdxl: SDXL Master Tag Generator v15.0
    ├── flux: Flux Narrative Master v14.0
    ├── imagefx: ImageFX Tag Generator
    └── imagefx-natural: ImageFX Natural Language
    
appState.systemPrompts (Runtime Storage)
    ├── Loaded from localStorage on startup
    ├── Merged with defaultSystemPrompts
    ├── Editable through AI Instructions settings
    └── Used by generateBilingualTags()

Settings UI References:
    ├── AI Instructions Tab → appState.systemPrompts
    ├── showPromptEditor() → Edit individual format prompts
    └── Format dropdown → Select active prompt
```

#### B. Tag Generation Pipeline
```
User Input → AI Generate Button → App.generateOptimized()
    ↓
App.generateBilingualTags(input, format)
    ├── Uses appState.systemPrompts[format]
    ├── Calls /api/openrouter/chat endpoint
    ├── Returns JSON with bilingual tag pairs
    ↓
JsonProcessor.cleanAndParse()
    ├── Removes markdown formatting
    ├── Extracts JSON from AI response
    ├── Validates structure
    ↓
JsonProcessor.validateBilingualTags()
    ├── Validates "pairs" array structure
    ├── Ensures required fields (en, ja, weight, category)
    ├── Handles ID generation and categorization
    ↓
appState.tags[] (Final tag storage)
    ├── Each tag: {id, en, ja, weight, category}
    ├── Rendered by TagEditor.renderTags()
    └── Output formatted by TagEditor.formatOutput()
```

#### C. Translation System
```
Translation Hierarchy:
1. translateWithAI() - Primary AI translation
    ├── Uses OpenRouter API
    ├── Format-aware translation prompts
    └── Fallback to dictionary if AI fails
    
2. translationDict (app-main.js:5-76)
    ├── Static English-Japanese dictionary
    ├── 70+ common prompt terms
    └── Used as fallback for AI translation

Translation References:
    ├── Split to Tags → translateWithAI() for each tag
    ├── AI Generate → Built into system prompts (bilingual)
    └── Manual editing → updateTagText() → translateWithAI()
```

#### D. Output Formatting
```
TagEditor.formatOutput(tags, format)
    ├── 'sdxl': Weighted tags with parentheses
    ├── 'flux': Natural phrases with capitalization
    ├── 'imagefx': Direct tag lists
    └── Custom formats: User-defined formatting

Output Destinations:
    ├── Main output → #output-text (display)
    ├── Copy button → Clipboard
    ├── Download button → .txt file
    └── Image generation → /api/generate-image
```

### 4. API Endpoints (index.tsx Backend)

#### Text Processing Endpoints:
```
POST /api/openrouter/chat
    ├── Used by: generateBilingualTags(), translateWithAI()
    ├── Handles: System prompts, model selection, API key management
    └── Returns: AI-generated content

POST /api/translate
    ├── Used by: Translation fallback systems
    ├── Handles: Batch translation requests
    └── Returns: Translated text arrays

POST /api/generate-tags
    ├── Legacy endpoint for tag generation
    └── May be deprecated in favor of generateBilingualTags()
```

#### Image Processing Endpoints:
```
POST /api/analyze-image
    ├── Used by: Image Analysis tab
    ├── Handles: Image URL analysis with vision models
    └── Returns: Tag suggestions from images

POST /api/generate-image-tags  
    ├── Used by: Image-to-prompt conversion
    ├── Handles: Vision model analysis
    └── Returns: Structured tag arrays

POST /api/generate-image
    ├── Used by: Image generation from prompts
    ├── Handles: Various image generation APIs
    └── Returns: Generated image URLs
```

### 5. State Management
```
appState (Global State Object)
    ├── tags[] - Current working tags
    ├── systemPrompts{} - All format prompts
    ├── apiKey - OpenRouter API key
    ├── selectedModel - Current AI model
    ├── outputFormat - Current output format
    └── Various UI state variables

Persistence:
    ├── localStorage['system-prompts'] - System prompts
    ├── localStorage['openrouter-api-key'] - API key
    └── Session storage for temporary UI state
```

### 6. Key Function References

#### Primary User Actions:
```
Split to Tags: App.splitText()
    └── parseComplexTags() → translateWithAI() → renderTags()

AI Generate: App.generateOptimized()
    └── generateBilingualTags() → validateBilingualTags() → renderTags()

Edit Tags: App.updateTagText()
    └── translateWithAI() → categorizeTag() → renderTags()

Categorize: App.aiCategorizeAllTags()
    └── AI categorization → renderTags()
```

#### Settings Management:
```
Edit Prompts: App.showPromptEditor()
    └── Modal display → savePrompt() → localStorage

Custom Formats: App.addCustomFormat()
    └── Prompt creation → systemPrompts storage

API Key: Settings modal
    └── Direct storage in appState.apiKey
```

## Custom Format Instructions - Detailed Purpose

### Why Custom Format Instructions Exist:

1. **AI Model Optimization**: Each image generation AI has different optimal prompt structures:
   - **SDXL**: Prefers short, weighted tags with technical precision
   - **Flux**: Excels with natural language descriptions and emotional context
   - **ImageFX**: Works best with professional photography terminology

2. **Translation Context**: The Japanese translations must match the English format style:
   - Technical tags need technical Japanese translations
   - Natural phrases need natural Japanese translations
   - Maintaining consistency within each format ecosystem

3. **User Customization**: Users can adapt prompts for:
   - Specific art styles (anime, realistic, abstract)
   - Domain expertise (photography, illustration, 3D rendering)
   - Personal preferences and workflow optimization

4. **Quality Assurance**: Format-specific prompts ensure:
   - Consistent JSON output structure
   - Proper categorization of generated tags
   - Reliable bilingual tag generation
   - No contamination between different prompt styles

### When to Modify Custom Format Instructions:

- **Specialized Use Cases**: Adding domain-specific vocabulary or style preferences
- **Quality Issues**: If translations or categorizations are consistently wrong
- **New Formats**: When adding support for new AI image generation systems
- **Workflow Optimization**: Customizing output to match specific project needs

The custom format instructions are **essential** for maintaining quality and consistency across different AI image generation systems while providing flexibility for user customization.