import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
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
        '~': path.resolve(__dirname, './src'),
      },
    },
    envDir: path.resolve(__dirname, '../..'),
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 5174,
    },
  }
})
