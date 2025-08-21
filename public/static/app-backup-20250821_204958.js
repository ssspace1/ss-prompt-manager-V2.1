// SS Prompt Manager - Main Application
import React, { useState, useEffect, useRef, useCallback } from 'https://esm.sh/react@18';
import ReactDOM from 'https://esm.sh/react-dom@18/client';
import { Settings, Copy, Plus, Trash2, Lock, Unlock, ChevronUp, ChevronDown, Image, FileText, Palette, Sparkles, RefreshCw, X } from 'https://esm.sh/lucide-react@0.263.1';

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

// デバウンス用Hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// ローカルストレージ用Hook
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
};

// タグブロックコンポーネント
const TagBlock = ({ block, onUpdate, onDelete, onWeightChange, language }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(block[language]);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(block[language]);
  };
  
  const handleSave = () => {
    if (editValue.trim()) {
      onUpdate(block.id, { [language]: editValue.trim() });
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditValue(block[language]);
    setIsEditing(false);
  };
  
  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('blockId', block.id);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  return (
    <div
      className={cn(
        'block-card p-3 border-2 rounded-lg mb-2',
        categoryColors[block.category] || categoryColors.other,
        isDragging && 'dragging',
        'cursor-move'
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-category={block.category}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="tag-input flex-1 px-2 py-1 border rounded"
                autoFocus
              />
              <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                <i className="fas fa-check"></i>
              </button>
              <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
                <i className="fas fa-times"></i>
              </button>
            </div>
          ) : (
            <div onClick={handleEdit} className="cursor-text hover:bg-white/50 px-2 py-1 rounded">
              {block[language]}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onWeightChange(block.id, Math.min(2, block.weight + 0.05))}
            className="text-gray-600 hover:text-gray-800"
          >
            React.createElement(ChevronUp, { size: 16 })
          </button>
          <span className="text-sm font-mono w-10 text-center">{block.weight.toFixed(2)}</span>
          <button
            onClick={() => onWeightChange(block.id, Math.max(0.1, block.weight - 0.05))}
            className="text-gray-600 hover:text-gray-800"
          >
            React.createElement(ChevronDown, { size: 16 })
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="text-red-600 hover:text-red-800 ml-2"
          >
            React.createElement(Trash2, { size: 16 })
          </button>
        </div>
      </div>
    </div>
  );
};

// 設定モーダルコンポーネント
const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">設定</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            React.createElement(X, { size: 24 })
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">API設定</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="OpenRouter API Key"
                value={settings.openRouterKey || ''}
                onChange={(e) => onSettingsChange({ ...settings, openRouterKey: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="画像生成API エンドポイント"
                value={settings.imageApiEndpoint || ''}
                onChange={(e) => onSettingsChange({ ...settings, imageApiEndpoint: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">出力形式</h3>
            <select
              value={settings.outputFormat || 'sdxl'}
              onChange={(e) => onSettingsChange({ ...settings, outputFormat: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="sdxl">SDXL タグ形式</option>
              <option value="flux">Flux フレーズ形式</option>
              <option value="imagefx">ImageFX 命令形式</option>
            </select>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">モデル選択</h3>
            <select
              value={settings.model || 'gpt-4'}
              onChange={(e) => onSettingsChange({ ...settings, model: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// メインアプリケーションコンポーネント
const App = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [newTagInput, setNewTagInput] = useState({ en: '', ja: '' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage('ss-prompt-settings', {
    outputFormat: 'sdxl',
    model: 'gpt-4',
    openRouterKey: '',
    imageApiEndpoint: ''
  });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // クリップボードからペースト
  const handlePaste = async () => {
    try {
      // Clipboard APIを使用
      if (navigator.clipboard && window.isSecureContext) {
        const text = await navigator.clipboard.readText();
        setInputText(text);
      } else {
        // フォールバック: プロンプトを表示
        alert('ペーストを実行するには、テキスト入力欄で Ctrl+V (Mac: Cmd+V) を使用してください。');
      }
    } catch (err) {
      console.error('ペーストエラー:', err);
      // セキュリティ制限の場合の処理
      if (err.name === 'NotAllowedError') {
        alert('ブラウザのセキュリティ設定により、ペーストボタンは使用できません。\nテキスト入力欄をクリックして、Ctrl+V (Mac: Cmd+V) でペーストしてください。');
      } else {
        alert('ペーストに失敗しました。手動でペーストしてください。');
      }
    }
  };
  
  // テキストを分解してブロック化（改善版：引用符と括弧内のカンマを保護）
  const handleSplit = () => {
    if (!inputText.trim()) return;
    
    // 引用符と括弧内のテキストを一時的に保護
    const protectedParts = [];
    let protectedText = inputText;
    
    // 引用符で囲まれた部分を保護
    const quotePattern = /"([^"]*)"|'([^']*)'/g;
    protectedText = protectedText.replace(quotePattern, (match) => {
      protectedParts.push(match);
      return `__PROTECTED_${protectedParts.length - 1}__`;
    });
    
    // 括弧内の部分を保護
    const parenPattern = /\([^)]*\)/g;
    protectedText = protectedText.replace(parenPattern, (match) => {
      protectedParts.push(match);
      return `__PROTECTED_${protectedParts.length - 1}__`;
    });
    
    // カンマと句読点で分割
    const parts = protectedText.split(/[,，.。、]/).map(part => {
      let restored = part.trim();
      // 保護した部分を復元
      protectedParts.forEach((protected, index) => {
        restored = restored.replace(`__PROTECTED_${index}__`, protected);
      });
      return restored;
    }).filter(part => part);
    
    const newBlocks = parts.map((part, index) => ({
      id: Date.now() + index,
      en: part,
      ja: part, // 初期値は同じ、後で翻訳
      weight: 1.0,
      category: 'other',
      locked: false
    }));
    
    setBlocks(newBlocks);
  };
  
  // AI色分け（APIを使用）
  const handleAIColorize = async () => {
    if (blocks.length === 0) return;
    
    try {
      const response = await axios.post('/api/categorize', {
        blocks: blocks
      });
      
      if (response.data && response.data.blocks) {
        setBlocks(response.data.blocks);
      }
    } catch (error) {
      console.error('AI色分けエラー:', error);
      
      // フォールバック：ローカルでの簡易分類
      const categoryKeywords = {
        person: ['girl', 'boy', 'woman', 'man', 'person', 'child', 'adult', 'teen', 'people', 'character', 'face', 'human'],
        appearance: ['hair', 'eyes', 'skin', 'tall', 'short', 'young', 'old', 'beautiful', 'cute', 'handsome', 'pretty', 'facial', 'expression', 'smile'],
        clothing: ['dress', 'shirt', 'pants', 'skirt', 'jacket', 'coat', 'shoes', 'hat', 'uniform', 'clothes', 'wearing', 'outfit', 'costume'],
        pose: ['sitting', 'standing', 'walking', 'running', 'jumping', 'lying', 'pose', 'posture', 'action', 'gesture', 'holding', 'looking'],
        background: ['background', 'scenery', 'landscape', 'indoor', 'outdoor', 'sky', 'room', 'forest', 'city', 'beach', 'mountain', 'street'],
        quality: ['masterpiece', 'quality', 'resolution', 'detailed', 'realistic', 'hd', '4k', '8k', 'high quality', 'best quality', 'professional'],
        style: ['anime', 'realistic', 'cartoon', 'painting', 'illustration', 'digital', 'art', 'style', 'artistic', 'cinematic', 'photography']
      };
      
      const colorizedBlocks = blocks.map(block => {
        const text = block.en.toLowerCase();
        let detectedCategory = 'other';
        let maxScore = 0;
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
          let score = 0;
          for (const keyword of keywords) {
            if (text.includes(keyword)) {
              score += keyword.length;
            }
          }
          if (score > maxScore) {
            maxScore = score;
            detectedCategory = category;
          }
        }
        
        return {
          ...block,
          category: detectedCategory
        };
      });
      
      setBlocks(colorizedBlocks);
    }
  };
  
  // AI生成（入力欄を保護）
  const handleAIGenerate = async () => {
    if (!inputText.trim()) {
      alert('プロンプトを入力してください');
      return;
    }
    
    // 重要: 入力欄は変更せず、ブロックを直接生成
    // setInputTextを呼ばないことを確認
    const basePrompt = inputText.trim();
    console.log('AI生成: 入力欄の値を保持します:', basePrompt);
    
    // 品質向上のための基本的な拡張タグ
    const qualityTags = ['masterpiece', 'best quality', 'detailed', '8k resolution'];
    const styleTags = ['professional lighting', 'sharp focus'];
    
    // 既存のプロンプトを分解
    const tempText = inputText;
    const protectedParts = [];
    let protectedText = tempText;
    
    // 引用符で囲まれた部分を保護
    const quotePattern = /"([^"]*)"|'([^']*)'/g;
    protectedText = protectedText.replace(quotePattern, (match) => {
      protectedParts.push(match);
      return `__PROTECTED_${protectedParts.length - 1}__`;
    });
    
    // 括弧内の部分を保護
    const parenPattern = /\([^)]*\)/g;
    protectedText = protectedText.replace(parenPattern, (match) => {
      protectedParts.push(match);
      return `__PROTECTED_${protectedParts.length - 1}__`;
    });
    
    // カンマと句読点で分割
    const parts = protectedText.split(/[,，.。、]/).map(part => {
      let restored = part.trim();
      protectedParts.forEach((protected, index) => {
        restored = restored.replace(`__PROTECTED_${index}__`, protected);
      });
      return restored;
    }).filter(part => part);
    
    // 品質タグとメインコンテンツを組み合わせ
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
    
    // 自動的に色分けも実行
    setTimeout(() => handleAIColorize(), 100);
  };
  
  // ブロックの更新
  const updateBlock = (id, updates) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };
  
  // ブロックの削除
  const deleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };
  
  // 重みの変更
  const changeWeight = (id, newWeight) => {
    updateBlock(id, { weight: newWeight });
  };
  
  // 新しいタグの追加
  const addNewTag = (language) => {
    const value = newTagInput[language];
    if (!value.trim()) return;
    
    const newBlock = {
      id: Date.now(),
      en: language === 'en' ? value : value + '_translated', // 実際は翻訳API使用
      ja: language === 'ja' ? value : value + '_翻訳済み', // 実際は翻訳API使用
      weight: 1.0,
      category: 'other',
      locked: false
    };
    
    setBlocks([...blocks, newBlock]);
    setNewTagInput({ en: '', ja: '' });
  };
  
  // 完成プロンプトの生成
  const generateFinalPrompt = () => {
    if (blocks.length === 0) return '';
    
    const format = settings.outputFormat || 'sdxl';
    
    if (format === 'sdxl') {
      // SDXL形式: タグをカンマ区切り、重み付き
      return blocks.map(block => {
        const tag = block.en;
        if (block.weight !== 1.0) {
          return `(${tag}:${block.weight.toFixed(2)})`;
        }
        return tag;
      }).join(', ');
    } else if (format === 'flux') {
      // Flux形式: 自然な文章
      return blocks.map(block => block.en).join('. ') + '.';
    } else {
      // ImageFX形式
      return blocks.map(block => block.en).join(' ');
    }
  };
  
  // 画像生成（APIを使用）
  const handleGenerateImage = async () => {
    const prompt = generateFinalPrompt();
    if (!prompt) {
      alert('プロンプトを生成してください');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await axios.post('/api/generate-image', {
        prompt: prompt,
        model: 'sdxl-1.0',
        parameters: {
          width: 512,
          height: 512,
          steps: 30
        }
      });
      
      if (response.data && response.data.image) {
        setGeneratedImage(response.data.image.url);
      }
    } catch (error) {
      console.error('画像生成エラー:', error);
      alert('画像生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // クリップボードにコピー（改善版）
  const copyToClipboard = async (text) => {
    try {
      // 最新のClipboard APIを試す
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        // 成功通知（短時間表示）
        const notification = document.createElement('div');
        notification.textContent = 'コピーしました!';
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:10px 20px;border-radius:5px;z-index:9999;';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
      } else {
        // フォールバック: テキストエリアを使用
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          const notification = document.createElement('div');
          notification.textContent = 'コピーしました!';
          notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:10px 20px;border-radius:5px;z-index:9999;';
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 2000);
        } catch (err) {
          console.error('コピーに失敗しました:', err);
          alert('コピーに失敗しました。手動でコピーしてください。');
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      console.error('クリップボードへのアクセスエラー:', err);
      // フォールバック
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        const notification = document.createElement('div');
        notification.textContent = 'コピーしました!';
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:10px 20px;border-radius:5px;z-index:9999;';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
      } catch (err2) {
        console.error('コピーに失敗しました:', err2);
        alert('コピーに失敗しました。手動でコピーしてください。');
      } finally {
        textArea.remove();
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">SS Prompt Manager</h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            React.createElement(Settings, { size: 24 })
          </button>
        </div>
      </header>
      
      {/* タブ */}
      <div className="bg-white border-b px-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('text')}
            className={cn(
              'py-3 px-4 border-b-2 transition-colors',
              activeTab === 'text' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-600'
            )}
          >
            React.createElement(FileText, { size: 20, className: "inline mr-2" })
            text
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={cn(
              'py-3 px-4 border-b-2 transition-colors',
              activeTab === 'image' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-600'
            )}
          >
            React.createElement(Image, { size: 20, className: "inline mr-2" })
            image
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'text' && (
          <div className="split-view">
            {/* 左側：メインエリア */}
            <div className="space-y-4">
              {/* 入力エリア */}
              <div className="bg-white rounded-lg p-4 shadow">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="プロンプトを入力..."
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* 操作ボタン */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={handlePaste}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-2"
                    title="クリップボードからペースト (またはCtrl+V)"
                  >
                    <i className="fas fa-paste"></i>
                    ペースト
                  </button>
                  <button
                    onClick={handleSplit}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-cut"></i>
                    分解
                  </button>
                  <button
                    onClick={handleAIColorize}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    React.createElement(Palette, { size: 16 })
                    AI色分け
                  </button>
                  <button
                    onClick={() => {
                      setInputText('');
                      setBlocks([]);
                    }}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    クリア
                  </button>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <select
                      value={settings.outputFormat}
                      onChange={(e) => setSettings({ ...settings, outputFormat: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="sdxl">SDXLタグ形式</option>
                      <option value="flux">Fluxフレーズ形式</option>
                      <option value="imagefx">ImageFX形式</option>
                    </select>
                    
                    <select
                      value={settings.model}
                      onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="gpt-4">GPT-4.0</option>
                      <option value="gpt-3.5-turbo">GPT-3.5</option>
                      <option value="claude-3">Claude-3</option>
                    </select>
                    
                    <button
                      onClick={() => {
                        console.log('ボタンクリック前の入力欄:', inputText);
                        handleAIGenerate();
                        console.log('ボタンクリック後の入力欄:', inputText);
                      }}
                      className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      React.createElement(Sparkles, { size: 16 })
                      AI生成
                    </button>
                  </div>
                </div>
              </div>
              
              {/* タグ編集エリア */}
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="grid grid-cols-2 gap-4">
                  {/* 英語カラム */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">English</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTagInput.en}
                          onChange={(e) => setNewTagInput({ ...newTagInput, en: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addNewTag('en');
                            }
                          }}
                          placeholder="新しいタグを追加"
                          className="px-3 py-1 border rounded-lg text-sm"
                        />
                        <button
                          onClick={() => addNewTag('en')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          React.createElement(Plus, { size: 16 })
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {blocks.map(block => (
                        <TagBlock
                          key={block.id}
                          block={block}
                          onUpdate={updateBlock}
                          onDelete={deleteBlock}
                          onWeightChange={changeWeight}
                          language="en"
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* 日本語カラム */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">日本語</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTagInput.ja}
                          onChange={(e) => setNewTagInput({ ...newTagInput, ja: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addNewTag('ja');
                            }
                          }}
                          placeholder="新しいタグを追加"
                          className="px-3 py-1 border rounded-lg text-sm"
                        />
                        <button
                          onClick={() => addNewTag('ja')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          React.createElement(Plus, { size: 16 })
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {blocks.map(block => (
                        <TagBlock
                          key={block.id}
                          block={block}
                          onUpdate={updateBlock}
                          onDelete={deleteBlock}
                          onWeightChange={changeWeight}
                          language="ja"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 完成プロンプト */}
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">完成プロンプト</h3>
                  <button
                    onClick={() => copyToClipboard(generateFinalPrompt())}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                  >
                    React.createElement(Copy, { size: 16 })
                    コピー
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generateFinalPrompt() || 'プロンプトがまだ生成されていません'}
                  </pre>
                </div>
              </div>
            </div>
            
            {/* 右側：画像生成エリア */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-700 mb-3">画像生成</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">プロンプト</label>
                  <div className="p-2 bg-gray-50 rounded text-sm max-h-32 overflow-y-auto">
                    {generateFinalPrompt() || 'プロンプトなし'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">モデル</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>SDXL 1.0</option>
                    <option>Flux.1 Dev</option>
                    <option>Midjourney v6</option>
                  </select>
                </div>
                
                <button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !generateFinalPrompt()}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      React.createElement(RefreshCw, { size: 16, className: "animate-spin" })
                      生成中...
                    </>
                  ) : (
                    <>
                      React.createElement(Sparkles, { size: 16 })
                      生成
                    </>
                  )}
                </button>
                
                {generatedImage && (
                  <div className="mt-4">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'image' && (
          <div className="bg-white rounded-lg p-8 text-center">
            React.createElement(Image, { size: 64, className: "mx-auto text-gray-400 mb-4" })
            <p className="text-gray-600">画像解析機能は今後実装予定です</p>
          </div>
        )}
      </div>
      
      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
};

// アプリケーションのマウント
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));