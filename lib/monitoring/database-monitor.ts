import { PrismaClient } from "@prisma/client"
import { trackDatabasePerformance } from "./monitoring-service"
import { monitoringConfig } from "./config"

/**
 * Create a Prisma client with query monitoring
 */
export function createMonitoredPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "info",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  })

  // Monitor query performance
  prisma.$on("query", (e: any) => {
    const duration = e.duration
    const query = e.query

    // Track database performance
    trackDatabasePerformance("query", duration, {
      query: query.substring(0, 200), // Truncate long queries
      params: e.params,
    })
  })

  // Monitor database errors
  prisma.$on("error", (e: any) => {
    trackDatabasePerformance("error", 0, {
      message: e.message,
      target: e.target,
    })
  })

  return prisma
}

/**
 * Monitor connection pool usage
 */
export async function monitorConnectionPool(prisma: PrismaClient): Promise<void> {
  try {
    // This is a simplified example - in a real app, you would need to
    // use a more direct way to access connection pool metrics
    const metrics = await (prisma as any).$metrics.prometheus()

    // Parse connection pool metrics
    const connectionPoolMetrics = parseConnectionPoolMetrics(metrics)

    // Determine severity based on thresholds
    let severity: "info" | "warning" | "error" = "info"
    const usage = connectionPoolMetrics.usagePercentage

    if (usage >= monitoringConfig.databaseThresholds.connectionPoolUsage.critical) {
      severity = "error"
    } else if (usage >= monitoringConfig.databaseThresholds.connectionPoolUsage.warning) {
      severity = "warning"
    }

    // Track the metric
    trackDatabasePerformance("connection_pool", 0, {
      ...connectionPoolMetrics,
      severity,
    })
  } catch (error) {
    console.error("Failed to monitor connection pool:", error)
  }
}

/**
 * Parse connection pool metrics from Prometheus format
 */
function parseConnectionPoolMetrics(metricsString: string): {
  active: number
  idle: number
  total: number
  usagePercentage: number
} {
  // This is a simplified example - in a real app, you would need to
  // parse the Prometheus metrics format properly

  // Default values
  const result = {
    active: 0,
    idle: 0,
    total: 0,
    usagePercentage: 0,
  }

  try {
    // Extract active connections
    const activeMatch = metricsString.match(/prisma_client_queries_active\s+(\d+)/)
    if (activeMatch) {
      result.active = Number.parseInt(activeMatch[1], 10)
    }

    // Extract total connections (this is simplified)
    const totalMatch = metricsString.match(/prisma_pool_connections\{state="total"\}\s+(\d+)/)
    if (totalMatch) {
      result.total = Number.parseInt(totalMatch[1], 10)
    }

    // Calculate idle connections
    result.idle = Math.max(0, result.total - result.active)

    // Calculate usage percentage
    if (result.total > 0) {
      result.usagePercentage = (result.active / result.total) * 100
    }
  } catch (error) {
    console.error("Failed to parse connection pool metrics:", error)
  }

  return result
}
