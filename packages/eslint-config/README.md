# @repo/eslint-config

Shared ESLint configurations for the habit tracker monorepo.

## Configurations

### `base`

Base configuration for all TypeScript/JavaScript code. Use this for Node.js backend code, utilities, and shared packages.

```js
import { baseConfig } from "@repo/eslint-config/base";

export default baseConfig;
```

### `react-internal`

Configuration for React applications. Extends the base config with React-specific rules and plugins.

```js
import { reactInternalConfig } from "@repo/eslint-config/react-internal";

export default reactInternalConfig;
```

## Usage

Add the package as a dependency:

```json
{
  "devDependencies": {
    "@repo/eslint-config": "workspace:*"
  }
}
```

Then import and use the configuration in your `eslint.config.js` file.
