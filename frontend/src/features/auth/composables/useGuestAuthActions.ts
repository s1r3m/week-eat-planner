import { computed } from 'vue';
import { useAuthStore } from '@/features/auth/store/auth';
import { useRoute } from 'vue-router';

export const useGuestAuthActions = () => {
  const { accessToken, logout } = useAuthStore();
  const route = useRoute();

  const showLogin = computed(() => route.name !== 'login');
  const showSignup = computed(() => route.name !== 'signup');
  const isLogged = computed(() => !!accessToken);
  const logoutHandler = async () => await logout();

  return {
    showLogin,
    isLogged,
    showSignup,
    logoutHandler,
  };
};
