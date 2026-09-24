// import { useAuthStore } from '@/modules/auth/stores/auth'

// export default defineNuxtPlugin({
//   name: 'auth-init',
//   dependsOn: ['base-api'],
//   async setup() {
//     const authStore = useAuthStore()
//     await callOnce('auth:init', async () => {
//       try {
//         await authStore.init()
//       } catch {
//         // The route guard retries initialization and reports failures on protected pages.
//       }
//     })
//   },
// })
