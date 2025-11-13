import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import {useAuthStore} from "@/stores/auth";
import { useErrorStore } from '@/stores/error';

const routes = [
    { path: '/', name: 'home', component: HomePage },
    { path: '/login', name: 'login', component: () => import('@/pages/Auth/LoginPage.vue') },
    { path: '/signup', name: 'signup', component: () => import('@/pages/Auth/SignupPage.vue') },
    { path: '/recipes', name: 'recipes', component: () => import('@/pages/Recipes/RecipesPage.vue'), meta: { requiresAuth: true } },
    { path: '/weeks', name: 'weeks', component: () => import('@/pages/Weeks/WeeksPage.vue'), meta: { requiresAuth: true } },
    { path: '/weeks/:id', name: 'week', component: () => import('@/pages/Weeks/WeekSinglePage.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

// router.beforeEach(to => {
//     const authStore = useAuthStore()
//     if (to.meta.requiresAuth && !authStore.isAuthenticated) {
//         const errorStore = useErrorStore()
//         errorStore.addError('You must be logged in to access that page.')
//         return { name: 'login' }
//     }
// })
