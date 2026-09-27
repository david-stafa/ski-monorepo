-- One status enum for reservations, people and reservation items (MY-71).
--
-- Hand-edited: Prisma's generated version dropped and recreated the Person and
-- ReservationItem `status` columns, which would turn every cancelled row back
-- into BOOKED. Instead the columns are converted in place: ACTIVE becomes
-- BOOKED, CANCELLED stays CANCELLED.

-- AlterEnum
-- BEFORE, not Prisma's default of appending, so the database's enum order
-- matches the step order and ORDER BY status sorts by progress.
ALTER TYPE "ReservationStatus" ADD VALUE 'PREPARED' BEFORE 'PICKED_UP';

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Person" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Person" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Person" ALTER COLUMN "status" TYPE "ReservationStatus"
    USING (CASE "status"::text WHEN 'ACTIVE' THEN 'BOOKED' ELSE "status"::text END)::"ReservationStatus";
ALTER TABLE "Person" ALTER COLUMN "status" SET DEFAULT 'BOOKED';

-- AlterTable
ALTER TABLE "ReservationItem" ADD COLUMN "preparedAt" TIMESTAMP(3),
ADD COLUMN "pickedUpAt" TIMESTAMP(3),
ADD COLUMN "returnedAt" TIMESTAMP(3),
ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "ReservationItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ReservationItem" ALTER COLUMN "status" TYPE "ReservationStatus"
    USING (CASE "status"::text WHEN 'ACTIVE' THEN 'BOOKED' ELSE "status"::text END)::"ReservationStatus";
ALTER TABLE "ReservationItem" ALTER COLUMN "status" SET DEFAULT 'BOOKED';

-- DropEnum
DROP TYPE "PersonStatus";

-- DropEnum
DROP TYPE "ReservationItemStatus";
