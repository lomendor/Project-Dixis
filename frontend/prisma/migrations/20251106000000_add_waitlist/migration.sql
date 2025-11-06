-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Waitlist_email_idx" ON "Waitlist"("email");

-- CreateIndex
CREATE INDEX "Waitlist_createdAt_idx" ON "Waitlist"("createdAt");
