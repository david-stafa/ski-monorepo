/*
  Warnings:

  - A unique constraint covering the columns `[type,articleGroup,articleNumber]` on the table `EquipmentItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EquipmentItem" ADD COLUMN     "articleGroup" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentItem_live_article_key"
    ON "EquipmentItem" ("type", "articleGroup", "articleNumber")
    NULLS NOT DISTINCT
    WHERE "retiredAt" IS NULL;
