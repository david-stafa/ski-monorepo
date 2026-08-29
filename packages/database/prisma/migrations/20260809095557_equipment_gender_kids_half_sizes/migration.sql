-- AlterTable
ALTER TABLE "Helmet" ADD COLUMN     "gender" "Gender";

-- AlterTable
ALTER TABLE "Ski" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "isKids" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SkiBoot" ADD COLUMN     "gender" "Gender",
ALTER COLUMN "length" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Snowboard" ADD COLUMN     "gender" "Gender";

-- AlterTable
ALTER TABLE "SnowboardBoot" ADD COLUMN     "gender" "Gender",
ALTER COLUMN "length" SET DATA TYPE DOUBLE PRECISION;
