import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as AuthForm } from './AuthForm.vue';
export { default as AuthCard } from './AuthCard.vue';
export { default as AuthFooter } from './AuthFooter.vue';

export const authVariants = cva('', {
  variants: {
    variant: {
      login: '',
      signup: '',
    },
  },
  defaultVariants: {
    variant: 'login',
  },
});

export type AuthVariants = VariantProps<typeof authVariants>;

export const authConfig = {
  login: {
    form: {
      passwordPlaceholder: 'Your password',
      submitButton: 'Login',
      submittingButton: 'Logging in',
    },
    footer: {
      googleButton: 'Login with Google',
      toggleText: "Don't have an account?",
      toggleLinkText: 'Sign up',
      toggleRoute: '/signup',
      showForgot: true,
    },
  },
  signup: {
    form: {
      passwordPlaceholder: 'Minimum 6 characters',
      submitButton: 'Sign up',
      submittingButton: 'Creating the account',
    },
    footer: {
      googleButton: 'Signup with Google',
      toggleText: 'Already have an account?',
      toggleLinkText: 'Login',
      toggleRoute: '/login',
      showForgot: false,
    },
  },
} as const;
