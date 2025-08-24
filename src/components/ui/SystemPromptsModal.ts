// SS Prompt Manager - System Prompts Modal UI Component
// システムプロンプト編集モーダル UI コンポーネント

import { SystemPromptsManager, SystemPrompt, SystemPromptsConfig } from '../../core/config/systemPrompts';

/**
 * システムプロンプト編集モーダルクラス
 * UI設定からAI指示を編集、プレビュー、復元する機能を提供
 */
export class SystemPromptsModal {
  private manager: SystemPromptsManager;
  private modal: HTMLElement | null = null;
  private currentEditingPrompt: SystemPrompt | null = null;
  private onSaveCallback: (() => void) | null = null;

  constructor() {
    this.manager = SystemPromptsManager.getInstance();
  }

  /**
   * モーダルを表示
   */
  public show(onSave?: () => void): void {
    this.onSaveCallback = onSave || null;
    this.createModal();
    this.populatePrompts();
    document.body.appendChild(this.modal!);
    this.modal!.style.display = 'flex';
  }

  /**
   * モーダルを非表示
   */
  public hide(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    this.currentEditingPrompt = null;
  }

  /**
   * モーダルHTMLを作成
   */
  private createModal(): void {
    this.modal = document.createElement('div');
    this.modal.id = 'systemPromptsModal';
    this.modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    this.modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden flex flex-col">
        <!-- ヘッダー -->
        <div class="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 class="text-xl font-bold">🤖 AI指示システム設定</h2>
          <button id="closeModalBtn" class="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>
        
        <!-- メインコンテンツ -->
        <div class="flex-1 flex overflow-hidden">
          <!-- 左パネル: プロンプト一覧 -->
          <div class="w-1/3 border-r bg-gray-50 overflow-y-auto">
            <div class="p-4">
              <h3 class="font-bold text-gray-700 mb-3">📝 プロンプト一覧</h3>
              
              <!-- 翻訳プロンプト -->
              <div class="mb-4">
                <h4 class="font-semibold text-sm text-blue-600 mb-2">🌐 翻訳設定</h4>
                <div id="translationPrompts" class="space-y-1"></div>
              </div>
              
              <!-- 強化プロンプト -->
              <div class="mb-4">
                <h4 class="font-semibold text-sm text-green-600 mb-2">✨ 強化設定</h4>
                <div id="enhancementPrompts" class="space-y-1"></div>
              </div>
              
              <!-- カスタムプロンプト -->
              <div class="mb-4">
                <h4 class="font-semibold text-sm text-purple-600 mb-2">🎯 カスタム設定</h4>
                <div id="customPrompts" class="space-y-1"></div>
                <button id="addCustomBtn" class="mt-2 w-full bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600">
                  + カスタム追加
                </button>
              </div>
            </div>
          </div>
          
          <!-- 右パネル: プロンプト編集 -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <div class="p-4 border-b">
              <div class="flex justify-between items-center">
                <div>
                  <h3 id="editTitle" class="font-bold text-gray-700">プロンプトを選択してください</h3>
                  <p id="editDescription" class="text-sm text-gray-500 mt-1"></p>
                </div>
                <div class="flex gap-2">
                  <button id="previewBtn" class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 disabled:opacity-50" disabled>
                    👁️ プレビュー
                  </button>
                  <button id="restoreBtn" class="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:opacity-50" disabled>
                    🔄 デフォルト復元
                  </button>
                </div>
              </div>
            </div>
            
            <div class="flex-1 p-4 overflow-y-auto">
              <div id="noSelection" class="text-center text-gray-500 mt-8">
                <div class="text-4xl mb-4">🤖</div>
                <p>左のリストからプロンプトを選択して編集を開始してください</p>
                <p class="text-sm mt-2">AI指示を自由に編集し、デフォルト復元機能で安全に管理できます</p>
              </div>
              
              <div id="editPanel" class="hidden">
                <label class="block mb-2">
                  <span class="text-sm font-medium text-gray-700">プロンプト名:</span>
                  <input id="promptName" type="text" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                </label>
                
                <label class="block mb-4">
                  <span class="text-sm font-medium text-gray-700">説明:</span>
                  <input id="promptDescription" type="text" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="このプロンプトの用途を説明...">
                </label>
                
                <label class="block mb-4">
                  <span class="text-sm font-medium text-gray-700">プロンプト内容:</span>
                  <textarea id="promptContent" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-64 font-mono" placeholder="AI指示をここに入力..."></textarea>
                  <div class="text-xs text-gray-500 mt-1">
                    <span id="contentLength">0</span> / 10000 文字
                  </div>
                </label>
                
                <div class="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                  <strong>💡 ヒント:</strong>
                  <ul class="mt-1 space-y-1">
                    <li>• 明確で具体的な指示を書きましょう</li>
                    <li>• 例文を含めると精度が向上します</li>
                    <li>• 出力形式を明確に指定してください</li>
                  </ul>
                </div>
              </div>
              
              <div id="previewPanel" class="hidden">
                <h4 class="font-bold mb-2">🔍 プレビュー</h4>
                <div id="previewContent" class="bg-gray-50 p-3 rounded border text-sm font-mono whitespace-pre-wrap"></div>
                <button id="closePreviewBtn" class="mt-3 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- フッター -->
        <div class="border-t p-4 flex justify-between items-center bg-gray-50">
          <div class="flex gap-2">
            <button id="restoreAllBtn" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              🚨 全設定をデフォルトに復元
            </button>
            <button id="exportBtn" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              📤 設定をエクスポート
            </button>
          </div>
          <div class="flex gap-2">
            <button id="cancelBtn" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
              キャンセル
            </button>
            <button id="saveBtn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              💾 保存して適用
            </button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    if (!this.modal) return;

    // 閉じるボタン
    this.modal.querySelector('#closeModalBtn')?.addEventListener('click', () => this.hide());
    this.modal.querySelector('#cancelBtn')?.addEventListener('click', () => this.hide());

    // 保存ボタン
    this.modal.querySelector('#saveBtn')?.addEventListener('click', () => this.saveChanges());

    // 全復元ボタン
    this.modal.querySelector('#restoreAllBtn')?.addEventListener('click', () => this.restoreAll());

    // プレビューボタン
    this.modal.querySelector('#previewBtn')?.addEventListener('click', () => this.showPreview());
    this.modal.querySelector('#closePreviewBtn')?.addEventListener('click', () => this.hidePreview());

    // 復元ボタン
    this.modal.querySelector('#restoreBtn')?.addEventListener('click', () => this.restoreCurrentPrompt());

    // カスタム追加ボタン
    this.modal.querySelector('#addCustomBtn')?.addEventListener('click', () => this.addCustomPrompt());

    // 入力フィールドの変更監視
    const promptContent = this.modal.querySelector('#promptContent') as HTMLTextAreaElement;
    promptContent?.addEventListener('input', () => this.updateContentLength());

    // モーダル外クリックで閉じる
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
  }

  /**
   * プロンプト一覧を表示
   */
  private populatePrompts(): void {
    const config = this.manager.getConfig();
    
    // 翻訳プロンプト
    const translationContainer = this.modal!.querySelector('#translationPrompts')!;
    translationContainer.innerHTML = '';
    Object.values(config.translation).forEach(prompt => {
      this.addPromptItem(translationContainer, prompt);
    });

    // 強化プロンプト
    const enhancementContainer = this.modal!.querySelector('#enhancementPrompts')!;
    enhancementContainer.innerHTML = '';
    Object.values(config.enhancement).forEach(prompt => {
      this.addPromptItem(enhancementContainer, prompt);
    });

    // カスタムプロンプト
    const customContainer = this.modal!.querySelector('#customPrompts')!;
    customContainer.innerHTML = '';
    config.custom.forEach(prompt => {
      this.addPromptItem(customContainer, prompt, true);
    });
  }

  /**
   * プロンプト項目を追加
   */
  private addPromptItem(container: Element, prompt: SystemPrompt, isDeletable = false): void {
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-2 rounded hover:bg-white cursor-pointer border';
    item.innerHTML = `
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-gray-900 truncate">${prompt.name}</div>
        <div class="text-xs text-gray-500 truncate">${prompt.description || ''}</div>
      </div>
      ${isDeletable ? '<button class="text-red-500 hover:text-red-700 text-sm ml-2" title="削除">🗑️</button>' : ''}
      ${prompt.isDefault ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">標準</span>' : ''}
    `;

    item.addEventListener('click', (e) => {
      if ((e.target as Element).closest('button')) {
        // 削除ボタンがクリックされた場合
        this.deleteCustomPrompt(prompt.id);
        return;
      }
      this.selectPrompt(prompt);
    });

    container.appendChild(item);
  }

  /**
   * プロンプトを選択
   */
  private selectPrompt(prompt: SystemPrompt): void {
    this.currentEditingPrompt = { ...prompt };
    
    // UI更新
    (this.modal!.querySelector('#editTitle') as HTMLElement).textContent = prompt.name;
    (this.modal!.querySelector('#editDescription') as HTMLElement).textContent = prompt.description || '';
    (this.modal!.querySelector('#promptName') as HTMLInputElement).value = prompt.name;
    (this.modal!.querySelector('#promptDescription') as HTMLInputElement).value = prompt.description || '';
    (this.modal!.querySelector('#promptContent') as HTMLTextAreaElement).value = prompt.content;
    
    // パネル表示切り替え
    this.modal!.querySelector('#noSelection')!.classList.add('hidden');
    this.modal!.querySelector('#editPanel')!.classList.remove('hidden');
    this.modal!.querySelector('#previewPanel')!.classList.add('hidden');
    
    // ボタン有効化
    (this.modal!.querySelector('#previewBtn') as HTMLButtonElement).disabled = false;
    (this.modal!.querySelector('#restoreBtn') as HTMLButtonElement).disabled = !prompt.isDefault;
    
    this.updateContentLength();
  }

  /**
   * 文字数を更新
   */
  private updateContentLength(): void {
    const content = (this.modal!.querySelector('#promptContent') as HTMLTextAreaElement).value;
    const lengthDisplay = this.modal!.querySelector('#contentLength') as HTMLElement;
    lengthDisplay.textContent = content.length.toString();
    
    if (content.length > 10000) {
      lengthDisplay.style.color = 'red';
    } else {
      lengthDisplay.style.color = '';
    }
  }

  /**
   * プレビューを表示
   */
  private showPreview(): void {
    const content = (this.modal!.querySelector('#promptContent') as HTMLTextAreaElement).value;
    (this.modal!.querySelector('#previewContent') as HTMLElement).textContent = content;
    
    this.modal!.querySelector('#editPanel')!.classList.add('hidden');
    this.modal!.querySelector('#previewPanel')!.classList.remove('hidden');
  }

  /**
   * プレビューを隠す
   */
  private hidePreview(): void {
    this.modal!.querySelector('#previewPanel')!.classList.add('hidden');
    this.modal!.querySelector('#editPanel')!.classList.remove('hidden');
  }

  /**
   * 現在のプロンプトを復元
   */
  private restoreCurrentPrompt(): void {
    if (!this.currentEditingPrompt) return;
    
    if (confirm('このプロンプトをデフォルト設定に復元しますか？')) {
      this.manager.restoreToDefault(this.currentEditingPrompt.category, this.currentEditingPrompt.id);
      this.populatePrompts();
      this.selectPrompt(this.manager.getConfig().translation.japanese); // 適切なプロンプトを再選択
    }
  }

  /**
   * 全設定を復元
   */
  private restoreAll(): void {
    if (confirm('⚠️ 全てのカスタム設定が失われます。本当にデフォルト設定に復元しますか？')) {
      this.manager.restoreAllToDefaults();
      this.populatePrompts();
      this.currentEditingPrompt = null;
      this.modal!.querySelector('#editPanel')!.classList.add('hidden');
      this.modal!.querySelector('#noSelection')!.classList.remove('hidden');
    }
  }

  /**
   * カスタムプロンプトを追加
   */
  private addCustomPrompt(): void {
    const name = prompt('カスタムプロンプト名を入力してください:', 'カスタムプロンプト');
    if (!name) return;

    const id = this.manager.addCustomPrompt({
      name,
      content: 'ここにカスタムプロンプトを入力してください...',
      isDefault: false,
      category: 'custom',
      description: 'カスタムプロンプト'
    });

    this.populatePrompts();
    
    // 新しく作成されたプロンプトを選択
    const newPrompt = this.manager.getConfig().custom.find(p => p.id === id);
    if (newPrompt) {
      this.selectPrompt(newPrompt);
    }
  }

  /**
   * カスタムプロンプトを削除
   */
  private deleteCustomPrompt(id: string): void {
    if (confirm('このカスタムプロンプトを削除しますか？')) {
      this.manager.deletePrompt('custom', id);
      this.populatePrompts();
      
      if (this.currentEditingPrompt?.id === id) {
        this.currentEditingPrompt = null;
        this.modal!.querySelector('#editPanel')!.classList.add('hidden');
        this.modal!.querySelector('#noSelection')!.classList.remove('hidden');
      }
    }
  }

  /**
   * 変更を保存
   */
  private saveChanges(): void {
    if (!this.currentEditingPrompt) {
      // 設定変更がない場合も保存を実行
      if (this.onSaveCallback) {
        this.onSaveCallback();
      }
      this.hide();
      return;
    }

    // 入力値を取得
    const name = (this.modal!.querySelector('#promptName') as HTMLInputElement).value.trim();
    const description = (this.modal!.querySelector('#promptDescription') as HTMLInputElement).value.trim();
    const content = (this.modal!.querySelector('#promptContent') as HTMLTextAreaElement).value.trim();

    if (!name || !content) {
      alert('プロンプト名と内容は必須です');
      return;
    }

    if (content.length > 10000) {
      alert('プロンプト内容が長すぎます (最大10000文字)');
      return;
    }

    // 更新
    this.manager.updatePrompt(this.currentEditingPrompt.category, this.currentEditingPrompt.id, {
      name,
      description,
      content
    });

    // 保存コールバック実行
    if (this.onSaveCallback) {
      this.onSaveCallback();
    }

    this.hide();
    alert('✅ AI指示設定が保存されました。変更は即座に適用されます。');
  }
}

// グローバルアクセス用
declare global {
  interface Window {
    systemPromptsModal: SystemPromptsModal;
  }
}

export const systemPromptsModal = new SystemPromptsModal();
window.systemPromptsModal = systemPromptsModal;