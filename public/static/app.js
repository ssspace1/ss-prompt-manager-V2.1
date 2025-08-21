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
            <ChevronUp size={16} />
          </button>
          <span className="text-sm font-mono w-10 text-center">{block.weight.toFixed(2)}</span>
          <button
            onClick={() => onWeightChange(block.id, Math.max(0.1, block.weight - 0.05))}
            className="text-gray-600 hover:text-gray-800"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="text-red-600 hover:text-red-800 ml-2"
          >
            <Trash2 size={16} />
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
            <X size={24} />
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
  
  // テキストを分解してブロック化
  const handleSplit = () => {
    const delimiters = /[,，.。、]/g;
    const parts = inputText.split(delimiters).filter(part => part.trim());
    
    const newBlocks = parts.map((part, index) => ({
      id: Date.now() + index,
      en: part.trim(),
      ja: part.trim(), // 初期値は同じ、後で翻訳
      weight: 1.0,
      category: 'other',
      locked: false
    }));
    
    setBlocks(newBlocks);
  };
  
  // AI色分け（モック実装）
  const handleAIColorize = async () => {
    // 実際のAPIコール実装は後で追加
    const categories = ['person', 'appearance', 'clothing', 'pose', 'background', 'quality', 'style', 'other'];
    
    const colorizedBlocks = blocks.map(block => ({
      ...block,
      category: categories[Math.floor(Math.random() * categories.length)]
    }));
    
    setBlocks(colorizedBlocks);
  };
  
  // AI生成（モック実装）
  const handleAIGenerate = async () => {
    // 実際のAPIコール実装は後で追加
    const optimizedText = `masterpiece, best quality, ${inputText}, detailed, 8k`;
    setInputText(optimizedText);
    handleSplit();
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
  
  // 画像生成（モック実装）
  const handleGenerateImage = async () => {
    setIsGenerating(true);
    
    try {
      // 実際のAPI実装は後で追加
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // モック画像URL
      setGeneratedImage('https://via.placeholder.com/512x512.png?text=Generated+Image');
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // クリップボードにコピー
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
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
            <Settings size={24} />
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
            <FileText size={20} className="inline mr-2" />
            text
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={cn(
              'py-3 px-4 border-b-2 transition-colors',
              activeTab === 'image' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-600'
            )}
          >
            <Image size={20} className="inline mr-2" />
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
                    onClick={handleSplit}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    分解
                  </button>
                  <button
                    onClick={handleAIColorize}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Palette size={16} />
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
                      <option value="sdxl">Fluxフレーズ形式</option>
                      <option value="flux">SDXLタグ形式</option>
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
                      onClick={handleAIGenerate}
                      className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Sparkles size={16} />
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
                          <Plus size={16} />
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
                          <Plus size={16} />
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
                    <Copy size={16} />
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
                      <RefreshCw size={16} className="animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
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
            <Image size={64} className="mx-auto text-gray-400 mb-4" />
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
root.render(<App />);