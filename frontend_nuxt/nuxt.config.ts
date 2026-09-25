export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap',
        },
      ],
    },
  },

  compatibilityDate: '2025-07-15',

  css: ['@/core/assets/styles/main.css'],

  devtools: { enabled: true },

  dir: {
    assets: '~~/app/core/assets',
    layouts: '~~/app/core/layouts',
    middleware: '~~/app/core/router/middleware',
  },

  imports: {
    dirs: [],
    scan: false,
  },
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    'nuxt-open-fetch',
  ],

  colorMode: { classSuffix: '', storageKey: 'wep-theme' },

  nitro: {
    devProxy: {
      '/backend-api': {
        changeOrigin: true,
        cookieDomainRewrite: '',
        target: process.env.NUXT_PUBLIC_API_URL,
      },
    },
  },

  openFetch: {
    clients: {
      baseApi: {
        baseURL: process.env.NUXT_PUBLIC_API_URL,
        schema: 'http://localhost:8000/openapi.json',
      },
    },
    disableNuxtPlugin: true,
  },

  postcss: {
    plugins: {
      '@csstools/postcss-global-data': {
        files: ['app/core/assets/styles/foundation/media.css'],
      },
      'postcss-custom-media': {},
      'postcss-mixins': {
        mixinsFiles: ['app/core/assets/styles/foundation/mixins.css'],
      },
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
    },
  },

  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit', 'reka-ui'],
    },
  },
})
