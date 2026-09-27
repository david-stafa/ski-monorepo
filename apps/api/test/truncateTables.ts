import { prisma } from '@ski-blazek/db'
import { beforeEach } from 'vitest'
import { assertIsTestDatabase } from './testDatabaseUrl'

// Every test starts with empty tables — auth tables included, since tests log
// in through the fake user in helpers.ts, not a real session. The list is read
// from Postgres, so a new model is covered without touching this file.
beforeEach(async () => {
	// Ask the connection itself which database it's on, so nothing can truncate
	// the dev database even if the env setup above ever goes wrong.
	const [connection] = await prisma.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`
	assertIsTestDatabase(connection?.name ?? '')

	const tables = await prisma.$queryRaw<{ tablename: string }[]>`
		SELECT tablename FROM pg_tables
		WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
	`
	const tableList = tables.map(({ tablename }) => `"${tablename}"`).join(', ')
	await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`)
})
