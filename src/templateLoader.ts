// Template loader utility for SS Prompt Manager
// Handles loading and processing of HTML templates for Cloudflare Workers

// Since we can't use fs in Cloudflare Workers, we'll import the template directly
import mainTemplate from './templates/main.html?raw'

export class TemplateLoader {
  private static templateCache = new Map<string, string>()

  /**
   * Load and cache a template
   * @param templateName Name of the template file (without .html extension)
   * @returns Template content as string
   */
  static loadTemplate(templateName: string): string {
    const cacheKey = templateName
    
    // Check cache first
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!
    }

    let templateContent: string

    // For now, we only have the main template
    // In the future, we could add more templates here
    switch (templateName) {
      case 'main':
        templateContent = mainTemplate
        break
      default:
        throw new Error(`Template ${templateName} not found`)
    }
    
    // Cache the template
    this.templateCache.set(cacheKey, templateContent)
    
    return templateContent
  }

  /**
   * Load template with variable substitution
   * @param templateName Name of the template file
   * @param variables Object containing variable replacements
   * @returns Processed template with variables replaced
   */
  static loadTemplateWithVars(templateName: string, variables: Record<string, string> = {}): string {
    let template = this.loadTemplate(templateName)
    
    // Replace variables in the format {{variableName}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      template = template.replace(regex, value)
    })
    
    return template
  }

  /**
   * Clear template cache (useful for development)
   */
  static clearCache(): void {
    this.templateCache.clear()
  }

  /**
   * Get main application template with cache-busting
   * @returns Main HTML template with timestamped assets
   */
  static getMainTemplate(): string {
    const timestamp = Date.now()
    return this.loadTemplateWithVars('main', {
      timestamp: timestamp.toString()
    })
  }
}

// Export convenience function for main template
export function getMainHtml(): string {
  return TemplateLoader.getMainTemplate()
}