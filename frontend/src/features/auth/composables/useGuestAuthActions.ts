import { computed } from 'vue';
import { useAuthStore } from '@/features/auth/store/auth';
import { useRoute, useRouter } from 'vue-router';

export const useGuestAuthActions = () => {
  const { accessToken, logout } = useAuthStore();
  const route = useRoute();
  const router = useRouter();

  const showLogin = computed(() => !accessToken && route.name !== 'login');
  const showSignup = computed(() => !accessToken && route.name !== 'signup');
  const showLogout = computed(() => !!accessToken);
  const logoutHandler = () => {
    logout();
    router.go(0);
  };

  return {
    showLogin,
    showLogout,
    showSignup,
    logoutHandler,
  };
};
