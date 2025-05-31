import { type NextRequest, NextResponse } from "next/server"
import { getTemplateById, updateTemplate, deleteTemplate } from "@/lib/error-monitoring/template-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const template = await getTemplateById(params.id)

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const template = await updateTemplate({
      id: params.id,
      ...data,
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error updating template:", error)

    if (error.message === "Cannot update built-in template") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await deleteTemplate(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)

    if (error.message === "Cannot delete built-in template") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}
