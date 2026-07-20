# Router conventions

Short rules for adding/changing tRPC endpoints. If in doubt, copy `equipment/ski/`.

## Layout

```
routers/<domain>/
  <domain>.ts          # the router: procedures only, no logic
  methods/             # one exported function per file, all the logic
  _shared/             # generic ops shared by sub-routers (see equipment/_shared)
schemas/<domain>.ts    # zod input schemas + inferred types
```

## Naming

The router already namespaces the domain — **don't repeat it**.

```
✅ equipment.ski.list          ❌ equipment.ski.getSki
✅ reservation.get             ❌ reservation.getReservation
```

| Procedure | Meaning |
| --- | --- |
| `list` | many (paginated) |
| `get` | exactly one |
| `create` / `update` / `delete` | the obvious |
| domain verbs | `retire`, `unretire`, `findAvailable` |

Method functions mirror the procedure but keep the noun, since they're imported by name:
`listSkis()`, `getReservation()`, `createSki()`.

## Return contracts

| Procedure | Returns |
| --- | --- |
| `list` | `{ <plural>, totalCount }` — e.g. `{ skis, totalCount }` |
| `get` | the record (throw `NOT_FOUND` if missing) |
| `create` / `update` / `delete` / `retire` / … | **the affected record** |

Never return `{ success: true }`. In tRPC success means "didn't throw", so the flag
carries no information and throws away data the client needs (ids, `articleNumber`,
`updatedAt`). Returning the record also enables `setQueryData` on the web.

## Errors

Always `TRPCError`, never a plain `Error` (a plain Error surfaces as a 500, not a 404).

```ts
throw new TRPCError({ code: 'NOT_FOUND', message: 'Ski not found' })
throw new TRPCError({ code: 'CONFLICT', message: 'Item is already booked' })
```

- row doesn't exist → `NOT_FOUND`
- business rule violated (already booked, still has bookings) → `CONFLICT`

## Imports

Methods import types **directly** from the schema file:

```ts
import type { GetReservationsInput } from '../../../schemas/reservation'   ✅
import type { GetReservationsInput } from '../../../schemas'               ❌ (barrel)
```

`schemas/index.ts` is the public surface for the **web** (`@ski-blazek/api/schemas`).
Backend code never imports it.

## List queries

Build `where` **once** and pass it to both queries, or the count drifts from the list:

```ts
const where: Prisma.ReservationWhereInput = {
  ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }] }),
  ...(status && { status }),
}

const [reservations, totalCount] = await prisma.$transaction([
  prisma.reservation.findMany({ where, skip: (page - 1) * itemsPerPage, take: itemsPerPage }),
  prisma.reservation.count({ where }),
])
```

**Lists stay lean, detail goes deep.** Use `_count` in `list`; save the nested
`include` tree for `get`.

## Transactions

- **Array form** `$transaction([...])` — independent reads (list + count). One round trip.
- **Interactive form** `$transaction(async (tx) => …)` — only when a write depends on an
  earlier read. Pass `tx` down into helpers so they run in the same transaction.

## Gotchas

- **Dates in schemas: `z.coerce.date()`**, not `z.date()`. The wire sends strings;
  `z.date()` type-checks fine and throws at runtime.
- **Intervals are half-open `[start, end)`** — strict `lt`/`gt`, so back-to-back is allowed.
  Matches the Postgres `tsrange` used by the exclusion constraint.
- **Awaiting in a loop: use `for...of`.** `.map`/`.forEach` with an `async` callback do
  **not** await — the promise is dropped and a `throw` inside becomes an unhandled
  rejection that never aborts the transaction.

## Adding an endpoint

1. Schema + inferred type in `schemas/<domain>.ts`
2. Method in `routers/<domain>/methods/<verb><Thing>.ts` (one export)
3. Wire it in `routers/<domain>/<domain>.ts`
4. `pnpm --filter @ski-blazek/api check-types`

```ts
// routers/<domain>/<domain>.ts
export const thingRouter = router({
  list: publicProcedure
    .input(listThingsInputSchema)
    .query(async ({ input }) => await listThings(input)),
  create: publicProcedure
    .input(createThingInputSchema)
    .mutation(async ({ input }) => await createThing(input)),
})
```
