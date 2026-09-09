// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',

	css: ['@/assets/styles/main.css'],

	imports: {
		dirs: ['@/composables/**', '@/api/**'],
	},

	devtools: { enabled: true },

	modules: [
		'@nuxt/eslint',
		'@nuxt/icon',
		'@pinia/nuxt',
		'@pinia/colada-nuxt',
		'@nuxtjs/color-mode',
	],

	colorMode: {
		classSuffix: '',
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

	runtimeConfig: {
		public: {
			apiBase: process.env.NUXT_PUBLIC_API_BASE,
		},
	},
})
