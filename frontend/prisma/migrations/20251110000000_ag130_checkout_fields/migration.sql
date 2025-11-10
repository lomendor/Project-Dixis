-- AlterTable: Make existing Order fields optional for AG130
ALTER TABLE "Order" ALTER COLUMN "buyerPhone" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "buyerName" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingLine1" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingCity" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "shippingPostal" DROP NOT NULL;

-- AlterTable: Add AG130 checkout fields to Order
ALTER TABLE "Order" ADD COLUMN "email" TEXT;
ALTER TABLE "Order" ADD COLUMN "name" TEXT;
ALTER TABLE "Order" ADD COLUMN "phone" TEXT;
ALTER TABLE "Order" ADD COLUMN "address" TEXT;
ALTER TABLE "Order" ADD COLUMN "city" TEXT;
ALTER TABLE "Order" ADD COLUMN "zip" TEXT;
ALTER TABLE "Order" ADD COLUMN "zone" TEXT DEFAULT 'mainland';
ALTER TABLE "Order" ADD COLUMN "subtotal" DECIMAL(10,2);
ALTER TABLE "Order" ADD COLUMN "shipping" DECIMAL(10,2);
ALTER TABLE "Order" ADD COLUMN "currency" TEXT DEFAULT 'EUR';

-- CreateIndex: Add email index for Order
CREATE INDEX "Order_email_idx" ON "Order"("email");

-- AlterTable: Make OrderItem productId/producerId optional for AG130
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "producerId" DROP NOT NULL;

-- AlterTable: Add AG130 fields to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "slug" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "currency" TEXT DEFAULT 'EUR';
