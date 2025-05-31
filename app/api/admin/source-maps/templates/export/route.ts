import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { exportTemplate, exportMultipleTemplates } from "@/lib/error-monitoring/template-sharing"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const templateId = searchParams.get("id")

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 })
    }

    const exportData = await exportTemplate(templateId)

    return NextResponse.json(exportData)
  } catch (error) {
    console.error("Error exporting template:", error)
    return NextResponse.json({ error: error.message || "Failed to export template" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!data.templateIds || !Array.isArray(data.templateIds) || data.templateIds.length === 0) {
      return NextResponse.json({ error: "Template IDs are required" }, { status: 400 })
    }

    const exportData = await exportMultipleTemplates(data.templateIds)

    return NextResponse.json(exportData)
  } catch (error) {
    console.error("Error exporting templates:", error)
    return NextResponse.json({ error: error.message || "Failed to export templates" }, { status: 500 })
  }
}
