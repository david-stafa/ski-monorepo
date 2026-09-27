import { defineConfig } from 'vitest/config'
import { assertIsTestDatabase, TEST_DATABASE_URL } from './test/testDatabaseUrl'

assertIsTestDatabase(new URL(TEST_DATABASE_URL).pathname.slice(1))

export default defineConfig({
	test: {
		globalSetup: ['./test/globalSetup.ts'],
		setupFiles: ['./test/truncateTables.ts'],
		// Set in the test workers before any test code runs. The db package and
		// config.ts load the root .env with dotenv, which never overrides a
		// variable that is already set — so this wins over the dev URL.
		// truncateTables.ts double-checks it against the live connection.
		env: { DATABASE_URL: TEST_DATABASE_URL, NODE_ENV: 'test' },
		// One shared database, so test files must not run at the same time.
		fileParallelism: false,
	},
})
