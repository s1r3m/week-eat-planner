import { computed } from 'vue';
import { useAuthStore } from '@/features/auth/store/auth';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

export const useGuestAuthActions = () => {
  const store = useAuthStore();
  const { accessToken } = storeToRefs(store);
  const { logout } = store;
  const route = useRoute();

  const showLogin = computed(() => route.name !== 'login');
  const showSignup = computed(() => route.name !== 'signup');
  const isLogged = computed(() => !!accessToken.value);
  const logoutHandler = async () => await logout();

  return {
    showLogin,
    isLogged,
    showSignup,
    logoutHandler,
  };
};
