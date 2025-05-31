"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Download } from "lucide-react"

interface TemplateExportProps {
  templateId: string
  templateName?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function TemplateExport({
  templateId,
  templateName,
  variant = "outline",
  size = "default",
}: TemplateExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)

    try {
      const response = await fetch(`/api/admin/source-maps/templates/export?id=${templateId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to export template")
      }

      const exportData = await response.json()

      // Create a downloadable file
      const fileName = `template-${templateName ? templateName.toLowerCase().replace(/\s+/g, "-") : templateId}.json`
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
        title: "Template exported",
        description: `Template "${templateName || templateId}" has been exported successfully.`,
      })
    } catch (error) {
      console.error("Error exporting template:", error)
      toast({
        title: "Export failed",
        description: error.message || "Failed to export template",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={isExporting}>
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Export"}
    </Button>
  )
}
