import { SlackWebhookClient } from "../notifications/slack-client"
import { EmailClient } from "../notifications/email-client"

/**
 * Notification types for source map operations
 */
export type SourceMapOperationType = "cleanup" | "upload" | "process" | "archive" | "restore"

/**
 * Status types for source map operations
 */
export type SourceMapOperationStatus = "success" | "failure" | "warning"

/**
 * Interface for source map operation notification data
 */
export interface SourceMapOperationData {
  type: SourceMapOperationType
  status: SourceMapOperationStatus
  message: string
  details?: Record<string, any>
  timestamp?: Date
  operationId?: string
}

/**
 * Sends a notification about a source map operation
 *
 * @param data The operation data to include in the notification
 * @returns A promise that resolves when the notification is sent
 */
export async function notifySourceMapOperation(data: SourceMapOperationData): Promise<void> {
  try {
    const { type, status, message, details, timestamp = new Date(), operationId } = data

    // Format the notification message
    const title = `Source Map ${type.charAt(0).toUpperCase() + type.slice(1)} ${status.charAt(0).toUpperCase() + status.slice(1)}`
    const formattedMessage = formatNotificationMessage(title, message, details, timestamp, operationId)

    // Send notifications through configured channels
    await Promise.all([
      sendSlackNotification(title, formattedMessage, status),
      sendEmailNotification(title, formattedMessage, status),
    ])

    console.log(`Source map operation notification sent: ${type} - ${status}`)
  } catch (error) {
    console.error("Failed to send source map operation notification:", error)
  }
}

/**
 * Formats a notification message with details
 */
function formatNotificationMessage(
  title: string,
  message: string,
  details?: Record<string, any>,
  timestamp?: Date,
  operationId?: string,
): string {
  let formattedMessage = `*${title}*\n\n${message}`

  if (details && Object.keys(details).length > 0) {
    formattedMessage += "\n\n*Details:*\n"
    for (const [key, value] of Object.entries(details)) {
      formattedMessage += `• ${key}: ${JSON.stringify(value)}\n`
    }
  }

  if (operationId) {
    formattedMessage += `\n*Operation ID:* ${operationId}`
  }

  if (timestamp) {
    formattedMessage += `\n*Time:* ${timestamp.toISOString()}`
  }

  return formattedMessage
}

/**
 * Sends a notification to Slack
 */
async function sendSlackNotification(title: string, message: string, status: SourceMapOperationStatus): Promise<void> {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return
  }

  try {
    const slackClient = new SlackWebhookClient(process.env.SLACK_WEBHOOK_URL)

    const color = status === "success" ? "#36a64f" : status === "warning" ? "#f2c744" : "#d63031"

    await slackClient.sendMessage({
      text: title,
      attachments: [
        {
          color,
          text: message,
          footer: "Source Map Management System",
        },
      ],
    })
  } catch (error) {
    console.error("Failed to send Slack notification:", error)
  }
}

/**
 * Sends a notification via email
 */
async function sendEmailNotification(title: string, message: string, status: SourceMapOperationStatus): Promise<void> {
  if (!process.env.EMAIL_FROM || !process.env.ADMIN_EMAIL) {
    return
  }

  try {
    const emailClient = new EmailClient()

    await emailClient.sendEmail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `[${status.toUpperCase()}] ${title}`,
      text: message.replace(/\*([^*]+)\*/g, "$1"), // Remove markdown formatting
      html: message.replace(/\*([^*]+)\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>"),
    })
  } catch (error) {
    console.error("Failed to send email notification:", error)
  }
}
