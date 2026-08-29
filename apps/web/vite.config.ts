import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
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
		envDir: path.resolve(import.meta.dirname, '../..'),
		server: {
			port: env.APP_PORT ? Number(env.APP_PORT) : 5174,
		},
	}
})
