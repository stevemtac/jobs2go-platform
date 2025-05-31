#!/usr/bin/env node

/**
 * Secure Deployment Check Script
 * Validates that no sensitive environment variables are exposed in client files
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

const SENSITIVE_ENV_VARS = [
  "STACK_SECRET_SERVER_KEY",
  "NEXTAUTH_SECRET",
  "DATABASE_URL",
  "POSTGRES_PASSWORD",
  "RESEND_API_KEY",
  "EMAIL_PASSWORD",
  "GOOGLE_CLIENT_SECRET",
  "FACEBOOK_CLIENT_SECRET",
]

const CLIENT_FILE_EXTENSIONS = [".md", ".tsx", ".jsx", ".js", ".ts"]
const EXCLUDE_DIRS = ["node_modules", ".next", ".git", "dist", "build"]

function scanDirectory(dir: string): string[] {
  const issues: string[] = []

  try {
    const items = readdirSync(dir)

    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory() && !EXCLUDE_DIRS.includes(item)) {
        issues.push(...scanDirectory(fullPath))
      } else if (stat.isFile() && CLIENT_FILE_EXTENSIONS.some((ext) => item.endsWith(ext))) {
        const content = readFileSync(fullPath, "utf-8")

        for (const envVar of SENSITIVE_ENV_VARS) {
          if (content.includes(envVar)) {
            issues.push(`❌ Sensitive variable ${envVar} found in: ${fullPath}`)
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dir}:`, error)
  }

  return issues
}

function main() {
  console.log("🔍 Scanning for sensitive environment variables in client files...\n")

  const issues = scanDirectory(process.cwd())

  if (issues.length === 0) {
    console.log("✅ No sensitive environment variables found in client files!")
    console.log("🚀 Deployment security check passed!\n")
    process.exit(0)
  } else {
    console.log("❌ Security issues found:\n")
    issues.forEach((issue) => console.log(issue))
    console.log("\n🛡️ Please remove sensitive environment variables from client-accessible files.")
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { scanDirectory, SENSITIVE_ENV_VARS }
