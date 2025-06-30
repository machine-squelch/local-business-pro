const mongoose = require('mongoose');
const { Schema } = mongoose;

const locationSchema = new Schema({
  business: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'USA',
      trim: true
    }
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  serviceArea: {
    radius: {
      type: Number, // radius in miles
      default: 25
    },
    polygons: {
      type: [[[Number]]], // array of polygon coordinates for custom service areas
      default: []
    }
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    hours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    }
  },
  localData: {
    demographics: {
      population: Number,
      medianIncome: Number,
      medianAge: Number,
      householdSize: Number
    },
    landmarks: [{
      name: String,
      type: String,
      distance: Number // distance in miles
    }],
    competitors: [{
      name: String,
      type: String,
      distance: Number // distance in miles
    }],
    weatherPatterns: {
      averageTemperature: Number,
      annualRainfall: Number,
      seasonalData: Schema.Types.Mixed
    }
  },
  reviews: {
    googleRating: Number,
    googleReviewCount: Number,
    yelpRating: Number,
    yelpReviewCount: Number,
    topReviews: [{
      source: String,
      rating: Number,
      text: String,
      author: String,
      date: Date,
      highlight: Boolean // flag for reviews to highlight in marketing
    }]
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

// Create a geospatial index for location-based queries
locationSchema.index({ coordinates: '2dsphere' });
locationSchema.index({ business: 1 });
locationSchema.index({ 'address.zipCode': 1 });

// Update the updatedAt field before saving
locationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
