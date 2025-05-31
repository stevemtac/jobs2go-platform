#!/usr/bin/env node

import { validateEnv, logEnvironmentStatus } from "../lib/env-validator"

console.log("🔍 Environment Variables Check")
console.log("==============================")

// Log environment status
logEnvironmentStatus()

// Validate environment variables
const validation = validateEnv()

if (validation.success) {
  console.log("\n✅ All environment variables are valid!")
  process.exit(0)
} else {
  console.log("\n❌ Environment validation failed:")
  validation.errors?.forEach((error) => console.log(`  - ${error}`))

  console.log("\n📋 Troubleshooting steps:")
  console.log("1. Check your .env file exists and has correct values")
  console.log("2. Verify environment variables in Vercel dashboard")
  console.log("3. Ensure NEXT_PUBLIC_ prefix for client-side variables")
  console.log("4. Restart your development server after changes")
  console.log("5. Redeploy to Vercel after updating environment variables")

  process.exit(1)
}
