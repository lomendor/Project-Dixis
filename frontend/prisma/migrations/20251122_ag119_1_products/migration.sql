-- AG119.1 Migration: Add slug and priceCents to Product
-- Note: This migration adds two new columns to the Product table
-- 1. slug: unique identifier for URL-friendly product names
-- 2. priceCents: integer price in cents (alongside existing price Float for backwards compat)

-- AddColumn
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;
ALTER TABLE "Product" ADD COLUMN "priceCents" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- Backfill existing products with slug (if any exist)
-- This is safe because we'll be seeding fresh data
-- If there are existing products, they will need manual slug assignment
UPDATE "Product" SET "slug" = LOWER(REPLACE(title, ' ', '-')) || '-' || SUBSTRING(id, 1, 8) WHERE "slug" IS NULL;
UPDATE "Product" SET "priceCents" = CAST(price * 100 AS INTEGER) WHERE "priceCents" IS NULL;

-- AlterColumn to make them required
ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "priceCents" SET NOT NULL;
