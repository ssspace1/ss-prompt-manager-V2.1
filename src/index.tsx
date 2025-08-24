import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  AI_API_KEY?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// AI Translation API endpoint
app.post('/api/translate', async (c) => {
  const { text, targetLang = 'ja', apiKey, format } = await c.req.json();
  
  if (!text) {
    return c.json({ error: 'Text is required' }, 400);
  }
  
  // Use provided API key or environment variable
  const key = apiKey || c.env?.AI_API_KEY;
  
  if (!key) {
    // Fallback to simple dictionary translation
    return c.json({
      translated: text,
      source: 'dictionary'
    });
  }
  
  try {
    // 🎯 Use unified backend translation prompt from system
    // TODO: In future, fetch this from frontend's systemPrompts for complete unification
    let systemPrompt = '';
    
    if (format && format !== 'sdxl' && format !== 'flux' && format !== 'imagefx' && format !== 'imagefx-natural') {
      // Custom format - preserve special instructions
      if (targetLang === 'ja') {
        systemPrompt = `You are a professional translator for custom image generation prompts.
Translate the given English image generation tag to Japanese while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "nyan", "nyaa", special characters, etc.), maintain them in the translation.

Examples:
- "1girl nyan" → "1人の女の子 nyan"
- "hot spring nyan" → "温泉 nyan"
- "ultra-detailed 8K nyan" → "超詳細 8K nyan"

Output only the translation, no explanations.`;
      } else {
        systemPrompt = `You are a professional translator for custom image generation prompts.
Translate the given Japanese image generation tag to English while preserving any special formatting or custom instructions.

IMPORTANT: If the original tag has special suffixes, patterns, or custom formatting (like "ニャン", special characters, etc.), maintain them in the translation.

Output only the translation, no explanations.`;
      }
    } else {
      // Standard translation for default formats - Using unified backend prompt
      systemPrompt = `You are a professional translator for image generation prompts.
Translate between English and Japanese while maintaining context and meaning appropriate for AI image generation.

For custom formats: Preserve any special formatting, suffixes, or custom instructions.
For standard formats: Focus on natural, clear translation.

Output only the translation, no explanations.`;
    }
    
    // Call OpenRouter API for translation
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
        'X-Title': 'SS Prompt Manager'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
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
      throw new Error('Translation API failed');
    }
    
    const data = await response.json();
    return c.json({
      translated: data.choices[0].message.content.trim(),
      source: 'ai'
    });
  } catch (error) {
    console.error('Translation error:', error);
    return c.json({
      translated: text,
      source: 'dictionary',
      error: 'AI translation failed, using dictionary'
    });
  }
});

// DISABLED: Legacy generate-tags API that conflicted with frontend system prompts
// app.post('/api/generate-tags', async (c) => {
// 🚫 DISABLED: Legacy generate-tags API - Now handled by frontend unified system
// This endpoint conflicted with frontend system prompts management
app.post('/api/generate-tags-disabled', async (c) => {
  const { prompt, format = 'sdxl', apiKey, systemPrompt } = await c.req.json();
  
  if (!prompt) {
    return c.json({ error: 'Prompt is required' }, 400);
  }
  
  const key = apiKey || c.env?.AI_API_KEY;
  
  if (!key) {
    return c.json({ error: 'API key is required' }, 400);
  }
  
  // ⚠️ These prompts are now managed by frontend unified system
  const legacySystemPrompts = {
    sdxl: `# SDXL Master Tag Generator - PROFESSIONAL QUALITY v15.0 (5-Block Hierarchy Model)

ユーザーから日本語のストーリーテキストが入力された場合、あなたは**「5ブロック階層モデル」**と**「SDXL最適化戦略」**に従い、物語の核心を表現する**短いタグ・フレーズ中心**のプロンプトを設計し、その結果を**指定されたJSONフォーマット**で出力しなければならない。

## SDXL 5-BLOCK HIERARCHY MODEL:
生成する各プロンプトは、以下の5つのブロックの思考プロセスに従って構築する：

1. **ブロック1: 関係性の配置宣言** - メインキャラクターと環境の位置関係
2. **ブロック2: メインキャラクターの集中描写** - 主役の詳細な特徴（短いタグで）
3. **ブロック3: サブキャラクターの補足描写** - 副次的人物の要素
4. **ブロック4: 環境オブジェクトの確定** - 物理的に存在する要素
5. **ブロック5: 場所・文脈の最終指定** - シーンの場所と抽象的関係性

## SDXL OPTIMIZATION STRATEGY:
SDXL excels with SHORT, SPECIFIC tags that clearly define:
- Subject count & type (1girl, 2boys, etc.)
- Quality enhancers (masterpiece, best quality, ultra-detailed)
- Specific visual elements (hair color, clothing items, expressions)
- Composition elements (close-up, full body, from side)
- Physical positioning (sitting, standing, crouching)
- Facial expressions and eye direction (smile, looking_at_viewer)

## STRICT RULES FOR SDXL:
### 表情と視線の厳密化:
- 表情が見えるカットでは、**必ず表情タグと視線タグをセットで記述**
- 表情が見えないカットでは、**必ず back_of_head または back_turned を記述**

### 禁止事項:
- **品質・効果系タグの制限**: dramatic_lighting, depth_of_field などの抽象的タグは最小限に
- **固有名詞の禁止**: 有名人名ではなく "1girl", "1boy" などの一般的記述を使用

## TAG CONSTRUCTION RULES:
1. **Quality Foundation** (控えめに): "masterpiece, best quality" 程度に留める
2. **Subject Definition** (Be specific): "1girl" not just "girl"
3. **Visual Hierarchy** (Use weights strategically):
   - Main subject: 1.2-1.3
   - Important details: 1.1-1.2
   - Standard elements: 1.0
   - Background/subtle: 0.9

4. **Physical Positioning Priority**:
   - ✅ "crouching", "seiza", "hands_on_lap"
   - ✅ "looking_up_at_him", "looking_down_at_table"
   - ✅ "sitting_on_floor", "standing_behind"

## OUTPUT FORMAT - Comma-separated tags with weights:
masterpiece, best quality, 1girl, crouching, looking_up, smile:1.1, natural_hot_spring, steaming_water, forest_background

CRITICAL: SDXL用に**短い、具体的なタグ**を生成し、5ブロック階層思考で物語の核心を捉える！`,
    flux: `# Flux Narrative Master - CINEMATIC STORYTELLING v14.0 (5-Block Hierarchy Model)

ユーザーから日本語のストーリーテキストが入力された場合、あなたは**「5ブロック階層モデル」**と**「Flux長文最適化戦略」**に従い、物語の感情と雰囲気を表現する**長いフレーズ・文章中心**のプロンプトを設計し、その結果を**自然な文章形式**で出力しなければならない。

## FLUX 5-BLOCK HIERARCHY MODEL:
生成する各プロンプトは、以下の5つのブロックの思考プロセスに従って構築する：

1. **ブロック1: 関係性の配置宣言** - シーン全体の構図と人物配置
2. **ブロック2: メインキャラクターの集中描写** - 主役の感情・行動・状況（長文で）
3. **ブロック3: サブキャラクターの補足描写** - 副次的人物の状況と感情
4. **ブロック4: 環境オブジェクトの確定** - 雰囲気を作る環境要素
5. **ブロック5: 場所・文脈の最終指定** - 総合的な場面設定と物語的文脈

## FLUX OPTIMIZATION STRATEGY:
Flux excels with DESCRIPTIVE PHRASES and EMOTIONAL CONTEXT:
- Character relationships: "1girl and 1boy in a tender moment"
- Environmental atmosphere: "deep within a lush forest where ancient trees create natural privacy"
- Emotional states: "sense of discovery mixed with gentle vulnerability"
- Physical interactions: "carefully dipping her hand into the steaming mineral-rich water"
- Cinematic quality: "captured in the soft golden light filtering through the forest canopy"

## STRICT RULES FOR FLUX:
### 長文フレーズの推奨:
- ✅ "1girl and 1boy sharing an intimate moment in a secluded natural hot spring"
- ✅ "steaming mineral water surrounded by moss-covered rocks and ancient forest"
- ✅ "golden sunlight filtering through dense canopy creating dappled light patterns"

### 感情・雰囲気の重視:
- **感情表現**: "sense of wonder", "peaceful tranquility", "intimate connection"
- **雰囲気描写**: "serene natural environment", "hidden sanctuary feeling"
- **物語的文脈**: "moment of discovery", "shared experience", "natural intimacy"

### 禁止事項:
- **過度な短縮**: 単語レベルのタグは避け、必ずフレーズで表現
- **技術的タグ**: masterpiece, best quality などの品質タグは不要

## PROMPT STRUCTURE - Write as ONE flowing paragraph:
[Characters] in [Location]. [Background elements and atmosphere]. [Character 1 details: position, action, clothing, expression, gaze]. [Character 2 details if present]. [Camera angle and shot type]. This image conveys [emotional/thematic summary].

## OUTPUT FORMAT - Natural flowing narrative:
"1girl and 1boy in a natural hot spring deep within a lush forest where ancient trees create natural privacy. Steaming mineral water surrounds moss-covered rocks while golden sunlight filters through dense canopy creating dappled light patterns. The girl crouches gracefully at the water's edge, her long flowing hair catching the light as she carefully dips her hand into the steaming water, her expression showing a sense of wonder and discovery. The boy stands behind her, watching with gentle protectiveness and shared amazement at this hidden sanctuary. Shot from a medium distance with soft natural lighting, this image conveys a moment of peaceful discovery and natural intimacy."

CRITICAL: Flux用に**長い、描写的なフレーズ**を生成し、5ブロック階層思考で物語の感情と雰囲気を捉える！`,
    imagefx: `You are an expert at generating ImageFX prompts. Convert the user's input into clear instructions.
Rules:
1. Use clear, direct language
2. Specify artistic style explicitly
3. Include mood and atmosphere
4. Be concise but comprehensive
5. Output only the prompt, no explanations`
  };
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
        'X-Title': 'SS Prompt Manager'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt || defaultSystemPrompts[format] || defaultSystemPrompts.sdxl
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    if (!response.ok) {
      throw new Error('Generation API failed');
    }
    
    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();
    
    // Parse generated tags into structured format
    let tags = [];
    if (format === 'sdxl') {
      // Split by comma and parse
      const parts = generatedText.split(',').map(p => p.trim());
      tags = parts.map((part, i) => {
        const match = part.match(/^(.+?):(\d+\.?\d*)$/);
        if (match) {
          return {
            id: Date.now() + i,
            en: match[1].trim(),
            weight: parseFloat(match[2])
          };
        }
        return {
          id: Date.now() + i,
          en: part,
          weight: 1.0
        };
      });
    } else {
      // For flux and imagefx, treat as single block
      tags = [{
        id: Date.now(),
        en: generatedText,
        weight: 1.0
      }];
    }
    
    // Translate tags to Japanese
    const translatedTags = await Promise.all(tags.map(async (tag) => {
      try {
        const transResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
            'X-Title': 'SS Prompt Manager'
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Translate this image generation tag/prompt from English to Japanese. Keep it natural and appropriate for image generation. Output only the translation.'
              },
              {
                role: 'user',
                content: tag.en
              }
            ],
            temperature: 0.3,
            max_tokens: 100
          })
        });
        
        if (transResponse.ok) {
          const transData = await transResponse.json();
          tag.ja = transData.choices[0].message.content.trim();
        } else {
          tag.ja = tag.en; // Fallback to English
        }
      } catch (e) {
        tag.ja = tag.en; // Fallback to English
      }
      
      // Categorize tag
      tag.category = categorizeTag(tag.en);
      return tag;
    }));
    
    return c.json({
      tags: translatedTags,
      format,
      raw: generatedText
    });
  } catch (error) {
    console.error('Generation error:', error);
    return c.json({ error: 'Failed to generate tags' }, 500);
  }
});

// REMOVED: Unused /api/generate-bilingual-tags endpoint that was causing prompt conflicts
// All AI generation now uses /api/openrouter/chat with frontend-managed system prompts

// Helper function to categorize tags
function categorizeTag(text: string): string {
  const categoryKeywords = {
    person: ['girl', 'boy', 'woman', 'man', 'person', 'people', 'child', 'teen', 'adult'],
    appearance: ['hair', 'eyes', 'face', 'smile', 'expression', 'beautiful', 'cute', 'handsome'],
    clothing: ['dress', 'shirt', 'skirt', 'uniform', 'clothes', 'wearing', 'outfit', 'costume'],
    pose: ['sitting', 'standing', 'walking', 'running', 'pose', 'posing', 'action'],
    background: ['background', 'scenery', 'forest', 'city', 'sky', 'room', 'outdoor', 'indoor'],
    quality: ['masterpiece', 'quality', 'resolution', 'detailed', 'realistic', 'hd', '4k', '8k'],
    style: ['anime', 'realistic', 'cartoon', 'painting', 'illustration', 'digital', 'art', 'style'],
    other: []
  };
  
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }
  return 'other';
}

// Import template
import { getMainHtml } from './templates/mainTemplate'

// Main HTML page - loaded from external template file
const appHtml = getMainHtml()

type Bindings = {
  OPENROUTER_API_KEY?: string
  IMAGE_API_KEY?: string
}

// OpenRouter types
interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length?: number
  pricing?: {
    prompt?: string
    completion?: string
    image?: string
  }
  architecture?: {
    input_modalities?: string[]
    output_modalities?: string[]
  }
  top_provider?: {
    context_length?: number
    max_completion_tokens?: number
  }
}

// CORS設定
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// 静的ファイルのサービング
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/*.html', serveStatic({ root: './public' }))
app.use('/*.js', serveStatic({ root: './public' }))
app.use('/*.css', serveStatic({ root: './public' }))

// ルートハンドラ - 新しいapp.htmlを返す
app.get('/', (c) => {
  return c.html(appHtml)
})

// API: AI色分け（改善版）
app.post('/api/categorize', async (c) => {
  const { blocks } = await c.req.json()
  
  if (!blocks || blocks.length === 0) {
    return c.json({ error: 'Blocks are required' }, 400)
  }
  
  // より詳細なカテゴリ分類のためのキーワード辞書
  const categoryKeywords = {
    person: ['girl', 'boy', 'woman', 'man', 'person', 'character', 'people', 'child', 'adult', 'teen', 'female', 'male', 'lady', 'gentleman', '女の子', '男の子', '女性', '男性', '人物', 'キャラクター'],
    appearance: ['hair', 'eyes', 'face', 'skin', 'blonde', 'brown', 'black', 'blue', 'green', 'red', 'long', 'short', 'curly', 'straight', 'beautiful', 'cute', 'handsome', 'pretty', 'smile', 'expression', '髪', '目', '顔', '肌', '金髪', '茶髪', '黒髪', '青い目', '緑の目', '笑顔'],
    clothing: ['dress', 'shirt', 'pants', 'skirt', 'jacket', 'coat', 'shoes', 'hat', 'uniform', 'clothes', 'wearing', 'outfit', 'costume', 'suit', 'sweater', 'jeans', 'boots', 'gloves', 'ドレス', 'シャツ', '服', '制服', 'スーツ', 'コート', '靴'],
    pose: ['standing', 'sitting', 'walking', 'running', 'jumping', 'lying', 'pose', 'posture', 'action', 'gesture', 'holding', 'looking', 'pointing', 'waving', 'kneeling', '立つ', '座る', '走る', 'ポーズ', '見る', '持つ'],
    background: ['background', 'scenery', 'landscape', 'indoor', 'outdoor', 'sky', 'room', 'forest', 'city', 'beach', 'mountain', 'street', 'building', 'nature', 'park', 'sunset', 'night', 'day', '背景', '空', '部屋', '森', '街', '屋外', '屋内', '自然', '夕日'],
    quality: ['quality', 'masterpiece', 'best', 'detailed', 'realistic', 'hd', '4k', '8k', 'high quality', 'best quality', 'professional', 'ultra', 'super', 'hyper', 'resolution', '品質', '傑作', '最高', '詳細', '高画質', 'プロフェッショナル'],
    style: ['style', 'anime', 'realistic', 'cartoon', 'painting', 'illustration', 'digital', 'art', 'artistic', 'cinematic', 'photography', 'drawing', 'sketch', 'watercolor', 'oil painting', 'スタイル', 'アニメ', 'リアル', '絵画', 'イラスト', '写真']
  }
  
  // 改善されたカテゴリ分類
  const categorizedBlocks = blocks.map((block: any) => {
    const text = (block.en + ' ' + block.ja).toLowerCase()
    let detectedCategory = 'other'
    let maxScore = 0
    
    // 各カテゴリのスコアを計算
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          // キーワードの長さと完全一致度に基づくスコア
          const keywordLower = keyword.toLowerCase()
          if (text === keywordLower) {
            score += 10 // 完全一致
          } else if (text.split(/\s+/).includes(keywordLower)) {
            score += 5 // 単語として含まれる
          } else {
            score += 2 // 部分的に含まれる
          }
        }
      }
      
      if (score > maxScore) {
        maxScore = score
        detectedCategory = category
      }
    }
    
    // 特殊なパターンの処理（引用符や括弧で囲まれた文字列）
    if (text.match(/["'()]/) && detectedCategory === 'other') {
      // 文章的な内容は style または other に分類
      if (text.length > 20) {
        detectedCategory = 'style'
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

// API: OpenRouter models list
app.get('/api/openrouter/models', async (c) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    const data = await response.json() as { data: OpenRouterModel[] }
    
    // Filter and format models for frontend
    const formattedModels = data.data
      .filter(model => 
        model.architecture?.input_modalities?.includes('text') &&
        model.architecture?.output_modalities?.includes('text')
      )
      .map(model => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description,
        contextLength: model.top_provider?.context_length || model.context_length || 0,
        pricing: {
          prompt: model.pricing?.prompt || '0',
          completion: model.pricing?.completion || '0'
        }
      }))
      .sort((a, b) => {
        // Prioritize popular models
        const priorityModels = ['gpt-4o', 'claude-3', 'deepseek', 'gemini', 'mistral']
        const aPriority = priorityModels.findIndex(p => a.id.toLowerCase().includes(p))
        const bPriority = priorityModels.findIndex(p => b.id.toLowerCase().includes(p))
        
        if (aPriority !== -1 && bPriority === -1) return -1
        if (aPriority === -1 && bPriority !== -1) return 1
        if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority
        
        return a.name.localeCompare(b.name)
      })

    return c.json({ models: formattedModels })
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error)
    return c.json({ error: 'Failed to fetch models', models: [] }, 500)
  }
})

// API: OpenRouter chat completion
app.post('/api/openrouter/chat', async (c) => {
  const { messages, model, systemPrompt, temperature = 0.7, maxTokens = 2000, apiKey: clientApiKey } = await c.req.json()
  
  // Use client-provided API key first, then fall back to environment variable
  const apiKey = clientApiKey || c.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return c.json({ error: 'OpenRouter API key not configured' }, 400)
  }

  if (!messages || !model) {
    return c.json({ error: 'Messages and model are required' }, 400)
  }

  try {
    // Prepare messages with system prompt if provided
    const chatMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
        'X-Title': 'SS Prompt Manager'
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${error}`)
    }

    const data = await response.json()
    return c.json({
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
      model: data.model
    })
  } catch (error) {
    console.error('OpenRouter chat error:', error)
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to process chat request' 
    }, 500)
  }
})

// API: Translate text
app.post('/api/translate', async (c) => {
  const { text, sourceLang, targetLang, model = 'openai/gpt-4o-mini', apiKey: clientApiKey } = await c.req.json()
  const apiKey = clientApiKey || c.env.OPENROUTER_API_KEY

  if (!apiKey) {
    // Fallback to simple translation
    return c.json({ translated: text })
  }

  if (!text) {
    return c.json({ error: 'Text is required' }, 400)
  }

  const systemPrompt = `You are a professional translator specializing in image generation prompts. 
Translate the following text from ${sourceLang} to ${targetLang}. 
Maintain technical terms, preserve emphasis markers like parentheses and colons with weights.
Return only the translation, no explanations.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ss-prompt-manager.pages.dev',
        'X-Title': 'SS Prompt Manager'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error('Translation failed')
    }

    const data = await response.json()
    return c.json({
      translated: data.choices?.[0]?.message?.content || text
    })
  } catch (error) {
    console.error('Translation error:', error)
    // Fallback to returning original text
    return c.json({ translated: text })
  }
})

// REMOVED: Entire legacy optimize endpoint with conflicting system prompts
// All optimization functionality has been moved to frontend-managed system prompts

// ヘルスチェック
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 改善版へのルート
app.get('/improved', async (c) => {
  const improvedHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SS Prompt Manager - 改善版（英日連動対応）</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        [data-category="person"] { background-color: #fef3c7; border-color: #fbbf24; }
        [data-category="appearance"] { background-color: #dbeafe; border-color: #60a5fa; }
        [data-category="clothing"] { background-color: #fce7f3; border-color: #f9a8d4; }
        [data-category="pose"] { background-color: #e9d5ff; border-color: #c084fc; }
        [data-category="background"] { background-color: #d1fae5; border-color: #34d399; }
        [data-category="quality"] { background-color: #fed7aa; border-color: #fb923c; }
        [data-category="style"] { background-color: #fef3c7; border-color: #fde047; }
        [data-category="other"] { background-color: #e5e7eb; border-color: #9ca3af; }
        
        .split-view {
            display: grid;
            grid-template-columns: 1fr min(400px, 30%);
            gap: 1rem;
            height: calc(100vh - 120px);
        }
        
        .block-card {
            transition: all 0.2s ease;
            cursor: move;
        }
        
        .block-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script type="module" src="/static/app.js"></script>
</body>
</html>`
  return c.html(improvedHtml)
})

export default app