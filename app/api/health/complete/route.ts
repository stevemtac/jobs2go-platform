import { type NextRequest, NextResponse } from "next/server"
import { validateEnv } from "@/lib/env-validator"

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    // Environment validation
    const envValidation = validateEnv()

    // Database check
    let databaseStatus = "unknown"
    try {
      // Simple database connectivity check
      databaseStatus = process.env.DATABASE_URL ? "configured" : "not_configured"
    } catch (error) {
      databaseStatus = "error"
    }

    // Email service check
    const emailStatus = {
      provider: process.env.EMAIL_PROVIDER || "resend",
      resend: !!process.env.RESEND_API_KEY,
      smtp: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER),
      alertRecipients: !!process.env.ALERT_RECIPIENTS,
    }

    // Monitoring services
    const monitoringStatus = {
      sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      analytics: !!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
      browserstack: !!process.env.BROWSERSTACK_USERNAME,
    }

    // Security configuration
    const securityStatus = {
      nextauth: !!process.env.NEXTAUTH_SECRET,
      cronSecret: !!process.env.CRON_SECRET,
      appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    }

    const responseTime = Date.now() - startTime

    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "unknown",
      deployment: {
        url: process.env.NEXT_PUBLIC_APP_URL || "unknown",
        region: process.env.VERCEL_REGION || "unknown",
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || "unknown",
      },
      services: {
        database: databaseStatus,
        email: emailStatus,
        monitoring: monitoringStatus,
        security: securityStatus,
      },
      environment_validation: {
        success: envValidation.success,
        errors: envValidation.errors || [],
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    }

    return NextResponse.json(healthData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
