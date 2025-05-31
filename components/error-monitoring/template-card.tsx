"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TemplateExport } from "./template-export"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Clock, Copy, Edit, MoreHorizontal, Trash2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface TemplateCardProps {
  template: {
    id: string
    name: string
    description?: string
    isBuiltIn: boolean
    frequency: string
    dayOfWeek?: number
    dayOfMonth?: number
    hour: number
    minute: number
    retentionDays: number
    minDeploymentsToKeep: number
    dryRun: boolean
    tags: string[]
  }
  onDuplicate: (id: string) => void
  onDelete: (template: any) => void
}

export function TemplateCard({ template, onDuplicate, onDelete }: TemplateCardProps) {
  const router = useRouter()

  function getFrequencyText(template: any) {
    switch (template.frequency) {
      case "DAILY":
        return "Daily"
      case "WEEKLY":
        return `Weekly (${getDayOfWeekName(template.dayOfWeek || 0)})`
      case "MONTHLY":
        return `Monthly (Day ${template.dayOfMonth})`
      default:
        return template.frequency
    }
  }

  function getDayOfWeekName(day: number) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[day]
  }

  function getTimeText(hour: number, minute: number) {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} UTC`
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {template.name}
              {template.dryRun && (
                <Badge variant="outline" className="ml-2">
                  Dry Run
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">{template.description || "No description provided"}</CardDescription>
          </div>

          {!template.isBuiltIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/admin/source-maps/templates/${template.id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(template)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {template.isBuiltIn && <Badge variant="secondary">Built-in</Badge>}
          {template.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{getFrequencyText(template)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{getTimeText(template.hour, template.minute)}</span>
          </div>
          <div className="flex items-center">
            <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              Keep {template.retentionDays} days / {template.minDeploymentsToKeep} deployments
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <TemplateExport templateId={template.id} templateName={template.name} variant="outline" size="sm" />
        <Button
          variant="default"
          size="sm"
          onClick={() => router.push(`/admin/source-maps/cleanup-schedules/new?templateId=${template.id}`)}
        >
          Use Template
        </Button>
      </CardFooter>
    </Card>
  )
}
