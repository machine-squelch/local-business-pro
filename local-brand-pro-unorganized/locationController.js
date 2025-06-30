const Location = require('../models/location');
const Business = require('../models/business');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const axios = require('axios');

// @desc    Create a new location for a business
// @route   POST /api/locations
// @access  Private
exports.createLocation = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { business: businessId, name, address, coordinates, serviceArea, contactInfo } = req.body;

    // Check if business exists and user owns it
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add locations to this business' });
    }

    // Create new location
    const location = new Location({
      business: businessId,
      name,
      address,
      coordinates,
      serviceArea: serviceArea || { radius: 25 },
      contactInfo: contactInfo || {}
    });

    // Fetch local data (would be enhanced with actual API integrations)
    try {
      // This is a placeholder for actual API calls to get demographic data
      // In a real implementation, this would call external APIs for demographics, weather, etc.
      location.localData = {
        demographics: {
          population: 50000 + Math.floor(Math.random() * 100000),
          medianIncome: 45000 + Math.floor(Math.random() * 50000),
          medianAge: 30 + Math.floor(Math.random() * 15),
          householdSize: 2 + Math.random() * 1.5
        },
        landmarks: [
          {
            name: 'City Center',
            type: 'landmark',
            distance: 1.2 + Math.random() * 3
          },
          {
            name: 'Shopping Mall',
            type: 'commercial',
            distance: 0.8 + Math.random() * 4
          }
        ],
        weatherPatterns: {
          averageTemperature: 60 + Math.floor(Math.random() * 20),
          annualRainfall: 20 + Math.floor(Math.random() * 40),
          seasonalData: {
            winter: { avgTemp: 40, precipitation: 'high' },
            spring: { avgTemp: 60, precipitation: 'medium' },
            summer: { avgTemp: 80, precipitation: 'low' },
            fall: { avgTemp: 65, precipitation: 'medium' }
          }
        }
      };
    } catch (error) {
      logger.warn('Error fetching location data:', error);
      // Continue without the additional data
    }

    // Save location to database
    await location.save();

    res.status(201).json({ location });
  } catch (err) {
    logger.error('Error in createLocation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all locations for current user's businesses
// @route   GET /api/locations
// @access  Private
exports.getLocations = async (req, res) => {
  try {
    // Get all businesses owned by user
    const businesses = await Business.find({ owner: req.user.id }).select('_id');
    const businessIds = businesses.map(business => business._id);

    // Get all locations for these businesses
    const locations = await Location.find({ business: { $in: businessIds } })
      .populate('business', 'name industry');

    res.json({ locations });
  } catch (err) {
    logger.error('Error in getLocations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get location by ID
// @route   GET /api/locations/:id
// @access  Private
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('business', 'name industry owner');

    // Check if location exists
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if user owns the business
    if (location.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this location' });
    }

    res.json({ location });
  } catch (err) {
    logger.error('Error in getLocationById:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private
exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('business', 'owner');

    // Check if location exists
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if user owns the business
    if (location.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this location' });
    }

    // Update fields
    const { name, address, coordinates, serviceArea, contactInfo } = req.body;
    
    if (name) location.name = name;
    
    if (address) {
      location.address = {
        ...location.address,
        ...address
      };
    }
    
    if (coordinates && coordinates.coordinates) {
      location.coordinates.coordinates = coordinates.coordinates;
    }
    
    if (serviceArea) {
      location.serviceArea = {
        ...location.serviceArea,
        ...serviceArea
      };
    }
    
    if (contactInfo) {
      location.contactInfo = {
        ...location.contactInfo,
        ...contactInfo
      };
    }

    // Save updated location
    await location.save();

    res.json({ location });
  } catch (err) {
    logger.error('Error in updateLocation:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('business', 'owner');

    // Check if location exists
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if user owns the business
    if (location.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this location' });
    }

    // Delete the location
    await location.remove();

    res.json({ message: 'Location deleted' });
  } catch (err) {
    logger.error('Error in deleteLocation:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get demographic data for location
// @route   GET /api/locations/:id/demographics
// @access  Private
exports.getLocationDemographics = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('business', 'owner')
      .select('localData.demographics address');

    // Check if location exists
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if user owns the business
    if (location.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this location' });
    }

    // If demographics don't exist yet, fetch them
    if (!location.localData || !location.localData.demographics) {
      // This would be replaced with actual API calls in production
      location.localData = {
        ...location.localData,
        demographics: {
          population: 50000 + Math.floor(Math.random() * 100000),
          medianIncome: 45000 + Math.floor(Math.random() * 50000),
          medianAge: 30 + Math.floor(Math.random() * 15),
          householdSize: 2 + Math.random() * 1.5
        }
      };
      
      await location.save();
    }

    res.json({ 
      demographics: location.localData.demographics,
      address: location.address
    });
  } catch (err) {
    logger.error('Error in getLocationDemographics:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get weather data for location
// @route   GET /api/locations/:id/weather
// @access  Private
exports.getLocationWeather = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('business', 'owner')
      .select('coordinates address');

    // Check if location exists
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if user owns the business
    if (location.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this location' });
    }

    // This would be replaced with actual weather API calls in production
    const currentWeather = {
      temperature: 65 + Math.floor(Math.random() * 20),
      condition: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)],
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 15),
      forecast: [
        { day: 'Today', high: 70 + Math.floor(Math.random() * 10), low: 50 + Math.floor(Math.random() * 10), condition: 'sunny' },
        { day: 'Tomorrow', high: 72 + Math.floor(Math.random() * 10), low: 52 + Math.floor(Math.random() * 10), condition: 'partly cloudy' },
        { day: 'Day 3', high: 68 + Math.floor(Math.random() * 10), low: 48 + Math.floor(Math.random() * 10), condition: 'cloudy' },
        { day: 'Day 4', high: 65 + Math.floor(Math.random() * 10), low: 45 + Math.floor(Math.random() * 10), condition: 'rainy' },
        { day: 'Day 5', high: 70 + Math.floor(Math.random() * 10), low: 50 + Math.floor(Math.random() * 10), condition: 'sunny' }
      ]
    };

    res.json({ 
      weather: currentWeather,
      coordinates: location.coordinates,
      address: location.address
    });
  } catch (err) {
    logger.error('Error in getLocationWeather:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reviews for location
// @route   GET /api/locations/:id/reviews
// @access  Private
exports.getLocationReviews = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('business', 'owner name')
      .select('reviews address name');

    // Check if location exists
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if user owns the business
    if (location.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this location' });
    }

    // If reviews don't exist yet, generate mock data
    // In production, this would fetch from Google, Yelp, etc. APIs
    if (!location.reviews || !location.reviews.topReviews || location.reviews.topReviews.length === 0) {
      const businessName = location.business.name;
      
      location.reviews = {
        googleRating: 4 + Math.random(),
        googleReviewCount: 10 + Math.floor(Math.random() * 90),
        yelpRating: 3.5 + Math.random() * 1.5,
        yelpReviewCount: 5 + Math.floor(Math.random() * 45),
        topReviews: [
          {
            source: 'Google',
            rating: 5,
            text: `${businessName} provided excellent service! I was impressed with their attention to detail and professionalism.`,
            author: 'John D.',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            highlight: true
          },
          {
            source: 'Google',
            rating: 4,
            text: `Good experience with ${businessName}. Would recommend to others looking for similar services.`,
            author: 'Sarah M.',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            highlight: true
          },
          {
            source: 'Yelp',
            rating: 5,
            text: `I've been using ${businessName} for years and they never disappoint. Best in the area!`,
            author: 'Michael T.',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            highlight: true
          },
          {
            source: 'Google',
            rating: 3,
            text: `Decent service from ${businessName}. A few minor issues but overall satisfied.`,
            author: 'Lisa R.',
            date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
            highlight: false
          }
        ]
      };
      
      await location.save();
    }

    res.json({ 
      reviews: location.reviews,
      businessName: location.business.name,
      locationName: location.name
    });
  } catch (err) {
    logger.error('Error in getLocationReviews:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get landmarks near location
// @route   GET /api/locations/:id/landmarks
// @access  Private
exports.getLocationLandmarks = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('business', 'owner')
      .select('localData.landmarks coordinates address');

    // Check if location exists
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if user owns the business
    if (location.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this location' });
    }

    // If landmarks don't exist yet, fetch them
    if (!location.localData || !location.localData.landmarks || location.localData.landmarks.length === 0) {
      // This would be replaced with actual API calls in production
      location.localData = {
        ...location.localData,
        landmarks: [
          {
            name: 'City Center',
            type: 'landmark',
            distance: 1.2 + Math.random() * 3
          },
          {
            name: 'Shopping Mall',
            type: 'commercial',
            distance: 0.8 + Math.random() * 4
          },
          {
            name: 'Central Park',
            type: 'park',
            distance: 1.5 + Math.random() * 2
          },
          {
            name: 'Main Street',
            type: 'street',
            distance: 0.3 + Math.random() * 1
          },
          {
            name: 'Community Center',
            type: 'public',
            distance: 2.1 + Math.random() * 3
          }
        ]
      };
      
      await location.save();
    }

    res.json({ 
      landmarks: location.localData.landmarks,
      coordinates: location.coordinates,
      address: location.address
    });
  } catch (err) {
    logger.error('Error in getLocationLandmarks:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get competitors near location
// @route   GET /api/locations/:id/competitors
// @access  Private
exports.getLocationCompetitors = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('business', 'owner industry name')
      .select('localData.competitors coordinates address');

    // Check if location exists
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if user owns the business
    if (location.business.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this location' });
    }

    // If competitors don't exist yet, fetch them
    if (!location.localData || !location.localData.competitors || location.localData.competitors.length === 0) {
      // This would be replaced with actual API calls in production
      const industry = location.business.industry;
      const businessNames = {
        restaurant: ['Tasty Bites', 'Gourmet Delight', 'Flavor Haven', 'Culinary Corner'],
        retail: ['Fashion Finds', 'Trendy Treasures', 'Style Stop', 'Chic Boutique'],
        salon: ['Hair Haven', 'Beauty Bliss', 'Style Studio', 'Glamour Spot'],
        plumbing: ['Reliable Pipes', 'Flow Masters', 'Quick Fix Plumbing', 'Drain Experts'],
        electrical: ['Power Pros', 'Circuit Solutions', 'Bright Spark', 'Wired Right'],
        landscaping: ['Green Thumb', 'Garden Gurus', 'Lawn Legends', 'Nature\'s Touch'],
        auto_repair: ['Speed Shop', 'Auto Experts', 'Car Care Center', 'Mechanic Masters'],
        fitness: ['Flex Gym', 'Power Fitness', 'Strength Studio', 'Active Life Center'],
        healthcare: ['Wellness Center', 'Care Clinic', 'Health Hub', 'Healing Hands'],
        legal: ['Justice Partners', 'Legal Eagles', 'Law Leaders', 'Counsel Connect'],
        real_estate: ['Property Pros', 'Home Hunters', 'Estate Experts', 'Realty Group'],
        other: ['Business Solutions', 'Service Specialists', 'Quality Providers', 'Expert Team']
      };
      
      const names = businessNames[industry] || businessNames.other;
      
      location.localData = {
        ...location.localData,
        competitors: names.map((name, index) => ({
          name,
          type: industry,
          distance: 0.5 + (index * 0.7) + (Math.random() * 1.5)
        }))
      };
      
      await location.save();
    }

    res.json({ 
      competitors: location.localData.competitors,
      businessType: location.business.industry,
      businessName: location.business.name,
      coordinates: location.coordinates,
      address: location.address
    });
  } catch (err) {
    logger.error('Error in getLocationCompetitors:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Find locations near coordinates
// @route   GET /api/locations/nearby
// @access  Private
exports.getNearbyLocations = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { lat, lng, radius } = req.query;
    
    // Get all businesses owned by user
    const businesses = await Business.find({ owner: req.user.id }).select('_id');
    const businessIds = businesses.map(business => business._id);
    
    // Find locations near coordinates
    const locations = await Location.find({
      business: { $in: businessIds },
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1609.34 // Convert miles to meters
        }
      }
    }).populate('business', 'name industry');

    res.json({ locations });
  } catch (err) {
    logger.error('Error in getNearbyLocations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
