import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

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

// 静的ファイルのサービング
app.use('/static/*', serveStatic({ root: './public' }))

// ルートハンドラ - シンプルなHTMLを返す
app.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SS Prompt Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script type="module" src="/static/app.js"></script>
</body>
</html>`
  return c.html(html)
})

// API: AI色分け
app.post('/api/categorize', async (c) => {
  const { blocks } = await c.req.json()
  
  if (!blocks || blocks.length === 0) {
    return c.json({ error: 'Blocks are required' }, 400)
  }
  
  const categoryKeywords = {
    person: ['girl', 'boy', 'woman', 'man', 'person', 'child', 'adult', 'teen', 'people', 'character', 'face', 'human'],
    appearance: ['hair', 'eyes', 'skin', 'tall', 'short', 'young', 'old', 'beautiful', 'cute', 'handsome', 'pretty', 'facial', 'expression', 'smile'],
    clothing: ['dress', 'shirt', 'pants', 'skirt', 'jacket', 'coat', 'shoes', 'hat', 'uniform', 'clothes', 'wearing', 'outfit', 'costume', 'hoodie', 'zipped'],
    pose: ['sitting', 'standing', 'walking', 'running', 'jumping', 'lying', 'pose', 'posture', 'action', 'gesture', 'holding', 'looking', 'squatting', 'dipping'],
    background: ['background', 'scenery', 'landscape', 'indoor', 'outdoor', 'sky', 'room', 'forest', 'city', 'beach', 'mountain', 'street', 'spring', 'water', 'rocks'],
    quality: ['masterpiece', 'quality', 'resolution', 'detailed', 'realistic', 'hd', '4k', '8k', 'high quality', 'best quality', 'professional'],
    style: ['anime', 'realistic', 'cartoon', 'painting', 'illustration', 'digital', 'art', 'style', 'artistic', 'cinematic', 'photography']
  }
  
  const categorizedBlocks = blocks.map((block: any) => {
    const text = block.en.toLowerCase()
    let detectedCategory = 'other'
    let maxScore = 0
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score += keyword.length
        }
      }
      
      if (score > maxScore) {
        maxScore = score
        detectedCategory = category
      }
    }
    
    return {
      ...block,
      category: detectedCategory
    }
  })
  
  return c.json({ blocks: categorizedBlocks })
})

// API: 画像生成（モック）
app.post('/api/generate-image', async (c) => {
  const { prompt, model, parameters } = await c.req.json()
  
  if (!prompt) {
    return c.json({ error: 'Prompt is required' }, 400)
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const mockImage = {
    url: `https://via.placeholder.com/512x512.png?text=${encodeURIComponent(prompt.slice(0, 20))}`,
    seed: Math.floor(Math.random() * 1000000),
    model: model || 'sdxl-1.0',
    timestamp: new Date().toISOString()
  }
  
  return c.json({ image: mockImage })
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