import { monitoringConfig, type MonitoringSeverity, type MonitoringCategory } from "./config"
import { notifySlack } from "../notifications/slack-client"
import { sendEmail } from "../notifications/email-client"

export interface MonitoringEvent {
  category: MonitoringCategory
  severity: MonitoringSeverity
  message: string
  details?: Record<string, any>
  timestamp?: Date
  source?: string
  userId?: string
  sessionId?: string
  requestId?: string
}

/**
 * Core monitoring service for tracking events and sending alerts
 */
class MonitoringService {
  private static instance: MonitoringService
  private eventBuffer: MonitoringEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null

  private constructor() {
    // Initialize flush interval if not in test environment
    if (process.env.NODE_ENV !== "test") {
      this.flushInterval = setInterval(() => this.flushEvents(), 10000) // Flush every 10 seconds
    }
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  /**
   * Track a monitoring event
   */
  public trackEvent(event: MonitoringEvent): void {
    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = new Date()
    }

    // Add to buffer
    this.eventBuffer.push(event)

    // Send immediate alerts for critical events
    if (event.severity === "critical" || event.severity === "error") {
      this.sendAlert(event)
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[${event.severity.toUpperCase()}] ${event.category}: ${event.message}`)
    }
  }

  /**
   * Send an alert for a monitoring event
   */
  private async sendAlert(event: MonitoringEvent): Promise<void> {
    try {
      const { notificationChannels } = monitoringConfig

      // Only send alerts for warning, error, and critical events
      if (!["warning", "error", "critical"].includes(event.severity)) {
        return
      }

      // Format the alert message
      const title = `[${event.severity.toUpperCase()}] ${event.category}: ${event.message}`
      const details = this.formatEventDetails(event)

      // Send to Slack if enabled
      if (notificationChannels.slack.enabled) {
        await notifySlack({
          title,
          message: details,
          severity: event.severity,
        })
      }

      // Send email for critical and error events if enabled
      if (notificationChannels.email.enabled && ["critical", "error"].includes(event.severity)) {
        await sendEmail({
          subject: title,
          body: details,
          recipients: notificationChannels.email.recipients,
        })
      }
    } catch (error) {
      console.error("Failed to send alert:", error)
    }
  }

  /**
   * Format event details for alerts
   */
  private formatEventDetails(event: MonitoringEvent): string {
    let message = `*${event.message}*\n\n`

    if (event.details) {
      message += "*Details:*\n"
      for (const [key, value] of Object.entries(event.details)) {
        message += `• ${key}: ${JSON.stringify(value)}\n`
      }
    }

    message += `\n*Category:* ${event.category}`
    message += `\n*Severity:* ${event.severity}`
    message += `\n*Timestamp:* ${event.timestamp?.toISOString()}`

    if (event.source) message += `\n*Source:* ${event.source}`
    if (event.userId) message += `\n*User ID:* ${event.userId}`
    if (event.sessionId) message += `\n*Session ID:* ${event.sessionId}`
    if (event.requestId) message += `\n*Request ID:* ${event.requestId}`

    message += `\n*Environment:* ${monitoringConfig.environment}`

    return message
  }

  /**
   * Flush events to persistent storage or external monitoring service
   */
  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return

    try {
      const events = [...this.eventBuffer]
      this.eventBuffer = []

      // Here you would typically send events to your monitoring backend
      // For now, we'll just log them in production and store in database
      if (process.env.NODE_ENV === "production") {
        await this.persistEvents(events)
      }
    } catch (error) {
      console.error("Failed to flush monitoring events:", error)
      // Put events back in buffer to try again
      this.eventBuffer = [...this.eventBuffer, ...this.eventBuffer]
    }
  }

  /**
   * Persist events to database
   */
  private async persistEvents(events: MonitoringEvent[]): Promise<void> {
    try {
      // This would typically be an API call or database operation
      // For example with Prisma:
      /*
      await prisma.monitoringEvent.createMany({
        data: events.map(event => ({
          category: event.category,
          severity: event.severity,
          message: event.message,
          details: event.details ? JSON.stringify(event.details) : null,
          timestamp: event.timestamp,
          source: event.source,
          userId: event.userId,
          sessionId: event.sessionId,
          requestId: event.requestId,
        })),
      });
      */

      // For now, we'll just log that we would persist these events
      console.log(`Would persist ${events.length} monitoring events`)
    } catch (error) {
      console.error("Failed to persist monitoring events:", error)
    }
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
  }
}

// Export a singleton instance
export const monitoringService = MonitoringService.getInstance()

// Helper functions for common monitoring events
export function trackError(message: string, error: Error, details?: Record<string, any>): void {
  monitoringService.trackEvent({
    category: "error",
    severity: "error",
    message,
    details: {
      ...details,
      errorMessage: error.message,
      stack: error.stack,
    },
  })
}

export function trackPerformance(metric: string, value: number, details?: Record<string, any>): void {
  // Apply sampling for performance metrics
  if (Math.random() * 100 > monitoringConfig.sampling.performanceSampling) {
    return
  }

  monitoringService.trackEvent({
    category: "performance",
    severity: "info",
    message: `Performance metric: ${metric}`,
    details: {
      ...details,
      metric,
      value,
    },
  })
}

export function trackDatabasePerformance(operation: string, durationMs: number, details?: Record<string, any>): void {
  const { databaseThresholds } = monitoringConfig

  let severity: MonitoringSeverity = "info"

  if (durationMs >= databaseThresholds.queryTime.critical) {
    severity = "critical"
  } else if (durationMs >= databaseThresholds.queryTime.warning) {
    severity = "warning"
  }

  monitoringService.trackEvent({
    category: "database",
    severity,
    message: `Database operation: ${operation}`,
    details: {
      ...details,
      operation,
      durationMs,
    },
  })
}

export function trackBusinessEvent(message: string, details?: Record<string, any>): void {
  monitoringService.trackEvent({
    category: "business",
    severity: "info",
    message,
    details,
  })
}

export function trackSecurityEvent(message: string, severity: MonitoringSeverity, details?: Record<string, any>): void {
  monitoringService.trackEvent({
    category: "security",
    severity,
    message,
    details,
  })
}
