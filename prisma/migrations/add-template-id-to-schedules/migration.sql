-- Add templateId column to SourceMapCleanupSchedule table
ALTER TABLE "SourceMapCleanupSchedule" ADD COLUMN "templateId" TEXT;

-- Add index on templateId for faster lookups
CREATE INDEX "SourceMapCleanupSchedule_templateId_idx" ON "SourceMapCleanupSchedule"("templateId");
