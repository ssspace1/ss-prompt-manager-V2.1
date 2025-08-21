// SS Prompt Manager - Working Version with HTM
import React, { useState, useEffect, useRef, useCallback } from 'https://esm.sh/react@18';
import ReactDOM from 'https://esm.sh/react-dom@18/client';
import htm from 'https://esm.sh/htm@3';

// HTMをReactにバインド
const html = htm.bind(React.createElement);

// アイコンの簡易実装（実際のアイコンの代わりにテキストを使用）
const Icon = ({ name, size = 16, className = '' }) => {
  const icons = {
    Settings: '⚙️',
    Copy: '📋',
    Plus: '➕',
    Trash2: '🗑️',
    Lock: '🔒',
    Unlock: '🔓',
    ChevronUp: '▲',
    ChevronDown: '▼',
    Image: '🖼️',
    FileText: '📄',
    Palette: '🎨',
    Sparkles: '✨',
    RefreshCw: '🔄',
    X: '❌',
    Paste: '📋'
  };
  
  return html`<span className=${className} style=${{ fontSize: size + 'px' }}>${icons[name] || '?'}</span>`;
};

// ユーティリティ関数
const cn = (...classes) => classes.filter(Boolean).join(' ');

// カテゴリの色定義
const categoryColors = {
  person: 'bg-yellow-100 border-yellow-400',
  appearance: 'bg-blue-100 border-blue-400',
  clothing: 'bg-pink-100 border-pink-400',
  pose: 'bg-purple-100 border-purple-400',
  background: 'bg-green-100 border-green-400',
  quality: 'bg-orange-100 border-orange-400',
  style: 'bg-yellow-100 border-yellow-500',
  other: 'bg-gray-100 border-gray-400'
};

// メインアプリケーション
const App = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputFormat, setOutputFormat] = useState('sdxl');
  const [model, setModel] = useState('gpt-4');

  // ペースト機能
  const handlePaste = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        const text = await navigator.clipboard.readText();
        setInputText(text);
      } else {
        alert('ペーストを実行するには、テキスト入力欄で Ctrl+V (Mac: Cmd+V) を使用してください。');
      }
    } catch (err) {
      console.error('ペーストエラー:', err);
      alert('ペーストに失敗しました。手動でペーストしてください。');
    }
  };

  // テキスト分解
  const handleSplit = () => {
    if (!inputText.trim()) return;
    
    const protectedParts = [];
    let protectedText = inputText;
    
    // 引用符と括弧内のテキストを保護
    const quotePattern = /"([^"]*)"|'([^']*)'/g;
    protectedText = protectedText.replace(quotePattern, (match) => {
      protectedParts.push(match);
      return `__PROTECTED_${protectedParts.length - 1}__`;
    });
    
    const parenPattern = /\([^)]*\)/g;
    protectedText = protectedText.replace(parenPattern, (match) => {
      protectedParts.push(match);
      return `__PROTECTED_${protectedParts.length - 1}__`;
    });
    
    const parts = protectedText.split(/[,，.。、]/).map(part => {
      let restored = part.trim();
      protectedParts.forEach((protected, index) => {
        restored = restored.replace(`__PROTECTED_${index}__`, protected);
      });
      return restored;
    }).filter(part => part);
    
    const newBlocks = parts.map((part, index) => ({
      id: Date.now() + index,
      en: part,
      ja: part,
      weight: 1.0,
      category: 'other',
      locked: false
    }));
    
    setBlocks(newBlocks);
  };

  // AI色分け
  const handleAIColorize = async () => {
    if (blocks.length === 0) return;
    
    try {
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlocks(data.blocks);
      }
    } catch (error) {
      console.error('AI色分けエラー:', error);
    }
  };

  // AI生成
  const handleAIGenerate = async () => {
    if (!inputText.trim()) {
      alert('プロンプトを入力してください');
      return;
    }
    
    const qualityTags = ['masterpiece', 'best quality', 'detailed', '8k resolution'];
    const styleTags = ['professional lighting', 'sharp focus'];
    
    const protectedParts = [];
    let protectedText = inputText;
    
    const quotePattern = /"([^"]*)"|'([^']*)'/g;
    protectedText = protectedText.replace(quotePattern, (match) => {
      protectedParts.push(match);
      return `__PROTECTED_${protectedParts.length - 1}__`;
    });
    
    const parenPattern = /\([^)]*\)/g;
    protectedText = protectedText.replace(parenPattern, (match) => {
      protectedParts.push(match);
      return `__PROTECTED_${protectedParts.length - 1}__`;
    });
    
    const parts = protectedText.split(/[,，.。、]/).map(part => {
      let restored = part.trim();
      protectedParts.forEach((protected, index) => {
        restored = restored.replace(`__PROTECTED_${index}__`, protected);
      });
      return restored;
    }).filter(part => part);
    
    const allParts = [...qualityTags, ...parts, ...styleTags];
    
    const newBlocks = allParts.map((part, index) => ({
      id: Date.now() + index,
      en: part,
      ja: part,
      weight: qualityTags.includes(part) ? 1.2 : 1.0,
      category: 'other',
      locked: false
    }));
    
    setBlocks(newBlocks);
    setTimeout(() => handleAIColorize(), 100);
  };

  // 完成プロンプトの生成
  const generateFinalPrompt = () => {
    if (blocks.length === 0) return '';
    
    if (outputFormat === 'sdxl') {
      return blocks.map(block => {
        const tag = block.en;
        if (block.weight !== 1.0) {
          return `(${tag}:${block.weight.toFixed(2)})`;
        }
        return tag;
      }).join(', ');
    } else if (outputFormat === 'flux') {
      return blocks.map(block => block.en).join('. ') + '.';
    } else {
      return blocks.map(block => block.en).join(' ');
    }
  };

  // コピー機能
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        const notification = document.createElement('div');
        notification.textContent = 'コピーしました!';
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:10px 20px;border-radius:5px;z-index:9999;';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        alert('コピーしました！');
      }
    } catch (err) {
      console.error('コピーエラー:', err);
      alert('コピーに失敗しました。');
    }
  };

  // ブロックコンポーネント
  const TagBlock = ({ block, onUpdate, onDelete, onWeightChange, language }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(block[language]);
    
    const handleSave = () => {
      if (editValue.trim()) {
        onUpdate(block.id, { [language]: editValue.trim() });
      }
      setIsEditing(false);
    };
    
    return html`
      <div className=${cn('block-card p-3 border-2 rounded-lg mb-2', categoryColors[block.category] || categoryColors.other)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            ${isEditing ? html`
              <div className="flex gap-1">
                <input
                  type="text"
                  value=${editValue}
                  onChange=${(e) => setEditValue(e.target.value)}
                  onKeyDown=${(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') {
                      setEditValue(block[language]);
                      setIsEditing(false);
                    }
                  }}
                  className="flex-1 px-2 py-1 border rounded"
                  autoFocus
                />
                <button onClick=${handleSave} className="text-green-600 hover:text-green-800">✓</button>
                <button onClick=${() => { setEditValue(block[language]); setIsEditing(false); }} className="text-red-600 hover:text-red-800">✗</button>
              </div>
            ` : html`
              <div onClick=${() => setIsEditing(true)} className="cursor-text hover:bg-white/50 px-2 py-1 rounded">
                ${block[language]}
              </div>
            `}
          </div>
          
          <div className="flex items-center gap-1">
            <button onClick=${() => onWeightChange(block.id, Math.min(2, block.weight + 0.05))} className="text-gray-600 hover:text-gray-800">
              <${Icon} name="ChevronUp" size=${16} />
            </button>
            <span className="text-sm font-mono w-10 text-center">${block.weight.toFixed(2)}</span>
            <button onClick=${() => onWeightChange(block.id, Math.max(0.1, block.weight - 0.05))} className="text-gray-600 hover:text-gray-800">
              <${Icon} name="ChevronDown" size=${16} />
            </button>
            <button onClick=${() => onDelete(block.id)} className="text-red-600 hover:text-red-800 ml-2">
              <${Icon} name="Trash2" size=${16} />
            </button>
          </div>
        </div>
      </div>
    `;
  };

  const updateBlock = (id, updates) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const changeWeight = (id, newWeight) => {
    updateBlock(id, { weight: newWeight });
  };

  return html`
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">SS Prompt Manager</h1>
          <button onClick=${() => setIsSettingsOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <${Icon} name="Settings" size=${24} />
          </button>
        </div>
      </header>
      
      <div className="p-4">
        <div className="split-view">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <textarea
                value=${inputText}
                onChange=${(e) => setInputText(e.target.value)}
                placeholder="プロンプトを入力..."
                className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex gap-2 mt-3 flex-wrap">
                <button onClick=${handlePaste} className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-2">
                  <${Icon} name="Paste" />
                  ペースト
                </button>
                <button onClick=${handleSplit} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  分解
                </button>
                <button onClick=${handleAIColorize} className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-2">
                  <${Icon} name="Palette" />
                  AI色分け
                </button>
                <button onClick=${() => { setInputText(''); setBlocks([]); }} className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
                  クリア
                </button>
                
                <div className="flex items-center gap-2 ml-auto">
                  <select value=${outputFormat} onChange=${(e) => setOutputFormat(e.target.value)} className="px-3 py-2 border rounded-lg">
                    <option value="sdxl">SDXLタグ形式</option>
                    <option value="flux">Fluxフレーズ形式</option>
                    <option value="imagefx">ImageFX形式</option>
                  </select>
                  
                  <button onClick=${handleAIGenerate} className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors flex items-center gap-2">
                    <${Icon} name="Sparkles" />
                    AI生成
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">English</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    ${blocks.map(block => html`
                      <${TagBlock}
                        key=${block.id}
                        block=${block}
                        onUpdate=${updateBlock}
                        onDelete=${deleteBlock}
                        onWeightChange=${changeWeight}
                        language="en"
                      />
                    `)}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">日本語</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    ${blocks.map(block => html`
                      <${TagBlock}
                        key=${block.id}
                        block=${block}
                        onUpdate=${updateBlock}
                        onDelete=${deleteBlock}
                        onWeightChange=${changeWeight}
                        language="ja"
                      />
                    `)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">完成プロンプト</h3>
                <button onClick=${() => copyToClipboard(generateFinalPrompt())} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2">
                  <${Icon} name="Copy" />
                  コピー
                </button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  ${generateFinalPrompt() || 'プロンプトがまだ生成されていません'}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-700 mb-3">画像生成</h3>
            <div className="space-y-3">
              <div className="p-2 bg-gray-50 rounded text-sm max-h-32 overflow-y-auto">
                ${generateFinalPrompt() || 'プロンプトなし'}
              </div>
              <button
                onClick=${async () => {
                  if (!generateFinalPrompt()) {
                    alert('プロンプトを生成してください');
                    return;
                  }
                  setIsGenerating(true);
                  try {
                    const response = await fetch('/api/generate-image', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        prompt: generateFinalPrompt(),
                        model: 'sdxl-1.0'
                      })
                    });
                    const data = await response.json();
                    setGeneratedImage(data.image?.url);
                  } catch (error) {
                    console.error('画像生成エラー:', error);
                  }
                  setIsGenerating(false);
                }}
                disabled=${isGenerating || !generateFinalPrompt()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                ${isGenerating ? html`
                  <${Icon} name="RefreshCw" className="animate-spin" />
                  生成中...
                ` : html`
                  <${Icon} name="Sparkles" />
                  生成
                `}
              </button>
              
              ${generatedImage && html`
                <div className="mt-4">
                  <img src=${generatedImage} alt="Generated" className="w-full rounded-lg shadow-lg" />
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// アプリケーションのマウント
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));