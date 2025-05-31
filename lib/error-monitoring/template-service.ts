import { PrismaClient, type CleanupScheduleFrequency } from "@prisma/client"
import { notifySourceMapOperation } from "./source-map-notifications"

const prisma = new PrismaClient()

export type TemplateTag =
  | "daily"
  | "weekly"
  | "monthly"
  | "aggressive"
  | "balanced"
  | "conservative"
  | "development"
  | "production"
  | "recommended"
  | "custom"

export interface TemplateCreateInput {
  name: string
  description?: string
  frequency: CleanupScheduleFrequency
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
  notificationRecipients: string[]
  tags: string[]
  createdBy?: string
}

export interface TemplateUpdateInput extends Partial<TemplateCreateInput> {
  id: string
  changeDescription?: string
}

export async function getTemplates(includeBuiltIn = true) {
  const where = includeBuiltIn ? {} : { isBuiltIn: false }

  return prisma.sourceMapCleanupTemplate.findMany({
    where,
    orderBy: [{ isBuiltIn: "desc" }, { createdAt: "desc" }],
    include: {
      currentVersion: true,
    },
  })
}

export async function getTemplateById(id: string, includeVersions = false) {
  return prisma.sourceMapCleanupTemplate.findUnique({
    where: { id },
    include: {
      currentVersion: true,
      versions: includeVersions
        ? {
            orderBy: {
              versionNumber: "desc",
            },
          }
        : false,
    },
  })
}

export async function createTemplate(data: TemplateCreateInput) {
  // Create the template
  const template = await prisma.sourceMapCleanupTemplate.create({
    data: {
      ...data,
      isBuiltIn: false,
    },
  })

  // Create the initial version
  const version = await prisma.templateVersion.create({
    data: {
      templateId: template.id,
      versionNumber: 1,
      ...data,
      changeDescription: "Initial version",
    },
  })

  // Update the template with the current version
  const updatedTemplate = await prisma.sourceMapCleanupTemplate.update({
    where: { id: template.id },
    data: { currentVersionId: version.id },
    include: {
      currentVersion: true,
    },
  })

  await notifySourceMapOperation({
    operation: "template_created",
    success: true,
    details: {
      templateId: template.id,
      templateName: template.name,
      versionId: version.id,
      versionNumber: 1,
    },
  })

  return updatedTemplate
}

export async function updateTemplate(data: TemplateUpdateInput) {
  const { id, changeDescription, ...updateData } = data

  // Don't allow updating built-in templates
  const existingTemplate = await prisma.sourceMapCleanupTemplate.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: {
          versionNumber: "desc",
        },
        take: 1,
      },
    },
  })

  if (!existingTemplate || existingTemplate.isBuiltIn) {
    throw new Error("Cannot update built-in template")
  }

  // Get the latest version number
  const latestVersion = existingTemplate.versions[0]
  const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1

  // Start a transaction
  return prisma.$transaction(async (tx) => {
    // Create a new version
    const version = await tx.templateVersion.create({
      data: {
        templateId: id,
        versionNumber: newVersionNumber,
        name: updateData.name || existingTemplate.name,
        description: updateData.description ?? existingTemplate.description,
        frequency: updateData.frequency || existingTemplate.frequency,
        dayOfWeek: updateData.dayOfWeek ?? existingTemplate.dayOfWeek,
        dayOfMonth: updateData.dayOfMonth ?? existingTemplate.dayOfMonth,
        hour: updateData.hour ?? existingTemplate.hour,
        minute: updateData.minute ?? existingTemplate.minute,
        retentionDays: updateData.retentionDays ?? existingTemplate.retentionDays,
        minDeploymentsToKeep: updateData.minDeploymentsToKeep ?? existingTemplate.minDeploymentsToKeep,
        dryRun: updateData.dryRun ?? existingTemplate.dryRun,
        storageProvider: updateData.storageProvider ?? existingTemplate.storageProvider,
        notifyOnSuccess: updateData.notifyOnSuccess ?? existingTemplate.notifyOnSuccess,
        notifyOnFailure: updateData.notifyOnFailure ?? existingTemplate.notifyOnFailure,
        notificationRecipients: updateData.notificationRecipients ?? existingTemplate.notificationRecipients,
        tags: updateData.tags ?? existingTemplate.tags,
        changeDescription: changeDescription || "Updated template",
        createdBy: updateData.createdBy,
      },
    })

    // Update the template
    const template = await tx.sourceMapCleanupTemplate.update({
      where: { id },
      data: {
        ...updateData,
        currentVersionId: version.id,
      },
      include: {
        currentVersion: true,
      },
    })

    await notifySourceMapOperation({
      operation: "template_updated",
      success: true,
      details: {
        templateId: template.id,
        templateName: template.name,
        versionId: version.id,
        versionNumber: newVersionNumber,
        changeDescription: changeDescription || "Updated template",
      },
    })

    return template
  })
}

export async function deleteTemplate(id: string) {
  // Don't allow deleting built-in templates
  const existingTemplate = await prisma.sourceMapCleanupTemplate.findUnique({
    where: { id },
  })

  if (!existingTemplate || existingTemplate.isBuiltIn) {
    throw new Error("Cannot delete built-in template")
  }

  const template = await prisma.sourceMapCleanupTemplate.delete({
    where: { id },
  })

  await notifySourceMapOperation({
    operation: "template_deleted",
    success: true,
    details: {
      templateId: template.id,
      templateName: template.name,
    },
  })

  return template
}

export async function duplicateTemplate(id: string, createdBy?: string) {
  const existingTemplate = await prisma.sourceMapCleanupTemplate.findUnique({
    where: { id },
  })

  if (!existingTemplate) {
    throw new Error("Template not found")
  }

  const { id: _, isBuiltIn, createdAt, updatedAt, currentVersionId, ...templateData } = existingTemplate

  const newTemplate = await createTemplate({
    ...templateData,
    name: `Copy of ${templateData.name}`,
    createdBy,
  })

  await notifySourceMapOperation({
    operation: "template_duplicated",
    success: true,
    details: {
      sourceTemplateId: id,
      sourceTemplateName: existingTemplate.name,
      newTemplateId: newTemplate.id,
      newTemplateName: newTemplate.name,
    },
  })

  return newTemplate
}

export async function getTemplatesByTags(tags: string[]) {
  return prisma.sourceMapCleanupTemplate.findMany({
    where: {
      tags: {
        hasSome: tags,
      },
    },
    orderBy: [{ isBuiltIn: "desc" }, { createdAt: "desc" }],
    include: {
      currentVersion: true,
    },
  })
}

export async function searchTemplates(query: string) {
  return prisma.sourceMapCleanupTemplate.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    },
    orderBy: [{ isBuiltIn: "desc" }, { createdAt: "desc" }],
    include: {
      currentVersion: true,
    },
  })
}

export async function getTemplateVersions(templateId: string) {
  return prisma.templateVersion.findMany({
    where: { templateId },
    orderBy: { versionNumber: "desc" },
  })
}

export async function getTemplateVersion(templateId: string, versionNumber: number) {
  return prisma.templateVersion.findUnique({
    where: {
      templateId_versionNumber: {
        templateId,
        versionNumber,
      },
    },
  })
}

export async function restoreTemplateVersion(templateId: string, versionNumber: number, createdBy?: string) {
  // Get the version to restore
  const versionToRestore = await prisma.templateVersion.findUnique({
    where: {
      templateId_versionNumber: {
        templateId,
        versionNumber,
      },
    },
  })

  if (!versionToRestore) {
    throw new Error("Version not found")
  }

  // Get the template
  const template = await prisma.sourceMapCleanupTemplate.findUnique({
    where: { id: templateId },
    include: {
      versions: {
        orderBy: {
          versionNumber: "desc",
        },
        take: 1,
      },
    },
  })

  if (!template) {
    throw new Error("Template not found")
  }

  if (template.isBuiltIn) {
    throw new Error("Cannot restore version for built-in template")
  }

  // Get the latest version number
  const latestVersion = template.versions[0]
  const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1

  // Create a new version based on the one to restore
  const { id: _, versionNumber: __, templateId: ___, ...versionData } = versionToRestore

  // Start a transaction
  return prisma.$transaction(async (tx) => {
    // Create a new version
    const version = await tx.templateVersion.create({
      data: {
        templateId,
        versionNumber: newVersionNumber,
        ...versionData,
        changeDescription: `Restored from version ${versionNumber}`,
        createdBy,
      },
    })

    // Update the template
    const updatedTemplate = await tx.sourceMapCleanupTemplate.update({
      where: { id: templateId },
      data: {
        name: versionData.name,
        description: versionData.description,
        frequency: versionData.frequency,
        dayOfWeek: versionData.dayOfWeek,
        dayOfMonth: versionData.dayOfMonth,
        hour: versionData.hour,
        minute: versionData.minute,
        retentionDays: versionData.retentionDays,
        minDeploymentsToKeep: versionData.minDeploymentsToKeep,
        dryRun: versionData.dryRun,
        storageProvider: versionData.storageProvider,
        notifyOnSuccess: versionData.notifyOnSuccess,
        notifyOnFailure: versionData.notifyOnFailure,
        notificationRecipients: versionData.notificationRecipients,
        tags: versionData.tags,
        currentVersionId: version.id,
      },
      include: {
        currentVersion: true,
      },
    })

    await notifySourceMapOperation({
      operation: "template_version_restored",
      success: true,
      details: {
        templateId,
        templateName: updatedTemplate.name,
        restoredFromVersion: versionNumber,
        newVersionId: version.id,
        newVersionNumber,
      },
    })

    return updatedTemplate
  })
}
