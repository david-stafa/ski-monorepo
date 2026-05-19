# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Ski Blazek** — a ski equipment management app. pnpm + Turborepo monorepo.

- `apps/api` — Express + tRPC backend (`@ski-blazek/api`)
- `apps/web` — React + Vite + TanStack Router frontend (`@ski-blazek/web`)
- `packages/database` — Prisma client + schema (`@ski-blazek/db`)
- `packages/auth` — better-auth server + client factories (`@ski-blazek/auth`)
- `packages/ui` — shared shadcn/ui components with Tailwind v4 (`@ski-blazek/ui`)
- `packages/eslint-config`, `packages/typescript-config`, `packages/tailwind-config` — shared tooling

## Commands

```bash
# Root (runs all apps via Turbo)
pnpm dev          # start all dev servers (TUI mode)
pnpm build        # build everything
pnpm lint         # lint all packages
pnpm check-types  # typecheck all packages
pnpm format       # format all packages

# Database (run from root or packages/database)
pnpm turbo db:migrate   # prisma migrate dev (creates migration files)
pnpm turbo db:generate  # regenerate Prisma client after schema changes
pnpm turbo db:deploy    # prisma migrate deploy (production)

# Individual app dev
pnpm --filter @ski-blazek/api dev
pnpm --filter @ski-blazek/web dev
```

## Local environment setup

1. Copy `.env.example` to `.env` at the repo root
2. Start Postgres: `docker-compose up -d` (runs on port **5433**)
3. Run migrations: `pnpm turbo db:migrate`
4. Start dev: `pnpm dev`

The `.env` file is read by all packages (the DB client and Prisma config walk up the directory tree to find it).

Default ports: API on **3001**, web on **5174**.

## Architecture

### tRPC — type-safe API

The API exposes only tRPC (no REST for data). The router tree is:

```
appRouter
└── equipment
    ├── ski
    ├── skiBoot
    ├── snowboard
    ├── snowboardBoot
    └── helmet
```

Each equipment domain follows a consistent layout:
```
routers/equipment/<type>/
  <type>.ts          # tRPC router (procedures)
  methods/           # individual DB operations (create, get, delete)
  schemas/           # Zod input schemas
```

`AppRouter` type is exported from `apps/api/src/routers/_app.ts` and imported by the web app via the workspace alias `@ski-blazek/api/trpc`. This gives end-to-end type safety without shipping server code to the client.

The tRPC context (`_context.ts`) currently passes an empty object — session/auth is not yet wired into tRPC context, so all procedures are `publicProcedure`. A `loggedProcedure` middleware exists in `_middleware.ts` for timing.

### Auth — better-auth

Auth is handled by [better-auth](https://better-auth.com), mounted at `/api/auth/*splat` on the Express server.

- **Server**: `packages/auth/src/index.ts` exports `createAuth()` — called in `apps/api/src/auth.ts`
- **Client**: `packages/auth/src/client.ts` exports `createAuth()` (different signature) — called in `apps/web/src/lib/auth.ts` as `authClient`
- Import paths differ: server uses `@ski-blazek/auth`, client uses `@ski-blazek/auth/client`

Session is fetched globally in the root route's `beforeLoad` via `authClient.getSession()` and injected into TanStack Router context. The `_authenticated.tsx` layout route reads `context.user` and redirects to `/` if absent.

### Database — Prisma with multi-file schema

Schema files live in `packages/database/prisma/`:
- `schema.prisma` — generator + datasource config only
- `auth.prisma` — User, Session, Account, Verification (managed by better-auth)
- `equipment.prisma` — Ski, Snowboard, Helmet, SkiBoot, SnowboardBoot

Generated client outputs to `packages/database/generated/prisma/`. The `@prisma/adapter-pg` driver adapter is used (not the default Prisma driver). `DATABASE_URL` must be set before any Prisma operation.

### Web routing — TanStack Router (file-based)

Routes are in `apps/web/src/routes/`. **`routeTree.gen.ts` is auto-generated — never edit it manually.**

- `__root.tsx` — loads session, wraps app in `ThemeProvider` + `TooltipProvider`
- `_authenticated.tsx` — layout route with sidebar; guards all child routes
- `_authenticated/equipment/*.tsx` — per-equipment-type pages

### UI components

`@ski-blazek/ui` exports components via named export paths:
```ts
import { Button } from '@ski-blazek/ui/components/button'
import { cn } from '@ski-blazek/ui/lib/utils'
```

Uses Tailwind v4 (configured via `@tailwindcss/vite` plugin, not PostCSS config file). Shared styles are in `packages/tailwind-config/shared-styles.css`.

### Build pipeline

Turbo ensures `db:generate` runs before any `build`. The API is bundled with `tsup` (ESM output to `dist/`). The web is bundled with Vite.
