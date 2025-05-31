import { type NextRequest, NextResponse } from "next/server"
import { getTemplates, createTemplate } from "@/lib/error-monitoring/template-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeBuiltIn = searchParams.get("includeBuiltIn") !== "false"

    const templates = await getTemplates(includeBuiltIn)
    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Add the current user as the creator
    data.createdBy = session.user?.email || "unknown"

    // Add 'custom' tag if not present
    if (!data.tags.includes("custom")) {
      data.tags.push("custom")
    }

    const template = await createTemplate(data)
    return NextResponse.json(template)
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
