import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router';
import type { RouterScrollBehavior } from 'vue-router';

import GuestLayout from '@/layouts/TheGuestLayout.vue';
import AuthLayout from '@/layouts/TheAuthLayout.vue';

import PromoPage from '@/pages/PromoPage.vue';
import { useAuthStore } from '@/features/auth/store/auth';
import { useWeekStore } from '@/features/week/store/weeks';

const routes = [
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore();
      return authStore.isAuthenticated ? '/weeks' : '/promo';
    },
  },
  {
    path: '/',
    component: GuestLayout,
    children: [
      { path: 'promo', name: 'promo', component: PromoPage },
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
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/pages/Auth/ForgotPasswordPage.vue'),
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
        meta: { breadcrumbs: [{ label: 'All recipes' }] },
      },
      {
        path: 'weeks',
        name: 'weeks',
        component: () => import('@/pages/Weeks/WeeksPage.vue'),
        meta: { breadcrumbs: [{ label: 'My weeks' }] },
      },
      {
        path: 'weeks/:id',
        name: 'week',
        component: () => import('@/pages/Weeks/WeekSinglePage.vue'),
        meta: {
          breadcrumbs: (route: RouteLocationNormalizedLoaded) => {
            const weekStore = useWeekStore();
            const weekName = weekStore.getWeekNameById(route.params.id as string);
            return [{ to: '/weeks', label: 'My weeks' }, { label: weekName }];
          },
        },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/Profile/ProfilePage.vue'),
        meta: { breadcrumbs: [{ label: 'My profile' }] },
      },
    ],
  },

  // otherwise redirect to home
  { path: '/:pathMatch(.*)*', redirect: '/promo' },
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
  if (!authStore.accessToken && to.meta.requiresAuth) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});
