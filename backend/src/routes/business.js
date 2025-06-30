const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const BusinessController = require('../controllers/businessController');

// @route   POST api/businesses
// @desc    Create a new business
// @access  Private
router.post(
  '/',
  [
    authMiddleware,
    [
      check('name', 'Business name is required').not().isEmpty(),
      check('industry', 'Valid industry is required').isIn([
        'restaurant',
        'retail',
        'salon',
        'plumbing',
        'electrical',
        'landscaping',
        'auto_repair',
        'fitness',
        'healthcare',
        'legal',
        'real_estate',
        'other'
      ])
    ]
  ],
  BusinessController.createBusiness
);

// @route   GET api/businesses
// @desc    Get all businesses for current user
// @access  Private
router.get('/', authMiddleware, BusinessController.getBusinesses);

// @route   GET api/businesses/:id
// @desc    Get business by ID
// @access  Private
router.get('/:id', authMiddleware, BusinessController.getBusinessById);

// @route   PUT api/businesses/:id
// @desc    Update business
// @access  Private
router.put(
  '/:id',
  [
    authMiddleware,
    [
      check('name', 'Business name is required').optional().not().isEmpty(),
      check('industry', 'Valid industry is required').optional().isIn([
        'restaurant',
        'retail',
        'salon',
        'plumbing',
        'electrical',
        'landscaping',
        'auto_repair',
        'fitness',
        'healthcare',
        'legal',
        'real_estate',
        'other'
      ])
    ]
  ],
  BusinessController.updateBusiness
);

// @route   DELETE api/businesses/:id
// @desc    Delete business
// @access  Private
router.delete('/:id', authMiddleware, BusinessController.deleteBusiness);

// @route   GET api/businesses/:id/locations
// @desc    Get all locations for a business
// @access  Private
router.get('/:id/locations', authMiddleware, BusinessController.getBusinessLocations);

// @route   GET api/businesses/:id/designs
// @desc    Get all designs for a business
// @access  Private
router.get('/:id/designs', authMiddleware, BusinessController.getBusinessDesigns);

// @route   GET api/businesses/:id/templates
// @desc    Get recommended templates for a business
// @access  Private
router.get('/:id/templates', authMiddleware, BusinessController.getRecommendedTemplates);

// @route   GET api/businesses/:id/analytics
// @desc    Get business analytics
// @access  Private
router.get('/:id/analytics', authMiddleware, BusinessController.getBusinessAnalytics);

module.exports = router;
