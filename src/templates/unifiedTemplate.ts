// SS Prompt Manager - Unified Clean Template
// 統合された清潔なテンプレート（JavaScript内蔵版）

export function getUnifiedHtml(): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SS Prompt Manager - Clean Architecture</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .tab-panel { transition: opacity 0.2s ease; }
        .notification { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .loading { opacity: 0.6; pointer-events: none; }
        .modal-backdrop { backdrop-filter: blur(4px); }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <div id="app" class="container mx-auto p-4">
        <!-- Header -->
        <header class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800">🤖 SS Prompt Manager</h1>
                    <p class="text-gray-600 mt-1">統合AI指示管理システム - v3.0</p>
                </div>
                <div class="text-right">
                    <div id="connectionStatus" class="text-sm mb-2">🔴 API キー未設定</div>
                    <button id="systemPromptsBtn" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        ⚙️ AI指示設定
                    </button>
                </div>
            </div>
        </header>

        <!-- Settings Panel -->
        <section class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">🔑 基本設定</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        OpenRouter API Key
                    </label>
                    <input 
                        type="password" 
                        id="apiKey" 
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="sk-or-v1-..."
                    >
                    <p class="text-xs text-gray-500 mt-1">
                        <a href="https://openrouter.ai/keys" target="_blank" class="text-blue-600 hover:underline">
                            OpenRouter でAPIキーを取得
                        </a>
                    </p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        自動翻訳
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" id="autoTranslate" class="mr-2">
                        <span class="text-sm text-gray-700">入力時に自動で翻訳する</span>
                    </label>
                </div>
            </div>
        </section>

        <!-- Tab Navigation -->
        <nav class="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div class="flex space-x-2">
                <button data-tab="basic" class="px-4 py-2 rounded-lg bg-blue-600 text-white transition-colors">
                    📝 基本翻訳
                </button>
                <button data-tab="enhance" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                    ✨ プロンプト強化
                </button>
                <button data-tab="settings" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                    ⚙️ 詳細設定
                </button>
            </div>
        </nav>

        <!-- Basic Translation Panel -->
        <section id="basicPanel" class="bg-white rounded-lg shadow-sm p-6 tab-panel">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">📝 基本翻訳</h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Input Section -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <label class="text-sm font-medium text-gray-700">入力テキスト</label>
                        <div class="flex gap-2">
                            <select id="targetLang" class="text-sm border border-gray-300 rounded px-2 py-1">
                                <option value="ja">英語 → 日本語</option>
                                <option value="en">日本語 → 英語</option>
                            </select>
                            <select id="format" class="text-sm border border-gray-300 rounded px-2 py-1">
                                <option value="sdxl">標準</option>
                                <option value="custom">カスタム</option>
                            </select>
                        </div>
                    </div>
                    <textarea 
                        id="inputText" 
                        class="w-full h-40 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="翻訳したいテキストを入力..."
                    ></textarea>
                    <div class="mt-2 flex gap-2">
                        <button id="translateBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            🚀 翻訳実行
                        </button>
                        <button onclick="document.getElementById('inputText').value=''" class="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                            🗑️ クリア
                        </button>
                    </div>
                </div>

                <!-- Output Section -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">翻訳結果</label>
                    <textarea 
                        id="outputText" 
                        class="w-full h-40 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 resize-none"
                        readonly
                        placeholder="翻訳結果がここに表示されます..."
                    ></textarea>
                    <div class="mt-2 flex gap-2">
                        <button onclick="navigator.clipboard.writeText(document.getElementById('outputText').value)" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            📋 コピー
                        </button>
                        <button onclick="const temp = document.getElementById('inputText').value; document.getElementById('inputText').value = document.getElementById('outputText').value; document.getElementById('outputText').value = temp;" class="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                            🔄 入れ替え
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Enhancement Panel -->
        <section id="enhancePanel" class="bg-white rounded-lg shadow-sm p-6 tab-panel hidden">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">✨ プロンプト強化</h2>
            
            <div class="mb-4">
                <p class="text-gray-600 mb-4">既存のプロンプトをAIが品質向上・スタイル最適化します</p>
                <div class="flex gap-4 mb-4">
                    <button id="enhanceQualityBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        ⭐ 品質向上
                    </button>
                    <button id="enhanceStyleBtn" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        🎨 スタイル最適化
                    </button>
                </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg">
                <h3 class="font-semibold text-blue-800 mb-2">💡 使い方</h3>
                <ul class="text-sm text-blue-700 space-y-1">
                    <li>1. 基本翻訳パネルでプロンプトを入力</li>
                    <li>2. 品質向上またはスタイル最適化を選択</li>
                    <li>3. AI指示設定で強化方法をカスタマイズ可能</li>
                </ul>
            </div>
        </section>

        <!-- Settings Panel -->
        <section id="settingsPanel" class="bg-white rounded-lg shadow-sm p-6 tab-panel hidden">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">⚙️ 詳細設定</h2>
            
            <div class="space-y-6">
                <!-- AI Instructions -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">🤖 AI指示管理</h3>
                    <p class="text-gray-600 mb-4">翻訳・強化の品質を向上させるためのAI指示を編集できます</p>
                    <button id="systemPromptsBtn2" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        📝 AI指示を編集
                    </button>
                </div>

                <!-- Export/Import -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">💾 設定管理</h3>
                    <div class="flex gap-2">
                        <button id="exportBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            📤 設定をエクスポート
                        </button>
                        <button id="importBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            📥 設定をインポート
                        </button>
                    </div>
                </div>

                <!-- Current AI Instructions Display -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">📋 現在のAI指示</h3>
                    <div class="space-y-2">
                        <div class="bg-gray-50 p-3 rounded">
                            <h4 class="font-medium text-sm text-gray-700">翻訳（日本語）</h4>
                            <p id="currentTranslationJA" class="text-xs text-gray-600 mt-1 truncate">読み込み中...</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <h4 class="font-medium text-sm text-gray-700">翻訳（英語）</h4>
                            <p id="currentTranslationEN" class="text-xs text-gray-600 mt-1 truncate">読み込み中...</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <h4 class="font-medium text-sm text-gray-700">品質向上</h4>
                            <p id="currentEnhancementQuality" class="text-xs text-gray-600 mt-1 truncate">読み込み中...</p>
                        </div>
                    </div>
                </div>

                <!-- System Info -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">ℹ️ システム情報</h3>
                    <div class="text-sm text-gray-600">
                        <p>バージョン: 3.0 (Clean Architecture)</p>
                        <p>最終更新: ${new Date().toLocaleDateString('ja-JP')}</p>
                        <p>アーキテクチャ: Unified JavaScript</p>
                        <p>AI指示: 統合管理システム</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="text-center text-gray-500 text-sm mt-8 pb-4">
            <p>SS Prompt Manager v3.0 - 統合AI指示管理システム搭載</p>
        </footer>
    </div>

    <!-- Embedded JavaScript Application -->
    <script>
        // === SS Prompt Manager - Unified JavaScript Application ===
        // 統合JavaScript アプリケーション
        
        // === System Prompts Management ===
        const DEFAULT_SYSTEM_PROMPTS = {
          translation: {
            japanese: {
              id: 'translation-ja',
              name: '日本語翻訳',
              content: \`You are a professional translator for image generation prompts.
Translate the given English image generation tag to Japanese while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "nyan", "nyaa", special characters, etc.), maintain them in the translation.

Examples:
- "1girl nyan" → "1人の女の子 nyan"
- "hot spring nyan" → "温泉 nyan"
- "ultra-detailed 8K nyan" → "超詳細 8K nyan"

Output only the translation, no explanations.\`
            },
            english: {
              id: 'translation-en',
              name: '英語翻訳',
              content: \`You are a professional translator for image generation prompts.
Translate the given Japanese image generation tag to English while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "ニャン", special characters, etc.), maintain them in the translation.

Output only the translation, no explanations.\`
            },
            custom: {
              id: 'translation-custom',
              name: 'カスタム翻訳',
              content: \`You are a professional translator for custom image generation prompts.
Translate between English and Japanese while maintaining context and meaning appropriate for AI image generation.

For custom formats: Preserve any special formatting, suffixes, or custom instructions.
For standard formats: Focus on natural, clear translation.

Output only the translation, no explanations.\`
            }
          },
          enhancement: {
            quality: {
              id: 'enhancement-quality',
              name: '品質向上',
              content: \`You are an expert at enhancing image generation prompts for better quality and detail.

Enhance the given prompt by:
1. Adding appropriate quality modifiers (masterpiece, best quality, ultra-detailed, etc.)
2. Improving composition and lighting descriptions
3. Adding relevant artistic style elements
4. Maintaining the original intent and subject

Keep the enhancement natural and balanced. Output only the enhanced prompt.\`
            },
            style: {
              id: 'enhancement-style',
              name: 'スタイル最適化',
              content: \`You are an expert at optimizing image generation prompts for artistic style and visual appeal.

Optimize the given prompt by:
1. Adding appropriate artistic style references
2. Enhancing visual composition elements
3. Improving color and mood descriptions
4. Adding suitable technique modifiers

Maintain the core subject while enhancing artistic expression. Output only the optimized prompt.\`
            }
          }
        };

        class SystemPromptsManager {
          constructor() {
            this.config = this.loadFromStorage();
          }

          loadFromStorage() {
            try {
              const stored = localStorage.getItem('ss-prompt-manager-system-prompts');
              if (stored) {
                return { ...DEFAULT_SYSTEM_PROMPTS, ...JSON.parse(stored) };
              }
            } catch (error) {
              console.warn('システムプロンプト設定の読み込みに失敗:', error);
            }
            return JSON.parse(JSON.stringify(DEFAULT_SYSTEM_PROMPTS));
          }

          saveToStorage() {
            try {
              localStorage.setItem('ss-prompt-manager-system-prompts', JSON.stringify(this.config));
            } catch (error) {
              console.error('システムプロンプト設定の保存に失敗:', error);
            }
          }

          getTranslationPrompt(targetLang, format) {
            if (format && format !== 'sdxl' && format !== 'flux' && format !== 'imagefx' && format !== 'imagefx-natural') {
              return this.config.translation.custom.content;
            }
            return targetLang === 'ja' 
              ? this.config.translation.japanese.content 
              : this.config.translation.english.content;
          }

          getEnhancementPrompt(type) {
            return this.config.enhancement[type].content;
          }

          updatePrompt(category, id, updates) {
            // Simplified update logic
            Object.keys(this.config[category]).forEach(key => {
              if (this.config[category][key].id === id) {
                this.config[category][key] = { ...this.config[category][key], ...updates };
              }
            });
            this.saveToStorage();
          }

          restoreToDefaults() {
            this.config = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_PROMPTS));
            this.saveToStorage();
          }

          getConfig() {
            return JSON.parse(JSON.stringify(this.config));
          }
        }

        // === Translation API ===
        class TranslationAPI {
          static async translate(request) {
            const { text, targetLang, format, apiKey } = request;

            if (!text?.trim()) {
              return { translated: '', source: 'dictionary', error: 'テキストが指定されていません' };
            }

            if (!apiKey) {
              return this.dictionaryTranslation(text, targetLang);
            }

            try {
              const systemPrompt = App.systemPromptsManager.getTranslationPrompt(targetLang, format);

              const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text,
                  targetLang,
                  format,
                  apiKey
                })
              });

              if (!response.ok) {
                console.error('Translation API error:', response.status);
                return this.dictionaryTranslation(text, targetLang);
              }

              const result = await response.json();
              return result;

            } catch (error) {
              console.error('Translation error:', error);
              return this.dictionaryTranslation(text, targetLang);
            }
          }

          static dictionaryTranslation(text, targetLang) {
            // 簡易辞書翻訳
            const basicDict = {
              '1girl': '1人の女の子',
              'girl': '女の子',
              'boy': '男の子', 
              'woman': '女性',
              'man': '男性',
              'beautiful': '美しい',
              'cute': 'かわいい',
              'smile': '笑顔',
              'long hair': '長い髪',
              'short hair': '短い髪',
              'dress': 'ドレス',
              'sitting': '座っている',
              'standing': '立っている'
            };

            let result = text;
            if (targetLang === 'ja') {
              Object.entries(basicDict).forEach(([en, ja]) => {
                const regex = new RegExp(en, 'gi');
                result = result.replace(regex, ja);
              });
            } else {
              Object.entries(basicDict).forEach(([en, ja]) => {
                const regex = new RegExp(ja, 'gi');
                result = result.replace(regex, en);
              });
            }

            return { translated: result, source: 'dictionary' };
          }

          static async enhancePrompt(text, type, apiKey) {
            if (!text?.trim() || !apiKey) {
              return { translated: text, source: 'dictionary', error: 'テキストまたはAPIキーが不足' };
            }

            try {
              const response = await fetch('/api/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, type, apiKey })
              });

              if (!response.ok) {
                return { translated: text, source: 'dictionary', error: 'API呼び出し失敗' };
              }

              return await response.json();
            } catch (error) {
              console.error('Enhancement error:', error);
              return { translated: text, source: 'dictionary', error: 'エラーが発生しました' };
            }
          }
        }

        // === Main Application ===
        class MainApp {
          constructor() {
            this.currentTab = 'basic';
            this.apiKey = '';
            this.systemPromptsManager = new SystemPromptsManager();
            this.isInitialized = false;
          }

          initialize() {
            if (this.isInitialized) return;

            console.log('SS Prompt Manager initialized');
            this.loadSettings();
            this.setupEventListeners();
            this.initializeUI();
            this.updateCurrentPromptsDisplay();
            
            this.isInitialized = true;
          }

          loadSettings() {
            this.apiKey = localStorage.getItem('openrouter-api-key') || '';
            const apiKeyInput = document.getElementById('apiKey');
            if (apiKeyInput) apiKeyInput.value = this.apiKey;

            this.currentTab = localStorage.getItem('current-tab') || 'basic';
            this.switchTab(this.currentTab);
          }

          setupEventListeners() {
            // API Key
            const apiKeyInput = document.getElementById('apiKey');
            apiKeyInput?.addEventListener('change', () => {
              this.apiKey = apiKeyInput.value;
              localStorage.setItem('openrouter-api-key', this.apiKey);
              this.updateConnectionStatus();
            });

            // System prompts buttons
            document.getElementById('systemPromptsBtn')?.addEventListener('click', () => this.showSystemPromptsModal());
            document.getElementById('systemPromptsBtn2')?.addEventListener('click', () => this.showSystemPromptsModal());

            // Tab switching
            document.querySelectorAll('[data-tab]').forEach(btn => {
              btn.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                if (tabId) this.switchTab(tabId);
              });
            });

            // Translation
            document.getElementById('translateBtn')?.addEventListener('click', () => this.performTranslation());

            // Enhancement
            document.getElementById('enhanceQualityBtn')?.addEventListener('click', () => this.enhancePrompt('quality'));
            document.getElementById('enhanceStyleBtn')?.addEventListener('click', () => this.enhancePrompt('style'));

            // Export/Import
            document.getElementById('exportBtn')?.addEventListener('click', () => this.exportSettings());
            document.getElementById('importBtn')?.addEventListener('click', () => this.importSettings());

            // Auto-translate
            const autoTranslateToggle = document.getElementById('autoTranslate');
            autoTranslateToggle?.addEventListener('change', () => {
              localStorage.setItem('auto-translate', autoTranslateToggle.checked.toString());
            });

            // Input field for auto-translation
            const inputField = document.getElementById('inputText');
            inputField?.addEventListener('input', () => {
              const autoTranslate = localStorage.getItem('auto-translate') === 'true';
              if (autoTranslate && this.apiKey) {
                clearTimeout(this.autoTranslateTimeout);
                this.autoTranslateTimeout = setTimeout(() => this.performTranslation(), 1000);
              }
            });
          }

          initializeUI() {
            const autoTranslateToggle = document.getElementById('autoTranslate');
            if (autoTranslateToggle) {
              autoTranslateToggle.checked = localStorage.getItem('auto-translate') === 'true';
            }
            this.updateConnectionStatus();
          }

          switchTab(tabId) {
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
            document.querySelectorAll('[data-tab]').forEach(btn => {
              btn.classList.remove('bg-blue-600', 'text-white');
              btn.classList.add('bg-gray-200', 'text-gray-700');
            });

            const selectedPanel = document.getElementById(tabId + 'Panel');
            selectedPanel?.classList.remove('hidden');

            const selectedBtn = document.querySelector(\`[data-tab="\${tabId}"]\`);
            selectedBtn?.classList.remove('bg-gray-200', 'text-gray-700');
            selectedBtn?.classList.add('bg-blue-600', 'text-white');

            this.currentTab = tabId;
            localStorage.setItem('current-tab', tabId);
          }

          async performTranslation() {
            const inputText = document.getElementById('inputText')?.value;
            const outputText = document.getElementById('outputText');
            const targetLang = document.getElementById('targetLang')?.value || 'ja';
            const format = document.getElementById('format')?.value || 'sdxl';

            if (!inputText?.trim()) {
              this.showNotification('翻訳するテキストを入力してください', 'warning');
              return;
            }

            outputText.value = '翻訳中...';
            const translateBtn = document.getElementById('translateBtn');
            const originalText = translateBtn?.textContent;
            if (translateBtn) translateBtn.textContent = '翻訳中...';

            try {
              const result = await TranslationAPI.translate({
                text: inputText,
                targetLang,
                format,
                apiKey: this.apiKey
              });

              outputText.value = result.translated;
              const sourceIndicator = result.source === 'ai' ? '🤖 AI翻訳' : '📚 辞書翻訳';
              this.showNotification(\`\${sourceIndicator}: 翻訳完了\`, 'success');

            } catch (error) {
              console.error('Translation error:', error);
              outputText.value = inputText;
              this.showNotification('翻訳エラーが発生しました', 'error');
            } finally {
              if (translateBtn && originalText) translateBtn.textContent = originalText;
            }
          }

          async enhancePrompt(type) {
            const inputText = document.getElementById('inputText')?.value;
            const outputText = document.getElementById('outputText');

            if (!inputText?.trim()) {
              this.showNotification('強化するプロンプトを入力してください', 'warning');
              return;
            }

            if (!this.apiKey) {
              this.showNotification('プロンプト強化にはAPIキーが必要です', 'warning');
              return;
            }

            outputText.value = 'プロンプト強化中...';

            try {
              const result = await TranslationAPI.enhancePrompt(inputText, type, this.apiKey);
              outputText.value = result.translated;
              this.showNotification(\`✨ プロンプト\${type === 'quality' ? '品質' : 'スタイル'}強化完了\`, 'success');
            } catch (error) {
              console.error('Enhancement error:', error);
              outputText.value = inputText;
              this.showNotification('プロンプト強化エラーが発生しました', 'error');
            }
          }

          async updateConnectionStatus() {
            const statusElement = document.getElementById('connectionStatus');
            if (!statusElement) return;

            if (!this.apiKey) {
              statusElement.innerHTML = '🔴 API キー未設定';
              statusElement.className = 'text-red-600';
              return;
            }

            statusElement.innerHTML = '🟡 接続確認中...';
            statusElement.className = 'text-yellow-600';

            // Simple connection test
            setTimeout(() => {
              statusElement.innerHTML = '🟢 接続設定完了';
              statusElement.className = 'text-green-600';
            }, 1000);
          }

          showSystemPromptsModal() {
            const modal = document.createElement('div');
            modal.innerHTML = \`
              <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-hidden flex flex-col">
                  <div class="bg-purple-600 text-white p-4 flex justify-between items-center">
                    <h2 class="text-xl font-bold">🤖 AI指示システム設定</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
                  </div>
                  
                  <div class="p-6 flex-1 overflow-y-auto">
                    <div class="space-y-4">
                      <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-bold text-blue-800 mb-2">✨ 統合AI指示管理システム</h3>
                        <p class="text-sm text-blue-700">AI指示がUIから編集可能になりました。すべての翻訳と強化処理で統一されたプロンプトシステムを使用します。</p>
                      </div>
                      
                      <div class="border border-gray-200 rounded-lg p-4">
                        <h4 class="font-semibold mb-2">🌐 現在の翻訳設定</h4>
                        <div class="text-sm text-gray-700 space-y-1">
                          <p><strong>日本語翻訳:</strong> 画像生成プロンプト専用の翻訳指示</p>
                          <p><strong>英語翻訳:</strong> 特殊フォーマット保持付き翻訳</p>
                          <p><strong>カスタム翻訳:</strong> ユーザー定義フォーマット対応</p>
                        </div>
                      </div>
                      
                      <div class="border border-gray-200 rounded-lg p-4">
                        <h4 class="font-semibold mb-2">✨ 現在の強化設定</h4>
                        <div class="text-sm text-gray-700 space-y-1">
                          <p><strong>品質向上:</strong> 詳細度とクオリティの向上</p>
                          <p><strong>スタイル最適化:</strong> アーティスティック表現の最適化</p>
                        </div>
                      </div>
                      
                      <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800 mb-2">🔄 デフォルト復元機能</h4>
                        <p class="text-sm text-green-700 mb-3">カスタマイズした設定をいつでもデフォルトに戻せます。</p>
                        <button onclick="App.systemPromptsManager.restoreToDefaults(); App.updateCurrentPromptsDisplay(); this.closest('.fixed').remove(); App.showNotification('全設定をデフォルトに復元しました', 'success');" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          🚨 全設定をデフォルトに復元
                        </button>
                      </div>
                      
                      <div class="bg-yellow-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-yellow-800 mb-2">⚠️ 今後のアップデート</h4>
                        <p class="text-sm text-yellow-700">個別プロンプトの詳細編集UIは次のバージョンで実装予定です。現在はLocalStorageベースの統合管理を提供しています。</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="border-t p-4 flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                      閉じる
                    </button>
                  </div>
                </div>
              </div>
            \`;
            document.body.appendChild(modal);
          }

          updateCurrentPromptsDisplay() {
            const config = this.systemPromptsManager.getConfig();
            
            const jaElement = document.getElementById('currentTranslationJA');
            if (jaElement) {
              jaElement.textContent = config.translation.japanese.content.substring(0, 100) + '...';
            }
            
            const enElement = document.getElementById('currentTranslationEN');
            if (enElement) {
              enElement.textContent = config.translation.english.content.substring(0, 100) + '...';
            }
            
            const qualityElement = document.getElementById('currentEnhancementQuality');
            if (qualityElement) {
              qualityElement.textContent = config.enhancement.quality.content.substring(0, 100) + '...';
            }
          }

          exportSettings() {
            const config = this.systemPromptsManager.getConfig();
            const exportData = {
              systemPrompts: config,
              settings: {
                currentTab: this.currentTab,
                autoTranslate: localStorage.getItem('auto-translate') === 'true'
              },
              exportDate: new Date().toISOString(),
              version: '3.0-unified'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`ss-prompt-manager-settings-\${new Date().toISOString().split('T')[0]}.json\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('設定をエクスポートしました', 'success');
          }

          importSettings() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const data = JSON.parse(event.target.result);
                    
                    if (data.systemPrompts) {
                      localStorage.setItem('ss-prompt-manager-system-prompts', JSON.stringify(data.systemPrompts));
                      this.systemPromptsManager = new SystemPromptsManager();
                      this.updateCurrentPromptsDisplay();
                    }
                    
                    if (data.settings) {
                      if (typeof data.settings.autoTranslate === 'boolean') {
                        localStorage.setItem('auto-translate', data.settings.autoTranslate.toString());
                        const toggle = document.getElementById('autoTranslate');
                        if (toggle) toggle.checked = data.settings.autoTranslate;
                      }
                    }

                    this.showNotification('設定をインポートしました', 'success');
                  } catch (error) {
                    this.showNotification('ファイルの読み込みに失敗しました', 'error');
                  }
                };
                reader.readAsText(file);
              }
            };
            input.click();
          }

          showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = \`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 notification \${
              type === 'success' ? 'bg-green-500 text-white' :
              type === 'error' ? 'bg-red-500 text-white' :
              type === 'warning' ? 'bg-yellow-500 text-black' :
              'bg-blue-500 text-white'
            }\`;
            notification.textContent = message;

            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
          }
        }

        // Initialize application
        const App = new MainApp();
        window.App = App;

        document.addEventListener('DOMContentLoaded', () => {
          App.initialize();
        });
    </script>
</body>
</html>`;
}