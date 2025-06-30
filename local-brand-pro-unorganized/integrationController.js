const adobeExpressService = require('../integrations/adobeExpressService');
const locationIntelligenceService = require('../integrations/locationIntelligenceService');
const reviewIntegrationService = require('../integrations/reviewIntegrationService');
const logger = require('../utils/logger');

/**
 * Integration Controller
 * 
 * This controller handles all API endpoints related to third-party integrations,
 * including Adobe Express SDK, location intelligence services, and review platforms.
 */

// Adobe Express SDK Integration Endpoints

/**
 * Initialize Adobe Express SDK for a session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.initializeAdobeExpress = async (req, res) => {
  try {
    const initialized = await adobeExpressService.initialize();
    
    if (initialized) {
      res.json({ success: true, message: 'Adobe Express SDK initialized successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to initialize Adobe Express SDK' });
    }
  } catch (error) {
    logger.error('Error initializing Adobe Express SDK:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Create a new design using Adobe Express SDK
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createDesignWithAdobeExpress = async (req, res) => {
  try {
    const { templateId, variables } = req.body;
    
    const design = await adobeExpressService.createDesignFromTemplate(templateId, variables);
    
    // Generate preview and thumbnail URLs
    const previewUrl = await adobeExpressService.generatePreviewUrl(design.id);
    const thumbnailUrl = await adobeExpressService.generateThumbnailUrl(design.id);
    
    res.json({
      success: true,
      design: {
        ...design,
        previewUrl,
        thumbnailUrl
      }
    });
  } catch (error) {
    logger.error('Error creating design with Adobe Express:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get templates from Adobe Express
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAdobeExpressTemplates = async (req, res) => {
  try {
    const { filters, page, limit } = req.query;
    
    const templates = await adobeExpressService.getTemplates(
      filters ? JSON.parse(filters) : {},
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20
    );
    
    res.json({ success: true, templates });
  } catch (error) {
    logger.error('Error getting Adobe Express templates:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Generate edit URL for Adobe Express design
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateAdobeExpressEditUrl = async (req, res) => {
  try {
    const { designId, redirectUri, state } = req.body;
    
    const editUrl = await adobeExpressService.generateEditUrl(designId, { redirectUri, state });
    
    res.json({ success: true, editUrl });
  } catch (error) {
    logger.error('Error generating Adobe Express edit URL:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Export design from Adobe Express
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.exportAdobeExpressDesign = async (req, res) => {
  try {
    const { designId, format, quality, width, height } = req.body;
    
    const exportData = await adobeExpressService.exportDesign(designId, format, { quality, width, height });
    
    res.json({ success: true, export: exportData });
  } catch (error) {
    logger.error('Error exporting Adobe Express design:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Location Intelligence Integration Endpoints

/**
 * Geocode an address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.geocodeAddress = async (req, res) => {
  try {
    const address = req.query.address ? JSON.parse(req.query.address) : req.body.address;
    
    const geocodeResult = await locationIntelligenceService.geocodeAddress(address);
    
    res.json({ success: true, geocode: geocodeResult });
  } catch (error) {
    logger.error('Error geocoding address:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get demographic data for a location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLocationDemographics = async (req, res) => {
  try {
    const coordinates = req.query.coordinates ? JSON.parse(req.query.coordinates) : req.body.coordinates;
    const zipCode = req.query.zipCode || req.body.zipCode;
    
    const demographics = await locationIntelligenceService.getDemographicData(coordinates, zipCode);
    
    res.json({ success: true, demographics });
  } catch (error) {
    logger.error('Error getting location demographics:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get weather data for a location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLocationWeather = async (req, res) => {
  try {
    const coordinates = req.query.coordinates ? JSON.parse(req.query.coordinates) : req.body.coordinates;
    
    const weather = await locationIntelligenceService.getWeatherData(coordinates);
    
    res.json({ success: true, weather });
  } catch (error) {
    logger.error('Error getting location weather:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get landmarks near a location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getNearbyLandmarks = async (req, res) => {
  try {
    const coordinates = req.query.coordinates ? JSON.parse(req.query.coordinates) : req.body.coordinates;
    const radius = req.query.radius || req.body.radius || 5;
    
    const landmarks = await locationIntelligenceService.getNearbyLandmarks(coordinates, radius);
    
    res.json({ success: true, landmarks });
  } catch (error) {
    logger.error('Error getting nearby landmarks:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get competitors near a location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getNearbyCompetitors = async (req, res) => {
  try {
    const coordinates = req.query.coordinates ? JSON.parse(req.query.coordinates) : req.body.coordinates;
    const businessType = req.query.businessType || req.body.businessType;
    const radius = req.query.radius || req.body.radius || 5;
    
    const competitors = await locationIntelligenceService.getNearbyCompetitors(coordinates, businessType, radius);
    
    res.json({ success: true, competitors });
  } catch (error) {
    logger.error('Error getting nearby competitors:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get seasonal data for a location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLocationSeasonalData = async (req, res) => {
  try {
    const coordinates = req.query.coordinates ? JSON.parse(req.query.coordinates) : req.body.coordinates;
    
    const seasonalData = await locationIntelligenceService.getSeasonalData(coordinates);
    
    res.json({ success: true, seasonalData });
  } catch (error) {
    logger.error('Error getting location seasonal data:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Review Integration Endpoints

/**
 * Get Google reviews for a business
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getGoogleReviews = async (req, res) => {
  try {
    const placeId = req.query.placeId || req.body.placeId;
    
    const reviews = await reviewIntegrationService.getGoogleReviews(placeId);
    
    res.json({ success: true, reviews });
  } catch (error) {
    logger.error('Error getting Google reviews:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get Yelp reviews for a business
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getYelpReviews = async (req, res) => {
  try {
    const businessId = req.query.businessId || req.body.businessId;
    
    const reviews = await reviewIntegrationService.getYelpReviews(businessId);
    
    res.json({ success: true, reviews });
  } catch (error) {
    logger.error('Error getting Yelp reviews:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get all reviews for a business
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllReviews = async (req, res) => {
  try {
    const business = req.query.business ? JSON.parse(req.query.business) : req.body.business;
    
    const reviews = await reviewIntegrationService.getAllReviews(business);
    
    res.json({ success: true, reviews });
  } catch (error) {
    logger.error('Error getting all reviews:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Analyze review sentiment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.analyzeReviewSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const sentiment = reviewIntegrationService.analyzeReviewSentiment(text);
    
    res.json({ success: true, sentiment });
  } catch (error) {
    logger.error('Error analyzing review sentiment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
