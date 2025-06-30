# LocalBrand Pro: Custom Schema and Modifiability Guide

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture Overview](#system-architecture-overview)
3. [Custom Schema Implementation](#custom-schema-implementation)
4. [Extension Points](#extension-points)
5. [Integration Interfaces](#integration-interfaces)
6. [Configuration Options](#configuration-options)
7. [Advanced Customization](#advanced-customization)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Introduction

LocalBrand Pro is designed with modifiability and extensibility as core principles. This document provides comprehensive guidance on how to customize and extend the system to meet evolving business requirements. Whether you need to add new features, integrate with additional services, or modify existing functionality, this guide will help you understand the available options and best practices.

## System Architecture Overview

LocalBrand Pro follows a modular architecture that separates concerns and facilitates customization:

```
LocalBrand Pro
├── Frontend (React)
│   ├── Components
│   ├── Pages
│   ├── Hooks
│   ├── Store
│   ├── Utils
│   ├── Assets
│   └── Styles
├── Backend (Node.js/Express)
│   ├── Controllers
│   ├── Models
│   ├── Routes
│   ├── Services
│   ├── Integrations
│   ├── Utils
│   └── Config
└── Integrations
    ├── Adobe Express SDK
    ├── Location Intelligence
    └── Review Integration
```

### Key Design Principles

1. **Modularity**: Each component is designed to be self-contained with clear interfaces.
2. **Dependency Injection**: Services and components are loosely coupled through dependency injection.
3. **Configuration-Driven**: Many behaviors can be modified through configuration rather than code changes.
4. **Extension Points**: Strategic extension points allow for adding new functionality without modifying core code.
5. **API-First**: All functionality is exposed through well-defined APIs for maximum interoperability.

## Custom Schema Implementation

LocalBrand Pro uses MongoDB as its database, which provides schema flexibility while maintaining structure through Mongoose schemas. This approach allows for easy extension and modification of data models.

### Core Data Models

The following core data models can be extended with custom fields:

#### User Schema

```javascript
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Custom fields can be added here
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });
```

#### Business Schema

```javascript
const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  industry: {
    type: String,
    required: true
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  brand: {
    primaryColor: String,
    secondaryColor: String,
    logo: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Custom fields can be added here
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });
```

#### Location Schema

```javascript
const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  // Custom fields can be added here
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });
```

#### Design Schema

```javascript
const DesignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  content: {
    variables: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    customizations: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  adobeExpressData: {
    designId: String,
    editUrl: String,
    previewUrl: String,
    lastSyncedAt: Date
  },
  localIntelligence: {
    demographicsApplied: Boolean,
    weatherInfluenced: Boolean,
    landmarksIncluded: [String],
    seasonalAdjustments: String,
    localKeywords: [String]
  },
  reviewsIncluded: [{
    source: String,
    id: String,
    snippet: String
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    lastPublishedAt: Date
  },
  // Custom fields can be added here
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });
```

### Adding Custom Fields

There are three approaches to extending the data models:

#### 1. Using the customFields Map

The simplest approach is to use the built-in `customFields` Map that exists on all core models:

```javascript
// Example: Adding custom fields to a business
const business = await Business.findById(businessId);
business.customFields.set('taxId', '123-45-6789');
business.customFields.set('employeeCount', 42);
await business.save();

// Retrieving custom fields
const taxId = business.customFields.get('taxId');
```

#### 2. Extending the Schema

For more structured customization, you can extend the schema directly:

```javascript
// Create a file in /backend/src/models/extensions/businessExtension.js
const mongoose = require('mongoose');
const Business = require('../business');

// Add new fields to the schema
Business.schema.add({
  taxId: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{3}-\d{2}-\d{4}/.test(v);
      },
      message: props => `${props.value} is not a valid tax ID!`
    }
  },
  employeeCount: {
    type: Number,
    min: 0
  }
});

// Add new methods if needed
Business.schema.methods.calculateSize = function() {
  if (this.employeeCount < 10) return 'small';
  if (this.employeeCount < 50) return 'medium';
  return 'large';
};

// Re-compile the model to apply changes
mongoose.model('Business', Business.schema);
```

To activate this extension, import it in your main application file:

```javascript
// In /backend/src/index.js
require('./models/extensions/businessExtension');
```

#### 3. Creating Related Models

For complex extensions, create related models with references:

```javascript
// Create a file in /backend/src/models/businessAnalytics.js
const mongoose = require('mongoose');

const BusinessAnalyticsSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  monthlySales: [{
    month: Number,
    year: Number,
    amount: Number
  }],
  customerDemographics: {
    ageGroups: Map,
    genderDistribution: Map,
    incomeRanges: Map
  },
  marketingEffectiveness: {
    channelROI: Map,
    campaignPerformance: [{
      name: String,
      startDate: Date,
      endDate: Date,
      cost: Number,
      revenue: Number,
      leads: Number
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('BusinessAnalytics', BusinessAnalyticsSchema);
```

Then create corresponding controllers, routes, and services for the new model.

## Extension Points

LocalBrand Pro provides several strategic extension points for adding new functionality:

### 1. Service Extensions

Services can be extended by creating decorator classes that wrap the original service:

```javascript
// Create a file in /backend/src/services/extensions/designServiceExtension.js
const DesignService = require('../designService');

class ExtendedDesignService {
  constructor(originalService) {
    this.originalService = originalService;
  }
  
  // Override existing methods
  async createDesign(designData) {
    console.log('Extended service: Creating design');
    // Add custom logic before
    const result = await this.originalService.createDesign(designData);
    // Add custom logic after
    return result;
  }
  
  // Add new methods
  async analyzeDesignPerformance(designId) {
    const design = await this.originalService.getDesignById(designId);
    // Custom analysis logic
    return {
      performanceScore: calculateScore(design),
      recommendations: generateRecommendations(design)
    };
  }
}

// Helper functions
function calculateScore(design) {
  // Implementation
}

function generateRecommendations(design) {
  // Implementation
}

module.exports = ExtendedDesignService;
```

To use this extension:

```javascript
// In /backend/src/config/services.js
const DesignService = require('../services/designService');
const ExtendedDesignService = require('../services/extensions/designServiceExtension');

const designService = new DesignService(/* dependencies */);
const extendedDesignService = new ExtendedDesignService(designService);

module.exports = {
  designService: extendedDesignService,
  // other services
};
```

### 2. Middleware Extensions

Add custom middleware to extend request processing:

```javascript
// Create a file in /backend/src/middleware/customLogging.js
const customLogging = (req, res, next) => {
  const start = Date.now();
  
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method
  res.end = function(...args) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Additional custom logging logic
    if (req.user) {
      console.log(`User: ${req.user.email}, Role: ${req.user.role}`);
    }
    
    // Call original end method
    return originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = customLogging;
```

To use this middleware:

```javascript
// In /backend/src/index.js
const customLogging = require('./middleware/customLogging');
app.use(customLogging);
```

### 3. Plugin System

LocalBrand Pro includes a plugin system for more extensive customizations:

```javascript
// Create a file in /backend/src/plugins/analyticsPlugin.js
class AnalyticsPlugin {
  constructor() {
    this.name = 'analytics';
    this.version = '1.0.0';
    this.description = 'Advanced analytics for LocalBrand Pro';
  }
  
  initialize(app, services) {
    // Register routes
    app.use('/api/analytics', require('./routes/analyticsRoutes')(services));
    
    // Extend existing services
    const originalDesignService = services.designService;
    services.designService = new AnalyticsDesignService(originalDesignService);
    
    // Register event handlers
    services.eventBus.on('design.created', this.handleDesignCreated);
    services.eventBus.on('design.published', this.handleDesignPublished);
    
    console.log('Analytics plugin initialized');
  }
  
  handleDesignCreated(design) {
    // Implementation
  }
  
  handleDesignPublished(design) {
    // Implementation
  }
}

class AnalyticsDesignService {
  // Implementation similar to service extension example
}

module.exports = new AnalyticsPlugin();
```

To register the plugin:

```javascript
// In /backend/src/config/plugins.js
const analyticsPlugin = require('../plugins/analyticsPlugin');

const plugins = [
  analyticsPlugin,
  // other plugins
];

module.exports = plugins;

// In /backend/src/index.js
const plugins = require('./config/plugins');
const services = require('./config/services');

// Initialize plugins
plugins.forEach(plugin => {
  plugin.initialize(app, services);
});
```

## Integration Interfaces

LocalBrand Pro provides standardized interfaces for integrating with external services:

### 1. Adobe Express SDK Integration

The Adobe Express SDK integration can be customized or replaced:

```javascript
// Create a file in /backend/src/integrations/customAdobeExpressService.js
const axios = require('axios');
const BaseAdobeExpressService = require('./adobeExpressService');

class CustomAdobeExpressService extends BaseAdobeExpressService {
  constructor(config) {
    super(config);
    this.customEndpoint = config.customEndpoint;
  }
  
  // Override methods as needed
  async generateEditUrl(designId, options) {
    // Custom implementation
    const result = await super.generateEditUrl(designId, options);
    
    // Add additional parameters
    result.editUrl += `&customParam=${options.customParam}`;
    
    return result;
  }
  
  // Add new methods
  async applyAdvancedTemplate(templateId, variables) {
    // Implementation
  }
}

module.exports = CustomAdobeExpressService;
```

To use this custom integration:

```javascript
// In /backend/src/config/integrations.js
const CustomAdobeExpressService = require('../integrations/customAdobeExpressService');

module.exports = {
  adobeExpress: new CustomAdobeExpressService({
    apiKey: process.env.ADOBE_EXPRESS_API_KEY,
    customEndpoint: process.env.CUSTOM_ADOBE_ENDPOINT
  }),
  // other integrations
};
```

### 2. Location Intelligence Integration

Similarly, the location intelligence service can be customized:

```javascript
// Create a file in /backend/src/integrations/customLocationIntelligenceService.js
const BaseLocationIntelligenceService = require('./locationIntelligenceService');

class CustomLocationIntelligenceService extends BaseLocationIntelligenceService {
  // Custom implementation
}

module.exports = CustomLocationIntelligenceService;
```

### 3. Generic Integration Interface

For completely new integrations, implement the generic integration interface:

```javascript
// Create a file in /backend/src/integrations/socialMediaIntegration.js
const Integration = require('./integration');

class SocialMediaIntegration extends Integration {
  constructor(config) {
    super('social-media');
    this.apiKey = config.apiKey;
    this.platforms = config.platforms || ['facebook', 'instagram', 'twitter'];
  }
  
  async initialize() {
    // Setup code
    this.initialized = true;
    return true;
  }
  
  async publishToSocialMedia(designId, platforms, message) {
    // Implementation
  }
  
  async getAnalytics(designId, platform) {
    // Implementation
  }
}

module.exports = SocialMediaIntegration;
```

To register the new integration:

```javascript
// In /backend/src/config/integrations.js
const SocialMediaIntegration = require('../integrations/socialMediaIntegration');

module.exports = {
  // existing integrations
  socialMedia: new SocialMediaIntegration({
    apiKey: process.env.SOCIAL_MEDIA_API_KEY,
    platforms: ['facebook', 'instagram', 'linkedin']
  })
};
```

## Configuration Options

LocalBrand Pro uses a hierarchical configuration system that allows for customization at multiple levels:

### 1. Environment Variables

The most basic configuration is through environment variables:

```
# .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/localbrand
JWT_SECRET=your-secret-key
ADOBE_EXPRESS_API_KEY=your-api-key
```

### 2. Configuration Files

For more complex configuration, use the configuration files:

```javascript
// /backend/src/config/database.js
module.exports = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/localbrand',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    // Custom options
    poolSize: process.env.DB_POOL_SIZE || 10,
    connectTimeoutMS: process.env.DB_CONNECT_TIMEOUT || 30000
  },
  // Custom configuration
  backupSchedule: process.env.DB_BACKUP_SCHEDULE || '0 0 * * *', // Daily at midnight
  maxBackupCount: process.env.DB_MAX_BACKUP_COUNT || 7
};
```

### 3. Feature Flags

LocalBrand Pro includes a feature flag system for enabling/disabling features:

```javascript
// /backend/src/config/features.js
module.exports = {
  enableReviewIntegration: process.env.ENABLE_REVIEW_INTEGRATION === 'true',
  enableLocationIntelligence: process.env.ENABLE_LOCATION_INTELLIGENCE === 'true',
  enableAdvancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
  enableSocialMediaPublishing: process.env.ENABLE_SOCIAL_MEDIA_PUBLISHING === 'true',
  // Custom feature flags
  enableCustomFeature: process.env.ENABLE_CUSTOM_FEATURE === 'true'
};
```

To use feature flags:

```javascript
// In any file
const features = require('../config/features');

if (features.enableCustomFeature) {
  // Implement feature-specific logic
}
```

### 4. Dynamic Configuration

For configuration that can be changed at runtime:

```javascript
// /backend/src/models/systemConfig.js
const mongoose = require('mongoose');

const SystemConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
```

Create a service to manage dynamic configuration:

```javascript
// /backend/src/services/configService.js
const SystemConfig = require('../models/systemConfig');

class ConfigService {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    const configs = await SystemConfig.find();
    configs.forEach(config => {
      this.cache.set(config.key, config.value);
    });
    
    this.initialized = true;
  }
  
  async get(key, defaultValue = null) {
    if (!this.initialized) await this.initialize();
    
    return this.cache.has(key) ? this.cache.get(key) : defaultValue;
  }
  
  async set(key, value, description = '') {
    await SystemConfig.findOneAndUpdate(
      { key },
      { key, value, description, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    
    this.cache.set(key, value);
    return value;
  }
}

module.exports = new ConfigService();
```

To use dynamic configuration:

```javascript
// In any file
const configService = require('../services/configService');

async function someFunction() {
  const maxRetries = await configService.get('api.maxRetries', 3);
  // Use the configuration value
}
```

## Advanced Customization

### 1. Frontend Theming

LocalBrand Pro supports custom theming through CSS variables and theme providers:

```javascript
// /frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#6a11cb');
  const [secondaryColor, setSecondaryColor] = useState('#2575fc');
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-gradient-start', primaryColor);
    document.documentElement.style.setProperty('--primary-gradient-end', secondaryColor);
    
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode, primaryColor, secondaryColor]);
  
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  const setThemeColors = (primary, secondary) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
  };
  
  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode, 
      primaryColor, 
      secondaryColor, 
      setThemeColors 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

To use custom theming:

```javascript
// In any component
import { useTheme } from '../contexts/ThemeContext';

const BusinessSettings = () => {
  const { setThemeColors } = useTheme();
  const business = useSelector(state => state.business.current);
  
  useEffect(() => {
    if (business?.brand?.primaryColor && business?.brand?.secondaryColor) {
      setThemeColors(business.brand.primaryColor, business.brand.secondaryColor);
    }
  }, [business, setThemeColors]);
  
  // Component implementation
};
```

### 2. Custom Components

Create custom components that can be injected into the application:

```javascript
// /frontend/src/components/custom/CustomAnalyticsDashboard.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { LineChart, BarChart } from '../charts';

const CustomAnalyticsDashboard = ({ businessId }) => {
  const analytics = useSelector(state => state.analytics[businessId]);
  
  // Component implementation
  
  return (
    <div className="custom-analytics-dashboard">
      <h2>Advanced Analytics</h2>
      <div className="charts-container">
        <LineChart data={analytics.trendsData} />
        <BarChart data={analytics.performanceData} />
      </div>
    </div>
  );
};

export default CustomAnalyticsDashboard;
```

Register the custom component:

```javascript
// /frontend/src/config/customComponents.js
import CustomAnalyticsDashboard from '../components/custom/CustomAnalyticsDashboard';

export default {
  'business-dashboard': CustomAnalyticsDashboard,
  // other custom components
};

// /frontend/src/components/ComponentInjector.jsx
import React from 'react';
import customComponents from '../config/customComponents';

const ComponentInjector = ({ slot, ...props }) => {
  const CustomComponent = customComponents[slot];
  
  if (!CustomComponent) {
    return null;
  }
  
  return <CustomComponent {...props} />;
};

export default ComponentInjector;
```

Use the component injector:

```jsx
// In any component
import ComponentInjector from '../components/ComponentInjector';

const BusinessDashboard = ({ businessId }) => {
  return (
    <div className="business-dashboard">
      {/* Regular components */}
      <ComponentInjector slot="business-dashboard" businessId={businessId} />
    </div>
  );
};
```

### 3. Custom Routes

Add custom routes to the application:

```javascript
// /backend/src/routes/custom/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

module.exports = (services) => {
  const { analyticsService } = services;
  
  // Get business analytics
  router.get('/business/:businessId', auth, async (req, res) => {
    try {
      const analytics = await analyticsService.getBusinessAnalytics(req.params.businessId);
      res.json({ success: true, analytics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // Other routes
  
  return router;
};
```

Register the custom routes:

```javascript
// /backend/src/routes/index.js
const express = require('express');
const router = express.Router();
const services = require('../config/services');

// Core routes
router.use('/auth', require('./auth')(services));
router.use('/businesses', require('./business')(services));
router.use('/locations', require('./location')(services));
router.use('/templates', require('./template')(services));
router.use('/designs', require('./design')(services));
router.use('/integrations', require('./integration')(services));

// Custom routes
router.use('/analytics', require('./custom/analyticsRoutes')(services));

module.exports = router;
```

## Best Practices

### 1. Maintaining Backward Compatibility

When extending or modifying the system, follow these guidelines to maintain backward compatibility:

- **Add, don't replace**: Add new fields and methods rather than changing existing ones.
- **Use default values**: Provide sensible defaults for new fields.
- **Version your APIs**: Use versioning for significant changes (e.g., `/api/v2/businesses`).
- **Deprecate gradually**: Mark old features as deprecated before removing them.
- **Test thoroughly**: Ensure existing functionality continues to work after modifications.

### 2. Performance Considerations

- **Index custom fields**: If you add fields that will be frequently queried, create appropriate indexes.
- **Lazy loading**: For complex custom components, use lazy loading to improve initial load time.
- **Caching**: Implement caching for expensive operations, especially with custom integrations.
- **Batch operations**: When adding custom processing, batch operations where possible.

### 3. Security Best Practices

- **Validate all inputs**: Always validate user inputs, especially for custom fields.
- **Apply proper access control**: Ensure new endpoints and features respect the existing permission model.
- **Sanitize outputs**: Prevent XSS attacks by sanitizing any custom data before rendering.
- **Audit custom code**: Regularly audit custom code for security vulnerabilities.
- **Use environment variables**: Store sensitive configuration in environment variables, not in code.

## Troubleshooting

### Common Issues and Solutions

#### Schema Validation Errors

**Issue**: Mongoose validation errors after adding custom fields.

**Solution**: Ensure your custom fields have proper validation and default values:

```javascript
Business.schema.add({
  customField: {
    type: String,
    validate: {
      validator: function(v) {
        return /pattern/.test(v);
      },
      message: 'Invalid format'
    },
    default: 'default value'
  }
});
```

#### Integration Failures

**Issue**: Custom integrations fail to connect or return errors.

**Solution**: Check configuration and implement proper error handling:

```javascript
try {
  const result = await customIntegration.performAction();
  return result;
} catch (error) {
  console.error('Integration error:', error);
  
  // Fallback mechanism
  if (error.code === 'CONNECTION_ERROR') {
    return await fallbackMethod();
  }
  
  throw error;
}
```

#### Performance Issues

**Issue**: Custom features cause performance degradation.

**Solution**: Implement caching and optimize database queries:

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getExpensiveData(key) {
  const now = Date.now();
  const cached = cache.get(key);
  
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchExpensiveData(key);
  cache.set(key, { data, timestamp: now });
  
  return data;
}
```

### Debugging Custom Code

LocalBrand Pro includes built-in debugging tools:

```javascript
// Enable debug mode in .env
DEBUG=localbrand:*

// In your custom code
const debug = require('debug')('localbrand:custom:myfeature');

function myCustomFunction() {
  debug('Function called with:', arguments);
  // Implementation
  debug('Result:', result);
  return result;
}
```

### Getting Help

If you encounter issues that you cannot resolve:

1. Check the documentation in the `/docs` directory.
2. Look for similar issues in the issue tracker.
3. Contact support at support@localbrandpro.com.
4. Join the developer community at https://community.localbrandpro.com.

## Conclusion

LocalBrand Pro's modular architecture and strategic extension points provide a solid foundation for customization and extension. By following the patterns and practices outlined in this guide, you can adapt the system to meet your specific requirements while maintaining compatibility with future updates.

Remember to test thoroughly after making changes, and consider contributing useful extensions back to the community through the LocalBrand Pro marketplace.
