#!/usr/bin/env node
/**
 * Enhanced deployment verification script
 *
 * This script performs a comprehensive check of all required exports
 * and provides detailed feedback on any issues found.
 */

import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

// Define the modules to check
const modulesToVerify = [
  {
    path: "lib/error-monitoring/source-map-notifications.ts",
    exports: ["notifySourceMapOperation"],
    description: "Source map notification utility",
  },
  {
    path: "components/error-monitoring/cleanup-schedule-list.tsx",
    exports: ["CleanupScheduleList"],
    description: "Cleanup schedule list component",
  },
  {
    path: "lib/prisma.ts",
    exports: ["prisma"],
    description: "Prisma client instance",
  },
  {
    path: "app/api/auth/[...nextauth]/route.ts",
    exports: ["authOptions"],
    description: "NextAuth configuration options",
  },
  {
    path: "lib/auth/permissions.ts",
    exports: ["hasPermission"],
    description: "Permission checking utility",
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
  bold: "\x1b[1m",
}

// Symbols
const symbols = {
  success: "✓",
  error: "✗",
  warning: "⚠",
  info: "ℹ",
}

// Print a header
console.log(`\n${colors.bold}${colors.blue}======================================${colors.reset}`)
console.log(`${colors.bold}${colors.blue}  DEPLOYMENT VERIFICATION SCRIPT${colors.reset}`)
console.log(`${colors.bold}${colors.blue}======================================${colors.reset}\n`)

console.log(`${colors.cyan}Starting verification at: ${new Date().toLocaleString()}${colors.reset}\n`)

// Track overall status
let allPassed = true
const errors = []
const warnings = []

// Function to check if a file exists
function checkFileExists(filePath) {
  const fullPath = path.resolve(rootDir, filePath)
  return fs.existsSync(fullPath)
}

// Function to check if a file contains an export
function checkExport(filePath, exportName) {
  const fullPath = path.resolve(rootDir, filePath)
  const content = fs.readFileSync(fullPath, "utf8")

  // Check for different export patterns
  const exportPatterns = [
    // export const/function/class exportName
    new RegExp(`export\\s+(const|function|class|type|interface)\\s+${exportName}\\b`),
    // export { exportName }
    new RegExp(`export\\s+\\{[^}]*\\b${exportName}\\b[^}]*\\}`),
    // export default exportName
    new RegExp(`export\\s+default\\s+${exportName}\\b`),
    // const/function/class exportName ... export default exportName
    new RegExp(`(const|function|class)\\s+${exportName}\\b[\\s\\S]*export\\s+default\\s+${exportName}\\b`),
    // export default function/class exportName
    new RegExp(`export\\s+default\\s+(function|class)\\s+${exportName}\\b`),
  ]

  return exportPatterns.some((pattern) => pattern.test(content))
}

// Check each module
console.log(`${colors.bold}CHECKING REQUIRED MODULES:${colors.reset}\n`)

for (const module of modulesToVerify) {
  console.log(`${colors.bold}${module.description} (${module.path})${colors.reset}`)

  // Check if file exists
  const fileExists = checkFileExists(module.path)
  if (!fileExists) {
    console.log(`  ${colors.red}${symbols.error} File does not exist${colors.reset}`)
    allPassed = false
    errors.push(`File does not exist: ${module.path}`)
    console.log()
    continue
  }

  console.log(`  ${colors.green}${symbols.success} File exists${colors.reset}`)

  // Check each export
  let allExportsFound = true
  for (const exportName of module.exports) {
    const exportExists = checkExport(module.path, exportName)
    if (!exportExists) {
      console.log(`  ${colors.red}${symbols.error} Export not found: ${exportName}${colors.reset}`)
      allPassed = false
      allExportsFound = false
      errors.push(`Export not found: ${exportName} in ${module.path}`)
    } else {
      console.log(`  ${colors.green}${symbols.success} Export found: ${exportName}${colors.reset}`)
    }
  }

  if (allExportsFound) {
    console.log(`  ${colors.green}${symbols.success} All required exports found${colors.reset}`)
  }

  console.log()
}

// Check TypeScript compilation
console.log(`${colors.bold}CHECKING TYPESCRIPT COMPILATION:${colors.reset}\n`)

try {
  console.log(`${colors.yellow}Running TypeScript compiler...${colors.reset}`)
  execSync("npx tsc --noEmit", { stdio: "pipe" })
  console.log(`${colors.green}${symbols.success} TypeScript compilation successful${colors.reset}\n`)
} catch (error) {
  console.log(`${colors.red}${symbols.error} TypeScript compilation failed${colors.reset}`)
  console.log(`${colors.red}${error.stdout.toString()}${colors.reset}`)
  allPassed = false
  errors.push("TypeScript compilation failed")
  console.log()
}

// Check Next.js build (optional - can be commented out to speed up verification)
console.log(`${colors.bold}CHECKING NEXT.JS BUILD:${colors.reset}\n`)

try {
  console.log(`${colors.yellow}This step is optional and can take some time.${colors.reset}`)
  console.log(`${colors.yellow}Press Ctrl+C to skip if needed.${colors.reset}`)
  console.log(`${colors.yellow}Running Next.js build check...${colors.reset}`)

  // Use --no-lint to skip linting as we're just checking for build errors
  execSync("npx next build --no-lint", { stdio: "pipe" })
  console.log(`${colors.green}${symbols.success} Next.js build successful${colors.reset}\n`)
} catch (error) {
  console.log(`${colors.red}${symbols.error} Next.js build failed${colors.reset}`)
  console.log(`${colors.red}${error.stdout.toString()}${colors.reset}`)
  allPassed = false
  errors.push("Next.js build failed")
  console.log()
}

// Summary
console.log(`${colors.bold}${colors.blue}======================================${colors.reset}`)
console.log(`${colors.bold}${colors.blue}  VERIFICATION SUMMARY${colors.reset}`)
console.log(`${colors.bold}${colors.blue}======================================${colors.reset}\n`)

if (allPassed) {
  console.log(`${colors.green}${symbols.success} ${colors.bold}All checks passed!${colors.reset}`)
  console.log(`${colors.green}The application should deploy successfully.${colors.reset}`)
} else {
  console.log(`${colors.red}${symbols.error} ${colors.bold}Some checks failed.${colors.reset}`)
  console.log(`${colors.red}Please fix the following issues:${colors.reset}\n`)

  errors.forEach((error, index) => {
    console.log(`${colors.red}${index + 1}. ${error}${colors.reset}`)
  })

  if (warnings.length > 0) {
    console.log(`\n${colors.yellow}${symbols.warning} ${colors.bold}Warnings:${colors.reset}\n`)
    warnings.forEach((warning, index) => {
      console.log(`${colors.yellow}${index + 1}. ${warning}${colors.reset}`)
    })
  }
}

console.log(`\n${colors.cyan}Verification completed at: ${new Date().toLocaleString()}${colors.reset}\n`)

// Exit with appropriate code
process.exit(allPassed ? 0 : 1)
