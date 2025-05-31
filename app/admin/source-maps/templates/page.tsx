import { TemplateList } from "@/components/error-monitoring/template-list"
import { TemplateImport } from "@/components/error-monitoring/template-import"
import { TemplateBulkExport } from "@/components/error-monitoring/template-bulk-export"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function TemplatesPage() {
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
            <BreadcrumbPage>Templates</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Source Map Cleanup Templates</h1>
          <p className="text-muted-foreground mt-1">Manage templates for source map cleanup schedules</p>
        </div>
        <div className="flex space-x-2">
          <TemplateBulkExport />
          <TemplateImport />
          <Button asChild>
            <Link href="/admin/source-maps/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        </div>
      </div>

      <TemplateList />
    </div>
  )
}
