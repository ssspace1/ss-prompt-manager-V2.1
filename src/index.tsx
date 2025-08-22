import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  AI_API_KEY?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// AI Translation API endpoint
app.post('/api/translate', async (c) => {
  const { text, targetLang = 'ja', apiKey } = await c.req.json();
  
  if (!text) {
    return c.json({ error: 'Text is required' }, 400);
  }
  
  // Use provided API key or environment variable
  const key = apiKey || c.env?.AI_API_KEY;
  
  if (!key) {
    // Fallback to simple dictionary translation
    return c.json({
      translated: text,
      source: 'dictionary'
    });
  }
  
  try {
    // Call OpenRouter API for translation
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
        'X-Title': 'SS Prompt Manager'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: targetLang === 'ja' 
              ? 'You are a professional translator. Translate the given image generation prompt tags from English to Japanese. Keep the translation natural and appropriate for image generation. Output only the translation, no explanations.'
              : 'You are a professional translator. Translate the given image generation prompt tags from Japanese to English. Keep the translation natural and appropriate for image generation. Output only the translation, no explanations.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });
    
    if (!response.ok) {
      throw new Error('Translation API failed');
    }
    
    const data = await response.json();
    return c.json({
      translated: data.choices[0].message.content.trim(),
      source: 'ai'
    });
  } catch (error) {
    console.error('Translation error:', error);
    return c.json({
      translated: text,
      source: 'dictionary',
      error: 'AI translation failed, using dictionary'
    });
  }
});

// AI Generate Tags API endpoint
app.post('/api/generate-tags', async (c) => {
  const { prompt, format = 'sdxl', apiKey, systemPrompt } = await c.req.json();
  
  if (!prompt) {
    return c.json({ error: 'Prompt is required' }, 400);
  }
  
  const key = apiKey || c.env?.AI_API_KEY;
  
  if (!key) {
    return c.json({ error: 'API key is required' }, 400);
  }
  
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
5. Output only the prompt, no explanations`
  };
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
        'X-Title': 'SS Prompt Manager'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt || defaultSystemPrompts[format] || defaultSystemPrompts.sdxl
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    if (!response.ok) {
      throw new Error('Generation API failed');
    }
    
    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();
    
    // Parse generated tags into structured format
    let tags = [];
    if (format === 'sdxl') {
      // Split by comma and parse
      const parts = generatedText.split(',').map(p => p.trim());
      tags = parts.map((part, i) => {
        const match = part.match(/^(.+?):(\d+\.?\d*)$/);
        if (match) {
          return {
            id: Date.now() + i,
            en: match[1].trim(),
            weight: parseFloat(match[2])
          };
        }
        return {
          id: Date.now() + i,
          en: part,
          weight: 1.0
        };
      });
    } else {
      // For flux and imagefx, treat as single block
      tags = [{
        id: Date.now(),
        en: generatedText,
        weight: 1.0
      }];
    }
    
    // Translate tags to Japanese
    const translatedTags = await Promise.all(tags.map(async (tag) => {
      try {
        const transResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
            'X-Title': 'SS Prompt Manager'
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Translate this image generation tag/prompt from English to Japanese. Keep it natural and appropriate for image generation. Output only the translation.'
              },
              {
                role: 'user',
                content: tag.en
              }
            ],
            temperature: 0.3,
            max_tokens: 100
          })
        });
        
        if (transResponse.ok) {
          const transData = await transResponse.json();
          tag.ja = transData.choices[0].message.content.trim();
        } else {
          tag.ja = tag.en; // Fallback to English
        }
      } catch (e) {
        tag.ja = tag.en; // Fallback to English
      }
      
      // Categorize tag
      tag.category = categorizeTag(tag.en);
      return tag;
    }));
    
    return c.json({
      tags: translatedTags,
      format,
      raw: generatedText
    });
  } catch (error) {
    console.error('Generation error:', error);
    return c.json({ error: 'Failed to generate tags' }, 500);
  }
});

// Helper function to categorize tags
function categorizeTag(text: string): string {
  const categoryKeywords = {
    person: ['girl', 'boy', 'woman', 'man', 'person', 'people', 'child', 'teen', 'adult'],
    appearance: ['hair', 'eyes', 'face', 'smile', 'expression', 'beautiful', 'cute', 'handsome'],
    clothing: ['dress', 'shirt', 'skirt', 'uniform', 'clothes', 'wearing', 'outfit', 'costume'],
    pose: ['sitting', 'standing', 'walking', 'running', 'pose', 'posing', 'action'],
    background: ['background', 'scenery', 'forest', 'city', 'sky', 'room', 'outdoor', 'indoor'],
    quality: ['masterpiece', 'quality', 'resolution', 'detailed', 'realistic', 'hd', '4k', '8k'],
    style: ['anime', 'realistic', 'cartoon', 'painting', 'illustration', 'digital', 'art', 'style'],
    other: []
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
// Main HTML page
const appHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SS Prompt Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- Custom Styles -->
    <style>
        /* Category Colors */
        [data-category="person"] { 
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); 
            border-color: #fbbf24;
        }
        [data-category="appearance"] { 
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
            border-color: #60a5fa;
        }
        [data-category="clothing"] { 
            background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); 
            border-color: #f9a8d4;
        }
        [data-category="pose"] { 
            background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%); 
            border-color: #c084fc;
        }
        [data-category="background"] { 
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); 
            border-color: #34d399;
        }
        [data-category="quality"] { 
            background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); 
            border-color: #fb923c;
        }
        [data-category="style"] { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde047 100%); 
            border-color: #fde047;
        }
        [data-category="other"] { 
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
            border-color: #9ca3af;
        }
        
        /* Block Styles */
        .tag-block {
            transition: all 0.2s ease;
            cursor: move;
            user-select: none;
            position: relative;
            overflow: hidden;
        }
        
        .tag-block:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .tag-block.dragging {
            opacity: 0.5;
            transform: rotate(2deg);
            z-index: 1000;
        }
        
        .tag-block.ghost {
            opacity: 0.2;
        }
        
        /* Drag and Drop Styles */
        .tag-card {
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                        box-shadow 0.2s ease;
            cursor: grab;
            position: relative;
            min-height: auto;
            display: block;
        }
        
        .tag-card:hover {
            transform: translateY(-1px);
        }
        
        /* Compact arrow buttons */
        .tag-card button {
            transition: all 0.15s ease;
        }
        
        .tag-card button:active {
            transform: scale(0.95);
        }
        
        .tag-text {
            word-break: break-word;
            overflow-wrap: break-word;
            line-height: 1.4;
            padding: 0;
            display: block;
        }
        
        .tag-card:active {
            cursor: grabbing;
        }
        
        .tag-card.dragging {
            opacity: 0.4;
            transform: scale(1.02) rotate(1deg);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
            z-index: 1000;
            cursor: grabbing !important;
            pointer-events: none;
        }
        
        /* Drop zone styles */
        .drop-zone {
            height: 2px;
            margin: 0;
            padding: 6px 0;
            background: transparent;
            transition: all 0.15s ease;
            position: relative;
            cursor: pointer;
        }
        
        .drop-zone-active {
            padding: 10px 0;
            margin: -8px 0;
        }
        
        .drop-zone-hover {
            height: 24px;
            padding: 0;
            margin: 4px 0;
            background: linear-gradient(90deg, 
                rgba(59, 130, 246, 0.15) 0%, 
                rgba(139, 92, 246, 0.25) 50%, 
                rgba(59, 130, 246, 0.15) 100%);
            border-radius: 6px;
            animation: dropZonePulse 0.8s ease-in-out infinite;
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
        }
        
        .drop-zone-hover::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, 
                transparent 0%, 
                #3b82f6 20%, 
                #8b5cf6 50%, 
                #3b82f6 80%, 
                transparent 100%);
            transform: translateY(-50%);
            animation: slideIndicator 2s linear infinite;
        }
        
        @keyframes dropZonePulse {
            0%, 100% { 
                opacity: 0.7;
                transform: scaleY(1) scaleX(1);
            }
            50% { 
                opacity: 1;
                transform: scaleY(1.1) scaleX(1.02);
            }
        }
        
        @keyframes slideIndicator {
            0% { transform: translateY(-50%) translateX(-100%); }
            100% { transform: translateY(-50%) translateX(100%); }
        }
        
        .tag-card.drag-over {
            transform: scale(0.97);
            opacity: 0.7;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Remove old drag indicators as we're using drop zones now */
        
        /* Grab handle icon */
        .drag-handle {
            cursor: grab;
            opacity: 0.3;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .tag-card:hover .drag-handle {
            opacity: 0.6;
            transform: translateX(1px);
            color: #3b82f6;
        }
        
        .tag-card:active .drag-handle,
        .tag-card.dragging .drag-handle {
            cursor: grabbing;
            opacity: 1;
            color: #8b5cf6;
            transform: scale(1.1);
        }
        
        /* Prevent text selection during drag */
        .tag-card.dragging * {
            user-select: none;
            pointer-events: none;
        }
        
        /* Split panes */
        .gutter {
            background-color: #e5e7eb;
            background-repeat: no-repeat;
            background-position: 50%;
            cursor: col-resize;
        }
        
        .gutter:hover {
            background-color: #d1d5db;
        }
        
        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.2s;
        }
        
        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 0.75rem;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideIn 0.3s;
        }
        
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        /* Loading spinner */
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Scrollbar Styles */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Tab animation */
        .tab-button {
            position: relative;
            transition: all 0.3s ease;
        }
        
        .tab-button::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: #3b82f6;
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }
        
        .tab-button.active::after {
            transform: scaleX(1);
        }
        
        /* Tooltip */
        .tooltip {
            position: relative;
        }
        
        .tooltip::before {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }
        
        .tooltip:hover::before {
            opacity: 1;
        }
    </style>
</head>
<body class="bg-gray-50 overflow-hidden h-screen">
    <!-- Main Application Container -->
    <div id="app" class="flex flex-col h-full">
        
        <!-- Header -->
        <header class="bg-white shadow-sm border-b flex-shrink-0">
            <div class="px-4 py-3 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        SS Prompt Manager
                    </h1>
                    <span class="text-sm text-gray-500">v2.0</span>
                </div>
                
                <div class="flex items-center gap-3">
                    <!-- Status Indicator -->
                    <div class="flex items-center gap-2">
                        <div id="status-indicator" class="w-2 h-2 rounded-full bg-green-500"></div>
                        <span id="status-text" class="text-sm text-gray-600">Ready</span>
                    </div>
                    
                    <!-- Settings Button -->
                    <button onclick="App.showSettings()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors tooltip" data-tooltip="設定">
                        <i class="fas fa-cog text-xl text-gray-600"></i>
                    </button>
                </div>
            </div>
        </header>
        
        <!-- Tab Navigation -->
        <nav class="bg-white border-b flex-shrink-0">
            <div class="px-4">
                <div class="flex gap-2">
                    <button class="tab-button active py-3 px-6 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            onclick="App.setTab('text')" id="tab-text">
                        <i class="fas fa-file-alt mr-2"></i>
                        Text to Prompt
                    </button>
                    <button class="tab-button py-3 px-6 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            onclick="App.setTab('image')" id="tab-image">
                        <i class="fas fa-image mr-2"></i>
                        Image to Prompt
                    </button>
                    <button class="tab-button py-3 px-6 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            onclick="App.setTab('batch')" id="tab-batch">
                        <i class="fas fa-layer-group mr-2"></i>
                        Batch Processing
                    </button>
                </div>
            </div>
        </nav>
        
        <!-- Main Content Area -->
        <main class="flex-1 overflow-hidden">
            <!-- Text Tab Content -->
            <div id="content-text" class="h-full p-4">
                <div id="split-container" class="flex gap-4 h-full">
                    <!-- Left Panel: Main Editor -->
                    <div id="left-panel" class="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                        
                        <!-- Input Section -->
                        <section class="bg-white rounded-lg shadow-sm p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-lg font-semibold text-gray-700">
                                    <i class="fas fa-keyboard mr-2 text-blue-500"></i>
                                    Input
                                </h2>
                                <div class="flex gap-2">
                                    <button onclick="App.pasteFromClipboard()" 
                                            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                        <i class="fas fa-paste mr-1"></i>Paste
                                    </button>
                                    <button onclick="App.clearInput()" 
                                            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                        <i class="fas fa-eraser mr-1"></i>Clear
                                    </button>
                                </div>
                            </div>
                            
                            <textarea id="input-text" 
                                      placeholder="Enter your prompt, description, or idea here..."
                                      class="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"></textarea>
                            
                            <!-- Action Buttons -->
                            <div class="flex gap-2 mt-3 flex-wrap items-center">
                                <button onclick="App.splitText()" 
                                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    <i class="fas fa-cut mr-2"></i>Split to Tags
                                </button>
                                
                                <button onclick="App.analyzeAndCategorize()" 
                                        class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                                    <i class="fas fa-brain mr-2"></i>AI Analyze
                                </button>
                                
                                <div class="ml-auto flex items-center gap-2">
                                    <label class="text-sm text-gray-600">AI Format:</label>
                                    <div class="flex items-center gap-1">
                                        <select id="output-format" onchange="App.updateOutputFormat()" 
                                                class="px-3 py-2 border rounded-lg text-sm">
                                            <option value="sdxl">SDXL Tags</option>
                                            <option value="flux">Flux Phrases</option>
                                            <option value="imagefx">ImageFX</option>
                                            <option value="imagefx-natural">ImageFX Natural</option>
                                        </select>
                                        <button onclick="App.showPromptEditor()" 
                                                class="px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit System Prompt">
                                            <i class="fas fa-cog"></i>
                                        </button>
                                        <button onclick="App.addCustomFormat()" 
                                                class="px-2 py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Add Custom Format">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Model indicator -->
                                    <div class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600" title="Current AI Model">
                                        <i class="fas fa-robot mr-1"></i>
                                        <span id="current-model-indicator">No model</span>
                                    </div>
                                    
                                    <button onclick="App.generateOptimized()" 
                                            class="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all">
                                        <i class="fas fa-sparkles mr-2"></i>AI Generate
                                    </button>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Tag Editor Section -->
                        <section class="bg-white rounded-lg shadow-sm p-4 flex-1">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-lg font-semibold text-gray-700">
                                    <i class="fas fa-tags mr-2 text-green-500"></i>
                                    Tag Editor
                                </h2>
                                <div class="flex gap-2">
                                    <button onclick="App.sortTags('category')" 
                                            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors tooltip" 
                                            data-tooltip="Sort by Category">
                                        <i class="fas fa-sort-alpha-down"></i>
                                    </button>
                                    <button onclick="App.sortTags('weight')" 
                                            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors tooltip" 
                                            data-tooltip="Sort by Weight">
                                        <i class="fas fa-sort-numeric-down"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Bilingual Tag Columns -->
                            <div class="grid grid-cols-2 gap-4">
                                <!-- English Column -->
                                <div>
                                    <div class="flex items-center justify-between mb-2 pb-2 border-b">
                                        <h3 class="font-medium text-gray-700">
                                            <i class="fas fa-globe mr-1 text-blue-500"></i>English
                                        </h3>
                                        <button onclick="App.translateAll('en-to-ja')" 
                                                class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors">
                                            Translate All →
                                        </button>
                                    </div>
                                    
                                    <!-- Add New Tag -->
                                    <div class="flex gap-1 mb-3">
                                        <input type="text" id="new-tag-en" 
                                               placeholder="Add new tag..." 
                                               class="flex-1 px-2 py-1 text-sm border rounded"
                                               onkeydown="if(event.key==='Enter') App.addNewTag('en')">
                                        <button onclick="App.addNewTag('en')" 
                                                class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            <i class="fas fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Tag List -->
                                    <div id="tags-en" class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                                        <!-- Tags will be dynamically inserted here -->
                                    </div>
                                </div>
                                
                                <!-- Japanese Column -->
                                <div>
                                    <div class="flex items-center justify-between mb-2 pb-2 border-b">
                                        <h3 class="font-medium text-gray-700">
                                            <i class="fas fa-torii-gate mr-1 text-red-500"></i>日本語
                                        </h3>
                                        <button onclick="App.translateAll('ja-to-en')" 
                                                class="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors">
                                            ← Translate All
                                        </button>
                                    </div>
                                    
                                    <!-- Add New Tag -->
                                    <div class="flex gap-1 mb-3">
                                        <input type="text" id="new-tag-ja" 
                                               placeholder="新しいタグを追加..." 
                                               class="flex-1 px-2 py-1 text-sm border rounded"
                                               onkeydown="if(event.key==='Enter') App.addNewTag('ja')">
                                        <button onclick="App.addNewTag('ja')" 
                                                class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            <i class="fas fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Tag List -->
                                    <div id="tags-ja" class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                                        <!-- Tags will be dynamically inserted here -->
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Output Section -->
                        <section class="bg-white rounded-lg shadow-sm p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-lg font-semibold text-gray-700">
                                    <i class="fas fa-file-export mr-2 text-orange-500"></i>
                                    Final Output
                                </h2>
                                <div class="flex items-center gap-2">
                                    <label class="text-sm text-gray-600">Format:</label>
                                    <select id="final-output-format" onchange="App.updateFinalOutputFormat()" 
                                            class="px-2 py-1 border rounded text-sm">
                                        <option value="sdxl">SDXL Tags</option>
                                        <option value="flux">Flux Phrases</option>
                                        <option value="imagefx">ImageFX</option>
                                        <option value="imagefx-natural">ImageFX Natural</option>
                                    </select>
                                    <div class="flex gap-1 ml-2">
                                        <button onclick="App.copyOutput()" 
                                                class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                            <i class="fas fa-copy mr-1"></i>Copy
                                        </button>
                                        <button onclick="App.downloadOutput()" 
                                                class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                            <i class="fas fa-download mr-1"></i>Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 rounded-lg p-3">
                                <pre id="output-text" class="whitespace-pre-wrap text-sm font-mono text-gray-700">No output generated yet...</pre>
                            </div>
                        </section>
                    </div>
                    
                    <!-- Right Panel: Image Generation -->
                    <div id="right-panel" class="w-96 bg-white rounded-lg shadow-sm p-4 overflow-y-auto custom-scrollbar">
                        <h2 class="text-lg font-semibold text-gray-700 mb-4">
                            <i class="fas fa-image mr-2 text-indigo-500"></i>
                            Image Generation
                        </h2>
                        
                        <!-- Prompt Preview -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-600 mb-1">Prompt Preview</label>
                            <div id="image-prompt-preview" class="bg-gray-50 rounded-lg p-3 text-sm max-h-32 overflow-y-auto custom-scrollbar">
                                No prompt available
                            </div>
                        </div>
                        
                        <!-- Generation Settings -->
                        <div class="space-y-3 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-1">Model</label>
                                <select id="image-model" class="w-full px-3 py-2 border rounded-lg text-sm">
                                    <option value="sdxl">SDXL 1.0</option>
                                    <option value="flux-dev">Flux.1 Dev</option>
                                    <option value="flux-pro">Flux.1 Pro</option>
                                    <option value="dalle3">DALL-E 3</option>
                                    <option value="midjourney">Midjourney v6</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-1">Aspect Ratio</label>
                                <select id="aspect-ratio" class="w-full px-3 py-2 border rounded-lg text-sm">
                                    <option value="1:1">1:1 (Square)</option>
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="9:16">9:16 (Portrait)</option>
                                    <option value="4:3">4:3 (Classic)</option>
                                    <option value="3:4">3:4 (Classic Portrait)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-1">Quality</label>
                                <select id="image-quality" class="w-full px-3 py-2 border rounded-lg text-sm">
                                    <option value="standard">Standard</option>
                                    <option value="hd">HD</option>
                                    <option value="ultra">Ultra HD</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Generate Button -->
                        <button onclick="App.generateImage()" 
                                class="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                            <i class="fas fa-magic mr-2"></i>Generate Image
                        </button>
                        
                        <!-- Generated Image Display -->
                        <div id="generated-image" class="mt-4">
                            <!-- Images will be displayed here -->
                        </div>
                        
                        <!-- Image History -->
                        <div class="mt-6 pt-4 border-t">
                            <h3 class="text-sm font-medium text-gray-600 mb-2">History</h3>
                            <div id="image-history" class="space-y-2">
                                <!-- History items will be displayed here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Image Tab Content -->
            <div id="content-image" class="h-full p-4 hidden">
                <div id="image-split-container" class="flex flex-col gap-4 h-full">
                    <!-- Top Section: Image Input and AI Output side by side -->
                    <div class="flex gap-4" style="height: 40%;">
                        <!-- Left: Image Input -->
                        <section class="bg-white rounded-lg shadow-sm p-4 flex-1">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-lg font-semibold text-gray-700">
                                    <i class="fas fa-image mr-2 text-purple-500"></i>
                                    Input
                                </h2>
                                <button onclick="App.clearImage()" 
                                        class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                    <i class="fas fa-trash mr-1"></i>Clear
                                </button>
                            </div>
                            
                            <!-- Compact Image Drop Zone -->
                            <div id="image-drop-zone" 
                                 class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer h-48 flex items-center justify-center"
                                 ondrop="App.handleImageDrop(event)"
                                 ondragover="App.handleDragOver(event)"
                                 ondragleave="App.handleDragLeave(event)"
                                 onclick="document.getElementById('image-file-input').click()">
                                
                                <div id="image-preview-container" class="hidden w-full h-full">
                                    <img id="image-preview" class="max-w-full max-h-full object-contain rounded-lg" />
                                </div>
                                
                                <div id="image-upload-prompt">
                                    <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                    <p class="text-sm text-gray-600">Drop image or click</p>
                                    <p class="text-xs text-gray-500">Max 10MB</p>
                                </div>
                            </div>
                            
                            <input type="file" id="image-file-input" accept="image/*" class="hidden" onchange="App.handleImageUpload(event)">
                        </section>
                        
                        <!-- Right: AI Format Output -->
                        <section class="bg-white rounded-lg shadow-sm p-4 flex-1">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-lg font-semibold text-gray-700">
                                    <i class="fas fa-sparkles mr-2 text-cyan-500"></i>
                                    AI Format Prompt
                                </h2>
                            </div>
                            
                            <!-- AI Generated Prompt Display -->
                            <textarea id="image-generated-prompt" 
                                      placeholder="AI formatted prompt will appear here..."
                                      class="w-full h-48 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm bg-gray-50"
                                      readonly></textarea>
                        </section>
                    </div>
                    
                    <!-- Middle Section: Controls and Actions -->
                    <div class="bg-white rounded-lg shadow-sm p-4">
                        <div class="flex items-center gap-4">
                            <!-- AI Analysis Result Toggle -->
                            <button onclick="App.toggleAnalysisResult()" 
                                    class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                    id="toggle-analysis-btn">
                                <i class="fas fa-eye mr-1"></i>
                                <span id="toggle-analysis-text">Show AI Analysis</span>
                                <i class="fas fa-chevron-down ml-1" id="toggle-analysis-icon"></i>
                            </button>
                            
                            <!-- Format Selection -->
                            <div class="flex items-center gap-2">
                                <label class="text-sm text-gray-600">AI Format:</label>
                                <select id="image-output-format" onchange="App.updateImageOutputFormat()" 
                                        class="px-3 py-2 border rounded-lg text-sm">
                                    <option value="sdxl">SDXL Tags</option>
                                    <option value="flux">Flux Phrases</option>
                                    <option value="imagefx">ImageFX Commands</option>
                                    <option value="natural">Natural Language</option>
                                </select>
                                <button onclick="App.showImagePromptEditor()" 
                                        class="px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Edit System Prompt">
                                    <i class="fas fa-cog"></i>
                                </button>
                                <button onclick="App.addImageCustomFormat()" 
                                        class="px-2 py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                                        title="Add Custom Format">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            
                            <!-- Model Selection -->
                            <div class="flex items-center gap-2">
                                <label class="text-sm text-gray-600">Model:</label>
                                <select id="vision-model-select" onchange="App.updateVisionModel()" 
                                        class="px-3 py-2 border rounded-lg text-sm">
                                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                                    <option value="google/gemini-flash-1.5-8b">Gemini 1.5 8B (Free)</option>
                                    <option value="google/gemini-flash-1.5">Gemini 1.5</option>
                                    <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                                    <option value="openai/gpt-4o">GPT-4o</option>
                                    <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                                </select>
                            </div>
                            
                            <!-- AI Generate Button -->
                            <button onclick="App.generateFromImage()" 
                                    class="ml-auto px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    id="image-ai-generate-btn" disabled>
                                <i class="fas fa-sparkles mr-2"></i>AI Generate
                            </button>
                        </div>
                        
                        <!-- Collapsible AI Analysis Result -->
                        <div id="analysis-result-container" class="mt-4 hidden">
                            <div class="border-t pt-4">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="text-sm font-semibold text-gray-700">
                                        <i class="fas fa-brain mr-1 text-blue-500"></i>
                                        AI Analysis Result
                                    </h3>
                                    <button onclick="App.copyAnalysisResult()" 
                                            class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                                        <i class="fas fa-copy mr-1"></i>Copy
                                    </button>
                                </div>
                                <div id="image-analysis-result" class="p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                                    <p class="text-gray-500 text-sm italic">No analysis yet...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bottom Section: Tag Editor and Final Output -->
                    <div class="flex gap-4 flex-1 overflow-hidden">
                        <!-- Tag Editor Section -->
                        <section class="bg-white rounded-lg shadow-sm p-4 flex-1 overflow-hidden">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-lg font-semibold text-gray-700">
                                    <i class="fas fa-tags mr-2 text-green-500"></i>
                                    Tag Editor
                                </h2>
                                <div class="flex gap-2">
                                    <button onclick="App.sortImageTags('category')" 
                                            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors tooltip" 
                                            data-tooltip="Sort by Category">
                                        <i class="fas fa-sort-alpha-down"></i>
                                    </button>
                                    <button onclick="App.sortImageTags('weight')" 
                                            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors tooltip" 
                                            data-tooltip="Sort by Weight">
                                        <i class="fas fa-sort-numeric-down"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Bilingual Tag Columns for Image Tab -->
                            <div class="grid grid-cols-2 gap-4" style="height: calc(100% - 40px);">
                                <!-- English Column -->
                                <div class="flex flex-col">
                                    <div class="flex items-center justify-between mb-2 pb-2 border-b">
                                        <h3 class="font-medium text-gray-700">
                                            <i class="fas fa-globe mr-1 text-blue-500"></i>English
                                        </h3>
                                        <button onclick="App.translateImageTags('en-to-ja')" 
                                                class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors">
                                            Translate All →
                                        </button>
                                    </div>
                                    
                                    <!-- Add New Tag -->
                                    <div class="flex gap-1 mb-3">
                                        <input type="text" id="new-image-tag-en" 
                                               placeholder="Add new tag..." 
                                               class="flex-1 px-2 py-1 text-sm border rounded"
                                               onkeydown="if(event.key==='Enter') App.addNewImageTag('en')">
                                        <button onclick="App.addNewImageTag('en')" 
                                                class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            <i class="fas fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Tag List -->
                                    <div id="image-tags-en" class="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                        <!-- Tags will be dynamically inserted here -->
                                    </div>
                                </div>
                                
                                <!-- Japanese Column -->
                                <div class="flex flex-col">
                                    <div class="flex items-center justify-between mb-2 pb-2 border-b">
                                        <h3 class="font-medium text-gray-700">
                                            <i class="fas fa-torii-gate mr-1 text-red-500"></i>日本語
                                        </h3>
                                        <button onclick="App.translateImageTags('ja-to-en')" 
                                                class="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors">
                                            ← Translate All
                                        </button>
                                    </div>
                                    
                                    <!-- Add New Tag -->
                                    <div class="flex gap-1 mb-3">
                                        <input type="text" id="new-image-tag-ja" 
                                               placeholder="新しいタグを追加..." 
                                               class="flex-1 px-2 py-1 text-sm border rounded"
                                               onkeydown="if(event.key==='Enter') App.addNewImageTag('ja')">
                                        <button onclick="App.addNewImageTag('ja')" 
                                                class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            <i class="fas fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Tag List -->
                                    <div id="image-tags-ja" class="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                        <!-- Tags will be dynamically inserted here -->
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Final Output Section -->
                        <section class="bg-white rounded-lg shadow-sm p-4 w-96">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-lg font-semibold text-gray-700">
                                    <i class="fas fa-file-export mr-2 text-orange-500"></i>
                                    Final Output
                                </h2>
                                <div class="flex items-center gap-2">
                                    <label class="text-sm text-gray-600">Format:</label>
                                    <select id="image-final-output-format" onchange="App.updateImageFinalFormat()" 
                                            class="px-2 py-1 border rounded text-sm">
                                        <option value="sdxl">SDXL Tags</option>
                                        <option value="flux">Flux Phrases</option>
                                        <option value="imagefx">ImageFX</option>
                                        <option value="imagefx-natural">ImageFX Natural</option>
                                    </select>
                                </div>
                            </div>
                            
                            <textarea id="image-final-output" 
                                      placeholder="Final formatted output will appear here..."
                                      class="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                                      readonly></textarea>
                            
                            <div class="flex gap-2 mt-3">
                                <button onclick="App.copyImageFinalOutput()" 
                                        class="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                    <i class="fas fa-copy mr-1"></i>Copy
                                </button>
                                <button onclick="App.downloadImageOutput()" 
                                        class="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                    <i class="fas fa-download mr-1"></i>Download
                                </button>
                                <button onclick="App.sendImageToMainEditor()" 
                                        class="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    <i class="fas fa-arrow-right mr-1"></i>Send to Main
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            
            <!-- Batch Tab Content -->
            <div id="content-batch" class="h-full p-4 hidden">
                <div class="bg-white rounded-lg shadow-sm p-8 h-full">
                    <div class="max-w-2xl mx-auto">
                        <h2 class="text-2xl font-semibold text-gray-700 mb-4">
                            <i class="fas fa-layer-group mr-2 text-green-500"></i>
                            Batch Processing
                        </h2>
                        <p class="text-gray-600 mb-6">Process multiple prompts at once</p>
                        
                        <textarea id="batch-input" 
                                  placeholder="Enter multiple prompts, one per line..."
                                  class="w-full h-64 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"></textarea>
                        
                        <div class="flex gap-2 mt-4">
                            <button onclick="App.processBatch()" 
                                    class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                <i class="fas fa-play mr-2"></i>Process All
                            </button>
                            <button onclick="App.clearBatch()" 
                                    class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                <i class="fas fa-trash mr-2"></i>Clear
                            </button>
                        </div>
                        
                        <div id="batch-results" class="mt-6">
                            <!-- Batch results will be displayed here -->
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <!-- Settings Modal -->
    <div id="settings-modal" class="modal">
        <div class="modal-content">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-semibold text-gray-800">
                        <i class="fas fa-cog mr-2"></i>Settings
                    </h2>
                    <button onclick="App.closeSettings()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Settings Tabs -->
                <div class="border-b mb-4">
                    <div class="flex gap-4">
                        <button class="py-2 px-4 border-b-2 border-blue-500 text-blue-600" 
                                data-settings-tab="api"
                                onclick="App.setSettingsTab('api')">API Keys</button>
                        <button class="py-2 px-4 border-b-2 border-transparent text-gray-600" 
                                data-settings-tab="formats"
                                onclick="App.setSettingsTab('formats')">Custom Formats</button>
                        <button class="py-2 px-4 border-b-2 border-transparent text-gray-600" 
                                data-settings-tab="preferences"
                                onclick="App.setSettingsTab('preferences')">Preferences</button>
                    </div>
                </div>
                
                <!-- API Settings -->
                <div id="settings-api" class="space-y-4">
                    <!-- OpenRouter API Key -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            <i class="fas fa-key mr-1 text-blue-500"></i>
                            OpenRouter API Key
                        </label>
                        <div class="flex gap-2">
                            <input type="password" id="openrouter-api-key" 
                                   placeholder="sk-or-v1-..." 
                                   class="flex-1 px-3 py-2 border rounded-lg"
                                   onchange="App.updateOpenRouterKey(this.value)">
                            <button onclick="App.testOpenRouterKey()" 
                                    class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                                <i class="fas fa-check-circle mr-1"></i>Test
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">
                            Get your API key from <a href="https://openrouter.ai/keys" target="_blank" class="text-blue-500 hover:underline">OpenRouter</a>
                        </p>
                    </div>
                    
                    <!-- Model Selection -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            <i class="fas fa-robot mr-1 text-purple-500"></i>
                            AI Model
                        </label>
                        <div class="flex gap-2 items-start">
                            <select id="openrouter-model" class="flex-1 px-3 py-2 border rounded-lg"
                                    onchange="App.updateOpenRouterModel(this.value)">
                                <option value="">Loading models...</option>
                            </select>
                            <button onclick="App.refreshModelList()" 
                                    class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                    title="Refresh model list">
                                <i class="fas fa-sync"></i>
                            </button>
                        </div>
                        <div id="model-info" class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 hidden">
                            <!-- Model information will be displayed here -->
                        </div>
                    </div>
                    
                    <!-- Quick Model Selection -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-star mr-1 text-yellow-500"></i>
                            Quick Select
                        </label>
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="App.selectRecommendedModel('general')" 
                                    class="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm transition-colors">
                                <i class="fas fa-globe mr-1"></i>General
                            </button>
                            <button onclick="App.selectRecommendedModel('creative')" 
                                    class="px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-sm transition-colors">
                                <i class="fas fa-palette mr-1"></i>Creative
                            </button>
                            <button onclick="App.selectRecommendedModel('translation')" 
                                    class="px-3 py-2 bg-green-100 hover:bg-green-200 rounded-lg text-sm transition-colors">
                                <i class="fas fa-language mr-1"></i>Translation
                            </button>
                            <button onclick="App.selectRecommendedModel('free')" 
                                    class="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-sm transition-colors">
                                <i class="fas fa-gift mr-1"></i>Free
                            </button>
                        </div>
                    </div>
                    
                    <!-- API Status -->
                    <div id="api-status" class="p-3 rounded-lg hidden">
                        <!-- API status will be displayed here -->
                    </div>
                    
                    <!-- Image Generation API (Optional) -->
                    <div class="pt-4 border-t">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            <i class="fas fa-image mr-1 text-indigo-500"></i>
                            Image Generation API Key (Optional)
                        </label>
                        <input type="password" id="image-api-key" 
                               placeholder="Your image generation API key..." 
                               class="w-full px-3 py-2 border rounded-lg">
                        <p class="text-xs text-gray-500 mt-1">
                            For connecting to DALL-E, Midjourney, or other image APIs
                        </p>
                    </div>
                </div>
                
                <!-- System Prompts Settings -->
                <div id="settings-prompts" class="space-y-4 hidden">
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p class="text-sm text-yellow-800">
                            <i class="fas fa-info-circle mr-1"></i>
                            System Prompts control how AI processes your inputs. Edit carefully.
                        </p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">SDXL Optimization Prompt</label>
                        <textarea id="sp-sdxl" rows="4" 
                                  class="w-full px-3 py-2 border rounded-lg text-sm font-mono"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Flux Optimization Prompt</label>
                        <textarea id="sp-flux" rows="4" 
                                  class="w-full px-3 py-2 border rounded-lg text-sm font-mono"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Translation Prompt</label>
                        <textarea id="sp-translate" rows="4" 
                                  class="w-full px-3 py-2 border rounded-lg text-sm font-mono"></textarea>
                    </div>
                </div>
                
                <!-- Custom Formats Tab -->
                <div id="settings-formats" class="space-y-4 hidden">
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-lg font-medium text-gray-700">
                                <i class="fas fa-palette mr-2 text-purple-500"></i>
                                Custom Output Formats
                            </h3>
                            <button onclick="App.addCustomFormat()" 
                                    class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                                <i class="fas fa-plus mr-1"></i>Add New Format
                            </button>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-4">
                            Create custom formats with your own system prompts for AI generation.
                            These formats will appear in both AI Format and Final Output dropdowns.
                        </p>
                        
                        <!-- Custom Formats List -->
                        <div id="custom-formats-list" class="space-y-2">
                            <!-- Dynamically populated -->
                        </div>
                        
                        <!-- Default Formats Info -->
                        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 class="font-medium text-blue-900 mb-2">Default Formats</h4>
                            <div class="space-y-1 text-sm text-blue-700">
                                <div class="flex items-center justify-between">
                                    <span><i class="fas fa-tag mr-1"></i> SDXL Tags</span>
                                    <button onclick="App.showPromptEditor('sdxl')" 
                                            class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">
                                        <i class="fas fa-edit"></i> View/Edit
                                    </button>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span><i class="fas fa-tag mr-1"></i> Flux Phrases</span>
                                    <button onclick="App.showPromptEditor('flux')" 
                                            class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">
                                        <i class="fas fa-edit"></i> View/Edit
                                    </button>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span><i class="fas fa-tag mr-1"></i> ImageFX</span>
                                    <button onclick="App.showPromptEditor('imagefx')" 
                                            class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">
                                        <i class="fas fa-edit"></i> View/Edit
                                    </button>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span><i class="fas fa-tag mr-1"></i> ImageFX Natural</span>
                                    <button onclick="App.showPromptEditor('imagefx-natural')" 
                                            class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">
                                        <i class="fas fa-edit"></i> View/Edit
                                    </button>
                                </div>
                            </div>
                            <p class="text-xs text-blue-600 mt-2">
                                Default formats can be edited but not deleted. Use "Reset to Default" to restore original prompts.
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Preferences -->
                <div id="settings-preferences" class="space-y-4 hidden">
                    <div>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="auto-translate" class="rounded">
                            <span class="text-sm">Auto-translate when adding tags</span>
                        </label>
                    </div>
                    
                    <div>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="auto-categorize" class="rounded">
                            <span class="text-sm">Auto-categorize new tags</span>
                        </label>
                    </div>
                    
                    <div>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="preserve-special" class="rounded" checked>
                            <span class="text-sm">Preserve special tags (e.g., "Anko")</span>
                        </label>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                        <select id="theme" class="w-full px-3 py-2 border rounded-lg">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto (System)</option>
                        </select>
                    </div>
                </div>
                
                <!-- Save Button -->
                <div class="mt-6 flex justify-end gap-2">
                    <button onclick="App.resetSettings()" 
                            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Reset to Defaults
                    </button>
                    <button onclick="App.saveSettings()" 
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Loading Overlay -->
    <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-6 flex flex-col items-center">
            <div class="spinner mb-4"></div>
            <p id="loading-text" class="text-gray-700">Processing...</p>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app-main.js"></script>
</body>
</html>`

type Bindings = {
  OPENROUTER_API_KEY?: string
  IMAGE_API_KEY?: string
}

// OpenRouter types
interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length?: number
  pricing?: {
    prompt?: string
    completion?: string
    image?: string
  }
  architecture?: {
    input_modalities?: string[]
    output_modalities?: string[]
  }
  top_provider?: {
    context_length?: number
    max_completion_tokens?: number
  }
}

// CORS設定
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// 静的ファイルのサービング
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/*.html', serveStatic({ root: './public' }))
app.use('/*.js', serveStatic({ root: './public' }))
app.use('/*.css', serveStatic({ root: './public' }))

// ルートハンドラ - 新しいapp.htmlを返す
app.get('/', (c) => {
  return c.html(appHtml)
})

// API: AI色分け（改善版）
app.post('/api/categorize', async (c) => {
  const { blocks } = await c.req.json()
  
  if (!blocks || blocks.length === 0) {
    return c.json({ error: 'Blocks are required' }, 400)
  }
  
  // より詳細なカテゴリ分類のためのキーワード辞書
  const categoryKeywords = {
    person: ['girl', 'boy', 'woman', 'man', 'person', 'character', 'people', 'child', 'adult', 'teen', 'female', 'male', 'lady', 'gentleman', '女の子', '男の子', '女性', '男性', '人物', 'キャラクター'],
    appearance: ['hair', 'eyes', 'face', 'skin', 'blonde', 'brown', 'black', 'blue', 'green', 'red', 'long', 'short', 'curly', 'straight', 'beautiful', 'cute', 'handsome', 'pretty', 'smile', 'expression', '髪', '目', '顔', '肌', '金髪', '茶髪', '黒髪', '青い目', '緑の目', '笑顔'],
    clothing: ['dress', 'shirt', 'pants', 'skirt', 'jacket', 'coat', 'shoes', 'hat', 'uniform', 'clothes', 'wearing', 'outfit', 'costume', 'suit', 'sweater', 'jeans', 'boots', 'gloves', 'ドレス', 'シャツ', '服', '制服', 'スーツ', 'コート', '靴'],
    pose: ['standing', 'sitting', 'walking', 'running', 'jumping', 'lying', 'pose', 'posture', 'action', 'gesture', 'holding', 'looking', 'pointing', 'waving', 'kneeling', '立つ', '座る', '走る', 'ポーズ', '見る', '持つ'],
    background: ['background', 'scenery', 'landscape', 'indoor', 'outdoor', 'sky', 'room', 'forest', 'city', 'beach', 'mountain', 'street', 'building', 'nature', 'park', 'sunset', 'night', 'day', '背景', '空', '部屋', '森', '街', '屋外', '屋内', '自然', '夕日'],
    quality: ['quality', 'masterpiece', 'best', 'detailed', 'realistic', 'hd', '4k', '8k', 'high quality', 'best quality', 'professional', 'ultra', 'super', 'hyper', 'resolution', '品質', '傑作', '最高', '詳細', '高画質', 'プロフェッショナル'],
    style: ['style', 'anime', 'realistic', 'cartoon', 'painting', 'illustration', 'digital', 'art', 'artistic', 'cinematic', 'photography', 'drawing', 'sketch', 'watercolor', 'oil painting', 'スタイル', 'アニメ', 'リアル', '絵画', 'イラスト', '写真']
  }
  
  // 改善されたカテゴリ分類
  const categorizedBlocks = blocks.map((block: any) => {
    const text = (block.en + ' ' + block.ja).toLowerCase()
    let detectedCategory = 'other'
    let maxScore = 0
    
    // 各カテゴリのスコアを計算
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          // キーワードの長さと完全一致度に基づくスコア
          const keywordLower = keyword.toLowerCase()
          if (text === keywordLower) {
            score += 10 // 完全一致
          } else if (text.split(/\s+/).includes(keywordLower)) {
            score += 5 // 単語として含まれる
          } else {
            score += 2 // 部分的に含まれる
          }
        }
      }
      
      if (score > maxScore) {
        maxScore = score
        detectedCategory = category
      }
    }
    
    // 特殊なパターンの処理（引用符や括弧で囲まれた文字列）
    if (text.match(/["'()]/) && detectedCategory === 'other') {
      // 文章的な内容は style または other に分類
      if (text.length > 20) {
        detectedCategory = 'style'
      }
    }
    
    return {
      ...block,
      category: detectedCategory
    }
  })
  
  return c.json({ blocks: categorizedBlocks })
})

// API: 画像生成（モック）
app.post('/api/generate-image', async (c) => {
  const { prompt, model, parameters } = await c.req.json()
  
  if (!prompt) {
    return c.json({ error: 'Prompt is required' }, 400)
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const mockImage = {
    url: `https://via.placeholder.com/512x512.png?text=${encodeURIComponent(prompt.slice(0, 20))}`,
    seed: Math.floor(Math.random() * 1000000),
    model: model || 'sdxl-1.0',
    timestamp: new Date().toISOString()
  }
  
  return c.json({ image: mockImage })
})

// API: OpenRouter models list
app.get('/api/openrouter/models', async (c) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    const data = await response.json() as { data: OpenRouterModel[] }
    
    // Filter and format models for frontend
    const formattedModels = data.data
      .filter(model => 
        model.architecture?.input_modalities?.includes('text') &&
        model.architecture?.output_modalities?.includes('text')
      )
      .map(model => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description,
        contextLength: model.top_provider?.context_length || model.context_length || 0,
        pricing: {
          prompt: model.pricing?.prompt || '0',
          completion: model.pricing?.completion || '0'
        }
      }))
      .sort((a, b) => {
        // Prioritize popular models
        const priorityModels = ['gpt-4o', 'claude-3', 'deepseek', 'gemini', 'mistral']
        const aPriority = priorityModels.findIndex(p => a.id.toLowerCase().includes(p))
        const bPriority = priorityModels.findIndex(p => b.id.toLowerCase().includes(p))
        
        if (aPriority !== -1 && bPriority === -1) return -1
        if (aPriority === -1 && bPriority !== -1) return 1
        if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority
        
        return a.name.localeCompare(b.name)
      })

    return c.json({ models: formattedModels })
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error)
    return c.json({ error: 'Failed to fetch models', models: [] }, 500)
  }
})

// API: OpenRouter chat completion
app.post('/api/openrouter/chat', async (c) => {
  const { messages, model, systemPrompt, temperature = 0.7, maxTokens = 2000, apiKey: clientApiKey } = await c.req.json()
  
  // Use client-provided API key first, then fall back to environment variable
  const apiKey = clientApiKey || c.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return c.json({ error: 'OpenRouter API key not configured' }, 400)
  }

  if (!messages || !model) {
    return c.json({ error: 'Messages and model are required' }, 400)
  }

  try {
    // Prepare messages with system prompt if provided
    const chatMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
        'X-Title': 'SS Prompt Manager'
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${error}`)
    }

    const data = await response.json()
    return c.json({
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
      model: data.model
    })
  } catch (error) {
    console.error('OpenRouter chat error:', error)
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to process chat request' 
    }, 500)
  }
})

// API: Translate text
app.post('/api/translate', async (c) => {
  const { text, sourceLang, targetLang, model = 'openai/gpt-4o-mini', apiKey: clientApiKey } = await c.req.json()
  const apiKey = clientApiKey || c.env.OPENROUTER_API_KEY

  if (!apiKey) {
    // Fallback to simple translation
    return c.json({ translated: text })
  }

  if (!text) {
    return c.json({ error: 'Text is required' }, 400)
  }

  const systemPrompt = `You are a professional translator specializing in image generation prompts. 
Translate the following text from ${sourceLang} to ${targetLang}. 
Maintain technical terms, preserve emphasis markers like parentheses and colons with weights.
Return only the translation, no explanations.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
        'X-Title': 'SS Prompt Manager'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error('Translation failed')
    }

    const data = await response.json()
    return c.json({
      translated: data.choices?.[0]?.message?.content || text
    })
  } catch (error) {
    console.error('Translation error:', error)
    // Fallback to returning original text
    return c.json({ translated: text })
  }
})

// API: Optimize prompt for specific format
app.post('/api/optimize', async (c) => {
  const { prompt, format, model = 'openai/gpt-4o', systemPromptOverride, apiKey: clientApiKey } = await c.req.json()
  const apiKey = clientApiKey || c.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return c.json({ error: 'OpenRouter API key not configured' }, 400)
  }

  if (!prompt || !format) {
    return c.json({ error: 'Prompt and format are required' }, 400)
  }

  // Default system prompts for different formats
  const systemPrompts = {
    sdxl: `You are an expert at optimizing prompts for SDXL image generation.
Convert the input into comma-separated tags with appropriate weights.
Format: tag1, tag2, (emphasized tag:1.2), [de-emphasized tag:0.8]
Include quality tags like "masterpiece, best quality, detailed" appropriately.
Return only the optimized prompt, no explanations.`,
    
    flux: `You are an expert at optimizing prompts for Flux image generation.
Convert the input into natural language phrases that Flux understands.
Focus on descriptive, flowing sentences rather than tags.
Maintain artistic and technical details.
Return only the optimized prompt, no explanations.`,
    
    imagefx: `You are an expert at optimizing prompts for ImageFX.
Convert the input into clear, natural language instructions.
Focus on vivid descriptions and specific details.
Return only the optimized prompt, no explanations.`,
    
    custom: systemPromptOverride || `Optimize the following prompt for image generation.
Return only the optimized version.`
  }

  const systemPrompt = systemPromptOverride || systemPrompts[format as keyof typeof systemPrompts] || systemPrompts.custom

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
        'X-Title': 'SS Prompt Manager'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error('Optimization failed')
    }

    const data = await response.json()
    const optimized = data.choices?.[0]?.message?.content || prompt

    // Parse the optimized prompt into blocks
    const blocks = optimized
      .split(/[,，、]\s*/)
      .filter(Boolean)
      .map(block => {
        const weightMatch = block.match(/:([\d.]+)\)?$/)
        const weight = weightMatch ? parseFloat(weightMatch[1]) : 1.0
        const text = block.replace(/[:：][\d.]+\)?$/, '').replace(/^[\(\[]|[\)\]]$/g, '').trim()
        
        return {
          en: text,
          ja: '',
          weight,
          category: 'other'
        }
      })

    return c.json({ optimized, blocks })
  } catch (error) {
    console.error('Optimization error:', error)
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to optimize prompt' 
    }, 500)
  }
})

// ヘルスチェック
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 改善版へのルート
app.get('/improved', async (c) => {
  const improvedHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SS Prompt Manager - 改善版（英日連動対応）</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        [data-category="person"] { background-color: #fef3c7; border-color: #fbbf24; }
        [data-category="appearance"] { background-color: #dbeafe; border-color: #60a5fa; }
        [data-category="clothing"] { background-color: #fce7f3; border-color: #f9a8d4; }
        [data-category="pose"] { background-color: #e9d5ff; border-color: #c084fc; }
        [data-category="background"] { background-color: #d1fae5; border-color: #34d399; }
        [data-category="quality"] { background-color: #fed7aa; border-color: #fb923c; }
        [data-category="style"] { background-color: #fef3c7; border-color: #fde047; }
        [data-category="other"] { background-color: #e5e7eb; border-color: #9ca3af; }
        
        .split-view {
            display: grid;
            grid-template-columns: 1fr min(400px, 30%);
            gap: 1rem;
            height: calc(100vh - 120px);
        }
        
        .block-card {
            transition: all 0.2s ease;
            cursor: move;
        }
        
        .block-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script type="module" src="/static/app.js"></script>
</body>
</html>`
  return c.html(improvedHtml)
})

export default app