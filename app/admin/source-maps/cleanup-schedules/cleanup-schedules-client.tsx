"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CleanupScheduleList } from "@/components/error-monitoring/cleanup-schedule-list"
import { Plus, LayoutTemplateIcon as Template } from "lucide-react"

export default function CleanupSchedulesClient() {
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
            <BreadcrumbPage>Cleanup Schedules</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Source Map Cleanup Schedules</h1>
          <p className="text-muted-foreground mt-1">Manage scheduled cleanup of source maps to optimize storage</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/admin/source-maps/cleanup-schedules/templates">
              <Template className="mr-2 h-4 w-4" />
              Use Template
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/source-maps/cleanup-schedules/new">
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Link>
          </Button>
        </div>
      </div>

      <CleanupScheduleList />
    </div>
  )
}
