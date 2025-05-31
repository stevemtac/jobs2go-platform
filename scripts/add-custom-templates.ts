import { PrismaClient } from "@prisma/client"
import path from "path"
import fs from "fs"

async function main() {
  console.log("Adding custom templates to the database...")

  try {
    // Run the migration
    const migrationPath = path.join(__dirname, "../prisma/migrations/add-custom-templates/migration.sql")
    const migrationSql = fs.readFileSync(migrationPath, "utf8")

    const prisma = new PrismaClient()

    // Execute the SQL directly
    await prisma.$executeRawUnsafe(migrationSql)

    console.log("Migration completed successfully.")

    // Seed some built-in templates
    await seedBuiltInTemplates(prisma)

    await prisma.$disconnect()
  } catch (error) {
    console.error("Error running migration:", error)
    process.exit(1)
  }
}

async function seedBuiltInTemplates(prisma: PrismaClient) {
  console.log("Seeding built-in templates...")

  const templates = [
    {
      name: "Daily Maintenance",
      description: "Daily cleanup that keeps recent source maps for quick debugging",
      isBuiltIn: true,
      frequency: "DAILY",
      hour: 1,
      minute: 0,
      retentionDays: 7,
      minDeploymentsToKeep: 10,
      tags: ["daily", "balanced", "recommended"],
      storageProvider: "s3",
    },
    {
      name: "Weekly Archiving",
      description: "Weekly cleanup that balances storage and debugging needs",
      isBuiltIn: true,
      frequency: "WEEKLY",
      dayOfWeek: 0, // Sunday
      hour: 2,
      minute: 0,
      retentionDays: 30,
      minDeploymentsToKeep: 5,
      tags: ["weekly", "balanced"],
      storageProvider: "s3",
    },
    {
      name: "Monthly Purging",
      description: "Monthly aggressive cleanup to free up storage space",
      isBuiltIn: true,
      frequency: "MONTHLY",
      dayOfMonth: 1,
      hour: 1,
      minute: 0,
      retentionDays: 90,
      minDeploymentsToKeep: 3,
      tags: ["monthly", "aggressive"],
      storageProvider: "s3",
    },
    {
      name: "Development Environment",
      description: "Aggressive daily cleanup for development environments",
      isBuiltIn: true,
      frequency: "DAILY",
      hour: 0,
      minute: 0,
      retentionDays: 3,
      minDeploymentsToKeep: 3,
      tags: ["daily", "aggressive", "development"],
      storageProvider: "s3",
    },
    {
      name: "Production Environment",
      description: "Conservative weekly cleanup for production environments",
      isBuiltIn: true,
      frequency: "WEEKLY",
      dayOfWeek: 6, // Saturday
      hour: 4,
      minute: 0,
      retentionDays: 60,
      minDeploymentsToKeep: 10,
      tags: ["weekly", "conservative", "production", "recommended"],
      storageProvider: "s3",
    },
  ]

  for (const template of templates) {
    await prisma.sourceMapCleanupTemplate.create({
      data: template,
    })
  }

  console.log(`Seeded ${templates.length} built-in templates.`)
}

main()
