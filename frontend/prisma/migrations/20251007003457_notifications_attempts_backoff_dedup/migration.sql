-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Notification" ADD COLUMN "nextAttemptAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN "dedupId" VARCHAR(64);

-- CreateIndex
CREATE INDEX "Notification_status_nextAttemptAt_idx" ON "Notification"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "Notification_dedupId_idx" ON "Notification"("dedupId");
