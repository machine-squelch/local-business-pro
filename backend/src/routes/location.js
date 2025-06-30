const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const LocationController = require('../controllers/locationController');

// @route   POST api/locations
// @desc    Create a new location for a business
// @access  Private
router.post(
  '/',
  [
    authMiddleware,
    [
      check('business', 'Business ID is required').not().isEmpty(),
      check('name', 'Location name is required').not().isEmpty(),
      check('address.street', 'Street address is required').not().isEmpty(),
      check('address.city', 'City is required').not().isEmpty(),
      check('address.state', 'State is required').not().isEmpty(),
      check('address.zipCode', 'ZIP code is required').not().isEmpty(),
      check('coordinates.coordinates', 'Coordinates are required').isArray().isLength({ min: 2, max: 2 })
    ]
  ],
  LocationController.createLocation
);

// @route   GET api/locations
// @desc    Get all locations for current user's businesses
// @access  Private
router.get('/', authMiddleware, LocationController.getLocations);

// @route   GET api/locations/:id
// @desc    Get location by ID
// @access  Private
router.get('/:id', authMiddleware, LocationController.getLocationById);

// @route   PUT api/locations/:id
// @desc    Update location
// @access  Private
router.put('/:id', authMiddleware, LocationController.updateLocation);

// @route   DELETE api/locations/:id
// @desc    Delete location
// @access  Private
router.delete('/:id', authMiddleware, LocationController.deleteLocation);

// @route   GET api/locations/:id/demographics
// @desc    Get demographic data for location
// @access  Private
router.get('/:id/demographics', authMiddleware, LocationController.getLocationDemographics);

// @route   GET api/locations/:id/weather
// @desc    Get weather data for location
// @access  Private
router.get('/:id/weather', authMiddleware, LocationController.getLocationWeather);

// @route   GET api/locations/:id/reviews
// @desc    Get reviews for location
// @access  Private
router.get('/:id/reviews', authMiddleware, LocationController.getLocationReviews);

// @route   GET api/locations/:id/landmarks
// @desc    Get landmarks near location
// @access  Private
router.get('/:id/landmarks', authMiddleware, LocationController.getLocationLandmarks);

// @route   GET api/locations/:id/competitors
// @desc    Get competitors near location
// @access  Private
router.get('/:id/competitors', authMiddleware, LocationController.getLocationCompetitors);

// @route   GET api/locations/nearby
// @desc    Find locations near coordinates
// @access  Private
router.get(
  '/nearby',
  [
    authMiddleware,
    [
      check('lat', 'Latitude is required').isNumeric(),
      check('lng', 'Longitude is required').isNumeric(),
      check('radius', 'Radius is required').isNumeric()
    ]
  ],
  LocationController.getNearbyLocations
);

module.exports = router;
