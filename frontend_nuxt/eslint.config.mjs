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
import { globalIgnores } from 'eslint/config'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
	defineConfigWithVueTs(
		{
			files: ['app/**/*.{ts,vue,js,mjs}'],
			name: 'app/files-to-lint',
		},

		globalIgnores(['.nuxt', '.output', 'node_modules', 'dist']),

		vue.configs['flat/recommended'],
		vueTsConfigs.strict,
		vueTsConfigs.stylistic,
		unicorn.configs.all,
		perfectionist.configs['recommended-natural'],
		importX.flatConfigs.recommended,
		importX.flatConfigs.typescript,

		skipFormatting,

		{
			rules: {
				camelcase: [
					'warn',
					{ ignoreDestructuring: true, properties: 'always' },
				],

				'import-x/first': 'warn',
				'import-x/newline-after-import': 'warn',
				'import-x/no-cycle': process.env.CI ? 'off' : 'error',

				'unicorn/filename-case': 'off',
				'unicorn/no-null': 'off',

				'unicorn/prevent-abbreviations': 'warn',
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

				'vue/html-indent': ['warn', 'tab'],

				'perfectionist/sort-objects': 'off',

				'perfectionist/sort-interfaces': 'off',

				'perfectionist/sort-union-types': 'off',

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
				'vue/singleline-html-element-content-newline': 'off',
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

		{
			files: ['app/api/**/*.{ts,js,mjs}'],
			name: 'app/api-naming-override',
			rules: {
				camelcase: 'off',
			},
		},

		...oxlint.configs['flat/all'],
	),
)
