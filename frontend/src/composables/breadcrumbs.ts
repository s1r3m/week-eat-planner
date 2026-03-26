import { ROUTE_NAMES } from '@/domain/router/routeNames';
import type { RouteName } from '@/domain/router/routeNames';
import { useRecipeStore } from '@/features/recipe';
import { useWeekStore } from '@/features/week';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

type Breadcrumb = {
  label: string;
  to?: { name: string };
};

type Generator = (route: ReturnType<typeof useRoute>) => Breadcrumb[];

export const useBreadcrumbs = () => {
  const route = useRoute();
  const weekStore = useWeekStore();
  const recipeStore = useRecipeStore();

  const breadcrumbsGenerators: Partial<Record<RouteName, Generator>> = {
    [ROUTE_NAMES.WEEKS]: () => [{ label: 'My weeks' }],
    [ROUTE_NAMES.WEEK]: (route) => [
      { to: { name: ROUTE_NAMES.WEEKS }, label: 'My weeks' },
      { label: weekStore.getWeekNameById(route.params.id as string) || 'error' },
    ],
    [ROUTE_NAMES.RECIPES]: () => [{ label: 'Recipes' }],
    [ROUTE_NAMES.RECIPE]: () => [
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { label: recipeStore.getRecipeNameById(route.params.id as string) || 'error' },
    ],
    [ROUTE_NAMES.RECIPES_MY]: () => [
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { label: 'My recipes' },
    ],
    [ROUTE_NAMES.RECIPES_CREATE]: () => [
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes' },
      { label: 'Create' },
    ],
    [ROUTE_NAMES.RECIPES_FAVORITES]: () => [
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { label: 'Favorites' },
    ],
    [ROUTE_NAMES.PROFILE]: () => [{ label: 'Profile' }],
  };

  return computed(() => {
    const generator = breadcrumbsGenerators[route.name as RouteName];
    return generator ? generator(route) : [];
  });
};
