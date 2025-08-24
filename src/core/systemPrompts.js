// SS Prompt Manager - System Prompts Management
// AI指示の統合管理システム（元機能保持版）

// デフォルトのシステムプロンプト
const DEFAULT_PROMPTS = {
  translation: {
    japanese: `You are a professional translator for custom image generation prompts.
Translate the given English image generation tag to Japanese while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "nyan", "nyaa", special characters, etc.), maintain them in the translation.

Examples:
- "1girl nyan" → "1人の女の子 nyan"
- "hot spring nyan" → "温泉 nyan"
- "ultra-detailed 8K nyan" → "超詳細 8K nyan"

Output only the translation, no explanations.`,
    
    english: `You are a professional translator for custom image generation prompts.
Translate the given Japanese image generation tag to English while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "ニャン", special characters, etc.), maintain them in the translation.

Output only the translation, no explanations.`,
    
    standard: `You are a professional translator for image generation prompts.
Translate between English and Japanese while maintaining context and meaning appropriate for AI image generation.

For custom formats: Preserve any special formatting, suffixes, or custom instructions.
For standard formats: Focus on natural, clear translation.

Output only the translation, no explanations.`
  }
};

// システムプロンプト管理クラス
class SystemPromptsManager {
  constructor() {
    this.prompts = this.loadPrompts();
  }

  // プロンプトをLocalStorageから読み込み
  loadPrompts() {
    try {
      const stored = localStorage.getItem('ss-system-prompts');
      if (stored) {
        const parsed = JSON.parse(stored);
        // デフォルトとマージ（新しいプロンプト追加対応）
        return { ...DEFAULT_PROMPTS, ...parsed };
      }
    } catch (error) {
      console.warn('System prompts loading failed:', error);
    }
    return { ...DEFAULT_PROMPTS };
  }

  // プロンプトをLocalStorageに保存
  savePrompts() {
    try {
      localStorage.setItem('ss-system-prompts', JSON.stringify(this.prompts));
    } catch (error) {
      console.error('System prompts saving failed:', error);
    }
  }

  // 翻訳用プロンプトを取得（元のロジックと互換性維持）
  getTranslationPrompt(targetLang, format) {
    if (format && format !== 'sdxl' && format !== 'flux' && format !== 'imagefx' && format !== 'imagefx-natural') {
      // カスタムフォーマット用
      if (targetLang === 'ja') {
        return this.prompts.translation.japanese;
      } else {
        return this.prompts.translation.english;
      }
    } else {
      // 標準フォーマット用
      return this.prompts.translation.standard;
    }
  }

  // プロンプトを更新
  updatePrompt(category, type, content) {
    if (this.prompts[category] && this.prompts[category][type] !== undefined) {
      this.prompts[category][type] = content;
      this.savePrompts();
      return true;
    }
    return false;
  }

  // デフォルトに復元
  restoreDefaults() {
    this.prompts = { ...DEFAULT_PROMPTS };
    this.savePrompts();
  }

  // 現在の設定を取得
  getCurrentPrompts() {
    return { ...this.prompts };
  }
}

// グローバルインスタンス
const systemPromptsManager = new SystemPromptsManager();

// 後方互換性のためのヘルパー関数
function getSystemPrompt(targetLang, format) {
  return systemPromptsManager.getTranslationPrompt(targetLang, format);
}

// エクスポート（Cloudflare Workers対応）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SystemPromptsManager, systemPromptsManager, getSystemPrompt };
} else {
  window.SystemPromptsManager = SystemPromptsManager;
  window.systemPromptsManager = systemPromptsManager;
  window.getSystemPrompt = getSystemPrompt;
}