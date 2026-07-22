-- CreateEnum
CREATE TYPE "ReservationItemStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "ReservationItem" ADD COLUMN     "status" "ReservationItemStatus" NOT NULL DEFAULT 'ACTIVE';
