# @ski-blazek/web

Frontend for Ski Blazek — React 19 + Vite + TanStack Router, talking to `@ski-blazek/api` over tRPC.

UI copy is in Czech.

## Running

From the repo root (starts the API too):

```bash
pnpm dev
```

Just this app:

```bash
pnpm --filter @ski-blazek/web dev
```

Dev server runs on **5174** (override with `APP_PORT`). `envDir` points at the repo root, so the shared root `.env` is what gets loaded — there is no `.env` in this package. The API origin comes from `VITE_API_URL` and defaults to `http://localhost:3001`.

| script | what it does |
| --- | --- |
| `dev` | Vite dev server with HMR |
| `build` | `tsc -b` then `vite build` |
| `start` | serve the built `dist/` |
| `check-types` | `tsc -b`, no emit |

Formatting and linting are handled by Biome at the repo root (`pnpm format` / `pnpm check`) — this package has no lint config of its own.

## Routing

File-based via `@tanstack/router-plugin`, with `autoCodeSplitting` on. Routes live in [src/routes/](src/routes/).

```
__root.tsx              loads the session, wraps in ThemeProvider + TooltipProvider
├── index.tsx           landing
├── login.tsx / register.tsx
├── about.tsx
└── _authenticated.tsx  sidebar layout; redirects to / when context.user is absent
    ├── dashboard.tsx
    ├── equipment/      index + ski, ski-boot, snowboard, snowboard-boot, helmet
    └── reservation/    index, create, pick-up
```

`__root.tsx` fetches the session once in `beforeLoad` via `authClient.getSession()` and puts it on the router context; `_authenticated.tsx` is the single guard for everything behind login.

**`src/routeTree.gen.ts` is generated — never edit it by hand.** The Vite plugin regenerates it on save. It is excluded from Biome in the root `biome.json`.

## Layout

```
src/
  routes/       thin — route definition, loader, and a page component
  domains/      feature code, one folder per domain
  components/
    form/       generic form kit (TanStack Form), domain-agnostic
    ui/         app-level shared components
    auth/       login / register forms
  hooks/        useDebounce, useFilter
  lib/          trpc, auth, notify, formatting, search-param helpers
```

`~` is an alias for `src/` (declared in both `tsconfig.app.json` and `vite.config.ts` — they have to stay in sync).

### domains/

Each domain owns its queries, types, and components:

```
domains/equipment/ski/
  ski.types.ts
  skiQueries.ts        useCreateSki, useUpdateSki, … + cache invalidation
  components/          SkiForm, AddSkiButton, EditSkiDialog, DeleteSkiDialog, …
```

`domains/equipment/_shared/` holds what the five equipment types have in common. Same shape for `domains/reservation/`, `domains/auth/`, `domains/root/`.

The split with `components/form/` is deliberate: **the form kit stays generic and knows nothing about equipment**, while anything domain-aware lives under `domains/`.

## Data layer

[src/lib/trpc.ts](src/lib/trpc.ts) builds the typed client:

- `AppRouter` is imported as a **type only** from `@ski-blazek/api/trpc`, so no server code ships to the browser
- `superjson` transformer on both ends, so `Date` survives the wire
- `credentials: 'include'` on fetch — better-auth uses cookies
- exports `trpc` (a `createTRPCOptionsProxy`), the shared `queryClient`, and `Outputs` for `inferRouterOutputs<AppRouter>`

### The list-page pattern

Every equipment list route follows the same shape — see [src/routes/_authenticated/equipment/ski.tsx](src/routes/_authenticated/equipment/ski.tsx) as the reference:

```tsx
export const Route = createFileRoute('/_authenticated/equipment/ski')({
  // the API's own Zod schema validates the URL search params
  validateSearch: getSkiInputSchema,
  loaderDeps: ({ search: { page, itemsPerPage, orderBy, orderDirection, search } }) => ({ … }),
  // prefetch on navigation so the component never suspends on first paint
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(context.trpc.equipment.ski.list.queryOptions(deps)),
  component: RouteComponent,
})

function RouteComponent() {
  const { filters, setFilters, resetFilters } = useFilters(Route.id)
  const { data } = useSuspenseQuery(trpc.equipment.ski.list.queryOptions(filters))
  …
}
```

Three things make this work:

- **Search params are the source of truth** for paging, sorting, and filtering — no local state. `useFilters(Route.id)` ([src/hooks/useFilter.tsx](src/hooks/useFilter.tsx)) reads and writes them.
- **The input schema is shared**, imported from `@ski-blazek/api/schemas`, so the URL and the procedure input cannot drift apart.
- **`loader` prefetches, the component uses `useSuspenseQuery`** on the same `queryOptions`, so it hits a warm cache. Note the loader gets `trpc` off the router `context`, while the component imports it from `~/lib/trpc`.

Mutations are wrapped per domain in `*Queries.ts` so cache invalidation and the toast live in one place instead of at every call site.

> Import `@ski-blazek/db/browser`, never `@ski-blazek/db` — the root export pulls in the Prisma runtime. Biome enforces this (`noRestrictedImports`).

## Forms

TanStack Form via `createFormHook` in [src/components/form/SharedFormFields.tsx](src/components/form/SharedFormFields.tsx), which exports `useAppForm`, `withForm`, and `withFieldGroup`. Registered field components are `TextField`, `NumberField`, `CheckboxField`, `TextAreaField`, and `SelectField`, plus a `SubscribeButton` form component.

Each field pulls its own state from `useFieldContext`, so a form body only names the field and the label:

```tsx
<form.AppField name="brand" children={(field) => <field.TextField label="Značka" />} />
```

Both `children={…}` and JSX children work — the codebase uses the prop form for one-liners and JSX children for multi-line render bodies. Biome's `noChildrenProp` is turned off for this app in the root `biome.json` because that prop *is* the TanStack Form API.

Repeated sub-forms use `withForm` — see [PersonFormCard.tsx](src/domains/reservation/components/PersonFormCard.tsx), which renders one card per person in a `mode="array"` field.

## Styling

Tailwind v4 through `@tailwindcss/vite` — there is no `tailwind.config.js` and no PostCSS config. Shared tokens live in `packages/tailwind-config/shared-styles.css`.

shadcn/ui components come from the workspace package, imported by path:

```ts
import { Button } from '@ski-blazek/ui/components/button'
import { cn } from '@ski-blazek/ui/lib/utils'
```

Theme is set before first paint by an inline script in [index.html](index.html) to avoid a light flash on reload — it must stay in sync with `ThemeProvider`'s `storageKey` and `defaultTheme`.
