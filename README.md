# eslint-plugin-require-react-fc

An ESLint plugin to enforce explicit `React.FC` return types for **arrow functions** returning JSX in React projects. This helps ensure consistent typing and readability in TypeScript-based React projects.

## Installation

To use this plugin, you’ll need to have ESLint and TypeScript installed in your project.

### Install the plugin:

```bash
npm install eslint-plugin-require-react-fc --save-dev
```

### Install peer dependencies (if not already installed):

```bash
npm install eslint typescript --save-dev
```

## Usage

Add `require-react-fc` to your ESLint configuration file.

### Example `.eslintrc.json`:

```json
{
  "plugins": ["require-react-fc"],
  "rules": {
    "require-react-fc/require-react-fc": "error"
  }
}
```

### Example `.eslintrc.js`:

```javascript
module.exports = {
  plugins: ['require-react-fc'],
  rules: {
    'require-react-fc/require-react-fc': 'error',
  },
};
```

## Rule: `require-react-fc`

This rule enforces that all **arrow functions** returning JSX explicitly declare their return type as `React.FC`.

### Why use this rule?

Explicitly typing React components as `React.FC`:

- Enhances code readability.
- Ensures consistency across the codebase.
- Makes it easier to understand the expected props of a component.

## Options

This rule supports the following configuration:

### `ignoreComponents`

An optional array of component names that should be ignored by the rule. This can be useful for utility functions or non-component arrow functions that happen to return JSX.

### Example Configuration:

```json
{
  "rules": {
    "require-react-fc/require-react-fc": [
      "error",
      {
        "ignoreComponents": ["MyIgnoredComponent", "AnotherIgnoredComponent"]
      }
    ]
  }
}
```

## Example Code

### Valid:

```tsx
const MyComponent: React.FC = () => {
  return <div>Hello, world!</div>;
};
```

### Invalid:

```tsx
const MyComponent = () => {
  return <div>Hello, world!</div>;
};
```

This will produce the following error:

```
Arrow function returning JSX must explicitly declare its type as React.FC.
```

## Fixable

This rule supports auto-fixing. Use the `--fix` flag with ESLint to automatically insert `React.FC` where necessary:

```bash
npx eslint . --fix
```

## Contributing

Feel free to open issues or submit pull requests for any improvements or feature requests!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
