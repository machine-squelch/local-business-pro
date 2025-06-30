const mongoose = require('mongoose');
const { Schema } = mongoose;

const designSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  },
  template: {
    type: Schema.Types.ObjectId,
    ref: 'Template'
  },
  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  adobeExpressData: {
    designId: String,
    editUrl: String,
    previewUrl: String,
    thumbnailUrl: String,
    lastSyncedAt: Date
  },
  content: {
    variables: Schema.Types.Mixed, // Stores the values for template variables
    customizations: Schema.Types.Mixed // Stores any customizations beyond template variables
  },
  assets: [{
    type: {
      type: String,
      enum: ['image', 'logo', 'text', 'shape', 'other']
    },
    url: String,
    position: {
      x: Number,
      y: Number
    },
    size: {
      width: Number,
      height: Number
    },
    metadata: Schema.Types.Mixed
  }],
  dimensions: {
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['px', 'in', 'cm'],
      default: 'px'
    }
  },
  exportFormats: [{
    format: {
      type: String,
      enum: ['jpg', 'png', 'pdf', 'svg']
    },
    url: String,
    size: Number, // in bytes
    createdAt: Date
  }],
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
  seoMetadata: {
    title: String,
    description: String,
    keywords: [String],
    altTexts: Schema.Types.Mixed,
    schemaMarkup: String
  },
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
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for faster queries
designSchema.index({ business: 1 });
designSchema.index({ location: 1 });
designSchema.index({ template: 1 });
designSchema.index({ category: 1 });
designSchema.index({ status: 1 });
designSchema.index({ createdAt: -1 });
designSchema.index({ 'analytics.views': -1 });

// Update the updatedAt field before saving
designSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Design = mongoose.model('Design', designSchema);

module.exports = Design;
