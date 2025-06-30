// backend/src/services/analyticsEngine.js
const mongoose = require('mongoose');
const axios = require('axios');
const logger = require('../utils/logger');

// Analytics Schema
const AnalyticsSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  design: { type: mongoose.Schema.Types.ObjectId, ref: 'Design' },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    phoneCallsGenerated: { type: Number, default: 0 },
    storeVisits: { type: Number, default: 0 },
    websiteTraffic: { type: Number, default: 0 }
  },
  platforms: {
    facebook: { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
    instagram: { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
    google: { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
    linkedin: { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
    twitter: { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
    email: { opens: 0, clicks: 0, unsubscribes: 0 },
    print: { distribution: 0, estimatedViews: 0 }
  },
  demographics: {
    ageGroups: { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55-64': 0, '65+': 0 },
    gender: { male: 0, female: 0, other: 0 },
    locations: [{ city: String, state: String, percentage: Number }],
    devices: { mobile: 0, desktop: 0, tablet: 0 }
  },
  timeData: {
    hourly: [Number], // 24 hours
    daily: [Number],  // 7 days
    monthly: [Number] // 12 months
  },
  attribution: {
    firstTouch: String,
    lastTouch: String,
    touchpoints: [{ platform: String, timestamp: Date, type: String }]
  },
  customEvents: [{
    name: String,
    value: Number,
    timestamp: Date,
    metadata: mongoose.Schema.Types.Mixed
  }],
  competitorAnalysis: {
    industryBenchmarks: {
      avgCTR: Number,
      avgCPC: Number,
      avgConversionRate: Number
    },
    competitors: [{
      name: String,
      estimatedSpend: Number,
      marketShare: Number,
      topPerformingContent: [String]
    }]
  }
}, { timestamps: true });

const Analytics = mongoose.model('Analytics', AnalyticsSchema);

class AdvancedAnalyticsEngine {
  constructor() {
    this.googleAnalyticsKey = process.env.GOOGLE_ANALYTICS_KEY;
    this.facebookApiKey = process.env.FACEBOOK_API_KEY;
    this.googleAdsKey = process.env.GOOGLE_ADS_KEY;
  }

  /**
   * Track design performance across all channels
   */
  async trackDesignPerformance(designId, platform, eventType, eventData) {
    try {
      const analytics = await Analytics.findOneAndUpdate(
        { design: designId },
        {
          $inc: {
            [`metrics.${eventType}`]: eventData.value || 1,
            [`platforms.${platform}.${eventType}`]: eventData.value || 1
          },
          $push: {
            customEvents: {
              name: eventType,
              value: eventData.value || 1,
              timestamp: new Date(),
              metadata: eventData
            }
          }
        },
        { upsert: true, new: true }
      );

      // Real-time performance optimization
      await this.optimizeInRealTime(analytics);
      
      return analytics;
    } catch (error) {
      logger.error('Performance tracking failed:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive ROI metrics
   */
  async calculateROI(businessId, timeframe = '30d') {
    const analytics = await this.getAnalyticsData(businessId, timeframe);
    
    const totalSpend = analytics.reduce((sum, record) => sum + record.metrics.cost, 0);
    const totalRevenue = analytics.reduce((sum, record) => sum + record.metrics.revenue, 0);
    const totalLeads = analytics.reduce((sum, record) => sum + record.metrics.leads, 0);
    const totalConversions = analytics.reduce((sum, record) => sum + record.metrics.conversions, 0);

    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const cpl = totalSpend > 0 && totalLeads > 0 ? totalSpend / totalLeads : 0;
    const cpa = totalSpend > 0 && totalConversions > 0 ? totalSpend / totalConversions : 0;

    return {
      roi: Math.round(roi * 100) / 100,
      roas: Math.round(roas * 100) / 100,
      cpl: Math.round(cpl * 100) / 100,
      cpa: Math.round(cpa * 100) / 100,
      totalSpend,
      totalRevenue,
      totalLeads,
      totalConversions,
      performanceGrade: this.calculatePerformanceGrade(roi, roas),
      recommendations: await this.generateROIRecommendations(analytics)
    };
  }

  /**
   * Advanced attribution modeling
   */
  async performAttributionAnalysis(businessId) {
    const analytics = await Analytics.find({ business: businessId })
      .populate('design', 'name category')
      .lean();

    const attributionModels = {
      firstTouch: {},
      lastTouch: {},
      linear: {},
      timeDecay: {},
      positionBased: {}
    };

    analytics.forEach(record => {
      if (record.attribution.touchpoints.length > 0) {
        this.applyAttributionModels(record, attributionModels);
      }
    });

    return {
      models: attributionModels,
      bestPerformingChannels: this.identifyBestChannels(attributionModels),
      channelSynergy: this.analyzeChannelSynergy(analytics),
      conversionPaths: this.identifyConversionPaths(analytics)
    };
  }

  /**
   * Predictive analytics using machine learning
   */
  async generatePredictiveInsights(businessId) {
    const historicalData = await this.getHistoricalData(businessId, '90d');
    
    return {
      forecasts: {
        next30Days: await this.forecastPerformance(historicalData, 30),
        next90Days: await this.forecastPerformance(historicalData, 90),
        seasonalTrends: await this.identifySeasonalTrends(historicalData)
      },
      recommendations: {
        budgetOptimization: await this.optimizeBudgetAllocation(historicalData),
        contentStrategy: await this.recommendContentStrategy(historicalData),
        timingOptimization: await this.optimizePostingTimes(historicalData),
        audienceExpansion: await this.identifyAudienceOpportunities(historicalData)
      },
      riskAssessment: {
        underperformingAssets: this.identifyRisks(historicalData),
        competitiveThreat: await this.assessCompetitiveRisk(businessId),
        marketVolatility: this.assessMarketVolatility(historicalData)
      }
    };
  }

  /**
   * Real-time performance monitoring and alerts
   */
  async setupPerformanceMonitoring(businessId, thresholds) {
    const monitoring = {
      alerts: {
        budgetUtilization: thresholds.budgetAlert || 0.8,
        performanceDrop: thresholds.performanceAlert || 0.2,
        costIncrease: thresholds.costAlert || 0.3,
        conversionDrop: thresholds.conversionAlert || 0.25
      },
      autoOptimization: {
        budgetReallocation: thresholds.autoReallocate || false,
        pauseUnderperforming: thresholds.autoPause || false,
        increaseTopPerforming: thresholds.autoIncrease || false
      }
    };

    // Set up real-time monitoring
    this.scheduleMonitoringChecks(businessId, monitoring);
    
    return monitoring;
  }

  /**
   * Competitive intelligence and benchmarking
   */
  async generateCompetitiveIntelligence(businessId) {
    const business = await this.getBusinessData(businessId);
    const industryData = await this.getIndustryBenchmarks(business.industry, business.location);
    
    return {
      industryBenchmarks: {
        avgCTR: industryData.avgCTR,
        avgCPC: industryData.avgCPC,
        avgConversionRate: industryData.avgConversionRate,
        avgROAS: industryData.avgROAS
      },
      competitorAnalysis: await this.analyzeCompetitors(business),
      marketOpportunities: await this.identifyMarketGaps(business),
      threatAssessment: await this.assessMarketThreats(business),
      recommendedActions: await this.generateCompetitiveActions(business, industryData)
    };
  }

  /**
   * Custom dashboard generation
   */
  async generateCustomDashboard(businessId, userRole, preferences) {
    const widgets = await this.selectDashboardWidgets(userRole, preferences);
    const data = await this.aggregateDashboardData(businessId, widgets);
    
    return {
      widgets: widgets.map(widget => ({
        ...widget,
        data: data[widget.id],
        config: this.getWidgetConfig(widget, preferences)
      })),
      layout: this.optimizeDashboardLayout(widgets, preferences.screenSize),
      refreshInterval: preferences.refreshInterval || 300000, // 5 minutes
      alerts: await this.getActiveAlerts(businessId),
      insights: await this.generateDashboardInsights(data)
    };
  }

  // Helper methods
  async optimizeInRealTime(analytics) {
    const performance = this.calculatePerformanceScore(analytics);
    
    if (performance.score < 0.3) {
      await this.triggerOptimizationAlert(analytics);
    }
    
    if (performance.trend === 'declining') {
      await this.autoOptimizeUnderperforming(analytics);
    }
  }

  calculatePerformanceGrade(roi, roas) {
    if (roi > 200 && roas > 4) return 'A+';
    if (roi > 150 && roas > 3) return 'A';
    if (roi > 100 && roas > 2.5) return 'B+';
    if (roi > 50 && roas > 2) return 'B';
    if (roi > 25 && roas > 1.5) return 'C+';
    if (roi > 0 && roas > 1) return 'C';
    return 'D';
  }

  async generateROIRecommendations(analytics) {
    const recommendations = [];
    
    // Analyze performance patterns
    const topPerforming = analytics
      .sort((a, b) => (b.metrics.revenue / Math.max(b.metrics.cost, 1)) - (a.metrics.revenue / Math.max(a.metrics.cost, 1)))
      .slice(0, 3);
    
    const underperforming = analytics
      .filter(a => a.metrics.cost > 0 && a.metrics.revenue / a.metrics.cost < 1.5)
      .slice(0, 3);

    if (topPerforming.length > 0) {
      recommendations.push({
        type: 'scale_winners',
        priority: 'high',
        title: 'Scale Top Performing Designs',
        description: `Increase budget for your best performing designs to maximize ROI`,
        designs: topPerforming.map(a => a.design),
        impact: 'high',
        effort: 'low'
      });
    }

    if (underperforming.length > 0) {
      recommendations.push({
        type: 'optimize_underperforming',
        priority: 'medium',
        title: 'Optimize Underperforming Assets',
        description: `These designs need optimization or budget reallocation`,
        designs: underperforming.map(a => a.design),
        impact: 'medium',
        effort: 'medium'
      });
    }

    return recommendations;
  }

  async forecastPerformance(historicalData, days) {
    // Simple linear regression for demo - would use more sophisticated ML in production
    const trends = this.calculateTrends(historicalData);
    
    return {
      estimatedImpressions: Math.round(trends.impressions * days),
      estimatedClicks: Math.round(trends.clicks * days),
      estimatedConversions: Math.round(trends.conversions * days),
      estimatedRevenue: Math.round(trends.revenue * days),
      estimatedCost: Math.round(trends.cost * days),
      confidence: this.calculateForecastConfidence(historicalData)
    };
  }

  calculateTrends(data) {
    if (data.length === 0) return { impressions: 0, clicks: 0, conversions: 0, revenue: 0, cost: 0 };
    
    const totals = data.reduce((acc, record) => ({
      impressions: acc.impressions + record.metrics.impressions,
      clicks: acc.clicks + record.metrics.clicks,
      conversions: acc.conversions + record.metrics.conversions,
      revenue: acc.revenue + record.metrics.revenue,
      cost: acc.cost + record.metrics.cost
    }), { impressions: 0, clicks: 0, conversions: 0, revenue: 0, cost: 0 });

    const days = data.length;
    return {
      impressions: totals.impressions / days,
      clicks: totals.clicks / days,
      conversions: totals.conversions / days,
      revenue: totals.revenue / days,
      cost: totals.cost / days
    };
  }

  calculateForecastConfidence(data) {
    if (data.length < 7) return 'low';
    if (data.length < 30) return 'medium';
    return 'high';
  }

  async getAnalyticsData(businessId, timeframe) {
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await Analytics.find({
      business: businessId,
      createdAt: { $gte: startDate }
    }).lean();
  }

  async getHistoricalData(businessId, timeframe) {
    return await this.getAnalyticsData(businessId, timeframe);
  }

  async getBusinessData(businessId) {
    const Business = mongoose.model('Business');
    return await Business.findById(businessId).lean();
  }

  async getIndustryBenchmarks(industry, location) {
    // Mock data - would integrate with industry data providers
    const benchmarks = {
      restaurant: { avgCTR: 0.025, avgCPC: 1.2, avgConversionRate: 0.08, avgROAS: 3.2 },
      retail: { avgCTR: 0.018, avgCPC: 0.95, avgConversionRate: 0.05, avgROAS: 2.8 },
      salon: { avgCTR: 0.032, avgCPC: 1.5, avgConversionRate: 0.12, avgROAS: 4.1 }
    };
    
    return benchmarks[industry] || benchmarks.retail;
  }
}

module.exports = new AdvancedAnalyticsEngine();