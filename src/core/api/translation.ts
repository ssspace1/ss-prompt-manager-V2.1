// SS Prompt Manager - Translation API Integration
// 翻訳API統合 - システムプロンプト管理との統合

import { systemPromptsManager } from '../config/systemPrompts';

export interface TranslationRequest {
  text: string;
  targetLang: 'ja' | 'en';
  format?: string;
  apiKey?: string;
}

export interface TranslationResponse {
  translated: string;
  source: 'ai' | 'dictionary';
  model?: string;
  error?: string;
}

/**
 * 翻訳API管理クラス
 * システムプロンプト管理と統合された翻訳サービス
 */
export class TranslationAPI {
  private static readonly OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly DEFAULT_MODEL = 'openai/gpt-4o-mini';
  private static readonly REFERER = 'https://ss-prompt-manager.pages.dev';
  private static readonly APP_NAME = 'SS Prompt Manager';

  /**
   * テキストを翻訳
   * 統合システムプロンプトを使用
   */
  public static async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, targetLang, format, apiKey } = request;

    if (!text?.trim()) {
      return { translated: '', source: 'dictionary', error: 'テキストが指定されていません' };
    }

    // APIキーがない場合は辞書翻訳にフォールバック
    if (!apiKey) {
      return this.dictionaryTranslation(text, targetLang);
    }

    try {
      // 統合システムプロンプト管理から動的にプロンプトを取得
      const systemPrompt = systemPromptsManager.getTranslationPrompt(targetLang, format);

      const response = await fetch(this.OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.REFERER,
          'X-Title': this.APP_NAME
        },
        body: JSON.stringify({
          model: this.DEFAULT_MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt
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
        const errorText = await response.text();
        console.error('OpenRouter API エラー:', response.status, errorText);
        return this.dictionaryTranslation(text, targetLang);
      }

      const data = await response.json();
      const translated = data.choices?.[0]?.message?.content?.trim();

      if (!translated) {
        console.error('翻訳結果が空です:', data);
        return this.dictionaryTranslation(text, targetLang);
      }

      return {
        translated,
        source: 'ai',
        model: this.DEFAULT_MODEL
      };

    } catch (error) {
      console.error('翻訳API呼び出しエラー:', error);
      return this.dictionaryTranslation(text, targetLang);
    }
  }

  /**
   * 辞書翻訳（フォールバック）
   */
  private static dictionaryTranslation(text: string, targetLang: 'ja' | 'en'): TranslationResponse {
    // 簡易辞書翻訳は既存のロジックを使用
    const translated = this.applyDictionaryTranslation(text, targetLang);
    return {
      translated,
      source: 'dictionary'
    };
  }

  /**
   * 基本的な辞書翻訳ロジック
   */
  private static applyDictionaryTranslation(text: string, targetLang: 'ja' | 'en'): string {
    // 簡易辞書（実際の実装では app-main.js の辞書を使用）
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

    if (targetLang === 'ja') {
      let result = text;
      Object.entries(basicDict).forEach(([en, ja]) => {
        const regex = new RegExp(en, 'gi');
        result = result.replace(regex, ja);
      });
      return result;
    } else {
      // 英語への翻訳（逆引き）
      let result = text;
      Object.entries(basicDict).forEach(([en, ja]) => {
        const regex = new RegExp(ja, 'gi');
        result = result.replace(regex, en);
      });
      return result;
    }
  }

  /**
   * プロンプト強化
   */
  public static async enhancePrompt(
    text: string, 
    type: 'quality' | 'style', 
    apiKey: string
  ): Promise<TranslationResponse> {
    if (!text?.trim()) {
      return { translated: '', source: 'dictionary', error: 'テキストが指定されていません' };
    }

    if (!apiKey) {
      return { translated: text, source: 'dictionary', error: 'APIキーが必要です' };
    }

    try {
      // 統合システムプロンプト管理から強化プロンプトを取得
      const systemPrompt = systemPromptsManager.getEnhancementPrompt(type);

      const response = await fetch(this.OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.REFERER,
          'X-Title': this.APP_NAME
        },
        body: JSON.stringify({
          model: this.DEFAULT_MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.5,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('プロンプト強化API エラー:', response.status, errorText);
        return { translated: text, source: 'dictionary', error: 'API呼び出しに失敗' };
      }

      const data = await response.json();
      const enhanced = data.choices?.[0]?.message?.content?.trim();

      if (!enhanced) {
        console.error('強化結果が空です:', data);
        return { translated: text, source: 'dictionary', error: '強化結果が取得できませんでした' };
      }

      return {
        translated: enhanced,
        source: 'ai',
        model: this.DEFAULT_MODEL
      };

    } catch (error) {
      console.error('プロンプト強化エラー:', error);
      return { translated: text, source: 'dictionary', error: 'エラーが発生しました' };
    }
  }

  /**
   * API接続テスト
   */
  public static async testConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(this.OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.REFERER,
          'X-Title': this.APP_NAME
        },
        body: JSON.stringify({
          model: this.DEFAULT_MODEL,
          messages: [
            {
              role: 'user',
              content: 'test'
            }
          ],
          max_tokens: 5
        })
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorText = await response.text();
        return { success: false, error: `API エラー: ${response.status} - ${errorText}` };
      }
    } catch (error) {
      return { success: false, error: `接続エラー: ${error.message}` };
    }
  }
}