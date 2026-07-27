// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',

	css: ['@/assets/main.css'],

	devtools: { enabled: true },

	modules: ['@nuxt/eslint', '@nuxt/icon', '@pinia/nuxt'],

	runtimeConfig: {
		public: {
			apiUrl: process.env.NUXT_PUBLIC_API_URL,
		},
	},
})
