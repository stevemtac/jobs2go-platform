import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/notifications/email-service"

export async function GET(request: NextRequest) {
  try {
    // Get test email from query params or use default
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get("email") || process.env.ALERT_RECIPIENTS || "test@example.com"

    console.log("🧪 Testing email functionality...")

    // Test email sending
    const emailSent = await emailService.sendEmail({
      to: testEmail,
      subject: "Jobs2Go Email Test - Deployment Verification",
      text: "This is a test email to verify the email configuration is working correctly after deployment.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Email Configuration Test</h2>
          <p>This email confirms that your Jobs2Go platform email configuration is working correctly.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3>Test Details:</h3>
            <ul>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              <li><strong>Provider:</strong> ${process.env.EMAIL_PROVIDER || "resend"}</li>
              <li><strong>Environment:</strong> ${process.env.NODE_ENV || "development"}</li>
            </ul>
          </div>
          <p>If you received this email, your email configuration is working properly! 🎉</p>
        </div>
      `,
    })

    // Test alert email
    const alertSent = await emailService.sendAlert(
      testEmail,
      "Email Configuration Test",
      "This is a test alert to verify alert email functionality is working correctly.",
      "info",
    )

    return NextResponse.json({
      success: true,
      message: "Email test completed",
      results: {
        emailSent,
        alertSent,
        provider: process.env.EMAIL_PROVIDER || "resend",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Email test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: process.env.EMAIL_PROVIDER || "resend",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message, type = "email" } = body

    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, subject, message" },
        { status: 400 },
      )
    }

    let result: boolean

    if (type === "alert") {
      result = await emailService.sendAlert(to, subject, message, "info")
    } else {
      result = await emailService.sendEmail({
        to,
        subject,
        text: message,
        html: `<div style="font-family: Arial, sans-serif;"><p>${message}</p></div>`,
      })
    }

    return NextResponse.json({
      success: result,
      message: result ? "Email sent successfully" : "Email sending failed",
      provider: process.env.EMAIL_PROVIDER || "resend",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Email sending failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
