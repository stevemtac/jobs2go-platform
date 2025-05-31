#!/usr/bin/env node

/**
 * Deployment Security Validator
 * Ensures no sensitive environment variables are exposed in client files
 * This script runs during CI/CD to prevent security issues
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

// Only include truly sensitive server-side variables
const SENSITIVE_SERVER_VARS = [
  "STACK_SECRET_SERVER_KEY",
  "NEXTAUTH_SECRET",
  "DATABASE_URL",
  "POSTGRES_PASSWORD",
  "RESEND_API_KEY",
  "EMAIL_PASSWORD",
  "GOOGLE_CLIENT_SECRET",
  "FACEBOOK_CLIENT_SECRET",
  "TWILIO_AUTH_TOKEN",
  "SLACK_WEBHOOK_URL",
  "EMAIL_SERVER_PASSWORD",
]

const CLIENT_FILE_EXTENSIONS = [".md", ".tsx", ".jsx", ".js", ".ts"]
const EXCLUDE_DIRS = ["node_modules", ".next", ".git", "dist", "build", ".vercel"]

function scanForSensitiveVars(dir: string): string[] {
  const issues: string[] = []

  try {
    const items = readdirSync(dir)

    for (const item of items) {
      const fullPath = join(dir, item)

      // Skip if we can't access the file/directory
      let stat
      try {
        stat = statSync(fullPath)
      } catch {
        continue
      }

      if (stat.isDirectory() && !EXCLUDE_DIRS.includes(item)) {
        issues.push(...scanForSensitiveVars(fullPath))
      } else if (stat.isFile() && CLIENT_FILE_EXTENSIONS.some((ext) => item.endsWith(ext))) {
        try {
          const content = readFileSync(fullPath, "utf-8")

          for (const envVar of SENSITIVE_SERVER_VARS) {
            if (content.includes(envVar)) {
              issues.push(`❌ Sensitive variable ${envVar} found in: ${fullPath}`)
            }
          }
        } catch {
          // Skip files we can't read
          continue
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dir}`)
  }

  return issues
}

function validateDeploymentSecurity() {
  console.log("🔍 Validating deployment security...\n")

  const issues = scanForSensitiveVars(process.cwd())

  if (issues.length === 0) {
    console.log("✅ Security validation passed!")
    console.log("🚀 No sensitive environment variables found in client files.\n")
    return true
  } else {
    console.log("❌ Security issues detected:\n")
    issues.forEach((issue) => console.log(issue))
    console.log("\n🛡️ Please remove sensitive environment variables from client-accessible files.")
    return false
  }
}

if (require.main === module) {
  const isSecure = validateDeploymentSecurity()
  process.exit(isSecure ? 0 : 1)
}

export { validateDeploymentSecurity, SENSITIVE_SERVER_VARS }
