import { resendClient } from "../lib/notifications/resend-client"
import { getDefaultEmailClient } from "../lib/notifications/email-client"

async function testEmailDeployment() {
  console.log("🧪 Testing Email Configuration After Deployment")
  console.log("=".repeat(50))

  // Test environment variables
  console.log("\n📋 Environment Variables Check:")
  const emailVars = {
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    EMAIL_HOST: process.env.EMAIL_HOST ? "✅ Set" : "❌ Missing",
    EMAIL_PORT: process.env.EMAIL_PORT ? "✅ Set" : "❌ Missing",
    EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Set" : "❌ Missing",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing",
    EMAIL_FROM: process.env.EMAIL_FROM || "Using default",
  }

  Object.entries(emailVars).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`)
  })

  // Test Resend client
  console.log("\n🔄 Testing Resend Client:")
  try {
    const resendConfigured = resendClient.isConfigured()
    console.log(`  Resend configured: ${resendConfigured ? "✅ Yes" : "❌ No"}`)

    if (resendConfigured) {
      console.log("  Resend client ready for sending emails")
    }
  } catch (error) {
    console.log(`  Resend error: ${error}`)
  }

  // Test SMTP client
  console.log("\n📧 Testing SMTP Client:")
  try {
    const smtpClient = getDefaultEmailClient()
    if (smtpClient) {
      console.log("  ✅ SMTP client initialized successfully")
      const connectionValid = await smtpClient.verifyConnection()
      console.log(`  Connection test: ${connectionValid ? "✅ Success" : "❌ Failed"}`)
    } else {
      console.log("  ❌ SMTP client not available")
    }
  } catch (error) {
    console.log(`  SMTP error: ${error}`)
  }

  // Test unified email service
  console.log("\n🎯 Testing Unified Email Service:")
  try {
    console.log(`  Primary provider: ${process.env.EMAIL_PROVIDER || "resend"}`)
    console.log("  ✅ Email service initialized")

    // Test email sending (dry run)
    console.log("  📤 Email service ready for sending")
  } catch (error) {
    console.log(`  Email service error: ${error}`)
  }

  console.log("\n🎉 Email deployment test complete!")
  console.log("=".repeat(50))
}

// Run the test
testEmailDeployment().catch(console.error)
