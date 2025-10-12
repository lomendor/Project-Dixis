-- AlterTable
ALTER TABLE "Order" ADD COLUMN "publicToken" TEXT NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");

-- CreateIndex
CREATE INDEX "Order_publicToken_idx" ON "Order"("publicToken");
