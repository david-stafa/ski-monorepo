#!/usr/bin/env bash
#
# Wipe ALL equipment + reservation data from the dev database.
# Keeps the schema, migrations, and auth tables (Users/Sessions) intact.
#
# Usage:  ./scripts/cleanup.sh
#
set -euo pipefail
cd "$(dirname "$0")/../packages/database"

printf '\033[1mWiping equipment + reservation tables…\033[0m\n'

# TRUNCATE ... CASCADE clears the tables in FK-safe order and resets nothing else.
# (Prisma 7 reads the datasource URL from prisma.config.ts — no --schema flag.)
pnpm exec prisma db execute --stdin <<'SQL'
TRUNCATE TABLE
  "ReservationItem", "Person", "Reservation",
  "Ski", "SkiBoot", "Snowboard", "SnowboardBoot", "Helmet",
  "EquipmentItem"
RESTART IDENTITY CASCADE;
SQL

printf '\033[32m✓ All equipment & reservation records removed.\033[0m\n'
