-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ProducerApplication" (
    "id" TEXT NOT NULL,
    "producerName" TEXT NOT NULL,
    "companyName" TEXT,
    "afm" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "categories" TEXT,
    "note" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProducerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProducerApplication_status_createdAt_idx" ON "ProducerApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ProducerApplication_createdAt_idx" ON "ProducerApplication"("createdAt");
