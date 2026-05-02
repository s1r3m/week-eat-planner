import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotAssignRecipeDialog from '../MealSlotAssignRecipeDialog.vue';
import { useQuery, useMutation } from '@pinia/colada';
import i18n from '@/i18n';
import { ref, nextTick } from 'vue';
import type { MealSlot } from '@/api/weeks';
import type { RecipePreview } from '@/api/recipes';
import RecipeSelectCard from '@/features/recipe/components/RecipeSelectCard.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';

vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  defineQueryOptions: (fn: any) => fn,
  defineMutation: (fn: any) => fn,
}));

vi.mock('@/api/recipes', () => ({
  getFavoritesQuery: vi.fn(() => ({ key: ['recipes', 'favorites'] })),
  getMyRecipesQuery: vi.fn(() => ({ key: ['recipes', 'mine'] })),
  toggleFavoriteMutation: vi.fn(),
}));

vi.mock('@/api/mealSlots', () => ({
  assignRecipeMutation: vi.fn(),
}));

describe('MealSlotAssignRecipeDialog', () => {
  const mockMutate = vi.fn();
  const weekId = 'week-1';
  const mockRecipe: RecipePreview = {
    id: 'recipe-1',
    name: 'Favorite Recipe',
    author: 'Author',
    is_favorite: true,
    image_url: null,
  };
  const mealSlotData: MealSlot = {
    id: 'slot-1',
    meal_type: 'LUNCH',
    day_of_week: 'MONDAY',
    recipe: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuery).mockImplementation((optionsFn: any) => {
      optionsFn();
      return {
        data: ref([mockRecipe]),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      };
    });
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate } as any);
  });

  const globalMountOptions = {
    plugins: [i18n],
    stubs: {
      Dialog: { name: 'Dialog', template: '<div><slot /></div>' },
      DialogContent: { template: '<div><slot /></div>' },
      DialogHeader: { template: '<div><slot /></div>' },
      DialogTitle: { template: '<div><slot /></div>' },
      DialogDescription: { template: '<div><slot /></div>' },
      DialogFooter: { template: '<div><slot /></div>' },
      DialogClose: { template: '<div><slot /></div>' },
      Tabs: { template: '<div><slot /></div>' },
      TabsList: { template: '<div><slot /></div>' },
      TabsTrigger: { template: '<div><slot /></div>' },
      TabsContent: { template: '<div><slot /></div>' },
      RecipeSelectCard: {
        template:
          '<div class="recipe-card" @click="$emit(\'select\', recipe)">{{ recipe.name }}</div>',
        props: ['recipe', 'isSelected'],
      },
    },
  };

  it('renders the dialog when mealSlot is provided', () => {
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: {
        modelValue: mealSlotData,
        'onUpdate:modelValue': (val: any) => wrapper.setProps({ modelValue: val }),
        weekId,
      } as any,
      global: globalMountOptions,
    });

    expect(wrapper.text()).toContain('Assign a recipe to');
  });

  it('sets enabled to false when mealSlot is null', () => {
    mount(MealSlotAssignRecipeDialog, {
      props: { modelValue: null, weekId } as any,
      global: globalMountOptions,
    });

    const calls = vi.mocked(useQuery).mock.calls;
    expect(calls[0][0]().enabled).toBe(false);
    expect(calls[1][0]().enabled).toBe(false);
  });

  it('sets enabled to true when mealSlot is provided', () => {
    mount(MealSlotAssignRecipeDialog, {
      props: { modelValue: mealSlotData, weekId } as any,
      global: globalMountOptions,
    });

    const calls = vi.mocked(useQuery).mock.calls;
    expect(calls[0][0]().enabled).toBe(true);
    expect(calls[1][0]().enabled).toBe(true);
  });

  it('initializes selectedRecipe from mealSlot.recipe', async () => {
    const mealSlotWithRecipe: MealSlot = { ...mealSlotData, recipe: mockRecipe };
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: { modelValue: mealSlotWithRecipe, weekId } as any,
      global: globalMountOptions,
    });

    await nextTick();
    const cards = wrapper.findAllComponents(RecipeSelectCard);
    const selectedCard = cards.find((c) => c.props('isSelected') === true);
    expect(selectedCard).toBeDefined();
    expect(selectedCard?.props('recipe').id).toBe(mockRecipe.id);
  });

  it('updates selectedRecipe when a card is clicked', async () => {
    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: { modelValue: mealSlotData, weekId } as any,
      global: globalMountOptions,
    });

    await nextTick();
    const card = wrapper.findComponent(RecipeSelectCard);
    await card.trigger('click');

    expect(card.props('isSelected')).toBe(true);
  });

  it('renders recipes from both favorites and my-recipes tabs', async () => {
    const favoriteRecipe: RecipePreview = { ...mockRecipe, id: 'fav-1', name: 'Favorite Recipe' };
    const myRecipe: RecipePreview = { ...mockRecipe, id: 'my-1', name: 'My Recipe' };

    vi.mocked(useQuery).mockImplementation((optionsFn: any) => {
      const options = optionsFn();
      const isFavorites = options.key?.includes('favorites');
      return {
        data: ref(isFavorites ? [favoriteRecipe] : [myRecipe]),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      };
    });

    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: { modelValue: mealSlotData, weekId } as any,
      global: globalMountOptions,
    });

    await nextTick();
    const cards = wrapper.findAllComponents(RecipeSelectCard);
    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(wrapper.text()).toContain('Favorite Recipe');
    expect(wrapper.text()).toContain('My Recipe');

    await cards[1].trigger('click');
    expect(cards[1].props('isSelected')).toBe(true);
  });

  it('renders loading state when recipes are loading', () => {
    vi.mocked(useQuery).mockImplementation(() => ({
      data: ref(null),
      isLoading: ref(true),
      error: ref(null),
      refetch: vi.fn(),
    }));

    const wrapper = mount(MealSlotAssignRecipeDialog, {
      props: { modelValue: mealSlotData, weekId } as any,
      global: globalMountOptions,
    });

    expect(wrapper.findAllComponents(TheLoadingPageState).length).toBeGreaterThanOrEqual(1);
  });

  describe('error states', () => {
    it('renders error card and calls favorites refetch on retry', async () => {
      const favRefetch = vi.fn();
      const myRecipesRefetch = vi.fn();
      vi.mocked(useQuery).mockImplementation((optionsFn: any) => {
        const options = optionsFn();
        const isFavorites = options.key?.includes('favorites');
        return {
          data: ref(null),
          isLoading: ref(false),
          error: ref(isFavorites ? new Error('Fav error') : null),
          refetch: isFavorites ? favRefetch : myRecipesRefetch,
        };
      });

      const wrapper = mount(MealSlotAssignRecipeDialog, {
        props: { modelValue: mealSlotData, weekId } as any,
        global: globalMountOptions,
      });

      await nextTick();
      await wrapper.find('button').trigger('click');
      expect(favRefetch).toHaveBeenCalled();
      expect(myRecipesRefetch).not.toHaveBeenCalled();
    });

    it('renders error card and calls my-recipes refetch on retry', async () => {
      const favRefetch = vi.fn();
      const myRecipesRefetch = vi.fn();
      vi.mocked(useQuery).mockImplementation((optionsFn: any) => {
        const options = optionsFn();
        const isMyRecipes = options.key?.includes('mine');
        return {
          data: ref(null),
          isLoading: ref(false),
          error: ref(isMyRecipes ? new Error('MyRecipes error') : null),
          refetch: isMyRecipes ? myRecipesRefetch : favRefetch,
        };
      });

      const wrapper = mount(MealSlotAssignRecipeDialog, {
        props: { modelValue: mealSlotData, weekId } as any,
        global: globalMountOptions,
      });

      await nextTick();
      await wrapper.find('button').trigger('click');
      expect(myRecipesRefetch).toHaveBeenCalled();
      expect(favRefetch).not.toHaveBeenCalled();
    });
  });

  describe('assign button', () => {
    it('is disabled when no recipe is selected', async () => {
      const wrapper = mount(MealSlotAssignRecipeDialog, {
        props: { modelValue: mealSlotData, weekId } as any,
        global: globalMountOptions,
      });

      await nextTick();
      const assignBtn = wrapper
        .findAll('[data-slot="button"]')
        .find((b) => b.text().includes('Assign'));
      expect(assignBtn?.attributes('disabled')).toBeDefined();
    });

    it('is disabled when the selected recipe is already assigned to the slot', async () => {
      const mealSlotWithRecipe: MealSlot = { ...mealSlotData, recipe: mockRecipe };
      const wrapper = mount(MealSlotAssignRecipeDialog, {
        props: { modelValue: mealSlotWithRecipe, weekId } as any,
        global: globalMountOptions,
      });

      await nextTick();
      const assignBtn = wrapper
        .findAll('[data-slot="button"]')
        .find((b) => b.text().includes('Assign'));
      expect(assignBtn?.attributes('disabled')).toBeDefined();
    });

    it('calls assign mutation with slot and recipe when clicked', async () => {
      const wrapper = mount(MealSlotAssignRecipeDialog, {
        props: { modelValue: mealSlotData, weekId } as any,
        global: globalMountOptions,
      });

      await nextTick();
      const card = wrapper.findComponent(RecipeSelectCard);
      await card.trigger('click');

      const assignBtn = wrapper
        .findAll('[data-slot="button"]')
        .find((b) => b.text().includes('Assign'));
      await assignBtn?.trigger('click');

      expect(mockMutate).toHaveBeenCalledWith({
        weekId,
        slots: [{ slot_id: mealSlotData.id, recipe: mockRecipe }],
      });
    });
  });

  describe('onAssign guard', () => {
    it('does not call assign mutation when mealSlot becomes null before assign', async () => {
      const wrapper = mount(MealSlotAssignRecipeDialog, {
        props: { modelValue: mealSlotData, weekId } as any,
        global: globalMountOptions,
      });

      await nextTick();
      const card = wrapper.findComponent(RecipeSelectCard);
      await card.trigger('click');

      await wrapper.setProps({ modelValue: null });
      await nextTick();

      expect(typeof (wrapper.vm as any).onAssign).toBe('function');
      (wrapper.vm as any).onAssign();

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('dialog open/close', () => {
    it('emits update:modelValue with null when dialog closes', async () => {
      const wrapper = mount(MealSlotAssignRecipeDialog, {
        props: {
          modelValue: mealSlotData,
          'onUpdate:modelValue': (val: any) => wrapper.setProps({ modelValue: val }),
          weekId,
        } as any,
        global: globalMountOptions,
      });

      const dialog = wrapper.findComponent({ name: 'Dialog' });
      await dialog.vm.$emit('update:open', false);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
    });

    it('does not emit when dialog open event fires with true', async () => {
      const wrapper = mount(MealSlotAssignRecipeDialog, {
        props: { modelValue: mealSlotData, weekId } as any,
        global: globalMountOptions,
      });

      const dialog = wrapper.findComponent({ name: 'Dialog' });
      await dialog.vm.$emit('update:open', true);

      expect(wrapper.emitted()).toEqual({});
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });
});
