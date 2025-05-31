import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { hasPermission } from "@/lib/auth/permissions"

// Schema for validation
const scheduleSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  retentionDays: z.number().int().min(1),
  minVersionsToKeep: z.number().int().min(1),
  cronSchedule: z.string().min(9),
  dryRun: z.boolean(),
  deleteFromStorage: z.boolean(),
  deleteFromDatabase: z.boolean(),
  notifyOnCompletion: z.boolean(),
  notificationChannels: z.array(z.string()),
  templateId: z.string().optional(),
  isActive: z.boolean(),
})

// GET handler to fetch all cleanup schedules
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session, "source_maps:read")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const schedules = await prisma.sourceMapCleanupSchedule.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error("Error fetching cleanup schedules:", error)
    return NextResponse.json({ message: "Failed to fetch cleanup schedules" }, { status: 500 })
  }
}

// POST handler to create a new cleanup schedule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session, "source_maps:write")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()

    // Validate the request data
    const validatedData = scheduleSchema.parse(data)

    // Create the cleanup schedule
    const schedule = await prisma.sourceMapCleanupSchedule.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || "",
        retentionDays: validatedData.retentionDays,
        minVersionsToKeep: validatedData.minVersionsToKeep,
        cronSchedule: validatedData.cronSchedule,
        dryRun: validatedData.dryRun,
        deleteFromStorage: validatedData.deleteFromStorage,
        deleteFromDatabase: validatedData.deleteFromDatabase,
        notifyOnCompletion: validatedData.notifyOnCompletion,
        notificationChannels: validatedData.notificationChannels,
        templateId: validatedData.templateId || null,
        isActive: validatedData.isActive,
        createdBy: session.user?.email || "system",
      },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error("Error creating cleanup schedule:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }

    return NextResponse.json({ message: "Failed to create cleanup schedule" }, { status: 500 })
  }
}
