import { type NextRequest, NextResponse } from "next/server"
import { validateEnv, getEnvironment, logEnvironmentStatus } from "@/lib/env-validator"

export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with special header
    const isDev = process.env.NODE_ENV === "development"
    const hasDebugHeader = request.headers.get("x-debug-token") === process.env.DEBUG_TOKEN

    if (!isDev && !hasDebugHeader) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Log environment status to server console
    logEnvironmentStatus()

    // Validate environment variables
    const validation = validateEnv()
    const environment = getEnvironment()

    // Get public environment variables (safe to expose)
    const publicEnvVars = Object.keys(process.env)
      .filter((key) => key.startsWith("NEXT_PUBLIC_"))
      .reduce(
        (acc, key) => {
          acc[key] = process.env[key] || "NOT_SET"
          return acc
        },
        {} as Record<string, string>,
      )

    // Get server environment variables (masked for security)
    const serverEnvVars = Object.keys(process.env)
      .filter(
        (key) =>
          !key.startsWith("NEXT_PUBLIC_") &&
          (key.startsWith("DATABASE_") ||
            key.startsWith("NEXTAUTH_") ||
            key.startsWith("SLACK_") ||
            key.startsWith("EMAIL_") ||
            key.startsWith("UPSTASH_") ||
            key.includes("SECRET") ||
            key.includes("TOKEN") ||
            key.includes("KEY")),
      )
      .reduce(
        (acc, key) => {
          const value = process.env[key]
          acc[key] = value ? `${value.substring(0, 4)}...` : "NOT_SET"
          return acc
        },
        {} as Record<string, string>,
      )

    return NextResponse.json({
      success: true,
      environment,
      validation: {
        success: validation.success,
        errors: validation.errors || [],
      },
      variables: {
        public: publicEnvVars,
        server: serverEnvVars,
        total: Object.keys(process.env).length,
      },
      vercel: {
        env: process.env.VERCEL_ENV,
        url: process.env.VERCEL_URL,
        region: process.env.VERCEL_REGION,
        gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
      },
    })
  } catch (error) {
    console.error("Environment debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
