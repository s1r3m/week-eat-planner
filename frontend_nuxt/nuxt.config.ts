// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',

	css: [
		'@/assets/styles/reset.css',
		'@/assets/styles/tokens.css',
		'@/assets/styles/typography.scss',
		'@/assets/styles/globals.scss',
	],

	imports: {
		dirs: ['@/composables/**'],
	},

	devtools: { enabled: true },

	modules: ['@nuxt/eslint', '@nuxt/icon', '@pinia/nuxt'],

	app: {
		head: {
			title: 'Week Eat Planner',
			htmlAttrs: {
				lang: 'en',
			},
			link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
		},
	},

	runtimeConfig: {
		public: {
			apiBase: process.env.NUXT_PUBLIC_API_BASE,
		},
	},
})
