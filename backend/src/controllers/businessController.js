const Business = require('../models/business');
const Location = require('../models/location');
const Design = require('../models/design');
const Template = require('../models/template');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Create a new business
// @route   POST /api/businesses
// @access  Private
exports.createBusiness = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, industry, contact, brand } = req.body;

    // Create new business
    const business = new Business({
      name,
      description,
      industry,
      owner: req.user.id,
      contact,
      brand
    });

    // Set trial period for subscription
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial
    
    business.subscription = {
      plan: 'free',
      status: 'trial',
      trialEnds: trialEndDate
    };

    // Save business to database
    await business.save();

    res.status(201).json({ business });
  } catch (err) {
    logger.error('Error in createBusiness:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all businesses for current user
// @route   GET /api/businesses
// @access  Private
exports.getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.user.id });
    res.json({ businesses });
  } catch (err) {
    logger.error('Error in getBusinesses:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get business by ID
// @route   GET /api/businesses/:id
// @access  Private
exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    // Check if business exists
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user owns the business
    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this business' });
    }

    res.json({ business });
  } catch (err) {
    logger.error('Error in getBusinessById:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update business
// @route   PUT /api/businesses/:id
// @access  Private
exports.updateBusiness = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const business = await Business.findById(req.params.id);

    // Check if business exists
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user owns the business
    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this business' });
    }

    // Update fields
    const { name, description, industry, contact, brand } = req.body;
    
    if (name) business.name = name;
    if (description) business.description = description;
    if (industry) business.industry = industry;
    
    if (contact) {
      business.contact = {
        ...business.contact,
        ...contact
      };
    }
    
    if (brand) {
      business.brand = {
        ...business.brand,
        ...brand
      };
    }

    // Save updated business
    await business.save();

    res.json({ business });
  } catch (err) {
    logger.error('Error in updateBusiness:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete business
// @route   DELETE /api/businesses/:id
// @access  Private
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    // Check if business exists
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user owns the business
    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this business' });
    }

    // Delete all associated locations
    await Location.deleteMany({ business: req.params.id });
    
    // Delete all associated designs
    await Design.deleteMany({ business: req.params.id });

    // Delete the business
    await business.remove();

    res.json({ message: 'Business and all associated data deleted' });
  } catch (err) {
    logger.error('Error in deleteBusiness:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all locations for a business
// @route   GET /api/businesses/:id/locations
// @access  Private
exports.getBusinessLocations = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    // Check if business exists
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user owns the business
    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this business' });
    }

    // Get locations
    const locations = await Location.find({ business: req.params.id });

    res.json({ locations });
  } catch (err) {
    logger.error('Error in getBusinessLocations:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all designs for a business
// @route   GET /api/businesses/:id/designs
// @access  Private
exports.getBusinessDesigns = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    // Check if business exists
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user owns the business
    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this business' });
    }

    // Get designs
    const designs = await Design.find({ business: req.params.id })
      .sort({ createdAt: -1 })
      .populate('template', 'name category thumbnailUrl');

    res.json({ designs });
  } catch (err) {
    logger.error('Error in getBusinessDesigns:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recommended templates for a business
// @route   GET /api/businesses/:id/templates
// @access  Private
exports.getRecommendedTemplates = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    // Check if business exists
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user owns the business
    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this business' });
    }

    // Get business locations
    const locations = await Location.find({ business: req.params.id });
    
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
    
    // Build query for recommended templates
    const query = {
      industry: business.industry,
      isActive: true
    };
    
    // Add seasonal filter
    query[`seasonality.${currentSeason}`] = true;
    
    // Add location relevance if available
    if (locations.length > 0) {
      // Get first location for now (could be enhanced to consider all locations)
      const location = locations[0];
      
      // Determine location type based on ZIP code or other data
      // This is a simplified example - would be enhanced with actual location intelligence
      const zipCode = location.address.zipCode;
      
      // Simple heuristic for demo purposes
      if (zipCode.startsWith('9') || zipCode.startsWith('3')) {
        query['locationRelevance.coastal'] = true;
      } else if (zipCode.startsWith('8') || zipCode.startsWith('7')) {
        query['locationRelevance.mountain'] = true;
      } else if (zipCode.startsWith('1') || zipCode.startsWith('2')) {
        query['locationRelevance.urban'] = true;
      } else {
        query['locationRelevance.suburban'] = true;
      }
    }
    
    // Get templates
    const templates = await Template.find(query)
      .sort({ 'popularity.usageCount': -1 })
      .limit(20);

    res.json({ templates });
  } catch (err) {
    logger.error('Error in getRecommendedTemplates:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get business analytics
// @route   GET /api/businesses/:id/analytics
// @access  Private
exports.getBusinessAnalytics = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    // Check if business exists
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user owns the business
    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this business' });
    }

    // Get designs
    const designs = await Design.find({ business: req.params.id });
    
    // Calculate analytics
    const analytics = {
      totalDesigns: designs.length,
      designsByCategory: {},
      totalViews: 0,
      totalShares: 0,
      totalClicks: 0,
      totalConversions: 0,
      mostPopularDesigns: []
    };
    
    // Process designs
    designs.forEach(design => {
      // Count by category
      if (!analytics.designsByCategory[design.category]) {
        analytics.designsByCategory[design.category] = 0;
      }
      analytics.designsByCategory[design.category]++;
      
      // Sum analytics
      analytics.totalViews += design.analytics.views || 0;
      analytics.totalShares += design.analytics.shares || 0;
      analytics.totalClicks += design.analytics.clicks || 0;
      analytics.totalConversions += design.analytics.conversions || 0;
    });
    
    // Get most popular designs
    analytics.mostPopularDesigns = await Design.find({ business: req.params.id })
      .sort({ 'analytics.views': -1 })
      .limit(5)
      .select('name category analytics.views analytics.clicks thumbnailUrl');

    res.json({ analytics });
  } catch (err) {
    logger.error('Error in getBusinessAnalytics:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};
