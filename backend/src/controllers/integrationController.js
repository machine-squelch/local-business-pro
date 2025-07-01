const reviewIntegrationService = require('../integrations/reviewIntegrationService');
const logger = require('../utils/logger');

exports.getBusinessReviews = async (req, res) => {
  try {
    const { businessName } = req.query;
    if (!businessName) {
      return res.status(400).json({ message: 'Business name is required.' });
    }
    const result = await reviewIntegrationService.getReviewsForBusiness(businessName);
    if (result.status === 'success') {
      res.json(result);
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    logger.error('Error in getBusinessReviews controller:', error);
    res.status(500).json({ message: 'Server error while fetching reviews.' });
  }
};
