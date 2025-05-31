interface SlackMessage {
  text: string
  channel?: string
  username?: string
  icon_emoji?: string
  attachments?: Array<{
    color?: string
    title?: string
    text?: string
    fields?: Array<{
      title: string
      value: string
      short?: boolean
    }>
  }>
}

interface SlackWebhookConfig {
  webhookUrl: string
  defaultChannel?: string
  defaultUsername?: string
}

export class SlackWebhookClient {
  private config: SlackWebhookConfig

  constructor(config: SlackWebhookConfig) {
    this.config = config
  }

  async sendMessage(message: SlackMessage): Promise<boolean> {
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: message.channel || this.config.defaultChannel,
          username: message.username || this.config.defaultUsername || "Jobs2Go Bot",
          icon_emoji: message.icon_emoji || ":robot_face:",
          text: message.text,
          attachments: message.attachments,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to send Slack message:", error)
      return false
    }
  }

  async sendAlert(title: string, message: string, severity: "info" | "warning" | "error" = "info"): Promise<boolean> {
    const colors = {
      info: "#36a64f",
      warning: "#ff9500",
      error: "#ff0000",
    }

    return this.sendMessage({
      text: `🚨 Alert: ${title}`,
      attachments: [
        {
          color: colors[severity],
          title: title,
          text: message,
          fields: [
            {
              title: "Severity",
              value: severity.toUpperCase(),
              short: true,
            },
            {
              title: "Timestamp",
              value: new Date().toISOString(),
              short: true,
            },
          ],
        },
      ],
    })
  }
}

// Convenience function for quick notifications
export async function notifySlack(message: string, webhookUrl?: string): Promise<boolean> {
  const url = webhookUrl || process.env.SLACK_WEBHOOK_URL

  if (!url) {
    console.warn("No Slack webhook URL provided")
    return false
  }

  const client = new SlackWebhookClient({ webhookUrl: url })
  return client.sendMessage({ text: message })
}

// Create default client instance
export const defaultSlackClient = process.env.SLACK_WEBHOOK_URL
  ? new SlackWebhookClient({
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      defaultChannel: process.env.SLACK_DEFAULT_CHANNEL,
      defaultUsername: "Jobs2Go Platform",
    })
  : null
