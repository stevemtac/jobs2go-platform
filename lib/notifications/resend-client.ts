import { Resend } from "resend"

interface ResendMessage {
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

export class ResendClient {
  private resend: Resend | null = null
  private defaultFrom: string

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    this.defaultFrom = process.env.EMAIL_FROM || "onboarding@resend.dev"

    if (apiKey && apiKey !== "re_ed295arG_EFB5Sp1oahfVKixQZJKXVxz8") {
      this.resend = new Resend(apiKey)
    } else {
      console.warn("Resend API key not configured or using placeholder value")
    }
  }

  async sendEmail(message: ResendMessage): Promise<boolean> {
    if (!this.resend) {
      console.warn("Resend client not initialized, skipping email send")
      return false
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: message.from || this.defaultFrom,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
        cc: Array.isArray(message.cc) ? message.cc : message.cc ? [message.cc] : undefined,
        bcc: Array.isArray(message.bcc) ? message.bcc : message.bcc ? [message.bcc] : undefined,
        attachments: message.attachments,
      })

      if (error) {
        console.error("Resend email error:", error)
        return false
      }

      console.log("Email sent successfully via Resend:", data?.id)
      return true
    } catch (error) {
      console.error("Failed to send email via Resend:", error)
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin: 0 0 16px 0;">
            ${severityEmojis[severity]} ${title}
          </h2>
          <div style="background-color: white; padding: 16px; border-radius: 4px;">
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

  isConfigured(): boolean {
    return this.resend !== null
  }
}

// Export singleton instance
export const resendClient = new ResendClient()

// Convenience function
export async function sendEmailViaResend(message: ResendMessage): Promise<boolean> {
  return resendClient.sendEmail(message)
}
