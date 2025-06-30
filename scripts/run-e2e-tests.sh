#!/bin/bash

# LocalBrand Pro - End-to-End Test Script
# This script runs comprehensive end-to-end tests for the LocalBrand Pro application

echo "===== LocalBrand Pro End-to-End Test Script ====="
echo "Starting tests at $(date)"
echo

# Set up environment
echo "Setting up test environment..."
export NODE_ENV=test
export REACT_APP_API_URL=http://localhost:5000/api
export REACT_APP_ADOBE_CLIENT_ID=test_client_id

# Create test directory
TEST_DIR="$(pwd)/e2e_test_results"
mkdir -p $TEST_DIR

# Start backend server for testing
echo "Starting backend server..."
cd backend
npm run start:test &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend server to initialize..."
sleep 5

# Start frontend development server
echo "Starting frontend server..."
cd ../frontend
npm run start &
FRONTEND_PID=$!

# Wait for frontend to start
echo "Waiting for frontend server to initialize..."
sleep 10

# Run end-to-end tests with Playwright
echo
echo "===== Running End-to-End Tests ====="
echo "$(date): Starting end-to-end tests"
cd ..
npm run test:e2e > $TEST_DIR/e2e_results.log

# Check end-to-end test results
if [ $? -eq 0 ]; then
  echo "✅ End-to-end tests PASSED"
  E2E_STATUS="PASSED"
else
  echo "❌ End-to-end tests FAILED - See $TEST_DIR/e2e_results.log for details"
  E2E_STATUS="FAILED"
fi

# Stop servers
echo
echo "Stopping servers..."
kill $BACKEND_PID
kill $FRONTEND_PID

# Generate test report
echo
echo "===== Generating Test Report ====="
cat > $TEST_DIR/e2e_test_report.md << EOL
# LocalBrand Pro End-to-End Test Report
Generated: $(date)

## Test Results Summary

| Test Category | Status | Details |
|---------------|--------|---------|
| End-to-End Tests | ${E2E_STATUS} | [View Log](e2e_results.log) |

## Test Scenarios

### Authentication Flow
- User registration
- User login
- Password reset
- Session management

### Business Management
- Create business
- Edit business details
- View business analytics
- Delete business

### Location Management
- Add location
- Edit location details
- View location analytics
- Delete location

### Template Gallery
- Browse templates
- Filter templates by category
- Search templates
- Select template

### Design Editor
- Create new design
- Edit existing design
- Apply location enhancements
- Apply review content
- Apply seasonal adjustments
- Save design
- Export design

### User Settings
- Update profile
- Change password
- Manage notification preferences
- View activity history

## Next Steps
${E2E_STATUS} == "PASSED" ? "All end-to-end tests have passed. The application is ready for deployment." : "Some end-to-end tests have failed. Please review the logs and address the issues before proceeding to deployment."}
EOL

echo "Test report generated: $TEST_DIR/e2e_test_report.md"
echo
echo "===== Testing Complete ====="
echo "Completed at $(date)"

# Return overall status
if [ "$E2E_STATUS" == "PASSED" ]; then
  echo "✅ All end-to-end tests PASSED"
  exit 0
else
  echo "❌ Some end-to-end tests FAILED - See $TEST_DIR/e2e_test_report.md for details"
  exit 1
fi
