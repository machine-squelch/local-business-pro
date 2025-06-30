// backend/src/services/aiDesignEngine.js
const axios = require('axios');
const logger = require('../utils/logger');

class AIDesignEngine {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    this.stabilityApiKey = process.env.STABILITY_API_KEY;
  }

  /**
   * Generate design using AI based on business data and user prompt
   */
  async generateDesign(businessData, prompt, designType = 'social_media') {
    try {
      // Step 1: Generate design concept using Claude
      const concept = await this.generateDesignConcept(businessData, prompt, designType);
      
      // Step 2: Generate visual elements using Stability AI
      const visualElements = await this.generateVisualElements(concept);
      
      // Step 3: Generate copy using OpenAI
      const copyElements = await this.generateCopy(businessData, concept);
      
      // Step 4: Optimize for local market
      const localOptimizations = await this.applyLocalOptimizations(businessData, concept);
      
      return {
        concept,
        visualElements,
        copyElements,
        localOptimizations,
        confidence: this.calculateConfidenceScore(concept, visualElements, copyElements)
      };
    } catch (error) {
      logger.error('AI Design generation failed:', error);
      throw error;
    }
  }

  async generateDesignConcept(businessData, prompt, designType) {
    const conceptPrompt = `
      Business: ${businessData.name} (${businessData.industry})
      Location: ${businessData.location?.city}, ${businessData.location?.state}
      Seasonal Context: ${this.getSeasonalContext()}
      Local Demographics: ${JSON.stringify(businessData.demographics)}
      User Request: ${prompt}
      Design Type: ${designType}
      
      Generate a comprehensive design concept including:
      1. Visual theme and mood
      2. Color palette recommendations
      3. Typography suggestions
      4. Layout composition
      5. Local relevance elements
      6. Call-to-action strategy
      
      Respond with structured JSON.
    `;

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: conceptPrompt
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${this.claudeApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });

    return JSON.parse(response.data.content[0].text);
  }

  async generateVisualElements(concept) {
    const imagePrompts = [
      `Professional ${concept.theme} style image for ${concept.businessType}, ${concept.mood} mood, ${concept.colorPalette.join(', ')} color scheme`,
      `Background pattern for ${concept.theme} business design, subtle and professional`,
      `Icon set for ${concept.businessType} in ${concept.style} style`
    ];

    const images = await Promise.all(
      imagePrompts.map(prompt => this.generateImage(prompt))
    );

    return {
      mainImage: images[0],
      backgroundPattern: images[1],
      icons: images[2],
      colorPalette: concept.colorPalette
    };
  }

  async generateImage(prompt) {
    try {
      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30
        },
        {
          headers: {
            Authorization: `Bearer ${this.stabilityApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        url: `data:image/png;base64,${response.data.artifacts[0].base64}`,
        seed: response.data.artifacts[0].seed
      };
    } catch (error) {
      logger.error('Image generation failed:', error);
      return null;
    }
  }

  async generateCopy(businessData, concept) {
    const copyPrompt = `
      Business: ${businessData.name}
      Industry: ${businessData.industry}
      Location: ${businessData.location?.city}, ${businessData.location?.state}
      Design Concept: ${JSON.stringify(concept)}
      
      Generate compelling marketing copy including:
      1. Headline (max 8 words)
      2. Subheadline (max 15 words)
      3. Body text (max 25 words)
      4. Call-to-action (max 4 words)
      5. Local relevance text (max 10 words)
      
      Make it persuasive, local, and action-oriented. Return as JSON.
    `;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: copyPrompt }],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return JSON.parse(response.data.choices[0].message.content);
  }

  async applyLocalOptimizations(businessData, concept) {
    return {
      localKeywords: await this.generateLocalKeywords(businessData),
      competitiveAdvantage: await this.identifyCompetitiveAdvantage(businessData),
      timingOptimization: this.getOptimalPostingTimes(businessData),
      localTrends: await this.getLocalTrends(businessData.location)
    };
  }

  async generateLocalKeywords(businessData) {
    const location = businessData.location;
    return [
      `${businessData.industry} ${location.city}`,
      `best ${businessData.industry} ${location.state}`,
      `local ${businessData.industry} near me`,
      `${location.city} ${businessData.industry} services`,
      `${businessData.industry} ${location.zipCode}`
    ];
  }

  async identifyCompetitiveAdvantage(businessData) {
    // Analyze reviews and business data to identify unique selling points
    const reviews = businessData.reviews?.topReviews || [];
    const commonPhrases = this.extractKeyPhrases(reviews);
    
    return {
      strengths: commonPhrases.slice(0, 3),
      uniqueFeatures: this.inferUniqueFeatures(businessData),
      localAdvantage: this.getLocalAdvantage(businessData)
    };
  }

  getOptimalPostingTimes(businessData) {
    const industry = businessData.industry;
    const timeZone = businessData.location?.timezone || 'America/New_York';
    
    const industryOptimalTimes = {
      'restaurant': ['11:30', '17:30', '19:00'],
      'retail': ['10:00', '14:00', '20:00'],
      'salon': ['09:00', '13:00', '18:00'],
      'fitness': ['06:00', '12:00', '18:00'],
      'default': ['09:00', '13:00', '17:00']
    };
    
    return industryOptimalTimes[industry] || industryOptimalTimes.default;
  }

  async getLocalTrends(location) {
    // Integrate with Google Trends API or social media APIs
    return {
      trendingTopics: ['local events', 'seasonal promotions', 'community involvement'],
      seasonalTrends: this.getSeasonalTrends(),
      localEvents: await this.getLocalEvents(location)
    };
  }

  getSeasonalContext() {
    const now = new Date();
    const month = now.getMonth();
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getSeasonalTrends() {
    const season = this.getSeasonalContext();
    const trends = {
      spring: ['renewal', 'fresh start', 'outdoor activities', 'cleaning'],
      summer: ['vacation', 'outdoor fun', 'barbecue', 'family time'],
      fall: ['back to school', 'harvest', 'cozy', 'preparation'],
      winter: ['holidays', 'warmth', 'indoor activities', 'celebration']
    };
    
    return trends[season];
  }

  async getLocalEvents(location) {
    // Mock implementation - would integrate with Eventbrite, Facebook Events, etc.
    return [
      { name: 'Local Farmers Market', date: new Date(), category: 'community' },
      { name: 'Chamber of Commerce Networking', date: new Date(), category: 'business' }
    ];
  }

  extractKeyPhrases(reviews) {
    const text = reviews.map(r => r.text).join(' ');
    const words = text.toLowerCase().split(/\W+/);
    const frequency = {};
    
    words.forEach(word => {
      if (word.length > 4) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  inferUniqueFeatures(businessData) {
    // Analyze business data to infer unique features
    const features = [];
    
    if (businessData.hours?.['24/7']) features.push('24/7 availability');
    if (businessData.location?.parking) features.push('convenient parking');
    if (businessData.experience > 10) features.push('over 10 years experience');
    
    return features;
  }

  getLocalAdvantage(businessData) {
    return [
      `locally owned and operated`,
      `serving ${businessData.location?.city} since ${businessData.yearEstablished || '2020'}`,
      `trusted by local families`
    ];
  }

  calculateConfidenceScore(concept, visualElements, copyElements) {
    let score = 0.5; // Base score
    
    if (concept && Object.keys(concept).length > 5) score += 0.2;
    if (visualElements && visualElements.mainImage) score += 0.15;
    if (copyElements && copyElements.headline) score += 0.15;
    
    return Math.min(score, 1.0);
  }

  /**
   * Generate multiple design variations for A/B testing
   */
  async generateDesignVariations(businessData, prompt, count = 3) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const variationPrompt = `${prompt} - Variation ${i + 1}: ${this.getVariationStyle(i)}`;
      const design = await this.generateDesign(businessData, variationPrompt);
      variations.push({
        id: `variation_${i + 1}`,
        design,
        style: this.getVariationStyle(i)
      });
    }
    
    return variations;
  }

  getVariationStyle(index) {
    const styles = ['modern minimalist', 'bold and vibrant', 'classic elegant', 'trendy casual'];
    return styles[index % styles.length];
  }
}

module.exports = new AIDesignEngine();