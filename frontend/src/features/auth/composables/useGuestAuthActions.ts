import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { isAuthenticated } from '@/api/auth';

/**
 * Composable for managing guest-specific authentication actions and visibility states.
 * Useful for displaying login/signup buttons conditionally.
 */
export const useGuestAuthActions = () => {
  const route = useRoute();

  const showLogin = computed(() => route.name !== 'login');
  const showSignup = computed(() => route.name !== 'signup');
  const isLogged = computed(() => isAuthenticated.value);

  return {
    showLogin,
    isLogged,
    showSignup,
  };
};
