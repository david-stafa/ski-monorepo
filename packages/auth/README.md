# @ski-blazek/auth

Shared authentication package for the Habit Tracker monorepo using Better Auth.

## Structure

- `src/index.ts` - Server-side Better Auth instance configuration
- `src/client.ts` - Shared client-side types and utilities

## Usage

### Server-side (Express API)

```typescript
import { auth } from "@ski-blazek/auth";
import { toNodeHandler } from "better-auth/node";

app.all("/api/auth/*", toNodeHandler(auth));
```

### Client-side (React)

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3005", // Your API URL
});
```

## Environment Variables

Required environment variables:

```env
BETTER_AUTH_SECRET=<generated-secret>
BETTER_AUTH_URL=http://localhost:3005
DATABASE_URL=<your-postgresql-connection-string>
```

## Database Setup

After setting up the package, run the Better Auth CLI to generate the required database schema:

```bash
pnpx @better-auth/cli generate
```

Then apply the migration:

```bash
pnpm --filter @ski-blazek/db db:migrate
```
