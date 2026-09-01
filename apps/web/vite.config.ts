import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// The repo keeps a single .env at the root, so both `loadEnv` here and Vite's own `envDir` below must point at it
const envDir = path.resolve(import.meta.dirname, '../..')

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, envDir, '')

	// VITE_* values are inlined at build time, so a missing VITE_API_URL does not
	// fail at boot — it ships a bundle pointing at localhost that looks fine until
	// someone opens it. Fail the build instead, while it can still be fixed.
	if (mode === 'production' && !env.VITE_API_URL) {
		throw new Error(
			'VITE_API_URL must be set for a production build, otherwise the bundle points at localhost.'
		)
	}

	return {
		plugins: [
			devtools(),
			tanstackRouter({
				target: 'react',
				autoCodeSplitting: true,
			}),
			react(),
			tailwindcss(),
		],
		// need to resolve for ~ defined in tsconfig.app.json
		resolve: {
			alias: {
				'~': path.resolve(import.meta.dirname, './src'),
			},
		},
		envDir,
		server: {
			port: env.APP_PORT ? Number(env.APP_PORT) : 5174,
		},
	}
})
