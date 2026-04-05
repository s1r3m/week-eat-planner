import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBreadcrumbs } from '../breadcrumbs';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useRoute } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { reactive, ref } from 'vue';
import { useQuery } from '@pinia/colada';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

vi.mock('@pinia/colada', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pinia/colada')>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

describe('useBreadcrumbs', () => {
  const mockRoute = reactive({
    name: '',
    params: {} as Record<string, string>,
  });

  const weekData = ref<{ name: string } | null>(null);
  const recipeData = ref<{ name: string } | null>(null);

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(useRoute).mockReturnValue(mockRoute as any);
    vi.mocked(useQuery).mockImplementation((options: any) => {
      const opt = typeof options === 'function' ? options() : options;
      if (opt.key[0] === 'weeks' && opt.key[1] === 'detail') {
        return { data: weekData } as any;
      }
      if (opt.key[0] === 'recipes' && opt.key[1] === 'detail') {
        return { data: recipeData } as any;
      }
      return { data: ref(null) } as any;
    });

    vi.clearAllMocks();
    mockRoute.name = '';
    mockRoute.params = {};
    weekData.value = null;
    recipeData.value = null;
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
    weekData.value = { name: 'Week Name' };

    const breadcrumbs = useBreadcrumbs();

    expect(breadcrumbs.value).toEqual([
      { to: { name: ROUTE_NAMES.WEEKS }, label: 'My weeks' },
      { label: 'Week Name' },
    ]);
  });

  it('should return "" for WEEK route if week name is not loaded', () => {
    mockRoute.name = ROUTE_NAMES.WEEK;
    mockRoute.params = { id: 'week-1' };
    weekData.value = null;

    const breadcrumbs = useBreadcrumbs();

    expect(breadcrumbs.value[1].label).toBe('');
  });

  it('should return breadcrumbs for RECIPES route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPES;
    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([{ label: 'Recipes' }]);
  });

  it('should return "" for RECIPE route if recipe name is not loaded', () => {
    mockRoute.name = ROUTE_NAMES.RECIPE;
    mockRoute.params = { id: 'recipe-1' };
    recipeData.value = null;

    const breadcrumbs = useBreadcrumbs();
    expect(breadcrumbs.value[1].label).toBe('');
  });

  it('should return breadcrumbs for RECIPE route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPE;
    mockRoute.params = { id: 'recipe-1' };
    recipeData.value = { name: 'Recipe Name' };

    const breadcrumbs = useBreadcrumbs();

    expect(breadcrumbs.value).toEqual([
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { label: 'Recipe Name' },
    ]);
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
