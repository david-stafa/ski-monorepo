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
) => {
  const articleNumbers = await client.equipmentItem.findMany({
    where: { type: equipmentItemType, retiredAt: null },
    select: { articleNumber: true },
    orderBy: { articleNumber: 'desc' },
  })

  if (articleNumbers.length === 0) return [1]

  const databaseSet = new Set(articleNumbers.map((n) => n.articleNumber))
  const wholeSet = new Set(
    Array.from({ length: articleNumbers[0].articleNumber }, (_, i) => i + 1)
  )

  return [
    ...wholeSet.difference(databaseSet),
    articleNumbers[0].articleNumber + 1,
  ]
}

export const assignLowestFreeNumber = async (
  client: PrismaClientOrTx,
  equipmentItemType: EquipmentItemType
) => {
  const freeNumbers = await getFreeArticleNumbers(client, equipmentItemType)

  return freeNumbers[0]
}
