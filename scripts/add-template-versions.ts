import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function main() {
  console.log("Running migration to add template versions...")

  try {
    // Run the migration
    await execAsync("npx prisma migrate dev --name add-template-versions")

    console.log("Migration completed successfully")

    // Create initial versions for existing templates
    const templates = await prisma.sourceMapCleanupTemplate.findMany()
    console.log(`Found ${templates.length} existing templates. Creating initial versions...`)

    for (const template of templates) {
      const { id: templateId, currentVersionId, ...templateData } = template

      // Create initial version
      const version = await prisma.templateVersion.create({
        data: {
          templateId,
          versionNumber: 1,
          ...templateData,
          changeDescription: "Initial version",
        },
      })

      // Update template with current version
      await prisma.sourceMapCleanupTemplate.update({
        where: { id: templateId },
        data: { currentVersionId: version.id },
      })

      console.log(`Created initial version for template: ${template.name}`)
    }

    console.log("Successfully created initial versions for all templates")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
