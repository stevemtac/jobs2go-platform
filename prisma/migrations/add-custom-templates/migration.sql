-- CreateTable
CREATE TABLE "SourceMapCleanupTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "CleanupScheduleFrequency" NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "hour" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "minDeploymentsToKeep" INTEGER NOT NULL,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "storageProvider" TEXT NOT NULL DEFAULT 's3',
    "notifyOnSuccess" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "notificationRecipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "SourceMapCleanupTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SourceMapCleanupTemplate_isBuiltIn_idx" ON "SourceMapCleanupTemplate"("isBuiltIn");

-- CreateIndex
CREATE INDEX "SourceMapCleanupTemplate_tags_idx" ON "SourceMapCleanupTemplate"("tags");
