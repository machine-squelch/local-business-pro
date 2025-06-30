#!/bin/bash

# LocalBrand Pro - End-to-End Test Runner
# This script runs comprehensive end-to-end tests for the LocalBrand Pro application

echo "===== LocalBrand Pro End-to-End Test Runner ====="
echo "Starting tests at $(date)"
echo

# Configuration
TEST_DIR="$(pwd)/test_results"
mkdir -p $TEST_DIR
REPORT_FILE="$TEST_DIR/test_report.md"

# Initialize report
cat > $REPORT_FILE << EOL
# LocalBrand Pro Test Report
Generated: $(date)

## Test Results Summary

| Test Category | Status | Details |
|---------------|--------|---------|
EOL

# Run validation tests
echo "===== Running Validation Tests ====="
./scripts/validate.sh
VALIDATION_STATUS=$?

if [ $VALIDATION_STATUS -eq 0 ]; then
  echo "✅ Validation tests PASSED"
  echo "| Validation Tests | ✅ PASSED | [View Details](validation_results/validation_report.md) |" >> $REPORT_FILE
else
  echo "❌ Validation tests FAILED"
  echo "| Validation Tests | ❌ FAILED | [View Details](validation_results/validation_report.md) |" >> $REPORT_FILE
fi

# Run end-to-end tests
echo
echo "===== Running End-to-End Tests ====="
./scripts/run-e2e-tests.sh
E2E_STATUS=$?

if [ $E2E_STATUS -eq 0 ]; then
  echo "✅ End-to-end tests PASSED"
  echo "| End-to-End Tests | ✅ PASSED | [View Details](e2e_test_results/e2e_test_report.md) |" >> $REPORT_FILE
else
  echo "❌ End-to-end tests FAILED"
  echo "| End-to-End Tests | ❌ FAILED | [View Details](e2e_test_results/e2e_test_report.md) |" >> $REPORT_FILE
fi

# Test deployment script
echo
echo "===== Testing Deployment Script ====="
# Create a temporary directory for deployment testing
TEMP_DEPLOY_DIR="$TEST_DIR/deploy_test"
mkdir -p $TEMP_DEPLOY_DIR

# Copy necessary files to test directory
cp -r backend frontend scripts $TEMP_DEPLOY_DIR/

# Run deployment script in test mode
cd $TEMP_DEPLOY_DIR
DEPLOY_TEST_MODE=true ./scripts/deploy.sh > "$TEST_DIR/deployment_test.log" 2>&1
DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -eq 0 ]; then
  echo "✅ Deployment script test PASSED"
  echo "| Deployment Script | ✅ PASSED | [View Log](deployment_test.log) |" >> $REPORT_FILE
else
  echo "❌ Deployment script test FAILED"
  echo "| Deployment Script | ❌ FAILED | [View Log](deployment_test.log) |" >> $REPORT_FILE
fi

cd -

# Test Adobe Express SDK integration
echo
echo "===== Testing Adobe Express SDK Integration ====="
cd frontend
npm run test:adobe-sdk > "$TEST_DIR/adobe_sdk_test.log" 2>&1
ADOBE_STATUS=$?

if [ $ADOBE_STATUS -eq 0 ]; then
  echo "✅ Adobe Express SDK integration test PASSED"
  echo "| Adobe Express SDK | ✅ PASSED | [View Log](adobe_sdk_test.log) |" >> $REPORT_FILE
else
  echo "❌ Adobe Express SDK integration test FAILED"
  echo "| Adobe Express SDK | ❌ FAILED | [View Log](adobe_sdk_test.log) |" >> $REPORT_FILE
fi

cd -

# Test location intelligence integration
echo
echo "===== Testing Location Intelligence Integration ====="
cd backend
npm run test:location-intelligence > "$TEST_DIR/location_intelligence_test.log" 2>&1
LOCATION_STATUS=$?

if [ $LOCATION_STATUS -eq 0 ]; then
  echo "✅ Location intelligence integration test PASSED"
  echo "| Location Intelligence | ✅ PASSED | [View Log](location_intelligence_test.log) |" >> $REPORT_FILE
else
  echo "❌ Location intelligence integration test FAILED"
  echo "| Location Intelligence | ❌ FAILED | [View Log](location_intelligence_test.log) |" >> $REPORT_FILE
fi

cd -

# Test review integration
echo
echo "===== Testing Review Integration ====="
cd backend
npm run test:review-integration > "$TEST_DIR/review_integration_test.log" 2>&1
REVIEW_STATUS=$?

if [ $REVIEW_STATUS -eq 0 ]; then
  echo "✅ Review integration test PASSED"
  echo "| Review Integration | ✅ PASSED | [View Log](review_integration_test.log) |" >> $REPORT_FILE
else
  echo "❌ Review integration test FAILED"
  echo "| Review Integration | ❌ FAILED | [View Log](review_integration_test.log) |" >> $REPORT_FILE
fi

cd -

# Test seasonal automation
echo
echo "===== Testing Seasonal Automation ====="
cd backend
npm run test:seasonal-automation > "$TEST_DIR/seasonal_automation_test.log" 2>&1
SEASONAL_STATUS=$?

if [ $SEASONAL_STATUS -eq 0 ]; then
  echo "✅ Seasonal automation test PASSED"
  echo "| Seasonal Automation | ✅ PASSED | [View Log](seasonal_automation_test.log) |" >> $REPORT_FILE
else
  echo "❌ Seasonal automation test FAILED"
  echo "| Seasonal Automation | ❌ FAILED | [View Log](seasonal_automation_test.log) |" >> $REPORT_FILE
fi

cd -

# Complete the report
cat >> $REPORT_FILE << EOL

## Test Details

### Validation Tests
- Interoperability validation across all components
- Scalability testing under various load conditions
- API integration testing
- Adobe Express SDK integration validation

### End-to-End Tests
- User authentication flow
- Business and location management
- Template gallery and selection
- Design editor functionality
- Location intelligence integration
- Review integration
- Seasonal automation
- Design export and sharing

### Deployment Testing
- Environment setup
- Dependency installation
- Database initialization
- Frontend build process
- Server startup
- Native application packaging

## Overall Assessment
EOL

# Calculate overall status
TOTAL_TESTS=6
PASSED_TESTS=0

[ $VALIDATION_STATUS -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS+1))
[ $E2E_STATUS -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS+1))
[ $DEPLOY_STATUS -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS+1))
[ $ADOBE_STATUS -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS+1))
[ $LOCATION_STATUS -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS+1))
[ $REVIEW_STATUS -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS+1))
[ $SEASONAL_STATUS -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS+1))

PASS_PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

if [ $PASS_PERCENTAGE -eq 100 ]; then
  echo "All tests have passed successfully. The LocalBrand Pro application is ready for deployment." >> $REPORT_FILE
  OVERALL_STATUS="PASSED"
elif [ $PASS_PERCENTAGE -ge 80 ]; then
  echo "Most tests have passed, but there are some issues that should be addressed before deployment." >> $REPORT_FILE
  OVERALL_STATUS="PARTIAL"
else
  echo "Several tests have failed. The application requires significant fixes before it can be deployed." >> $REPORT_FILE
  OVERALL_STATUS="FAILED"
fi

echo
echo "===== Test Summary ====="
echo "Tests completed at $(date)"
echo "Passed $PASSED_TESTS out of $TOTAL_TESTS tests ($PASS_PERCENTAGE%)"
echo "Overall status: $OVERALL_STATUS"
echo "Test report: $REPORT_FILE"

# Return overall status
if [ "$OVERALL_STATUS" == "PASSED" ]; then
  echo "✅ All tests PASSED"
  exit 0
else
  echo "❌ Some tests FAILED - See $REPORT_FILE for details"
  exit 1
fi
