const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Location Intelligence Service
 * 
 * This service handles all interactions with location-based APIs,
 * providing geospatial data, demographics, weather, and local insights.
 */
class LocationIntelligenceService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.weatherApiKey = process.env.WEATHER_API_KEY;
    this.censusApiKey = process.env.CENSUS_API_KEY;
    this.yelpApiKey = process.env.YELP_API_KEY;
  }

  /**
   * Get geocoding data for an address
   * @param {Object} address Address object with street, city, state, zipCode
   * @returns {Promise<Object>} Geocoding result with coordinates
   */
  async geocodeAddress(address) {
    try {
      const formattedAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
      
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: formattedAddress,
            key: this.googleMapsApiKey
          }
        }
      );
      
      if (response.data.status !== 'OK' || !response.data.results.length) {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }
      
      const result = response.data.results[0];
      const { lat, lng } = result.geometry.location;
      
      return {
        coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } catch (error) {
      logger.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Get demographic data for a location
   * @param {Array} coordinates [longitude, latitude]
   * @param {string} zipCode ZIP code
   * @returns {Promise<Object>} Demographic data
   */
  async getDemographicData(coordinates, zipCode) {
    try {
      // In a real implementation, this would call the Census API
      // For now, we'll return mock data based on the ZIP code
      
      // Use last digit of ZIP code to vary the data for demo purposes
      const lastDigit = parseInt(zipCode.slice(-1));
      
      return {
        population: 30000 + (lastDigit * 5000),
        medianIncome: 40000 + (lastDigit * 5000),
        medianAge: 30 + (lastDigit * 1.5),
        householdSize: 2 + (lastDigit * 0.2),
        educationLevels: {
          highSchool: 80 + (lastDigit * 1),
          bachelors: 30 + (lastDigit * 3),
          graduate: 10 + (lastDigit * 1)
        },
        employmentRate: 90 + (lastDigit * 0.5),
        homeOwnership: 50 + (lastDigit * 3)
      };
    } catch (error) {
      logger.error('Demographics error:', error);
      throw new Error('Failed to get demographic data');
    }
  }

  /**
   * Get current weather and forecast for a location
   * @param {Array} coordinates [longitude, latitude]
   * @returns {Promise<Object>} Weather data
   */
  async getWeatherData(coordinates) {
    try {
      // In a real implementation, this would call a weather API
      // For now, we'll return mock data
      
      const [longitude, latitude] = coordinates;
      
      // Use coordinates to vary the data for demo purposes
      const latMod = Math.abs(Math.round(latitude)) % 10;
      
      const conditions = ['sunny', 'partly cloudy', 'cloudy', 'rainy', 'stormy', 'snowy'];
      const currentCondition = conditions[latMod % conditions.length];
      
      return {
        current: {
          temperature: 60 + latMod,
          condition: currentCondition,
          humidity: 40 + (latMod * 3),
          windSpeed: 5 + latMod
        },
        forecast: [
          { day: 'Today', high: 65 + latMod, low: 45 + latMod, condition: currentCondition },
          { day: 'Tomorrow', high: 67 + latMod, low: 47 + latMod, condition: conditions[(latMod + 1) % conditions.length] },
          { day: 'Day 3', high: 64 + latMod, low: 44 + latMod, condition: conditions[(latMod + 2) % conditions.length] },
          { day: 'Day 4', high: 66 + latMod, low: 46 + latMod, condition: conditions[(latMod + 3) % conditions.length] },
          { day: 'Day 5', high: 68 + latMod, low: 48 + latMod, condition: conditions[(latMod + 4) % conditions.length] }
        ],
        seasonalTrends: {
          temperature: {
            spring: { avg: 55 + latMod, high: 65 + latMod, low: 45 + latMod },
            summer: { avg: 75 + latMod, high: 85 + latMod, low: 65 + latMod },
            fall: { avg: 60 + latMod, high: 70 + latMod, low: 50 + latMod },
            winter: { avg: 40 + latMod, high: 50 + latMod, low: 30 + latMod }
          },
          precipitation: {
            spring: 'moderate',
            summer: 'low',
            fall: 'moderate',
            winter: 'high'
          }
        }
      };
    } catch (error) {
      logger.error('Weather error:', error);
      throw new Error('Failed to get weather data');
    }
  }

  /**
   * Get nearby landmarks for a location
   * @param {Array} coordinates [longitude, latitude]
   * @param {number} radius Search radius in miles
   * @returns {Promise<Array>} List of landmarks
   */
  async getNearbyLandmarks(coordinates, radius = 5) {
    try {
      const [longitude, latitude] = coordinates;
      
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${latitude},${longitude}`,
            radius: radius * 1609.34, // Convert miles to meters
            type: 'point_of_interest',
            key: this.googleMapsApiKey
          }
        }
      );
      
      if (response.data.status !== 'OK') {
        throw new Error(`Places API error: ${response.data.status}`);
      }
      
      return response.data.results.map(place => ({
        name: place.name,
        type: place.types[0],
        distance: this.calculateDistance(
          latitude, 
          longitude, 
          place.geometry.location.lat, 
          place.geometry.location.lng
        ),
        placeId: place.place_id,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total
      }));
    } catch (error) {
      logger.error('Landmarks error:', error);
      
      // Fallback to mock data if API fails
      return [
        { name: 'City Center', type: 'point_of_interest', distance: 1.2 },
        { name: 'Central Park', type: 'park', distance: 2.5 },
        { name: 'Main Street Shopping', type: 'shopping_mall', distance: 0.8 },
        { name: 'Community Center', type: 'local_government_office', distance: 1.7 },
        { name: 'Public Library', type: 'library', distance: 1.9 }
      ];
    }
  }

  /**
   * Get nearby competitors for a business
   * @param {Array} coordinates [longitude, latitude]
   * @param {string} businessType Business category/type
   * @param {number} radius Search radius in miles
   * @returns {Promise<Array>} List of competitors
   */
  async getNearbyCompetitors(coordinates, businessType, radius = 5) {
    try {
      const [longitude, latitude] = coordinates;
      
      // Map business type to Google Places type
      const placeType = this.mapBusinessTypeToPlaceType(businessType);
      
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${latitude},${longitude}`,
            radius: radius * 1609.34, // Convert miles to meters
            type: placeType,
            key: this.googleMapsApiKey
          }
        }
      );
      
      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${response.data.status}`);
      }
      
      return response.data.results.map(place => ({
        name: place.name,
        type: businessType,
        distance: this.calculateDistance(
          latitude, 
          longitude, 
          place.geometry.location.lat, 
          place.geometry.location.lng
        ),
        placeId: place.place_id,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total
      }));
    } catch (error) {
      logger.error('Competitors error:', error);
      
      // Fallback to mock data if API fails
      const mockCompetitors = {
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
      
      const names = mockCompetitors[businessType] || mockCompetitors.other;
      
      return names.map((name, index) => ({
        name,
        type: businessType,
        distance: 0.5 + (index * 0.7) + (Math.random() * 1.5),
        rating: 3 + Math.random() * 2,
        userRatingsTotal: Math.floor(Math.random() * 100) + 5
      }));
    }
  }

  /**
   * Get reviews for a business location
   * @param {string} businessName Business name
   * @param {Array} coordinates [longitude, latitude]
   * @returns {Promise<Object>} Reviews data
   */
  async getBusinessReviews(businessName, coordinates) {
    try {
      // In a real implementation, this would call the Google and Yelp APIs
      // For now, we'll return mock data
      
      const [longitude, latitude] = coordinates;
      
      // Use coordinates to vary the data for demo purposes
      const latMod = Math.abs(Math.round(latitude)) % 5;
      
      return {
        googleRating: 3.5 + (latMod * 0.3),
        googleReviewCount: 10 + (latMod * 8),
        yelpRating: 3.0 + (latMod * 0.4),
        yelpReviewCount: 5 + (latMod * 5),
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
    } catch (error) {
      logger.error('Reviews error:', error);
      throw new Error('Failed to get business reviews');
    }
  }

  /**
   * Get local events near a location
   * @param {Array} coordinates [longitude, latitude]
   * @param {Date} startDate Start date for events search
   * @param {number} radius Search radius in miles
   * @returns {Promise<Array>} List of events
   */
  async getLocalEvents(coordinates, startDate = new Date(), radius = 10) {
    try {
      // In a real implementation, this would call events APIs
      // For now, we'll return mock data
      
      const [longitude, latitude] = coordinates;
      
      // Use coordinates to vary the data for demo purposes
      const latMod = Math.abs(Math.round(latitude)) % 5;
      
      const eventTypes = ['festival', 'concert', 'market', 'sports', 'community'];
      const eventNames = {
        festival: ['Summer Festival', 'Food & Wine Festival', 'Cultural Celebration', 'Music Festival'],
        concert: ['Live in the Park', 'Symphony Night', 'Rock Concert', 'Jazz Evening'],
        market: ['Farmers Market', 'Craft Fair', 'Antique Show', 'Holiday Market'],
        sports: ['Marathon', 'Charity Run', 'Basketball Tournament', 'Soccer Championship'],
        community: ['Community Cleanup', 'Neighborhood Picnic', 'Charity Fundraiser', 'Art Exhibition']
      };
      
      const events = [];
      
      // Generate events for the next 3 months
      for (let i = 0; i < 5 + latMod; i++) {
        const eventDate = new Date(startDate);
        eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 90));
        
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const eventName = eventNames[eventType][Math.floor(Math.random() * eventNames[eventType].length)];
        
        events.push({
          name: eventName,
          type: eventType,
          date: eventDate,
          description: `Join us for this exciting ${eventType} event in your area!`,
          distance: Math.random() * radius
        });
      }
      
      return events.sort((a, b) => a.date - b.date);
    } catch (error) {
      logger.error('Events error:', error);
      throw new Error('Failed to get local events');
    }
  }

  /**
   * Get seasonal information for a location
   * @param {Array} coordinates [longitude, latitude]
   * @returns {Promise<Object>} Seasonal data
   */
  async getSeasonalData(coordinates) {
    try {
      const [longitude, latitude] = coordinates;
      
      // Determine climate zone based on latitude
      let climateZone;
      const absLat = Math.abs(latitude);
      
      if (absLat < 23.5) {
        climateZone = 'tropical';
      } else if (absLat < 35) {
        climateZone = 'subtropical';
      } else if (absLat < 55) {
        climateZone = 'temperate';
      } else {
        climateZone = 'polar';
      }
      
      // Get current season
      const now = new Date();
      const month = now.getMonth();
      let currentSeason;
      
      // Northern hemisphere seasons
      if (latitude >= 0) {
        if (month >= 2 && month <= 4) {
          currentSeason = 'spring';
        } else if (month >= 5 && month <= 7) {
          currentSeason = 'summer';
        } else if (month >= 8 && month <= 10) {
          currentSeason = 'fall';
        } else {
          currentSeason = 'winter';
        }
      } 
      // Southern hemisphere seasons (inverted)
      else {
        if (month >= 2 && month <= 4) {
          currentSeason = 'fall';
        } else if (month >= 5 && month <= 7) {
          currentSeason = 'winter';
        } else if (month >= 8 && month <= 10) {
          currentSeason = 'spring';
        } else {
          currentSeason = 'summer';
        }
      }
      
      // Upcoming holidays
      const upcomingHolidays = this.getUpcomingHolidays();
      
      return {
        climateZone,
        currentSeason,
        upcomingHolidays,
        seasonalColors: this.getSeasonalColors(currentSeason),
        seasonalThemes: this.getSeasonalThemes(currentSeason, upcomingHolidays)
      };
    } catch (error) {
      logger.error('Seasonal data error:', error);
      throw new Error('Failed to get seasonal data');
    }
  }

  /**
   * Helper method to map business type to Google Places type
   * @param {string} businessType Business category/type
   * @returns {string} Google Places type
   */
  mapBusinessTypeToPlaceType(businessType) {
    const typeMap = {
      restaurant: 'restaurant',
      retail: 'store',
      salon: 'beauty_salon',
      plumbing: 'plumber',
      electrical: 'electrician',
      landscaping: 'home_goods_store',
      auto_repair: 'car_repair',
      fitness: 'gym',
      healthcare: 'doctor',
      legal: 'lawyer',
      real_estate: 'real_estate_agency',
      other: 'establishment'
    };
    
    return typeMap[businessType] || 'establishment';
  }

  /**
   * Helper method to calculate distance between two points
   * @param {number} lat1 Latitude of point 1
   * @param {number} lon1 Longitude of point 1
   * @param {number} lat2 Latitude of point 2
   * @param {number} lon2 Longitude of point 2
   * @returns {number} Distance in miles
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Earth's radius in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in miles
    return parseFloat(d.toFixed(1));
  }

  /**
   * Helper method to convert degrees to radians
   * @param {number} deg Degrees
   * @returns {number} Radians
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Helper method to get upcoming holidays
   * @returns {Array} List of upcoming holidays
   */
  getUpcomingHolidays() {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    
    const holidays = [];
    
    // Very simplified holiday detection
    if (month === 0 && day < 15) {
      holidays.push({ name: 'New Year\'s Day', date: new Date(now.getFullYear(), 0, 1) });
    }
    if (month === 1 && day < 15) {
      holidays.push({ name: 'Valentine\'s Day', date: new Date(now.getFullYear(), 1, 14) });
    }
    if (month === 2 && day < 18) {
      holidays.push({ name: 'St. Patrick\'s Day', date: new Date(now.getFullYear(), 2, 17) });
    }
    if (month === 4 && day < 15) {
      holidays.push({ name: 'Mother\'s Day', date: new Date(now.getFullYear(), 4, 14) }); // Second Sunday in May (approx)
    }
    if (month === 5 && day < 20) {
      holidays.push({ name: 'Father\'s Day', date: new Date(now.getFullYear(), 5, 18) }); // Third Sunday in June (approx)
    }
    if (month === 6 && day < 5) {
      holidays.push({ name: 'Independence Day', date: new Date(now.getFullYear(), 6, 4) });
    }
    if (month === 9 && day < 31) {
      holidays.push({ name: 'Halloween', date: new Date(now.getFullYear(), 9, 31) });
    }
    if (month === 10 && day < 25) {
      holidays.push({ name: 'Thanksgiving', date: new Date(now.getFullYear(), 10, 24) }); // Fourth Thursday in November (approx)
    }
    if (month === 11) {
      holidays.push({ name: 'Christmas', date: new Date(now.getFullYear(), 11, 25) });
    }
    
    // Add next year's holidays if we're near the end of the year
    if (month === 11 && day > 25) {
      holidays.push({ name: 'New Year\'s Day', date: new Date(now.getFullYear() + 1, 0, 1) });
      holidays.push({ name: 'Valentine\'s Day', date: new Date(now.getFullYear() + 1, 1, 14) });
    }
    
    return holidays;
  }

  /**
   * Helper method to get seasonal colors
   * @param {string} season Current season
   * @returns {Object} Seasonal color palette
   */
  getSeasonalColors(season) {
    const colorPalettes = {
      spring: {
        primary: ['#76c893', '#52b69a', '#34a0a4'],
        secondary: ['#d9ed92', '#b5e48c', '#99d98c'],
        accent: ['#ff9e00', '#ff7b00', '#ff5400']
      },
      summer: {
        primary: ['#00b4d8', '#0096c7', '#0077b6'],
        secondary: ['#caf0f8', '#90e0ef', '#48cae4'],
        accent: ['#ffb703', '#fd9e02', '#fb8500']
      },
      fall: {
        primary: ['#e76f51', '#f4a261', '#e9c46a'],
        secondary: ['#ca6702', '#bb3e03', '#ae2012'],
        accent: ['#283618', '#606c38', '#dda15e']
      },
      winter: {
        primary: ['#335c67', '#1d3557', '#457b9d'],
        secondary: ['#a8dadc', '#e0fbfc', '#caf0f8'],
        accent: ['#e63946', '#d62828', '#9d0208']
      }
    };
    
    return colorPalettes[season] || colorPalettes.summer;
  }

  /**
   * Helper method to get seasonal themes
   * @param {string} season Current season
   * @param {Array} holidays Upcoming holidays
   * @returns {Object} Seasonal themes
   */
  getSeasonalThemes(season, holidays) {
    const baseThemes = {
      spring: ['renewal', 'growth', 'fresh', 'bloom', 'outdoor'],
      summer: ['vibrant', 'bright', 'fun', 'vacation', 'adventure'],
      fall: ['harvest', 'cozy', 'warm', 'rustic', 'tradition'],
      winter: ['festive', 'celebration', 'comfort', 'family', 'gift']
    };
    
    const holidayThemes = {
      'New Year\'s Day': ['resolution', 'fresh start', 'goals', 'celebration'],
      'Valentine\'s Day': ['love', 'romance', 'appreciation', 'gift'],
      'St. Patrick\'s Day': ['luck', 'tradition', 'celebration', 'heritage'],
      'Mother\'s Day': ['appreciation', 'family', 'love', 'gratitude'],
      'Father\'s Day': ['appreciation', 'family', 'activities', 'gratitude'],
      'Independence Day': ['patriotic', 'celebration', 'community', 'tradition'],
      'Halloween': ['spooky', 'fun', 'costume', 'treats'],
      'Thanksgiving': ['gratitude', 'family', 'tradition', 'feast'],
      'Christmas': ['joy', 'giving', 'tradition', 'family']
    };
    
    // Combine seasonal themes with holiday themes
    let themes = [...baseThemes[season]];
    
    holidays.forEach(holiday => {
      if (holidayThemes[holiday.name]) {
        themes = [...themes, ...holidayThemes[holiday.name]];
      }
    });
    
    // Remove duplicates
    return [...new Set(themes)];
  }
}

module.exports = new LocationIntelligenceService();
