import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'

const routes = [
    { path: '/', name: 'home', component: Home },
    { path: '/login', name: 'login', component: () => import('@/pages/Login.vue') },
    { path: '/signup', name: 'signup', component: () => import('@/pages/Signup.vue') },
    { path: '/weeks', name: 'weeks', component: () => import('@/pages/Weeks.vue') },
    { path: '/weeks/:id', name: 'week', component: () => import('@/pages/Week.vue') },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
