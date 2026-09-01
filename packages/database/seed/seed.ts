import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { EquipmentItemType, Prisma } from '../generated/prisma/client'
import { prisma } from '../src/client'

/**
 * Loads the JSON in `seed/data` into an empty database.
 *
 * The data came out of the shop's `Formular_final_25-26.xlsx` via a one-off
 * transform: the spreadsheet is not read here and is not a dependency of this
 * repo. The JSON is the artefact — reviewed by hand, committed, replayable.
 *
 * Article numbers are baked into the files rather than assigned here. Boots and
 * helmets carry the numbers physically stickered on them, so making them up at
 * seed time would put the database out of step with the shelf. Skis and
 * snowboards have no sticker and were numbered sequentially by the transform.
 *
 * Additive, not idempotent — see the guard below.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * The JSON holds `equipmentItem` as plain fields. Prisma wants them wrapped in a
 * `create`, which is noise in a file meant to be read and corrected by hand, so
 * the wrapping happens here instead.
 */
type ArticleFields = {
	type: EquipmentItemType
	articleGroup: number | null
	articleNumber: number
}

type Seed<TCreateInput> = Omit<TCreateInput, 'equipmentItem'> & { equipmentItem: ArticleFields }

const read = <T>(name: string): Seed<T>[] =>
	JSON.parse(readFileSync(path.join(__dirname, 'data', `${name}.json`), 'utf8'))

const withItem = <T>({ equipmentItem, ...fields }: Seed<T>) => ({
	...fields,
	equipmentItem: { create: equipmentItem },
})

const seed = async () => {
	const ski = read<Prisma.SkiCreateInput>('ski')
	const snowboard = read<Prisma.SnowboardCreateInput>('snowboard')
	const skiBoot = read<Prisma.SkiBootCreateInput>('skiBoot')
	const snowboardBoot = read<Prisma.SnowboardBootCreateInput>('snowboardBoot')
	const helmet = read<Prisma.HelmetCreateInput>('helmet')

	// Re-running would insert a second copy of the stock rather than update it,
	// so refuse instead. Reset the database if you mean to seed again.
	const existing = await prisma.equipmentItem.count()
	if (existing > 0) {
		throw new Error(`Refusing to seed: EquipmentItem already holds ${existing} rows.`)
	}

	// One transaction, so a bad row leaves no half-imported stock behind. The
	// timeout is raised because this is ~1050 sequential inserts, well past the
	// 5s Prisma allows an interactive transaction by default.
	await prisma.$transaction(
		async (tx) => {
			for (const row of ski) await tx.ski.create({ data: withItem(row) })
			for (const row of snowboard) await tx.snowboard.create({ data: withItem(row) })
			for (const row of skiBoot) await tx.skiBoot.create({ data: withItem(row) })
			for (const row of snowboardBoot) await tx.snowboardBoot.create({ data: withItem(row) })
			for (const row of helmet) await tx.helmet.create({ data: withItem(row) })
		},
		{ timeout: 120_000, maxWait: 10_000 }
	)

	console.log(
		`Seeded ${ski.length} skis, ${snowboard.length} snowboards, ${skiBoot.length} ski boots, ` +
			`${snowboardBoot.length} snowboard boots, ${helmet.length} helmets.`
	)
}

seed()
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
