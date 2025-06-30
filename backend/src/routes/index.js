const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const businessRoutes = require('./business');
const locationRoutes = require('./location');
const templateRoutes = require('./template');
const designRoutes = require('./design');
const automationRoutes = require('./automation');
const integrationRoutes = require('./integration');

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/locations', locationRoutes);
router.use('/templates', templateRoutes);
router.use('/designs', designRoutes);
router.use('/automations', automationRoutes);
router.use('/integrations', integrationRoutes);

module.exports = router;
