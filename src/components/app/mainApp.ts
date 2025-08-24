// SS Prompt Manager - Main Application Logic (Modular)
// メインアプリケーションロジック（モジュラー版）

import { systemPromptsManager } from '../../core/config/systemPrompts';
import { TranslationAPI } from '../../core/api/translation';
import { systemPromptsModal } from '../ui/SystemPromptsModal';

/**
 * メインアプリケーションクラス
 * 清潔で理解しやすいアーキテクチャで再構築
 */
export class MainApp {
  private static instance: MainApp;
  public currentTab: string = 'basic';
  public apiKey: string = '';
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): MainApp {
    if (!MainApp.instance) {
      MainApp.instance = new MainApp();
    }
    return MainApp.instance;
  }

  /**
   * アプリケーション初期化
   */
  public initialize(): void {
    if (this.isInitialized) return;

    console.log('SS Prompt Manager initialized');
    this.loadSettings();
    this.setupEventListeners();
    this.initializeUI();
    
    this.isInitialized = true;
  }

  /**
   * 設定を読み込み
   */
  private loadSettings(): void {
    // API key
    this.apiKey = localStorage.getItem('openrouter-api-key') || '';
    
    // UI elements update
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    if (apiKeyInput) {
      apiKeyInput.value = this.apiKey;
    }

    // Tab state
    this.currentTab = localStorage.getItem('current-tab') || 'basic';
    this.switchTab(this.currentTab);
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // API Key setting
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    apiKeyInput?.addEventListener('change', () => {
      this.apiKey = apiKeyInput.value;
      localStorage.setItem('openrouter-api-key', this.apiKey);
    });

    // System prompts modal
    const systemPromptsBtn = document.getElementById('systemPromptsBtn');
    systemPromptsBtn?.addEventListener('click', () => {
      systemPromptsModal.show(() => {
        this.handleSystemPromptsUpdated();
      });
    });

    // Tab switching
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = (e.target as HTMLElement).getAttribute('data-tab');
        if (tabId) {
          this.switchTab(tabId);
        }
      });
    });

    // Translation functionality
    this.setupTranslationListeners();
  }

  /**
   * 翻訳機能のイベントリスナー設定
   */
  private setupTranslationListeners(): void {
    // Translate button
    const translateBtn = document.getElementById('translateBtn');
    translateBtn?.addEventListener('click', () => {
      this.performTranslation();
    });

    // Auto-translate toggle
    const autoTranslateToggle = document.getElementById('autoTranslate') as HTMLInputElement;
    autoTranslateToggle?.addEventListener('change', () => {
      localStorage.setItem('auto-translate', autoTranslateToggle.checked.toString());
    });

    // Input field for auto-translation
    const inputField = document.getElementById('inputText') as HTMLTextAreaElement;
    inputField?.addEventListener('input', () => {
      const autoTranslate = localStorage.getItem('auto-translate') === 'true';
      if (autoTranslate && this.apiKey) {
        this.debounceTranslation();
      }
    });
  }

  /**
   * UI初期化
   */
  private initializeUI(): void {
    // Auto-translate state
    const autoTranslateToggle = document.getElementById('autoTranslate') as HTMLInputElement;
    if (autoTranslateToggle) {
      autoTranslateToggle.checked = localStorage.getItem('auto-translate') === 'true';
    }

    // Connection status
    this.updateConnectionStatus();
  }

  /**
   * タブ切り替え
   */
  public switchTab(tabId: string): void {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.add('hidden');
    });

    // Remove active class from all buttons
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-gray-200', 'text-gray-700');
    });

    // Show selected panel
    const selectedPanel = document.getElementById(`${tabId}Panel`);
    selectedPanel?.classList.remove('hidden');

    // Activate selected button
    const selectedBtn = document.querySelector(`[data-tab="${tabId}"]`);
    selectedBtn?.classList.remove('bg-gray-200', 'text-gray-700');
    selectedBtn?.classList.add('bg-blue-600', 'text-white');

    this.currentTab = tabId;
    localStorage.setItem('current-tab', tabId);
  }

  /**
   * 翻訳実行
   */
  public async performTranslation(): Promise<void> {
    const inputText = (document.getElementById('inputText') as HTMLTextAreaElement)?.value;
    const outputText = document.getElementById('outputText') as HTMLTextAreaElement;
    const targetLangSelect = document.getElementById('targetLang') as HTMLSelectElement;
    const formatSelect = document.getElementById('format') as HTMLSelectElement;

    if (!inputText?.trim()) {
      this.showNotification('翻訳するテキストを入力してください', 'warning');
      return;
    }

    if (!outputText) return;

    // Show loading state
    outputText.value = '翻訳中...';
    const translateBtn = document.getElementById('translateBtn') as HTMLButtonElement;
    const originalText = translateBtn?.textContent;
    if (translateBtn) translateBtn.textContent = '翻訳中...';

    try {
      const result = await TranslationAPI.translate({
        text: inputText,
        targetLang: targetLangSelect?.value as 'ja' | 'en' || 'ja',
        format: formatSelect?.value || undefined,
        apiKey: this.apiKey
      });

      outputText.value = result.translated;

      // Show translation source
      const sourceIndicator = result.source === 'ai' ? '🤖 AI翻訳' : '📚 辞書翻訳';
      this.showNotification(`${sourceIndicator}: 翻訳完了`, 'success');

    } catch (error) {
      console.error('Translation error:', error);
      outputText.value = inputText; // Fallback
      this.showNotification('翻訳エラーが発生しました', 'error');
    } finally {
      if (translateBtn && originalText) {
        translateBtn.textContent = originalText;
      }
    }
  }

  /**
   * デバウンス付き翻訳（自動翻訳用）
   */
  private debounceTranslation = this.debounce(() => {
    this.performTranslation();
  }, 1000);

  /**
   * デバウンス関数
   */
  private debounce(func: Function, wait: number): () => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction() {
      const later = () => {
        clearTimeout(timeout);
        func();
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 接続状態を更新
   */
  private async updateConnectionStatus(): Promise<void> {
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;

    if (!this.apiKey) {
      statusElement.innerHTML = '🔴 API キー未設定';
      statusElement.className = 'text-red-600';
      return;
    }

    statusElement.innerHTML = '🟡 接続確認中...';
    statusElement.className = 'text-yellow-600';

    try {
      const result = await TranslationAPI.testConnection(this.apiKey);
      
      if (result.success) {
        statusElement.innerHTML = '🟢 接続正常';
        statusElement.className = 'text-green-600';
      } else {
        statusElement.innerHTML = `🔴 接続エラー: ${result.error}`;
        statusElement.className = 'text-red-600';
      }
    } catch (error) {
      statusElement.innerHTML = '🔴 接続テスト失敗';
      statusElement.className = 'text-red-600';
    }
  }

  /**
   * システムプロンプト更新時の処理
   */
  private handleSystemPromptsUpdated(): void {
    // 設定が更新されたことをユーザーに通知
    this.showNotification('AI指示設定が更新されました', 'success');
    
    // 必要に応じて現在の翻訳結果を再計算
    const inputText = (document.getElementById('inputText') as HTMLTextAreaElement)?.value;
    if (inputText?.trim() && localStorage.getItem('auto-translate') === 'true') {
      setTimeout(() => {
        this.performTranslation();
      }, 500);
    }
  }

  /**
   * 通知表示
   */
  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-black' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * プロンプト強化機能
   */
  public async enhancePrompt(type: 'quality' | 'style'): Promise<void> {
    const inputText = (document.getElementById('inputText') as HTMLTextAreaElement)?.value;
    const outputText = document.getElementById('outputText') as HTMLTextAreaElement;

    if (!inputText?.trim()) {
      this.showNotification('強化するプロンプトを入力してください', 'warning');
      return;
    }

    if (!this.apiKey) {
      this.showNotification('プロンプト強化にはAPIキーが必要です', 'warning');
      return;
    }

    if (!outputText) return;

    // Show loading state
    outputText.value = 'プロンプト強化中...';

    try {
      const result = await TranslationAPI.enhancePrompt(inputText, type, this.apiKey);
      
      outputText.value = result.translated;
      this.showNotification(`✨ プロンプト${type === 'quality' ? '品質' : 'スタイル'}強化完了`, 'success');

    } catch (error) {
      console.error('Enhancement error:', error);
      outputText.value = inputText; // Fallback
      this.showNotification('プロンプト強化エラーが発生しました', 'error');
    }
  }

  /**
   * 設定をエクスポート
   */
  public exportSettings(): void {
    const config = systemPromptsManager.getConfig();
    const exportData = {
      systemPrompts: config,
      apiKey: this.apiKey ? '[SAVED]' : '', // APIキーは実際の値は含めない
      settings: {
        currentTab: this.currentTab,
        autoTranslate: localStorage.getItem('auto-translate') === 'true'
      },
      exportDate: new Date().toISOString(),
      version: '3.0-clean'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ss-prompt-manager-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification('設定をエクスポートしました', 'success');
  }

  /**
   * 設定をインポート
   */
  public importSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            
            // Import system prompts
            if (data.systemPrompts) {
              // This would require extending systemPromptsManager
              this.showNotification('システムプロンプトの一括インポートは今後実装予定です', 'info');
            }
            
            // Import settings
            if (data.settings) {
              if (typeof data.settings.autoTranslate === 'boolean') {
                localStorage.setItem('auto-translate', data.settings.autoTranslate.toString());
                const toggle = document.getElementById('autoTranslate') as HTMLInputElement;
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
}

// Global instance
export const mainApp = MainApp.getInstance();

// Global access for HTML onclick handlers
declare global {
  interface Window {
    App: MainApp;
  }
}

window.App = mainApp;