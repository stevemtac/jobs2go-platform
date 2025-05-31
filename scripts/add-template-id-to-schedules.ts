import { PrismaClient } from "@prisma/client"
import { resolve } from "path"
import fs from "fs"

async function main() {
  console.log("Adding templateId to SourceMapCleanupSchedule table...")

  try {
    // Read the migration SQL
    const migrationPath = resolve(__dirname, "../prisma/migrations/add-template-id-to-schedules/migration.sql")
    const migrationSQL = fs.readFileSync(migrationPath, "utf8")

    // Create a new Prisma client
    const prisma = new PrismaClient()

    // Execute the migration SQL
    await prisma.$executeRawUnsafe(migrationSQL)

    console.log("Migration completed successfully!")

    // Close the Prisma client
    await prisma.$disconnect()
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

main()
