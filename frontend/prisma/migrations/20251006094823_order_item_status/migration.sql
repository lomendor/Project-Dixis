-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PLACED', 'ACCEPTED', 'FULFILLED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "status" "OrderItemStatus" NOT NULL DEFAULT 'PLACED';
