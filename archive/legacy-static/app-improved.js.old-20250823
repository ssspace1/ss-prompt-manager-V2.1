// SS Prompt Manager - Improved Version with Translation and Sync
import React, { useState, useEffect, useRef, useCallback } from 'https://esm.sh/react@18';
import ReactDOM from 'https://esm.sh/react-dom@18/client';
import htm from 'https://esm.sh/htm@3';

// HTMをReactにバインド
const html = htm.bind(React.createElement);

// アイコンコンポーネント
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
    Paste: '📋',
    Translate: '🌐',
    Brain: '🧠',
    Cut: '✂️',
    Download: '⬇️',
    Upload: '⬆️'
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

// 翻訳辞書（ローカルフォールバック用）
const translationDict = {
  // 人物
  'girl': '女の子',
  'boy': '男の子',
  'woman': '女性',
  'man': '男性',
  'person': '人物',
  'character': 'キャラクター',
  
  // 外見
  'hair': '髪',
  'eyes': '目',
  'face': '顔',
  'skin': '肌',
  'blonde hair': '金髪',
  'brown hair': '茶髪',
  'black hair': '黒髪',
  'blue eyes': '青い目',
  'green eyes': '緑の目',
  'red eyes': '赤い目',
  'smile': '笑顔',
  'beautiful': '美しい',
  'cute': 'かわいい',
  'handsome': 'ハンサム',
  
  // 服装
  'dress': 'ドレス',
  'shirt': 'シャツ',
  'pants': 'ズボン',
  'skirt': 'スカート',
  'jacket': 'ジャケット',
  'coat': 'コート',
  'shoes': '靴',
  'hat': '帽子',
  'uniform': '制服',
  'suit': 'スーツ',
  
  // ポーズ
  'standing': '立っている',
  'sitting': '座っている',
  'walking': '歩いている',
  'running': '走っている',
  'jumping': 'ジャンプ',
  'lying': '横たわっている',
  'pose': 'ポーズ',
  'holding': '持っている',
  'looking': '見ている',
  
  // 背景
  'background': '背景',
  'scenery': '風景',
  'landscape': '景色',
  'indoor': '屋内',
  'outdoor': '屋外',
  'sky': '空',
  'room': '部屋',
  'forest': '森',
  'city': '都市',
  'beach': 'ビーチ',
  'mountain': '山',
  'street': '通り',
  'building': '建物',
  'nature': '自然',
  'park': '公園',
  'sunset': '夕日',
  'night': '夜',
  'day': '昼',
  
  // 品質
  'quality': '品質',
  'masterpiece': '傑作',
  'best quality': '最高品質',
  'detailed': '詳細',
  'realistic': 'リアル',
  'high quality': '高品質',
  'professional': 'プロフェッショナル',
  '8k': '8K',
  '4k': '4K',
  'ultra detailed': '超詳細',
  
  // スタイル
  'style': 'スタイル',
  'anime': 'アニメ',
  'realistic': 'リアル',
  'cartoon': 'カートゥーン',
  'painting': '絵画',
  'illustration': 'イラスト',
  'digital art': 'デジタルアート',
  'photography': '写真',
  'cinematic': 'シネマティック',
  'artistic': 'アーティスティック'
};

// 逆引き辞書の作成
const reverseTranslationDict = Object.entries(translationDict).reduce((acc, [en, ja]) => {
  acc[ja] = en;
  return acc;
}, {});

// 翻訳キャッシュ
const translationCache = new Map();

// メインアプリケーション
const App = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputFormat, setOutputFormat] = useState('sdxl');
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [autoCategorize, setAutoCategorize] = useState(true);

  // APIキーの読み込み
  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // APIキーの保存
  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('openrouter_api_key', key);
  };

  // ローカル翻訳（フォールバック）
  const localTranslate = (text, targetLang) => {
    if (targetLang === 'ja') {
      // 英語から日本語へ
      const lowercaseText = text.toLowerCase();
      return translationDict[lowercaseText] || text;
    } else {
      // 日本語から英語へ
      return reverseTranslationDict[text] || text;
    }
  };

  // API経由での翻訳
  const translateWithAPI = async (text, sourceLang, targetLang) => {
    // キャッシュチェック
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    // API翻訳
    if (apiKey) {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            sourceLang,
            targetLang,
            model: 'openai/gpt-4o-mini',
            apiKey
          })
        });

        if (response.ok) {
          const data = await response.json();
          const translated = data.translated || text;
          translationCache.set(cacheKey, translated);
          return translated;
        }
      } catch (error) {
        console.error('API翻訳エラー:', error);
      }
    }

    // APIが使えない場合はローカル翻訳にフォールバック
    const translated = localTranslate(text, targetLang);
    translationCache.set(cacheKey, translated);
    return translated;
  };

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
  const handleSplit = async () => {
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
    
    // ブロックを作成し、必要に応じて翻訳
    const newBlocks = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(part);
      
      let enText = part;
      let jaText = part;
      
      if (autoTranslate) {
        if (isJapanese) {
          // 日本語の場合、英語に翻訳
          enText = await translateWithAPI(part, 'ja', 'en');
        } else {
          // 英語の場合、日本語に翻訳
          jaText = await translateWithAPI(part, 'en', 'ja');
        }
      }
      
      newBlocks.push({
        id: Date.now() + i,
        en: enText,
        ja: jaText,
        weight: 1.0,
        category: 'other',
        locked: false
      });
    }
    
    setBlocks(newBlocks);
    
    // 自動カテゴリ分類
    if (autoCategorize) {
      setTimeout(() => handleAIColorize(), 100);
    }
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
    
    setIsTranslating(true);
    
    try {
      // プロンプトの最適化
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputText,
          format: outputFormat,
          model: model,
          apiKey: apiKey
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const optimizedBlocks = data.blocks || [];
        
        // 各ブロックを翻訳
        const translatedBlocks = [];
        for (const block of optimizedBlocks) {
          const jaText = await translateWithAPI(block.en, 'en', 'ja');
          translatedBlocks.push({
            ...block,
            id: Date.now() + Math.random(),
            ja: jaText
          });
        }
        
        setBlocks(translatedBlocks);
        
        // カテゴリ分類
        if (autoCategorize) {
          setTimeout(() => handleAIColorize(), 100);
        }
      }
    } catch (error) {
      console.error('AI生成エラー:', error);
      alert('AI生成に失敗しました');
    } finally {
      setIsTranslating(false);
    }
  };

  // 新しいタグを追加
  const addNewTag = async (language, value) => {
    if (!value.trim()) return;
    
    const isJapanese = language === 'ja';
    let enText = value;
    let jaText = value;
    
    if (autoTranslate) {
      if (isJapanese) {
        enText = await translateWithAPI(value, 'ja', 'en');
      } else {
        jaText = await translateWithAPI(value, 'en', 'ja');
      }
    }
    
    const newBlock = {
      id: Date.now(),
      en: enText,
      ja: jaText,
      weight: 1.0,
      category: 'other',
      locked: false
    };
    
    setBlocks([...blocks, newBlock]);
    
    // カテゴリ分類
    if (autoCategorize) {
      setTimeout(() => {
        handleAIColorize();
      }, 100);
    }
  };

  // ブロックの更新（翻訳連動）
  const updateBlock = async (id, updates) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    
    let newUpdates = { ...updates };
    
    // 片方の言語が更新されたら、もう片方も翻訳
    if (autoTranslate) {
      if (updates.en !== undefined && updates.en !== block.en) {
        const jaText = await translateWithAPI(updates.en, 'en', 'ja');
        newUpdates.ja = jaText;
      } else if (updates.ja !== undefined && updates.ja !== block.ja) {
        const enText = await translateWithAPI(updates.ja, 'ja', 'en');
        newUpdates.en = enText;
      }
    }
    
    setBlocks(blocks.map(b => 
      b.id === id ? { ...b, ...newUpdates } : b
    ));
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const changeWeight = (id, newWeight) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, weight: newWeight } : block
    ));
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
        showNotification('コピーしました!');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        showNotification('コピーしました!');
      }
    } catch (err) {
      console.error('コピーエラー:', err);
      alert('コピーに失敗しました。');
    }
  };

  // 通知表示
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:10px 20px;border-radius:5px;z-index:9999;animation:slideIn 0.3s;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  // ブロックコンポーネント
  const TagBlock = ({ block, onUpdate, onDelete, onWeightChange, language }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(block[language]);
    
    const handleSave = async () => {
      if (editValue.trim()) {
        await onUpdate(block.id, { [language]: editValue.trim() });
      }
      setIsEditing(false);
    };
    
    return html`
      <div className=${cn('block-card p-3 border-2 rounded-lg mb-2 transition-all', categoryColors[block.category] || categoryColors.other)}>
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
              <${Icon} name="ChevronUp" size=${14} />
            </button>
            <span className="text-sm font-mono w-10 text-center">${block.weight.toFixed(2)}</span>
            <button onClick=${() => onWeightChange(block.id, Math.max(0.1, block.weight - 0.05))} className="text-gray-600 hover:text-gray-800">
              <${Icon} name="ChevronDown" size=${14} />
            </button>
            <button onClick=${() => onDelete(block.id)} className="text-red-600 hover:text-red-800 ml-2">
              <${Icon} name="Trash2" size=${14} />
            </button>
          </div>
        </div>
      </div>
    `;
  };

  // 新規タグ追加コンポーネント
  const AddTagInput = ({ language }) => {
    const [value, setValue] = useState('');
    
    const handleAdd = async () => {
      if (value.trim()) {
        await addNewTag(language, value);
        setValue('');
      }
    };
    
    return html`
      <div className="flex gap-1 mb-3">
        <input
          type="text"
          value=${value}
          onChange=${(e) => setValue(e.target.value)}
          onKeyDown=${(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder=${language === 'en' ? 'Add new tag...' : '新しいタグを追加...'}
          className="flex-1 px-2 py-1 text-sm border rounded"
        />
        <button onClick=${handleAdd} className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          <${Icon} name="Plus" size=${12} />
        </button>
      </div>
    `;
  };

  return html`
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">SS Prompt Manager</h1>
          <div className="flex items-center gap-3">
            ${apiKey ? html`
              <span className="text-sm text-green-600">✓ API接続済み</span>
            ` : html`
              <span className="text-sm text-orange-600">⚠ APIキー未設定</span>
            `}
            <button onClick=${() => setIsSettingsOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <${Icon} name="Settings" size=${24} />
            </button>
          </div>
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
                <button onClick=${handleSplit} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                  <${Icon} name="Cut" />
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
                  
                  <button 
                    onClick=${handleAIGenerate} 
                    disabled=${isTranslating}
                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <${Icon} name="Sparkles" />
                    ${isTranslating ? '生成中...' : 'AI生成'}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 mt-3 text-sm">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked=${autoTranslate}
                    onChange=${(e) => setAutoTranslate(e.target.checked)}
                    className="rounded"
                  />
                  <span>自動翻訳</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked=${autoCategorize}
                    onChange=${(e) => setAutoCategorize(e.target.checked)}
                    className="rounded"
                  />
                  <span>自動カテゴリ分類</span>
                </label>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <${Icon} name="Translate" size=${18} />
                    English
                  </h3>
                  <${AddTagInput} language="en" />
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
                  <h3 className="font-semibold text-gray-700 mb-3">
                    🇯🇵 日本語
                  </h3>
                  <${AddTagInput} language="ja" />
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
      
      ${isSettingsOpen && html`
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick=${(e) => {
          if (e.target === e.currentTarget) setIsSettingsOpen(false);
        }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">設定</h2>
              <button onClick=${() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <${Icon} name="X" size=${24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">OpenRouter APIキー</label>
                <input
                  type="password"
                  value=${apiKey}
                  onChange=${(e) => saveApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <a href="https://openrouter.ai/keys" target="_blank" className="text-blue-500 hover:underline">
                    OpenRouterでAPIキーを取得
                  </a>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">AIモデル</label>
                <select
                  value=${model}
                  onChange=${(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (高速・安価)</option>
                  <option value="gpt-4o">GPT-4o (高品質)</option>
                  <option value="claude-3-haiku">Claude 3 Haiku (高速)</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet (バランス)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick=${() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
};

// アプリケーションのマウント
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));