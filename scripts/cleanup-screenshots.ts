#!/usr/bin/env node
/**
 * Cleanup Script for Synthetic Monitoring Screenshots
 *
 * This script deletes screenshots older than the retention period.
 */

import fs from "fs"
import path from "path"
import config from "../config/synthetic-monitoring.config"

async function cleanupScreenshots() {
  console.log(`Starting screenshot cleanup at ${new Date().toISOString()}`)

  const screenshotDir = config.screenshotDir
  if (!fs.existsSync(screenshotDir)) {
    console.log(`Screenshot directory does not exist: ${screenshotDir}`)
    return
  }

  const now = Date.now()
  const retentionMs = config.reporting.screenshotRetentionDays * 24 * 60 * 60 * 1000

  try {
    const files = fs.readdirSync(screenshotDir)
    console.log(`Found ${files.length} screenshots`)

    let deletedCount = 0
    let retainedCount = 0

    for (const file of files) {
      if (!file.endsWith(".png")) continue

      const filePath = path.join(screenshotDir, file)
      const stats = fs.statSync(filePath)

      if (now - stats.mtimeMs > retentionMs) {
        fs.unlinkSync(filePath)
        deletedCount++
      } else {
        retainedCount++
      }
    }

    console.log(`Cleanup complete: ${deletedCount} screenshots deleted, ${retainedCount} retained`)
  } catch (error) {
    console.error("Error cleaning up screenshots:", error)
  }
}

// Run if called directly
if (require.main === module) {
  cleanupScreenshots().catch((error) => {
    console.error("Fatal error in screenshot cleanup:", error)
    process.exit(1)
  })
}
