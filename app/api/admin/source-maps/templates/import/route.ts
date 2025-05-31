import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { importTemplates } from "@/lib/error-monitoring/template-sharing"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!data) {
      return NextResponse.json({ error: "Import data is required" }, { status: 400 })
    }

    const result = await importTemplates(data, session.user?.email)

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Import partially failed",
          details: result,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error importing templates:", error)
    return NextResponse.json({ error: error.message || "Failed to import templates" }, { status: 500 })
  }
}
