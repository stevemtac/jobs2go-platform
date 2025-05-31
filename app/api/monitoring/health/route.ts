import { type NextRequest, NextResponse } from "next/server"
import { withErrorHandling } from "@/lib/monitoring/api-error-handler"
import { prisma } from "@/lib/prisma"

/**
 * Health check endpoint
 */
async function handler(req: NextRequest) {
  // Check database connection
  let databaseStatus = "unknown"
  let databaseLatency = 0

  try {
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    databaseLatency = Date.now() - startTime
    databaseStatus = "connected"
  } catch (error) {
    databaseStatus = "error"
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage()

  // Return health status
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
    environment: process.env.NODE_ENV,
    database: {
      status: databaseStatus,
      latency: databaseLatency,
    },
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
    },
    uptime: Math.round(process.uptime()),
  })
}

export const GET = withErrorHandling(handler)
