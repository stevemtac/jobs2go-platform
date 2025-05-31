/**
 * Monitoring configuration for the Jobs2go platform
 */

export const monitoringConfig = {
  // General settings
  environment: process.env.NODE_ENV || "development",
  serviceName: "jobs2go-platform",

  // Error tracking thresholds
  errorThresholds: {
    critical: 10, // Errors per minute to trigger critical alert
    warning: 5, // Errors per minute to trigger warning alert
  },

  // Performance thresholds
  performanceThresholds: {
    // Web Vitals thresholds (in milliseconds)
    fcp: {
      good: 1800,
      needsImprovement: 3000,
    },
    lcp: {
      good: 2500,
      needsImprovement: 4000,
    },
    fid: {
      good: 100,
      needsImprovement: 300,
    },
    cls: {
      good: 0.1,
      needsImprovement: 0.25,
    },
    ttfb: {
      good: 800,
      needsImprovement: 1800,
    },
    // API response time thresholds (in milliseconds)
    apiResponse: {
      good: 300,
      warning: 1000,
      critical: 3000,
    },
  },

  // Database monitoring thresholds
  databaseThresholds: {
    queryTime: {
      warning: 500, // Query time in ms to trigger warning
      critical: 2000, // Query time in ms to trigger critical alert
    },
    connectionPoolUsage: {
      warning: 70, // Percentage of connection pool usage to trigger warning
      critical: 90, // Percentage of connection pool usage to trigger critical alert
    },
  },

  // Notification channels
  notificationChannels: {
    email: {
      enabled: true,
      recipients: (process.env.ALERT_EMAIL_RECIPIENTS || "").split(",").filter(Boolean),
    },
    slack: {
      enabled: !!process.env.SLACK_WEBHOOK_URL,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_ALERT_CHANNEL || "#alerts",
    },
  },

  // Sampling rates (percentage of events to capture)
  sampling: {
    errorSampling: 100, // Capture all errors
    performanceSampling: 10, // Capture 10% of performance metrics
    apiSampling: 5, // Capture 5% of API calls
  },
}

// Export types for better type safety
export type MonitoringSeverity = "info" | "warning" | "error" | "critical"
export type MonitoringCategory = "performance" | "error" | "security" | "database" | "business" | "system"
