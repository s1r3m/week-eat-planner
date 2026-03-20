import { createRouter, createWebHistory } from 'vue-router';

import GuestLayout from '@/layouts/TheGuestLayout.vue';
import AuthLayout from '@/layouts/TheAuthLayout.vue';

import PromoPage from '@/pages/PromoPage.vue';
import { useAuthStore } from '@/features/auth';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const routes = [
  {
    path: '/',
    component: GuestLayout,
    children: [
      { path: '', name: ROUTE_NAMES.HOME, component: PromoPage },
      {
        path: 'login',
        name: ROUTE_NAMES.LOGIN,
        component: () => import('@/pages/Auth/LoginPage.vue'),
      },
      {
        path: 'signup',
        name: ROUTE_NAMES.SIGNUP,
        component: () => import('@/pages/Auth/SignupPage.vue'),
      },
      {
        path: 'forgot-password',
        name: ROUTE_NAMES.FORGOT_PASSWORD,
        component: () => import('@/pages/Auth/ForgotPasswordPage.vue'),
      },
    ],
  },
  {
    path: '/app',
    component: AuthLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'weeks',
        name: ROUTE_NAMES.WEEKS,
        component: () => import('@/pages/Weeks/WeeksPage.vue'),
      },
      {
        path: 'weeks/:id',
        name: ROUTE_NAMES.WEEK,
        component: () => import('@/pages/Weeks/WeekSinglePage.vue'),
      },
      {
        path: 'profile',
        name: ROUTE_NAMES.PROFILE,
        component: () => import('@/pages/Profile/ProfilePage.vue'),
      },
      {
        path: 'recipes',
        name: ROUTE_NAMES.RECIPES,
        component: () => import('@/pages/Recipes/AllRecipesPage.vue'),
      },
      {
        path: 'recipes/create',
        name: ROUTE_NAMES.RECIPES_CREATE,
        component: () => import('@/pages/Recipes/RecipesCreatePage.vue'),
      },
      {
        path: 'recipes/myrecipes',
        name: ROUTE_NAMES.RECIPES_MY,
        component: () => import('@/pages/Recipes/MyRecipesPage.vue'),
      },
      {
        path: 'recipes/favorites',
        name: ROUTE_NAMES.RECIPES_FAVORITES,
        component: () => import('@/pages/Recipes/Favorites.vue'),
      },
    ],
  },

  // Not found
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.NOT_FOUND,
    component: () => import('@/pages/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();
  if (!authStore.isInitialized) await authStore.init();

  if (!authStore.accessToken && to.meta.requiresAuth) {
    return {
      name: ROUTE_NAMES.LOGIN,
      query: { redirect: to.fullPath },
    };
  }
});
