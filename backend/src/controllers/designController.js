const aiDesignEngine = require("../services/aiDesignEngine");
const Design = require('../models/design');
const Business = require('../models/business');
const Location = require('../models/location');
const Template = require('../models/template');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Create a new design
// @route   POST /api/designs
// @access  Private
exports.createDesign = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, business: businessId, category, template: templateId, location: locationId } = req.body;

    // Check if business exists and user owns it
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create designs for this business' });
    }

    // Check if template exists
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if location exists if provided
    if (locationId) {
      const location = await Location.findOne({ _id: locationId, business: businessId });
      if (!location) {
        return res.status(404).json({ message: 'Location not found or does not belong to this business' });
      }
    }

    // Create new design
    const design = new Design({
      // --- AI Engine Integration ---
      // Let the AI engine suggest a better name or description
      const AIsuggestions = aiDesignEngine.suggestImprovements({ name, description });
      name = AIsuggestions.name || name;
      description = AIsuggestions.description || description;
      name,
      description: req.body.description || '',
      business: businessId,
      location: locationId,
      template: templateId,
      category,
      content: {
        variables: req.body.variables || {},
        customizations: req.body.customizations || {}
      },
      dimensions: template.dimensions,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    // Initialize Adobe Express data (placeholder for actual SDK integration)
    design.adobeExpressData = {
      designId: `ae-${Math.random().toString(36).substring(2, 15)}`,
      editUrl: `https://express.adobe.com/design/${Math.random().toString(36).substring(2, 15)}`,
      previewUrl: template.previewUrl,
      thumbnailUrl: template.thumbnailUrl,
      lastSyncedAt: new Date()
    };

    // Save design
    await design.save();

    // Update template popularity
    template.popularity.usageCount += 1;
    await template.save();

    res.status(201).json({ design });
  } catch (err) {
    logger.error('Error in createDesign:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all designs for current user's businesses
// @route   GET /api/designs
// @access  Private
exports.getDesigns = async (req, res) => {
  try {
    // Get query parameters
    const { business, status, category, page = 1, limit = 20 } = req.query;

    // Get all businesses owned by user
    const businesses = await Business.find({ owner: req.user.id }).select('_id');
    const businessIds = businesses.map(business => business._id);

    // Build query
    const query = { business: { $in: businessIds } };

    if (business) {
      // Verify user owns this business
      const ownsBusiness = businessIds.some(id => id.toString() === business);
      if (!ownsBusiness) {
        return res.status(403).json({ message: 'Not authorized to access this business' });
      }
      query.business = business;
    }

    if (status) query.status = status;
    if (category) query.category = category;

    // Execute query with pagination
    const designs = await Design.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('template', 'name category thumbnailUrl')
      .populate('business', 'name industry')
      .populate('location', 'name address');

    // Get total count for pagination
    const total = await Design.countDocuments(query);

    res.json({
      designs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('Error in getDesigns:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get design by ID
// @route   GET /api/designs/:id
// @access  Private
exports.getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('template', 'name category thumbnailUrl variables')
      .populate('business', 'name industry owner')
      .populate('location', 'name address');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this design' });
    }

    // Increment view count
    design.analytics.views += 1;
    await design.save();

    res.json({ design });
  } catch (err) {
    logger.error('Error in getDesignById:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update design
// @route   PUT /api/designs/:id
// @access  Private
exports.updateDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('business', 'owner');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this design' });
    }

    // Update fields
    const updateFields = [
      'name',
      'description',
      'status',
      'location'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        design[field] = req.body[field];
      }
    });

    // Update content if provided
    if (req.body.content) {
      if (req.body.content.variables) {
        design.content.variables = {
          ...design.content.variables,
          ...req.body.content.variables
        };
      }

      if (req.body.content.customizations) {
        design.content.customizations = {
          ...design.content.customizations,
          ...req.body.content.customizations
        };
      }
    }

    // Update Adobe Express data if provided
    if (req.body.adobeExpressData) {
      design.adobeExpressData = {
        ...design.adobeExpressData,
        ...req.body.adobeExpressData,
        lastSyncedAt: new Date()
      };
    }

    // Update updatedBy field
    design.updatedBy = req.user.id;

    // Save updated design
    await design.save();

    res.json({ design });
  } catch (err) {
    logger.error('Error in updateDesign:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete design
// @route   DELETE /api/designs/:id
// @access  Private
exports.deleteDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('business', 'owner');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this design' });
    }

    // Delete the design
    await design.remove();

    res.json({ message: 'Design deleted' });
  } catch (err) {
    logger.error('Error in deleteDesign:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Publish a design
// @route   POST /api/designs/:id/publish
// @access  Private
exports.publishDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('business', 'owner');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to publish this design' });
    }

    // Update status to published
    design.status = 'published';
    design.analytics.lastPublishedAt = new Date();
    design.updatedBy = req.user.id;

    // Save updated design
    await design.save();

    res.json({ design });
  } catch (err) {
    logger.error('Error in publishDesign:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Duplicate a design
// @route   POST /api/designs/:id/duplicate
// @access  Private
exports.duplicateDesign = async (req, res) => {
  try {
    const sourceDesign = await Design.findById(req.params.id)
      .populate('business', 'owner');

    // Check if design exists
    if (!sourceDesign) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (sourceDesign.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to duplicate this design' });
    }

    // Create new design based on source
    const newDesign = new Design({
      name: `${sourceDesign.name} (Copy)`,
      description: sourceDesign.description,
      business: sourceDesign.business._id,
      location: sourceDesign.location,
      template: sourceDesign.template,
      category: sourceDesign.category,
      content: sourceDesign.content,
      dimensions: sourceDesign.dimensions,
      localIntelligence: sourceDesign.localIntelligence,
      reviewsIncluded: sourceDesign.reviewsIncluded,
      seoMetadata: sourceDesign.seoMetadata,
      status: 'draft',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    // Initialize Adobe Express data (placeholder for actual SDK integration)
    newDesign.adobeExpressData = {
      designId: `ae-${Math.random().toString(36).substring(2, 15)}`,
      editUrl: `https://express.adobe.com/design/${Math.random().toString(36).substring(2, 15)}`,
      previewUrl: sourceDesign.adobeExpressData.previewUrl,
      thumbnailUrl: sourceDesign.adobeExpressData.thumbnailUrl,
      lastSyncedAt: new Date()
    };

    // Save new design
    await newDesign.save();

    res.status(201).json({ design: newDesign });
  } catch (err) {
    logger.error('Error in duplicateDesign:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all exports for a design
// @route   GET /api/designs/:id/exports
// @access  Private
exports.getDesignExports = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('business', 'owner')
      .select('exportFormats business');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this design' });
    }

    res.json({ exports: design.exportFormats });
  } catch (err) {
    logger.error('Error in getDesignExports:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new export for a design
// @route   POST /api/designs/:id/export
// @access  Private
exports.exportDesign = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { format } = req.body;
    const design = await Design.findById(req.params.id)
      .populate('business', 'owner');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to export this design' });
    }

    // Generate export URL (placeholder for actual SDK integration)
    const exportUrl = `https://localbrand.pro/exports/${design._id}-${format}-${Date.now()}.${format}`;
    
    // Create export record
    const exportRecord = {
      format,
      url: exportUrl,
      size: Math.floor(Math.random() * 5000000) + 100000, // Random size between 100KB and 5MB
      createdAt: new Date()
    };

    // Add to design's exports
    design.exportFormats.push(exportRecord);
    await design.save();

    res.json({ export: exportRecord });
  } catch (err) {
    logger.error('Error in exportDesign:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Sync design with Adobe Express
// @route   POST /api/designs/:id/sync
// @access  Private
exports.syncWithAdobeExpress = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('business', 'owner');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to sync this design' });
    }

    // Placeholder for actual Adobe Express SDK integration
    // In a real implementation, this would call the Adobe Express API
    design.adobeExpressData = {
      ...design.adobeExpressData,
      lastSyncedAt: new Date(),
      previewUrl: design.adobeExpressData.previewUrl || `https://express-preview.adobe.com/${Math.random().toString(36).substring(2, 15)}`,
      thumbnailUrl: design.adobeExpressData.thumbnailUrl || `https://express-thumbnail.adobe.com/${Math.random().toString(36).substring(2, 15)}`
    };

    // Update updatedBy field
    design.updatedBy = req.user.id;

    // Save updated design
    await design.save();

    res.json({ 
      message: 'Design synced with Adobe Express',
      adobeExpressData: design.adobeExpressData
    });
  } catch (err) {
    logger.error('Error in syncWithAdobeExpress:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get analytics for a design
// @route   GET /api/designs/:id/analytics
// @access  Private
exports.getDesignAnalytics = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('business', 'owner')
      .select('analytics business name category');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this design' });
    }

    res.json({ 
      analytics: design.analytics,
      name: design.name,
      category: design.category
    });
  } catch (err) {
    logger.error('Error in getDesignAnalytics:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Apply location intelligence enhancements to a design
// @route   POST /api/designs/:id/enhance
// @access  Private
exports.enhanceDesignWithLocationData = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('business', 'owner')
      .populate('location');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to enhance this design' });
    }

    // Check if design has a location
    if (!design.location) {
      return res.status(400).json({ message: 'Design must have a location to apply enhancements' });
    }

    // Apply location intelligence enhancements
    // This is a placeholder for actual implementation
    design.localIntelligence = {
      demographicsApplied: true,
      weatherInfluenced: true,
      landmarksIncluded: design.location.localData?.landmarks?.slice(0, 2).map(l => l.name) || [],
      seasonalAdjustments: getCurrentSeason(),
      localKeywords: [
        design.location.address.city,
        design.location.address.state,
        `${design.location.address.city} ${design.business.industry}`
      ]
    };

    // Update SEO metadata
    design.seoMetadata = {
      title: `${design.name} - ${design.location.address.city}, ${design.location.address.state}`,
      description: `${design.description || design.name} for ${design.location.name} in ${design.location.address.city}, ${design.location.address.state}`,
      keywords: [
        design.business.industry,
        design.location.address.city,
        design.location.address.state,
        design.category
      ],
      altTexts: {
        main: `${design.name} for ${design.location.name} in ${design.location.address.city}, ${design.location.address.state}`
      },
      schemaMarkup: generateSchemaMarkup(design)
    };

    // Update updatedBy field
    design.updatedBy = req.user.id;

    // Save updated design
    await design.save();

    res.json({ 
      message: 'Location intelligence enhancements applied',
      localIntelligence: design.localIntelligence,
      seoMetadata: design.seoMetadata
    });
  } catch (err) {
    logger.error('Error in enhanceDesignWithLocationData:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add reviews to a design
// @route   POST /api/designs/:id/reviews
// @access  Private
exports.addReviewsToDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('business', 'owner')
      .populate('location');

    // Check if design exists
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if user owns the business
    if (design.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this design' });
    }

    // Check if design has a location
    if (!design.location) {
      return res.status(400).json({ message: 'Design must have a location to add reviews' });
    }

    // Check if location has reviews
    if (!design.location.reviews || !design.location.reviews.topReviews || design.location.reviews.topReviews.length === 0) {
      return res.status(400).json({ message: 'Location has no reviews to add' });
    }

    // Get highlighted reviews
    const highlightedReviews = design.location.reviews.topReviews.filter(review => review.highlight);
    
    if (highlightedReviews.length === 0) {
      return res.status(400).json({ message: 'No highlighted reviews available' });
    }

    // Add reviews to design
    design.reviewsIncluded = highlightedReviews.map(review => ({
      source: review.source,
      id: review._id.toString(),
      snippet: review.text.length > 100 ? `${review.text.substring(0, 97)}...` : review.text
    }));

    // Update updatedBy field
    design.updatedBy = req.user.id;

    // Save updated design
    await design.save();

    res.json({ 
      message: 'Reviews added to design',
      reviewsIncluded: design.reviewsIncluded
    });
  } catch (err) {
    logger.error('Error in addReviewsToDesign:', err);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Design not found' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get current season
function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth();
  
  if (month >= 2 && month <= 4) {
    return 'spring';
  } else if (month >= 5 && month <= 7) {
    return 'summer';
  } else if (month >= 8 && month <= 10) {
    return 'fall';
  } else {
    return 'winter';
  }
}

// Helper function to generate schema markup
function generateSchemaMarkup(design) {
  // This is a simplified example - would be more comprehensive in production
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": design.business.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": design.location.address.street,
      "addressLocality": design.location.address.city,
      "addressRegion": design.location.address.state,
      "postalCode": design.location.address.zipCode,
      "addressCountry": design.location.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": design.location.coordinates.coordinates[1],
      "longitude": design.location.coordinates.coordinates[0]
    },
    "image": design.adobeExpressData.previewUrl
  };
  
  return JSON.stringify(schema);
}
