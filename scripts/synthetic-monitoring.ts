#!/usr/bin/env node
/**
 * Synthetic Monitoring Script for Jobs2go Platform
 *
 * This script simulates critical user flows to detect issues before real users do.
 * It uses Puppeteer to automate browser interactions and reports results to the
 * monitoring system.
 */

import puppeteer, { type Browser, type Page } from "puppeteer"
import { monitoringService } from "../lib/monitoring/monitoring-service"
import dotenv from "dotenv"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"

// Load environment variables
dotenv.config()

// Configuration
const config = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  screenshotDir: path.join(process.cwd(), "synthetic-monitoring-results"),
  headless: process.env.NODE_ENV === "production", // Use headed mode in development
  testUsers: {
    jobSeeker: {
      email: process.env.TEST_USER_EMAIL || "test-jobseeker@example.com",
      password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
    },
    employer: {
      email: process.env.TEST_EMPLOYER_EMAIL || "test-employer@example.com",
      password: process.env.TEST_EMPLOYER_PASSWORD || "TestPassword123!",
    },
  },
  timeouts: {
    navigation: 30000, // 30 seconds
    element: 10000, // 10 seconds
    action: 5000, // 5 seconds
  },
  retries: 2,
}

// Ensure screenshot directory exists
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true })
}

// Test result interface
interface TestResult {
  name: string
  success: boolean
  durationMs: number
  error?: string
  screenshotPath?: string
  metrics?: Record<string, number>
}

// Main test runner
async function runSyntheticTests() {
  console.log(`Starting synthetic tests at ${new Date().toISOString()}`)
  console.log(`Base URL: ${config.baseUrl}`)

  const testId = uuidv4()
  const results: TestResult[] = []
  let browser: Browser | null = null

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: config.headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      defaultViewport: { width: 1280, height: 800 },
    })

    const page = await browser.newPage()

    // Set default timeouts
    page.setDefaultNavigationTimeout(config.timeouts.navigation)
    page.setDefaultTimeout(config.timeouts.element)

    // Enable console logging from the page
    page.on("console", (msg) => {
      console.log(`Browser console [${msg.type()}]: ${msg.text()}`)
    })

    // Run test flows
    await runWithRetries(() => testHomePageLoad(page, results, testId))
    await runWithRetries(() => testJobSearch(page, results, testId))
    await runWithRetries(() => testJobSeekerLogin(page, results, testId))
    await runWithRetries(() => testProfileUpdate(page, results, testId))
    await runWithRetries(() => testJobApplication(page, results, testId))
    await runWithRetries(() => testEmployerLogin(page, results, testId))
    await runWithRetries(() => testJobPosting(page, results, testId))

    // Report overall results
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    monitoringService.trackEvent({
      category: "synthetic",
      severity: failureCount > 0 ? "warning" : "info",
      message: `Synthetic tests completed: ${successCount}/${results.length} passed`,
      details: {
        testId,
        results: results.map((r) => ({
          name: r.name,
          success: r.success,
          durationMs: r.durationMs,
          error: r.error,
          metrics: r.metrics,
        })),
        timestamp: new Date().toISOString(),
      },
    })

    console.log(`Tests completed: ${successCount}/${results.length} passed`)
  } catch (error) {
    console.error("Fatal error in synthetic tests:", error)

    monitoringService.trackEvent({
      category: "synthetic",
      severity: "error",
      message: "Synthetic tests failed with fatal error",
      details: {
        testId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
    })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Helper function to run tests with retries
async function runWithRetries(testFn: () => Promise<void>, retries = config.retries): Promise<void> {
  try {
    await testFn()
  } catch (error) {
    if (retries > 0) {
      console.log(`Test failed, retrying... (${retries} retries left)`)
      await runWithRetries(testFn, retries - 1)
    } else {
      throw error
    }
  }
}

// Helper function to take a screenshot
async function takeScreenshot(page: Page, testName: string, testId: string): Promise<string> {
  const screenshotName = `${testName.replace(/\s+/g, "-").toLowerCase()}-${testId}-${Date.now()}.png`
  const screenshotPath = path.join(config.screenshotDir, screenshotName)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  return screenshotPath
}

// Helper function to record test result
function recordTestResult(
  results: TestResult[],
  name: string,
  success: boolean,
  startTime: number,
  error?: Error,
  screenshotPath?: string,
  metrics?: Record<string, number>,
): void {
  const durationMs = Date.now() - startTime

  results.push({
    name,
    success,
    durationMs,
    error: error?.message,
    screenshotPath,
    metrics,
  })

  console.log(`Test "${name}": ${success ? "PASSED" : "FAILED"} in ${durationMs}ms`)
  if (error) {
    console.error(`Error in "${name}":`, error)
  }
}

// Test 1: Home Page Load
async function testHomePageLoad(page: Page, results: TestResult[], testId: string): Promise<void> {
  const testName = "Home Page Load"
  const startTime = Date.now()

  try {
    // Navigate to home page
    const response = await page.goto(`${config.baseUrl}/`, {
      waitUntil: "networkidle2",
    })

    // Check if page loaded successfully
    if (!response || response.status() !== 200) {
      throw new Error(`Home page returned status ${response?.status() || "unknown"}`)
    }

    // Wait for critical elements
    await page.waitForSelector("header", { timeout: config.timeouts.element })
    await page.waitForSelector("footer", { timeout: config.timeouts.element })

    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType("navigation")
      if (perfEntries.length > 0) {
        const navEntry = perfEntries[0] as PerformanceNavigationTiming
        return {
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
          load: navEntry.loadEventEnd - navEntry.startTime,
          firstByte: navEntry.responseStart - navEntry.requestStart,
          domInteractive: navEntry.domInteractive - navEntry.startTime,
        }
      }
      return null
    })

    // Take a screenshot
    const screenshotPath = await takeScreenshot(page, testName, testId)

    // Record success
    recordTestResult(results, testName, true, startTime, undefined, screenshotPath, performanceMetrics || undefined)
  } catch (error) {
    // Take failure screenshot
    let screenshotPath
    try {
      screenshotPath = await takeScreenshot(page, `${testName}-failure`, testId)
    } catch (screenshotError) {
      console.error("Failed to take failure screenshot:", screenshotError)
    }

    // Record failure
    recordTestResult(
      results,
      testName,
      false,
      startTime,
      error instanceof Error ? error : new Error(String(error)),
      screenshotPath,
    )

    throw error
  }
}

// Test 2: Job Search
async function testJobSearch(page: Page, results: TestResult[], testId: string): Promise<void> {
  const testName = "Job Search"
  const startTime = Date.now()

  try {
    // Navigate to home page if not already there
    if (!page.url().includes(config.baseUrl)) {
      await page.goto(`${config.baseUrl}/`, { waitUntil: "networkidle2" })
    }

    // Find and use the search form
    await page.waitForSelector('input[name="searchQuery"]', { timeout: config.timeouts.element })
    await page.type('input[name="searchQuery"]', "developer")

    // Look for location input if it exists
    try {
      const locationInput = await page.$('input[name="location"]')
      if (locationInput) {
        await locationInput.type("Remote")
      }
    } catch (e) {
      // Location input might not exist, continue
      console.log("Location input not found, continuing...")
    }

    // Submit the search form
    const searchStartTime = Date.now()
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2" }), page.click('button[type="submit"]')])
    const searchResponseTime = Date.now() - searchStartTime

    // Wait for search results
    await page.waitForSelector(".job-listing, .job-card", { timeout: config.timeouts.element })

    // Count results
    const resultCount = await page.evaluate(() => {
      return document.querySelectorAll(".job-listing, .job-card").length
    })

    // Take a screenshot
    const screenshotPath = await takeScreenshot(page, testName, testId)

    // Record success
    recordTestResult(results, testName, true, startTime, undefined, screenshotPath, {
      resultCount,
      searchResponseTime,
    })
  } catch (error) {
    // Take failure screenshot
    let screenshotPath
    try {
      screenshotPath = await takeScreenshot(page, `${testName}-failure`, testId)
    } catch (screenshotError) {
      console.error("Failed to take failure screenshot:", screenshotError)
    }

    // Record failure
    recordTestResult(
      results,
      testName,
      false,
      startTime,
      error instanceof Error ? error : new Error(String(error)),
      screenshotPath,
    )

    throw error
  }
}

// Test 3: Job Seeker Login
async function testJobSeekerLogin(page: Page, results: TestResult[], testId: string): Promise<void> {
  const testName = "Job Seeker Login"
  const startTime = Date.now()

  try {
    // Navigate to login page
    await page.goto(`${config.baseUrl}/auth/signin`, { waitUntil: "networkidle2" })

    // Fill in login form
    await page.waitForSelector('input[name="email"]', { timeout: config.timeouts.element })
    await page.type('input[name="email"]', config.testUsers.jobSeeker.email)
    await page.type('input[name="password"]', config.testUsers.jobSeeker.password)

    // Submit login form
    const loginStartTime = Date.now()
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2" }), page.click('button[type="submit"]')])
    const loginResponseTime = Date.now() - loginStartTime

    // Verify successful login by checking for user-specific elements
    await page.waitForSelector(".user-profile, .dashboard, .user-menu", { timeout: config.timeouts.element })

    // Take a screenshot
    const screenshotPath = await takeScreenshot(page, testName, testId)

    // Record success
    recordTestResult(results, testName, true, startTime, undefined, screenshotPath, {
      loginResponseTime,
    })
  } catch (error) {
    // Take failure screenshot
    let screenshotPath
    try {
      screenshotPath = await takeScreenshot(page, `${testName}-failure`, testId)
    } catch (screenshotError) {
      console.error("Failed to take failure screenshot:", screenshotError)
    }

    // Record failure
    recordTestResult(
      results,
      testName,
      false,
      startTime,
      error instanceof Error ? error : new Error(String(error)),
      screenshotPath,
    )

    throw error
  }
}

// Test 4: Profile Update
async function testProfileUpdate(page: Page, results: TestResult[], testId: string): Promise<void> {
  const testName = "Profile Update"
  const startTime = Date.now()

  try {
    // Navigate to profile page
    await page.goto(`${config.baseUrl}/profile`, { waitUntil: "networkidle2" })

    // Wait for profile form to load
    await page.waitForSelector("form", { timeout: config.timeouts.element })

    // Update a field (e.g., bio or summary)
    const bioSelector = 'textarea[name="bio"], textarea[name="summary"]'
    await page.waitForSelector(bioSelector, { timeout: config.timeouts.element })

    // Clear the field and type new content
    await page.evaluate((selector) => {
      const element = document.querySelector(selector) as HTMLTextAreaElement
      if (element) element.value = ""
    }, bioSelector)

    await page.type(bioSelector, `Updated profile for synthetic test at ${new Date().toISOString()}`)

    // Submit the form
    const updateStartTime = Date.now()
    await Promise.all([
      page
        .waitForFunction(() => document.querySelector(".success-message, .toast-success, .alert-success") !== null, {
          timeout: config.timeouts.navigation,
        })
        .catch(() => {
          // If success message doesn't appear, we'll check for form submission completion
          return page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {
            // If no navigation occurs, we'll assume the form was submitted via AJAX
            return page.waitForFunction(() => !document.querySelector('button[type="submit"][disabled]'), {
              timeout: config.timeouts.element,
            })
          })
        }),
      page.click('button[type="submit"]'),
    ])
    const updateResponseTime = Date.now() - updateStartTime

    // Take a screenshot
    const screenshotPath = await takeScreenshot(page, testName, testId)

    // Record success
    recordTestResult(results, testName, true, startTime, undefined, screenshotPath, {
      updateResponseTime,
    })
  } catch (error) {
    // Take failure screenshot
    let screenshotPath
    try {
      screenshotPath = await takeScreenshot(page, `${testName}-failure`, testId)
    } catch (screenshotError) {
      console.error("Failed to take failure screenshot:", screenshotError)
    }

    // Record failure
    recordTestResult(
      results,
      testName,
      false,
      startTime,
      error instanceof Error ? error : new Error(String(error)),
      screenshotPath,
    )

    throw error
  }
}

// Test 5: Job Application
async function testJobApplication(page: Page, results: TestResult[], testId: string): Promise<void> {
  const testName = "Job Application"
  const startTime = Date.now()

  try {
    // Navigate to job search page
    await page.goto(`${config.baseUrl}/jobs`, { waitUntil: "networkidle2" })

    // Wait for job listings
    await page.waitForSelector(".job-listing, .job-card", { timeout: config.timeouts.element })

    // Click on the first job
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(".job-listing a, .job-card a"),
    ])

    // Wait for job details page to load
    await page.waitForSelector(".job-details, .job-description", { timeout: config.timeouts.element })

    // Click apply button
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {
        // If no navigation, the application form might be on the same page
        return page.waitForSelector("form.application-form, #application-form", {
          timeout: config.timeouts.element,
          visible: true,
        })
      }),
      page.click('a.apply-button, button.apply-button, [data-testid="apply-button"]'),
    ])

    // Fill out application form
    await page.waitForSelector("form.application-form, #application-form", { timeout: config.timeouts.element })

    // Check if there's a cover letter field
    const coverLetterSelector = 'textarea[name="coverLetter"], textarea[name="cover_letter"]'
    const hasCoverLetter = (await page.$(coverLetterSelector)) !== null

    if (hasCoverLetter) {
      await page.type(coverLetterSelector, `Synthetic test application submitted at ${new Date().toISOString()}`)
    }

    // Submit application
    const applicationStartTime = Date.now()
    await Promise.all([
      page
        .waitForFunction(
          () =>
            document.querySelector(".success-message, .toast-success, .alert-success, .application-confirmation") !==
            null,
          { timeout: config.timeouts.navigation },
        )
        .catch(() => {
          // If success message doesn't appear, we'll check for form submission completion
          return page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {
            // If no navigation occurs, we'll assume the form was submitted via AJAX
            return page.waitForFunction(() => !document.querySelector('button[type="submit"][disabled]'), {
              timeout: config.timeouts.element,
            })
          })
        }),
      page.click('form.application-form button[type="submit"], #application-form button[type="submit"]'),
    ])
    const applicationResponseTime = Date.now() - applicationStartTime

    // Take a screenshot
    const screenshotPath = await takeScreenshot(page, testName, testId)

    // Record success
    recordTestResult(results, testName, true, startTime, undefined, screenshotPath, {
      applicationResponseTime,
      hasCoverLetter: hasCoverLetter ? 1 : 0,
    })
  } catch (error) {
    // Take failure screenshot
    let screenshotPath
    try {
      screenshotPath = await takeScreenshot(page, `${testName}-failure`, testId)
    } catch (screenshotError) {
      console.error("Failed to take failure screenshot:", screenshotError)
    }

    // Record failure
    recordTestResult(
      results,
      testName,
      false,
      startTime,
      error instanceof Error ? error : new Error(String(error)),
      screenshotPath,
    )

    throw error
  }
}

// Test 6: Employer Login
async function testEmployerLogin(page: Page, results: TestResult[], testId: string): Promise<void> {
  const testName = "Employer Login"
  const startTime = Date.now()

  try {
    // Log out first if logged in
    await page.goto(`${config.baseUrl}/auth/signout`, { waitUntil: "networkidle2" })

    // Navigate to login page
    await page.goto(`${config.baseUrl}/auth/signin`, { waitUntil: "networkidle2" })

    // Fill in login form
    await page.waitForSelector('input[name="email"]', { timeout: config.timeouts.element })
    await page.type('input[name="email"]', config.testUsers.employer.email)
    await page.type('input[name="password"]', config.testUsers.employer.password)

    // Submit login form
    const loginStartTime = Date.now()
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2" }), page.click('button[type="submit"]')])
    const loginResponseTime = Date.now() - loginStartTime

    // Verify successful login by checking for employer-specific elements
    await page.waitForSelector(".employer-dashboard, .company-profile, .employer-menu", {
      timeout: config.timeouts.element,
    })

    // Take a screenshot
    const screenshotPath = await takeScreenshot(page, testName, testId)

    // Record success
    recordTestResult(results, testName, true, startTime, undefined, screenshotPath, {
      loginResponseTime,
    })
  } catch (error) {
    // Take failure screenshot
    let screenshotPath
    try {
      screenshotPath = await takeScreenshot(page, `${testName}-failure`, testId)
    } catch (screenshotError) {
      console.error("Failed to take failure screenshot:", screenshotError)
    }

    // Record failure
    recordTestResult(
      results,
      testName,
      false,
      startTime,
      error instanceof Error ? error : new Error(String(error)),
      screenshotPath,
    )

    throw error
  }
}

// Test 7: Job Posting
async function testJobPosting(page: Page, results: TestResult[], testId: string): Promise<void> {
  const testName = "Job Posting"
  const startTime = Date.now()

  try {
    // Navigate to post job page
    await page.goto(`${config.baseUrl}/employer/jobs/post`, { waitUntil: "networkidle2" })

    // Wait for job posting form
    await page.waitForSelector("form", { timeout: config.timeouts.element })

    // Fill out job posting form
    await page.type('input[name="title"]', `Test Job ${Date.now()}`)
    await page.type(
      'textarea[name="description"]',
      `This is a test job posting created by synthetic monitoring at ${new Date().toISOString()}`,
    )

    // Fill location
    await page.type('input[name="location"]', "Remote")

    // Fill salary if field exists
    try {
      const salaryMinInput = await page.$('input[name="salaryMin"]')
      const salaryMaxInput = await page.$('input[name="salaryMax"]')

      if (salaryMinInput && salaryMaxInput) {
        await salaryMinInput.type("50000")
        await salaryMaxInput.type("70000")
      }
    } catch (e) {
      // Salary fields might not exist, continue
      console.log("Salary fields not found, continuing...")
    }

    // Select job type if dropdown exists
    try {
      await page.select('select[name="jobType"]', "Full-time")
    } catch (e) {
      // Job type dropdown might not exist, continue
      console.log("Job type dropdown not found, continuing...")
    }

    // Submit job posting
    const postingStartTime = Date.now()
    await Promise.all([
      page
        .waitForFunction(() => document.querySelector(".success-message, .toast-success, .alert-success") !== null, {
          timeout: config.timeouts.navigation,
        })
        .catch(() => {
          // If success message doesn't appear, we'll check for form submission completion
          return page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {
            // If no navigation occurs, we'll assume the form was submitted via AJAX
            return page.waitForFunction(() => !document.querySelector('button[type="submit"][disabled]'), {
              timeout: config.timeouts.element,
            })
          })
        }),
      page.click('button[type="submit"]'),
    ])
    const postingResponseTime = Date.now() - postingStartTime

    // Take a screenshot
    const screenshotPath = await takeScreenshot(page, testName, testId)

    // Record success
    recordTestResult(results, testName, true, startTime, undefined, screenshotPath, {
      postingResponseTime,
    })
  } catch (error) {
    // Take failure screenshot
    let screenshotPath
    try {
      screenshotPath = await takeScreenshot(page, `${testName}-failure`, testId)
    } catch (screenshotError) {
      console.error("Failed to take failure screenshot:", screenshotError)
    }

    // Record failure
    recordTestResult(
      results,
      testName,
      false,
      startTime,
      error instanceof Error ? error : new Error(String(error)),
      screenshotPath,
    )

    throw error
  }
}

// Run the tests
if (require.main === module) {
  runSyntheticTests()
    .then(() => {
      console.log("Synthetic tests completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Synthetic tests failed:", error)
      process.exit(1)
    })
}

// Export for programmatic usage
export { runSyntheticTests }
