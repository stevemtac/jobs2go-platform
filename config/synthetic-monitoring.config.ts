/**
 * Configuration for synthetic monitoring
 */

export interface SyntheticMonitoringConfig {
  baseUrl: string
  screenshotDir: string
  headless: boolean
  testUsers: {
    jobSeeker: {
      email: string
      password: string
    }
    employer: {
      email: string
      password: string
    }
  }
  timeouts: {
    navigation: number
    element: number
    action: number
  }
  retries: number
  schedule: {
    enabled: boolean
    intervalMinutes: number
  }
  reporting: {
    slackEnabled: boolean
    emailEnabled: boolean
    retainScreenshots: boolean
    screenshotRetentionDays: number
  }
}

const config: SyntheticMonitoringConfig = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  screenshotDir: process.env.SCREENSHOT_DIR || "./synthetic-monitoring-results",
  headless: process.env.SYNTHETIC_HEADLESS !== "false",
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
    navigation: Number.parseInt(process.env.TIMEOUT_NAVIGATION || "30000", 10),
    element: Number.parseInt(process.env.TIMEOUT_ELEMENT || "10000", 10),
    action: Number.parseInt(process.env.TIMEOUT_ACTION || "5000", 10),
  },
  retries: Number.parseInt(process.env.TEST_RETRIES || "2", 10),
  schedule: {
    enabled: process.env.SCHEDULE_ENABLED === "true",
    intervalMinutes: Number.parseInt(process.env.SCHEDULE_INTERVAL_MINUTES || "15", 10),
  },
  reporting: {
    slackEnabled: process.env.SLACK_WEBHOOK_URL !== undefined,
    emailEnabled: process.env.ALERT_EMAIL_RECIPIENTS !== undefined,
    retainScreenshots: process.env.RETAIN_SCREENSHOTS !== "false",
    screenshotRetentionDays: Number.parseInt(process.env.SCREENSHOT_RETENTION_DAYS || "7", 10),
  },
}

export default config
