import { getWeekQuery } from '@/api/weeks';
import { getRecipeQuery } from '@/api/recipes';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import type { RouteName } from '@/domain/router/routeNames';
import { useQuery } from '@pinia/colada';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

/**
 * Represents a single item in the breadcrumb navigation.
 */
type Breadcrumb = {
  label: string;
  to?: { name: string };
};

/**
 * A function that generates a list of breadcrumbs for a specific route.
 */
type Generator = () => Breadcrumb[];

/**
 * Composable for managing and generating breadcrumb navigation based on the current route.
 * Dynamically fetches data for routes that require contextual labels (e.g., week or recipe names).
 *
 * @returns A computed property containing the current list of breadcrumbs.
 */
export const useBreadcrumbs = () => {
  const route = useRoute();

  const { data: week } = useQuery(() => ({
    ...getWeekQuery(String(route.params.id)),
    enabled: route.name === ROUTE_NAMES.WEEK,
  }));

  const { data: recipe } = useQuery(() => ({
    ...getRecipeQuery(String(route.params.id)),
    enabled: route.name === ROUTE_NAMES.RECIPE,
  }));

  const breadcrumbsGenerators: Partial<Record<RouteName, Generator>> = {
    [ROUTE_NAMES.WEEKS]: () => [{ label: 'My weeks' }],
    [ROUTE_NAMES.WEEK]: () => [
      { to: { name: ROUTE_NAMES.WEEKS }, label: 'My weeks' },
      {
        label: week.value?.name || '',
      },
    ],
    [ROUTE_NAMES.RECIPES]: () => [{ label: 'Recipes' }],
    [ROUTE_NAMES.RECIPE]: () => [
      { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes' },
      { label: recipe.value?.name || '' },
    ],
    [ROUTE_NAMES.RECIPES_MY]: () => [{ label: 'My recipes' }],
    [ROUTE_NAMES.RECIPES_CREATE]: () => [
      { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes' },
      { label: 'Create' },
    ],
    [ROUTE_NAMES.RECIPE_EDIT]: () => [
      { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes' },
      {
        to: { name: ROUTE_NAMES.RECIPE, params: { id: recipe.value?.id } },
        label: recipe.value?.name || '',
      },
      { label: 'Edit' },
    ],
    [ROUTE_NAMES.RECIPES_FAVORITES]: () => [
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { label: 'Favorites' },
    ],
    [ROUTE_NAMES.PROFILE]: () => [{ label: 'Profile' }],
  };

  return computed(() => {
    const generator = breadcrumbsGenerators[route.name as RouteName];
    return generator ? generator() : [];
  });
};
