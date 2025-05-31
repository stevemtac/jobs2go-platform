import { type NextRequest, NextResponse } from "next/server"
import { trackError } from "./monitoring-service"

/**
 * Global error handler for API routes
 */
export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      // Track the error
      trackError("API route error", error instanceof Error ? error : new Error(String(error)), {
        url: req.url,
        method: req.method,
      })

      // Return an error response
      return NextResponse.json(
        {
          error: "Internal Server Error",
          message:
            process.env.NODE_ENV === "development"
              ? error instanceof Error
                ? error.message
                : String(error)
              : "An unexpected error occurred",
        },
        { status: 500 },
      )
    }
  }
}
