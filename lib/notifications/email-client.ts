import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"

interface EmailConfig {
  host: string
  port: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailMessage {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

export class EmailClient {
  private transporter: Transporter
  private defaultFrom: string

  constructor(config: EmailConfig, defaultFrom: string) {
    try {
      // Fix: Use nodemailer.createTransport instead of createTransporter
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure ?? config.port === 465,
        auth: config.auth,
        // Add additional configuration for better compatibility
        tls: {
          rejectUnauthorized: false,
        },
      })
      this.defaultFrom = defaultFrom
    } catch (error) {
      console.error("Failed to create email transporter:", error)
      throw new Error("Email client initialization failed")
    }
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error("Email transporter not initialized")
      }

      const info = await this.transporter.sendMail({
        from: message.from || this.defaultFrom,
        to: Array.isArray(message.to) ? message.to.join(", ") : message.to,
        cc: Array.isArray(message.cc) ? message.cc.join(", ") : message.cc,
        bcc: Array.isArray(message.bcc) ? message.bcc.join(", ") : message.bcc,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
      })

      console.log("Email sent successfully:", info.messageId)
      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }

  async sendAlert(
    to: string | string[],
    title: string,
    message: string,
    severity: "info" | "warning" | "error" = "info",
  ): Promise<boolean> {
    const severityEmojis = {
      info: "ℹ️",
      warning: "⚠️",
      error: "🚨",
    }

    const severityColors = {
      info: "#28a745",
      warning: "#ffc107",
      error: "#dc3545",
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin: 0 0 16px 0;">
            ${severityEmojis[severity]} ${title}
          </h2>
          <div style="background-color: white; padding: 16px; border-radius: 4px; border-left: 4px solid ${severityColors[severity]};">
            <p style="margin: 0; color: #666; line-height: 1.5;">${message}</p>
          </div>
          <div style="margin-top: 16px; font-size: 12px; color: #999;">
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Severity: ${severity.toUpperCase()}</p>
          </div>
        </div>
      </div>
    `

    return this.sendEmail({
      to,
      subject: `[${severity.toUpperCase()}] ${title}`,
      text: `${title}\n\n${message}\n\nTimestamp: ${new Date().toISOString()}`,
      html,
    })
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false
      }
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error("Email connection verification failed:", error)
      return false
    }
  }
}

// Convenience function for quick email sending with better error handling
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  try {
    // Use environment variables with fallbacks
    const config: EmailConfig = {
      host: process.env.EMAIL_SERVER_HOST || process.env.EMAIL_HOST || "localhost",
      port: Number.parseInt(process.env.EMAIL_SERVER_PORT || process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true" || process.env.EMAIL_SERVER_PORT === "465",
      auth: {
        user: process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASSWORD || "",
      },
    }

    // Validate configuration
    if (!config.host || !config.auth.user || !config.auth.pass) {
      console.warn("Email configuration incomplete, skipping email send")
      return false
    }

    const defaultFrom = process.env.EMAIL_FROM || "noreply@jobs2go.app"
    const client = new EmailClient(config, defaultFrom)

    return await client.sendEmail(message)
  } catch (error) {
    console.error("Failed to send email:", error)
    return false
  }
}

// Create default client instance with better error handling
let defaultEmailClient: EmailClient | null = null

export function getDefaultEmailClient(): EmailClient | null {
  if (defaultEmailClient) {
    return defaultEmailClient
  }

  try {
    const host = process.env.EMAIL_SERVER_HOST || process.env.EMAIL_HOST
    const user = process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER
    const pass = process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASSWORD

    if (!host || !user || !pass) {
      console.warn("Email configuration incomplete, email client not available")
      return null
    }

    const config: EmailConfig = {
      host,
      port: Number.parseInt(process.env.EMAIL_SERVER_PORT || process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true" || process.env.EMAIL_SERVER_PORT === "465",
      auth: { user, pass },
    }

    const defaultFrom = process.env.EMAIL_FROM || "noreply@jobs2go.app"
    defaultEmailClient = new EmailClient(config, defaultFrom)

    return defaultEmailClient
  } catch (error) {
    console.error("Failed to create default email client:", error)
    return null
  }
}

// Export for backward compatibility
export { EmailClient as default }
