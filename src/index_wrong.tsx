// SS Prompt Manager - New Clean Architecture Entry Point
// 新しい清潔なアーキテクチャのエントリーポイント

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { TranslationAPI } from './core/api/translation'
import { systemPromptsManager } from './core/config/systemPrompts'
import { getUnifiedHtml } from './templates/unifiedTemplate'

type Bindings = {
  AI_API_KEY?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// === AI Translation API ===
// 統合システムプロンプト管理を使用した翻訳API
app.post('/api/translate', async (c) => {
  try {
    const { text, targetLang = 'ja', apiKey, format } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }
    
    // 統合翻訳APIを使用
    const result = await TranslationAPI.translate({
      text,
      targetLang: targetLang as 'ja' | 'en',
      format,
      apiKey: apiKey || c.env?.AI_API_KEY
    });
    
    return c.json(result);
  } catch (error) {
    console.error('Translation API error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// === Prompt Enhancement API ===
// プロンプト強化API
app.post('/api/enhance', async (c) => {
  try {
    const { text, type = 'quality', apiKey } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }
    
    if (!apiKey && !c.env?.AI_API_KEY) {
      return c.json({ error: 'API key is required' }, 400);
    }
    
    const result = await TranslationAPI.enhancePrompt(
      text,
      type as 'quality' | 'style',
      apiKey || c.env?.AI_API_KEY
    );
    
    return c.json(result);
  } catch (error) {
    console.error('Enhancement API error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// === System Prompts API ===
// システムプロンプト管理API
app.get('/api/system-prompts', async (c) => {
  try {
    const config = systemPromptsManager.getConfig();
    return c.json(config);
  } catch (error) {
    console.error('System prompts API error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/system-prompts/validate', async (c) => {
  try {
    const validation = systemPromptsManager.validateConfig();
    return c.json(validation);
  } catch (error) {
    console.error('System prompts validation error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// === Test API Connection ===
// API接続テスト
app.post('/api/test-connection', async (c) => {
  try {
    const { apiKey } = await c.req.json();
    
    if (!apiKey) {
      return c.json({ error: 'API key is required' }, 400);
    }
    
    const result = await TranslationAPI.testConnection(apiKey);
    return c.json(result);
  } catch (error) {
    console.error('Connection test error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// === Main Application Route ===
// メインアプリケーション - 統合テンプレートシステムを使用
app.get('/', (c) => {
  const html = getUnifiedHtml();
  return c.html(html);
});

// Catch all route for SPA routing
app.get('*', (c) => {
  const html = getUnifiedHtml();
  return c.html(html);
});

export default app;