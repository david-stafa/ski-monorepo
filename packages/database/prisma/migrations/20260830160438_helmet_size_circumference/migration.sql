/*
  Warnings:

  - The `size` column on the `Helmet` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "HelmetSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'ADJUSTABLE');

-- AlterTable
ALTER TABLE "Helmet" ADD COLUMN     "circumferenceMax" INTEGER,
ADD COLUMN     "circumferenceMin" INTEGER,
DROP COLUMN "size",
ADD COLUMN     "size" "HelmetSize";
