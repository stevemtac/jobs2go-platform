import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/auth/permissions"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { CleanupScheduleList } from "@/components/error-monitoring/cleanup-schedule-list"
import { notifySourceMapOperation } from "@/lib/error-monitoring/source-map-notifications"

/**
 * Health check endpoint to verify that all required exports are available
 * This endpoint will return 200 OK if all exports are available and working
 */
export async function GET() {
  try {
    // Verify that all exports are available by referencing them
    const exportsCheck = {
      prisma: typeof prisma === "object",
      hasPermission: typeof hasPermission === "function",
      authOptions: typeof authOptions === "object",
      CleanupScheduleList: typeof CleanupScheduleList === "function",
      notifySourceMapOperation: typeof notifySourceMapOperation === "function",
    }

    // Check if any exports are missing
    const missingExports = Object.entries(exportsCheck)
      .filter(([_, available]) => !available)
      .map(([name]) => name)

    if (missingExports.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing exports detected",
          missingExports,
        },
        { status: 500 },
      )
    }

    // All exports are available
    return NextResponse.json(
      {
        status: "ok",
        message: "All required exports are available",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
