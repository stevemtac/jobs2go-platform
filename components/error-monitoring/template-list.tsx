"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Search, Tag, AlertCircle } from "lucide-react"
import { TemplateCard } from "./template-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Template {
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
  storageProvider: string
  notifyOnSuccess: boolean
  notifyOnFailure: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/source-maps/templates")
      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function duplicateTemplate(id: string) {
    try {
      const response = await fetch(`/api/admin/source-maps/templates/${id}/duplicate`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to duplicate template")
      }

      const data = await response.json()

      toast({
        title: "Template duplicated",
        description: `Template "${data.name}" has been created`,
      })

      fetchTemplates()
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      })
    }
  }

  async function deleteTemplate(id: string) {
    try {
      const response = await fetch(`/api/admin/source-maps/templates/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete template")
      }

      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully",
      })

      fetchTemplates()
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  function handleDeleteClick(template: Template) {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  function confirmDelete() {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id)
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Filter templates based on search query, active tab, and selected tags
  const filteredTemplates = templates.filter((template) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "builtin" && template.isBuiltIn) ||
      (activeTab === "custom" && !template.isBuiltIn)

    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => template.tags.includes(tag))

    return matchesSearch && matchesTab && matchesTags
  })

  // Get all unique tags from templates
  const allTags = Array.from(new Set(templates.flatMap((template) => template.tags))).sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="builtin">Built-in</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery || selectedTags.length > 0
              ? "Try adjusting your search or filters"
              : "Create a new template to get started"}
          </p>
          {(searchQuery || selectedTags.length > 0) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("")
                setSelectedTags([])
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDuplicate={duplicateTemplate}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{templateToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
