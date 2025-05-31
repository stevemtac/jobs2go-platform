import { type NextRequest, NextResponse } from "next/server"
import { duplicateTemplate } from "@/lib/error-monitoring/template-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const template = await duplicateTemplate(params.id, session.user?.email || "unknown")

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error duplicating template:", error)
    return NextResponse.json({ error: "Failed to duplicate template" }, { status: 500 })
  }
}
