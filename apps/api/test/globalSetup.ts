import { execSync } from 'node:child_process'
import { TEST_DATABASE_URL } from './testDatabaseUrl'

// Runs once before the whole suite. `migrate deploy` creates the test database
// if it doesn't exist yet and applies any migrations it hasn't seen.
export default function setup() {
	execSync('pnpm --filter @ski-blazek/db exec prisma migrate deploy', {
		stdio: 'inherit',
		env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
	})
}
