import { reactConfig } from '@ski-blazek/eslint-config/react'

/**
 * ESLint configuration for the web app.
 * Uses the shared React configuration from @ski-blazek/eslint-config.
 *
 * You can extend this with app-specific rules if needed:
 * export default [
 *   ...reactInternalConfig,
 *   { rules: { 'your-rule': 'error' } }
 * ];
 */

export default [
  ...reactConfig,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      'react/no-children-prop': [
        "error",
        {
          allowFunctions: true,
        },
      ],
    },
  },
]
