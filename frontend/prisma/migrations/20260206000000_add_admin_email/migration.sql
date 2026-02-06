-- AlterTable: Add email field to AdminUser for OTP delivery
ALTER TABLE "AdminUser" ADD COLUMN "email" TEXT;

-- CreateIndex: Index on email for fast lookups
CREATE INDEX "AdminUser_email_idx" ON "AdminUser"("email");
