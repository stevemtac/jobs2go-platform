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
import { CleanupTemplateSelector } from "@/components/error-monitoring/cleanup-template-selector"
import { ArrowLeft } from "lucide-react"

export default function CleanupTemplatesClient() {
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
            <BreadcrumbLink href="/admin/source-maps/cleanup-schedules">Cleanup Schedules</BreadcrumbLink>
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
          <p className="text-muted-foreground mt-1">
            Select a predefined template to quickly set up a cleanup schedule
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/source-maps/cleanup-schedules">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schedules
          </Link>
        </Button>
      </div>

      <CleanupTemplateSelector />
    </div>
  )
}
