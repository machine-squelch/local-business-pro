const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { check } = require('express-validator');
const TemplateController = require('../controllers/templateController');

// @route   GET api/templates
// @desc    Get all templates
// @access  Private
router.get('/', authMiddleware, TemplateController.getTemplates);

// @route   GET api/templates/:id
// @desc    Get template by ID
// @access  Private
router.get('/:id', authMiddleware, TemplateController.getTemplateById);

// @route   GET api/templates/industry/:industry
// @desc    Get templates by industry
// @access  Private
router.get('/industry/:industry', authMiddleware, TemplateController.getTemplatesByIndustry);

// @route   GET api/templates/category/:category
// @desc    Get templates by category
// @access  Private
router.get('/category/:category', authMiddleware, TemplateController.getTemplatesByCategory);

// @route   GET api/templates/search
// @desc    Search templates
// @access  Private
router.get('/search', authMiddleware, TemplateController.searchTemplates);

// @route   GET api/templates/popular
// @desc    Get popular templates
// @access  Private
router.get('/popular', authMiddleware, TemplateController.getPopularTemplates);

// @route   GET api/templates/seasonal
// @desc    Get seasonal templates
// @access  Private
router.get('/seasonal', authMiddleware, TemplateController.getSeasonalTemplates);

// @route   GET api/templates/location-based
// @desc    Get location-relevant templates
// @access  Private
router.get(
  '/location-based',
  [
    authMiddleware,
    [
      check('locationId', 'Location ID is required').not().isEmpty()
    ]
  ],
  TemplateController.getLocationBasedTemplates
);

// Admin routes for template management
// @route   POST api/templates
// @desc    Create a new template (Admin only)
// @access  Admin
router.post(
  '/',
  [
    authMiddleware,
    [
      check('name', 'Template name is required').not().isEmpty(),
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
      ]),
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
      check('adobeExpressId', 'Adobe Express ID is required').not().isEmpty()
    ]
  ],
  TemplateController.createTemplate
);

// @route   PUT api/templates/:id
// @desc    Update template (Admin only)
// @access  Admin
router.put('/:id', authMiddleware, TemplateController.updateTemplate);

// @route   DELETE api/templates/:id
// @desc    Delete template (Admin only)
// @access  Admin
router.delete('/:id', authMiddleware, TemplateController.deleteTemplate);

module.exports = router;
