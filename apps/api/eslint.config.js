import { config } from '@ski-blazek/eslint-config/base'

/**
 * ESLint configuration for the API app.
 * Uses the shared base configuration from @ski-blazek/eslint-config.
 */

export default [
  ...config,
  {
    rules: {
      // Allow intentionally-unused args/vars when prefixed with "_".
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      /**
       * Ban the "~/" tsconfig path alias in api source.
       *
       * The web app imports `AppRouter` directly from api *source*
       * (`@ski-blazek/api/trpc` -> `src/routers/_app.ts`). When the web
       * project's tsc walks into these files it resolves "~/" with its OWN
       * tsconfig paths (which point at apps/web/src), so an aliased import
       * silently resolves to `any` — collapsing tRPC procedure input types
       * to `any` on the client. Relative imports resolve consistently
       * regardless of which project follows the import graph.
       */
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['~/*'],
              message:
                'Use a relative import instead of the "~/" alias in apps/api. The web app resolves AppRouter from api source using its own tsconfig, which turns "~/" imports into `any` and breaks tRPC input types.',
            },
          ],
        },
      ],
    },
  },
]
