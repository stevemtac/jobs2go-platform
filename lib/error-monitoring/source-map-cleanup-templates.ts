/**
 * Source map cleanup template definitions and management
 */

export interface CleanupTemplate {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "custom"
  tags: string[]
  settings: {
    retentionDays: number
    minVersionsToKeep: number
    dryRun: boolean
    deleteFromStorage: boolean
    deleteFromDatabase: boolean
    cronSchedule: string
    notifyOnCompletion: boolean
    notificationChannels: ("email" | "slack")[]
  }
}

// Predefined templates for common cleanup scenarios
export const CLEANUP_TEMPLATES: CleanupTemplate[] = [
  {
    id: "daily-maintenance",
    name: "Daily Maintenance",
    description: "Daily cleanup that keeps recent source maps for quick debugging.",
    frequency: "daily",
    tags: ["balanced", "recommended"],
    settings: {
      retentionDays: 7,
      minVersionsToKeep: 10,
      dryRun: false,
      deleteFromStorage: true,
      deleteFromDatabase: true,
      cronSchedule: "0 3 * * *", // 3 AM every day
      notifyOnCompletion: true,
      notificationChannels: ["email"],
    },
  },
  {
    id: "weekly-archiving",
    name: "Weekly Archiving",
    description: "Weekly cleanup that balances storage and debugging needs.",
    frequency: "weekly",
    tags: ["balanced", "storage-efficient"],
    settings: {
      retentionDays: 30,
      minVersionsToKeep: 5,
      dryRun: false,
      deleteFromStorage: true,
      deleteFromDatabase: true,
      cronSchedule: "0 2 * * 0", // 2 AM on Sundays
      notifyOnCompletion: true,
      notificationChannels: ["email", "slack"],
    },
  },
  {
    id: "monthly-purging",
    name: "Monthly Purging",
    description: "Monthly aggressive cleanup to free up storage space.",
    frequency: "monthly",
    tags: ["aggressive", "storage-efficient"],
    settings: {
      retentionDays: 90,
      minVersionsToKeep: 3,
      dryRun: false,
      deleteFromStorage: true,
      deleteFromDatabase: true,
      cronSchedule: "0 1 1 * *", // 1 AM on the 1st of each month
      notifyOnCompletion: true,
      notificationChannels: ["email", "slack"],
    },
  },
  {
    id: "development-environment",
    name: "Development Environment",
    description: "Aggressive daily cleanup for development environments.",
    frequency: "daily",
    tags: ["aggressive", "development"],
    settings: {
      retentionDays: 3,
      minVersionsToKeep: 3,
      dryRun: false,
      deleteFromStorage: true,
      deleteFromDatabase: true,
      cronSchedule: "0 1 * * *", // 1 AM every day
      notifyOnCompletion: true,
      notificationChannels: ["email"],
    },
  },
  {
    id: "production-environment",
    name: "Production Environment",
    description: "Conservative weekly cleanup for production environments.",
    frequency: "weekly",
    tags: ["conservative", "production"],
    settings: {
      retentionDays: 60,
      minVersionsToKeep: 10,
      dryRun: false,
      deleteFromStorage: true,
      deleteFromDatabase: true,
      cronSchedule: "0 4 * * 6", // 4 AM on Saturdays
      notifyOnCompletion: true,
      notificationChannels: ["email", "slack"],
    },
  },
  {
    id: "dry-run-testing",
    name: "Dry Run Testing",
    description: "Test cleanup without deleting files (for validation).",
    frequency: "custom",
    tags: ["testing", "safe"],
    settings: {
      retentionDays: 30,
      minVersionsToKeep: 5,
      dryRun: true,
      deleteFromStorage: false,
      deleteFromDatabase: false,
      cronSchedule: "0 12 * * *", // Noon every day
      notifyOnCompletion: true,
      notificationChannels: ["email"],
    },
  },
  {
    id: "emergency-cleanup",
    name: "Emergency Cleanup",
    description: "Aggressive cleanup when storage is critically low.",
    frequency: "custom",
    tags: ["aggressive", "emergency"],
    settings: {
      retentionDays: 1,
      minVersionsToKeep: 2,
      dryRun: false,
      deleteFromStorage: true,
      deleteFromDatabase: true,
      cronSchedule: "0 * * * *", // Every hour (you would typically run this manually)
      notifyOnCompletion: true,
      notificationChannels: ["email", "slack"],
    },
  },
]

/**
 * Get all available cleanup templates
 */
export function getAllTemplates(): CleanupTemplate[] {
  return CLEANUP_TEMPLATES
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): CleanupTemplate | undefined {
  return CLEANUP_TEMPLATES.find((template) => template.id === id)
}

/**
 * Filter templates by frequency
 */
export function getTemplatesByFrequency(frequency: string): CleanupTemplate[] {
  return CLEANUP_TEMPLATES.filter((template) => template.frequency === frequency)
}

/**
 * Filter templates by tag
 */
export function getTemplatesByTag(tag: string): CleanupTemplate[] {
  return CLEANUP_TEMPLATES.filter((template) => template.tags.includes(tag))
}

/**
 * Search templates by name or description
 */
export function searchTemplates(query: string): CleanupTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return CLEANUP_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery),
  )
}

/**
 * Get all unique template tags
 */
export function getAllTemplateTags(): string[] {
  const tags = new Set<string>()
  CLEANUP_TEMPLATES.forEach((template) => {
    template.tags.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags)
}

/**
 * Get all unique template frequencies
 */
export function getAllTemplateFrequencies(): string[] {
  const frequencies = new Set<string>()
  CLEANUP_TEMPLATES.forEach((template) => {
    frequencies.add(template.frequency)
  })
  return Array.from(frequencies)
}
