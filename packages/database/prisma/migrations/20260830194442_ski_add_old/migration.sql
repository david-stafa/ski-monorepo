-- AlterTable
ALTER TABLE "Ski" ADD COLUMN     "isOld" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "model" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SkiBoot" ALTER COLUMN "model" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Snowboard" ALTER COLUMN "model" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SnowboardBoot" ALTER COLUMN "model" DROP NOT NULL;
