import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { useBreadcrumbs } from '../breadcrumbs';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useRoute } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { reactive, ref } from 'vue';
import { useQuery } from '@pinia/colada';

vi.mock('vue-router', () => ({ useRoute: vi.fn() }));

vi.mock('@pinia/colada', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pinia/colada')>();
  return { ...actual, useQuery: vi.fn() };
});

describe('useBreadcrumbs', () => {
  const mockRoute = reactive({ name: '', params: {} as Record<string, string> });
  const weekData = ref<{ name: string } | null>(null);
  const recipeData = ref<{ name: string } | null>(null);

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(useRoute).mockReturnValue(mockRoute as any);
    vi.mocked(useQuery).mockImplementation((options: any) => {
      const opt = typeof options === 'function' ? options() : options;
      if (opt.key[0] === 'weeks' && opt.key[1] === 'detail') return { data: weekData } as any;
      if (opt.key[0] === 'recipes' && opt.key[1] === 'detail') return { data: recipeData } as any;
      return { data: ref(null) } as any;
    });
    mockRoute.name = '';
    mockRoute.params = {};
    weekData.value = null;
    recipeData.value = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty breadcrumbs for an unknown route', () => {
    mockRoute.name = 'UNKNOWN_ROUTE';
    expect(useBreadcrumbs().value).toEqual([]);
  });

  it('returns [My weeks] for the WEEKS route', () => {
    mockRoute.name = ROUTE_NAMES.WEEKS;
    expect(useBreadcrumbs().value).toEqual([{ label: 'My weeks' }]);
  });

  it('returns [My weeks → week name] for the WEEK route', () => {
    mockRoute.name = ROUTE_NAMES.WEEK;
    mockRoute.params = { id: 'week-1' };
    weekData.value = { name: 'Week Name' };
    expect(useBreadcrumbs().value).toEqual([
      { to: { name: ROUTE_NAMES.WEEKS }, label: 'My weeks' },
      { label: 'Week Name' },
    ]);
  });

  it('uses an empty label for the WEEK route when the week name has not loaded', () => {
    mockRoute.name = ROUTE_NAMES.WEEK;
    mockRoute.params = { id: 'week-1' };
    expect(useBreadcrumbs().value[1].label).toBe('');
  });

  it('returns [Recipes] for the RECIPES route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPES;
    expect(useBreadcrumbs().value).toEqual([{ label: 'Recipes' }]);
  });

  it('returns [Recipes → recipe name] for the RECIPE route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPE;
    mockRoute.params = { id: 'recipe-1' };
    recipeData.value = { name: 'Recipe Name' };
    expect(useBreadcrumbs().value).toEqual([
      { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes' },
      { label: 'Recipe Name' },
    ]);
  });

  it('uses an empty label for the RECIPE route when the recipe name has not loaded', () => {
    mockRoute.name = ROUTE_NAMES.RECIPE;
    mockRoute.params = { id: 'recipe-1' };
    expect(useBreadcrumbs().value[1].label).toBe('');
  });

  it('returns [Recipes → My recipes] for the RECIPES_MY route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPES_MY;
    expect(useBreadcrumbs().value).toEqual([{ label: 'My recipes' }]);
  });

  it('returns [Recipes → My recipes → Create] for the RECIPES_CREATE route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPES_CREATE;
    expect(useBreadcrumbs().value).toEqual([
      { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes' },
      { label: 'Create' },
    ]);
  });

  it('returns [Recipes → My recipes → recipe name → Edit] for the RECIPE_EDIT route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPE_EDIT;
    mockRoute.params = { id: 'recipe-1' };
    recipeData.value = { id: 'recipe-1', name: 'Recipe Name' } as any;
    expect(useBreadcrumbs().value).toEqual([
      { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes' },
      { to: { name: ROUTE_NAMES.RECIPE, params: { id: 'recipe-1' } }, label: 'Recipe Name' },
      { label: 'Edit' },
    ]);
  });

  it('returns [Recipes → Favorites] for the RECIPES_FAVORITES route', () => {
    mockRoute.name = ROUTE_NAMES.RECIPES_FAVORITES;
    expect(useBreadcrumbs().value).toEqual([
      { to: { name: ROUTE_NAMES.RECIPES }, label: 'Recipes' },
      { label: 'Favorites' },
    ]);
  });

  it('returns [Profile] for the PROFILE route', () => {
    mockRoute.name = ROUTE_NAMES.PROFILE;
    expect(useBreadcrumbs().value).toEqual([{ label: 'Profile' }]);
  });
});
