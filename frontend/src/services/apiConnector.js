// API Integration Connector for LocalBrand Pro
// This service handles the connection between frontend components and backend services

import axios from 'axios';
import adobeExpressService from '../hooks/adobeExpressService';
import locationIntelligenceService from '../hooks/locationIntelligenceService';
import reviewIntegrationService from '../hooks/reviewIntegrationService';

class ApiConnector {
  constructor() {
    // Set up axios defaults
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';
    
    // Add request interceptor for authentication
    axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
    
    // Add response interceptor for error handling
    axios.interceptors.response.use(
      response => response,
      error => {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    
    // Initialize services
    this.initializeServices();
  }
  
  // Initialize all external services
  async initializeServices() {
    try {
     //await adobeExpressService.initialize();
      //console.log('Adobe Express SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Adobe Express SDK:', error);
    }
  }
  
  // Authentication methods
  async login(email, password) {
    try {
      const response = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }
  
  async register(userData) {
    try {
      const response = await axios.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }
  
  async logout() {
    try {
      await axios.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove local storage items even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  // Business methods
  async getBusinesses() {
    try {
      const response = await axios.get('/businesses');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch businesses');
    }
  }
  
  async getBusiness(id) {
    try {
      const response = await axios.get(`/businesses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch business details');
    }
  }
  
  async createBusiness(businessData) {
    try {
      const response = await axios.post('/businesses', businessData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create business');
    }
  }
  
  async updateBusiness(id, businessData) {
    try {
      const response = await axios.put(`/businesses/${id}`, businessData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update business');
    }
  }
  
  async deleteBusiness(id) {
    try {
      await axios.delete(`/businesses/${id}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete business');
    }
  }
  
  // Location methods
  async getLocations(businessId = null) {
    try {
      const url = businessId ? `/businesses/${businessId}/locations` : '/locations';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch locations');
    }
  }
  
  async getLocation(id) {
    try {
      const response = await axios.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch location details');
    }
  }
  
  async createLocation(locationData) {
    try {
      const response = await axios.post('/locations', locationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create location');
    }
  }
  
  async updateLocation(id, locationData) {
    try {
      const response = await axios.put(`/locations/${id}`, locationData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update location');
    }
  }
  
  async deleteLocation(id) {
    try {
      await axios.delete(`/locations/${id}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete location');
    }
  }
  
  // Design methods integrated with Adobe Express SDK
  async getDesigns(filters = {}) {
    try {
      const response = await axios.get('/designs', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch designs');
    }
  }
  
  async getDesign(id) {
    try {
      const response = await axios.get(`/designs/${id}`);
      
      // If this is an Adobe Express design, get additional data
      if (response.data.adobeExpressId) {
        try {
          const adobeExpressData = await adobeExpressService.getDesignById(response.data.adobeExpressId);
          return {
            ...response.data,
            adobeExpressData
          };
        } catch (sdkError) {
          console.error('Failed to fetch Adobe Express design data:', sdkError);
          // Return the basic design data even if Adobe Express data fetch fails
          return response.data;
        }
      }
      
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch design details');
    }
  }
  
  async createDesign(designData) {
    try {
      // If using a template from Adobe Express
      if (designData.templateId) {
        try {
          // Create design in Adobe Express
          const adobeExpressDesign = await adobeExpressService.createDesignFromTemplate(
            designData.templateId,
            {
              name: designData.name,
              description: designData.description,
              businessId: designData.businessId,
              locationId: designData.locationId,
              type: designData.type
            }
          );
          
          // Add Adobe Express ID to design data
          designData.adobeExpressId = adobeExpressDesign.id;
          designData.thumbnail = adobeExpressDesign.thumbnail;
        } catch (sdkError) {
          console.error('Failed to create Adobe Express design:', sdkError);
          // Continue with creating the design in our system without Adobe Express integration
        }
      }
      
      // Create design in our system
      const response = await axios.post('/designs', designData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create design');
    }
  }
  
  async updateDesign(id, designData) {
    try {
      // If this design has Adobe Express integration
      if (designData.adobeExpressId) {
        try {
          // Update design in Adobe Express
          await adobeExpressService.saveDesign(designData.adobeExpressId, {
            name: designData.name,
            description: designData.description,
            content: designData.content,
            metadata: {
              businessId: designData.businessId,
              locationId: designData.locationId,
              type: designData.type
            }
          });
          
          // Generate new thumbnail if content changed
          if (designData.content) {
            const thumbnail = await adobeExpressService.generateThumbnail(designData.adobeExpressId);
            designData.thumbnail = thumbnail;
          }
        } catch (sdkError) {
          console.error('Failed to update Adobe Express design:', sdkError);
          // Continue with updating the design in our system without Adobe Express integration
        }
      }
      
      // Update design in our system
      const response = await axios.put(`/designs/${id}`, designData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update design');
    }
  }
  
  async deleteDesign(id) {
    try {
      // Get design details first to check for Adobe Express integration
      const design = await this.getDesign(id);
      
      // If this design has Adobe Express integration, delete it there first
      if (design.adobeExpressId) {
        try {
          // This is a placeholder - actual implementation would depend on Adobe Express SDK
          // await adobeExpressService.deleteDesign(design.adobeExpressId);
        } catch (sdkError) {
          console.error('Failed to delete Adobe Express design:', sdkError);
          // Continue with deleting the design in our system
        }
      }
      
      // Delete design in our system
      await axios.delete(`/designs/${id}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete design');
    }
  }
  
  // Template methods
  async getTemplates(category = null) {
    try {
      const params = category ? { category } : {};
      const response = await axios.get('/templates', { params });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch templates');
    }
  }
  
  async getTemplate(id) {
    try {
      const response = await axios.get(`/templates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch template details');
    }
  }
  
  // Enhanced design methods with location intelligence
  async createLocationEnhancedDesign(designData, locationId) {
    try {
      // First create the basic design
      const design = await this.createDesign(designData);
      
      // Then enhance it with location intelligence
      if (design.adobeExpressId) {
        try {
          // Get location intelligence data
          const locationData = await locationIntelligenceService.getLocationIntelligence(locationId);
          
          // Apply location intelligence to the design
          await adobeExpressService.applyLocationIntelligence(design.adobeExpressId, locationData);
          
          // Update the design in our system to reflect the enhancement
          const updatedDesign = await this.getDesign(design.id);
          return updatedDesign;
        } catch (enhancementError) {
          console.error('Failed to enhance design with location intelligence:', enhancementError);
          // Return the basic design even if enhancement fails
          return design;
        }
      }
      
      return design;
    } catch (error) {
      throw new Error('Failed to create location-enhanced design');
    }
  }
  
  // Enhanced design methods with review integration
  async createReviewBasedDesign(designData, locationId, reviewIds) {
    try {
      // First create the basic design
      const design = await this.createDesign(designData);
      
      // Then enhance it with reviews
      if (design.adobeExpressId) {
        try {
          // Get reviews
          const reviews = await Promise.all(
            reviewIds.map(reviewId => 
              axios.get(`/reviews/${reviewId}`).then(res => res.data)
            )
          );
          
          // Apply reviews to the design
          await adobeExpressService.incorporateReviews(design.adobeExpressId, reviews);
          
          // Update the design in our system to reflect the enhancement
          const updatedDesign = await this.getDesign(design.id);
          return updatedDesign;
        } catch (enhancementError) {
          console.error('Failed to enhance design with reviews:', enhancementError);
          // Return the basic design even if enhancement fails
          return design;
        }
      }
      
      return design;
    } catch (error) {
      throw new Error('Failed to create review-based design');
    }
  }
  
  // Enhanced design methods with seasonal automation
  async createSeasonalDesign(designData, locationId) {
    try {
      // First create the basic design
      const design = await this.createDesign(designData);
      
      // Then enhance it with seasonal data
      if (design.adobeExpressId) {
        try {
          // Get location data
          const location = await this.getLocation(locationId);
          
          // Get seasonal data for the location
          const seasonalData = await locationIntelligenceService.getSeasonalData(location.coordinates);
          
          // Apply seasonal adjustments to the design
          await adobeExpressService.applySeasonalAdjustments(design.adobeExpressId, seasonalData);
          
          // Update the design in our system to reflect the enhancement
          const updatedDesign = await this.getDesign(design.id);
          return updatedDesign;
        } catch (enhancementError) {
          console.error('Failed to enhance design with seasonal data:', enhancementError);
          // Return the basic design even if enhancement fails
          return design;
        }
      }
      
      return design;
    } catch (error) {
      throw new Error('Failed to create seasonal design');
    }
  }
  
  // User profile and settings methods
  async getUserProfile() {
    try {
      const response = await axios.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user profile');
    }
  }
  
  async updateUserProfile(profileData) {
    try {
      const response = await axios.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update user profile');
    }
  }
  
  async updateUserPassword(passwordData) {
    try {
      await axios.put('/users/password', passwordData);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update password');
    }
  }
  
  async getUserSettings() {
    try {
      const response = await axios.get('/users/settings');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user settings');
    }
  }
  
  async updateUserSettings(settingsData) {
    try {
      const response = await axios.put('/users/settings', settingsData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update user settings');
    }
  }
  
  // Export methods for designs
  async exportDesign(designId, format = 'png') {
    try {
      // Get design details
      const design = await this.getDesign(designId);
      
      // If this design has Adobe Express integration, use the SDK to export
      if (design.adobeExpressId) {
        try {
          const exportedData = await adobeExpressService.exportDesign(design.adobeExpressId, format);
          return exportedData;
        } catch (sdkError) {
          console.error('Failed to export design using Adobe Express SDK:', sdkError);
          // Fall back to our system's export functionality
        }
      }
      
      // Use our system's export functionality
      const response = await axios.get(`/designs/${designId}/export`, {
        params: { format },
        responseType: 'arraybuffer'
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to export design as ${format}`);
    }
  }
}

export default new ApiConnector();
