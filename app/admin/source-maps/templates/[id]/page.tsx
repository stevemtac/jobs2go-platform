import { TemplateForm } from "@/components/error-monitoring/template-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getTemplateById } from "@/lib/error-monitoring/template-service"
import { notFound } from "next/navigation"

interface EditTemplatePageProps {
  params: {
    id: string
  }
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const template = await getTemplateById(params.id)

  if (!template) {
    notFound()
  }

  // Don't allow editing built-in templates
  if (template.isBuiltIn) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/source-maps">Source Maps</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/source-maps/templates">Templates</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Template</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
        <p className="text-muted-foreground mt-1">Edit your custom template for source map cleanup</p>
      </div>

      <TemplateForm initialData={template} isEditing={true} />
    </div>
  )
}
