-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingMethod" VARCHAR(32),
ADD COLUMN     "computedShipping" DOUBLE PRECISION;
