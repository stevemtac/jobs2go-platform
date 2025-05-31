import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { trackPerformance } from "@/lib/monitoring/monitoring-service"
import { monitoringConfig } from "@/lib/monitoring/config"

/**
 * Middleware for monitoring API performance
 */
export function monitoringMiddleware(req: NextRequest) {
  // Apply API sampling
  if (Math.random() * 100 > monitoringConfig.sampling.apiSampling) {
    return NextResponse.next()
  }

  // Generate a unique request ID
  const requestId = uuidv4()

  // Record start time
  const startTime = Date.now()

  // Add request ID to headers
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-request-id", requestId)

  // Get the response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add response handler to measure performance after response is sent
  response.headers.set("x-request-id", requestId)

  // We can't directly measure the response time in middleware,
  // but we can log the start of the request and then measure in the API route

  // Store the start time in a header for the API route to use
  response.headers.set("x-request-start-time", startTime.toString())

  return response
}

/**
 * Helper function to measure API performance at the end of an API route
 */
export function measureApiPerformance(req: NextRequest, path: string) {
  const startTimeHeader = req.headers.get("x-request-start-time")
  if (!startTimeHeader) return

  const startTime = Number.parseInt(startTimeHeader, 10)
  const endTime = Date.now()
  const duration = endTime - startTime

  const requestId = req.headers.get("x-request-id") || undefined

  // Determine severity based on thresholds
  let severity: "info" | "warning" | "error" = "info"

  if (duration >= monitoringConfig.performanceThresholds.apiResponse.critical) {
    severity = "error"
  } else if (duration >= monitoringConfig.performanceThresholds.apiResponse.warning) {
    severity = "warning"
  }

  // Track the performance metric
  trackPerformance("api_response_time", duration, {
    path,
    requestId,
    method: req.method,
    severity,
  })
}
