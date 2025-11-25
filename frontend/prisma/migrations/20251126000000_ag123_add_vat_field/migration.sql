-- AlterTable: Add vat field to Order for AG123
ALTER TABLE "Order" ADD COLUMN "vat" DECIMAL(10,2);
