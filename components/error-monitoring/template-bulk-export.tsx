"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Template {
  id: string
  name: string
  description?: string
  isBuiltIn: boolean
  tags: string[]
}

interface TemplateBulkExportProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function TemplateBulkExport({ variant = "outline", size = "default" }: TemplateBulkExportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])

  async function loadTemplates() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/source-maps/templates")

      if (!response.ok) {
        throw new Error("Failed to load templates")
      }

      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleDialogOpen(open: boolean) {
    setIsDialogOpen(open)
    if (open) {
      loadTemplates()
    } else {
      setSelectedTemplates([])
    }
  }

  function toggleTemplate(templateId: string) {
    setSelectedTemplates((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId],
    )
  }

  function toggleAll() {
    if (selectedTemplates.length === templates.length) {
      setSelectedTemplates([])
    } else {
      setSelectedTemplates(templates.map((t) => t.id))
    }
  }

  async function handleExport() {
    if (selectedTemplates.length === 0) {
      toast({
        title: "No templates selected",
        description: "Please select at least one template to export",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      const response = await fetch("/api/admin/source-maps/templates/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateIds: selectedTemplates }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to export templates")
      }

      const exportData = await response.json()

      // Create a downloadable file
      const fileName = `source-map-templates-${new Date().toISOString().split("T")[0]}.json`
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Create a link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Templates exported",
        description: `Successfully exported ${selectedTemplates.length} template(s)`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error exporting templates:", error)
      toast({
        title: "Export failed",
        description: error.message || "Failed to export templates",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="mr-2 h-4 w-4" />
          Export Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Templates</DialogTitle>
          <DialogDescription>Select templates to export as a JSON file.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="select-all"
              checked={selectedTemplates.length === templates.length && templates.length > 0}
              onCheckedChange={toggleAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select All
            </label>
            <span className="text-sm text-muted-foreground ml-auto">
              {selectedTemplates.length} of {templates.length} selected
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No templates found</div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted">
                    <Checkbox
                      id={`template-${template.id}`}
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={() => toggleTemplate(template.id)}
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor={`template-${template.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {template.name}
                        {template.isBuiltIn && (
                          <Badge variant="secondary" className="ml-2">
                            Built-in
                          </Badge>
                        )}
                      </label>
                      {template.description && <p className="text-xs text-muted-foreground">{template.description}</p>}
                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedTemplates.length === 0 || isExporting}>
            {isExporting ? "Exporting..." : "Export Selected"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
