import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import { useAuthStore } from '@/stores/auth';
import { useAlertStore } from '@/stores/error';
import { useClientIdStore } from '@/stores/clientId';
import { attemptRefresh } from '@/api/client';

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/login', name: 'login', component: () => import('@/pages/Auth/LoginPage.vue') },
  { path: '/signup', name: 'signup', component: () => import('@/pages/Auth/SignupPage.vue') },
  {
    path: '/recipes',
    name: 'recipes',
    component: () => import('@/pages/Recipes/RecipesPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/weeks',
    name: 'weeks',
    component: () => import('@/pages/Weeks/WeeksPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/weeks/:id',
    name: 'week',
    component: () => import('@/pages/Weeks/WeekSinglePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/Profile/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();
  const errorStore = useAlertStore();
  const clientIdStore = useClientIdStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Attempt a silent refresh using the refresh token cookie. If it
    // succeeds we'll set the access token and allow navigation. If it
    // fails we redirect to login.
    try {
      const data = await attemptRefresh(clientIdStore.getClientId());
      // data should be the same shape as UserLoginResponse
      authStore.setToken(data);
      return true;
    } catch (err: any) {
      if (from.name !== 'login') {
        errorStore.addError('You must be logged in to access that page.');
      }
      return { name: 'login', query: { redirect: to.fullPath } };
    }
  }
});
