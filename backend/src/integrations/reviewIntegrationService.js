const axios = require('axios');
const logger = require('../utils/logger');

class ReviewIntegrationService {
  // This function simulates fetching reviews for a business.
  // In a real app, it would use API keys to connect to Google and Yelp.
  // Here, we use a public JSON placeholder to demonstrate a real network request.
  async getReviewsForBusiness(businessName) {
    try {
      logger.info(`Fetching reviews for ${businessName}...`);
      // Simulate a real API call using a public placeholder API
      const response = await axios.get('https://jsonplaceholder.typicode.com/comments?_limit=5');

      // Format the placeholder data to look like real reviews
      const formattedReviews = response.data.map(comment => ({
        source: 'Google',
        rating: Math.floor(Math.random() * 2) + 4, // Random 4 or 5 star
        author: comment.email.split('@')[0],
        text: comment.name, // Using the "name" field from placeholder as review text
      }));

      logger.info(`Successfully fetched and formatted ${formattedReviews.length} reviews.`);
      return {
        status: 'success',
        reviews: formattedReviews,
      };
    } catch (error) {
      logger.error('Error fetching reviews:', error.message);
      return { status: 'error', message: 'Failed to fetch reviews.' };
    }
  }
}
module.exports = new ReviewIntegrationService();
