import type { EquipmentItemType } from '@ski-blazek/db'
import type { Prisma } from '@ski-blazek/db/browser'

/**
 * Accept the base client OR a transaction client (`tx`). Callers creating
 * equipment must pass their `tx` from inside `prisma.$transaction(...)` so the
 * "read free numbers" and the "insert" run on the same connection / atomic
 * unit. The partial unique index on (type, articleNumber) WHERE retiredAt IS
 * NULL is the real backstop against duplicates; the caller retries on conflict.
 */
type PrismaClientOrTx = Prisma.TransactionClient

export const getFreeArticleNumbers = async (
  client: PrismaClientOrTx,
  equipmentItemType: EquipmentItemType
): Promise<[number, ...number[]]> => {
  const articleNumbers = await client.equipmentItem.findMany({
    where: { type: equipmentItemType, retiredAt: null },
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
  equipmentItemType: EquipmentItemType
) => {
  const freeNumbers = await getFreeArticleNumbers(client, equipmentItemType)

  return freeNumbers[0]
}
