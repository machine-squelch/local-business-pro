const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { check } = require('express-validator');
const IntegrationController = require('../controllers/integrationController');

// @route   POST api/integrations/adobe-express/init
// @desc    Initialize Adobe Express SDK for a session
// @access  Private
router.post('/adobe-express/init', authMiddleware, IntegrationController.initializeAdobeExpress);

// @route   POST api/integrations/adobe-express/create-design
// @desc    Create a new design using Adobe Express SDK
// @access  Private
router.post(
  '/adobe-express/create-design',
  [
    authMiddleware,
    [
      check('templateId', 'Template ID is required').not().isEmpty(),
      check('variables', 'Variables object is required').isObject()
    ]
  ],
  IntegrationController.createDesignWithAdobeExpress
);

// @route   GET api/integrations/adobe-express/templates
// @desc    Get templates from Adobe Express
// @access  Private
router.get('/adobe-express/templates', authMiddleware, IntegrationController.getAdobeExpressTemplates);

// @route   POST api/integrations/adobe-express/edit-url
// @desc    Generate edit URL for Adobe Express design
// @access  Private
router.post(
  '/adobe-express/edit-url',
  [
    authMiddleware,
    [
      check('designId', 'Design ID is required').not().isEmpty()
    ]
  ],
  IntegrationController.generateAdobeExpressEditUrl
);

// @route   POST api/integrations/adobe-express/export
// @desc    Export design from Adobe Express
// @access  Private
router.post(
  '/adobe-express/export',
  [
    authMiddleware,
    [
      check('designId', 'Design ID is required').not().isEmpty(),
      check('format', 'Valid format is required').isIn(['png', 'jpg', 'pdf', 'svg'])
    ]
  ],
  IntegrationController.exportAdobeExpressDesign
);

// @route   GET api/integrations/location/geocode
// @desc    Geocode an address
// @access  Private
router.get(
  '/location/geocode',
  [
    authMiddleware,
    [
      check('address', 'Address is required').not().isEmpty()
    ]
  ],
  IntegrationController.geocodeAddress
);

// @route   GET api/integrations/location/demographics
// @desc    Get demographic data for a location
// @access  Private
router.get(
  '/location/demographics',
  [
    authMiddleware,
    [
      check('coordinates', 'Coordinates are required').isArray().isLength({ min: 2, max: 2 }),
      check('zipCode', 'ZIP code is required').not().isEmpty()
    ]
  ],
  IntegrationController.getLocationDemographics
);

// @route   GET api/integrations/location/weather
// @desc    Get weather data for a location
// @access  Private
router.get(
  '/location/weather',
  [
    authMiddleware,
    [
      check('coordinates', 'Coordinates are required').isArray().isLength({ min: 2, max: 2 })
    ]
  ],
  IntegrationController.getLocationWeather
);

// @route   GET api/integrations/location/landmarks
// @desc    Get landmarks near a location
// @access  Private
router.get(
  '/location/landmarks',
  [
    authMiddleware,
    [
      check('coordinates', 'Coordinates are required').isArray().isLength({ min: 2, max: 2 })
    ]
  ],
  IntegrationController.getNearbyLandmarks
);

// @route   GET api/integrations/location/competitors
// @desc    Get competitors near a location
// @access  Private
router.get(
  '/location/competitors',
  [
    authMiddleware,
    [
      check('coordinates', 'Coordinates are required').isArray().isLength({ min: 2, max: 2 }),
      check('businessType', 'Business type is required').not().isEmpty()
    ]
  ],
  IntegrationController.getNearbyCompetitors
);

// @route   GET api/integrations/location/seasonal
// @desc    Get seasonal data for a location
// @access  Private
router.get(
  '/location/seasonal',
  [
    authMiddleware,
    [
      check('coordinates', 'Coordinates are required').isArray().isLength({ min: 2, max: 2 })
    ]
  ],
  IntegrationController.getLocationSeasonalData
);

// @route   GET api/integrations/reviews/google
// @desc    Get Google reviews for a business
// @access  Private
router.get(
  '/reviews/google',
  [
    authMiddleware,
    [
      check('placeId', 'Google Place ID is required').not().isEmpty()
    ]
  ],
  IntegrationController.getGoogleReviews
);

// @route   GET api/integrations/reviews/yelp
// @desc    Get Yelp reviews for a business
// @access  Private
router.get(
  '/reviews/yelp',
  [
    authMiddleware,
    [
      check('businessId', 'Yelp Business ID is required').not().isEmpty()
    ]
  ],
  IntegrationController.getYelpReviews
);

// @route   GET api/integrations/reviews/all
// @desc    Get all reviews for a business
// @access  Private
router.get(
  '/reviews/all',
  [
    authMiddleware,
    [
      check('business', 'Business object is required').isObject()
    ]
  ],
  IntegrationController.getAllReviews
);

// @route   POST api/integrations/reviews/analyze
// @desc    Analyze review sentiment
// @access  Private
router.post(
  '/reviews/analyze',
  [
    authMiddleware,
    [
      check('text', 'Review text is required').not().isEmpty()
    ]
  ],
  IntegrationController.analyzeReviewSentiment
);

module.exports = router;
