/**
 * Vue Router configuration.
 * Defines the application's routes, layouts, and navigation guards.
 */
import { createRouter, createWebHistory } from 'vue-router';

import GuestLayout from '@/layouts/TheGuestLayout.vue';
import AuthLayout from '@/layouts/TheAuthLayout.vue';
import PromoPage from '@/pages/PromoPage.vue';

import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { isAuthenticated, initAuth } from '@/api/auth';

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
        component: () => import('@/pages/Recipes/RecipesPage.vue'),
      },
      {
        path: 'recipes/create',
        name: ROUTE_NAMES.RECIPES_CREATE,
        component: () => import('@/pages/Recipes/RecipesCreatePage.vue'),
      },
      {
        path: 'recipes/my_recipes',
        name: ROUTE_NAMES.RECIPES_MY,
        component: () => import('@/pages/Recipes/MyRecipesPage.vue'),
      },
      {
        path: 'recipes/favorites',
        name: ROUTE_NAMES.RECIPES_FAVORITES,
        component: () => import('@/pages/Recipes/RecipesFavorites.vue'),
      },
      {
        path: 'recipes/:id',
        name: ROUTE_NAMES.RECIPE,
        component: () => import('@/pages/Recipes/RecipeSinglePage.vue'),
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

let isInitialized = false;

/**
 * Reset the initialization state of the router.
 * Used for testing purposes only.
 */
export const _resetRouterState = () => {
  isInitialized = false;
};

router.beforeEach(async (to, from) => {
  if (!isInitialized) {
    try {
      await initAuth();
    } catch (err: unknown) {
      console.error('Auth initialization failed:', err);
      isAuthenticated.value = false;
    } finally {
      isInitialized = true;
    }
  }

  if (!isAuthenticated.value && to.meta.requiresAuth) {
    return {
      name: ROUTE_NAMES.LOGIN,
      query: { redirect: to.fullPath },
    };
  }

  if (
    !to.meta?.requiresAuth &&
    isAuthenticated.value &&
    to.name !== ROUTE_NAMES.HOME &&
    to.name !== ROUTE_NAMES.NOT_FOUND
  ) {
    return {
      name: ROUTE_NAMES.WEEKS,
    };
  }
});
