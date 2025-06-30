const mongoose = require('mongoose');
const { Schema } = mongoose;

const templateSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    enum: [
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
    ]
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
  tags: [{
    type: String,
    trim: true
  }],
  adobeExpressId: {
    type: String,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  previewUrl: {
    type: String,
    trim: true
  },
  dimensions: {
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['px', 'in', 'cm'],
      default: 'px'
    }
  },
  variables: [{
    name: String,
    type: {
      type: String,
      enum: ['text', 'image', 'color', 'shape', 'logo']
    },
    defaultValue: Schema.Types.Mixed,
    required: Boolean
  }],
  seasonality: {
    spring: Boolean,
    summer: Boolean,
    fall: Boolean,
    winter: Boolean,
    holidays: [String]
  },
  locationRelevance: {
    urban: Boolean,
    suburban: Boolean,
    rural: Boolean,
    coastal: Boolean,
    mountain: Boolean,
    desert: Boolean
  },
  popularity: {
    usageCount: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
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
templateSchema.index({ industry: 1, category: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ 'seasonality.holidays': 1 });
templateSchema.index({ isActive: 1, isPremium: 1 });
templateSchema.index({ 'popularity.usageCount': -1 }); // Descending for most popular first

// Update the updatedAt field before saving
templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
