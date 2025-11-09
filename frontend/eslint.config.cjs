const js = require("@eslint/js");
const globals = require("globals");
const vuePlugin = require("eslint-plugin-vue");
const vueRecommended = require("eslint-plugin-vue/lib/configs/vue3-recommended");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.vue"],
    languageOptions: {
      parser: require("vue-eslint-parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
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
