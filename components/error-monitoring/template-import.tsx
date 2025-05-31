"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface TemplateImportProps {
  onSuccess?: () => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function TemplateImport({ onSuccess, variant = "default", size = "default" }: TemplateImportProps) {
  const router = useRouter()
  const [isImporting, setIsImporting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (files && files.length > 0) {
      setImportFile(files[0])
      setImportResult(null)
    }
  }

  async function handleImport() {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a template file to import",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      // Read the file
      const fileContent = await importFile.text()
      let importData

      try {
        importData = JSON.parse(fileContent)
      } catch (error) {
        throw new Error("Invalid JSON file")
      }

      // Send to API
      const response = await fetch("/api/admin/source-maps/templates/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(importData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to import templates")
      }

      setImportResult(result)

      if (result.imported > 0) {
        toast({
          title: "Templates imported",
          description: `Successfully imported ${result.imported} template(s)`,
        })

        if (onSuccess) {
          onSuccess()
        }
      }

      if (result.failed > 0) {
        toast({
          title: "Some imports failed",
          description: `${result.failed} template(s) failed to import`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error importing templates:", error)
      toast({
        title: "Import failed",
        description: error.message || "Failed to import templates",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  function resetImport() {
    setImportFile(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open)
    if (!open) {
      resetImport()
    }
  }

  function handleClose() {
    setIsDialogOpen(false)
    resetImport()
    router.refresh()
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Upload className="mr-2 h-4 w-4" />
          Import Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Templates</DialogTitle>
          <DialogDescription>Import source map cleanup templates from a JSON file.</DialogDescription>
        </DialogHeader>

        {importResult ? (
          <div className="space-y-4">
            <Alert variant={importResult.imported > 0 ? "default" : "destructive"}>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Import Results</AlertTitle>
              <AlertDescription>
                Successfully imported {importResult.imported} template(s).
                {importResult.failed > 0 && ` Failed to import ${importResult.failed} template(s).`}
              </AlertDescription>
            </Alert>

            {importResult.errors && importResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {importResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="template-file" className="text-sm font-medium">
                  Template File
                </label>
                <input
                  id="template-file"
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-sm text-muted-foreground">Select a template JSON file to import</p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Imported templates will be added as new templates. This will not overwrite existing templates.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importFile || isImporting}>
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
