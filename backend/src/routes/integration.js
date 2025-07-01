const express = require('express');
const router = express.Router();
const IntegrationController = require('../controllers/integrationController');
const authMiddleware = require('../middleware/auth');

// @route   GET api/integrations/reviews
// @desc    Get reviews for a specific business
// @access  Private
router.get('/reviews', authMiddleware, IntegrationController.getBusinessReviews);

module.exports = router;
