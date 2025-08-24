// SS Prompt Manager - System Prompts API Proxy
// フロントエンドのAI指示設定をバックエンドで参照するためのプロキシ

// システムプロンプト取得API - フロントエンドの設定を動的に取得
export async function getSystemPromptFromFrontend(promptType: string, targetLang?: string, format?: string): Promise<string> {
  // デフォルトのフォールバック
  const defaultPrompts: Record<string, string> = {
    'translation-en-ja': `You are a professional translator for custom image generation prompts.
Translate the given English image generation tag to Japanese while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "nyan", "nyaa", special characters, etc.), maintain them in the translation.

Examples:
- "1girl nyan" → "1人の女の子 nyan"
- "hot spring nyan" → "温泉 nyan"
- "ultra-detailed 8K nyan" → "超詳細 8K nyan"

Output only the translation, no explanations.`,
    
    'translation-ja-en': `You are a professional translator for custom image generation prompts.
Translate the given Japanese image generation tag to English while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "ニャン", special characters, etc.), maintain them in the translation.

Output only the translation, no explanations.`,
    
    'standard': `You are a professional translator for image generation prompts.
Translate between English and Japanese while maintaining context and meaning appropriate for AI image generation.

For custom formats: Preserve any special formatting, suffixes, or custom instructions.
For standard formats: Focus on natural, clear translation.

Output only the translation, no explanations.`
  };

  // TODO: 将来的にはここでフロントエンドのLocalStorageから設定を取得
  // 現在はリクエストヘッダーやクエリパラメータで設定を受け取る仕組みが必要
  
  // 翻訳指示の選択ロジック（元のロジックを保持）
  if (format && format !== 'sdxl' && format !== 'flux' && format !== 'imagefx' && format !== 'imagefx-natural') {
    // カスタムフォーマット
    if (targetLang === 'ja') {
      return defaultPrompts['translation-en-ja'];
    } else {
      return defaultPrompts['translation-ja-en'];
    }
  } else {
    // 標準フォーマット
    return defaultPrompts['standard'];
  }
}

// API経由でシステムプロンプトを取得する関数
export async function fetchSystemPromptFromAPI(promptType: string): Promise<string> {
  try {
    // フロントエンドの設定APIを呼び出し（将来実装）
    const response = await fetch('/api/system-prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptType })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.prompt;
    }
    
    // フォールバック
    return await getSystemPromptFromFrontend(promptType);
  } catch (error) {
    console.warn('System prompt API call failed, using defaults:', error);
    return await getSystemPromptFromFrontend(promptType);
  }
}