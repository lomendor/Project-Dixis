-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "bucket" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_name_key_bucket_key" ON "RateLimit"("name", "key", "bucket");

-- CreateIndex
CREATE INDEX "RateLimit_name_key_bucket_idx" ON "RateLimit"("name", "key", "bucket");
