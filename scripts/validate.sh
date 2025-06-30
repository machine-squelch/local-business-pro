#!/bin/bash
echo "===== LocalBrand Pro Validation Script ====="
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
TESTS_DIR="$PROJECT_ROOT/tests"
RESULTS_DIR="$TESTS_DIR/results"
mkdir -p "$RESULTS_DIR"

echo "Starting backend server for validation..."
cd "$BACKEND_DIR"
npm start > "$RESULTS_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 8

echo "Running validation test suite..."
cd "$TESTS_DIR"
./run-e2e-tests.sh

# Capture exit code
RESULT=$?

echo "Stopping backend server..."
kill $BACKEND_PID 2>/dev/null

if [ $RESULT -eq 0 ]; then
    echo "✅ Validation successful!"
else
    echo "❌ Validation FAILED. Check logs in $RESULTS_DIR"
fi
exit $RESULT
