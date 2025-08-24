// SS Prompt Manager - System Prompts Help Documentation
// システムプロンプトの使用経路と説明

const SYSTEM_PROMPTS_HELP = {
  // Text to Prompt Formats
  'SDXL Tags': {
    id: 'sdxl',
    category: 'format',
    usage: 'Text to Prompt → AI Generate',
    description: 'SDXL形式のタグ生成用プロンプト。カンマ区切りの短いタグを生成。',
    route: `
    【使用経路】
    1. Text to Promptタブを開く
    2. AI Format: "SDXL Tags"を選択
    3. テキストを入力
    4. "AI Generate"ボタンをクリック
    → このプロンプトが使用される
    `,
    example: '1girl, beautiful, long hair, (masterpiece:1.3), (best quality:1.3)',
    tips: [
      '重み付け記法: (tag:1.2) で強調、[tag:0.8] で抑制',
      '5ブロック階層モデルに基づいて生成',
      'カンマ区切りの短いタグ形式'
    ]
  },
  
  'Flux Phrases': {
    id: 'flux',
    category: 'format',
    usage: 'Text to Prompt → AI Generate',
    description: 'Flux形式の自然文生成用プロンプト。描写的で長いフレーズを生成。',
    route: `
    【使用経路】
    1. Text to Promptタブを開く
    2. AI Format: "Flux Phrases"を選択
    3. テキストを入力
    4. "AI Generate"ボタンをクリック
    → このプロンプトが使用される
    `,
    example: 'A beautiful young woman with flowing long hair standing gracefully in a serene garden...',
    tips: [
      '自然な文章形式で記述',
      '感情や雰囲気を重視',
      '物語的な文脈を含む'
    ]
  },
  
  'ImageFX': {
    id: 'imagefx',
    category: 'format',
    usage: 'Text to Prompt → AI Generate',
    description: 'ImageFX形式の命令文生成用プロンプト。明確な指示を生成。',
    route: `
    【使用経路】
    1. Text to Promptタブを開く
    2. AI Format: "ImageFX"を選択
    3. テキストを入力
    4. "AI Generate"ボタンをクリック
    → このプロンプトが使用される
    `,
    example: 'Create an image of a beautiful woman with long hair in a garden',
    tips: [
      '命令形式で記述',
      'アートスタイルを明示的に指定',
      '簡潔で包括的な指示'
    ]
  },
  
  'ImageFX Natural': {
    id: 'imagefx-natural',
    category: 'format',
    usage: 'Text to Prompt → AI Generate',
    description: 'ImageFX Natural形式の自然言語生成用プロンプト。人間らしい指示を生成。',
    route: `
    【使用経路】
    1. Text to Promptタブを開く
    2. AI Format: "ImageFX Natural"を選択
    3. テキストを入力
    4. "AI Generate"ボタンをクリック
    → このプロンプトが使用される
    `,
    example: 'I\'d like to see a beautiful woman with long flowing hair standing in a garden',
    tips: [
      '自然な会話調の指示',
      '感情や期待を含む表現',
      'より人間的なリクエスト形式'
    ]
  },
  
  // Translation Prompts
  'TRANSLATION-EN-JA': {
    id: 'translation-en-ja',
    category: 'translation',
    usage: 'Tag Editor → 英語タグ編集時',
    description: '英語から日本語への翻訳プロンプト。画像生成タグの翻訳に特化。',
    route: `
    【使用経路】
    1. Tag Editorで英語タグを編集
    2. 編集完了時に自動的に日本語に翻訳
    → このプロンプトが使用される
    
    【Split to Tags使用時】
    1. テキストを入力して"Split to Tags"
    2. 英語タグが自動的に日本語に翻訳
    → このプロンプトが使用される
    `,
    example: '1girl → 1人の女の子',
    tips: [
      '特殊な接尾辞（nyan等）を保持',
      '画像生成用語に特化した翻訳',
      'カスタムフォーマットにも対応'
    ]
  },
  
  'TRANSLATION-JA-EN': {
    id: 'translation-ja-en',
    category: 'translation',
    usage: 'Tag Editor → 日本語タグ編集時',
    description: '日本語から英語への翻訳プロンプト。日本語タグを英語に変換。',
    route: `
    【使用経路】
    1. Tag Editorで日本語タグを編集
    2. 編集完了時に自動的に英語に翻訳
    → このプロンプトが使用される
    
    【Add New Tag使用時】
    1. 日本語でタグを追加
    2. 自動的に英語に翻訳
    → このプロンプトが使用される
    `,
    example: '美しい女性 → beautiful woman',
    tips: [
      '日本語特有の表現を適切に英訳',
      '画像生成に適した英語表現に変換',
      '文脈を考慮した翻訳'
    ]
  },
  
  'TRANSLATION-CUSTOM': {
    id: 'translation-custom',
    category: 'translation',
    usage: 'カスタムフォーマット使用時の翻訳',
    description: 'カスタムフォーマット用の汎用翻訳プロンプト。',
    route: `
    【使用経路】
    1. カスタムフォーマットを選択
    2. タグ編集時の翻訳
    → このプロンプトが使用される
    `,
    example: 'カスタムフォーマットに応じた翻訳',
    tips: [
      'カスタムフォーマットの特殊記法を保持',
      '柔軟な翻訳対応'
    ]
  },
  
  // Utility Prompts
  'CATEGORIZER': {
    id: 'categorizer',
    category: 'utility',
    usage: 'AI Analyze → タグ分類',
    description: 'タグを自動的にカテゴリ分類するプロンプト。',
    route: `
    【使用経路】
    1. タグが生成される
    2. "AI Analyze"機能（自動）
    → タグをカテゴリ別に色分け
    → このプロンプトが使用される
    `,
    categories: [
      'person (オレンジ): 人物',
      'appearance (青): 外見',
      'clothing (ピンク): 服装',
      'action (紫): 動作',
      'background (緑): 背景',
      'quality (黄): 品質',
      'style (紫): スタイル',
      'other (グレー): その他'
    ],
    tips: [
      'カテゴリごとに色分け表示',
      '自動分類で整理',
      '手動カテゴリ変更も可能'
    ]
  },
  
  'IMAGE-ANALYSIS': {
    id: 'image-analysis',
    category: 'vision',
    usage: 'Image to Prompt → Analyze Image',
    description: '画像解析用プロンプト。画像から詳細情報を抽出。',
    route: `
    【使用経路】
    1. Image to Promptタブを開く
    2. 画像をアップロード
    3. "Analyze Image"ボタンをクリック
    → このプロンプトが使用される
    → 画像の詳細分析を実行
    `,
    extracts: [
      '主要な被写体と特徴',
      'アクション、ポーズ、相互作用',
      '環境と設定',
      'アートスタイルと技術的品質',
      'ムードと雰囲気'
    ],
    tips: [
      'Vision AI（GPT-4o、Gemini等）を使用',
      '包括的な画像分析',
      '生成用プロンプトの基礎データ'
    ]
  },
  
  'TAG-NORMALIZER': {
    id: 'tag-normalizer',
    category: 'utility',
    usage: 'タグの正規化処理',
    description: 'タグを標準形式に正規化するプロンプト。',
    route: `
    【使用経路】
    1. タグ入力・編集時
    2. 自動的に正規化処理
    → このプロンプトが使用される
    `,
    normalizations: [
      '大文字小文字の統一',
      'スペースの調整',
      '重複の除去',
      '順序の最適化'
    ]
  },
  
  'STRUCTURED-TAGS': {
    id: 'structured-tags',
    category: 'utility',
    usage: 'AI Generate → 構造化タグ生成',
    description: 'JSON形式の構造化タグを生成するプロンプト。',
    route: `
    【使用経路】
    1. AI Generateボタンをクリック
    2. 構造化タグ生成
    → このプロンプトが使用される
    → JSONフォーマットで出力
    `,
    structure: {
      pairs: [
        { en: '英語タグ', ja: '日本語タグ', weight: 1.0, category: 'カテゴリ' }
      ]
    }
  },
  
  'BACKEND-TRANSLATION': {
    id: 'backend-translation',
    category: 'utility',
    usage: 'バックエンド翻訳API',
    description: 'サーバーサイドでの翻訳処理用プロンプト。',
    route: `
    【使用経路】
    1. /api/translate APIエンドポイント
    2. バックエンドで翻訳処理
    → このプロンプトが使用される
    `,
    tips: [
      'フロントエンドの翻訳失敗時のフォールバック',
      'バッチ処理での使用'
    ]
  },
  
  // Vision/Image Analysis Prompts
  'IMAGE-TO-PROMPT-ANALYSIS': {
    id: 'image-to-prompt-analysis',
    category: 'vision',
    usage: 'Image to Prompt → Analyze Image',
    description: '画像をVision AIで解析し、プロンプトに変換するための詳細分析。',
    route: `
    【使用経路】
    1. Image to Promptタブを開く
    2. 画像をアップロードまたはドラッグ&ドロップ
    3. Vision Model（GPT-4o、Gemini等）を選択
    4. "Analyze Image"ボタンをクリック
    → このプロンプトが画像解析に使用される
    → 画像の詳細な分析結果を表示
    `,
    extracts: [
      '被写体の詳細な特徴',
      'ポーズ、動作、表情',
      '服装、アクセサリー',
      '背景、環境、照明',
      'アートスタイル、技術的品質',
      '全体的な雰囲気とムード'
    ],
    tips: [
      'Vision AI モデルが必要（API設定必須）',
      '10MB以下の画像推奨',
      '解析結果は自動的にプロンプト生成に利用'
    ]
  },
  
  'IMAGE-TO-PROMPT-GENERATION': {
    id: 'image-to-prompt-generation',
    category: 'vision',
    usage: 'Image to Prompt → Generate from Analysis',
    description: '画像解析結果から指定フォーマットのプロンプトを生成。',
    route: `
    【使用経路】
    1. 画像解析完了後
    2. AI Format（SDXL/Flux/ImageFX等）を選択
    3. "Generate from Analysis"ボタンをクリック
    → 解析結果から選択フォーマットのプロンプトを生成
    → Tag Editorに結果を表示
    `,
    example: '画像解析: "美しい女性、長い髪..." → SDXL: "1girl, beautiful, long hair..."',
    tips: [
      '解析結果を基にフォーマット変換',
      'Final Outputで別フォーマットに再変換可能',
      'Tag Editorで細かい調整が可能'
    ]
  }
};

// ヘルプモーダルを表示する関数
function showSystemPromptHelp(promptId) {
  const help = Object.values(SYSTEM_PROMPTS_HELP).find(h => h.id === promptId);
  if (!help) return;
  
  const modal = document.createElement('div');
  modal.id = 'prompt-help-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center';
  modal.style.zIndex = '10000';
  
  modal.innerHTML = `
    <div class="bg-gray-900 text-white rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
        <h2 class="text-2xl font-bold flex items-center">
          <i class="fas fa-question-circle mr-3 text-blue-400"></i>
          ${Object.keys(SYSTEM_PROMPTS_HELP).find(key => SYSTEM_PROMPTS_HELP[key].id === promptId)}
        </h2>
        <button onclick="document.getElementById('prompt-help-modal').remove()" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="space-y-6">
        <!-- 概要 -->
        <div>
          <h3 class="text-lg font-semibold text-blue-400 mb-2">📝 概要</h3>
          <p class="text-gray-300">${help.description}</p>
        </div>
        
        <!-- 使用場所 -->
        <div>
          <h3 class="text-lg font-semibold text-green-400 mb-2">🎯 使用場所</h3>
          <p class="text-gray-300 bg-gray-800 p-3 rounded">${help.usage}</p>
        </div>
        
        <!-- 使用経路 -->
        <div>
          <h3 class="text-lg font-semibold text-yellow-400 mb-2">🔄 使用経路</h3>
          <pre class="text-sm text-gray-300 bg-gray-800 p-4 rounded overflow-x-auto">${help.route}</pre>
        </div>
        
        ${help.example ? `
        <!-- 例 -->
        <div>
          <h3 class="text-lg font-semibold text-purple-400 mb-2">💡 例</h3>
          <code class="text-sm text-gray-300 bg-gray-800 p-3 rounded block">${help.example}</code>
        </div>
        ` : ''}
        
        ${help.tips ? `
        <!-- ヒント -->
        <div>
          <h3 class="text-lg font-semibold text-orange-400 mb-2">💭 ヒント</h3>
          <ul class="list-disc list-inside text-gray-300 space-y-1">
            ${help.tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${help.categories ? `
        <!-- カテゴリ -->
        <div>
          <h3 class="text-lg font-semibold text-cyan-400 mb-2">📂 カテゴリ</h3>
          <ul class="list-none text-gray-300 space-y-1">
            ${help.categories.map(cat => `<li class="flex items-center"><span class="mr-2">•</span>${cat}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${help.extracts ? `
        <!-- 抽出情報 -->
        <div>
          <h3 class="text-lg font-semibold text-pink-400 mb-2">🔍 抽出情報</h3>
          <ul class="list-disc list-inside text-gray-300 space-y-1">
            ${help.extracts.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
      
      <div class="mt-6 pt-4 border-t border-gray-700">
        <button onclick="document.getElementById('prompt-help-modal').remove()" 
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
          閉じる
        </button>
      </div>
    </div>
  `;
  
  // クリックで閉じる
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  document.body.appendChild(modal);
}

// グローバルに公開
window.SYSTEM_PROMPTS_HELP = SYSTEM_PROMPTS_HELP;
window.showSystemPromptHelp = showSystemPromptHelp;