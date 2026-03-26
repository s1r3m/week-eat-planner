import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBreadcrumbs } from '../breadcrumbs';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useRoute } from 'vue-router';
import { useWeekStore } from '@/features/week';
import { createPinia, setActivePinia } from 'pinia';
import { reactive } from 'vue';
import { useRecipeStore } from '@/features/recipe';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

vi.mock('@/features/week', () => ({
  useWeekStore: vi.fn(),
}));

vi.mock('@/features/recipe', () => ({
  useRecipeStore: vi.fn(),
}));

describe('useBreadcrumbs', () => {
  const mockRoute = reactive({
    name: '',
    params: {} as Record<string, string>,
  });

  const mockWeekStore = {
    getWeekNameById: vi.fn(),
  };

  const mockRecipeStore = {
    getRecipeNameById: vi.fn(),
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(useRoute).mockReturnValue(mockRoute as any);
    vi.mocked(useWeekStore).mockReturnValue(mockWeekStore as any);
    vi.mocked(useRecipeStore).mockReturnValue(mockRecipeStore as any);
    vi.clearAllMocks();
    mockRoute.name = '';
    mockRoute.params = {};
  });

  it('should return empty breadcrumbs for unknown route', () => {
    mockRoute.name = 'UNKNOWN_ROUTE';
    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([]);
  });

  it('should return breadcrumbs for WEEKS route', () => {
    mockRoute.name = ROUTE_NAMES.WEEKS;
    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([{ label: 'My weeks' }]);
  });

  it('should return breadcrumbs for WEEK route', () => {
    mockRoute.name = ROUTE_NAMES.WEEK;
    mockRoute.params = { id: 'week-1' };
    mockWeekStore.getWeekNameById.mockReturnValue('Week Name');

    const breadcrumbs = useBreadcrumbs();

    expect(breadcrumbs.value).toEqual([
      { to: { name: ROUTE_NAMES.WEEKS }, label: 'My weeks' },
      { label: 'Week Name' },
    ]);
    expect(mockWeekStore.getWeekNameById).toHaveBeenCalledWith('week-1');
  });

  it('should return "error" for WEEK route if week name is not found', () => {
    mockRoute.name = ROUTE_NAMES.WEEK;
    mockRoute.params = { id: 'week-1' };
    mockWeekStore.getWeekNameById.mockReturnValue(undefined);

    const breadcrumbs = useBreadcrumbs();

    expect(breadcrumbs.value[1].label).toBe('error');
  });

  it('should return breadcrumbs for RECIPES route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPES;
    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([{ label: 'Recipes' }]);
  });

  it('should return "error" for RECIPE route if recipe name is not found', () => {
    mockRoute.name = ROUTE_NAMES.RECIPE;
    mockRoute.params = { id: 'recipe-1' };
    mockRecipeStore.getRecipeNameById.mockReturnValue(undefined);

    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value[1].label).toBe('error');
  });

  it('should return breadcrumbs for RECIPE route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPE;
    mockRoute.params = { id: 'recipe-1' };
    mockRecipeStore.getRecipeNameById.mockReturnValue('Recipe Name');

    const breadcrumbs = useBreadcrumbs();

    expect(breadcrumbs.value).toEqual([
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { label: 'Recipe Name' },
    ]);
    expect(mockRecipeStore.getRecipeNameById).toHaveBeenCalledWith('recipe-1');
  });

  it('should return breadcrumbs for RECIPES_MY route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPES_MY;
    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { label: 'My recipes' },
    ]);
  });

  it('should return breadcrumbs for RECIPES_CREATE route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPES_CREATE;
    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes' },
      { label: 'Create' },
    ]);
  });

  it('should return breadcrumbs for RECIPES_FAVORITES route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPES_FAVORITES;
    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { label: 'Favorites' },
    ]);
  });

  it('should return breadcrumbs for PROFILE route', () => {
    mockRoute.name = ROUTE_NAMES.PROFILE;
    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([{ label: 'Profile' }]);
  });
});
