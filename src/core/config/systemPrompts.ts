// SS Prompt Manager - Unified System Prompts Management
// 統合AI指示管理システム

export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  category: 'translation' | 'enhancement' | 'custom';
  description?: string;
}

export interface SystemPromptsConfig {
  translation: {
    japanese: SystemPrompt;
    english: SystemPrompt;
    custom: SystemPrompt;
  };
  enhancement: {
    quality: SystemPrompt;
    style: SystemPrompt;
  };
  custom: SystemPrompt[];
}

/**
 * デフォルトAI指示設定
 * UI設定から編集可能、デフォルト復元機能付き
 */
export const DEFAULT_SYSTEM_PROMPTS: SystemPromptsConfig = {
  translation: {
    japanese: {
      id: 'translation-ja',
      name: '日本語翻訳',
      category: 'translation',
      isDefault: true,
      description: '英語から日本語への画像生成プロンプト翻訳',
      content: `You are a professional translator for image generation prompts.
Translate the given English image generation tag to Japanese while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "nyan", "nyaa", special characters, etc.), maintain them in the translation.

Examples:
- "1girl nyan" → "1人の女の子 nyan"
- "hot spring nyan" → "温泉 nyan"
- "ultra-detailed 8K nyan" → "超詳細 8K nyan"

Output only the translation, no explanations.`
    },
    english: {
      id: 'translation-en',
      name: '英語翻訳',
      category: 'translation',
      isDefault: true,
      description: '日本語から英語への画像生成プロンプト翻訳',
      content: `You are a professional translator for image generation prompts.
Translate the given Japanese image generation tag to English while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "ニャン", special characters, etc.), maintain them in the translation.

Output only the translation, no explanations.`
    },
    custom: {
      id: 'translation-custom',
      name: 'カスタム翻訳',
      category: 'translation',
      isDefault: true,
      description: 'カスタムフォーマット用の翻訳指示',
      content: `You are a professional translator for custom image generation prompts.
Translate between English and Japanese while maintaining context and meaning appropriate for AI image generation.

For custom formats: Preserve any special formatting, suffixes, or custom instructions.
For standard formats: Focus on natural, clear translation.

Output only the translation, no explanations.`
    }
  },
  enhancement: {
    quality: {
      id: 'enhancement-quality',
      name: '品質向上',
      category: 'enhancement',
      isDefault: true,
      description: 'プロンプトの品質と詳細度を向上',
      content: `You are an expert at enhancing image generation prompts for better quality and detail.

Enhance the given prompt by:
1. Adding appropriate quality modifiers (masterpiece, best quality, ultra-detailed, etc.)
2. Improving composition and lighting descriptions
3. Adding relevant artistic style elements
4. Maintaining the original intent and subject

Keep the enhancement natural and balanced. Output only the enhanced prompt.`
    },
    style: {
      id: 'enhancement-style',
      name: 'スタイル最適化',
      category: 'enhancement',
      isDefault: true,
      description: 'アーティスティックスタイルの最適化',
      content: `You are an expert at optimizing image generation prompts for artistic style and visual appeal.

Optimize the given prompt by:
1. Adding appropriate artistic style references
2. Enhancing visual composition elements
3. Improving color and mood descriptions
4. Adding suitable technique modifiers

Maintain the core subject while enhancing artistic expression. Output only the optimized prompt.`
    }
  },
  custom: []
};

/**
 * システムプロンプト管理クラス
 * UI設定との統合、LocalStorage連携、デフォルト復元機能を提供
 */
export class SystemPromptsManager {
  private static instance: SystemPromptsManager;
  private config: SystemPromptsConfig;
  private readonly STORAGE_KEY = 'ss-prompt-manager-system-prompts';

  private constructor() {
    this.config = this.loadFromStorage();
  }

  public static getInstance(): SystemPromptsManager {
    if (!SystemPromptsManager.instance) {
      SystemPromptsManager.instance = new SystemPromptsManager();
    }
    return SystemPromptsManager.instance;
  }

  /**
   * LocalStorageから設定を読み込み
   */
  private loadFromStorage(): SystemPromptsConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // デフォルト設定とマージ（新しいプロンプトが追加された場合の対応）
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.warn('システムプロンプト設定の読み込みに失敗:', error);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SYSTEM_PROMPTS));
  }

  /**
   * デフォルト設定との安全なマージ
   */
  private mergeWithDefaults(userConfig: any): SystemPromptsConfig {
    const merged = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_PROMPTS));
    
    // ユーザー設定で上書き
    if (userConfig.translation) {
      Object.keys(userConfig.translation).forEach(key => {
        if (merged.translation[key]) {
          merged.translation[key] = { ...merged.translation[key], ...userConfig.translation[key] };
        }
      });
    }
    
    if (userConfig.enhancement) {
      Object.keys(userConfig.enhancement).forEach(key => {
        if (merged.enhancement[key]) {
          merged.enhancement[key] = { ...merged.enhancement[key], ...userConfig.enhancement[key] };
        }
      });
    }
    
    if (userConfig.custom && Array.isArray(userConfig.custom)) {
      merged.custom = userConfig.custom;
    }
    
    return merged;
  }

  /**
   * 設定をLocalStorageに保存
   */
  public saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('システムプロンプト設定の保存に失敗:', error);
    }
  }

  /**
   * 翻訳用プロンプトを取得
   */
  public getTranslationPrompt(targetLang: 'ja' | 'en', format?: string): string {
    if (format && format !== 'sdxl' && format !== 'flux' && format !== 'imagefx' && format !== 'imagefx-natural') {
      return this.config.translation.custom.content;
    }
    
    return targetLang === 'ja' 
      ? this.config.translation.japanese.content 
      : this.config.translation.english.content;
  }

  /**
   * プロンプト強化用指示を取得
   */
  public getEnhancementPrompt(type: 'quality' | 'style'): string {
    return this.config.enhancement[type].content;
  }

  /**
   * 特定のプロンプトを更新
   */
  public updatePrompt(category: keyof SystemPromptsConfig, id: string, updates: Partial<SystemPrompt>): void {
    if (category === 'custom') {
      const index = (this.config.custom as SystemPrompt[]).findIndex(p => p.id === id);
      if (index >= 0) {
        this.config.custom[index] = { ...this.config.custom[index], ...updates };
      }
    } else {
      const categoryConfig = this.config[category] as any;
      const promptKey = Object.keys(categoryConfig).find(key => categoryConfig[key].id === id);
      if (promptKey && categoryConfig[promptKey]) {
        categoryConfig[promptKey] = { ...categoryConfig[promptKey], ...updates };
      }
    }
    this.saveToStorage();
  }

  /**
   * カスタムプロンプトを追加
   */
  public addCustomPrompt(prompt: Omit<SystemPrompt, 'id'>): string {
    const id = `custom-${Date.now()}`;
    const newPrompt: SystemPrompt = {
      ...prompt,
      id,
      category: 'custom'
    };
    this.config.custom.push(newPrompt);
    this.saveToStorage();
    return id;
  }

  /**
   * プロンプトを削除
   */
  public deletePrompt(category: keyof SystemPromptsConfig, id: string): boolean {
    if (category === 'custom') {
      const index = this.config.custom.findIndex(p => p.id === id);
      if (index >= 0) {
        this.config.custom.splice(index, 1);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  /**
   * 特定のプロンプトをデフォルトに復元
   */
  public restoreToDefault(category: keyof SystemPromptsConfig, id: string): boolean {
    const defaultConfig = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_PROMPTS));
    
    if (category === 'custom') {
      // カスタムプロンプトはデフォルト復元対象外
      return false;
    }
    
    const categoryConfig = this.config[category] as any;
    const defaultCategoryConfig = defaultConfig[category] as any;
    const promptKey = Object.keys(categoryConfig).find(key => categoryConfig[key].id === id);
    
    if (promptKey && defaultCategoryConfig[promptKey]) {
      categoryConfig[promptKey] = JSON.parse(JSON.stringify(defaultCategoryConfig[promptKey]));
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * 全設定をデフォルトに復元
   */
  public restoreAllToDefaults(): void {
    this.config = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_PROMPTS));
    this.saveToStorage();
  }

  /**
   * 現在の設定を取得
   */
  public getConfig(): SystemPromptsConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * 設定の妥当性を検証
   */
  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 必須プロンプトの存在確認
    if (!this.config.translation?.japanese?.content) {
      errors.push('日本語翻訳プロンプトが設定されていません');
    }
    if (!this.config.translation?.english?.content) {
      errors.push('英語翻訳プロンプトが設定されていません');
    }
    
    // プロンプトの長さ制限確認
    const maxLength = 10000;
    Object.values(this.config.translation).forEach(prompt => {
      if (prompt.content && prompt.content.length > maxLength) {
        errors.push(`${prompt.name}のプロンプトが長すぎます (${prompt.content.length}/${maxLength}文字)`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// グローバルインスタンスをエクスポート
export const systemPromptsManager = SystemPromptsManager.getInstance();