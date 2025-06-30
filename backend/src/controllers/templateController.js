const Template = require('../models/template');
const Business = require('../models/business');
const Location = require('../models/location');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get all templates
// @route   GET /api/templates
// @access  Private
exports.getTemplates = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { industry, category, season, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (industry) query.industry = industry;
    if (category) query.category = category;
    if (season) query[`seasonality.${season}`] = true;
    
    // Execute query with pagination
    const templates = await Template.find(query)
      .sort({ 'popularity.usageCount': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    // Get total count for pagination
    const total = await Template.countDocuments(query);
    
    res.json({ 
      templates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('Error in getTemplates:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get template by ID
// @route   GET /api/templates/:id
// @access  Private
exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    // Check if template exists
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if template is active or user is admin
    if (!template.isActive && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Template is not available' });
    }

    res.json({ template });
  } catch (err) {
    logger.error('Error in getTemplateById:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get templates by industry
// @route   GET /api/templates/industry/:industry
// @access  Private
exports.getTemplatesByIndustry = async (req, res) => {
  try {
    const { industry } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Validate industry
    const validIndustries = [
      'restaurant',
      'retail',
      'salon',
      'plumbing',
      'electrical',
      'landscaping',
      'auto_repair',
      'fitness',
      'healthcare',
      'legal',
      'real_estate',
      'other'
    ];
    
    if (!validIndustries.includes(industry)) {
      return res.status(400).json({ message: 'Invalid industry' });
    }
    
    // Execute query with pagination
    const templates = await Template.find({ 
      industry,
      isActive: true
    })
      .sort({ 'popularity.usageCount': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    // Get total count for pagination
    const total = await Template.countDocuments({ 
      industry,
      isActive: true
    });
    
    res.json({ 
      templates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('Error in getTemplatesByIndustry:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get templates by category
// @route   GET /api/templates/category/:category
// @access  Private
exports.getTemplatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Validate category
    const validCategories = [
      'social_media',
      'flyer',
      'business_card',
      'menu',
      'promotion',
      'advertisement',
      'email',
      'logo',
      'brochure',
      'postcard',
      'banner',
      'other'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    // Execute query with pagination
    const templates = await Template.find({ 
      category,
      isActive: true
    })
      .sort({ 'popularity.usageCount': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    // Get total count for pagination
    const total = await Template.countDocuments({ 
      category,
      isActive: true
    });
    
    res.json({ 
      templates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('Error in getTemplatesByCategory:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search templates
// @route   GET /api/templates/search
// @access  Private
exports.searchTemplates = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Execute search query
    const templates = await Template.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    })
      .sort({ 'popularity.usageCount': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    // Get total count for pagination
    const total = await Template.countDocuments({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    });
    
    res.json({ 
      templates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('Error in searchTemplates:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get popular templates
// @route   GET /api/templates/popular
// @access  Private
exports.getPopularTemplates = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get popular templates
    const templates = await Template.find({ isActive: true })
      .sort({ 'popularity.usageCount': -1 })
      .limit(parseInt(limit));
    
    res.json({ templates });
  } catch (err) {
    logger.error('Error in getPopularTemplates:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get seasonal templates
// @route   GET /api/templates/seasonal
// @access  Private
exports.getSeasonalTemplates = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Determine current season
    const now = new Date();
    const month = now.getMonth();
    let currentSeason;
    
    if (month >= 2 && month <= 4) {
      currentSeason = 'spring';
    } else if (month >= 5 && month <= 7) {
      currentSeason = 'summer';
    } else if (month >= 8 && month <= 10) {
      currentSeason = 'fall';
    } else {
      currentSeason = 'winter';
    }
    
    // Check for upcoming holidays (simplified example)
    const day = now.getDate();
    const upcomingHolidays = [];
    
    // Very simplified holiday detection
    if (month === 11) {
      upcomingHolidays.push('christmas');
    } else if (month === 0 && day < 15) {
      upcomingHolidays.push('new_years');
    } else if (month === 1 && day < 15) {
      upcomingHolidays.push('valentines');
    } else if (month === 6 && day < 15) {
      upcomingHolidays.push('independence_day');
    } else if (month === 10 && day < 30) {
      upcomingHolidays.push('thanksgiving');
    }
    
    // Build query for seasonal templates
    const query = { 
      isActive: true,
      [`seasonality.${currentSeason}`]: true
    };
    
    // Add holiday filter if applicable
    if (upcomingHolidays.length > 0) {
      query['seasonality.holidays'] = { $in: upcomingHolidays };
    }
    
    // Get seasonal templates
    const templates = await Template.find(query)
      .sort({ 'popularity.usageCount': -1 })
      .limit(parseInt(limit));
    
    res.json({ 
      templates,
      currentSeason,
      upcomingHolidays
    });
  } catch (err) {
    logger.error('Error in getSeasonalTemplates:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get location-based templates
// @route   GET /api/templates/location-based
// @access  Private
exports.getLocationBasedTemplates = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { locationId } = req.query;
    const { limit = 10 } = req.query;
    
    // Get location
    const location = await Location.findById(locationId)
      .populate('business', 'owner industry');
    
    // Check if location exists
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Check if user owns the business
    if (location.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this location' });
    }
    
    // Determine location type based on data
    // This is a simplified example - would be enhanced with actual location intelligence
    const zipCode = location.address.zipCode;
    let locationType;
    
    // Simple heuristic for demo purposes
    if (zipCode.startsWith('9') || zipCode.startsWith('3')) {
      locationType = 'coastal';
    } else if (zipCode.startsWith('8') || zipCode.startsWith('7')) {
      locationType = 'mountain';
    } else if (zipCode.startsWith('1') || zipCode.startsWith('2')) {
      locationType = 'urban';
    } else {
      locationType = 'suburban';
    }
    
    // Build query for location-relevant templates
    const query = { 
      isActive: true,
      industry: location.business.industry,
      [`locationRelevance.${locationType}`]: true
    };
    
    // Get location-based templates
    const templates = await Template.find(query)
      .sort({ 'popularity.usageCount': -1 })
      .limit(parseInt(limit));
    
    res.json({ 
      templates,
      locationType,
      locationDetails: {
        name: location.name,
        address: location.address,
        industry: location.business.industry
      }
    });
  } catch (err) {
    logger.error('Error in getLocationBasedTemplates:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin routes for template management

// @desc    Create a new template (Admin only)
// @route   POST /api/templates
// @access  Admin
exports.createTemplate = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create templates' });
    }
    
    const { 
      name, 
      description, 
      industry, 
      category, 
      tags, 
      adobeExpressId, 
      thumbnailUrl, 
      previewUrl,
      dimensions,
      variables,
      seasonality,
      locationRelevance,
      isPremium
    } = req.body;
    
    // Create new template
    const template = new Template({
      name,
      description,
      industry,
      category,
      tags: tags || [],
      adobeExpressId,
      thumbnailUrl,
      previewUrl,
      dimensions: dimensions || { width: 1200, height: 628, unit: 'px' },
      variables: variables || [],
      seasonality: seasonality || {
        spring: false,
        summer: false,
        fall: false,
        winter: false,
        holidays: []
      },
      locationRelevance: locationRelevance || {
        urban: true,
        suburban: true,
        rural: true,
        coastal: false,
        mountain: false,
        desert: false
      },
      isPremium: isPremium || false
    });
    
    // Save template
    await template.save();
    
    res.status(201).json({ template });
  } catch (err) {
    logger.error('Error in createTemplate:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update template (Admin only)
// @route   PUT /api/templates/:id
// @access  Admin
exports.updateTemplate = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update templates' });
    }
    
    const template = await Template.findById(req.params.id);
    
    // Check if template exists
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Update fields
    const updateFields = [
      'name', 
      'description', 
      'industry', 
      'category', 
      'tags', 
      'adobeExpressId', 
      'thumbnailUrl', 
      'previewUrl',
      'dimensions',
      'variables',
      'seasonality',
      'locationRelevance',
      'isActive',
      'isPremium'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        template[field] = req.body[field];
      }
    });
    
    // Save updated template
    await template.save();
    
    res.json({ template });
  } catch (err) {
    logger.error('Error in updateTemplate:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete template (Admin only)
// @route   DELETE /api/templates/:id
// @access  Admin
exports.deleteTemplate = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete templates' });
    }
    
    const template = await Template.findById(req.params.id);
    
    // Check if template exists
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Delete template
    await template.remove();
    
    res.json({ message: 'Template deleted' });
  } catch (err) {
    logger.error('Error in deleteTemplate:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};
