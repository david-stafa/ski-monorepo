// The tests talk to a real Postgres — a separate database on the same docker
// container as dev, so a test run can never wipe dev data. CI (or anyone with a
// different setup) can point it elsewhere with TEST_DATABASE_URL.
export const TEST_DATABASE_URL =
	process.env.TEST_DATABASE_URL ??
	'postgresql://postgres:password@localhost:5433/ski_blazek_test?schema=public'

/** Every test truncates all tables, so refuse any database that isn't
 * obviously a test one. */
export const assertIsTestDatabase = (databaseName: string) => {
	if (!databaseName.endsWith('_test')) {
		throw new Error(
			`Refusing to run tests against "${databaseName}" — the test database name must end in "_test". Check TEST_DATABASE_URL.`
		)
	}
}
