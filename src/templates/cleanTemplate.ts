// SS Prompt Manager - Clean HTML Template
// 清潔で理解しやすい新しいHTMLテンプレート

export function getCleanHtml(): string {
  const timestamp = Date.now();
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SS Prompt Manager - Clean Architecture</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom styles for better UX */
        .tab-panel { transition: opacity 0.2s ease; }
        .notification { 
            animation: slideIn 0.3s ease-out; 
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        /* Loading states */
        .loading { 
            opacity: 0.6; 
            pointer-events: none; 
        }
        
        /* Modal backdrop */
        .modal-backdrop {
            backdrop-filter: blur(4px);
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <div id="app" class="container mx-auto p-4">
        <!-- Header -->
        <header class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800">🤖 SS Prompt Manager</h1>
                    <p class="text-gray-600 mt-1">清潔なアーキテクチャ - 統合AI指示管理システム</p>
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
                <button data-tab="batch" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                    📋 一括処理
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
                    <button onclick="window.App.enhancePrompt('quality')" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        ⭐ 品質向上
                    </button>
                    <button onclick="window.App.enhancePrompt('style')" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
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

        <!-- Batch Processing Panel -->
        <section id="batchPanel" class="bg-white rounded-lg shadow-sm p-6 tab-panel hidden">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">📋 一括処理</h2>
            
            <div class="text-center py-8">
                <div class="text-4xl mb-4">🚧</div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">開発中</h3>
                <p class="text-gray-600">複数テキストの一括翻訳機能を準備中です</p>
            </div>
        </section>

        <!-- Detailed Settings Panel -->
        <section id="settingsPanel" class="bg-white rounded-lg shadow-sm p-6 tab-panel hidden">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">⚙️ 詳細設定</h2>
            
            <div class="space-y-6">
                <!-- AI Instructions -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">🤖 AI指示管理</h3>
                    <p class="text-gray-600 mb-4">翻訳・強化の品質を向上させるためのAI指示を編集できます</p>
                    <button id="systemPromptsBtn2" onclick="window.systemPromptsModal.show()" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        📝 AI指示を編集
                    </button>
                </div>

                <!-- Export/Import -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">💾 設定管理</h3>
                    <div class="flex gap-2">
                        <button onclick="window.App.exportSettings()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            📤 設定をエクスポート
                        </button>
                        <button onclick="window.App.importSettings()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            📥 設定をインポート
                        </button>
                    </div>
                </div>

                <!-- System Info -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-800 mb-3">ℹ️ システム情報</h3>
                    <div class="text-sm text-gray-600">
                        <p>バージョン: 3.0 (Clean Architecture)</p>
                        <p>最終更新: ${new Date().toLocaleDateString('ja-JP')}</p>
                        <p>アーキテクチャ: Modular TypeScript</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="text-center text-gray-500 text-sm mt-8 pb-4">
            <p>SS Prompt Manager v3.0 - Clean Architecture with Unified AI Instructions Management</p>
        </footer>
    </div>

    <!-- Scripts -->
    <script type="module">
        // Load core modules
        import { mainApp } from '/static/dist/mainApp.js?v=${timestamp}';
        import { systemPromptsModal } from '/static/dist/SystemPromptsModal.js?v=${timestamp}';
        
        // Initialize application
        document.addEventListener('DOMContentLoaded', () => {
            mainApp.initialize();
        });
    </script>
</body>
</html>`;
}