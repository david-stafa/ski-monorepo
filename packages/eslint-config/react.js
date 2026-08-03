import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReact from 'eslint-plugin-react'
import globals from 'globals'
import { config as baseConfig } from './base.js'

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]} */
export const reactConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  // v7 ships the React Compiler rules alongside rules-of-hooks/exhaustive-deps.
  pluginReactHooks.configs.flat['recommended-latest'],
  {
    // Pinned rather than 'detect': eslint-plugin-react's version detection
    // calls context.getFilename(), removed in ESLint 10.
    settings: { react: { version: '19.2' } },
    rules: {
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@ski-blazek/db',
              message:
                'Use `@ski-blazek/db/browser` from the web app — the root export pulls in Prisma runtime.',
            },
          ],
        },
      ],
    },
  },
]
