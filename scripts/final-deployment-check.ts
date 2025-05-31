import { validateEnv } from "../lib/env-validator"

async function runFinalDeploymentCheck() {
  console.log("🚀 Final Deployment Check for Jobs2Go Platform")
  console.log("=".repeat(60))

  // Environment validation
  console.log("\n📋 Environment Variables Validation:")
  const envValidation = validateEnv()

  if (envValidation.success) {
    console.log("✅ All environment variables validated successfully")
  } else {
    console.log("❌ Environment validation issues found:")
    envValidation.errors?.forEach((error) => console.log(`  - ${error}`))
  }

  // Check critical environment variables
  console.log("\n🔑 Critical Environment Variables:")
  const criticalVars = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing",
    ALERT_RECIPIENTS: process.env.ALERT_RECIPIENTS,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN ? "✅ Set" : "❌ Missing",
  }

  Object.entries(criticalVars).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`)
  })

  // Database configuration
  console.log("\n🗄️ Database Configuration:")
  console.log(`  Primary DB: ${process.env.POSTGRES_URL ? "✅ Configured" : "❌ Missing"}`)
  console.log(`  Supabase: ${process.env.SUPABASE_URL ? "✅ Configured" : "❌ Missing"}`)
  console.log(`  Backup DB: ${process.env.superbase__POSTGRES_URL ? "✅ Configured" : "❌ Missing"}`)

  // Email configuration
  console.log("\n📧 Email Configuration:")
  console.log(`  Provider: ${process.env.EMAIL_PROVIDER || "resend"}`)
  console.log(`  Resend API: ${process.env.RESEND_API_KEY ? "✅ Configured" : "❌ Missing"}`)
  console.log(`  SMTP Backup: ${process.env.EMAIL_HOST ? "✅ Configured" : "❌ Missing"}`)
  console.log(`  Alert Recipients: ${process.env.ALERT_RECIPIENTS || "Not set"}`)

  // Monitoring configuration
  console.log("\n📊 Monitoring Configuration:")
  console.log(`  Sentry: ${process.env.NEXT_PUBLIC_SENTRY_DSN ? "✅ Configured" : "❌ Missing"}`)
  console.log(`  Google Analytics: ${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ? "✅ Configured" : "❌ Missing"}`)
  console.log(`  BrowserStack: ${process.env.BROWSERSTACK_USERNAME ? "✅ Configured" : "❌ Missing"}`)

  // Security configuration
  console.log("\n🔒 Security Configuration:")
  console.log(`  CRON Secret: ${process.env.CRON_SECRET ? "✅ Set" : "❌ Missing"}`)
  console.log(`  NextAuth URL: ${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}`)

  console.log("\n🎯 Deployment Readiness Summary:")
  const readinessChecks = [
    { name: "Environment Variables", status: envValidation.success },
    { name: "Database Connection", status: !!process.env.DATABASE_URL },
    { name: "Email Configuration", status: !!(process.env.RESEND_API_KEY || process.env.EMAIL_HOST) },
    { name: "Authentication Setup", status: !!process.env.NEXTAUTH_SECRET },
    { name: "Alert Recipients", status: !!process.env.ALERT_RECIPIENTS },
  ]

  readinessChecks.forEach((check) => {
    console.log(`  ${check.status ? "✅" : "❌"} ${check.name}`)
  })

  const allReady = readinessChecks.every((check) => check.status)
  console.log(`\n🚀 Overall Status: ${allReady ? "✅ READY FOR DEPLOYMENT" : "❌ NEEDS ATTENTION"}`)

  if (allReady) {
    console.log("\n🎉 Your Jobs2Go platform is fully configured and ready for deployment!")
    console.log("\nNext steps:")
    console.log("1. Run: vercel --prod")
    console.log("2. Visit: https://your-app.vercel.app/test/email")
    console.log("3. Test: https://your-app.vercel.app/api/health")
    console.log("4. Monitor: https://your-app.vercel.app/admin/monitoring")
  }

  console.log("\n" + "=".repeat(60))
}

// Run the check
runFinalDeploymentCheck().catch(console.error)
