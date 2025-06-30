#!/bin/bash

# LocalBrand Pro Interoperability and Scalability Test Script
# This script validates the interoperability between backend, frontend, and integrations

echo "====================================================="
echo "LocalBrand Pro Interoperability and Scalability Tests"
echo "====================================================="
echo ""

# Create test directory
TEST_DIR="/home/ubuntu/localbrand_pro/tests"
mkdir -p $TEST_DIR
echo "Created test directory: $TEST_DIR"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "Checking for required tools..."
REQUIRED_TOOLS=("curl" "jq" "node" "npm")
MISSING_TOOLS=()

for tool in "${REQUIRED_TOOLS[@]}"; do
  if ! command_exists "$tool"; then
    MISSING_TOOLS+=("$tool")
  fi
done

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
  echo "Error: The following required tools are missing:"
  for tool in "${MISSING_TOOLS[@]}"; do
    echo "  - $tool"
  done
  echo "Please install these tools and try again."
  exit 1
fi

echo "All required tools are available."
echo ""

# Create test configuration
echo "Creating test configuration..."
cat > $TEST_DIR/test-config.json << EOL
{
  "backend": {
    "baseUrl": "http://localhost:5000/api",
    "timeout": 5000
  },
  "frontend": {
    "baseUrl": "http://localhost:3000",
    "timeout": 10000
  },
  "integrations": {
    "adobeExpress": {
      "enabled": true,
      "mockMode": true
    },
    "locationIntelligence": {
      "enabled": true,
      "mockMode": true
    },
    "reviewIntegration": {
      "enabled": true,
      "mockMode": true
    }
  },
  "testData": {
    "user": {
      "email": "test@example.com",
      "password": "TestPassword123!"
    },
    "business": {
      "name": "Test Business",
      "industry": "restaurant"
    },
    "location": {
      "name": "Test Location",
      "address": {
        "street": "123 Test St",
        "city": "Test City",
        "state": "TS",
        "zipCode": "12345",
        "country": "Test Country"
      }
    }
  }
}
EOL
echo "Test configuration created."
echo ""

# Create API test script
echo "Creating API test script..."
cat > $TEST_DIR/api-tests.js << EOL
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load test configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-config.json'), 'utf8'));
const { backend, testData } = config;

// Create axios instance
const api = axios.create({
  baseURL: backend.baseUrl,
  timeout: backend.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run a test
async function runTest(name, testFn) {
  results.total++;
  try {
    console.log(\`Running test: \${name}\`);
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'passed' });
    console.log(\`✅ Test passed: \${name}\`);
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name, 
      status: 'failed', 
      error: error.message,
      details: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
    console.error(\`❌ Test failed: \${name}\`);
    console.error(\`   Error: \${error.message}\`);
    if (error.response) {
      console.error(\`   Status: \${error.response.status}\`);
      console.error(\`   Data: \${JSON.stringify(error.response.data)}\`);
    }
  }
}

// Authentication tests
async function authTests() {
  let token;
  
  await runTest('Register user', async () => {
    const response = await api.post('/auth/register', {
      email: testData.user.email,
      password: testData.user.password,
      displayName: 'Test User'
    });
    
    if (response.status !== 201 || !response.data.token) {
      throw new Error('Failed to register user');
    }
  });
  
  await runTest('Login user', async () => {
    const response = await api.post('/auth/login', {
      email: testData.user.email,
      password: testData.user.password
    });
    
    if (response.status !== 200 || !response.data.token) {
      throw new Error('Failed to login user');
    }
    
    token = response.data.token;
    api.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
  });
  
  await runTest('Get current user', async () => {
    const response = await api.get('/auth/me');
    
    if (response.status !== 200 || !response.data.user) {
      throw new Error('Failed to get current user');
    }
    
    if (response.data.user.email !== testData.user.email) {
      throw new Error('User email does not match');
    }
  });
}

// Business tests
async function businessTests() {
  let businessId;
  
  await runTest('Create business', async () => {
    const response = await api.post('/businesses', {
      name: testData.business.name,
      description: 'Test business description',
      industry: testData.business.industry,
      contact: {
        email: 'business@example.com',
        phone: '123-456-7890',
        website: 'https://example.com'
      },
      brand: {
        primaryColor: '#ff0000',
        secondaryColor: '#00ff00',
        logo: 'https://example.com/logo.png'
      }
    });
    
    if (response.status !== 201 || !response.data.business) {
      throw new Error('Failed to create business');
    }
    
    businessId = response.data.business._id;
  });
  
  await runTest('Get businesses', async () => {
    const response = await api.get('/businesses');
    
    if (response.status !== 200 || !response.data.businesses) {
      throw new Error('Failed to get businesses');
    }
    
    if (!response.data.businesses.some(b => b.name === testData.business.name)) {
      throw new Error('Created business not found in list');
    }
  });
  
  await runTest('Get business by ID', async () => {
    const response = await api.get(\`/businesses/\${businessId}\`);
    
    if (response.status !== 200 || !response.data.business) {
      throw new Error('Failed to get business by ID');
    }
    
    if (response.data.business.name !== testData.business.name) {
      throw new Error('Business name does not match');
    }
  });
  
  await runTest('Update business', async () => {
    const updatedName = \`\${testData.business.name} Updated\`;
    
    const response = await api.put(\`/businesses/\${businessId}\`, {
      name: updatedName
    });
    
    if (response.status !== 200 || !response.data.business) {
      throw new Error('Failed to update business');
    }
    
    if (response.data.business.name !== updatedName) {
      throw new Error('Business name was not updated');
    }
  });
  
  return businessId;
}

// Location tests
async function locationTests(businessId) {
  let locationId;
  
  await runTest('Create location', async () => {
    const response = await api.post('/locations', {
      business: businessId,
      name: testData.location.name,
      address: testData.location.address,
      coordinates: {
        coordinates: [-122.4194, 37.7749] // San Francisco coordinates
      }
    });
    
    if (response.status !== 201 || !response.data.location) {
      throw new Error('Failed to create location');
    }
    
    locationId = response.data.location._id;
  });
  
  await runTest('Get locations', async () => {
    const response = await api.get('/locations');
    
    if (response.status !== 200 || !response.data.locations) {
      throw new Error('Failed to get locations');
    }
    
    if (!response.data.locations.some(l => l.name === testData.location.name)) {
      throw new Error('Created location not found in list');
    }
  });
  
  await runTest('Get location by ID', async () => {
    const response = await api.get(\`/locations/\${locationId}\`);
    
    if (response.status !== 200 || !response.data.location) {
      throw new Error('Failed to get location by ID');
    }
    
    if (response.data.location.name !== testData.location.name) {
      throw new Error('Location name does not match');
    }
  });
  
  await runTest('Get business locations', async () => {
    const response = await api.get(\`/businesses/\${businessId}/locations\`);
    
    if (response.status !== 200 || !response.data.locations) {
      throw new Error('Failed to get business locations');
    }
    
    if (!response.data.locations.some(l => l.name === testData.location.name)) {
      throw new Error('Created location not found in business locations');
    }
  });
  
  return locationId;
}

// Template tests
async function templateTests() {
  let templateId;
  
  await runTest('Get templates', async () => {
    const response = await api.get('/templates');
    
    if (response.status !== 200 || !response.data.templates) {
      throw new Error('Failed to get templates');
    }
    
    if (response.data.templates.length === 0) {
      throw new Error('No templates found');
    }
    
    templateId = response.data.templates[0]._id;
  });
  
  await runTest('Get template by ID', async () => {
    const response = await api.get(\`/templates/\${templateId}\`);
    
    if (response.status !== 200 || !response.data.template) {
      throw new Error('Failed to get template by ID');
    }
  });
  
  await runTest('Get templates by industry', async () => {
    const response = await api.get(\`/templates/industry/\${testData.business.industry}\`);
    
    if (response.status !== 200 || !response.data.templates) {
      throw new Error('Failed to get templates by industry');
    }
  });
  
  await runTest('Search templates', async () => {
    const response = await api.get('/templates/search?q=restaurant');
    
    if (response.status !== 200 || !response.data.templates) {
      throw new Error('Failed to search templates');
    }
  });
  
  return templateId;
}

// Design tests
async function designTests(businessId, locationId, templateId) {
  let designId;
  
  await runTest('Create design', async () => {
    const response = await api.post('/designs', {
      name: 'Test Design',
      business: businessId,
      location: locationId,
      template: templateId,
      category: 'social_media',
      variables: {
        businessName: testData.business.name,
        tagline: 'Test Tagline'
      }
    });
    
    if (response.status !== 201 || !response.data.design) {
      throw new Error('Failed to create design');
    }
    
    designId = response.data.design._id;
  });
  
  await runTest('Get designs', async () => {
    const response = await api.get('/designs');
    
    if (response.status !== 200 || !response.data.designs) {
      throw new Error('Failed to get designs');
    }
    
    if (!response.data.designs.some(d => d.name === 'Test Design')) {
      throw new Error('Created design not found in list');
    }
  });
  
  await runTest('Get design by ID', async () => {
    const response = await api.get(\`/designs/\${designId}\`);
    
    if (response.status !== 200 || !response.data.design) {
      throw new Error('Failed to get design by ID');
    }
    
    if (response.data.design.name !== 'Test Design') {
      throw new Error('Design name does not match');
    }
  });
  
  await runTest('Update design', async () => {
    const updatedName = 'Test Design Updated';
    
    const response = await api.put(\`/designs/\${designId}\`, {
      name: updatedName
    });
    
    if (response.status !== 200 || !response.data.design) {
      throw new Error('Failed to update design');
    }
    
    if (response.data.design.name !== updatedName) {
      throw new Error('Design name was not updated');
    }
  });
  
  await runTest('Get business designs', async () => {
    const response = await api.get(\`/businesses/\${businessId}/designs\`);
    
    if (response.status !== 200 || !response.data.designs) {
      throw new Error('Failed to get business designs');
    }
    
    if (!response.data.designs.some(d => d._id === designId)) {
      throw new Error('Created design not found in business designs');
    }
  });
  
  return designId;
}

// Integration tests
async function integrationTests(designId, locationId) {
  await runTest('Initialize Adobe Express SDK', async () => {
    const response = await api.post('/integrations/adobe-express/init');
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to initialize Adobe Express SDK');
    }
  });
  
  await runTest('Get Adobe Express templates', async () => {
    const response = await api.get('/integrations/adobe-express/templates');
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get Adobe Express templates');
    }
  });
  
  await runTest('Generate Adobe Express edit URL', async () => {
    const response = await api.post('/integrations/adobe-express/edit-url', {
      designId: designId
    });
    
    if (response.status !== 200 || !response.data.success || !response.data.editUrl) {
      throw new Error('Failed to generate Adobe Express edit URL');
    }
  });
  
  await runTest('Export Adobe Express design', async () => {
    const response = await api.post('/integrations/adobe-express/export', {
      designId: designId,
      format: 'png'
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to export Adobe Express design');
    }
  });
  
  await runTest('Get location demographics', async () => {
    const response = await api.get('/integrations/location/demographics', {
      params: {
        coordinates: [-122.4194, 37.7749],
        zipCode: '94103'
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get location demographics');
    }
  });
  
  await runTest('Get location weather', async () => {
    const response = await api.get('/integrations/location/weather', {
      params: {
        coordinates: [-122.4194, 37.7749]
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get location weather');
    }
  });
  
  await runTest('Get nearby landmarks', async () => {
    const response = await api.get('/integrations/location/landmarks', {
      params: {
        coordinates: [-122.4194, 37.7749]
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get nearby landmarks');
    }
  });
  
  await runTest('Get all reviews', async () => {
    const response = await api.get('/integrations/reviews/all', {
      params: {
        business: {
          name: testData.business.name
        }
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get all reviews');
    }
  });
}

// Run all tests
async function runAllTests() {
  try {
    console.log('Starting API tests...');
    
    await authTests();
    const businessId = await businessTests();
    const locationId = await locationTests(businessId);
    const templateId = await templateTests();
    const designId = await designTests(businessId, locationId, templateId);
    await integrationTests(designId, locationId);
    
    console.log('\\nTest Summary:');
    console.log(\`Total tests: \${results.total}\`);
    console.log(\`Passed: \${results.passed}\`);
    console.log(\`Failed: \${results.failed}\`);
    
    // Save results to file
    fs.writeFileSync(
      path.join(__dirname, 'api-test-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\\nTest results saved to api-test-results.json');
    
    if (results.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

runAllTests();
EOL
echo "API test script created."
echo ""

# Create frontend test script
echo "Creating frontend test script..."
cat > $TEST_DIR/frontend-tests.js << EOL
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Load test configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-config.json'), 'utf8'));
const { frontend, testData } = config;

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run a test
async function runTest(name, testFn) {
  results.total++;
  try {
    console.log(\`Running test: \${name}\`);
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'passed' });
    console.log(\`✅ Test passed: \${name}\`);
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name, 
      status: 'failed', 
      error: error.message
    });
    console.error(\`❌ Test failed: \${name}\`);
    console.error(\`   Error: \${error.message}\`);
  }
}

// Take screenshot
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(__dirname, \`screenshot-\${name.replace(/\\s+/g, '-').toLowerCase()}.png\`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(\`   Screenshot saved to \${screenshotPath}\`);
}

// Run all tests
async function runAllTests() {
  let browser;
  let page;
  
  try {
    console.log('Starting frontend tests...');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Authentication tests
    await runTest('Load login page', async () => {
      await page.goto(\`\${frontend.baseUrl}/login\`, { timeout: frontend.timeout });
      await page.waitForSelector('form');
      await takeScreenshot(page, 'login-page');
    });
    
    await runTest('Register new user', async () => {
      await page.goto(\`\${frontend.baseUrl}/register\`, { timeout: frontend.timeout });
      await page.waitForSelector('form');
      
      await page.type('input[name="email"]', testData.user.email);
      await page.type('input[name="password"]', testData.user.password);
      await page.type('input[name="displayName"]', 'Test User');
      
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ timeout: frontend.timeout })
      ]);
      
      // Check if we're redirected to dashboard
      const url = page.url();
      if (!url.includes('/dashboard')) {
        throw new Error(\`Expected to be redirected to dashboard, but got \${url}\`);
      }
      
      await takeScreenshot(page, 'after-register');
    });
    
    await runTest('Logout', async () => {
      // Click on profile dropdown
      await page.click('.profile-btn');
      await page.waitForSelector('.dropdown-item');
      
      // Click logout
      await Promise.all([
        page.click('.dropdown-item:last-child'),
        page.waitForNavigation({ timeout: frontend.timeout })
      ]);
      
      // Check if we're redirected to login
      const url = page.url();
      if (!url.includes('/login')) {
        throw new Error(\`Expected to be redirected to login, but got \${url}\`);
      }
    });
    
    await runTest('Login', async () => {
      await page.goto(\`\${frontend.baseUrl}/login\`, { timeout: frontend.timeout });
      await page.waitForSelector('form');
      
      await page.type('input[name="email"]', testData.user.email);
      await page.type('input[name="password"]', testData.user.password);
      
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ timeout: frontend.timeout })
      ]);
      
      // Check if we're redirected to dashboard
      const url = page.url();
      if (!url.includes('/dashboard')) {
        throw new Error(\`Expected to be redirected to dashboard, but got \${url}\`);
      }
      
      await takeScreenshot(page, 'dashboard');
    });
    
    // Business tests
    await runTest('Navigate to businesses page', async () => {
      await page.click('a[href="/businesses"]');
      await page.waitForSelector('.business-list-page');
      await takeScreenshot(page, 'businesses-page');
    });
    
    await runTest('Create new business', async () => {
      await page.click('.btn-primary');
      await page.waitForSelector('form');
      
      await page.type('input[name="name"]', testData.business.name);
      await page.type('textarea[name="description"]', 'Test business description');
      await page.select('select[name="industry"]', testData.business.industry);
      
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ timeout: frontend.timeout })
      ]);
      
      // Check if we're redirected to business detail
      const url = page.url();
      if (!url.includes('/businesses/')) {
        throw new Error(\`Expected to be redirected to business detail, but got \${url}\`);
      }
      
      await takeScreenshot(page, 'business-detail');
    });
    
    // Location tests
    await runTest('Add location to business', async () => {
      await page.click('a.add-location-btn');
      await page.waitForSelector('form');
      
      await page.type('input[name="name"]', testData.location.name);
      await page.type('input[name="street"]', testData.location.address.street);
      await page.type('input[name="city"]', testData.location.address.city);
      await page.type('input[name="state"]', testData.location.address.state);
      await page.type('input[name="zipCode"]', testData.location.address.zipCode);
      
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForSelector('.location-card')
      ]);
      
      await takeScreenshot(page, 'location-added');
    });
    
    // Template tests
    await runTest('Navigate to templates page', async () => {
      await page.click('a[href="/templates"]');
      await page.waitForSelector('.template-gallery-page');
      await takeScreenshot(page, 'templates-page');
    });
    
    await runTest('Filter templates', async () => {
      await page.click('.filter-dropdown button');
      await page.waitForSelector('.filter-dropdown-menu');
      
      await page.select('.filter-select:nth-child(1)', testData.business.industry);
      
      // Wait for templates to reload
      await page.waitForTimeout(1000);
      
      await takeScreenshot(page, 'filtered-templates');
    });
    
    await runTest('Select template', async () => {
      await page.click('.template-card:first-child');
      await page.waitForSelector('.template-detail-modal');
      await takeScreenshot(page, 'template-detail');
    });
    
    // Design tests
    await runTest('Create design from template', async () => {
      await page.click('.btn-primary');
      await page.waitForSelector('form');
      
      await page.type('input[name="name"]', 'Test Design');
      await page.select('select[name="business"]', '1'); // First business
      await page.select('select[name="location"]', '1'); // First location
      
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ timeout: frontend.timeout })
      ]);
      
      // Check if we're redirected to design editor
      const url = page.url();
      if (!url.includes('/editor/')) {
        throw new Error(\`Expected to be redirected to design editor, but got \${url}\`);
      }
      
      await takeScreenshot(page, 'design-editor');
    });
    
    await runTest('Navigate to designs page', async () => {
      await page.click('a[href="/designs"]');
      await page.waitForSelector('.design-list-page');
      await takeScreenshot(page, 'designs-page');
    });
    
    await runTest('View design detail', async () => {
      await page.click('.design-card:first-child');
      await page.waitForSelector('.design-detail-page');
      await takeScreenshot(page, 'design-detail');
    });
    
    // Responsive tests
    await runTest('Test mobile responsiveness', async () => {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      
      // Test dashboard
      await page.goto(\`\${frontend.baseUrl}/dashboard\`, { timeout: frontend.timeout });
      await page.waitForSelector('.dashboard-page');
      await takeScreenshot(page, 'mobile-dashboard');
      
      // Test businesses page
      await page.goto(\`\${frontend.baseUrl}/businesses\`, { timeout: frontend.timeout });
      await page.waitForSelector('.business-list-page');
      await takeScreenshot(page, 'mobile-businesses');
      
      // Test templates page
      await page.goto(\`\${frontend.baseUrl}/templates\`, { timeout: frontend.timeout });
      await page.waitForSelector('.template-gallery-page');
      await takeScreenshot(page, 'mobile-templates');
      
      // Test designs page
      await page.goto(\`\${frontend.baseUrl}/designs\`, { timeout: frontend.timeout });
      await page.waitForSelector('.design-list-page');
      await takeScreenshot(page, 'mobile-designs');
    });
    
    console.log('\\nTest Summary:');
    console.log(\`Total tests: \${results.total}\`);
    console.log(\`Passed: \${results.passed}\`);
    console.log(\`Failed: \${results.failed}\`);
    
    // Save results to file
    fs.writeFileSync(
      path.join(__dirname, 'frontend-test-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\\nTest results saved to frontend-test-results.json');
    
    if (results.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runAllTests();
EOL
echo "Frontend test script created."
echo ""

# Create integration test script
echo "Creating integration test script..."
cat > $TEST_DIR/integration-tests.js << EOL
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load test configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-config.json'), 'utf8'));
const { backend, integrations } = config;

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run a test
async function runTest(name, testFn) {
  results.total++;
  try {
    console.log(\`Running test: \${name}\`);
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'passed' });
    console.log(\`✅ Test passed: \${name}\`);
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name, 
      status: 'failed', 
      error: error.message,
      details: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
    console.error(\`❌ Test failed: \${name}\`);
    console.error(\`   Error: \${error.message}\`);
    if (error.response) {
      console.error(\`   Status: \${error.response.status}\`);
      console.error(\`   Data: \${JSON.stringify(error.response.data)}\`);
    }
  }
}

// Adobe Express SDK integration tests
async function adobeExpressTests() {
  if (!integrations.adobeExpress.enabled) {
    console.log('Skipping Adobe Express SDK tests (disabled in config)');
    return;
  }
  
  console.log('\\nRunning Adobe Express SDK integration tests...');
  
  const api = axios.create({
    baseURL: \`\${backend.baseUrl}/integrations/adobe-express\`,
    timeout: backend.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token' // Mock token for testing
    }
  });
  
  await runTest('Initialize Adobe Express SDK', async () => {
    const response = await api.post('/init');
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to initialize Adobe Express SDK');
    }
  });
  
  await runTest('Get Adobe Express templates', async () => {
    const response = await api.get('/templates');
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get Adobe Express templates');
    }
    
    if (!response.data.templates || !Array.isArray(response.data.templates)) {
      throw new Error('Invalid templates response');
    }
  });
  
  await runTest('Create design from template', async () => {
    const response = await api.post('/create-design', {
      templateId: 'test-template-id',
      variables: {
        businessName: 'Test Business',
        tagline: 'Test Tagline'
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to create design from template');
    }
    
    if (!response.data.design || !response.data.design.id) {
      throw new Error('Invalid design response');
    }
  });
  
  await runTest('Generate edit URL', async () => {
    const response = await api.post('/edit-url', {
      designId: 'test-design-id'
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to generate edit URL');
    }
    
    if (!response.data.editUrl) {
      throw new Error('Invalid edit URL response');
    }
  });
  
  await runTest('Export design', async () => {
    const response = await api.post('/export', {
      designId: 'test-design-id',
      format: 'png'
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to export design');
    }
    
    if (!response.data.export || !response.data.export.url) {
      throw new Error('Invalid export response');
    }
  });
}

// Location Intelligence integration tests
async function locationIntelligenceTests() {
  if (!integrations.locationIntelligence.enabled) {
    console.log('Skipping Location Intelligence tests (disabled in config)');
    return;
  }
  
  console.log('\\nRunning Location Intelligence integration tests...');
  
  const api = axios.create({
    baseURL: \`\${backend.baseUrl}/integrations/location\`,
    timeout: backend.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token' // Mock token for testing
    }
  });
  
  await runTest('Geocode address', async () => {
    const response = await api.get('/geocode', {
      params: {
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to geocode address');
    }
    
    if (!response.data.geocode || !response.data.geocode.coordinates) {
      throw new Error('Invalid geocode response');
    }
  });
  
  await runTest('Get demographics data', async () => {
    const response = await api.get('/demographics', {
      params: {
        coordinates: [-122.4194, 37.7749],
        zipCode: '94103'
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get demographics data');
    }
    
    if (!response.data.demographics) {
      throw new Error('Invalid demographics response');
    }
  });
  
  await runTest('Get weather data', async () => {
    const response = await api.get('/weather', {
      params: {
        coordinates: [-122.4194, 37.7749]
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get weather data');
    }
    
    if (!response.data.weather) {
      throw new Error('Invalid weather response');
    }
  });
  
  await runTest('Get nearby landmarks', async () => {
    const response = await api.get('/landmarks', {
      params: {
        coordinates: [-122.4194, 37.7749]
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get nearby landmarks');
    }
    
    if (!response.data.landmarks || !Array.isArray(response.data.landmarks)) {
      throw new Error('Invalid landmarks response');
    }
  });
  
  await runTest('Get nearby competitors', async () => {
    const response = await api.get('/competitors', {
      params: {
        coordinates: [-122.4194, 37.7749],
        businessType: 'restaurant'
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get nearby competitors');
    }
    
    if (!response.data.competitors || !Array.isArray(response.data.competitors)) {
      throw new Error('Invalid competitors response');
    }
  });
  
  await runTest('Get seasonal data', async () => {
    const response = await api.get('/seasonal', {
      params: {
        coordinates: [-122.4194, 37.7749]
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get seasonal data');
    }
    
    if (!response.data.seasonalData) {
      throw new Error('Invalid seasonal data response');
    }
  });
}

// Review Integration tests
async function reviewIntegrationTests() {
  if (!integrations.reviewIntegration.enabled) {
    console.log('Skipping Review Integration tests (disabled in config)');
    return;
  }
  
  console.log('\\nRunning Review Integration tests...');
  
  const api = axios.create({
    baseURL: \`\${backend.baseUrl}/integrations/reviews\`,
    timeout: backend.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token' // Mock token for testing
    }
  });
  
  await runTest('Get Google reviews', async () => {
    const response = await api.get('/google', {
      params: {
        placeId: 'test-place-id'
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get Google reviews');
    }
    
    if (!response.data.reviews) {
      throw new Error('Invalid Google reviews response');
    }
  });
  
  await runTest('Get Yelp reviews', async () => {
    const response = await api.get('/yelp', {
      params: {
        businessId: 'test-business-id'
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get Yelp reviews');
    }
    
    if (!response.data.reviews) {
      throw new Error('Invalid Yelp reviews response');
    }
  });
  
  await runTest('Get all reviews', async () => {
    const response = await api.get('/all', {
      params: {
        business: {
          name: 'Test Business',
          googlePlaceId: 'test-place-id',
          yelpBusinessId: 'test-business-id'
        }
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to get all reviews');
    }
    
    if (!response.data.reviews) {
      throw new Error('Invalid all reviews response');
    }
  });
  
  await runTest('Analyze review sentiment', async () => {
    const response = await api.post('/analyze', {
      text: 'This is a great service! I really enjoyed it and would recommend to others.'
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Failed to analyze review sentiment');
    }
    
    if (!response.data.sentiment) {
      throw new Error('Invalid sentiment analysis response');
    }
  });
}

// Run all tests
async function runAllTests() {
  try {
    console.log('Starting integration tests...');
    
    await adobeExpressTests();
    await locationIntelligenceTests();
    await reviewIntegrationTests();
    
    console.log('\\nTest Summary:');
    console.log(\`Total tests: \${results.total}\`);
    console.log(\`Passed: \${results.passed}\`);
    console.log(\`Failed: \${results.failed}\`);
    
    // Save results to file
    fs.writeFileSync(
      path.join(__dirname, 'integration-test-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\\nTest results saved to integration-test-results.json');
    
    if (results.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

runAllTests();
EOL
echo "Integration test script created."
echo ""

# Create load test script
echo "Creating load test script..."
cat > $TEST_DIR/load-tests.js << EOL
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load test configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-config.json'), 'utf8'));
const { backend } = config;

// Test results
const results = {
  endpoints: {},
  summary: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalTime: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0
  }
};

// Create axios instance
const api = axios.create({
  baseURL: backend.baseUrl,
  timeout: backend.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token' // Mock token for testing
  }
});

// Test endpoints
const endpoints = [
  { method: 'GET', url: '/businesses', name: 'Get Businesses' },
  { method: 'GET', url: '/locations', name: 'Get Locations' },
  { method: 'GET', url: '/templates', name: 'Get Templates' },
  { method: 'GET', url: '/designs', name: 'Get Designs' },
  { method: 'GET', url: '/templates/popular', name: 'Get Popular Templates' },
  { method: 'GET', url: '/templates/seasonal', name: 'Get Seasonal Templates' },
  { method: 'GET', url: '/integrations/adobe-express/templates', name: 'Get Adobe Express Templates' }
];

// Helper function to run a load test on an endpoint
async function runLoadTest(endpoint, concurrentRequests = 10, totalRequests = 100) {
  console.log(\`Running load test for \${endpoint.name} (\${endpoint.method} \${endpoint.url})...\`);
  
  const endpointResults = {
    name: endpoint.name,
    url: endpoint.url,
    method: endpoint.method,
    concurrentRequests,
    totalRequests,
    successfulRequests: 0,
    failedRequests: 0,
    totalTime: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    responseTimes: []
  };
  
  // Create batches of requests
  const batches = [];
  const batchSize = concurrentRequests;
  const numBatches = Math.ceil(totalRequests / batchSize);
  
  for (let i = 0; i < numBatches; i++) {
    const batch = [];
    const remainingRequests = totalRequests - (i * batchSize);
    const currentBatchSize = Math.min(batchSize, remainingRequests);
    
    for (let j = 0; j < currentBatchSize; j++) {
      batch.push(makeRequest(endpoint));
    }
    
    batches.push(batch);
  }
  
  // Execute batches sequentially
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchResults = await Promise.all(batch);
    
    batchResults.forEach(result => {
      if (result.success) {
        endpointResults.successfulRequests++;
        endpointResults.totalTime += result.time;
        endpointResults.minResponseTime = Math.min(endpointResults.minResponseTime, result.time);
        endpointResults.maxResponseTime = Math.max(endpointResults.maxResponseTime, result.time);
        endpointResults.responseTimes.push(result.time);
      } else {
        endpointResults.failedRequests++;
      }
    });
  }
  
  // Calculate average response time
  if (endpointResults.successfulRequests > 0) {
    endpointResults.averageResponseTime = endpointResults.totalTime / endpointResults.successfulRequests;
  }
  
  // Update summary
  results.summary.totalRequests += totalRequests;
  results.summary.successfulRequests += endpointResults.successfulRequests;
  results.summary.failedRequests += endpointResults.failedRequests;
  results.summary.totalTime += endpointResults.totalTime;
  results.summary.minResponseTime = Math.min(results.summary.minResponseTime, endpointResults.minResponseTime);
  results.summary.maxResponseTime = Math.max(results.summary.maxResponseTime, endpointResults.maxResponseTime);
  
  // Add to results
  results.endpoints[endpoint.name] = endpointResults;
  
  console.log(\`  Completed: \${endpointResults.successfulRequests} successful, \${endpointResults.failedRequests} failed\`);
  console.log(\`  Average response time: \${endpointResults.averageResponseTime.toFixed(2)}ms\`);
  console.log(\`  Min/Max response time: \${endpointResults.minResponseTime.toFixed(2)}ms / \${endpointResults.maxResponseTime.toFixed(2)}ms\`);
  console.log();
}

// Helper function to make a request and measure response time
async function makeRequest(endpoint) {
  const startTime = Date.now();
  
  try {
    let response;
    
    if (endpoint.method === 'GET') {
      response = await api.get(endpoint.url);
    } else if (endpoint.method === 'POST') {
      response = await api.post(endpoint.url, endpoint.data || {});
    } else if (endpoint.method === 'PUT') {
      response = await api.put(endpoint.url, endpoint.data || {});
    } else if (endpoint.method === 'DELETE') {
      response = await api.delete(endpoint.url);
    }
    
    const endTime = Date.now();
    const time = endTime - startTime;
    
    return {
      success: true,
      time,
      status: response.status
    };
  } catch (error) {
    const endTime = Date.now();
    const time = endTime - startTime;
    
    return {
      success: false,
      time,
      error: error.message,
      status: error.response ? error.response.status : null
    };
  }
}

// Run all load tests
async function runAllLoadTests() {
  try {
    console.log('Starting load tests...');
    
    for (const endpoint of endpoints) {
      await runLoadTest(endpoint);
    }
    
    // Calculate overall average response time
    if (results.summary.successfulRequests > 0) {
      results.summary.averageResponseTime = results.summary.totalTime / results.summary.successfulRequests;
    }
    
    console.log('Load Test Summary:');
    console.log(\`Total Requests: \${results.summary.totalRequests}\`);
    console.log(\`Successful Requests: \${results.summary.successfulRequests}\`);
    console.log(\`Failed Requests: \${results.summary.failedRequests}\`);
    console.log(\`Average Response Time: \${results.summary.averageResponseTime.toFixed(2)}ms\`);
    console.log(\`Min/Max Response Time: \${results.summary.minResponseTime.toFixed(2)}ms / \${results.summary.maxResponseTime.toFixed(2)}ms\`);
    
    // Save results to file
    fs.writeFileSync(
      path.join(__dirname, 'load-test-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\\nTest results saved to load-test-results.json');
  } catch (error) {
    console.error('Error running load tests:', error);
    process.exit(1);
  }
}

runAllLoadTests();
EOL
echo "Load test script created."
echo ""

# Create main test runner script
echo "Creating main test runner script..."
cat > $TEST_DIR/run-tests.sh << EOL
#!/bin/bash

# LocalBrand Pro Test Runner
# This script runs all tests for the LocalBrand Pro application

echo "====================================================="
echo "LocalBrand Pro Test Runner"
echo "====================================================="
echo ""

# Set environment variables
export NODE_ENV=test

# Function to run a test and check result
run_test() {
  local test_name=\$1
  local test_command=\$2
  
  echo "Running \$test_name..."
  echo "Command: \$test_command"
  echo ""
  
  eval \$test_command
  local result=\$?
  
  if [ \$result -eq 0 ]; then
    echo "✅ \$test_name passed"
  else
    echo "❌ \$test_name failed with exit code \$result"
    failed_tests+=("\$test_name")
  fi
  
  echo ""
  echo "-----------------------------------------------------"
  echo ""
}

# Array to store failed tests
failed_tests=()

# Run API tests
run_test "API Tests" "node api-tests.js"

# Run Integration tests
run_test "Integration Tests" "node integration-tests.js"

# Run Frontend tests
run_test "Frontend Tests" "node frontend-tests.js"

# Run Load tests
run_test "Load Tests" "node load-tests.js"

# Print summary
echo "====================================================="
echo "Test Summary"
echo "====================================================="

if [ \${#failed_tests[@]} -eq 0 ]; then
  echo "✅ All tests passed!"
else
  echo "❌ \${#failed_tests[@]} test(s) failed:"
  for test in "\${failed_tests[@]}"; do
    echo "  - \$test"
  done
  exit 1
fi
EOL
chmod +x $TEST_DIR/run-tests.sh
echo "Main test runner script created."
echo ""

# Create package.json for tests
echo "Creating package.json for tests..."
cat > $TEST_DIR/package.json << EOL
{
  "name": "localbrand-pro-tests",
  "version": "1.0.0",
  "description": "Tests for LocalBrand Pro application",
  "scripts": {
    "test": "./run-tests.sh",
    "test:api": "node api-tests.js",
    "test:integration": "node integration-tests.js",
    "test:frontend": "node frontend-tests.js",
    "test:load": "node load-tests.js"
  },
  "dependencies": {
    "axios": "^0.27.2",
    "puppeteer": "^19.7.0"
  }
}
EOL
echo "Package.json created."
echo ""

echo "====================================================="
echo "Interoperability and Scalability Test Setup Complete"
echo "====================================================="
echo ""
echo "Test scripts have been created in $TEST_DIR"
echo ""
echo "To run the tests:"
echo "1. Start the backend server: cd /home/ubuntu/localbrand_pro/backend && npm start"
echo "2. Start the frontend server: cd /home/ubuntu/localbrand_pro/frontend && npm start"
echo "3. Run the tests: cd $TEST_DIR && ./run-tests.sh"
echo ""
echo "Individual test commands:"
echo "- API Tests: npm run test:api"
echo "- Integration Tests: npm run test:integration"
echo "- Frontend Tests: npm run test:frontend"
echo "- Load Tests: npm run test:load"
echo ""
echo "Test results will be saved in the following files:"
echo "- api-test-results.json"
echo "- integration-test-results.json"
echo "- frontend-test-results.json"
echo "- load-test-results.json"
echo ""
