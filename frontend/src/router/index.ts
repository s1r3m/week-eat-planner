import { createRouter, createWebHistory } from 'vue-router';
import type { RouterScrollBehavior } from 'vue-router';

import GuestLayout from '@/layouts/TheGuestLayout.vue';
import AuthLayout from '@/layouts/TheAuthLayout.vue';

import HomePage from '@/pages/HomePage.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    component: GuestLayout,
    children: [
      { path: '', name: 'home', component: HomePage },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/Auth/LoginPage.vue'),
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('@/pages/Auth/SignupPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: AuthLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'recipes',
        name: 'recipes',
        component: () => import('@/pages/Recipes/RecipesPage.vue'),
      },
      {
        path: 'weeks',
        name: 'weeks',
        component: () => import('@/pages/Weeks/WeeksPage.vue'),
      },
      {
        path: 'weeks/:id',
        name: 'week',
        component: () => import('@/pages/Weeks/WeekSinglePage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/Profile/ProfilePage.vue'),
      },
    ],
  },

  // otherwise redirect to home
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

type ScrollPositionResult = {
  left: number;
  top: number;
  behavior?: 'auto' | 'smooth';
};

const scrollToHashWithOffset = (hash: string): Promise<ScrollPositionResult> => {
  if (typeof window === 'undefined') {
    return Promise.resolve({ left: 0, top: 0 });
  }

  return new Promise<ScrollPositionResult>((resolve) => {
    requestAnimationFrame(() => {
      const target = document.querySelector(hash);
      if (!target) {
        resolve({ left: 0, top: 0 });
        return;
      }

      const header = document.querySelector('header.sticky');
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const top = window.scrollY + target.getBoundingClientRect().top - headerHeight - 16;

      resolve({
        left: 0,
        top: Math.max(top, 0),
        behavior: 'smooth',
      });
    });
  });
};

const scrollBehavior: RouterScrollBehavior = async (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition;
  }

  if (to.hash) {
    return scrollToHashWithOffset(to.hash);
  }

  return { left: 0, top: 0 };
};

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior,
});

export default router;

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});
