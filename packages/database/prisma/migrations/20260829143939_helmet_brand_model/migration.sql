-- Rename rather than drop-and-add: `name` was already being used to hold the
-- brand ("Giro"), so the existing rows carry straight over.
ALTER TABLE "Helmet" RENAME COLUMN "name" TO "brand";

-- Optional: helmets are often stocked as a brand and a colour with no separate
-- model on the shell.
ALTER TABLE "Helmet" ADD COLUMN "model" TEXT;
