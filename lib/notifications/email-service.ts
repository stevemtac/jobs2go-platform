import { sendEmail as sendViaNodemailer } from "./email-client"
import { ResendClient } from "./resend-client"

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

export class EmailService {
  private resendClient: ResendClient
  private emailProvider: string

  constructor() {
    this.resendClient = new ResendClient()
    this.emailProvider = process.env.EMAIL_PROVIDER || "resend"
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    // Try Resend first if configured and selected
    if (this.emailProvider === "resend" && this.resendClient.isConfigured()) {
      const success = await this.resendClient.sendEmail(message)
      if (success) return true

      console.warn("Resend failed, falling back to SMTP")
    }

    // Fallback to SMTP/Nodemailer
    return sendViaNodemailer(message)
  }

  async sendAlert(
    to: string | string[],
    title: string,
    message: string,
    severity: "info" | "warning" | "error" = "info",
  ): Promise<boolean> {
    // Try Resend first if configured
    if (this.emailProvider === "resend" && this.resendClient.isConfigured()) {
      const success = await this.resendClient.sendAlert(to, title, message, severity)
      if (success) return true
    }

    // Fallback to SMTP
    const severityEmojis = {
      info: "ℹ️",
      warning: "⚠️",
      error: "🚨",
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin: 0 0 16px 0;">
            ${severityEmojis[severity]} ${title}
          </h2>
          <div style="background-color: white; padding: 16px; border-radius: 4px;">
            <p style="margin: 0; color: #666; line-height: 1.5;">${message}</p>
          </div>
        </div>
      </div>
    `

    return sendViaNodemailer({
      to,
      subject: `[${severity.toUpperCase()}] ${title}`,
      text: `${title}\n\n${message}`,
      html,
    })
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Convenience exports
export { sendEmail as sendEmailViaSMTP } from "./email-client"
export { sendEmailViaResend } from "./resend-client"

// Default export
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  return emailService.sendEmail(message)
}
