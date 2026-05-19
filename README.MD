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