"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Calendar, Tag, Search, ArrowRight, Info, CheckCircle } from "lucide-react"
import {
  getAllTemplates,
  searchTemplates,
  getAllTemplateTags,
  getAllTemplateFrequencies,
  type CleanupTemplate,
} from "@/lib/error-monitoring/source-map-cleanup-templates"

export function CleanupTemplateSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [templates, setTemplates] = useState<CleanupTemplate[]>(getAllTemplates())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFrequency, setSelectedFrequency] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<CleanupTemplate | null>(null)

  const allTags = getAllTemplateTags()
  const allFrequencies = getAllTemplateFrequencies()

  // Handle initial template selection from URL if provided
  useEffect(() => {
    const templateId = searchParams.get("template")
    if (templateId) {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        setSelectedTemplate(template)
      }
    }
  }, [searchParams])

  // Filter templates based on search, frequency, and tag
  useEffect(() => {
    let filteredTemplates = getAllTemplates()

    if (searchQuery) {
      filteredTemplates = searchTemplates(searchQuery)
    }

    if (selectedFrequency && selectedFrequency !== "all") {
      filteredTemplates = filteredTemplates.filter((template) => template.frequency === selectedFrequency)
    }

    if (selectedTag) {
      filteredTemplates = filteredTemplates.filter((template) => template.tags.includes(selectedTag))
    }

    setTemplates(filteredTemplates)
  }, [searchQuery, selectedFrequency, selectedTag])

  // Handle template selection
  const handleSelectTemplate = (template: CleanupTemplate) => {
    setSelectedTemplate(template)
  }

  // Handle using the selected template
  const handleUseTemplate = () => {
    if (selectedTemplate) {
      router.push(`/admin/source-maps/cleanup-schedules/new?template=${selectedTemplate.id}`)
    }
  }

  // Handle clearing the selected template
  const handleClearSelection = () => {
    setSelectedTemplate(null)
  }

  // Format cron schedule to human-readable text
  const formatCronSchedule = (cronSchedule: string) => {
    const parts = cronSchedule.split(" ")

    // Simple cases
    if (cronSchedule === "0 3 * * *") return "Daily at 3 AM"
    if (cronSchedule === "0 2 * * 0") return "Weekly on Sundays at 2 AM"
    if (cronSchedule === "0 1 1 * *") return "Monthly on the 1st at 1 AM"

    // Default case - just return the cron schedule
    return cronSchedule
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search Templates
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          {selectedTag && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {selectedTag}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setSelectedTag(null)}>
                ×
              </Button>
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" value={selectedFrequency} onValueChange={setSelectedFrequency}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No templates found matching your criteria.
          </div>
        ) : (
          templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate?.id === template.id ? "ring-2 ring-primary" : "hover:shadow-md"
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {selectedTemplate?.id === template.id && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTag(tag)
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatCronSchedule(template.settings.cronSchedule)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Keeps {template.settings.retentionDays} days, min {template.settings.minVersionsToKeep} versions
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedTemplate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Selected Template: {selectedTemplate.name}</CardTitle>
            <CardDescription>{selectedTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Cleanup Settings</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Retention period: {selectedTemplate.settings.retentionDays} days</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span>Minimum versions to keep: {selectedTemplate.settings.minVersionsToKeep}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Schedule: {formatCronSchedule(selectedTemplate.settings.cronSchedule)}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Additional Settings</h4>
                <ul className="space-y-2 text-sm">
                  <li>Dry run: {selectedTemplate.settings.dryRun ? "Yes" : "No"}</li>
                  <li>Delete from storage: {selectedTemplate.settings.deleteFromStorage ? "Yes" : "No"}</li>
                  <li>Delete from database: {selectedTemplate.settings.deleteFromDatabase ? "Yes" : "No"}</li>
                  <li>Notify on completion: {selectedTemplate.settings.notifyOnCompletion ? "Yes" : "No"}</li>
                  <li>Notification channels: {selectedTemplate.settings.notificationChannels.join(", ")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleClearSelection}>
              Clear Selection
            </Button>
            <Button onClick={handleUseTemplate}>
              Use {selectedTemplate.name} Template
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
