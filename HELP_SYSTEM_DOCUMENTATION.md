# SS Prompt Manager - Help System Documentation

## 📚 Overview
A comprehensive help documentation system has been implemented for SS Prompt Manager v2.1, providing users with detailed information about how each system prompt works and the routes through which they are used.

## 🎯 Implementation Details

### 1. **Help Documentation File**
- **Location**: `/public/static/systemPromptsHelp.js`
- **Purpose**: Central repository of all help documentation for system prompts
- **Structure**: JavaScript object containing detailed information for each prompt type

### 2. **Help Categories**

#### Format Prompts
- **SDXL Tags**: Text to Prompt → SDXL format generation
- **Flux Phrases**: Text to Prompt → Flux format generation  
- **ImageFX**: Text to Prompt → ImageFX command generation
- **ImageFX Natural**: Text to Prompt → Natural language generation

#### Translation Prompts
- **TRANSLATION-EN-JA**: English to Japanese translation
- **TRANSLATION-JA-EN**: Japanese to English translation
- **TRANSLATION-CUSTOM**: Custom format translations

#### Utility Prompts
- **CATEGORIZER**: Automatic tag categorization
- **TAG-NORMALIZER**: Tag normalization and standardization
- **STRUCTURED-TAGS**: JSON structured tag generation
- **BACKEND-TRANSLATION**: Server-side translation fallback

#### Vision/Image Analysis
- **IMAGE-ANALYSIS**: Image to Prompt analysis
- **IMAGE-TO-PROMPT-ANALYSIS**: Detailed image analysis for prompt generation
- **IMAGE-TO-PROMPT-GENERATION**: Generate prompts from image analysis

### 3. **User Interface Integration**

#### Main Help Button
- **Location**: Header toolbar (question circle icon)
- **Function**: `App.showSystemHelp()`
- **Content**: Complete system overview with:
  - Feature descriptions
  - Workflow guide
  - Keyboard shortcuts
  - Tips and tricks

#### Format-Specific Help Buttons
- **Default Formats**: Help buttons added to SDXL, Flux, ImageFX, ImageFX Natural
- **Custom Formats**: Dynamic help buttons for user-created formats
- **Color**: Green background (`bg-green-100`) for visual distinction

### 4. **Help Modal Features**

#### Visual Design
- **Theme**: Dark mode (gray-900 background)
- **Layout**: Responsive with max-width 4xl
- **Icons**: FontAwesome icons for visual clarity
- **Colors**: Color-coded sections (blue, green, yellow, orange, etc.)

#### Content Structure
Each help modal includes:
1. **概要 (Overview)**: Brief description of the prompt's purpose
2. **使用場所 (Usage Location)**: Where in the UI it's used
3. **使用経路 (Usage Route)**: Step-by-step visual route diagram
4. **例 (Examples)**: Sample input/output examples
5. **ヒント (Tips)**: Usage tips and best practices
6. **カテゴリ (Categories)**: For categorization prompts
7. **抽出情報 (Extracted Info)**: For analysis prompts

#### Interaction
- **Open**: Click help button
- **Close**: 
  - Click close button (X)
  - Click outside modal
  - Press ESC key
- **Scroll**: Supports scrolling for long content

### 5. **Route Documentation Examples**

#### Text to Prompt Route
```
【使用経路】
1. Text to Promptタブを開く
2. AI Format: "SDXL Tags"を選択
3. テキストを入力
4. "AI Generate"ボタンをクリック
→ このプロンプトが使用される
```

#### Image to Prompt Route
```
【使用経路】
1. Image to Promptタブを開く
2. 画像をアップロード
3. Vision Model選択
4. "Analyze Image"ボタンをクリック
→ このプロンプトが使用される
→ 画像の詳細分析を実行
```

### 6. **Technical Implementation**

#### JavaScript Functions
```javascript
// Show help for specific prompt
showSystemPromptHelp(promptId)

// Show general system help
App.showSystemHelp()
```

#### Data Structure
```javascript
SYSTEM_PROMPTS_HELP = {
  'PROMPT_NAME': {
    id: string,
    category: string,
    usage: string,
    description: string,
    route: string,
    example: string (optional),
    tips: array (optional),
    categories: array (optional),
    extracts: array (optional)
  }
}
```

## 🎨 Visual Indicators

### Color Coding
- **Blue (blue-400)**: General information, format prompts
- **Green (green-400)**: Usage locations, success states
- **Yellow (yellow-400)**: Usage routes, warnings
- **Orange (orange-400)**: Tips and hints
- **Purple (purple-400)**: Examples
- **Cyan (cyan-400)**: Categories
- **Pink (pink-400)**: Extracted information

### Icons Used
- `fa-question-circle`: Help buttons and headers
- `fa-tag`: Format indicators
- `fa-info-circle`: Information sections
- `fa-file-text`: Text-based features
- `fa-image`: Image-based features
- `fa-check-circle`: Success/completion

## 📱 Responsive Design
- **Desktop**: Full modal with side-by-side content
- **Tablet**: Adjusted padding and font sizes
- **Mobile**: Stacked layout with full-width modal

## 🔧 Maintenance

### Adding New Help Documentation
1. Add entry to `SYSTEM_PROMPTS_HELP` object in `systemPromptsHelp.js`
2. Include required fields: id, category, usage, description, route
3. Add optional fields as needed: example, tips, categories, extracts
4. Help button will automatically appear for custom formats

### Updating Existing Documentation
1. Locate prompt in `systemPromptsHelp.js`
2. Update relevant fields
3. Rebuild application with `npm run build`
4. Restart service with `pm2 restart ss-prompt-manager`

## 🌐 Accessibility
- **Language**: Bilingual support (Japanese/English)
- **Keyboard Navigation**: ESC key support
- **Screen Readers**: Semantic HTML with proper ARIA labels
- **Visual Contrast**: High contrast dark theme

## 🚀 User Benefits
1. **Self-Service Documentation**: Users can understand the system without external help
2. **Visual Route Diagrams**: Clear understanding of how prompts flow through the system
3. **Contextual Help**: Help available exactly where needed
4. **Examples & Tips**: Practical guidance for effective usage
5. **Developer Understanding**: Clear documentation for system modification

## 📊 Coverage
- **100% Default Formats**: All default formats documented
- **Dynamic Custom Formats**: Automatic help button generation
- **Translation Systems**: Complete translation flow documentation
- **Image Analysis**: Full vision AI workflow documentation
- **Utility Functions**: All helper prompts documented

## 🔄 Future Enhancements
- Interactive tutorials
- Video walkthroughs
- Searchable help content
- Context-sensitive help suggestions
- Multi-language help content
- Help analytics to identify common issues