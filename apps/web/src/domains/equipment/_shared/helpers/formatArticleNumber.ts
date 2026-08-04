type ArticleNumber = {
  articleGroup: number | null
  articleNumber: number
}

/**
 * The number as it is written on the item. Boots sit in a per-size pool and are
 * stickered `<size>.<sequence>` — `26.86` is the 86th size-26 boot — while skis,
 * snowboards and helmets carry a plain running number and have no pool.
 *
 * The two parts stay separate integers in the database precisely so this stays
 * a formatting concern: as a single number `26.9` would sort above `26.86`,
 * which is the wrong way round for a sequence.
 */
export const formatArticleNumber = ({
  articleGroup,
  articleNumber,
}: ArticleNumber) =>
  articleGroup === null
    ? `${articleNumber}`
    : `${articleGroup}.${articleNumber}`
