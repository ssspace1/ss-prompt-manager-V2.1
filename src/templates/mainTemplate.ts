// Main HTML template for SS Prompt Manager
// This file contains the main application HTML template

export function getMainHtml(): string {
  const timestamp = Date.now()
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SS Prompt Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- Custom Styles -->
    <style>
        /* Category Colors - Very light backgrounds with white text and normal borders */
        [data-category="person"] { 
            background: rgba(251, 146, 60, 0.15); 
            border: 2px solid #fb923c;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        [data-category="appearance"] { 
            background: rgba(59, 130, 246, 0.15); 
            border: 2px solid #3b82f6;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        [data-category="clothing"] { 
            background: rgba(236, 72, 153, 0.15); 
            border: 2px solid #ec4899;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        [data-category="action"] { 
            background: rgba(139, 92, 246, 0.15); 
            border: 2px solid #8b5cf6;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        [data-category="background"] { 
            background: rgba(34, 197, 94, 0.15); 
            border: 2px solid #22c55e;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        [data-category="quality"] { 
            background: rgba(245, 158, 11, 0.15); 
            border: 2px solid #f59e0b;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        [data-category="style"] { 
            background: rgba(168, 85, 247, 0.15); 
            border: 2px solid #a855f7;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        [data-category="composition"] {
            background: rgba(75, 85, 99, 0.25);
            border: 2px solid #4b5563;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.9);
        }
        [data-category="object"] {
            background: rgba(6, 182, 212, 0.15);
            border: 2px solid #06b6d4;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        [data-category="other"] { 
            background: rgba(156, 163, 175, 0.15); 
            border: 2px solid #9ca3af;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        
        /* Block Styles */
        .tag-block {
            transition: all 0.2s ease;
            cursor: move;
            user-select: none;
            position: relative;
            overflow: hidden;
            font-weight: 500;
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
            cursor: grab;
            position: relative;
            min-height: auto;
            display: block;
            margin: 0 !important;
            transition: none; /* Remove transition to prevent unwanted animations */
        }
        
        /* Stack cards directly with border overlap */
        .tag-card:not(:first-child) {
            margin-top: -1px !important;
        }
        
        /* Ensure no space between elements for main tabs */
        #tags-en, #tags-ja {
            line-height: 0;
        }
        
        #tags-en > *, #tags-ja > * {
            line-height: normal;
        }
        
        /* Image tab tags should have proper spacing */
        #image-tags-en, #image-tags-ja {
            line-height: normal;
        }
        
        /* Only slight hover effect, no movement */
        .tag-card:hover {
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        /* Enhanced scrollbar for tag lists */
        #image-tags-en, #image-tags-ja {
            overflow-y: auto !important;
            max-height: 100% !important;
        }
        
        /* Ensure proper spacing for image tab tags */
        #image-tags-en > *, #image-tags-ja > * {
            margin-bottom: 4px;
        }
        
        #image-tags-en > *:last-child, #image-tags-ja > *:last-child {
            margin-bottom: 0;
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
            transform: scale(0.98);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            z-index: 1000;
            cursor: grabbing !important;
            transition: transform 0.15s ease, opacity 0.15s ease;
        }
        
        /* Drop zone styles - Invisible but with large hit area */
        .drop-zone {
            position: relative;
            height: 0;
            margin: 0;
            padding: 0;
            background: transparent;
            border: none;
            opacity: 0;
            pointer-events: none;
            transition: all 0.2s ease;
        }
        
        /* Large invisible drop zones when dragging - overlapping with tags */
        .drop-zone-active {
            height: 30px !important;
            margin: -13px 0 !important; /* Overlap with adjacent tags */
            pointer-events: auto !important;
            position: relative;
            z-index: 999;
            /* Visual indicator - just a thin line */
            background: transparent;
            opacity: 1;
        }
        
        /* Add subtle line indicator in the middle */
        .drop-zone-active::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: rgba(59, 130, 246, 0.2);
            transform: translateY(-50%);
            pointer-events: none;
        }
        
        /* Visual feedback when hovering - keep it minimal */
        .drop-zone-hover {
            /* Keep the large hit area */
            height: 30px !important;
            margin: -13px 0 !important;
            background: transparent !important;
            border: none !important;
            opacity: 1;
        }
        
        /* Stronger visual line when hovering */
        .drop-zone-hover::after {
            height: 3px !important;
            background: linear-gradient(90deg,
                transparent 0%,
                #3b82f6 20%,
                #3b82f6 80%,
                transparent 100%) !important;
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
        }
        
        /* Optional: Small text indicator on strong hover */
        .drop-zone-hover::before {
            content: '• • •';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #3b82f6;
            font-size: 8px;
            font-weight: bold;
            opacity: 0.6;
            letter-spacing: 2px;
            pointer-events: none;
        }
        
        @keyframes dropZonePulse {
            0%, 100% { 
                opacity: 0.8;
                transform: scaleY(1);
            }
            50% { 
                opacity: 1;
                transform: scaleY(1.05);
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
        
        /* Cursor feedback for draggable areas */
        .tag-card {
            cursor: grab;
        }
        
        .tag-card:active {
            cursor: grabbing;
        }
        
        .tag-card.dragging {
            cursor: grabbing !important;
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
        
        /* Tailwind-like animation classes for modals */
        .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideIn {
            animation: slideIn 0.3s ease-out;
        }
        
        /* Ensure prompt editor modal is always on top */
        #prompt-editor-modal {
            z-index: 2000 !important;
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
        
        /* Tag Filtering Styles */
        .tag-card.filtered-hidden {
            display: none !important;
        }
        
        .category-filter-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 6px;
            border: 2px solid;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
        }
        
        .category-filter-btn.active {
            opacity: 1;
            transform: none;
        }
        
        .category-filter-btn.inactive {
            opacity: 0.4;
            filter: grayscale(70%);
        }
        
        .category-filter-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Category-specific filter button colors */
        .category-filter-btn[data-category="person"] { 
            background: rgba(251, 146, 60, 0.2); 
            border-color: #fb923c;
            color: #ea580c;
        }
        .category-filter-btn[data-category="appearance"] { 
            background: rgba(59, 130, 246, 0.2); 
            border-color: #3b82f6;
            color: #1d4ed8;
        }
        .category-filter-btn[data-category="clothing"] { 
            background: rgba(236, 72, 153, 0.2); 
            border-color: #ec4899;
            color: #be185d;
        }
        .category-filter-btn[data-category="action"] { 
            background: rgba(139, 92, 246, 0.2); 
            border-color: #8b5cf6;
            color: #7c3aed;
        }
        .category-filter-btn[data-category="background"] { 
            background: rgba(34, 197, 94, 0.2); 
            border-color: #22c55e;
            color: #15803d;
        }
        .category-filter-btn[data-category="quality"] { 
            background: rgba(245, 158, 11, 0.2); 
            border-color: #f59e0b;
            color: #d97706;
        }
        .category-filter-btn[data-category="style"] { 
            background: rgba(168, 85, 247, 0.2); 
            border-color: #a855f7;
            color: #9333ea;
        }
        .category-filter-btn[data-category="composition"] {
            background: rgba(75, 85, 99, 0.3);
            border-color: #4b5563;
            color: #374151;
        }
        .category-filter-btn[data-category="object"] {
            background: rgba(6, 182, 212, 0.2);
            border-color: #06b6d4;
            color: #0891b2;
        }
        .category-filter-btn[data-category="other"] { 
            background: rgba(156, 163, 175, 0.2); 
            border-color: #9ca3af;
            color: #6b7280;
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
                    
                    <!-- History Button -->
                    <button onclick="HistoryManager.toggleHistoryPanel()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors tooltip" data-tooltip="履歴">
                        <i class="fas fa-history text-xl text-gray-600"></i>
                    </button>
                    
                    <!-- Help Button -->
                    <button onclick="App.showSystemHelp()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors tooltip" data-tooltip="ヘルプ">
                        <i class="fas fa-question-circle text-xl text-gray-600"></i>
                    </button>
                    
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
                    <button class="tab-button py-3 px-6 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            onclick="App.setTab('system-flow')" id="tab-system-flow">
                        <i class="fas fa-project-diagram mr-2"></i>
                        System Flow
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
                    <div id="left-panel" class="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar" style="max-height: calc(100vh - 100px);">
                        
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
                                      class="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"></textarea>
                            
                            <!-- Action Buttons - Redesigned -->
                            <div class="flex items-center gap-3 mt-3 justify-between">
                                <!-- Left side: Split and AI Generate -->
                                <div class="flex items-center gap-3">
                                    <!-- Split Button -->
                                    <button onclick="App.splitText()" 
                                            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors border-2 border-blue-600">
                                        <i class="fas fa-cut mr-2"></i>Split to Tags
                                    </button>
                                    
                                    <!-- AI Generate Button -->
                                    <button onclick="App.generateOptimized()" 
                                            class="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all border-2 border-purple-600 shadow-md">
                                        <i class="fas fa-magic mr-2"></i>AI Generate
                                    </button>
                                </div>
                                
                                <!-- Right side: Controls -->
                                <div class="flex items-center gap-4">
                                    <!-- Format Selection -->
                                    <div class="flex items-center gap-2">
                                        <label class="text-sm text-gray-600 font-medium">Format:</label>
                                        <select id="output-format" onchange="App.updateOutputFormat()" 
                                                class="px-3 py-2 border rounded-lg text-sm min-w-[120px]">
                                            <option value="sdxl">SDXL Tags</option>
                                            <option value="flux">Flux Phrases</option>
                                            <option value="imagefx">ImageFX</option>
                                            <option value="imagefx-natural">ImageFX Natural</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Tool Buttons -->
                                    <div class="flex items-center gap-1">
                                        <button onclick="App.showPromptEditor()" 
                                                class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit System Prompt">
                                            <i class="fas fa-cog"></i>
                                        </button>
                                        <button onclick="App.addCustomFormat()" 
                                                class="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Add Custom Format">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                        <button onclick="App.aiCategorizeAllTags()" 
                                                class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                                                title="AI Categorize All Tags">
                                            <i class="fas fa-brain"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Model Selection -->
                                    <div class="flex items-center gap-2">
                                        <label class="text-sm text-gray-600 font-medium">Model:</label>
                                        <select id="text-model-selector" onchange="App.updateTextModelFromTab()" 
                                                class="px-3 py-2 border rounded-lg text-sm min-w-[200px]">
                                            <option value="">Select a model...</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Tag Editor Section -->
                        <section class="bg-white rounded-lg shadow-sm p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-lg font-semibold text-gray-700">
                                    <i class="fas fa-tags mr-2 text-green-500"></i>
                                    Tag Editor
                                </h2>
                                <div class="flex gap-2">
                                    <button onclick="App.toggleTagFilters('main')" 
                                            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors tooltip" 
                                            data-tooltip="Show/Hide Category Filters"
                                            id="filter-toggle-main">
                                        <i class="fas fa-filter"></i>
                                    </button>
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
                            
                            <!-- Tag Category Filters -->
                            <div id="tag-filters-main" class="mb-4 p-3 bg-gray-50 rounded-lg border hidden">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-medium text-gray-700">Category Filters:</span>
                                    <div class="flex gap-2">
                                        <button onclick="App.selectAllCategories('main')" 
                                                class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors">
                                            Show All
                                        </button>
                                        <button onclick="App.deselectAllCategories('main')" 
                                                class="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors">
                                            Hide All
                                        </button>
                                    </div>
                                </div>
                                <div class="grid grid-cols-4 gap-2" id="category-filters-main">
                                    <!-- Category filter buttons will be dynamically generated here -->
                                </div>
                            </div>
                            
                            <!-- Bilingual Tag Columns -->
                            <div class="grid grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
                                <!-- English Column -->
                                <div class="flex flex-col min-h-0">
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
                                    <div id="tags-en" class="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                                        <!-- Tags will be dynamically inserted here -->
                                    </div>
                                </div>
                                
                                <!-- Japanese Column -->
                                <div class="flex flex-col min-h-0">
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
                                    <div id="tags-ja" class="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                                        <!-- Tags will be dynamically inserted here -->
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Output Section -->
                        <section class="bg-white rounded-lg shadow-sm p-4 flex-shrink-0">
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
                <div id="image-split-container" class="flex flex-col gap-2 h-full">
                    <!-- Top Section: Image Input and AI Output side by side - Compressed -->
                    <div class="flex gap-2 h-[160px] flex-shrink-0">
                        <!-- Left: Image Input - Compact -->
                        <section class="bg-white rounded-lg shadow-sm p-2 flex-1">
                            <div class="flex items-center justify-between mb-2">
                                <h2 class="text-sm font-semibold text-gray-700">
                                    <i class="fas fa-image mr-1 text-purple-500"></i>
                                    Input
                                </h2>
                                <button onclick="App.clearImage()" 
                                        class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                                    <i class="fas fa-trash mr-1"></i>Clear
                                </button>
                            </div>
                            
                            <!-- Compact Image Drop Zone -->
                            <div id="image-drop-zone" 
                                 class="border-2 border-dashed border-gray-300 rounded p-2 text-center hover:border-blue-400 transition-colors cursor-pointer h-[100px] flex items-center justify-center"
                                 ondrop="App.handleImageDrop(event)"
                                 ondragover="App.handleDragOver(event)"
                                 ondragleave="App.handleDragLeave(event)"
                                 onclick="document.getElementById('image-file-input').click()">
                                
                                <div id="image-preview-container" class="hidden w-full h-full">
                                    <img id="image-preview" class="max-w-full max-h-full object-contain rounded" />
                                </div>
                                
                                <div id="image-upload-prompt">
                                    <i class="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-1"></i>
                                    <p class="text-xs text-gray-600">Drop image or click</p>
                                </div>
                            </div>
                            
                            <input type="file" id="image-file-input" accept="image/*" class="hidden" onchange="App.handleImageUpload(event)">
                        </section>
                        
                        <!-- Right: AI Format Output - Compact -->
                        <section class="bg-white rounded-lg shadow-sm p-2 flex-1">
                            <div class="flex items-center justify-between mb-2">
                                <h2 class="text-sm font-semibold text-gray-700">
                                    <i class="fas fa-sparkles mr-1 text-cyan-500"></i>
                                    AI Format Prompt
                                </h2>
                                <button onclick="App.copyImagePrompt()" 
                                        class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                                    <i class="fas fa-copy mr-1"></i>Copy
                                </button>
                            </div>
                            
                            <!-- AI Generated Prompt Display -->
                            <textarea id="image-generated-prompt" 
                                      placeholder="AI formatted prompt will appear here..."
                                      class="w-full h-[80px] p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
                                      onchange="App.updateImagePromptOutput()"></textarea>
                            
                            <!-- Split to Tags Button -->
                            <div class="mt-2">
                                <button onclick="App.splitImagePrompt()" 
                                        class="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors border border-blue-600">
                                    <i class="fas fa-cut mr-1"></i>Split
                                </button>
                            </div>
                        </section>
                    </div>
                    
                    <!-- Middle Section: Controls and Actions - Compact -->
                    <div class="bg-white rounded-lg shadow-sm p-2 flex-shrink-0">
                        <div class="flex items-center gap-2 flex-wrap text-sm">
                            <!-- AI Analysis Toggle -->
                            <button onclick="App.toggleAnalysisResult()" 
                                    class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                                    id="toggle-analysis-btn">
                                <i class="fas fa-eye text-xs"></i>
                                <span id="toggle-analysis-text" class="text-xs">Analysis</span>
                                <i class="fas fa-chevron-down text-xs" id="toggle-analysis-icon"></i>
                            </button>
                            
                            <!-- Format Selection -->
                            <div class="flex items-center gap-1">
                                <label class="text-xs text-gray-600">Format:</label>
                                <select id="image-output-format" onchange="App.updateImageOutputFormat()" 
                                        class="px-2 py-1 border rounded text-xs min-w-[100px]">
                                    <option value="sdxl">SDXL Tags</option>
                                    <option value="flux">Flux Phrases</option>
                                    <option value="imagefx">ImageFX Commands</option>
                                    <option value="natural">Natural Language</option>
                                </select>
                            </div>
                            
                            <!-- Tool Buttons -->
                            <div class="flex items-center gap-1">
                                <button onclick="App.showImagePromptEditor()" 
                                        class="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                        title="Edit System Prompt">
                                    <i class="fas fa-cog text-xs"></i>
                                </button>
                                <button onclick="App.addImageCustomFormat()" 
                                        class="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                                        title="Add Custom Format">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                            
                            <!-- Analysis Engine Selection (New Simplified System) -->
                            <div class="bg-gray-50 rounded-lg p-3 border">
                                <div class="flex items-center mb-2">
                                    <h4 class="text-xs font-medium text-gray-700">
                                        <i class="fas fa-microscope mr-1 text-blue-500"></i>
                                        Analysis Engines (Select Multiple):
                                    </h4>
                                </div>
                                
                                <div class="grid grid-cols-1 gap-2 text-xs">
                                    <!-- Janus Pro 7B -->
                                    <div class="flex items-center gap-2">
                                        <input type="checkbox" id="engine-janus" 
                                               onchange="App.updateImageAnalysisEngines()"
                                               class="w-4 h-4 text-purple-600 rounded">
                                        <label for="engine-janus" class="flex-1">
                                            <i class="fas fa-eye text-purple-500 mr-1"></i>
                                            <span class="font-medium">Janus Pro 7B</span>
                                            <span class="text-gray-500">(Vision Specialist)</span>
                                        </label>
                                        <span id="janus-status" class="text-xs px-2 py-1 bg-gray-200 rounded">
                                            Replicate Key Required
                                        </span>
                                    </div>
                                    
                                    <!-- WD-EVA02 -->
                                    <div class="flex items-center gap-2">
                                        <input type="checkbox" id="engine-wd-eva02" 
                                               onchange="App.updateImageAnalysisEngines()"
                                               class="w-4 h-4 text-green-600 rounded">
                                        <label for="engine-wd-eva02" class="flex-1">
                                            <i class="fas fa-tags text-green-500 mr-1"></i>
                                            <span class="font-medium">WD-EVA02</span>
                                            <span class="text-gray-500">(Anime Tagger)</span>
                                        </label>
                                        <span id="wd-eva02-status" class="text-xs px-2 py-1 bg-gray-200 rounded">
                                            Replicate Key Required
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="mt-3 pt-2 border-t bg-blue-50 rounded p-2">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs font-medium text-blue-700">
                                            <i class="fas fa-robot mr-1"></i>AI Tagging Engine:
                                        </span>
                                        <span id="selected-openrouter-model" class="text-xs text-blue-600">
                                            Not configured
                                        </span>
                                    </div>
                                    <div class="text-xs text-blue-600">
                                        <i class="fas fa-cog mr-1"></i>
                                        Configure OpenRouter AI model in <button onclick="App.showSettings()" class="underline hover:text-blue-800">Settings</button>
                                    </div>
                                </div>
                                
                                <div class="mt-2 pt-2 border-t text-xs text-gray-600">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    <span id="selected-engines-summary">Select engines above, then click AI Analysis</span>
                                </div>
                            </div>
                            
                            <!-- AI Generate Button -->
                            <button onclick="App.generateFromImage()" 
                                    class="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-purple-600 shadow-sm"
                                    id="image-ai-generate-btn" disabled>
                                <i class="fas fa-magic mr-1 text-xs"></i><span class="text-xs">AI Analysis & Tag Generation</span>
                            </button>
                        </div>
                        
                        <!-- Multi-Engine Analysis Results -->
                        <div id="multi-analysis-container" class="mt-2 hidden">
                            <div class="border-t pt-2">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="text-xs font-semibold text-gray-700">
                                        <i class="fas fa-chart-bar mr-1 text-indigo-500"></i>
                                        Multi-Engine Analysis Results
                                    </h3>
                                    <div class="flex gap-1">
                                        <button onclick="App.tagFromSelectedEngines()" 
                                                class="px-1 py-0.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">
                                            <i class="fas fa-tags mr-1"></i>Generate Tags
                                        </button>
                                        <button onclick="App.copyAllAnalysisResults()" 
                                                class="px-1 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                                            <i class="fas fa-copy mr-1"></i>Copy All
                                        </button>
                                        <button onclick="App.toggleAllAnalysisResults()" 
                                                id="toggle-all-results-btn"
                                                class="px-1 py-0.5 text-xs bg-indigo-100 hover:bg-indigo-200 rounded transition-colors">
                                            <i class="fas fa-expand mr-1"></i>Expand
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Individual Engine Results -->
                                <div class="space-y-2">
                                    <!-- LLM Analysis Result -->
                                    <div id="llm-result-section" class="hidden">
                                        <div class="bg-blue-50 rounded-lg border border-blue-200">
                                            <div class="flex items-center justify-between p-2 cursor-pointer" 
                                                 onclick="App.toggleResultSection('llm')">
                                                <div class="flex items-center gap-2">
                                                    <i class="fas fa-robot text-blue-500"></i>
                                                    <span class="text-xs font-medium text-blue-800">LLM Analysis</span>
                                                    <span id="llm-status-badge" class="text-xs px-1 py-0.5 bg-gray-200 rounded">●</span>
                                                </div>
                                                <div class="flex items-center gap-1">
                                                    <button onclick="App.tagFromEngineResult('llm')" 
                                                            class="px-1 py-0.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                                            title="Tag this result only">
                                                        <i class="fas fa-tags"></i>
                                                    </button>
                                                    <button onclick="App.copyAnalysisResult('llm')" 
                                                            class="px-1 py-0.5 text-xs bg-blue-200 hover:bg-blue-300 rounded transition-colors">
                                                        <i class="fas fa-copy"></i>
                                                    </button>
                                                    <i class="fas fa-chevron-down text-blue-600 transition-transform" id="llm-chevron"></i>
                                                </div>
                                            </div>
                                            <div id="llm-result-content" class="hidden p-2 pt-0">
                                                <div id="llm-analysis-result" class="p-2 bg-white rounded text-xs max-h-24 overflow-y-auto custom-scrollbar">
                                                    <p class="text-gray-500 italic">No LLM analysis yet...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- WD-EVA02 Tagger Result -->
                                    <div id="wd-eva02-result-section" class="hidden">
                                        <div class="bg-green-50 rounded-lg border border-green-200">
                                            <div class="flex items-center justify-between p-2 cursor-pointer" 
                                                 onclick="App.toggleResultSection('wd-eva02')">
                                                <div class="flex items-center gap-2">
                                                    <i class="fas fa-tags text-green-500"></i>
                                                    <span class="text-xs font-medium text-green-800">WD-EVA02 Tagger</span>
                                                    <span id="wd-eva02-status-badge" class="text-xs px-1 py-0.5 bg-gray-200 rounded">●</span>
                                                </div>
                                                <div class="flex items-center gap-1">
                                                    <button onclick="App.tagFromEngineResult('wd-eva02')" 
                                                            class="px-1 py-0.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                                            title="Tag this result only">
                                                        <i class="fas fa-tags"></i>
                                                    </button>
                                                    <button onclick="App.copyAnalysisResult('wd-eva02')" 
                                                            class="px-1 py-0.5 text-xs bg-green-200 hover:bg-green-300 rounded transition-colors">
                                                        <i class="fas fa-copy"></i>
                                                    </button>
                                                    <i class="fas fa-chevron-down text-green-600 transition-transform" id="wd-eva02-chevron"></i>
                                                </div>
                                            </div>
                                            <div id="wd-eva02-result-content" class="hidden p-2 pt-0">
                                                <div id="wd-eva02-analysis-result" class="p-2 bg-white rounded text-xs max-h-24 overflow-y-auto custom-scrollbar">
                                                    <p class="text-gray-500 italic">No WD-EVA02 analysis yet...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Janus Pro 7B Result -->
                                    <div id="janus-result-section" class="hidden">
                                        <div class="bg-purple-50 rounded-lg border border-purple-200">
                                            <div class="flex items-center justify-between p-2 cursor-pointer" 
                                                 onclick="App.toggleResultSection('janus')">
                                                <div class="flex items-center gap-2">
                                                    <i class="fas fa-eye text-purple-500"></i>
                                                    <span class="text-xs font-medium text-purple-800">Janus Pro 7B</span>
                                                    <span id="janus-status-badge" class="text-xs px-1 py-0.5 bg-gray-200 rounded">●</span>
                                                </div>
                                                <div class="flex items-center gap-1">
                                                    <button onclick="App.tagFromEngineResult('janus')" 
                                                            class="px-1 py-0.5 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
                                                            title="Tag this result only">
                                                        <i class="fas fa-tags"></i>
                                                    </button>
                                                    <button onclick="App.copyAnalysisResult('janus')" 
                                                            class="px-1 py-0.5 text-xs bg-purple-200 hover:bg-purple-300 rounded transition-colors">
                                                        <i class="fas fa-copy"></i>
                                                    </button>
                                                    <i class="fas fa-chevron-down text-purple-600 transition-transform" id="janus-chevron"></i>
                                                </div>
                                            </div>
                                            <div id="janus-result-content" class="hidden p-2 pt-0">
                                                <div id="janus-analysis-result" class="p-2 bg-white rounded text-xs max-h-24 overflow-y-auto custom-scrollbar">
                                                    <p class="text-gray-500 italic">No Janus analysis yet...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Additional WD Models (compact view) -->
                                    <div id="additional-wd-results" class="hidden space-y-1">
                                        <div id="wd-swinv2-result-section" class="hidden">
                                            <div class="bg-gray-50 rounded border">
                                                <div class="flex items-center justify-between p-2 cursor-pointer" 
                                                     onclick="App.toggleResultSection('wd-swinv2')">
                                                    <div class="flex items-center gap-2">
                                                        <i class="fas fa-tags text-gray-500 text-xs"></i>
                                                        <span class="text-xs text-gray-700">WD SwinV2</span>
                                                        <span id="wd-swinv2-status-badge" class="text-xs px-1 bg-gray-200 rounded">●</span>
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <button onclick="App.tagFromEngineResult('wd-swinv2')" 
                                                                class="px-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded"
                                                                title="Tag this result only">
                                                            <i class="fas fa-tags text-xs"></i>
                                                        </button>
                                                        <button onclick="App.copyAnalysisResult('wd-swinv2')" 
                                                                class="px-1 text-xs bg-gray-200 hover:bg-gray-300 rounded">
                                                            <i class="fas fa-copy text-xs"></i>
                                                        </button>
                                                        <i class="fas fa-chevron-down text-gray-500 text-xs" id="wd-swinv2-chevron"></i>
                                                    </div>
                                                </div>
                                                <div id="wd-swinv2-result-content" class="hidden p-2 pt-0">
                                                    <div id="wd-swinv2-analysis-result" class="p-1 bg-white rounded text-xs max-h-16 overflow-y-auto">
                                                        <p class="text-gray-500 italic">No WD SwinV2 analysis yet...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div id="wd-vit-result-section" class="hidden">
                                            <div class="bg-gray-50 rounded border">
                                                <div class="flex items-center justify-between p-2 cursor-pointer" 
                                                     onclick="App.toggleResultSection('wd-vit')">
                                                    <div class="flex items-center gap-2">
                                                        <i class="fas fa-tags text-gray-500 text-xs"></i>
                                                        <span class="text-xs text-gray-700">WD ViT</span>
                                                        <span id="wd-vit-status-badge" class="text-xs px-1 bg-gray-200 rounded">●</span>
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <button onclick="App.tagFromEngineResult('wd-vit')" 
                                                                class="px-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded"
                                                                title="Tag this result only">
                                                            <i class="fas fa-tags text-xs"></i>
                                                        </button>
                                                        <button onclick="App.copyAnalysisResult('wd-vit')" 
                                                                class="px-1 text-xs bg-gray-200 hover:bg-gray-300 rounded">
                                                            <i class="fas fa-copy text-xs"></i>
                                                        </button>
                                                        <i class="fas fa-chevron-down text-gray-500 text-xs" id="wd-vit-chevron"></i>
                                                    </div>
                                                </div>
                                                <div id="wd-vit-result-content" class="hidden p-2 pt-0">
                                                    <div id="wd-vit-analysis-result" class="p-1 bg-white rounded text-xs max-h-16 overflow-y-auto">
                                                        <p class="text-gray-500 italic">No WD ViT analysis yet...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        


                    </div>
                    
                    <!-- Bottom Section: Tag Editor and Final Output - Enhanced -->
                    <div class="flex gap-2 flex-1 min-h-0">
                        <!-- Tag Editor Section - Expanded with better scrolling -->
                        <section class="bg-white rounded-lg shadow-sm p-3 flex-1 flex flex-col min-h-0">
                            <div class="flex items-center justify-between mb-2 flex-shrink-0">
                                <h2 class="text-base font-semibold text-gray-700">
                                    <i class="fas fa-tags mr-1 text-green-500"></i>
                                    Tag Editor
                                </h2>
                                <div class="flex gap-1">
                                    <button onclick="App.toggleTagFilters('image')" 
                                            class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors tooltip" 
                                            data-tooltip="Show/Hide Category Filters"
                                            id="filter-toggle-image">
                                        <i class="fas fa-filter"></i>
                                    </button>
                                    <button onclick="App.sortImageTags('category')" 
                                            class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors tooltip" 
                                            data-tooltip="Sort by Category">
                                        <i class="fas fa-sort-alpha-down"></i>
                                    </button>
                                    <button onclick="App.sortImageTags('weight')" 
                                            class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors tooltip" 
                                            data-tooltip="Sort by Weight">
                                        <i class="fas fa-sort-numeric-down"></i>
                                    </button>
                                    <button onclick="App.aiCategorizeImageTags()" 
                                            class="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors tooltip" 
                                            data-tooltip="AI Categorize Tags">
                                        <i class="fas fa-brain text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Tag Category Filters for Image Tab -->
                            <div id="tag-filters-image" class="mb-3 p-2 bg-gray-50 rounded-lg border hidden flex-shrink-0">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-xs font-medium text-gray-700">Category Filters:</span>
                                    <div class="flex gap-1">
                                        <button onclick="App.selectAllCategories('image')" 
                                                class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors">
                                            Show All
                                        </button>
                                        <button onclick="App.deselectAllCategories('image')" 
                                                class="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors">
                                            Hide All
                                        </button>
                                    </div>
                                </div>
                                <div class="grid grid-cols-5 gap-1" id="category-filters-image">
                                    <!-- Category filter buttons will be dynamically generated here -->
                                </div>
                            </div>
                            
                            <!-- Bilingual Tag Columns for Image Tab -->
                            <div class="grid grid-cols-2 gap-3 flex-1 min-h-0">
                                <!-- English Column -->
                                <div class="flex flex-col min-h-0">
                                    <div class="flex items-center justify-between mb-2 pb-1 border-b flex-shrink-0">
                                        <h3 class="text-sm font-medium text-gray-700">
                                            <i class="fas fa-globe mr-1 text-blue-500"></i>English
                                        </h3>
                                        <button onclick="App.translateImageTags('en-to-ja')" 
                                                class="text-xs px-2 py-0.5 bg-blue-100 hover:bg-blue-200 rounded transition-colors">
                                            Translate All →
                                        </button>
                                    </div>
                                    
                                    <!-- Add New Tag -->
                                    <div class="flex gap-1 mb-2 flex-shrink-0">
                                        <input type="text" id="new-image-tag-en" 
                                               placeholder="Add new tag..." 
                                               class="flex-1 px-2 py-1 text-xs border rounded"
                                               onkeydown="if(event.key==='Enter') App.addNewImageTag('en')">
                                        <button onclick="App.addNewImageTag('en')" 
                                                class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            <i class="fas fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Tag List with proper scrolling -->
                                    <div id="image-tags-en" class="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0" style="max-height: 100%;">
                                        <!-- Tags will be dynamically inserted here -->
                                    </div>
                                </div>
                                
                                <!-- Japanese Column -->
                                <div class="flex flex-col min-h-0">
                                    <div class="flex items-center justify-between mb-2 pb-1 border-b flex-shrink-0">
                                        <h3 class="text-sm font-medium text-gray-700">
                                            <i class="fas fa-torii-gate mr-1 text-red-500"></i>日本語
                                        </h3>
                                        <button onclick="App.translateImageTags('ja-to-en')" 
                                                class="text-xs px-2 py-0.5 bg-red-100 hover:bg-red-200 rounded transition-colors">
                                            ← Translate All
                                        </button>
                                    </div>
                                    
                                    <!-- Add New Tag -->
                                    <div class="flex gap-1 mb-2 flex-shrink-0">
                                        <input type="text" id="new-image-tag-ja" 
                                               placeholder="新しいタグを追加..." 
                                               class="flex-1 px-2 py-1 text-xs border rounded"
                                               onkeydown="if(event.key==='Enter') App.addNewImageTag('ja')">
                                        <button onclick="App.addNewImageTag('ja')" 
                                                class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            <i class="fas fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Tag List with proper scrolling -->
                                    <div id="image-tags-ja" class="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0" style="max-height: 100%;">
                                        <!-- Tags will be dynamically inserted here -->
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <!-- Final Output Section - Compact -->
                        <section class="bg-white rounded-lg shadow-sm p-3 w-80 flex flex-col">
                            <div class="flex items-center justify-between mb-2">
                                <h2 class="text-base font-semibold text-gray-700">
                                    <i class="fas fa-file-export mr-1 text-orange-500"></i>
                                    Final Output
                                </h2>
                                <div class="flex items-center gap-1">
                                    <label class="text-xs text-gray-600">Format:</label>
                                    <select id="image-final-output-format" onchange="App.updateImageFinalFormat()" 
                                            class="px-2 py-1 border rounded text-xs">
                                        <option value="sdxl">SDXL Tags</option>
                                        <option value="flux">Flux Phrases</option>
                                        <option value="imagefx">ImageFX</option>
                                        <option value="imagefx-natural">ImageFX Natural</option>
                                    </select>
                                </div>
                            </div>
                            
                            <textarea id="image-final-output" 
                                      placeholder="Final formatted output will appear here..."
                                      class="w-full h-24 p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs"
                                      readonly></textarea>
                            
                            <div class="flex gap-1 mt-2">
                                <button onclick="App.copyImageFinalOutput()" 
                                        class="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                                    <i class="fas fa-copy mr-1"></i>Copy
                                </button>
                                <button onclick="App.downloadImageOutput()" 
                                        class="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                                    <i class="fas fa-download mr-1"></i>Download
                                </button>
                                <button onclick="App.sendImageToMainEditor()" 
                                        class="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                    <i class="fas fa-arrow-right mr-1"></i>Send
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

            <!-- System Flow Tab Content -->
            <div id="content-system-flow" class="h-full p-4 hidden">
                <div class="bg-white rounded-lg shadow-sm p-6 h-full overflow-y-auto">
                    <div class="max-w-7xl mx-auto">
                        <div class="text-center mb-8">
                            <h2 class="text-3xl font-bold text-gray-800 mb-2">
                                <i class="fas fa-project-diagram mr-3 text-blue-500"></i>
                                System Flow Diagram
                            </h2>
                            <p class="text-gray-600">Visual guide to understand and edit all AI instruction routes</p>
                        </div>

                        <!-- Text to Prompt Flow -->
                        <div class="mb-12">
                            <h3 class="text-2xl font-semibold text-blue-700 mb-6 flex items-center">
                                <i class="fas fa-file-text mr-3"></i>
                                Text to Prompt Flow
                            </h3>
                            
                            <div class="relative">
                                <!-- Flow Container -->
                                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                                    
                                    <!-- Step 1: Input -->
                                    <div class="flex items-center mb-8">
                                        <div class="flex-shrink-0">
                                            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>
                                        </div>
                                        <div class="ml-6 flex-1">
                                            <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
                                                <h4 class="font-semibold text-gray-800 mb-2">User Input</h4>
                                                <p class="text-sm text-gray-600 mb-3">テキスト入力 → AI Format選択</p>
                                                <div class="text-xs text-blue-600">📍 Location: Text to Prompt Tab</div>
                                            </div>
                                        </div>
                                        <div class="ml-4 text-3xl text-gray-300">
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                    </div>

                                    <!-- Step 2: Format Selection & AI Generation -->
                                    <div class="flex items-center mb-8">
                                        <div class="flex-shrink-0">
                                            <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>
                                        </div>
                                        <div class="ml-6 flex-1">
                                            <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
                                                <h4 class="font-semibold text-gray-800 mb-2">AI Generation</h4>
                                                <p class="text-sm text-gray-600 mb-3">Selected format system prompt processes input</p>
                                                <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                                                    <button onclick="App.showPromptEditor('sdxl')" 
                                                            class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border-2 border-transparent hover:border-blue-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>SDXL
                                                    </button>
                                                    <button onclick="App.showPromptEditor('flux')" 
                                                            class="text-xs px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded border-2 border-transparent hover:border-purple-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>Flux
                                                    </button>
                                                    <button onclick="App.showPromptEditor('imagefx')" 
                                                            class="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded border-2 border-transparent hover:border-green-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>ImageFX
                                                    </button>
                                                    <button onclick="App.showPromptEditor('imagefx-natural')" 
                                                            class="text-xs px-2 py-1 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded border-2 border-transparent hover:border-teal-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>Natural
                                                    </button>
                                                </div>
                                                <div class="text-xs text-purple-600">🎯 Edit: Click format buttons above</div>
                                            </div>
                                        </div>
                                        <div class="ml-4 text-3xl text-gray-300">
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                    </div>

                                    <!-- Step 3: Tag Processing -->
                                    <div class="flex items-center mb-8">
                                        <div class="flex-shrink-0">
                                            <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>
                                        </div>
                                        <div class="ml-6 flex-1">
                                            <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
                                                <h4 class="font-semibold text-gray-800 mb-2">Tag Processing</h4>
                                                <p class="text-sm text-gray-600 mb-3">Normalize → Categorize → Translate</p>
                                                <div class="flex flex-wrap gap-2 mb-3">
                                                    <button onclick="App.showPromptEditor('tag-normalizer')" 
                                                            class="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded border-2 border-transparent hover:border-green-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>Normalizer
                                                    </button>
                                                    <button onclick="App.showPromptEditor('categorizer')" 
                                                            class="text-xs px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded border-2 border-transparent hover:border-orange-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>Categorizer
                                                    </button>
                                                    <button onclick="App.showPromptEditor('translation-en-ja')" 
                                                            class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border-2 border-transparent hover:border-blue-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>EN→JA
                                                    </button>
                                                    <button onclick="App.showPromptEditor('translation-ja-en')" 
                                                            class="text-xs px-2 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded border-2 border-transparent hover:border-cyan-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>JA→EN
                                                    </button>
                                                </div>
                                                <div class="text-xs text-green-600">⚙️ Edit: Settings → AI Instructions</div>
                                            </div>
                                        </div>
                                        <div class="ml-4 text-3xl text-gray-300">
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                    </div>

                                    <!-- Step 4: Final Output -->
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">4</div>
                                        </div>
                                        <div class="ml-6 flex-1">
                                            <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
                                                <h4 class="font-semibold text-gray-800 mb-2">Final Output</h4>
                                                <p class="text-sm text-gray-600 mb-3">Tag Editor → Copy to Clipboard</p>
                                                <div class="flex flex-wrap gap-1 text-xs mb-3">
                                                    <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded">person</span>
                                                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">appearance</span>
                                                    <span class="bg-pink-100 text-pink-800 px-2 py-1 rounded">clothing</span>
                                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded">background</span>
                                                    <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">quality</span>
                                                </div>
                                                <div class="text-xs text-yellow-600">📋 Result: Color-coded tags ready for use</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Image to Prompt Flow -->
                        <div class="mb-12">
                            <h3 class="text-2xl font-semibold text-purple-700 mb-6 flex items-center">
                                <i class="fas fa-image mr-3"></i>
                                Image to Prompt Flow
                            </h3>
                            
                            <div class="relative">
                                <!-- Flow Container -->
                                <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                                    
                                    <!-- Step 1: Image Upload -->
                                    <div class="flex items-center mb-8">
                                        <div class="flex-shrink-0">
                                            <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>
                                        </div>
                                        <div class="ml-6 flex-1">
                                            <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
                                                <h4 class="font-semibold text-gray-800 mb-2">Image Upload</h4>
                                                <p class="text-sm text-gray-600 mb-3">Upload or drag & drop image</p>
                                                <div class="text-xs text-purple-600">📍 Location: Image to Prompt Tab</div>
                                            </div>
                                        </div>
                                        <div class="ml-4 text-3xl text-gray-300">
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                    </div>

                                    <!-- Step 2: Vision AI Analysis -->
                                    <div class="flex items-center mb-8">
                                        <div class="flex-shrink-0">
                                            <div class="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>
                                        </div>
                                        <div class="ml-6 flex-1">
                                            <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-pink-500">
                                                <h4 class="font-semibold text-gray-800 mb-2">Vision AI Analysis</h4>
                                                <p class="text-sm text-gray-600 mb-3">GPT-4o, Gemini, or Claude analyzes image</p>
                                                <div class="flex gap-2 mb-3">
                                                    <button onclick="App.showPromptEditor('image-analysis')" 
                                                            class="text-xs px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded border-2 border-transparent hover:border-pink-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>Edit Analysis Prompt
                                                    </button>
                                                </div>
                                                <div class="text-xs text-pink-600">👁️ Edit: Settings → AI Instructions → Image Analysis</div>
                                            </div>
                                        </div>
                                        <div class="ml-4 text-3xl text-gray-300">
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                    </div>

                                    <!-- Step 3: Structured Tag Generation -->
                                    <div class="flex items-center mb-8">
                                        <div class="flex-shrink-0">
                                            <div class="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>
                                        </div>
                                        <div class="ml-6 flex-1">
                                            <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-indigo-500">
                                                <h4 class="font-semibold text-gray-800 mb-2">Structured Tag Generation</h4>
                                                <p class="text-sm text-gray-600 mb-3">Analysis → JSON Tags with categories</p>
                                                <div class="flex gap-2 mb-3">
                                                    <button onclick="App.showPromptEditor('structured-tags')" 
                                                            class="text-xs px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded border-2 border-transparent hover:border-indigo-300 transition-all">
                                                        <i class="fas fa-edit mr-1"></i>JSON Structure
                                                    </button>
                                                </div>
                                                <div class="text-xs text-indigo-600">🔧 AI directly assigns categories during generation</div>
                                            </div>
                                        </div>
                                        <div class="ml-4 text-3xl text-gray-300">
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                    </div>

                                    <!-- Step 4: Final Tags -->
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">4</div>
                                        </div>
                                        <div class="ml-6 flex-1">
                                            <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-teal-500">
                                                <h4 class="font-semibold text-gray-800 mb-2">Ready Tags</h4>
                                                <p class="text-sm text-gray-600 mb-3">Pre-categorized bilingual tags</p>
                                                <div class="text-xs text-teal-600">🎨 Tags already have colors from AI categorization</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- System Architecture Overview -->
                        <div class="mb-8">
                            <h3 class="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
                                <i class="fas fa-cogs mr-3"></i>
                                System Architecture
                            </h3>
                            
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <!-- Core Systems -->
                                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
                                    <h4 class="font-semibold text-blue-800 mb-4 flex items-center">
                                        <i class="fas fa-microchip mr-2"></i>
                                        Core AI Systems
                                    </h4>
                                    <div class="space-y-2">
                                        <button onclick="App.showPromptEditor('categorizer')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-blue-300 transition-all text-sm">
                                            <i class="fas fa-palette mr-2 text-orange-500"></i>Tag Categorizer
                                        </button>
                                        <button onclick="App.showPromptEditor('image-analysis')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-blue-300 transition-all text-sm">
                                            <i class="fas fa-eye mr-2 text-purple-500"></i>Image Analysis
                                        </button>
                                        <button onclick="App.showPromptEditor('tag-normalizer')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-blue-300 transition-all text-sm">
                                            <i class="fas fa-tools mr-2 text-green-500"></i>Tag Normalizer
                                        </button>
                                        <button onclick="App.showPromptEditor('structured-tags')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-blue-300 transition-all text-sm">
                                            <i class="fas fa-code mr-2 text-indigo-500"></i>Structured Tags
                                        </button>
                                    </div>
                                </div>

                                <!-- Generation Formats -->
                                <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border-2 border-green-200">
                                    <h4 class="font-semibold text-green-800 mb-4 flex items-center">
                                        <i class="fas fa-magic mr-2"></i>
                                        Generation Formats
                                    </h4>
                                    <div class="space-y-2">
                                        <button onclick="App.showPromptEditor('sdxl')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-green-300 transition-all text-sm">
                                            <i class="fas fa-tag mr-2 text-blue-500"></i>SDXL Tags
                                        </button>
                                        <button onclick="App.showPromptEditor('flux')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-green-300 transition-all text-sm">
                                            <i class="fas fa-stream mr-2 text-purple-500"></i>Flux Phrases
                                        </button>
                                        <button onclick="App.showPromptEditor('imagefx')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-green-300 transition-all text-sm">
                                            <i class="fas fa-image mr-2 text-green-500"></i>ImageFX
                                        </button>
                                        <button onclick="App.showPromptEditor('imagefx-natural')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-green-300 transition-all text-sm">
                                            <i class="fas fa-leaf mr-2 text-teal-500"></i>ImageFX Natural
                                        </button>
                                    </div>
                                </div>

                                <!-- Translation & Utilities -->
                                <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200">
                                    <h4 class="font-semibold text-yellow-800 mb-4 flex items-center">
                                        <i class="fas fa-language mr-2"></i>
                                        Translation & Utilities
                                    </h4>
                                    <div class="space-y-2">
                                        <button onclick="App.showPromptEditor('translation-en-ja')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-yellow-300 transition-all text-sm">
                                            <i class="fas fa-arrow-right mr-2 text-blue-500"></i>EN → JA
                                        </button>
                                        <button onclick="App.showPromptEditor('translation-ja-en')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-yellow-300 transition-all text-sm">
                                            <i class="fas fa-arrow-left mr-2 text-cyan-500"></i>JA → EN
                                        </button>
                                        <button onclick="App.showPromptEditor('translation-custom')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-yellow-300 transition-all text-sm">
                                            <i class="fas fa-wrench mr-2 text-teal-500"></i>Custom Translation
                                        </button>
                                        <button onclick="App.showPromptEditor('backend-translation')" 
                                                class="w-full text-left p-2 bg-white rounded border hover:border-yellow-300 transition-all text-sm">
                                            <i class="fas fa-server mr-2 text-gray-500"></i>Backend Translation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Edit Panel -->
                        <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
                            <h3 class="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                                <i class="fas fa-bolt mr-3 text-yellow-500"></i>
                                Quick Edit Access
                            </h3>
                            <p class="text-gray-600 mb-4">Click any system component above or use these quick links:</p>
                            
                            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                <button onclick="App.showSettings(); App.setSettingsTab('formats')" 
                                        class="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                                    <i class="fas fa-cog mr-2"></i>Settings
                                </button>
                                <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('categorizer')" 
                                        class="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm">
                                    <i class="fas fa-question-circle mr-2"></i>Help
                                </button>
                                <button onclick="App.showSystemHelp()" 
                                        class="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm">
                                    <i class="fas fa-info-circle mr-2"></i>Guide
                                </button>
                                <button onclick="window.location.href='/static/test-all-prompts.html'" 
                                        class="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm">
                                    <i class="fas fa-flask mr-2"></i>Test
                                </button>
                                <button onclick="App.setTab('text')" 
                                        class="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm">
                                    <i class="fas fa-file-text mr-2"></i>Text
                                </button>
                                <button onclick="App.setTab('image')" 
                                        class="px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors text-sm">
                                    <i class="fas fa-image mr-2"></i>Image
                                </button>
                            </div>
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
                        <button class="py-2 px-4 border-b-2 border-transparent text-gray-600" 
                                data-settings-tab="ai-instructions"
                                onclick="App.setSettingsTab('ai-instructions')">AI Instructions</button>
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
                    
                    <!-- Replicate API Key for Specialized Taggers -->
                    <div class="pt-4 border-t">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            <i class="fas fa-tags mr-1 text-green-500"></i>
                            Replicate API Key (for Anime Tagger)
                        </label>
                        <div class="flex gap-2">
                            <input type="password" id="replicate-api-key" 
                                   placeholder="r8_..." 
                                   class="flex-1 px-3 py-2 border rounded-lg"
                                   onchange="App.updateReplicateKey(this.value)">
                            <button onclick="App.testReplicateKey()" 
                                    class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                                <i class="fas fa-check-circle mr-1"></i>Test
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">
                            Get your API key from <a href="https://replicate.com/account/api-tokens" target="_blank" class="text-blue-500 hover:underline">Replicate</a>. 
                            Required for wd-eva02-large-tagger-v3 specialized anime tagging.
                        </p>
                        
                        
                        <!-- Image Analysis Note -->
                        <div class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p class="text-sm text-blue-800">
                                <i class="fas fa-info-circle mr-1"></i>
                                <strong>Image Analysis Engines:</strong> Configure analysis engines directly in the Image to Prompt tab.
                            </p>
                            <p class="text-xs text-blue-600 mt-1">
                                Select Janus Pro 7B and WD-EVA02 engines in the main interface for image analysis.
                            </p>
                        </div>
                        
                        <!-- Hybrid Analysis Settings -->
                        <div class="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <h4 class="text-sm font-medium text-green-800 mb-2">
                                <i class="fas fa-sliders-h mr-1"></i>
                                Hybrid Analysis Settings
                            </h4>
                            
                            <div class="space-y-3">
                                <!-- Fusion Mode -->
                                <div>
                                    <label class="block text-xs font-medium text-green-700 mb-1">Fusion Mode</label>
                                    <select id="fusion-mode-selector" 
                                            onchange="App.updateFusionMode(this.value)"
                                            class="w-full px-2 py-1 border rounded text-xs">
                                        <option value="balanced">Balanced Hybrid (Equal Weight)</option>
                                        <option value="tagger_focused">Tagger-Focused (70% Tagger)</option>
                                        <option value="llm_focused">LLM-Focused (70% LLM)</option>
                                        <option value="maximum_coverage">Maximum Coverage (More Tags)</option>
                                    </select>
                                </div>
                                
                                <!-- Tagger Confidence Threshold -->
                                <div>
                                    <label class="block text-xs font-medium text-green-700 mb-1">
                                        Tagger Confidence Threshold: <span id="tagger-threshold-value">0.35</span>
                                    </label>
                                    <input type="range" id="tagger-threshold" 
                                           min="0.1" max="0.9" step="0.05" value="0.35"
                                           onchange="App.updateTaggerThreshold(this.value)"
                                           class="w-full">
                                </div>
                                
                                <!-- Source Attribution -->
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" id="enable-source-attribution" 
                                           onchange="App.updateSourceAttribution(this.checked)"
                                           checked class="rounded">
                                    <label class="text-xs font-medium text-green-700">
                                        Show Tag Sources (T=Tagger, L=LLM, H=Hybrid)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Text to Prompt Model Selection -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            <i class="fas fa-robot mr-1 text-purple-500"></i>
                            Text to Prompt Model
                        </label>
                        <p class="text-xs text-gray-500 mb-2">
                            テキストからプロンプト生成に使用するAIモデル
                        </p>
                        <div class="flex gap-2 items-start">
                            <select id="settings-text-model" class="flex-1 px-3 py-2 border rounded-lg"
                                    onchange="App.updateTextModelFromSettings(this.value)">
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
                    
                    <!-- Image to Prompt Model Selection -->
                    <div class="pt-4 border-t">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            <i class="fas fa-eye mr-1 text-purple-500"></i>
                            Image to Prompt Model
                        </label>
                        <p class="text-xs text-gray-500 mb-2">
                            画像からプロンプト生成に使用するVision モデル
                        </p>
                        <div class="flex gap-2 items-start">
                            <select id="settings-image-model" 
                                    onchange="App.updateImageModelFromSettings(this.value)"
                                    class="flex-1 px-3 py-2 border rounded-lg">
                                <option value="">Select a model...</option>
                            </select>
                            <button onclick="App.refreshModelList()" 
                                    class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                    title="Refresh model list">
                                <i class="fas fa-sync"></i>
                            </button>
                        </div>
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
                            Create custom output formats with specialized system prompts for specific use cases.
                            These user-created formats will appear in AI Format and Final Output dropdowns.
                            <br><span class="text-xs text-blue-600 mt-1 block">
                                <i class="fas fa-info-circle mr-1"></i>
                                System prompts (categorizer, translation, etc.) are managed in the AI Instructions tab.
                            </span>
                        </p>
                        
                        <!-- Text to Prompt Custom Formats -->
                        <div class="mb-6">
                            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
                                <i class="fas fa-file-text mr-2 text-blue-500"></i>
                                Text to Prompt Formats
                            </h4>
                            <div id="custom-formats-list" class="space-y-2">
                                <!-- Dynamically populated -->
                            </div>
                        </div>
                        
                        <!-- Image to Prompt Custom Formats -->
                        <div class="mb-6">
                            <h4 class="font-medium text-gray-800 mb-3 flex items-center">
                                <i class="fas fa-image mr-2 text-purple-500"></i>
                                Image to Prompt Formats
                            </h4>
                            <div id="image-custom-formats-list" class="space-y-2">
                                <!-- Dynamically populated -->
                            </div>
                        </div>
                        
                        <!-- Default Formats Info -->
                        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 class="font-medium text-blue-900 mb-2">Default Formats</h4>
                            <div class="space-y-1 text-sm text-blue-700">
                                <div class="flex items-center justify-between">
                                    <span><i class="fas fa-tag mr-1"></i> SDXL Tags</span>
                                    <div class="flex gap-1">
                                        <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('sdxl')" 
                                                class="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded"
                                                title="Help documentation for SDXL format">
                                            <i class="fas fa-question-circle"></i> Help
                                        </button>
                                        <button onclick="App.showPromptEditor('sdxl')" 
                                                class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span><i class="fas fa-tag mr-1"></i> Flux Phrases</span>
                                    <div class="flex gap-1">
                                        <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('flux')" 
                                                class="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded"
                                                title="Help documentation for Flux format">
                                            <i class="fas fa-question-circle"></i> Help
                                        </button>
                                        <button onclick="App.showPromptEditor('flux')" 
                                                class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span><i class="fas fa-tag mr-1"></i> ImageFX</span>
                                    <div class="flex gap-1">
                                        <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('imagefx')" 
                                                class="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded"
                                                title="Help documentation for ImageFX format">
                                            <i class="fas fa-question-circle"></i> Help
                                        </button>
                                        <button onclick="App.showPromptEditor('imagefx')" 
                                                class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span><i class="fas fa-tag mr-1"></i> ImageFX Natural</span>
                                    <div class="flex gap-1">
                                        <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('imagefx-natural')" 
                                                class="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded"
                                                title="Help documentation for ImageFX Natural format">
                                            <i class="fas fa-question-circle"></i> Help
                                        </button>
                                        <button onclick="App.showPromptEditor('imagefx-natural')" 
                                                class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                    </div>
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
                
                <!-- AI Instructions Settings -->
                <div id="settings-ai-instructions" class="space-y-4 hidden">
                    <div class="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <h3 class="font-semibold text-purple-900 mb-2 flex items-center">
                            <i class="fas fa-brain mr-2"></i>AI Instructions & System Prompts
                        </h3>
                        <p class="text-sm text-purple-700">
                            Configure AI instructions and system prompts for all features.
                        </p>
                    </div>
                    
                    <!-- Core AI System Prompts Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        
                        <!-- Tag Categorization System -->
                        <div class="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center">
                                    <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                                        <i class="fas fa-palette text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold text-orange-900">Tag Categorizer</h4>
                                        <p class="text-xs text-orange-700">色分けシステム</p>
                                    </div>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('categorizer')" 
                                            class="p-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                                            title="Help">
                                        <i class="fas fa-question-circle text-xs"></i>
                                    </button>
                                    <button onclick="App.showPromptEditor('categorizer')" 
                                            class="p-1 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                                            title="Edit">
                                        <i class="fas fa-edit text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="text-xs text-orange-800 mb-3">
                                Controls tag color-coding for both Text and Image prompts
                            </p>
                            <div class="grid grid-cols-5 gap-1 text-xs">
                                <span class="bg-orange-200 text-orange-900 px-1.5 py-0.5 rounded text-center">person</span>
                                <span class="bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded text-center">appearance</span>
                                <span class="bg-pink-200 text-pink-900 px-1.5 py-0.5 rounded text-center">clothing</span>
                                <span class="bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded text-center">action</span>
                                <span class="bg-green-200 text-green-900 px-1.5 py-0.5 rounded text-center">background</span>
                                <span class="bg-yellow-200 text-yellow-900 px-1.5 py-0.5 rounded text-center">quality</span>
                                <span class="bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded text-center">style</span>
                                <span class="bg-cyan-200 text-cyan-900 px-1.5 py-0.5 rounded text-center">composition</span>
                                <span class="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-center">object</span>
                                <span class="bg-gray-200 text-gray-900 px-1.5 py-0.5 rounded text-center">other</span>
                            </div>
                        </div>
                        
                        <!-- Image Analysis System -->
                        <div class="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center">
                                    <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                        <i class="fas fa-eye text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold text-purple-900">Image Analysis</h4>
                                        <p class="text-xs text-purple-700">Vision AI システム</p>
                                    </div>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('image-analysis')" 
                                            class="p-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
                                            title="Help">
                                        <i class="fas fa-question-circle text-xs"></i>
                                    </button>
                                    <button onclick="App.showPromptEditor('image-analysis')" 
                                            class="p-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                                            title="Edit">
                                        <i class="fas fa-edit text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="text-xs text-purple-800 mb-3">
                                Controls how images are analyzed in Image to Prompt feature
                            </p>
                            <div class="flex flex-wrap gap-1 text-xs">
                                <span class="bg-purple-200 text-purple-900 px-2 py-1 rounded">GPT-4o</span>
                                <span class="bg-purple-200 text-purple-900 px-2 py-1 rounded">Gemini</span>
                                <span class="bg-purple-200 text-purple-900 px-2 py-1 rounded">Claude</span>
                            </div>
                        </div>
                        
                        <!-- Translation System -->
                        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center">
                                    <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                        <i class="fas fa-language text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold text-blue-900">Translation System</h4>
                                        <p class="text-xs text-blue-700">英日翻訳システム</p>
                                    </div>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('translation-en-ja')" 
                                            class="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                                            title="Help">
                                        <i class="fas fa-question-circle text-xs"></i>
                                    </button>
                                    <button onclick="App.showPromptEditor('translation-en-ja')" 
                                            class="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                            title="Edit EN→JA">
                                        <i class="fas fa-edit text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="text-xs text-blue-800 mb-3">
                                Controls tag translation between English and Japanese
                            </p>
                            <div class="flex items-center justify-between text-xs text-blue-700">
                                <div class="flex gap-2">
                                    <button onclick="App.showPromptEditor('translation-en-ja')" 
                                            class="bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded transition-colors"
                                            title="Edit EN→JA Translation">
                                        <i class="fas fa-edit mr-1"></i>EN → JA
                                    </button>
                                    <button onclick="App.showPromptEditor('translation-ja-en')" 
                                            class="bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded transition-colors"
                                            title="Edit JA→EN Translation">
                                        <i class="fas fa-edit mr-1"></i>JA → EN
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tag Processing System -->
                        <div class="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center">
                                    <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                        <i class="fas fa-cogs text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold text-green-900">Tag Processing</h4>
                                        <p class="text-xs text-green-700">タグ処理システム</p>
                                    </div>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('tag-normalizer')" 
                                            class="p-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                                            title="Help">
                                        <i class="fas fa-question-circle text-xs"></i>
                                    </button>
                                    <button onclick="App.showPromptEditor('tag-normalizer')" 
                                            class="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                            title="Edit">
                                        <i class="fas fa-edit text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="text-xs text-green-800 mb-3">
                                Normalizes and structures tags for optimal generation
                            </p>
                            <div class="flex flex-wrap gap-1 text-xs">
                                <button onclick="App.showPromptEditor('tag-normalizer')" 
                                        class="bg-green-200 hover:bg-green-300 text-green-900 px-2 py-1 rounded transition-colors"
                                        title="Edit Tag Normalizer">
                                    <i class="fas fa-edit mr-1"></i>Normalize
                                </button>
                                <button onclick="App.showPromptEditor('structured-tags')" 
                                        class="bg-green-200 hover:bg-green-300 text-green-900 px-2 py-1 rounded transition-colors"
                                        title="Edit Structured Tags">
                                    <i class="fas fa-edit mr-1"></i>Structure
                                </button>
                                <span class="bg-green-200 text-green-900 px-2 py-1 rounded">JSON</span>
                            </div>
                        </div>
                        
                    </div>
                    
                    <!-- Advanced Settings -->
                    <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                            <i class="fas fa-sliders-h mr-2 text-gray-600"></i>
                            Advanced System Settings
                        </h4>
                        <p class="text-xs text-gray-600 mb-3">
                            Fine-tune system behavior and processing parameters
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div class="bg-white rounded-lg border border-gray-300 p-3">
                                <h5 class="font-medium text-gray-800 text-xs mb-2">
                                    <i class="fas fa-server mr-1 text-gray-600"></i>Backend Translation
                                </h5>
                                <div class="flex gap-1">
                                    <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('backend-translation')" 
                                            class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded">
                                        <i class="fas fa-question-circle"></i>
                                    </button>
                                    <button onclick="App.showPromptEditor('backend-translation')" 
                                            class="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-lg border border-gray-300 p-3">
                                <h5 class="font-medium text-gray-800 text-xs mb-2">
                                    <i class="fas fa-wrench mr-1 text-gray-600"></i>Custom Translation
                                </h5>
                                <div class="flex gap-1">
                                    <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('translation-custom')" 
                                            class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded">
                                        <i class="fas fa-question-circle"></i>
                                    </button>
                                    <button onclick="App.showPromptEditor('translation-custom')" 
                                            class="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-lg border border-gray-300 p-3">
                                <h5 class="font-medium text-gray-800 text-xs mb-2">
                                    <i class="fas fa-info-circle mr-1 text-blue-600"></i>System Help
                                </h5>
                                <button onclick="window.showSystemPromptHelp && showSystemPromptHelp('categorizer')" 
                                        class="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded w-full">
                                    <i class="fas fa-question-circle mr-1"></i>Help Guide
                                </button>
                            </div>
                            
                            <div class="bg-white rounded-lg border border-gray-300 p-3">
                                <h5 class="font-medium text-gray-800 text-xs mb-2">
                                    <i class="fas fa-cog mr-1 text-gray-600"></i>System Status
                                </h5>
                                <div class="text-xs text-green-600">
                                    <i class="fas fa-check-circle mr-1"></i>All Systems Active
                                </div>
                            </div>
                        </div>
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
    <script src="/static/systemPromptsHelp.js?v=${timestamp}"></script>
    <script src="/static/app-main.js?v=${timestamp}"></script>
</body>
</html>`
}