import { z } from "zod"
import { getTemplateById, createTemplate, type TemplateCreateInput } from "./template-service"
import { notifySourceMapOperation } from "./source-map-notifications"

// Schema for validating imported templates
export const templateImportSchema = z.object({
  version: z.string(),
  templates: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
      dayOfWeek: z.number().min(0).max(6).optional().nullable(),
      dayOfMonth: z.number().min(1).max(31).optional().nullable(),
      hour: z.number().min(0).max(23),
      minute: z.number().min(0).max(59),
      retentionDays: z.number().min(1),
      minDeploymentsToKeep: z.number().min(1),
      dryRun: z.boolean(),
      storageProvider: z.string(),
      notifyOnSuccess: z.boolean(),
      notifyOnFailure: z.boolean(),
      notificationRecipients: z.array(z.string()).optional(),
      tags: z.array(z.string()),
      metadata: z.record(z.string(), z.any()).optional(),
    }),
  ),
  metadata: z.record(z.string(), z.any()).optional(),
})

export type TemplateExport = z.infer<typeof templateImportSchema>

export async function exportTemplate(templateId: string): Promise<TemplateExport> {
  const template = await getTemplateById(templateId)

  if (!template) {
    throw new Error("Template not found")
  }

  // Remove internal fields that shouldn't be exported
  const { id, isBuiltIn, createdAt, updatedAt, createdBy, ...exportableTemplate } = template

  return {
    version: "1.0.0",
    templates: [exportableTemplate],
    metadata: {
      exportedAt: new Date().toISOString(),
      source: process.env.NEXT_PUBLIC_APP_URL || "unknown",
      environment: process.env.NODE_ENV || "development",
    },
  }
}

export async function exportMultipleTemplates(templateIds: string[]): Promise<TemplateExport> {
  const templates = []

  for (const id of templateIds) {
    const template = await getTemplateById(id)
    if (template) {
      // Remove internal fields
      const { id, isBuiltIn, createdAt, updatedAt, createdBy, ...exportableTemplate } = template

      templates.push(exportableTemplate)
    }
  }

  return {
    version: "1.0.0",
    templates,
    metadata: {
      exportedAt: new Date().toISOString(),
      source: process.env.NEXT_PUBLIC_APP_URL || "unknown",
      environment: process.env.NODE_ENV || "development",
      count: templates.length,
    },
  }
}

export interface ImportResult {
  success: boolean
  imported: number
  failed: number
  newTemplateIds: string[]
  errors: string[]
}

export async function importTemplates(data: unknown, createdBy?: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: 0,
    failed: 0,
    newTemplateIds: [],
    errors: [],
  }

  try {
    // Validate the import data
    const validationResult = templateImportSchema.safeParse(data)

    if (!validationResult.success) {
      result.errors.push("Invalid template format")
      return result
    }

    const importData = validationResult.data

    // Import each template
    for (const templateData of importData.templates) {
      try {
        // Prepare the template data for creation
        const createData: TemplateCreateInput = {
          ...templateData,
          createdBy,
        }

        // Create the template
        const newTemplate = await createTemplate(createData)

        result.imported++
        result.newTemplateIds.push(newTemplate.id)
      } catch (error) {
        result.failed++
        result.errors.push(`Failed to import template "${templateData.name}": ${error.message}`)
      }
    }

    result.success = result.imported > 0

    // Log the import operation
    await notifySourceMapOperation({
      operation: "templates_imported",
      success: result.success,
      details: {
        imported: result.imported,
        failed: result.failed,
        source: importData.metadata?.source || "unknown",
        sourceEnvironment: importData.metadata?.environment || "unknown",
      },
    })

    return result
  } catch (error) {
    result.errors.push(`Import failed: ${error.message}`)
    return result
  }
}
