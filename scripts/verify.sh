#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}Running deployment verification...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}${BOLD}Error: Node.js is not installed.${NC}"
    echo -e "${RED}Please install Node.js before running this script.${NC}"
    exit 1
fi

# Check if the verification script exists
if [ ! -f "scripts/run-verification.ts" ]; then
    echo -e "${RED}${BOLD}Error: Verification script not found.${NC}"
    echo -e "${RED}Please ensure scripts/run-verification.ts exists.${NC}"
    exit 1
fi

# Run the verification script
echo -e "${YELLOW}Executing verification script...${NC}"
npx ts-node scripts/run-verification.ts

# Check the exit code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}${BOLD}Verification completed successfully!${NC}"
    echo -e "${GREEN}You can now proceed with deployment.${NC}"
else
    echo -e "${RED}${BOLD}Verification failed.${NC}"
    echo -e "${RED}Please fix the issues before deploying.${NC}"
fi
