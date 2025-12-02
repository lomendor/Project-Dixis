-- Add producer approval fields for admin approval workflow
-- AlterTable
ALTER TABLE "Producer" ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Producer" ADD COLUMN "rejectionReason" TEXT;

-- CreateIndex
CREATE INDEX "Producer_approvalStatus_idx" ON "Producer"("approvalStatus");
