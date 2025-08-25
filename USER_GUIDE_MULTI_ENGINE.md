# 🔧 Multi-Engine Image Analysis - User Setup Guide

## ❌ Problem: "No AI Analysis Results" 

If you're seeing empty analysis results or getting error messages, you need to **configure the analysis engines first**. The system requires proper setup before it can analyze images.

## ✅ Quick Setup Steps

### Step 1: Access Settings ⚙️
1. Click the **⚙️ settings button** next to the engine status indicator
2. Or go to the main **Settings** tab in the top navigation

### Step 2: Configure API Keys 🔑

**For WD-EVA02 (Anime Specialist):**
1. Get your Replicate API key from: https://replicate.com/account/api-tokens
2. Enter it in the "Replicate API Key" field
3. Click **Test** to verify it works

**For Janus Pro 7B (Vision Specialist):**
1. Same Replicate API key works for both engines

**For AI Tagging:**
1. Get OpenRouter API key from: https://openrouter.ai/keys
2. Enter it in the "OpenRouter API Key" field

### Step 3: Select Analysis Engines 🤖

In the **Settings** section, find "**画像解析エンジン（複数選択可）**":

**☑️ WD EVA02-Large v3 (アニメ・アート特化)**
- Best for anime, manga, and artwork  
- Provides specialized tags with confidence scores
- Requires Replicate API key

**☑️ Janus Pro 7B (汎用ビジョン解析) 推奨**  
- Best for general photos and realistic images
- Provides detailed image descriptions
- Requires Replicate API key

**💡 Tip**: You can select **both engines** for comprehensive analysis!

### Step 4: Select Tagging Engine 🏷️

In the "**タグ生成エンジン（１つ選択）**" section:

**🔘 DeepSeek (解析結果→タグ変換)** - Default, cost-effective
**🔘 LLM直接タグ化 (GPT-4o/Gemini/Claude)** - More advanced

### Step 5: Check Status Indicator ✅

Back in the **Image to Prompt** tab, look for the status indicator next to the AI Generate button:

- ❌ **"No analysis engines selected"** = Need to configure engines
- ✅ **"WD-EVA02 + Janus Pro 7B → DeepSeek"** = Ready to analyze!

## 🚀 How to Use Multi-Engine Analysis

### 1. Upload Image
- Drag & drop an image or click to select
- Supported formats: JPG, PNG, WebP, etc.

### 2. Start Analysis  
- Click **"AI Analysis & Tag Generation"** button
- The system will:
  - Run WD-EVA02 analysis (if selected)
  - Run Janus Pro 7B analysis (if selected)  
  - Process results with your chosen tagging engine
  - Generate structured tags

### 3. View Results
- Each engine shows its results in separate sections:
  - 🟢 **WD-EVA02 Result**: Anime-focused tags with confidence scores
  - 🟣 **Janus Pro 7B Result**: Detailed image description
- Click **▼** to expand/collapse results
- Use individual **Tag** buttons to tag from specific engines
- Use **Copy** buttons to copy raw analysis results

### 4. Generate Tags
- **Individual Tagging**: Click "Tag" on any engine result
- **Multi-Engine Fusion**: Use the main "Select & Tag" button
- Choose which engines to combine in the modal
- Apply fusion mode (Balanced/Focused)

### 5. Edit & Export
- All generated tags appear in the **Tag Editor**
- Edit, remove, or add tags as needed
- Export to SDXL, Flux, ImageFX formats

## 🔧 Troubleshooting

### "No analysis engines selected"
**Solution**: Go to Settings → Select WD-EVA02 and/or Janus Pro 7B

### "Replicate API key is required"  
**Solution**: Add your Replicate API key in Settings → Test it

### "Analysis failed" or timeout errors
**Solution**: 
- Check your Replicate API key is valid
- Ensure you have sufficient Replicate credits
- Try with a smaller image size
- Check internet connection

### Empty analysis results
**Solution**:
- Verify engines are selected in Settings
- Check that API keys are working
- Try clicking the Analysis toggle button to show results

### Model selection is confusing
**Solution**: 
- The "Model" dropdown is for legacy LLM analysis
- Use the new engine selection in Settings instead
- Focus on the engine status indicator for current setup

## 💡 Best Practices

### For Anime/Manga Images:
- ✅ Select **WD-EVA02** for specialized anime tags
- ✅ Use **DeepSeek** tagging engine (cost-effective)
- ✅ Set confidence threshold around 0.35

### For Real Photos:
- ✅ Select **Janus Pro 7B** for detailed descriptions  
- ✅ Use **LLM** tagging engine for better natural language processing
- ✅ Consider both engines for comprehensive analysis

### For Mixed Content:
- ✅ Select **both WD-EVA02 + Janus Pro 7B**
- ✅ Use **fusion tagging** to combine results
- ✅ Apply **Balanced** fusion mode

## 📊 Engine Comparison

| Engine | Best For | Output Type | Strength |
|--------|----------|-------------|----------|
| **WD-EVA02** | Anime, Art | Tagged list with confidence | Specialized anime knowledge |
| **Janus Pro 7B** | Photos, General | Natural language description | Detailed visual understanding |
| **DeepSeek Tagging** | Cost-effective | Structured tags | Fast and affordable |
| **LLM Tagging** | High quality | Advanced tags | Superior language processing |

## 🎯 Success Indicators

✅ **Engine status shows**: "WD-EVA02 + Janus Pro 7B → DeepSeek"
✅ **Analysis results appear** in colored sections after clicking AI Generate
✅ **Tags are generated** and appear in the Tag Editor
✅ **No error notifications** during the process

---

**🔗 Need Help?** 
- Check the **System Flow** tab for visual workflow
- Visit **Settings** to verify all configurations
- Use the **Test** buttons to verify API keys work

**🌟 Pro Tip**: Start with just one engine (Janus Pro 7B recommended) to test the system, then add WD-EVA02 for anime content!