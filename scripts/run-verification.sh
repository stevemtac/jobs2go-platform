#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment verification process...${NC}\n"

# Step 1: Check if all required files exist
echo -e "${YELLOW}Step 1: Checking if all required files exist...${NC}"

FILES_TO_CHECK=(
  "lib/error-monitoring/source-map-notifications.ts"
  "components/error-monitoring/cleanup-schedule-list.tsx"
  "lib/prisma.ts"
  "app/api/auth/[...nextauth]/route.ts"
  "lib/auth/permissions.ts"
  "lib/auth.ts"
)

ALL_FILES_EXIST=true

for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo -e "✅ $file exists"
  else
    echo -e "${RED}❌ $file does not exist${NC}"
    ALL_FILES_EXIST=false
  fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
  echo -e "\n${RED}Some required files are missing. Please create them before proceeding.${NC}"
  exit 1
fi

echo -e "${GREEN}All required files exist.${NC}\n"

# Step 2: Run TypeScript verification
echo -e "${YELLOW}Step 2: Running TypeScript verification...${NC}"

if command -v npx &> /dev/null; then
  npx tsc --noEmit
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}TypeScript verification passed.${NC}\n"
  else
    echo -e "${RED}TypeScript verification failed. Please fix the type errors.${NC}\n"
    exit 1
  fi
else
  echo -e "${RED}npx command not found. Please install Node.js and npm.${NC}\n"
  exit 1
fi

# Step 3: Run the verification script
echo -e "${YELLOW}Step 3: Running verification script...${NC}"

if [ -f "scripts/verify-deployment.ts" ]; then
  npx ts-node scripts/verify-deployment.ts
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Verification script passed.${NC}\n"
  else
    echo -e "${RED}Verification script failed. Please check the errors above.${NC}\n"
    exit 1
  fi
else
  echo -e "${RED}Verification script not found. Please create it first.${NC}\n"
  exit 1
fi

# Step 4: Run a build test
echo -e "${YELLOW}Step 4: Running build test...${NC}"

npx next build --no-lint
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Build test passed.${NC}\n"
else
  echo -e "${RED}Build test failed. Please check the errors above.${NC}\n"
  exit 1
fi

# Final summary
echo -e "${GREEN}✅ All verification steps passed!${NC}"
echo -e "${GREEN}The application should deploy successfully.${NC}"
echo -e "\nAfter deployment, visit /admin/deployment-verification to verify the deployment."

exit 0
