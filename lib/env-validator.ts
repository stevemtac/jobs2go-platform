import { z } from "zod"

// Define the comprehensive environment schema
const envSchema = z.object({
  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://jobs2go.app"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // Database Configuration
  DATABASE_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),
  POSTGRES_URL_NON_POOLING: z.string().optional(),
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DATABASE: z.string().optional(),

  // Supabase Configuration
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),

  // Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // Email Configuration (Resend)
  EMAIL_PROVIDER: z.string().default("resend"),
  EMAIL_FROM: z.string().email().default("onboarding@resend.dev"),
  EMAIL_FROM_NAME: z.string().default("Jobs2Go"),
  EMAIL_REPLY_TO: z.string().email().default("help@jobs2go.app"),
  RESEND_API_KEY: z.string().optional(),

  // Email Configuration (SendGrid)
  EMAIL_SERVER_HOST: z.string().default("smtp.sendgrid.net"),
  EMAIL_SERVER_PORT: z.string().transform(Number).default("587"),
  EMAIL_SERVER_USER: z.string().default("apikey"),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_SECURE: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_WEBHOOK_SIGNING_KEY: z.string().optional(),

  // Google Analytics
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: z.string().default("G-39HH8HNW2Z"),
  GA4_MEASUREMENT_ID: z.string().optional(),
  GA4_API_SECRET: z.string().optional(),
  GA_PROPERTY_ID: z.string().transform(Number).default("489114412"),
  GA_CLIENT_EMAIL: z.string().email().optional(),
  GA_PRIVATE_KEY: z.string().optional(),

  // Sentry Configuration
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // BrowserStack Configuration
  BROWSERSTACK_USERNAME: z.string().default("stevenmcauley_Uptsbf"),
  BROWSERSTACK_ACCESS_KEY: z.string().optional(),

  // Security & Cron
  CRON_SECRET: z.string().default("Qj7nHd9vP3s5kR2z8xYfU4WmLkVt9b"),

  // Alert Configuration
  ALERT_RECIPIENTS: z.string().default("steve.mcauley1@aol.co.uk"),

  // Monitoring Configuration
  SCREENSHOT_DIR: z.string().default("./synthetic-monitoring-results"),
  SYNTHETIC_HEADLESS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  TEST_USER_EMAIL: z.string().email().optional(),
  TEST_USER_PASSWORD: z.string().optional(),
  TEST_EMPLOYER_EMAIL: z.string().email().optional(),
  TEST_EMPLOYER_PASSWORD: z.string().optional(),

  // Timeouts and configuration
  TIMEOUT_NAVIGATION: z.string().transform(Number).default("30000"),
  TIMEOUT_ELEMENT: z.string().transform(Number).default("10000"),
  TIMEOUT_ACTION: z.string().transform(Number).default("5000"),
  TEST_RETRIES: z.string().transform(Number).default("2"),

  // Scheduling
  SCHEDULE_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  SCHEDULE_INTERVAL_MINUTES: z.string().transform(Number).default("15"),

  // Notifications
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  SLACK_DEFAULT_CHANNEL: z.string().default("#alerts"),
  ALERT_EMAIL_RECIPIENTS: z.string().default("steve.mcauley1@aol.co.uk"),

  // Screenshot management
  RETAIN_SCREENSHOTS: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  SCREENSHOT_RETENTION_DAYS: z.string().transform(Number).default("7"),

  // Redis/Upstash
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Security
  ALLOWED_ORIGINS: z.string().optional(),
  DEBUG_TOKEN: z.string().default("debug-123"),
  VERCEL_REGION: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

// Validate environment variables
export function validateEnv(): { success: boolean; errors?: string[]; data?: Env } {
  try {
    const parsed = envSchema.parse(process.env)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ["Unknown validation error"] }
  }
}

// Get environment variable with fallback
export function getEnvVar(key: keyof Env, fallback?: string): string {
  const value = process.env[key]
  if (!value && !fallback) {
    console.warn(`Environment variable ${key} is not set`)
    return ""
  }
  return value || fallback || ""
}

// Check if we're in development, staging, or production
export function getEnvironment(): "development" | "staging" | "production" {
  if (process.env.NODE_ENV === "development") return "development"
  if (process.env.VERCEL_ENV === "preview") return "staging"
  return "production"
}

// Log environment status (server-side only)
export function logEnvironmentStatus() {
  if (typeof window !== "undefined") {
    console.warn("logEnvironmentStatus should only be called server-side")
    return
  }

  const validation = validateEnv()
  const environment = getEnvironment()

  console.log(`🌍 Environment: ${environment}`)
  console.log(`✅ Environment validation: ${validation.success ? "PASSED" : "FAILED"}`)

  if (!validation.success && validation.errors) {
    console.error("❌ Environment validation errors:")
    validation.errors.forEach((error) => console.error(`  - ${error}`))
  }

  // Log which variables are set (without values for security)
  const setVars = Object.keys(process.env).filter(
    (key) =>
      key.startsWith("NEXT_PUBLIC_") ||
      key.startsWith("DATABASE_") ||
      key.startsWith("POSTGRES_") ||
      key.startsWith("SUPABASE_") ||
      key.startsWith("NEXTAUTH_") ||
      key.startsWith("EMAIL_") ||
      key.startsWith("RESEND_") ||
      key.startsWith("SENDGRID_") ||
      key.startsWith("GA") ||
      key.startsWith("SENTRY_") ||
      key.startsWith("BROWSERSTACK_") ||
      key.startsWith("SLACK_") ||
      key.startsWith("UPSTASH_"),
  )

  console.log(`📋 Environment variables set: ${setVars.length}`)
  setVars.forEach((key) => {
    const value = process.env[key]
    const maskedValue = value ? `${value.substring(0, 4)}...` : "NOT_SET"
    console.log(`  - ${key}: ${maskedValue}`)
  })
}
