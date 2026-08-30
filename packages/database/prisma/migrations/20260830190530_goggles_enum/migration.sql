/*
  Warnings:

  - The `goggles` column on the `Person` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Goggle" AS ENUM ('MALE', 'FEMALE', 'JUNIOR');

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "goggles",
ADD COLUMN     "goggles" "Goggle";
