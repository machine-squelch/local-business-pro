#!/bin/bash

# LocalBrand Pro End-to-End Test Script
# This script performs comprehensive end-to-end testing of the LocalBrand Pro application

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                     LocalBrand Pro                            ║"
echo "║                End-to-End Testing Script                      ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Set directory paths
PROJECT_DIR=$(pwd)
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
TEST_DIR="$PROJECT_DIR/tests"
RESULTS_DIR="$TEST_DIR/results"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check required tools
check_required_tools() {
  echo -e "${BLUE}Checking required tools...${NC}"
  
  local required_tools=("node" "npm" "curl" "jq")
  local missing_tools=()
  
  for tool in "${required_tools[@]}"; do
    echo -n "Checking for $tool... "
    if command_exists "$tool"; then
      echo -e "${GREEN}Found${NC}"
    else
      echo -e "${RED}Not found${NC}"
      missing_tools+=("$tool")
    fi
  done
  
  if [ ${#missing_tools[@]} -ne 0 ]; then
    echo -e "${RED}Error: The following required tools are missing:${NC}"
    for tool in "${missing_tools[@]}"; do
      echo "  - $tool"
    done
    echo -e "${RED}Please install these tools and try again.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}All required tools are available.${NC}"
  echo ""
}

# Function to start backend server
start_backend() {
  echo -e "${BLUE}Starting backend server...${NC}"
  
  # Check if backend is already running
  if lsof -i:5000 > /dev/null; then
    echo -e "${YELLOW}Backend server is already running on port 5000.${NC}"
    return 0
  fi
  
  # Start backend server
  cd "$BACKEND_DIR"
  NODE_ENV=test PORT=5000 node src/index.js > "$RESULTS_DIR/backend.log" 2>&1 &
  BACKEND_PID=$!
  
  # Wait for backend to start
  echo -n "Waiting for backend to start"
  for i in {1..30}; do
    if curl -s http://localhost:5000/api/health > /dev/null; then
      echo -e "\n${GREEN}Backend server started successfully.${NC}"
      return 0
    fi
    echo -n "."
    sleep 1
  done
  
  echo -e "\n${RED}Failed to start backend server.${NC}"
  cat "$RESULTS_DIR/backend.log"
  exit 1
}

# Function to start frontend server
start_frontend() {
  echo -e "${BLUE}Starting frontend server...${NC}"
  
  # Check if frontend is already running
  if lsof -i:3000 > /dev/null; then
    echo -e "${YELLOW}Frontend server is already running on port 3000.${NC}"
    return 0
  fi
  
  # Start frontend server
  cd "$FRONTEND_DIR"
  REACT_APP_API_URL=http://localhost:5000/api npm start > "$RESULTS_DIR/frontend.log" 2>&1 &
  FRONTEND_PID=$!
  
  # Wait for frontend to start
  echo -n "Waiting for frontend to start"
  for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null; then
      echo -e "\n${GREEN}Frontend server started successfully.${NC}"
      return 0
    fi
    echo -n "."
    sleep 1
  done
  
  echo -e "\n${RED}Failed to start frontend server.${NC}"
  cat "$RESULTS_DIR/frontend.log"
  exit 1
}

# Function to stop servers
stop_servers() {
  echo -e "${BLUE}Stopping servers...${NC}"
  
  if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}Backend server stopped.${NC}"
  fi
  
  if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Frontend server stopped.${NC}"
  fi
  
  # Kill any remaining processes on ports 5000 and 3000
  kill $(lsof -t -i:5000) 2>/dev/null
  kill $(lsof -t -i:3000) 2>/dev/null
  
  echo ""
}

# Function to run API tests
run_api_tests() {
  echo -e "${BLUE}Running API tests...${NC}"
  
  cd "$TEST_DIR"
  node api-tests.js
  API_TEST_RESULT=$?
  
  if [ $API_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}API tests passed.${NC}"
  else
    echo -e "${RED}API tests failed.${NC}"
    TEST_FAILURES=$((TEST_FAILURES + 1))
  fi
  
  echo ""
}

# Function to run integration tests
run_integration_tests() {
  echo -e "${BLUE}Running integration tests...${NC}"
  
  cd "$TEST_DIR"
  node integration-tests.js
  INTEGRATION_TEST_RESULT=$?
  
  if [ $INTEGRATION_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}Integration tests passed.${NC}"
  else
    echo -e "${RED}Integration tests failed.${NC}"
    TEST_FAILURES=$((TEST_FAILURES + 1))
  fi
  
  echo ""
}

# Function to run frontend tests
run_frontend_tests() {
  echo -e "${BLUE}Running frontend tests...${NC}"
  
  cd "$TEST_DIR"
  node frontend-tests.js
  FRONTEND_TEST_RESULT=$?
  
  if [ $FRONTEND_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}Frontend tests passed.${NC}"
  else
    echo -e "${RED}Frontend tests failed.${NC}"
    TEST_FAILURES=$((TEST_FAILURES + 1))
  fi
  
  echo ""
}

# Function to run load tests
run_load_tests() {
  echo -e "${BLUE}Running load tests...${NC}"
  
  cd "$TEST_DIR"
  node load-tests.js
  LOAD_TEST_RESULT=$?
  
  if [ $LOAD_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}Load tests passed.${NC}"
  else
    echo -e "${RED}Load tests failed.${NC}"
    TEST_FAILURES=$((TEST_FAILURES + 1))
  fi
  
  echo ""
}

# Function to run end-to-end workflow tests
run_e2e_workflow_tests() {
  echo -e "${BLUE}Running end-to-end workflow tests...${NC}"
  
  # Test user registration and login
  echo -e "${CYAN}Testing user registration and login...${NC}"
  REGISTRATION_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!","displayName":"Test User"}')
  
  if echo "$REGISTRATION_RESPONSE" | jq -e '.token' > /dev/null; then
    echo -e "${GREEN}User registration successful.${NC}"
    TOKEN=$(echo "$REGISTRATION_RESPONSE" | jq -r '.token')
  else
    echo -e "${RED}User registration failed.${NC}"
    echo "$REGISTRATION_RESPONSE"
    TEST_FAILURES=$((TEST_FAILURES + 1))
    return 1
  fi
  
  # Test business creation
  echo -e "${CYAN}Testing business creation...${NC}"
  BUSINESS_RESPONSE=$(curl -s -X POST http://localhost:5000/api/businesses \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name":"Test Business","description":"Test business description","industry":"restaurant"}')
  
  if echo "$BUSINESS_RESPONSE" | jq -e '.business._id' > /dev/null; then
    echo -e "${GREEN}Business creation successful.${NC}"
    BUSINESS_ID=$(echo "$BUSINESS_RESPONSE" | jq -r '.business._id')
  else
    echo -e "${RED}Business creation failed.${NC}"
    echo "$BUSINESS_RESPONSE"
    TEST_FAILURES=$((TEST_FAILURES + 1))
    return 1
  fi
  
  # Test location creation
  echo -e "${CYAN}Testing location creation...${NC}"
  LOCATION_RESPONSE=$(curl -s -X POST http://localhost:5000/api/locations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"business\":\"$BUSINESS_ID\",\"name\":\"Test Location\",\"address\":{\"street\":\"123 Test St\",\"city\":\"Test City\",\"state\":\"TS\",\"zipCode\":\"12345\",\"country\":\"Test Country\"}}")
  
  if echo "$LOCATION_RESPONSE" | jq -e '.location._id' > /dev/null; then
    echo -e "${GREEN}Location creation successful.${NC}"
    LOCATION_ID=$(echo "$LOCATION_RESPONSE" | jq -r '.location._id')
  else
    echo -e "${RED}Location creation failed.${NC}"
    echo "$LOCATION_RESPONSE"
    TEST_FAILURES=$((TEST_FAILURES + 1))
    return 1
  fi
  
  # Test template retrieval
  echo -e "${CYAN}Testing template retrieval...${NC}"
  TEMPLATES_RESPONSE=$(curl -s -X GET http://localhost:5000/api/templates \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$TEMPLATES_RESPONSE" | jq -e '.templates[0]._id' > /dev/null; then
    echo -e "${GREEN}Template retrieval successful.${NC}"
    TEMPLATE_ID=$(echo "$TEMPLATES_RESPONSE" | jq -r '.templates[0]._id')
  else
    echo -e "${RED}Template retrieval failed.${NC}"
    echo "$TEMPLATES_RESPONSE"
    TEST_FAILURES=$((TEST_FAILURES + 1))
    return 1
  fi
  
  # Test design creation
  echo -e "${CYAN}Testing design creation...${NC}"
  DESIGN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/designs \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\":\"Test Design\",\"business\":\"$BUSINESS_ID\",\"location\":\"$LOCATION_ID\",\"template\":\"$TEMPLATE_ID\",\"category\":\"social_media\"}")
  
  if echo "$DESIGN_RESPONSE" | jq -e '.design._id' > /dev/null; then
    echo -e "${GREEN}Design creation successful.${NC}"
    DESIGN_ID=$(echo "$DESIGN_RESPONSE" | jq -r '.design._id')
  else
    echo -e "${RED}Design creation failed.${NC}"
    echo "$DESIGN_RESPONSE"
    TEST_FAILURES=$((TEST_FAILURES + 1))
    return 1
  fi
  
  # Test Adobe Express integration
  echo -e "${CYAN}Testing Adobe Express integration...${NC}"
  ADOBE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/integrations/adobe-express/edit-url \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"designId\":\"$DESIGN_ID\"}")
  
  if echo "$ADOBE_RESPONSE" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}Adobe Express integration successful.${NC}"
  else
    echo -e "${RED}Adobe Express integration failed.${NC}"
    echo "$ADOBE_RESPONSE"
    TEST_FAILURES=$((TEST_FAILURES + 1))
    return 1
  fi
  
  # Test location intelligence integration
  echo -e "${CYAN}Testing location intelligence integration...${NC}"
  LOCATION_INTEL_RESPONSE=$(curl -s -X GET "http://localhost:5000/api/integrations/location/demographics?coordinates=-122.4194,37.7749&zipCode=94103" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$LOCATION_INTEL_RESPONSE" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}Location intelligence integration successful.${NC}"
  else
    echo -e "${RED}Location intelligence integration failed.${NC}"
    echo "$LOCATION_INTEL_RESPONSE"
    TEST_FAILURES=$((TEST_FAILURES + 1))
    return 1
  fi
  
  # Test review integration
  echo -e "${CYAN}Testing review integration...${NC}"
  REVIEW_RESPONSE=$(curl -s -X GET "http://localhost:5000/api/integrations/reviews/all?business[name]=Test%20Business" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$REVIEW_RESPONSE" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}Review integration successful.${NC}"
  else
    echo -e "${RED}Review integration failed.${NC}"
    echo "$REVIEW_RESPONSE"
    TEST_FAILURES=$((TEST_FAILURES + 1))
    return 1
  fi
  
  echo -e "${GREEN}End-to-end workflow tests completed successfully.${NC}"
  echo ""
}

# Function to run browser tests
run_browser_tests() {
  echo -e "${BLUE}Running browser tests...${NC}"
  
  if ! command_exists "playwright"; then
    echo -e "${YELLOW}Playwright not found. Installing...${NC}"
    npm install -g playwright
    playwright install
  fi
  
  # Create browser test script
  cat > "$TEST_DIR/browser-tests.js" << EOL
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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
  const screenshotPath = path.join(__dirname, 'results', \`screenshot-\${name.replace(/\\s+/g, '-').toLowerCase()}.png\`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(\`   Screenshot saved to \${screenshotPath}\`);
}

// Run all tests
async function runAllTests() {
  let browser;
  let page;
  
  try {
    console.log('Starting browser tests...');
    
    // Launch browser
    browser = await chromium.launch({
      headless: true
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Test login page
    await runTest('Load login page', async () => {
      await page.goto('http://localhost:3000/login', { timeout: 30000 });
      await page.waitForSelector('form');
      await takeScreenshot(page, 'login-page');
    });
    
    // Test registration
    await runTest('Register new user', async () => {
      await page.goto('http://localhost:3000/register', { timeout: 30000 });
      await page.waitForSelector('form');
      
      await page.fill('input[name="email"]', 'browser-test@example.com');
      await page.fill('input[name="password"]', 'Test123!');
      await page.fill('input[name="displayName"]', 'Browser Test User');
      
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ timeout: 30000 })
      ]);
      
      // Check if we're redirected to dashboard
      const url = page.url();
      if (!url.includes('/dashboard')) {
        throw new Error(\`Expected to be redirected to dashboard, but got \${url}\`);
      }
      
      await takeScreenshot(page, 'after-register');
    });
    
    // Test dashboard
    await runTest('View dashboard', async () => {
      await page.waitForSelector('.dashboard-page');
      await takeScreenshot(page, 'dashboard');
    });
    
    // Test businesses page
    await runTest('Navigate to businesses page', async () => {
      await page.click('a[href="/businesses"]');
      await page.waitForSelector('.business-list-page');
      await takeScreenshot(page, 'businesses-page');
    });
    
    // Test templates page
    await runTest('Navigate to templates page', async () => {
      await page.click('a[href="/templates"]');
      await page.waitForSelector('.template-gallery-page');
      await takeScreenshot(page, 'templates-page');
    });
    
    // Test designs page
    await runTest('Navigate to designs page', async () => {
      await page.click('a[href="/designs"]');
      await page.waitForSelector('.design-list-page');
      await takeScreenshot(page, 'designs-page');
    });
    
    // Test responsive design
    await runTest('Test responsive design', async () => {
      // Mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/dashboard', { timeout: 30000 });
      await page.waitForSelector('.dashboard-page');
      await takeScreenshot(page, 'mobile-dashboard');
      
      // Tablet viewport
      await page.setViewport({ width: 768, height: 1024 });
      await page.goto('http://localhost:3000/dashboard', { timeout: 30000 });
      await page.waitForSelector('.dashboard-page');
      await takeScreenshot(page, 'tablet-dashboard');
      
      // Desktop viewport
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('http://localhost:3000/dashboard', { timeout: 30000 });
      await page.waitForSelector('.dashboard-page');
      await takeScreenshot(page, 'desktop-dashboard');
    });
    
    // Test logout
    await runTest('Logout', async () => {
      // Click on profile dropdown
      await page.click('.profile-btn');
      await page.waitForSelector('.dropdown-item');
      
      // Click logout
      await Promise.all([
        page.click('.dropdown-item:last-child'),
        page.waitForNavigation({ timeout: 30000 })
      ]);
      
      // Check if we're redirected to login
      const url = page.url();
      if (!url.includes('/login')) {
        throw new Error(\`Expected to be redirected to login, but got \${url}\`);
      }
      
      await takeScreenshot(page, 'after-logout');
    });
    
    console.log('\\nTest Summary:');
    console.log(\`Total tests: \${results.total}\`);
    console.log(\`Passed: \${results.passed}\`);
    console.log(\`Failed: \${results.failed}\`);
    
    // Save results to file
    fs.writeFileSync(
      path.join(__dirname, 'results', 'browser-test-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\\nTest results saved to results/browser-test-results.json');
    
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
  
  # Run browser tests
  cd "$TEST_DIR"
  node browser-tests.js
  BROWSER_TEST_RESULT=$?
  
  if [ $BROWSER_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}Browser tests passed.${NC}"
  else
    echo -e "${RED}Browser tests failed.${NC}"
    TEST_FAILURES=$((TEST_FAILURES + 1))
  fi
  
  echo ""
}

# Function to run accessibility tests
run_accessibility_tests() {
  echo -e "${BLUE}Running accessibility tests...${NC}"
  
  if ! command_exists "pa11y"; then
    echo -e "${YELLOW}pa11y not found. Installing...${NC}"
    npm install -g pa11y
  fi
  
  # Run accessibility tests on key pages
  pa11y http://localhost:3000/login > "$RESULTS_DIR/a11y-login.txt"
  pa11y http://localhost:3000/register > "$RESULTS_DIR/a11y-register.txt"
  pa11y http://localhost:3000/dashboard > "$RESULTS_DIR/a11y-dashboard.txt"
  pa11y http://localhost:3000/businesses > "$RESULTS_DIR/a11y-businesses.txt"
  pa11y http://localhost:3000/templates > "$RESULTS_DIR/a11y-templates.txt"
  pa11y http://localhost:3000/designs > "$RESULTS_DIR/a11y-designs.txt"
  
  # Check results
  if grep -q "Error:" "$RESULTS_DIR/a11y-"*.txt; then
    echo -e "${RED}Accessibility tests found issues:${NC}"
    grep -n "Error:" "$RESULTS_DIR/a11y-"*.txt
    TEST_FAILURES=$((TEST_FAILURES + 1))
  else
    echo -e "${GREEN}Accessibility tests passed.${NC}"
  fi
  
  echo ""
}

# Function to run security tests
run_security_tests() {
  echo -e "${BLUE}Running security tests...${NC}"
  
  # Test for common security headers
  echo -e "${CYAN}Testing security headers...${NC}"
  HEADERS_RESPONSE=$(curl -s -I http://localhost:5000/api/health)
  
  # Check for X-Content-Type-Options
  if echo "$HEADERS_RESPONSE" | grep -q "X-Content-Type-Options: nosniff"; then
    echo -e "${GREEN}X-Content-Type-Options header is set correctly.${NC}"
  else
    echo -e "${RED}X-Content-Type-Options header is missing or incorrect.${NC}"
    TEST_FAILURES=$((TEST_FAILURES + 1))
  fi
  
  # Check for X-Frame-Options
  if echo "$HEADERS_RESPONSE" | grep -q "X-Frame-Options: DENY"; then
    echo -e "${GREEN}X-Frame-Options header is set correctly.${NC}"
  else
    echo -e "${RED}X-Frame-Options header is missing or incorrect.${NC}"
    TEST_FAILURES=$((TEST_FAILURES + 1))
  fi
  
  # Check for XSS Protection
  if echo "$HEADERS_RESPONSE" | grep -q "X-XSS-Protection: 1; mode=block"; then
    echo -e "${GREEN}X-XSS-Protection header is set correctly.${NC}"
  else
    echo -e "${RED}X-XSS-Protection header is missing or incorrect.${NC}"
    TEST_FAILURES=$((TEST_FAILURES + 1))
  fi
  
  # Test for CSRF protection
  echo -e "${CYAN}Testing CSRF protection...${NC}"
  CSRF_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!"}')
  
  if echo "$CSRF_RESPONSE" | grep -q "CSRF token missing"; then
    echo -e "${GREEN}CSRF protection is working.${NC}"
  else
    echo -e "${YELLOW}CSRF protection may not be properly implemented.${NC}"
    # Not failing the test as this might be a false positive
  fi
  
  # Test for authentication protection
  echo -e "${CYAN}Testing authentication protection...${NC}"
  AUTH_RESPONSE=$(curl -s -X GET http://localhost:5000/api/businesses)
  
  if echo "$AUTH_RESPONSE" | grep -q "Unauthorized" || echo "$AUTH_RESPONSE" | grep -q "Authentication required"; then
    echo -e "${GREEN}Authentication protection is working.${NC}"
  else
    echo -e "${RED}Authentication protection may not be properly implemented.${NC}"
    TEST_FAILURES=$((TEST_FAILURES + 1))
  fi
  
  echo ""
}

# Function to generate test report
generate_test_report() {
  echo -e "${BLUE}Generating test report...${NC}"
  
  # Create report file
  cat > "$RESULTS_DIR/test-report.html" << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LocalBrand Pro - End-to-End Test Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #6a11cb;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .summary {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-item .count {
      font-size: 2em;
      font-weight: bold;
    }
    .passed {
      color: #10b981;
    }
    .failed {
      color: #ef4444;
    }
    .test-section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 5px;
    }
    .test-section h3 {
      margin-top: 0;
    }
    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .screenshot {
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 5px;
    }
    .screenshot img {
      max-width: 100%;
      height: auto;
      border-radius: 3px;
    }
    .screenshot p {
      margin: 10px 0 0;
      text-align: center;
      font-size: 0.9em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f9fa;
    }
    tr:hover {
      background-color: #f8f9fa;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>LocalBrand Pro</h1>
    <h2>End-to-End Test Report</h2>
    <p>Generated on $(date)</p>
  </div>
  
  <div class="summary">
    <div class="summary-item">
      <div class="count">$(ls -1 "$RESULTS_DIR" | wc -l)</div>
      <div>Total Tests</div>
    </div>
    <div class="summary-item">
      <div class="count passed">$(($TEST_COUNT - $TEST_FAILURES))</div>
      <div>Passed</div>
    </div>
    <div class="summary-item">
      <div class="count failed">$TEST_FAILURES</div>
      <div>Failed</div>
    </div>
  </div>
  
  <div class="test-section">
    <h3>API Tests</h3>
    <p>Results from testing the backend API endpoints.</p>
    <pre>$(cat "$RESULTS_DIR/api-test-results.json" 2>/dev/null || echo "No results available")</pre>
  </div>
  
  <div class="test-section">
    <h3>Integration Tests</h3>
    <p>Results from testing the integration between different components.</p>
    <pre>$(cat "$RESULTS_DIR/integration-test-results.json" 2>/dev/null || echo "No results available")</pre>
  </div>
  
  <div class="test-section">
    <h3>Frontend Tests</h3>
    <p>Results from testing the frontend components and pages.</p>
    <pre>$(cat "$RESULTS_DIR/frontend-test-results.json" 2>/dev/null || echo "No results available")</pre>
  </div>
  
  <div class="test-section">
    <h3>Browser Tests</h3>
    <p>Results from end-to-end browser testing.</p>
    <pre>$(cat "$RESULTS_DIR/browser-test-results.json" 2>/dev/null || echo "No results available")</pre>
    
    <h4>Screenshots</h4>
    <div class="screenshots">
EOL
  
  # Add screenshots to report
  for screenshot in "$RESULTS_DIR"/screenshot-*.png; do
    if [ -f "$screenshot" ]; then
      filename=$(basename "$screenshot")
      name=${filename#screenshot-}
      name=${name%.png}
      name=${name//-/ }
      name=${name^}
      
      echo "      <div class=\"screenshot\">" >> "$RESULTS_DIR/test-report.html"
      echo "        <img src=\"$filename\" alt=\"$name\">" >> "$RESULTS_DIR/test-report.html"
      echo "        <p>$name</p>" >> "$RESULTS_DIR/test-report.html"
      echo "      </div>" >> "$RESULTS_DIR/test-report.html"
    fi
  done
  
  # Complete the report
  cat >> "$RESULTS_DIR/test-report.html" << EOL
    </div>
  </div>
  
  <div class="test-section">
    <h3>Accessibility Tests</h3>
    <p>Results from testing accessibility compliance.</p>
    <table>
      <tr>
        <th>Page</th>
        <th>Status</th>
        <th>Issues</th>
      </tr>
EOL
  
  # Add accessibility results to report
  for a11y_file in "$RESULTS_DIR"/a11y-*.txt; do
    if [ -f "$a11y_file" ]; then
      filename=$(basename "$a11y_file")
      page=${filename#a11y-}
      page=${page%.txt}
      page=${page//-/ }
      page=${page^}
      
      if grep -q "Error:" "$a11y_file"; then
        status="Failed"
        issues=$(grep -c "Error:" "$a11y_file")
      else
        status="Passed"
        issues="0"
      fi
      
      echo "      <tr>" >> "$RESULTS_DIR/test-report.html"
      echo "        <td>$page</td>" >> "$RESULTS_DIR/test-report.html"
      echo "        <td class=\"${status,,}\">$status</td>" >> "$RESULTS_DIR/test-report.html"
      echo "        <td>$issues</td>" >> "$RESULTS_DIR/test-report.html"
      echo "      </tr>" >> "$RESULTS_DIR/test-report.html"
    fi
  done
  
  # Complete the report
  cat >> "$RESULTS_DIR/test-report.html" << EOL
    </table>
  </div>
  
  <div class="test-section">
    <h3>Load Tests</h3>
    <p>Results from testing system performance under load.</p>
    <pre>$(cat "$RESULTS_DIR/load-test-results.json" 2>/dev/null || echo "No results available")</pre>
  </div>
  
  <div class="test-section">
    <h3>Security Tests</h3>
    <p>Results from testing security measures.</p>
    <pre>$(cat "$RESULTS_DIR/security-test-results.txt" 2>/dev/null || echo "No results available")</pre>
  </div>
</body>
</html>
EOL
  
  echo -e "${GREEN}Test report generated: $RESULTS_DIR/test-report.html${NC}"
  echo ""
}

# Main function
main() {
  # Initialize variables
  TEST_COUNT=6
  TEST_FAILURES=0
  
  # Check required tools
  check_required_tools
  
  # Start servers
  start_backend
  start_frontend
  
  # Run tests
  run_api_tests
  run_integration_tests
  run_frontend_tests
  run_e2e_workflow_tests
  run_browser_tests
  run_accessibility_tests
  run_security_tests
  run_load_tests
  
  # Generate test report
  generate_test_report
  
  # Stop servers
  stop_servers
  
  # Display summary
  echo -e "${BLUE}Test Summary${NC}"
  echo "========================================"
  echo -e "Total Tests: ${CYAN}$TEST_COUNT${NC}"
  echo -e "Passed: ${GREEN}$(($TEST_COUNT - $TEST_FAILURES))${NC}"
  echo -e "Failed: ${RED}$TEST_FAILURES${NC}"
  echo ""
  echo -e "Test report: ${CYAN}$RESULTS_DIR/test-report.html${NC}"
  echo ""
  
  if [ $TEST_FAILURES -eq 0 ]; then
    echo -e "${GREEN}All tests passed successfully!${NC}"
    exit 0
  else
    echo -e "${RED}Some tests failed. Please check the test report for details.${NC}"
    exit 1
  fi
}

# Run main function
main
