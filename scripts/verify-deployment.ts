#!/usr/bin/env node
/**
 * Deployment verification script
 *
 * This script verifies that all required exports are available
 * and that the application can be deployed successfully.
 */

import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Define the modules to check
const modulesToVerify = [
  {
    path: "lib/error-monitoring/source-map-notifications.ts",
    exports: ["notifySourceMapOperation"],
  },
  {
    path: "components/error-monitoring/cleanup-schedule-list.tsx",
    exports: ["CleanupScheduleList"],
  },
  {
    path: "lib/prisma.ts",
    exports: ["prisma"],
  },
  {
    path: "app/api/auth/[...nextauth]/route.ts",
    exports: ["authOptions"],
  },
  {
    path: "lib/auth/permissions.ts",
    exports: ["hasPermission"],
  },
]

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

console.log(`${colors.cyan}Starting deployment verification...${colors.reset}\n`)

let allPassed = true
const errors = []

// Check if files exist and contain required exports
for (const module of modulesToVerify) {
  const filePath = path.resolve(process.cwd(), module.path)

  console.log(`${colors.blue}Checking ${module.path}...${colors.reset}`)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.red}❌ File does not exist: ${module.path}${colors.reset}`)
    allPassed = false
    errors.push(`File does not exist: ${module.path}`)
    continue
  }

  // Read file content
  const content = fs.readFileSync(filePath, "utf8")

  // Check for exports
  for (const exportName of module.exports) {
    // Simple regex check for exports
    const exportRegex = new RegExp(
      `export\\s+(const|function|class|type|interface)\\s+${exportName}\\b|export\\s+\\{[^}]*\\b${exportName}\\b[^}]*\\}`,
    )

    if (!exportRegex.test(content)) {
      console.log(`${colors.red}❌ Export not found: ${exportName} in ${module.path}${colors.reset}`)
      allPassed = false
      errors.push(`Export not found: ${exportName} in ${module.path}`)
    } else {
      console.log(`${colors.green}✓ Export found: ${exportName}${colors.reset}`)
    }
  }

  console.log("")
}

// Verify TypeScript compilation
console.log(`${colors.blue}Verifying TypeScript compilation...${colors.reset}`)
try {
  execSync("npx tsc --noEmit", { stdio: "pipe" })
  console.log(`${colors.green}✓ TypeScript compilation successful${colors.reset}\n`)
} catch (error) {
  console.log(`${colors.red}❌ TypeScript compilation failed${colors.reset}`)
  console.log(error.stdout.toString())
  allPassed = false
  errors.push("TypeScript compilation failed")
  console.log("")
}

// Verify Next.js build
console.log(`${colors.blue}Verifying Next.js build...${colors.reset}`)
try {
  // Use --no-lint to skip linting as we're just checking for build errors
  execSync("npx next build --no-lint", { stdio: "pipe" })
  console.log(`${colors.green}✓ Next.js build successful${colors.reset}\n`)
} catch (error) {
  console.log(`${colors.red}❌ Next.js build failed${colors.reset}`)
  console.log(error.stdout.toString())
  allPassed = false
  errors.push("Next.js build failed")
  console.log("")
}

// Summary
if (allPassed) {
  console.log(`${colors.green}✅ All checks passed! The application should deploy successfully.${colors.reset}`)
} else {
  console.log(`${colors.red}❌ Some checks failed. Please fix the following issues:${colors.reset}`)
  errors.forEach((error, index) => {
    console.log(`${colors.red}${index + 1}. ${error}${colors.reset}`)
  })
}

process.exit(allPassed ? 0 : 1)
