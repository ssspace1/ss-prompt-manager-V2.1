# 🔑 SS Prompt Manager - API設定ガイド

## 問題の解決: "AI Generation failed: Tag generation failed"

このエラーは、OpenRouter APIキーが正しく設定されていないことが原因です。

## ✅ 解決手順

### 1. OpenRouter APIキーの取得

1. [OpenRouter](https://openrouter.ai/)にアクセス
2. アカウント作成 or ログイン
3. [API Keys](https://openrouter.ai/keys)ページへ移動
4. 新しいAPIキーを作成
5. キーをコピー（`sk-or-v1-...`で始まる文字列）

### 2. SS Prompt ManagerでAPIキーを設定

1. **設定画面を開く**
   - 右上の⚙️（歯車）アイコンをクリック

2. **API Keysタブを選択**
   - 「API Keys」タブが選択されていることを確認

3. **APIキーを入力**
   - 「OpenRouter API Key」フィールドに取得したキーを貼り付け
   - パスワードフィールドなので、入力時は隠れて表示されます

4. **APIキーをテスト**
   - 「Test」ボタンをクリック
   - 成功すると緑色のメッセージが表示されます

5. **モデルを選択**
   - 「Text to Prompt Model」でAI生成に使用するモデルを選択
   - おすすめ: `gpt-4o-mini` (コスパ良好) または `claude-3.5-sonnet` (高品質)

### 3. AI生成のテスト

1. **Text to Promptタブ**に戻る
2. 入力欄にテキストを入力（例: "森の中の温泉で女の子"）
3. **「AI Generate」ボタン**をクリック
4. 正常に動作すればタグが生成されます

## 🚨 よくある問題と対処法

### エラー: "No auth credentials found"
- **原因**: APIキーが正しく設定されていない
- **対処**: 手順2を再度実行し、正しいAPIキーを設定

### エラー: "API key test failed"
- **原因**: APIキーが無効または期限切れ
- **対処**: OpenRouterで新しいAPIキーを生成

### エラー: "Failed to load models"
- **原因**: ネットワーク接続またはAPIの問題
- **対処**: 「Refresh model list」ボタンをクリック

### AI生成が遅い
- **原因**: 高性能モデル（GPT-4o）を使用している
- **対処**: より高速なモデル（gpt-4o-mini）に変更

## 💰 コスト管理

### 無料オプション
- `google/gemini-2.0-flash-exp:free` - 実験的な無料モデル
- `nousresearch/hermes-3-llama-3.1-405b:free` - オープンソース無料モデル

### 低コストオプション
- `openai/gpt-4o-mini` - OpenAIの小型モデル（推奨）
- `anthropic/claude-3-haiku` - Claudeの高速モデル

### 高品質オプション
- `anthropic/claude-3.5-sonnet` - 最高品質（コストも高）
- `openai/gpt-4o` - GPT-4の最新版

## 📞 サポート

問題が解決しない場合:

1. ブラウザのコンソールログを確認（F12 → Console）
2. 設定を確認し、APIキーが正しく保存されているか確認
3. OpenRouterのアカウント残高を確認
4. 別のブラウザで試してみる

---

**更新日**: 2025年8月25日  
**バージョン**: SS Prompt Manager v2.0 + 履歴機能