// routes/automation.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { check } = require('express-validator');
const Automation = require('../models/automation');
const logger = require('../utils/logger');

// @route   POST api/automations
// @desc    Create a new automation
// @access  Private
router.post(
  '/',
  [
    authMiddleware,
    [
      check('name', 'Automation name is required').not().isEmpty(),
      check('type', 'Valid automation type is required').isIn([
        'seasonal',
        'weather',
        'review',
        'event',
        'promotion',
        'holiday',
        'custom'
      ]),
      check('business', 'Business ID is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    try {
      const automation = new Automation({
        ...req.body,
        createdBy: req.user.id,
        updatedBy: req.user.id
      });

      await automation.save();
      res.status(201).json({ automation });
    } catch (err) {
      logger.error('Error creating automation:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET api/automations
// @desc    Get user's automations
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const automations = await Automation.find({ createdBy: req.user.id })
      .populate('business', 'name')
      .populate('location', 'name')
      .sort({ createdAt: -1 });

    res.json({ automations });
  } catch (err) {
    logger.error('Error fetching automations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/automations/:id
// @desc    Get automation by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id)
      .populate('business', 'name')
      .populate('location', 'name');

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    if (automation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ automation });
  } catch (err) {
    logger.error('Error fetching automation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/automations/:id
// @desc    Update automation
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    let automation = await Automation.findById(req.params.id);

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    if (automation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    automation = await Automation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true }
    );

    res.json({ automation });
  } catch (err) {
    logger.error('Error updating automation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/automations/:id
// @desc    Delete automation
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    if (automation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await automation.remove();
    res.json({ message: 'Automation deleted' });
  } catch (err) {
    logger.error('Error deleting automation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;