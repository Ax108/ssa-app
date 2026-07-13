// eslint.config.js
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier/flat");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const jestPlugin = require("eslint-plugin-jest");

// ESLint 9 requires the same plugin object reference across config blocks.
// Reuse expo's @typescript-eslint instance (not tseslint.plugin).
const expoTsPlugin = [...expoConfig].find(
  (block) => block.plugins?.["@typescript-eslint"],
)?.plugins?.["@typescript-eslint"];

module.exports = defineConfig([
  // Do not spread tseslint.configs.* — that redefines @typescript-eslint.
  ...expoConfig,

  // ─── Ignored paths ────────────────────────────────────────────────────────
  {
    ignores: [
      "dist/",
      "build/",
      "docs/",
      "android/",
      "ios/",
      ".expo/",
      "node_modules/",
      ".prettierrc.js",
      "babel.config.js",
      "metro.config.js",
      "eslint.config.js",
      "jest.setup.js",
      "plugins/**",
      "react-native.config.js",
      "jest.config.js",
      "index.ts",
    ],
  },

  // ─── All source files ─────────────────────────────────────────────────────
  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        __DEV__: "readonly",
      },
    },

    plugins: {
      prettier: require("eslint-plugin-prettier"),
      ...(expoTsPlugin ? { "@typescript-eslint": expoTsPlugin } : {}),
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
        node: {
          extensions: [
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".svg",
          ],
        },
      },
    },

    rules: {
      // FORMATTING
      "prettier/prettier": "error",

      // REACT
      "react/react-in-jsx-scope": "off",
      "react/jsx-no-useless-fragment": "warn",
      "react/no-deprecated": "warn",

      // REACT NATIVE
      "react-native/no-inline-styles": "off",
      "react-native/no-raw-text": "off",

      // REACT HOOKS
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",

      // IMPORTS
      "import/no-unresolved": "error",
      "import/no-deprecated": "warn",

      // TYPESCRIPT
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/no-explicit-any": "off",

      // JAVASCRIPT / GENERAL
      "no-unused-vars": "off", // Turned off in favor of TS rule
      "no-console": "off",
      "no-warning-comments": "warn",
      "no-nested-ternary": "off",
      "prefer-const": "warn",
    },
  },

  // ─── Test files ───────────────────────────────────────────────────────────
  {
    files: [
      "src/features/**/tests/**/*.{ts,tsx}",
      "src/shared/**/tests/**/*.{ts,tsx}",
      "src/tests/**/*.{ts,tsx}",
    ],

    plugins: {
      jest: jestPlugin,
    },

    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.jest,
      },
    },

    rules: {
      ...jestPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // ─── Jest root config / setup ─────────────────────────────────────────────
  {
    files: ["jest.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      "@typescript-eslint/no-floating-promises": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["jest.setup.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      "@typescript-eslint/no-floating-promises": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },

  // Disable ESLint stylistic rules that conflict with Prettier.
  eslintConfigPrettier,
]);
