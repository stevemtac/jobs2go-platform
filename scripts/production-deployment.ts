import { execSync } from "child_process"
import { validateEnv } from "../lib/env-validator"

async function executeProductionDeployment() {
  console.log("🚀 Jobs2Go Platform - Production Deployment")
  console.log("=" * 70)

  try {
    // Final environment validation
    console.log("\n🔍 Final Environment Validation...")
    const envValidation = validateEnv()

    if (!envValidation.success) {
      console.error("❌ Environment validation failed:")
      envValidation.errors?.forEach((error) => console.error(`  - ${error}`))
      process.exit(1)
    }

    console.log("✅ All environment variables validated successfully")

    // Check critical services
    console.log("\n🔧 Critical Services Check:")
    const services = {
      database: !!process.env.DATABASE_URL,
      supabase: !!(process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL),
      email: !!(process.env.RESEND_API_KEY || process.env.EMAIL_HOST),
      monitoring: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      analytics: !!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
      alerts: !!process.env.ALERT_RECIPIENTS,
      auth: !!process.env.NEXTAUTH_SECRET,
      testing: !!process.env.BROWSERSTACK_USERNAME,
    }

    Object.entries(services).forEach(([service, status]) => {
      console.log(`  ${status ? "✅" : "❌"} ${service.toUpperCase()}`)
    })

    const allServicesReady = Object.values(services).every(Boolean)

    if (!allServicesReady) {
      console.error("❌ Some critical services are not configured")
      process.exit(1)
    }

    console.log("\n🎯 All systems ready for production deployment!")

    // Build check
    console.log("\n🔨 Running production build...")
    try {
      execSync("npm run build", { stdio: "inherit" })
      console.log("✅ Production build successful")
    } catch (error) {
      console.error("❌ Build failed:", error)
      process.exit(1)
    }

    // Deploy to Vercel
    console.log("\n🚀 Deploying to Vercel Production...")
    try {
      execSync("vercel --prod --yes", { stdio: "inherit" })
      console.log("✅ Deployment to Vercel successful!")
    } catch (error) {
      console.error("❌ Deployment failed:", error)
      process.exit(1)
    }

    console.log("\n🎉 DEPLOYMENT COMPLETE!")
    console.log("\n📋 Post-Deployment Checklist:")
    console.log("1. ✅ Test health endpoint: /api/health/complete")
    console.log("2. ✅ Test email system: /test/email")
    console.log("3. ✅ Check monitoring: /admin/monitoring")
    console.log("4. ✅ Verify authentication: /auth/signin")
    console.log("5. ✅ Test job posting: /jobs/post")
  } catch (error) {
    console.error("❌ Deployment process failed:", error)
    process.exit(1)
  }
}

// Execute deployment
executeProductionDeployment()
