#!/usr/bin/env node

import { execSync } from "child_process"

// Environment variables to add to Vercel
const envVars = [
  // Application Configuration
  { key: "NEXT_PUBLIC_APP_URL", value: "http://jobs2go.app" },
  { key: "NEXT_PUBLIC_SUPABASE_URL", value: "https://nnsbsvyuojhjwwesccsq.supabase.co" },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    value:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uc2Jzdnl1b2poand3ZXNjY3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMzkyODEsImV4cCI6MjA2MDkxNTI4MX0.hstms4LWaefsmLzY4Y7xeogLjq6Z2lh4ce3Bgv0mDqg",
  },

  // Database Configuration
  {
    key: "DATABASE_URL",
    value:
      "postgres://postgres.nnsbsvyuojhjwwesccsq:uDqT4Pcj2vcSj7Bk@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x",
  },
  {
    key: "POSTGRES_URL",
    value:
      "postgres://postgres.nnsbsvyuojhjwwesccsq:uDqT4Pcj2vcSj7Bk@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x",
  },
  {
    key: "POSTGRES_PRISMA_URL",
    value:
      "postgres://postgres.nnsbsvyuojhjwwesccsq:uDqT4Pcj2vcSj7Bk@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x",
  },
  {
    key: "POSTGRES_URL_NON_POOLING",
    value:
      "postgres://postgres.nnsbsvyuojhjwwesccsq:uDqT4Pcj2vcSj7Bk@aws-0-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require",
  },
  { key: "POSTGRES_HOST", value: "db.nnsbsvyuojhjwwesccsq.supabase.co" },
  { key: "POSTGRES_USER", value: "postgres" },
  { key: "POSTGRES_PASSWORD", value: "uDqT4Pcj2vcSj7Bk" },
  { key: "POSTGRES_DATABASE", value: "postgres" },

  // Supabase Configuration
  { key: "SUPABASE_URL", value: "https://nnsbsvyuojhjwwesccsq.supabase.co" },
  {
    key: "SUPABASE_ANON_KEY",
    value:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uc2Jzdnl1b2poand3ZXNjY3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMzkyODEsImV4cCI6MjA2MDkxNTI4MX0.hstms4LWaefsmLzY4Y7xeogLjq6Z2lh4ce3Bgv0mDqg",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    value:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uc2Jzdnl1b2poand3ZXNjY3NxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTMzOTI4MSwiZXhwIjoyMDYwOTE1MjgxfQ.HDUOenyUdWCUiIGT7nosL4499LkLm38ABq0OK9OdAEo",
  },
  {
    key: "SUPABASE_JWT_SECRET",
    value: "lL3vV34NkGCybd1l5o0UUNuiBVGp8WzAVBE2tRvpByotevTVvFDyLWWBBB8ZnPx0gRcGeh+zUUPjiJ2Ru/IR8sIjKmJUw==",
  },

  // Email Configuration
  { key: "EMAIL_PROVIDER", value: "resend" },
  { key: "EMAIL_FROM", value: "onboarding@resend.dev" },
  { key: "EMAIL_FROM_NAME", value: "Jobs2Go" },
  { key: "EMAIL_REPLY_TO", value: "help@jobs2go.app" },
  { key: "RESEND_API_KEY", value: "re_ed295arG_EFB5Sp1oahfVKixQZJKXVxz8" },
  { key: "EMAIL_SERVER_HOST", value: "smtp.sendgrid.net" },
  { key: "EMAIL_SERVER_PORT", value: "587" },
  { key: "EMAIL_SERVER_USER", value: "apikey" },
  { key: "EMAIL_SERVER_PASSWORD", value: "re_ed295arG_EFB5Sp1oahfVKixQZJKXVxz8" },
  { key: "EMAIL_SECURE", value: "A6YMGZwjqsYzhkcuDe8T" },
  { key: "EMAIL_USER", value: "A6YMGZwjqsYzhkcuDe8T" },
  { key: "SENDGRID_API_KEY", value: "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" },
  { key: "SENDGRID_WEBHOOK_SIGNING_KEY", value: "your_webhook_signing_key_here" },

  // Google Analytics
  { key: "NEXT_PUBLIC_GA4_MEASUREMENT_ID", value: "G-39HH8HNW2Z" },
  { key: "GA_PROPERTY_ID", value: "489114412" },
  { key: "GA_CLIENT_EMAIL", value: "service-account-name@your-project.iam.gserviceaccount.com" },

  // Sentry
  {
    key: "NEXT_PUBLIC_SENTRY_DSN",
    value: "https://1d2fba7f98ac0b9113e37a395a25f725@o4509283959439360.ingest.de.sentry.io/4509283988996176",
  },

  // BrowserStack
  { key: "BROWSERSTACK_USERNAME", value: "stevenmcauley_Uptsbf" },
  { key: "BROWSERSTACK_ACCESS_KEY", value: "A6YMGZwjqsYzhkcuDe8T" },

  // Security & Alerts
  { key: "CRON_SECRET", value: "Qj7nHd9vP3s5kR2z8xYfU4WmLkVt9b" },
  { key: "ALERT_RECIPIENTS", value: "steve.mcauley1@aol.co.uk" },
  { key: "ALERT_EMAIL_RECIPIENTS", value: "steve.mcauley1@aol.co.uk" },

  // Monitoring
  { key: "SCREENSHOT_DIR", value: "./synthetic-monitoring-results" },
  { key: "SYNTHETIC_HEADLESS", value: "true" },
  { key: "TIMEOUT_NAVIGATION", value: "30000" },
  { key: "TIMEOUT_ELEMENT", value: "10000" },
  { key: "TIMEOUT_ACTION", value: "5000" },
  { key: "TEST_RETRIES", value: "2" },
  { key: "SCHEDULE_ENABLED", value: "true" },
  { key: "SCHEDULE_INTERVAL_MINUTES", value: "15" },
  { key: "RETAIN_SCREENSHOTS", value: "false" },
  { key: "SCREENSHOT_RETENTION_DAYS", value: "7" },
]

function addEnvVarToVercel(key: string, value: string, environment = "production,preview,development") {
  try {
    console.log(`Adding ${key} to Vercel...`)
    execSync(`vercel env add ${key} ${environment}`, {
      input: `${value}\n`,
      stdio: ["pipe", "pipe", "pipe"],
    })
    console.log(`✅ Added ${key}`)
  } catch (error) {
    console.error(`❌ Failed to add ${key}:`, error)
  }
}

function main() {
  console.log("🚀 Setting up environment variables in Vercel...")
  console.log(`📋 Adding ${envVars.length} environment variables...`)

  for (const envVar of envVars) {
    addEnvVarToVercel(envVar.key, envVar.value)
  }

  console.log("\n✅ Environment variables setup complete!")
  console.log("🔄 You may need to redeploy your application for changes to take effect.")
  console.log("💡 Run: vercel --prod")
}

if (require.main === module) {
  main()
}
