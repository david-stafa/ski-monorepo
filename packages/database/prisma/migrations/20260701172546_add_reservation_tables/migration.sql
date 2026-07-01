/*
  Warnings:

  - A unique constraint covering the columns `[equipmentItemId]` on the table `Helmet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[equipmentItemId]` on the table `Ski` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[equipmentItemId]` on the table `SkiBoot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[equipmentItemId]` on the table `Snowboard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[equipmentItemId]` on the table `SnowboardBoot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `equipmentItemId` to the `Helmet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipmentItemId` to the `Ski` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipmentItemId` to the `SkiBoot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipmentItemId` to the `Snowboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipmentItemId` to the `SnowboardBoot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EquipmentItemType" AS ENUM ('SKI', 'SKI_BOOT', 'SNOWBOARD', 'SNOWBOARD_BOOT', 'HELMET');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('BOOKED', 'PICKED_UP', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PersonStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Helmet" ADD COLUMN     "equipmentItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Ski" ADD COLUMN     "equipmentItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SkiBoot" ADD COLUMN     "equipmentItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Snowboard" ADD COLUMN     "equipmentItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SnowboardBoot" ADD COLUMN     "equipmentItemId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "note" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'BOOKED',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "status" "PersonStatus" NOT NULL DEFAULT 'ACTIVE',
    "poles" INTEGER,
    "backProtection" BOOLEAN NOT NULL DEFAULT false,
    "skiCover" BOOLEAN NOT NULL DEFAULT false,
    "bootCover" BOOLEAN NOT NULL DEFAULT false,
    "goggles" BOOLEAN NOT NULL DEFAULT false,
    "reservationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationItem" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reservationId" TEXT NOT NULL,
    "personId" TEXT,
    "equipmentItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentItem" (
    "id" TEXT NOT NULL,
    "type" "EquipmentItemType" NOT NULL,
    "articleNumber" INTEGER NOT NULL,
    "retiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationItem_equipmentItemId_idx" ON "ReservationItem"("equipmentItemId");

-- CreateIndex
CREATE INDEX "ReservationItem_reservationId_idx" ON "ReservationItem"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationItem_personId_idx" ON "ReservationItem"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Helmet_equipmentItemId_key" ON "Helmet"("equipmentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Ski_equipmentItemId_key" ON "Ski"("equipmentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "SkiBoot_equipmentItemId_key" ON "SkiBoot"("equipmentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Snowboard_equipmentItemId_key" ON "Snowboard"("equipmentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "SnowboardBoot_equipmentItemId_key" ON "SnowboardBoot"("equipmentItemId");

-- AddForeignKey
ALTER TABLE "Ski" ADD CONSTRAINT "Ski_equipmentItemId_fkey" FOREIGN KEY ("equipmentItemId") REFERENCES "EquipmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snowboard" ADD CONSTRAINT "Snowboard_equipmentItemId_fkey" FOREIGN KEY ("equipmentItemId") REFERENCES "EquipmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Helmet" ADD CONSTRAINT "Helmet_equipmentItemId_fkey" FOREIGN KEY ("equipmentItemId") REFERENCES "EquipmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkiBoot" ADD CONSTRAINT "SkiBoot_equipmentItemId_fkey" FOREIGN KEY ("equipmentItemId") REFERENCES "EquipmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnowboardBoot" ADD CONSTRAINT "SnowboardBoot_equipmentItemId_fkey" FOREIGN KEY ("equipmentItemId") REFERENCES "EquipmentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationItem" ADD CONSTRAINT "ReservationItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationItem" ADD CONSTRAINT "ReservationItem_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationItem" ADD CONSTRAINT "ReservationItem_equipmentItemId_fkey" FOREIGN KEY ("equipmentItemId") REFERENCES "EquipmentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
