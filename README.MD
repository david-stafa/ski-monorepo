# Ski Blazek

Monorepo for ski blazek application.

## Tech Stack
- **Frontend:** React + Vite + TanStack Router
- **Backend:** Express + TypeScript
- **Database:** PostgreSQL + Prisma
- **Monorepo:** pnpm workspaces + Turbo

## Getting Started

# Install dependencies
pnpm install

# Start database
docker-compose up -d

# Run migrations
pnpm turbo db:migrate

# Start dev servers
pnpm dev

# Run the API tests (Postgres must be up; uses its own ski_blazek_test database)
pnpm test