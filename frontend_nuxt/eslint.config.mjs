import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import oxlint from 'eslint-plugin-oxlint'
import perfectionist from 'eslint-plugin-perfectionist'
import unicorn from 'eslint-plugin-unicorn'
import vue from 'eslint-plugin-vue'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import { globalIgnores } from 'eslint/config'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  defineConfigWithVueTs(
    {
      files: [
        'app/**/*.{ts,vue,js,mjs}',
        'layers/**/*.{ts,vue,js,mjs}',
        '*.{ts,vue,js,mjs}',
      ],
      name: 'app/files-to-lint',
    },

    globalIgnores(['.nuxt', '.output', 'node_modules', 'dist']),

    vue.configs['flat/recommended'],
    vueA11y.configs['flat/recommended'],
    vueTsConfigs.strict,
    vueTsConfigs.stylistic,
    unicorn.configs.all,
    perfectionist.configs['recommended-natural'],
    importX.flatConfigs.recommended,
    importX.flatConfigs.typescript,

    skipFormatting,

    ...oxlint.configs['flat/all'],

    {
      rules: {
        camelcase: [
          'warn',
          { ignoreDestructuring: true, properties: 'always' },
        ],

        'import-x/first': 'warn',
        'import-x/newline-after-import': 'warn',
        'import-x/no-cycle': process.env.CI ? 'off' : 'error',
        'perfectionist/sort-objects': 'off',

        'unicorn/consistent-arrow-return-style': 'off',

        'unicorn/consistent-boolean-name': [
          'error',
          {
            checkVariables: 'never',
            wrappers: {
              ComputedRef: 'value',
              ModelRef: 'value',
              Ref: 'value',
              ShallowRef: 'value',
              WritableComputedRef: 'value',
            },
          },
        ],

        'unicorn/filename-case': 'off',

        'unicorn/name-replacements': [
          'warn',
          {
            replacements: {
              e: false,
              i: false,
              props: false,
              ref: false,
            },
          },
        ],

        'unicorn/no-barrel-files': 'off',
        'unicorn/no-null': 'off',
        'unicorn/prefer-temporal': 'off',
        'unicorn/try-complexity': ['error', { max: 3 }],

        'vue/block-lang': [
          'error',
          {
            script: {
              lang: 'ts',
            },
          },
        ],

        'vue/block-order': [
          'error',
          {
            order: ['script', 'template', 'style'],
          },
        ],

        'vue/component-api-style': ['error', ['script-setup']],
        'vue/component-name-in-template-casing': ['error', 'PascalCase'],
        'vue/custom-event-name-casing': ['warn'],

        'vue/define-emits-declaration': ['error', 'type-literal'],
        'vue/define-macros-order': [
          'warn',
          {
            defineExposeLast: true,
          },
        ],

        'vue/define-props-declaration': ['error'],

        'vue/enforce-style-attribute': [
          'error',
          { allow: ['scoped', 'plain'] },
        ],

        'vue/html-button-has-type': ['error'],

        'vue/html-indent': ['warn', 2],

        'vue/html-self-closing': [
          'warn',
          {
            html: {
              component: 'always',
              normal: 'never',
              void: 'always',
            },
          },
        ],

        'vue/max-attributes-per-line': 'off',

        'vue/multi-word-component-names': 'off',
        'vue/new-line-between-multi-line-property': ['warn'],
        'vue/no-ref-object-reactivity-loss': ['error'],

        'vue/no-required-prop-with-default': [
          'error',
          {
            autofix: true,
          },
        ],

        'vue/no-v-html': 'off',
        'vue/padding-line-between-blocks': ['warn', 'always'],
        'vue/padding-line-between-tags': [
          'warn',
          [{ blankLine: 'always', next: '*', prev: '*' }],
        ],

        'vue/require-default-prop': 'off',

        'vue/singleline-html-element-content-newline': 'off',

        'vuejs-accessibility/label-has-for': [
          'error',
          { required: { some: ['id', 'nesting'] } },
        ],
      },

      settings: {
        'import-x/resolver-next': [
          createTypeScriptImportResolver({
            alwaysTryTypes: true,
            project: ['./.nuxt/tsconfig.app.json'],
          }),
        ],
      },
    },
  ),
)
