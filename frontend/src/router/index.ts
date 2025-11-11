import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import {useAuthStore} from "@/stores/auth";

const routes = [
    { path: '/', name: 'home', component: HomePage },
    { path: '/login', name: 'login', component: () => import('@/pages/Auth/LoginPage.vue') },
    { path: '/signup', name: 'signup', component: () => import('@/pages/Auth/SignupPage.vue') },
    { path: '/recipes', name: 'recipes', component: () => import('@/pages/Recipes/RecipesPage.vue') },
    { path: '/weeks', name: 'weeks', component: () => import('@/pages/Weeks/WeeksPage.vue') },
    { path: '/weeks/:id', name: 'week', component: () => import('@/pages/Weeks/WeekSinglePage.vue') },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
