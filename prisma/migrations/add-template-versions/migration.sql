-- CreateTable
CREATE TABLE "TemplateVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "hour" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "minDeploymentsToKeep" INTEGER NOT NULL,
    "dryRun" BOOLEAN NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "notifyOnSuccess" BOOLEAN NOT NULL,
    "notifyOnFailure" BOOLEAN NOT NULL,
    "notificationRecipients" TEXT[],
    "tags" TEXT[],
    "changeDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "TemplateVersion_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "SourceMapCleanupTemplate" ADD COLUMN "currentVersionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TemplateVersion_templateId_versionNumber_key" ON "TemplateVersion"("templateId", "versionNumber");

-- CreateIndex
CREATE INDEX "TemplateVersion_templateId_idx" ON "TemplateVersion"("templateId");

-- CreateIndex
CREATE INDEX "TemplateVersion_versionNumber_idx" ON "TemplateVersion"("versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SourceMapCleanupTemplate_currentVersionId_key" ON "SourceMapCleanupTemplate"("currentVersionId");

-- AddForeignKey
ALTER TABLE "SourceMapCleanupTemplate" ADD CONSTRAINT "SourceMapCleanupTemplate_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateVersion" ADD CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SourceMapCleanupTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
