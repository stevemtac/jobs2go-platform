#!/usr/bin/env node
/**
 * Scheduled Synthetic Monitoring Runner
 *
 * This script runs synthetic monitoring tests on a schedule.
 * It can be started as a long-running process or via cron.
 */

import { runSyntheticTests } from "./synthetic-monitoring"
import config from "../config/synthetic-monitoring.config"
import fs from "fs"
import path from "path"
import { monitoringService } from "../lib/monitoring/monitoring-service"

// Function to clean up old screenshots
async function cleanupOldScreenshots() {
  if (!config.reporting.retainScreenshots) {
    return
  }

  const screenshotDir = config.screenshotDir
  if (!fs.existsSync(screenshotDir)) {
    return
  }

  const now = Date.now()
  const retentionMs = config.reporting.screenshotRetentionDays * 24 * 60 * 60 * 1000

  try {
    const files = fs.readdirSync(screenshotDir)

    for (const file of files) {
      const filePath = path.join(screenshotDir, file)
      const stats = fs.statSync(filePath)

      if (now - stats.mtimeMs > retentionMs) {
        fs.unlinkSync(filePath)
        console.log(`Deleted old screenshot: ${file}`)
      }
    }
  } catch (error) {
    console.error("Error cleaning up old screenshots:", error)
  }
}

// Function to run tests once
async function runTests() {
  console.log(`Running synthetic tests at ${new Date().toISOString()}`)

  try {
    await runSyntheticTests()
  } catch (error) {
    console.error("Error running synthetic tests:", error)

    monitoringService.trackEvent({
      category: "synthetic",
      severity: "error",
      message: "Scheduled synthetic tests runner encountered an error",
      details: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
    })
  }

  // Clean up old screenshots
  await cleanupOldScreenshots()
}

// Main function
async function main() {
  console.log(`Starting scheduled synthetic monitoring at ${new Date().toISOString()}`)
  console.log(`Base URL: ${config.baseUrl}`)
  console.log(`Schedule: ${config.schedule.enabled ? `Every ${config.schedule.intervalMinutes} minutes` : "Disabled"}`)

  // Run tests immediately
  await runTests()

  // Set up schedule if enabled
  if (config.schedule.enabled) {
    const intervalMs = config.schedule.intervalMinutes * 60 * 1000

    console.log(`Next run scheduled for: ${new Date(Date.now() + intervalMs).toISOString()}`)

    // Set up interval
    setInterval(async () => {
      await runTests()
      console.log(`Next run scheduled for: ${new Date(Date.now() + intervalMs).toISOString()}`)
    }, intervalMs)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error in scheduled synthetic monitoring:", error)
    process.exit(1)
  })
}
