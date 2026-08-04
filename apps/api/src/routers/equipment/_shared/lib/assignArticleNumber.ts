import { Prisma } from '@ski-blazek/db'
import type { EquipmentItemType } from '@ski-blazek/db/browser'
import { TRPCError } from '@trpc/server'

/** Accepts the base client or a transaction client, so callers can pass either. */
type PrismaClientOrTx = Prisma.TransactionClient

/**
 * Which sticker pool a boot belongs to. Half-size boots are stickered into the
 * whole size below — a 26.5 shelves with the 26s — so the pool is the floor of
 * the length, not the length itself. Inert today, since `length` is an `Int`
 * and a half size can't be recorded yet, but it is what keeps the pool a
 * labelling decision rather than a measurement.
 */
export const articleGroupForBootLength = (length: number) => Math.floor(length)

/**
 * Every number free in one pool, lowest first: the gaps left by deleted or
 * retired items, then the next number past the current highest. A pool is a
 * (type, articleGroup) pair — size-26 ski boots number independently of size-27
 * ski boots and of size-26 snowboard boots.
 */
export const getFreeArticleNumbers = async (
  client: PrismaClientOrTx,
  equipmentItemType: EquipmentItemType,
  articleGroup: number | null
): Promise<[number, ...number[]]> => {
  const articleNumbers = await client.equipmentItem.findMany({
    where: { type: equipmentItemType, articleGroup, retiredAt: null },
    select: { articleNumber: true },
    orderBy: { articleNumber: 'desc' },
  })

  const [highest] = articleNumbers

  if (!highest) return [1]

  const taken = new Set(articleNumbers.map((n) => n.articleNumber))
  const gaps: number[] = []

  for (let n = 1; n <= highest.articleNumber; n++) {
    if (!taken.has(n)) gaps.push(n)
  }

  // `next` is what makes the result non-empty, so the tuple type holds even
  // when there are no gaps to reuse.
  const next = highest.articleNumber + 1
  const [lowestGap, ...otherGaps] = gaps

  return lowestGap === undefined ? [next] : [lowestGap, ...otherGaps, next]
}

export const assignLowestFreeNumber = async (
  client: PrismaClientOrTx,
  equipmentItemType: EquipmentItemType,
  articleGroup: number | null
) => {
  const [lowest] = await getFreeArticleNumbers(
    client,
    equipmentItemType,
    articleGroup
  )

  return lowest
}

/**
 * P2002 is Prisma's unique-constraint violation. On the writes this module
 * guards it can only be `EquipmentItem_live_article_key`: the sole other unique
 * columns in play are cuid()-generated keys, which do not collide.
 *
 * Not narrowed any further on purpose. `error.meta.target` is empty under the
 * pg driver adapter — the constraint name only survives inside
 * `meta.driverAdapterError`, an undocumented shape that would break quietly if
 * the adapter changed. Add the check here if a unique constraint is ever added
 * to one of the equipment tables; until then it would be a check that never runs.
 */
const isArticleNumberConflict = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'

/**
 * The error to throw after a write that assigns an article number: a CONFLICT
 * when the live-article index rejected it, otherwise the original error left
 * untouched.
 *
 * Losing this race is expected and recoverable — someone else took the number
 * between our read and our write — so it is worth telling the user plainly
 * instead of dressing it up as a server fault. The message reaches them as-is:
 * the equipment mutations pass `error.message` straight into the toast.
 */
export const asArticleNumberConflict = (error: unknown) => {
  if (!isArticleNumberConflict(error)) return error

  return new TRPCError({
    code: 'CONFLICT',
    message: 'Číslo bylo právě obsazeno, zkuste to prosím znovu.',
    cause: error,
  })
}
