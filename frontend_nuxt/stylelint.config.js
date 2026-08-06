export default {
	extends: [
		'stylelint-config-recommended',
		'stylelint-config-standard-vue',
		'stylelint-config-property-sort-order-smacss',
	],

	plugins: ['stylelint-order'],

	rules: {
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['custom-media', 'media'],
			},
		],

		'color-function-notation': 'modern',
		'custom-property-pattern': null,
		'declaration-property-value-no-unknown': null,
		'no-descending-specificity': [true, { severity: 'warning' }],

		'property-no-unknown': [
			true,
			{
				ignoreProperties: ['corner-shape'],
			},
		],

		'rule-empty-line-before': [
			'always',
			{
				except: ['first-nested'],
				ignore: ['after-comment'],
			},
		],

		'selector-class-pattern': null,
	},
}
