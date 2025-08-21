import { Hono } from 'hono'
import { cors } from 'hono/cors'
import appHtml from './simple-app.html?raw'

type Bindings = {
  OPENROUTER_API_KEY?: string
  IMAGE_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// ルートハンドラ - HTMLを直接返す
app.get('/', (c) => {
  return c.html(appHtml)
})

// API: テキストをブロックに分解
app.post('/api/split', async (c) => {
  const { text } = await c.req.json()
  
  if (!text) {
    return c.json({ error: 'Text is required' }, 400)
  }
  
  const delimiters = /[,，.。、]/g
  const parts = text.split(delimiters).filter((part: string) => part.trim())
  
  const blocks = parts.map((part: string, index: number) => ({
    id: Date.now() + index,
    en: part.trim(),
    ja: part.trim(),
    weight: 1.0,
    category: 'other',
    locked: false
  }))
  
  return c.json({ blocks })
})

// API: AI色分け
app.post('/api/categorize', async (c) => {
  const { blocks, systemPrompt } = await c.req.json()
  
  if (!blocks || blocks.length === 0) {
    return c.json({ error: 'Blocks are required' }, 400)
  }
  
  // カテゴリ分類のためのキーワード辞書（簡易版）
  const categoryKeywords = {
    person: ['girl', 'boy', 'woman', 'man', 'person', 'character', '女の子', '男の子', '女性', '男性'],
    appearance: ['hair', 'eyes', 'face', 'skin', '髪', '目', '顔', '肌'],
    clothing: ['dress', 'shirt', 'clothes', 'wear', 'uniform', 'ドレス', 'シャツ', '服', '制服'],
    pose: ['standing', 'sitting', 'running', 'pose', '立つ', '座る', '走る', 'ポーズ'],
    background: ['background', 'sky', 'room', 'forest', 'city', '背景', '空', '部屋', '森', '街'],
    quality: ['quality', 'masterpiece', 'best', 'detailed', '品質', '傑作', '最高', '詳細'],
    style: ['style', 'anime', 'realistic', 'painting', 'スタイル', 'アニメ', 'リアル', '絵画'],
  }
  
  // 簡易的なカテゴリ分類
  const categorizedBlocks = blocks.map((block: any) => {
    const text = (block.en + ' ' + block.ja).toLowerCase()
    let detectedCategory = 'other'
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        detectedCategory = category
        break
      }
    }
    
    return {
      ...block,
      category: detectedCategory
    }
  })
  
  return c.json({ blocks: categorizedBlocks })
})

// API: 翻訳
app.post('/api/translate', async (c) => {
  const { text, from, to } = await c.req.json()
  
  if (!text) {
    return c.json({ error: 'Text is required' }, 400)
  }
  
  // 簡易的な翻訳辞書（実際のAPIを使う場合はここを置き換え）
  const translations: { [key: string]: string } = {
    'masterpiece': '傑作',
    'best quality': '最高品質',
    'girl': '女の子',
    'boy': '男の子',
    'beautiful': '美しい',
    'detailed': '詳細な',
    '傑作': 'masterpiece',
    '最高品質': 'best quality',
    '女の子': 'girl',
    '男の子': 'boy',
    '美しい': 'beautiful',
    '詳細な': 'detailed'
  }
  
  // 簡易翻訳
  let translated = text
  for (const [key, value] of Object.entries(translations)) {
    if (text.toLowerCase().includes(key.toLowerCase())) {
      translated = value
      break
    }
  }
  
  // 変換できなかった場合は元のテキストに接尾辞をつける
  if (translated === text) {
    translated = from === 'ja' ? text + '_translated' : text + '_翻訳済み'
  }
  
  return c.json({ translated })
})

// API: プロンプト最適化
app.post('/api/optimize', async (c) => {
  const { prompt, format, systemPrompt } = await c.req.json()
  
  if (!prompt) {
    return c.json({ error: 'Prompt is required' }, 400)
  }
  
  // 形式別の最適化（簡易版）
  let optimized = prompt
  
  if (format === 'sdxl') {
    // SDXLタグ形式
    const qualityTags = ['masterpiece', 'best quality', 'ultra detailed', '8k']
    const negativeTags = ['worst quality', 'low quality', 'normal quality']
    
    optimized = {
      positive: `${qualityTags.join(', ')}, ${prompt}`,
      negative: negativeTags.join(', ')
    }
  } else if (format === 'flux') {
    // Fluxフレーズ形式
    optimized = `A ${prompt}, highly detailed, professional photography`
  } else if (format === 'imagefx') {
    // ImageFX命令形式
    optimized = `Create an image of ${prompt} with high quality and attention to detail`
  }
  
  return c.json({ optimized })
})

// API: 画像生成（モック）
app.post('/api/generate-image', async (c) => {
  const { prompt, model, parameters } = await c.req.json()
  
  if (!prompt) {
    return c.json({ error: 'Prompt is required' }, 400)
  }
  
  // 実際の画像生成APIを呼び出す場合はここを実装
  // 今回はモックとしてプレースホルダー画像を返す
  
  await new Promise(resolve => setTimeout(resolve, 2000)) // 生成時間のシミュレーション
  
  const mockImage = {
    url: `https://via.placeholder.com/512x512.png?text=${encodeURIComponent(prompt.slice(0, 20))}`,
    seed: Math.floor(Math.random() * 1000000),
    model: model || 'sdxl-1.0',
    timestamp: new Date().toISOString()
  }
  
  return c.json({ image: mockImage })
})

// API: システムプロンプトの取得
app.get('/api/system-prompts', (c) => {
  const systemPrompts = {
    translation: `You are a professional translator for image generation prompts. Translate between English and Japanese accurately while preserving the meaning and nuance for AI image generation.`,
    categorization: `You are an expert at categorizing image generation prompt elements. Classify each element into: person, appearance, clothing, pose, background, quality, style, or other.`,
    optimization: `You are an expert at optimizing prompts for AI image generation. Enhance prompts with appropriate quality tags, weights, and structure based on the target model (SDXL, Flux, ImageFX).`,
    formatting: {
      sdxl: `Format: comma-separated tags with optional weights (tag:weight). Include quality tags at the beginning.`,
      flux: `Format: natural language phrases describing the scene. Use descriptive, flowing sentences.`,
      imagefx: `Format: clear instructions starting with action verbs. Be specific about desired outcomes.`
    }
  }
  
  return c.json({ systemPrompts })
})

// API: システムプロンプトの更新
app.post('/api/system-prompts', async (c) => {
  const { type, content } = await c.req.json()
  
  if (!type || !content) {
    return c.json({ error: 'Type and content are required' }, 400)
  }
  
  // 実際にはデータベースやKVストレージに保存
  // ここではメモリに保存するモック実装
  
  return c.json({ success: true, message: 'System prompt updated' })
})

// API: 設定の保存
app.post('/api/settings', async (c) => {
  const settings = await c.req.json()
  
  // 実際にはデータベースやKVストレージに保存
  // ここではレスポンスを返すだけのモック実装
  
  return c.json({ success: true, settings })
})

// API: 設定の取得
app.get('/api/settings', (c) => {
  // モックの設定データ
  const settings = {
    outputFormat: 'sdxl',
    model: 'gpt-4',
    apiKeys: {
      openRouter: '',
      imageGeneration: ''
    },
    formats: [
      { id: 'sdxl', name: 'SDXL タグ形式', template: '{tags}' },
      { id: 'flux', name: 'Flux フレーズ形式', template: '{phrases}' },
      { id: 'imagefx', name: 'ImageFX 命令形式', template: '{commands}' }
    ],
    categories: [
      { id: 'person', name: '人物', color: '#fef3c7' },
      { id: 'appearance', name: '外見', color: '#dbeafe' },
      { id: 'clothing', name: '服装', color: '#fce7f3' },
      { id: 'pose', name: 'ポーズ', color: '#e9d5ff' },
      { id: 'background', name: '背景', color: '#d1fae5' },
      { id: 'quality', name: '品質', color: '#fed7aa' },
      { id: 'style', name: 'スタイル', color: '#fef3c7' },
      { id: 'other', name: 'その他', color: '#e5e7eb' }
    ]
  }
  
  return c.json({ settings })
})

// ヘルスチェック
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

export default app