const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { check } = require('express-validator');
const DesignController = require('../controllers/designController');

// @route   POST api/designs
// @desc    Create a new design
// @access  Private
router.post(
  '/',
  [
    authMiddleware,
    [
      check('name', 'Design name is required').not().isEmpty(),
      check('business', 'Business ID is required').not().isEmpty(),
      check('category', 'Valid category is required').isIn([
        'social_media',
        'flyer',
        'business_card',
        'menu',
        'promotion',
        'advertisement',
        'email',
        'logo',
        'brochure',
        'postcard',
        'banner',
        'other'
      ]),
      check('template', 'Template ID is required').not().isEmpty()
    ]
  ],
  DesignController.createDesign
);

// @route   GET api/designs
// @desc    Get all designs for current user's businesses
// @access  Private
router.get('/', authMiddleware, DesignController.getDesigns);

// @route   GET api/designs/:id
// @desc    Get design by ID
// @access  Private
router.get('/:id', authMiddleware, DesignController.getDesignById);

// @route   PUT api/designs/:id
// @desc    Update design
// @access  Private
router.put('/:id', authMiddleware, DesignController.updateDesign);

// @route   DELETE api/designs/:id
// @desc    Delete design
// @access  Private
router.delete('/:id', authMiddleware, DesignController.deleteDesign);

// @route   POST api/designs/:id/publish
// @desc    Publish a design
// @access  Private
router.post('/:id/publish', authMiddleware, DesignController.publishDesign);

// @route   POST api/designs/:id/duplicate
// @desc    Duplicate a design
// @access  Private
router.post('/:id/duplicate', authMiddleware, DesignController.duplicateDesign);

// @route   GET api/designs/:id/exports
// @desc    Get all exports for a design
// @access  Private
router.get('/:id/exports', authMiddleware, DesignController.getDesignExports);

// @route   POST api/designs/:id/export
// @desc    Create a new export for a design
// @access  Private
router.post(
  '/:id/export',
  [
    authMiddleware,
    [
      check('format', 'Valid format is required').isIn(['jpg', 'png', 'pdf', 'svg'])
    ]
  ],
  DesignController.exportDesign
);

// @route   POST api/designs/:id/sync
// @desc    Sync design with Adobe Express
// @access  Private
router.post('/:id/sync', authMiddleware, DesignController.syncWithAdobeExpress);

// @route   GET api/designs/:id/analytics
// @desc    Get analytics for a design
// @access  Private
router.get('/:id/analytics', authMiddleware, DesignController.getDesignAnalytics);

// @route   POST api/designs/:id/enhance
// @desc    Apply location intelligence enhancements to a design
// @access  Private
router.post('/:id/enhance', authMiddleware, DesignController.enhanceDesignWithLocationData);

// @route   POST api/designs/:id/reviews
// @desc    Add reviews to a design
// @access  Private
router.post('/:id/reviews', authMiddleware, DesignController.addReviewsToDesign);

module.exports = router;
