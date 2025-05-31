#!/bin/bash

# This script runs synthetic monitoring tests and can be used in a cron job

# Change to the project directory
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Run the synthetic monitoring
echo "Starting synthetic monitoring at $(date)"
npx ts-node scripts/synthetic-monitoring.ts

# Exit with the same status as the tests
exit $?
