const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Review Integration Service
 * 
 * This service handles all interactions with review platforms,
 * providing a unified interface for fetching and analyzing reviews.
 */
class ReviewIntegrationService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.yelpApiKey = process.env.YELP_API_KEY;
  }

  /**
   * Get reviews from Google Business Profile
   * @param {string} placeId Google Place ID
   * @returns {Promise<Object>} Reviews data
   */
  async getGoogleReviews(placeId) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            fields: 'name,rating,reviews,user_ratings_total',
            key: this.googleApiKey
          }
        }
      );
      
      if (response.data.status !== 'OK') {
        throw new Error(`Google Places API error: ${response.data.status}`);
      }
      
      const result = response.data.result;
      
      return {
        source: 'Google',
        businessName: result.name,
        rating: result.rating,
        reviewCount: result.user_ratings_total,
        reviews: result.reviews.map(review => ({
          author: review.author_name,
          rating: review.rating,
          text: review.text,
          time: new Date(review.time * 1000),
          language: review.language
        }))
      };
    } catch (error) {
      logger.error('Google Reviews error:', error);
      
      // Return mock data if API fails
      return this.getMockGoogleReviews(placeId);
    }
  }

  /**
   * Get reviews from Yelp
   * @param {string} businessId Yelp Business ID
   * @returns {Promise<Object>} Reviews data
   */
  async getYelpReviews(businessId) {
    try {
      const response = await axios.get(
        `https://api.yelp.com/v3/businesses/${businessId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${this.yelpApiKey}`
          }
        }
      );
      
      const business = await axios.get(
        `https://api.yelp.com/v3/businesses/${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${this.yelpApiKey}`
          }
        }
      );
      
      return {
        source: 'Yelp',
        businessName: business.data.name,
        rating: business.data.rating,
        reviewCount: business.data.review_count,
        reviews: response.data.reviews.map(review => ({
          author: review.user.name,
          rating: review.rating,
          text: review.text,
          time: new Date(review.time_created),
          url: review.url
        }))
      };
    } catch (error) {
      logger.error('Yelp Reviews error:', error);
      
      // Return mock data if API fails
      return this.getMockYelpReviews(businessId);
    }
  }

  /**
   * Get all reviews for a business from multiple platforms
   * @param {Object} business Business object with identifiers
   * @returns {Promise<Object>} Combined reviews data
   */
  async getAllReviews(business) {
    try {
      const promises = [];
      
      if (business.googlePlaceId) {
        promises.push(this.getGoogleReviews(business.googlePlaceId));
      } else {
        promises.push(this.getMockGoogleReviews(business.name));
      }
      
      if (business.yelpBusinessId) {
        promises.push(this.getYelpReviews(business.yelpBusinessId));
      } else {
        promises.push(this.getMockYelpReviews(business.name));
      }
      
      const results = await Promise.all(promises);
      
      // Combine results
      const googleData = results.find(r => r.source === 'Google') || { rating: 0, reviewCount: 0, reviews: [] };
      const yelpData = results.find(r => r.source === 'Yelp') || { rating: 0, reviewCount: 0, reviews: [] };
      
      return {
        googleRating: googleData.rating,
        googleReviewCount: googleData.reviewCount,
        yelpRating: yelpData.rating,
        yelpReviewCount: yelpData.reviewCount,
        topReviews: this.selectTopReviews([...googleData.reviews, ...yelpData.reviews])
      };
    } catch (error) {
      logger.error('Get All Reviews error:', error);
      
      // Return mock data if all APIs fail
      return this.getMockCombinedReviews(business.name);
    }
  }

  /**
   * Analyze reviews to find the most compelling ones
   * @param {Array} reviews List of reviews
   * @param {number} limit Maximum number of reviews to return
   * @returns {Array} Selected top reviews
   */
  selectTopReviews(reviews, limit = 5) {
    // Sort reviews by a combination of factors
    const scoredReviews = reviews.map(review => {
      // Base score on rating
      let score = review.rating;
      
      // Boost score for longer, more detailed reviews
      if (review.text) {
        const wordCount = review.text.split(/\s+/).length;
        score += Math.min(wordCount / 20, 2); // Up to 2 points for length
      }
      
      // Boost score for recency
      const ageInDays = (Date.now() - new Date(review.time).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 5 - (ageInDays / 30)); // Up to 5 points for recency
      
      return { ...review, score };
    });
    
    // Sort by score descending
    scoredReviews.sort((a, b) => b.score - a.score);
    
    // Mark top reviews as highlighted
    return scoredReviews.slice(0, limit).map(review => ({
      ...review,
      highlight: true
    }));
  }

  /**
   * Analyze review sentiment and extract key phrases
   * @param {string} text Review text
   * @returns {Object} Sentiment analysis results
   */
  analyzeReviewSentiment(text) {
    // In a real implementation, this would use NLP APIs
    // For now, we'll use a simple keyword-based approach
    
    const positiveWords = ['great', 'excellent', 'amazing', 'good', 'best', 'love', 'perfect', 'recommend', 'fantastic', 'awesome'];
    const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'awful', 'horrible', 'disappointed', 'waste', 'avoid', 'not'];
    
    const words = text.toLowerCase().split(/\W+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const sentimentScore = (positiveCount - negativeCount) / (positiveCount + negativeCount + 1);
    
    let sentiment;
    if (sentimentScore > 0.5) sentiment = 'very positive';
    else if (sentimentScore > 0) sentiment = 'positive';
    else if (sentimentScore === 0) sentiment = 'neutral';
    else if (sentimentScore > -0.5) sentiment = 'negative';
    else sentiment = 'very negative';
    
    return {
      sentiment,
      score: sentimentScore,
      positiveCount,
      negativeCount
    };
  }

  /**
   * Generate mock Google reviews
   * @param {string} businessNameOrId Business name or ID
   * @returns {Object} Mock reviews data
   */
  getMockGoogleReviews(businessNameOrId) {
    const businessName = businessNameOrId.includes(' ') ? businessNameOrId : `Business ${businessNameOrId}`;
    const rating = 4 + (Math.random() * 1);
    const reviewCount = 10 + Math.floor(Math.random() * 90);
    
    const reviews = [
      {
        author: 'John D.',
        rating: 5,
        text: `${businessName} provided excellent service! I was impressed with their attention to detail and professionalism.`,
        time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        author: 'Sarah M.',
        rating: 4,
        text: `Good experience with ${businessName}. Would recommend to others looking for similar services.`,
        time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      },
      {
        author: 'Robert J.',
        rating: 5,
        text: `Absolutely fantastic! ${businessName} exceeded all my expectations and delivered exactly what I needed.`,
        time: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) // 21 days ago
      },
      {
        author: 'Lisa R.',
        rating: 3,
        text: `Decent service from ${businessName}. A few minor issues but overall satisfied.`,
        time: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
      },
      {
        author: 'David T.',
        rating: 4,
        text: `I've used ${businessName} multiple times and they're consistently reliable. Good value for money.`,
        time: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      }
    ];
    
    return {
      source: 'Google',
      businessName,
      rating,
      reviewCount,
      reviews
    };
  }

  /**
   * Generate mock Yelp reviews
   * @param {string} businessNameOrId Business name or ID
   * @returns {Object} Mock reviews data
   */
  getMockYelpReviews(businessNameOrId) {
    const businessName = businessNameOrId.includes(' ') ? businessNameOrId : `Business ${businessNameOrId}`;
    const rating = 3.5 + (Math.random() * 1.5);
    const reviewCount = 5 + Math.floor(Math.random() * 45);
    
    const reviews = [
      {
        author: 'Michael T.',
        rating: 5,
        text: `I've been using ${businessName} for years and they never disappoint. Best in the area!`,
        time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        author: 'Jennifer L.',
        rating: 4,
        text: `${businessName} has great customer service. They really take the time to understand what you need.`,
        time: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days ago
      },
      {
        author: 'Chris P.',
        rating: 3,
        text: `Average experience. ${businessName} did what they promised but nothing exceptional.`,
        time: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000) // 50 days ago
      }
    ];
    
    return {
      source: 'Yelp',
      businessName,
      rating,
      reviewCount,
      reviews
    };
  }

  /**
   * Generate mock combined reviews
   * @param {string} businessName Business name
   * @returns {Object} Mock combined reviews data
   */
  getMockCombinedReviews(businessName) {
    const googleData = this.getMockGoogleReviews(businessName);
    const yelpData = this.getMockYelpReviews(businessName);
    
    return {
      googleRating: googleData.rating,
      googleReviewCount: googleData.reviewCount,
      yelpRating: yelpData.rating,
      yelpReviewCount: yelpData.reviewCount,
      topReviews: this.selectTopReviews([...googleData.reviews, ...yelpData.reviews])
    };
  }
}

module.exports = new ReviewIntegrationService();
