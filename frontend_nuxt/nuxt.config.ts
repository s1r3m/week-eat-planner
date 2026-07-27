// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',

	css: [
		'@/assets/styles/reset.css',
		'@/assets/styles/tokens.css',
		'@/assets/styles/typography.scss',
		'@/assets/styles/globals.scss',
	],

	devtools: { enabled: true },

	modules: ['@nuxt/eslint', '@nuxt/icon', '@pinia/nuxt'],

	runtimeConfig: {
		public: {
			apiUrl: process.env.NUXT_PUBLIC_API_URL,
		},
	},

	app: {
		head: {
			title: 'Week Eat Planner',
			htmlAttrs: {
				lang: 'en',
			},
			link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
		},
	},
})
