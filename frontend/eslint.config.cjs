const js = require("@eslint/js");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const vuePlugin = require("eslint-plugin-vue");
const vueRecommended = require("eslint-plugin-vue/lib/configs/vue3-recommended");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.vue"],
    languageOptions: {
      parser: require("vue-eslint-parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: tsParser,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      vue: vuePlugin,
    },
    rules: {
      ...vueRecommended.rules,
      "vue/multi-word-component-names": "off",
      "vue/html-self-closing": "off",
      "no-unused-vars": "warn",
    },
  },
];
