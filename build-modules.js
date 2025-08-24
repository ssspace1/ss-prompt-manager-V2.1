// Build TypeScript modules to JavaScript for public access
const fs = require('fs');
const path = require('path');

// Simple TypeScript to JavaScript transpiler for our modules
function transpileTS(content) {
  return content
    // Remove import statements and replace with comments
    .replace(/import\s+.*?from\s+['"](.*?)['"];?\s*$/gm, (match, importPath) => {
      return `// Import: ${importPath}`;
    })
    // Remove export keywords from classes/functions
    .replace(/export\s+(class|function|const|let|var)/g, '$1')
    // Remove interface definitions
    .replace(/export\s+interface\s+.*?\{[\s\S]*?\}\s*$/gm, '')
    // Remove type annotations from parameters
    .replace(/(\w+):\s*[\w\[\]|&<>,\s]+(?=\s*[,)])/g, '$1')
    // Remove return type annotations
    .replace(/\):\s*[\w\[\]|&<>,\s]+(?=\s*\{)/g, ') ')
    // Remove generic type parameters
    .replace(/<[^>]+>/g, '')
    // Remove access modifiers
    .replace(/\b(private|protected|public)\s+/g, '')
    // Convert const assertions
    .replace(/as\s+const/g, '')
    // Remove optional parameter markers
    .replace(/\?:/g, ':')
    .replace(/\?(?=\s*[,)])/g, '');
}

// Build main app module
const mainAppSource = fs.readFileSync('src/components/app/mainApp.ts', 'utf8');
const mainAppJS = transpileTS(mainAppSource);

// Build system prompts modal module  
const modalSource = fs.readFileSync('src/components/ui/SystemPromptsModal.ts', 'utf8');
const modalJS = transpileTS(modalSource);

// Build system prompts manager
const promptsSource = fs.readFileSync('src/core/config/systemPrompts.ts', 'utf8');
const promptsJS = transpileTS(promptsSource);

// Write JavaScript modules
fs.writeFileSync('public/static/dist/mainApp.js', mainAppJS);
fs.writeFileSync('public/static/dist/SystemPromptsModal.js', modalJS);
fs.writeFileSync('public/static/dist/systemPrompts.js', promptsJS);

console.log('✅ TypeScript modules compiled to JavaScript');