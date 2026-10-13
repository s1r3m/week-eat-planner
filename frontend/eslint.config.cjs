const js = require('@eslint/js');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const vuePlugin = require('eslint-plugin-vue');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        google: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      parser: require('vue-eslint-parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tsParser,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        google: 'readonly',
      },
    },
    plugins: {
      vue: vuePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off',
      'no-unused-vars': 'warn',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      'vue/one-component-per-file': 'off',
    },
  },
  {
    files: ['src/components/ui/**/*.vue'],
    rules: {
      'vue/require-default-prop': 'off',
    },
  },
];
