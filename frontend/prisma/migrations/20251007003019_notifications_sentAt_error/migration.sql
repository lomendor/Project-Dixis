-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "sentAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN "error" TEXT;
