/**
 * Centralized registry of all route names used in the application.
 * Prevents magic strings and ensures type safety across the router and navigation.
 */
export const ROUTE_NAMES = {
  HOME: 'home' as string,
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT_PASSWORD: 'forgot-password',

  WEEKS: 'weeks',
  WEEK: 'week',

  PROFILE: 'profile',

  RECIPES: 'recipes',
  RECIPE: 'recipe',
  RECIPES_CREATE: 'recipes-create',
  RECIPES_MY: 'recipes-my',
  RECIPES_FAVORITES: 'recipes-favorites',

  NOT_FOUND: 'not-found',
} as const;

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];
