const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Adobe Express SDK Integration Service
 * 
 * This service handles all interactions with the Adobe Express SDK,
 * providing a clean interface for other parts of the application.
 */
class AdobeExpressService {
  constructor() {
    this.apiKey = process.env.ADOBE_EXPRESS_API_KEY;
    this.apiEndpoint = process.env.ADOBE_EXPRESS_API_ENDPOINT || 'https://api.adobe.io/express';
    this.clientId = process.env.ADOBE_EXPRESS_CLIENT_ID;
    this.clientSecret = process.env.ADOBE_EXPRESS_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Initialize the Adobe Express SDK
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      // Authenticate with Adobe Express API
      await this.authenticate();
      logger.info('Adobe Express SDK initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Adobe Express SDK:', error);
      return false;
    }
  }

  /**
   * Authenticate with Adobe Express API
   * @returns {Promise<string>} Access token
   */
  async authenticate() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now()) {
        return this.accessToken;
      }

      // Request new token
      const response = await axios.post(
        `${this.apiEndpoint}/auth/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      logger.info('Successfully authenticated with Adobe Express API');
      return this.accessToken;
    } catch (error) {
      logger.error('Authentication with Adobe Express API failed:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Get headers for API requests
   * @returns {Promise<Object>} Headers object
   */
  async getHeaders() {
    const token = await this.authenticate();
    return {
      'Authorization': `Bearer ${token}`,
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a new design from a template
   * @param {string} templateId Adobe Express template ID
   * @param {Object} variables Template variables
   * @returns {Promise<Object>} Created design
   */
  async createDesignFromTemplate(templateId, variables) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.post(
        `${this.apiEndpoint}/designs`,
        {
          template_id: templateId,
          variables
        },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create design from template:', error);
      throw new Error('Design creation failed');
    }
  }

  /**
   * Get a design by ID
   * @param {string} designId Adobe Express design ID
   * @returns {Promise<Object>} Design data
   */
  async getDesign(designId) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.get(
        `${this.apiEndpoint}/designs/${designId}`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to get design ${designId}:`, error);
      throw new Error('Failed to retrieve design');
    }
  }

  /**
   * Update a design
   * @param {string} designId Adobe Express design ID
   * @param {Object} updates Updates to apply
   * @returns {Promise<Object>} Updated design
   */
  async updateDesign(designId, updates) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.patch(
        `${this.apiEndpoint}/designs/${designId}`,
        updates,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to update design ${designId}:`, error);
      throw new Error('Design update failed');
    }
  }

  /**
   * Generate a preview URL for a design
   * @param {string} designId Adobe Express design ID
   * @returns {Promise<string>} Preview URL
   */
  async generatePreviewUrl(designId) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.post(
        `${this.apiEndpoint}/designs/${designId}/preview`,
        {},
        { headers }
      );
      
      return response.data.preview_url;
    } catch (error) {
      logger.error(`Failed to generate preview for design ${designId}:`, error);
      throw new Error('Preview generation failed');
    }
  }

  /**
   * Generate a thumbnail URL for a design
   * @param {string} designId Adobe Express design ID
   * @param {Object} options Thumbnail options
   * @returns {Promise<string>} Thumbnail URL
   */
  async generateThumbnailUrl(designId, options = {}) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.post(
        `${this.apiEndpoint}/designs/${designId}/thumbnail`,
        {
          width: options.width || 300,
          height: options.height || 300,
          format: options.format || 'png'
        },
        { headers }
      );
      
      return response.data.thumbnail_url;
    } catch (error) {
      logger.error(`Failed to generate thumbnail for design ${designId}:`, error);
      throw new Error('Thumbnail generation failed');
    }
  }

  /**
   * Export a design in the specified format
   * @param {string} designId Adobe Express design ID
   * @param {string} format Export format (png, jpg, pdf, svg)
   * @param {Object} options Export options
   * @returns {Promise<Object>} Export data with URL
   */
  async exportDesign(designId, format, options = {}) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.post(
        `${this.apiEndpoint}/designs/${designId}/exports`,
        {
          format,
          quality: options.quality || 'high',
          width: options.width,
          height: options.height
        },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to export design ${designId} as ${format}:`, error);
      throw new Error('Design export failed');
    }
  }

  /**
   * Get available templates
   * @param {Object} filters Filter criteria
   * @param {number} page Page number
   * @param {number} limit Items per page
   * @returns {Promise<Object>} Templates data
   */
  async getTemplates(filters = {}, page = 1, limit = 20) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.get(
        `${this.apiEndpoint}/templates`,
        { 
          headers,
          params: {
            ...filters,
            page,
            limit
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get templates:', error);
      throw new Error('Failed to retrieve templates');
    }
  }

  /**
   * Get a template by ID
   * @param {string} templateId Adobe Express template ID
   * @returns {Promise<Object>} Template data
   */
  async getTemplate(templateId) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.get(
        `${this.apiEndpoint}/templates/${templateId}`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to get template ${templateId}:`, error);
      throw new Error('Failed to retrieve template');
    }
  }

  /**
   * Generate an edit URL for a design
   * @param {string} designId Adobe Express design ID
   * @param {Object} options URL options
   * @returns {Promise<string>} Edit URL
   */
  async generateEditUrl(designId, options = {}) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.post(
        `${this.apiEndpoint}/designs/${designId}/edit-url`,
        {
          redirect_uri: options.redirectUri,
          state: options.state
        },
        { headers }
      );
      
      return response.data.edit_url;
    } catch (error) {
      logger.error(`Failed to generate edit URL for design ${designId}:`, error);
      throw new Error('Edit URL generation failed');
    }
  }
}

module.exports = new AdobeExpressService();
