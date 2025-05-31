#!/usr/bin/env node
/**
 * Setup monitoring for the Jobs2go platform
 *
 * This script sets up monitoring infrastructure and configures alerts
 */

import fs from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client"

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
}

console.log(`${colors.cyan}${colors.bold}Setting up monitoring for Jobs2go platform...${colors.reset}\n`)

// Check if required environment variables are set
const requiredEnvVars = ["SLACK_WEBHOOK_URL", "ALERT_EMAIL_RECIPIENTS"]

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.log(`${colors.yellow}${colors.bold}Warning: Some environment variables are missing:${colors.reset}`)
  missingEnvVars.forEach((envVar) => {
    console.log(`${colors.yellow}  - ${envVar}${colors.reset}`)
  })
  console.log(
    `\n${colors.yellow}You can still proceed, but some monitoring features may not work correctly.${colors.reset}\n`,
  )
}

// Create monitoring database tables
console.log(`${colors.blue}Setting up database tables for monitoring...${colors.reset}`)

try {
  // Create a migration for monitoring tables
  const migrationDir = path.join(process.cwd(), "prisma/migrations/monitoring-setup")

  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true })
  }

  // Write migration SQL
  const migrationSql = `
-- CreateEnum
CREATE TYPE "MonitoringSeverity" AS ENUM ('info', 'warning', 'error', 'critical');

-- CreateEnum
CREATE TYPE "MonitoringCategory" AS ENUM ('performance', 'error', 'security', 'database', 'business', 'system');

-- CreateTable
CREATE TABLE "MonitoringEvent" (
    "id" TEXT NOT NULL,
    "category" "MonitoringCategory" NOT NULL,
    "severity" "MonitoringSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "requestId" TEXT,

    CONSTRAINT "MonitoringEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringAlert" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "category" "MonitoringCategory" NOT NULL,
    "severity" "MonitoringSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "MonitoringAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringEvent_category_idx" ON "MonitoringEvent"("category");

-- CreateIndex
CREATE INDEX "MonitoringEvent_severity_idx" ON "MonitoringEvent"("severity");

-- CreateIndex
CREATE INDEX "MonitoringEvent_timestamp_idx" ON "MonitoringEvent"("timestamp");

-- CreateIndex
CREATE INDEX "MonitoringEvent_userId_idx" ON "MonitoringEvent"("userId");

-- CreateIndex
CREATE INDEX "MonitoringAlert_category_idx" ON "MonitoringAlert"("category");

-- CreateIndex
CREATE INDEX "MonitoringAlert_severity_idx" ON "MonitoringAlert"("severity");

-- CreateIndex
CREATE INDEX "MonitoringAlert_timestamp_idx" ON "MonitoringAlert"("timestamp");

-- CreateIndex
CREATE INDEX "MonitoringAlert_acknowledged_idx" ON "MonitoringAlert"("acknowledged");

-- CreateIndex
CREATE INDEX "MonitoringAlert_resolved_idx" ON "MonitoringAlert"("resolved");

-- AddForeignKey
ALTER TABLE "MonitoringAlert" ADD CONSTRAINT "MonitoringAlert_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "MonitoringEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  `

  fs.writeFileSync(path.join(migrationDir, "migration.sql"), migrationSql)

  // Apply the migration
  console.log(`${colors.blue}Applying database migration...${colors.reset}`)

  // This is a simplified example - in a real app, you would use Prisma's migration system
  const prisma = new PrismaClient()

  try {
    // Execute the migration SQL
    await prisma.$executeRawUnsafe(migrationSql)
    console.log(`${colors.green}Database tables created successfully.${colors.reset}`)
  } catch (error) {
    console.error(`${colors.red}Failed to create database tables:${colors.reset}`, error)
  } finally {
    await prisma.$disconnect()
  }
} catch (error) {
  console.error(`${colors.red}Failed to set up database tables:${colors.reset}`, error)
}

// Set up cron job for monitoring health checks
console.log(`\n${colors.blue}Setting up health check cron job...${colors.reset}`)

try {
  // Create a cron job script
  const cronScript = `
#!/bin/bash

# Health check cron job for Jobs2go platform
# This script runs every 5 minutes to check the health of the application

# Get the current timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Make a request to the health check endpoint
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://your-app-url.com/api/monitoring/health)

# Check if the response is 200
if [ "$RESPONSE" -eq 200 ]; then
  echo "[$TIMESTAMP] Health check passed"
else
  echo "[$TIMESTAMP] Health check failed with status code $RESPONSE"
  
  # Send an alert
  curl -X POST -H "Content-Type: application/json" \\
    -d '{"text": "⚠️ Health check failed with status code '$RESPONSE'"}' \\
    $SLACK_WEBHOOK_URL
fi
  `

  const cronScriptPath = path.join(process.cwd(), "scripts/health-check.sh")
  fs.writeFileSync(cronScriptPath, cronScript)
  fs.chmodSync(cronScriptPath, "755")

  console.log(`${colors.green}Health check script created at ${cronScriptPath}${colors.reset}`)
  console.log(`${colors.yellow}To set up the cron job, run:${colors.reset}`)
  console.log(`${colors.yellow}  crontab -e${colors.reset}`)
  console.log(`${colors.yellow}And add the following line:${colors.reset}`)
  console.log(`${colors.yellow}  */5 * * * * ${cronScriptPath}${colors.reset}`)
} catch (error) {
  console.error(`${colors.red}Failed to set up health check cron job:${colors.reset}`, error)
}

// Set up monitoring in the application
console.log(`\n${colors.blue}Setting up monitoring in the application...${colors.reset}`)

try {
  // Update _app.tsx to include web vitals reporting
  const appFilePath = path.join(process.cwd(), "app/layout.tsx")

  if (fs.existsSync(appFilePath)) {
    let appContent = fs.readFileSync(appFilePath, "utf8")

    // Check if web vitals reporting is already set up
    if (!appContent.includes("reportWebVitals")) {
      console.log(`${colors.blue}Adding web vitals reporting to app/layout.tsx...${colors.reset}`)

      // Add the import
      if (!appContent.includes("import { reportWebVitals }")) {
        appContent = `import { reportWebVitals } from '@/lib/monitoring/web-vitals';\n${appContent}`
      }

      // Add the export
      if (!appContent.includes("export { reportWebVitals }")) {
        // Find the last export statement
        const lastExportIndex = appContent.lastIndexOf("export")

        if (lastExportIndex !== -1) {
          // Insert after the last export statement
          const insertIndex = appContent.indexOf("\n", lastExportIndex) + 1
          appContent =
            appContent.slice(0, insertIndex) + "\nexport { reportWebVitals };\n" + appContent.slice(insertIndex)
        } else {
          // Add at the end of the file
          appContent += "\n\nexport { reportWebVitals };\n"
        }
      }

      // Write the updated content
      fs.writeFileSync(appFilePath, appContent)
      console.log(`${colors.green}Web vitals reporting added to app/layout.tsx${colors.reset}`)
    } else {
      console.log(`${colors.green}Web vitals reporting is already set up in app/layout.tsx${colors.reset}`)
    }
  } else {
    console.log(`${colors.yellow}app/layout.tsx not found. Skipping web vitals setup.${colors.reset}`)
  }

  // Add ClientErrorMonitor to layout
  if (fs.existsSync(appFilePath)) {
    let appContent = fs.readFileSync(appFilePath, "utf8")

    // Check if ClientErrorMonitor is already set up
    if (!appContent.includes("ClientErrorMonitor")) {
      console.log(`${colors.blue}Adding ClientErrorMonitor to app/layout.tsx...${colors.reset}`)

      // Add the import
      if (!appContent.includes("import { ClientErrorMonitor }")) {
        appContent = `import { ClientErrorMonitor } from '@/components/monitoring/client-error-monitor';\n${appContent}`
      }

      // Add the component to the layout
      const bodyEndIndex = appContent.lastIndexOf("</body>")

      if (bodyEndIndex !== -1) {
        // Insert before the closing body tag
        appContent =
          appContent.slice(0, bodyEndIndex) + "        <ClientErrorMonitor />\n      " + appContent.slice(bodyEndIndex)
      }

      // Write the updated content
      fs.writeFileSync(appFilePath, appContent)
      console.log(`${colors.green}ClientErrorMonitor added to app/layout.tsx${colors.reset}`)
    } else {
      console.log(`${colors.green}ClientErrorMonitor is already set up in app/layout.tsx${colors.reset}`)
    }
  }
} catch (error) {
  console.error(`${colors.red}Failed to set up monitoring in the application:${colors.reset}`, error)
}

// Set up middleware
console.log(`\n${colors.blue}Setting up monitoring middleware...${colors.reset}`)

try {
  const middlewarePath = path.join(process.cwd(), "middleware.ts")

  // Check if middleware file exists
  if (fs.existsSync(middlewarePath)) {
    let middlewareContent = fs.readFileSync(middlewarePath, "utf8")

    // Check if monitoring middleware is already set up
    if (!middlewareContent.includes("monitoringMiddleware")) {
      console.log(`${colors.blue}Adding monitoring middleware to middleware.ts...${colors.reset}`)

      // Add the import
      if (!middlewareContent.includes("import { monitoringMiddleware }")) {
        middlewareContent = `import { monitoringMiddleware } from '@/middleware/monitoring-middleware';\n${middlewareContent}`
      }

      // Add the middleware to the chain
      if (middlewareContent.includes("export default")) {
        // Replace the export with a chain that includes monitoring
        middlewareContent = middlewareContent.replace(
          /export default\s+([^;]+)/,
          "export default function middleware(req) {\n" +
            "  // Apply monitoring middleware\n" +
            "  const monitoringResponse = monitoringMiddleware(req);\n" +
            "  if (monitoringResponse.status !== 200) return monitoringResponse;\n\n" +
            "  // Apply other middleware\n" +
            "  return $1(req);\n" +
            "}",
        )
      } else {
        // Create a new middleware function
        middlewareContent +=
          "\n\nexport default function middleware(req) {\n" + "  return monitoringMiddleware(req);\n" + "}\n"
      }

      // Write the updated content
      fs.writeFileSync(middlewarePath, middlewareContent)
      console.log(`${colors.green}Monitoring middleware added to middleware.ts${colors.reset}`)
    } else {
      console.log(`${colors.green}Monitoring middleware is already set up in middleware.ts${colors.reset}`)
    }
  } else {
    // Create a new middleware file
    console.log(`${colors.blue}Creating new middleware.ts file with monitoring...${colors.reset}`)

    const newMiddlewareContent = `import { NextResponse } from 'next/server';
import { monitoringMiddleware } from '@/middleware/monitoring-middleware';

export default function middleware(req) {
  return monitoringMiddleware(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
`

    fs.writeFileSync(middlewarePath, newMiddlewareContent)
    console.log(`${colors.green}Created new middleware.ts with monitoring${colors.reset}`)
  }
} catch (error) {
  console.error(`${colors.red}Failed to set up monitoring middleware:${colors.reset}`, error)
}

// Final instructions
console.log(`\n${colors.green}${colors.bold}Monitoring setup complete!${colors.reset}`)
console.log(`\n${colors.cyan}Next steps:${colors.reset}`)
console.log(`${colors.cyan}1. Make sure all required environment variables are set${colors.reset}`)
console.log(`${colors.cyan}2. Set up the health check cron job${colors.reset}`)
console.log(`${colors.cyan}3. Deploy your application to apply the changes${colors.reset}`)
console.log(`${colors.cyan}4. Visit /admin/monitoring to view your monitoring dashboard${colors.reset}`)
