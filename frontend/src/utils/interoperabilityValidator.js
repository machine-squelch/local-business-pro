// Interoperability validation script for LocalBrand Pro
// This script tests the integration between frontend components and backend services

const validateInteroperability = async () => {
  console.log('Starting interoperability validation...');
  
  // Test authentication flow
  console.log('Testing authentication flow...');
  try {
    const authResult = await testAuthenticationFlow();
    console.log('Authentication flow:', authResult ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.error('Authentication flow test failed:', error);
  }
  
  // Test Adobe Express SDK integration
  console.log('Testing Adobe Express SDK integration...');
  try {
    const sdkResult = await testAdobeExpressSDKIntegration();
    console.log('Adobe Express SDK integration:', sdkResult ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.error('Adobe Express SDK integration test failed:', error);
  }
  
  // Test location intelligence service
  console.log('Testing location intelligence service...');
  try {
    const locationResult = await testLocationIntelligenceService();
    console.log('Location intelligence service:', locationResult ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.error('Location intelligence service test failed:', error);
  }
  
  // Test review integration service
  console.log('Testing review integration service...');
  try {
    const reviewResult = await testReviewIntegrationService();
    console.log('Review integration service:', reviewResult ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.error('Review integration service test failed:', error);
  }
  
  // Test seasonal automation engine
  console.log('Testing seasonal automation engine...');
  try {
    const seasonalResult = await testSeasonalAutomationEngine();
    console.log('Seasonal automation engine:', seasonalResult ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.error('Seasonal automation engine test failed:', error);
  }
  
  // Test end-to-end design creation and export
  console.log('Testing end-to-end design workflow...');
  try {
    const workflowResult = await testEndToEndDesignWorkflow();
    console.log('End-to-end design workflow:', workflowResult ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.error('End-to-end design workflow test failed:', error);
  }
  
  console.log('Interoperability validation complete.');
};

// Test authentication flow
const testAuthenticationFlow = async () => {
  // Simulate login
  const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }),
  });
  
  if (!loginResponse.ok) {
    throw new Error('Login failed');
  }
  
  const { token } = await loginResponse.json();
  
  // Verify token with profile endpoint
  const profileResponse = await fetch('/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!profileResponse.ok) {
    throw new Error('Profile verification failed');
  }
  
  return true;
};

// Test Adobe Express SDK integration
const testAdobeExpressSDKIntegration = async () => {
  // Check if SDK is loaded
  if (!window.CCEverywhere) {
    throw new Error('Adobe Express SDK not loaded');
  }
  
  // Test SDK initialization
  try {
    const ccSDK = new window.CCEverywhere({
      clientId: process.env.REACT_APP_ADOBE_CLIENT_ID,
      appName: 'LocalBrand Pro',
      appVersion: { major: 1, minor: 0 },
      redirectUri: window.location.origin + '/auth/adobe/callback'
    });
    
    // Test creating a design editor
    const containerNode = document.createElement('div');
    document.body.appendChild(containerNode);
    
    const editor = await ccSDK.createDesignEditor({
      containerNode,
    });
    
    // Clean up
    editor.destroy();
    document.body.removeChild(containerNode);
    
    return true;
  } catch (error) {
    console.error('SDK initialization failed:', error);
    return false;
  }
};

// Test location intelligence service
const testLocationIntelligenceService = async () => {
  // Test fetching locations
  const locationsResponse = await fetch('/api/locations', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!locationsResponse.ok) {
    throw new Error('Failed to fetch locations');
  }
  
  const locations = await locationsResponse.json();
  
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error('No locations returned');
  }
  
  // Test location details
  const locationId = locations[0]._id;
  const locationResponse = await fetch(`/api/locations/${locationId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!locationResponse.ok) {
    throw new Error('Failed to fetch location details');
  }
  
  return true;
};

// Test review integration service
const testReviewIntegrationService = async () => {
  // Get a location to test with
  const locationsResponse = await fetch('/api/locations', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  const locations = await locationsResponse.json();
  const locationId = locations[0]._id;
  
  // Test fetching reviews for a location
  const reviewsResponse = await fetch(`/api/reviews?locationId=${locationId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!reviewsResponse.ok) {
    throw new Error('Failed to fetch reviews');
  }
  
  const reviews = await reviewsResponse.json();
  
  // Test creating a design with a review
  if (reviews.length > 0) {
    const reviewId = reviews[0]._id;
    
    const designResponse = await fetch('/api/designs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        title: 'Test Review Design',
        locationId,
        reviewId,
        designData: {
          // Simplified design data
          elements: [],
          canvas: { width: 800, height: 600 }
        }
      }),
    });
    
    if (!designResponse.ok) {
      throw new Error('Failed to create design with review');
    }
  }
  
  return true;
};

// Test seasonal automation engine
const testSeasonalAutomationEngine = async () => {
  // Get current month
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  
  // Get a location to test with
  const locationsResponse = await fetch('/api/locations', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  const locations = await locationsResponse.json();
  const locationId = locations[0]._id;
  
  // Test fetching seasonal data
  const seasonalResponse = await fetch(`/api/seasonal?locationId=${locationId}&month=${month}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!seasonalResponse.ok) {
    throw new Error('Failed to fetch seasonal data');
  }
  
  const seasonalData = await seasonalResponse.json();
  
  if (!seasonalData || !seasonalData.name) {
    throw new Error('Invalid seasonal data returned');
  }
  
  return true;
};

// Test end-to-end design workflow
const testEndToEndDesignWorkflow = async () => {
  // Create a new design
  const createResponse = await fetch('/api/designs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      title: 'Test Workflow Design',
      designData: {
        // Simplified design data
        elements: [],
        canvas: { width: 800, height: 600 }
      }
    }),
  });
  
  if (!createResponse.ok) {
    throw new Error('Failed to create design');
  }
  
  const design = await createResponse.json();
  const designId = design._id;
  
  // Update the design
  const updateResponse = await fetch(`/api/designs/${designId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      title: 'Updated Test Design',
      designData: {
        // Updated design data
        elements: [
          { type: 'text', props: { text: 'Hello World' } }
        ],
        canvas: { width: 800, height: 600 }
      }
    }),
  });
  
  if (!updateResponse.ok) {
    throw new Error('Failed to update design');
  }
  
  // Export the design
  const exportResponse = await fetch(`/api/designs/${designId}/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      format: 'png'
    }),
  });
  
  if (!exportResponse.ok) {
    throw new Error('Failed to export design');
  }
  
  // Clean up - delete the test design
  const deleteResponse = await fetch(`/api/designs/${designId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!deleteResponse.ok) {
    throw new Error('Failed to delete test design');
  }
  
  return true;
};

// Export the validation function
export default validateInteroperability;
