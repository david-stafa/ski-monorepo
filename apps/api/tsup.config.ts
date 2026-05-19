import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  platform: 'node',
  clean: true,
  sourcemap: true,
  noExternal: [/@ski-blazek\/[\w-]+/],
  external: [
    'pg',
    /^@prisma\//,
    'better-auth',
    /^better-auth\//,
  ],
})
